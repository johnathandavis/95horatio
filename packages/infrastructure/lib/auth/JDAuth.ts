import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as cognito from '@aws-cdk/aws-cognito';
import * as sm from "@aws-cdk/aws-secretsmanager";
import * as certs from '@aws-cdk/aws-certificatemanager';
import * as r53 from '@aws-cdk/aws-route53';
import * as r53targets from '@aws-cdk/aws-route53-targets';

import { TwitchIdp } from './TwitchIdp';
import { ShimHostedZone } from '../ShimHostedZone';
import { Triggers } from './triggers';
import { IJohnDavisAccount } from '../account';
import { IStorage } from '../storage/storage-stack';

export interface JDAuthProps {
  account: IJohnDavisAccount,
  storage: IStorage
}

export class JDAuth extends cdk.Construct {

  readonly client : cognito.UserPoolClient;

  readonly horatioUsersRole: iam.Role;
  readonly horatioUsersPolicy: iam.ManagedPolicy;

  readonly adminPolicy: iam.ManagedPolicy;
  readonly adminRole: iam.Role;
  readonly adminGroup : cognito.CfnUserPoolGroup;
  
  readonly identityPool: cognito.CfnIdentityPool;
  readonly userPool: cognito.UserPool;

  constructor(scope: cdk.Construct, id: string, props: JDAuthProps) {
    super(scope, id);

    this.horatioUsersPolicy = new iam.ManagedPolicy(this, 'HoratioPolicy', {
    });
    this.adminPolicy = new iam.ManagedPolicy(this, 'FreePolicy', {
    });
    const policyStatement = new iam.PolicyStatement({
      actions: [
        'execute-api:Invoke',
      ],
      resources: ['*']
    });
    this.horatioUsersPolicy.addStatements(policyStatement);
    this.adminPolicy.addStatements(policyStatement);

    const snsPublishPolicyDoc = new iam.PolicyDocument();
    const snsPublishStatement = new iam.PolicyStatement();
    snsPublishStatement.addAllResources();
    snsPublishStatement.addActions('sns:Publish');
    snsPublishPolicyDoc.addStatements(snsPublishStatement);
    
    this.userPool = new cognito.UserPool(this, 'HoratioUserPool', {
      mfa: cognito.Mfa.OFF,
      mfaSecondFactor: {
        sms: false,
        otp: false
      },
      accountRecovery: cognito.AccountRecovery.NONE,
      autoVerify: {
        email: false,
        phone: false
      },
      customAttributes: {
        'twitch_username': new cognito.StringAttribute({
          mutable: true
        }),
        'discord_username': new cognito.StringAttribute({
          mutable: true
        })
      },
      selfSignUpEnabled: true
    });

    const secretValue = sm.Secret.fromSecretCompleteArn(this, "ImportedSecret", props.account.twitchAuthSecretArn);
    
    const clientId = secretValue.secretValueFromJson('clientId').toString();
    const clientSecret = secretValue.secretValueFromJson('clientSecret').toString();

    const twitchIdp = new TwitchIdp(this, 'Twitch', {
      clientId: clientId,
      clientSecret: clientSecret,
      scopes: ['openid', 'user:read:email'],
      userPool: this.userPool,
    });

    this.client = new cognito.UserPoolClient(this, 'WebsiteClient', {
        generateSecret: false,
        userPool: this.userPool,
        userPoolClientName: 'WebsiteClient',
        authFlows: {
          userPassword: true,
          adminUserPassword: true,
          userSrp: true
        },
        oAuth: {
          callbackUrls: [
            `https://${props.account.dnsName}`
          ],
          scopes: [
            cognito.OAuthScope.OPENID,
            cognito.OAuthScope.EMAIL,
            cognito.OAuthScope.PROFILE,
            cognito.OAuthScope.PHONE,
            cognito.OAuthScope.COGNITO_ADMIN
          ]
        }
    });
    

    this.userPool.registerIdentityProvider(twitchIdp);
    const identityPool = new cognito.CfnIdentityPool(this, 'WebsiteIdentityPool', {
        allowUnauthenticatedIdentities: false,
        cognitoIdentityProviders: [{
            clientId: this.client.userPoolClientId,
            providerName: this.userPool.userPoolProviderName,
            
        }],
        developerProviderName: 'Horatio'
    });

    const cognitoAuthenticatedPrincipal = new iam.FederatedPrincipal(
      'cognito-identity.amazonaws.com',
      {
        "StringEquals": {
          "cognito-identity.amazonaws.com:aud": identityPool.ref
        },
        "ForAnyValue:StringLike": {
          "cognito-identity.amazonaws.com:amr": "authenticated"
        },
      },
    "sts:AssumeRoleWithWebIdentity");

    this.horatioUsersRole = new iam.Role(this, 'HoratioBaseRole', {
        assumedBy: cognitoAuthenticatedPrincipal,
        managedPolicies: [
          this.horatioUsersPolicy
        ]
    });
    this.adminRole = new iam.Role(this, 'AdminRole', {
        assumedBy: cognitoAuthenticatedPrincipal,
        managedPolicies: [
          this.adminPolicy
        ]
    });
    const cognitoPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
          "cognito-sync:*",
          "cognito-identity:*"
      ],
      resources: ["*"],
    });
    this.horatioUsersRole.addToPolicy(cognitoPolicy);
    this.adminRole.addToPolicy(cognitoPolicy);

    new cognito.CfnIdentityPoolRoleAttachment(this, 'DefaultValid', {
      identityPoolId: identityPool.ref,
      roles: {
        'authenticated': this.horatioUsersRole.roleArn
      }
    });

    const authDomain = `userauth.${props.account.dnsName}`;
    const publicZone = new ShimHostedZone(this, 'PublicZone', {
      hostedZoneId: props.account.hostedZoneId,
      zoneName: props.account.dnsName
    });
    const authCert = new certs.DnsValidatedCertificate(this, 'WebsiteCert', {
      hostedZone: publicZone,
      domainName: authDomain,
      region: 'us-east-1'
    });

    const userPoolDomain = this.userPool.addDomain('AuthDomain', {
      customDomain: {
        domainName: authDomain,
        certificate: authCert
      }
    });

    this.adminGroup = new cognito.CfnUserPoolGroup(this, 'AdminUsersGroup', {
      groupName: 'AdminUsers',
      roleArn: this.adminRole.roleArn,
      userPoolId: this.userPool.userPoolId
    });

    new r53.ARecord(this, 'AuthDnsRecord', {
      target: r53.RecordTarget.fromAlias(new r53targets.UserPoolDomainTarget(userPoolDomain)),
      zone: publicZone,
      recordName: 'userauth'
    });

    new Triggers(this, 'Triggers', {
      storage: props.storage,
      userPool: this.userPool,
      groupName: this.adminGroup.groupName!
    });
    this.identityPool = identityPool;
  }
}