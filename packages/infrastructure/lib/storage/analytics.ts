import * as cdk from '@aws-cdk/core';
import * as athena from '@aws-cdk/aws-athena';
import * as iam from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';
import * as firehose from '@aws-cdk/aws-kinesisfirehose';
import * as events from '@aws-cdk/aws-events';
import * as kms from '@aws-cdk/aws-kms';
import * as event_targets from '@aws-cdk/aws-events-targets';
import * as sqs from '@aws-cdk/aws-sqs';
import * as discovery from '@aws-cdk/aws-servicediscovery';

interface AnalyticsProps {
  discoveryService: discovery.IService
}

export interface IAnalytics {
  readonly analyticsPolicy : iam.ManagedPolicy;
  readonly resultEncryptionKey : kms.IKey;
  readonly bucket : s3.Bucket;
  readonly reportQueue : sqs.IQueue;
  readonly deliveryStream : firehose.CfnDeliveryStream;
  readonly workgroup : athena.CfnWorkGroup;
}

export class Analytics extends cdk.Construct implements IAnalytics {

  readonly analyticsPolicy : iam.ManagedPolicy;
  readonly resultEncryptionKey : kms.IKey;
  readonly bucket : s3.Bucket;
  readonly reportQueue : sqs.IQueue;
  readonly deliveryStream : firehose.CfnDeliveryStream;
  readonly workgroup : athena.CfnWorkGroup;

  constructor(parent: cdk.Construct, name: string, props: AnalyticsProps) {
    super(parent, name);

    const encryptionKey = new kms.Key(this, 'EncryptionKey', {
      alias: 'sentiment-report-results'
    });

    const bucket = new s3.Bucket(this, 'Bucket', {
      bucketName: 'horatio-chat-logs'
    });
    const firehoseRole = new iam.Role(this, 'FirehoseRole', {
      assumedBy: new iam.ServicePrincipal('firehose.amazonaws.com')
    });
    bucket.grantReadWrite(firehoseRole);

    const deliveryStream = new firehose.CfnDeliveryStream(this, 'DeliveryStream', {
      s3DestinationConfiguration: {
        bucketArn: bucket.bucketArn,
        roleArn: firehoseRole.roleArn,
        prefix: 'data/year=!{timestamp:yyyy}/month=!{timestamp:MM}/day=!{timestamp:dd}/',
        errorOutputPrefix: 'errors/',
        bufferingHints: {
          intervalInSeconds: 300
        }
      },
    });

    const jobQueue = new sqs.Queue(this, 'Queue', {});
    const sentimentReportEvent = new events.Rule(this, 'Rule', {
      schedule: events.Schedule.rate(cdk.Duration.minutes(15))
    });
    sentimentReportEvent.addTarget(new event_targets.SqsQueue(jobQueue));

    this.resultEncryptionKey = encryptionKey;
    this.workgroup = new athena.CfnWorkGroup(this, 'Workgroup', {
      name: 'sentiment-reporting',
      description: 'sentiment analysis reporting',
      state: 'ENABLED',
      workGroupConfiguration: {
        enforceWorkGroupConfiguration: true,
        resultConfiguration: {
          encryptionConfiguration: {
            kmsKey: encryptionKey.keyArn,
            encryptionOption: 'SSE_KMS'
          },
          outputLocation: `s3://${bucket.bucketName}/results/`
        }
      }
    });

    this.bucket = bucket;
    this.reportQueue = jobQueue;
    this.deliveryStream = deliveryStream;
    this.analyticsPolicy = new iam.ManagedPolicy(this, 'AnalyticsPolicy', {
      managedPolicyName: 'HoratioAnalyticsPermissions'
    });
    
    this.analyticsPolicy.addStatements(new iam.PolicyStatement({
      resources: ['*'],
      actions: [
        "athena:ListEngineVersions",
        "athena:ListWorkGroups",
        "athena:GetExecutionEngine",
        "athena:GetExecutionEngines",
        "athena:GetNamespace",
        "athena:GetCatalogs",
        "athena:GetNamespaces",
        "athena:GetTables",
        "athena:GetTable"
      ]
    }),new iam.PolicyStatement({
      resources: ['*'],
      actions: [
        "glue:GetTable",
        "glue:GetPartitions"
      ]
    }),new iam.PolicyStatement({
      resources: [`arn:aws:athena:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:workgroup/${this.workgroup.ref}`],
      actions: [
        "athena:StartQueryExecution",
        "athena:GetQueryResults",
        "athena:DeleteNamedQuery",
        "athena:GetNamedQuery",
        "athena:ListQueryExecutions",
        "athena:StopQueryExecution",
        "athena:GetQueryResultsStream",
        "athena:ListNamedQueries",
        "athena:CreateNamedQuery",
        "athena:GetQueryExecution",
        "athena:BatchGetNamedQuery",
      ]
    }),new iam.PolicyStatement({
      resources: [this.reportQueue.queueArn],
      actions: [
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage",
      ]
    }),new iam.PolicyStatement({
      resources: [this.resultEncryptionKey.keyArn],
      actions: [
        "kms:*"
      ]
    }),new iam.PolicyStatement({
      resources: ['*'],
      actions: [
        "kms:GenerateRandom"
      ]
    }),new iam.PolicyStatement({
      resources: [
        bucket.bucketArn,
        `${bucket.bucketArn}/*`
      ],
      actions: [
        "s3:*"
      ]
    }));

    new discovery.NonIpInstance(this, 'AnalyticvsDiscovery', {
      instanceId: 'analytics',
      customAttributes: {
        'sentimentbucket': this.bucket.bucketName,
        'sentimentencryptionkeyarn': this.resultEncryptionKey.keyArn,
        'sentimentreportqueue': this.reportQueue.queueUrl,
        'sentimentreportworkgroup': this.workgroup.ref,
        'chatstream': this.deliveryStream.ref
      },
      service: props.discoveryService
    });
  }
}