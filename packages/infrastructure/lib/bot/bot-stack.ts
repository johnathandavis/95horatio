import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecr from '@aws-cdk/aws-ecr';
import * as ecs from '@aws-cdk/aws-ecs';
import * as iam from '@aws-cdk/aws-iam';
import * as logs from '@aws-cdk/aws-logs';
import * as discovery from '@aws-cdk/aws-servicediscovery';
import * as patterns from '@aws-cdk/aws-ecs-patterns';
import { IJohnDavisAccount } from '../account';
import { ShimHostedZone } from '../ShimHostedZone';
import { IStorage } from '../storage/storage-stack';

import { BotApi } from './bot-api';
import { JDAuth } from '../auth/JDAuth';

interface BotStackProps {
  account: IJohnDavisAccount,
  vpc: ec2.IVpc,
  storage: IStorage,
  discoveryService: discovery.IService,
  auth: JDAuth
}

export class BotStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: BotStackProps) {
    super(scope, id, {
      env: props.account.env
    });

    const logGroup = new logs.LogGroup(this, 'Logs', {
      logGroupName: 'HoratioBot'
    });

    const ecrRepo = new ecr.Repository(this, 'Repo', {
      repositoryName: 'horatio-bot'
    });

    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: props.vpc
    });

    const publicZone = new ShimHostedZone(this, 'PublicZone', {
      hostedZoneId: props.account.hostedZoneId,
      zoneName: props.account.dnsName
    });

    const bot = new patterns.NetworkLoadBalancedFargateService(this, 'Service', {
      cluster: cluster,
      domainName: `api.${props.account.dnsName}`,
      healthCheckGracePeriod: cdk.Duration.seconds(30),
      domainZone: publicZone,
      listenerPort: 80,
      publicLoadBalancer: false,
      minHealthyPercent: 100,
      maxHealthyPercent: 200,
      cpu: 512,
      memoryLimitMiB: 1024,
      taskImageOptions: {
          containerPort: 80,
          image: ecs.ContainerImage.fromEcrRepository(ecrRepo),
          logDriver: ecs.LogDriver.awsLogs({
              logGroup: logGroup,
              streamPrefix: 'bot',
          }),
          environment: {
            'SERVICE_DISCOVERY_ID': props.discoveryService.serviceId
          }
      }
    });
    bot.taskDefinition.defaultContainer?.environmentFiles
    bot.service.connections.allowFromAnyIpv4(ec2.Port.tcp(80));
    bot.taskDefinition.taskRole?.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: [
        'cloudwatch:PutMetricData'
      ],
      resources: ['*']
    }));
    bot.taskDefinition.taskRole?.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: [
        'secretsmanager:GetSecretValue'
      ],
      resources: [
        'arn:aws:secretsmanager:us-east-2:427808209930:secret:prod/web/TwitchAuth-gd8I2K',
        'arn:aws:secretsmanager:us-east-2:427808209930:secret:prod/web/Discord-1VZXhH',
        'arn:aws:secretsmanager:us-east-2:427808209930:secret:prod/web/Twitch-IdWs9V'
      ]
    }));
    bot.taskDefinition.taskRole?.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: [
        'comprehend:DetectSentiment',
        'comprehend:DetectDominantLanguage'
      ],
      resources: [ '*' ]
    }));
    bot.taskDefinition.taskRole?.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: [
        'firehose:PutRecord',
        'firehose:PutRecords'
      ],
      resources: [ cdk.Token.asString(props.storage.analytics.deliveryStream.getAtt('Arn')) ]
    }));
    bot.taskDefinition.taskRole?.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: [
        'servicediscovery:GetInstance'
      ],
      resources: [ '*' ]
    }));
    bot.taskDefinition.taskRole?.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: [
        'cognito-idp:AdminUpdateUserAttributes',
        'cognito-idp:AdminGetUser'
      ],
      resources: [ props.auth.userPool.userPoolArn ]
    }));
    props.storage.kudosTable.grantFullAccess(bot.taskDefinition.taskRole!);
    props.storage.linkRequestsTable.grantFullAccess(bot.taskDefinition.taskRole!);
    props.storage.userIdsTable.grantFullAccess(bot.taskDefinition.taskRole!);
    props.storage.sentimentSnapshotsTable.grantFullAccess(bot.taskDefinition.taskRole!);
    props.storage.chatMessages.grantFullAccess(bot.taskDefinition.taskRole!);
    props.storage.paginationTokensTable.grantFullAccess(bot.taskDefinition.taskRole!);
    props.storage.socketSessionTable.grantFullAccess(bot.taskDefinition.taskRole!);
    bot.taskDefinition.taskRole?.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: [
        'cognito-idp:AdminUpdateUserAttributes',
        'cognito-idp:AdminGetUser'
      ],
      resources: [ props.auth.userPool.userPoolArn ]
    }));
    bot.taskDefinition.taskRole?.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: [
        'execute-api:ManageConnections'
      ],
      resources: [ '*' ]
    }));
    props.storage.analytics.reportQueue.grantConsumeMessages(bot.taskDefinition.taskRole!);
    bot.taskDefinition.taskRole.addManagedPolicy(props.storage.analytics.analyticsPolicy);

    new BotApi(this, 'Api', {
      account: props.account,
      publicZone: publicZone,
      storage: props.storage,
      nlb: bot.loadBalancer,
      auth: props.auth,
      discoveryService: props.discoveryService
    });
  }
}
