import * as cdk from '@aws-cdk/core';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as discovery from '@aws-cdk/aws-servicediscovery';
import { IJohnDavisAccount } from '../account';
import { Analytics, IAnalytics } from './analytics';

export interface IStorage {
  readonly userIdsTable : ddb.ITable;
  readonly kudosTable : ddb.ITable;
  readonly linkRequestsTable : ddb.ITable;
  readonly countersTable : ddb.ITable;
  readonly chatMessages : ddb.ITable;
  readonly paginationTokensTable : ddb.ITable;
  readonly sentimentSnapshotsTable : ddb.ITable;
  readonly socketSessionTable : ddb.ITable;
  readonly analytics : IAnalytics;
  readonly storageDiscoveryInstance : discovery.NonIpInstance;
}

interface StorageStackProps {
  account: IJohnDavisAccount,
  discoveryService: discovery.IService
}

export class StorageStack extends cdk.Stack implements IStorage {

  readonly userIdsTable : ddb.ITable;
  readonly kudosTable : ddb.ITable;
  readonly linkRequestsTable : ddb.ITable;
  readonly countersTable : ddb.ITable;
  readonly chatMessages : ddb.ITable;
  readonly paginationTokensTable : ddb.ITable;
  readonly sentimentSnapshotsTable : ddb.ITable;
  readonly socketSessionTable : ddb.ITable;
  readonly analytics : IAnalytics;
  readonly storageDiscoveryInstance : discovery.NonIpInstance;

  constructor(scope: cdk.Construct, id: string, props: StorageStackProps) {
    super(scope, id, {
      env: props.account.env
    });

    const userIdsTable = new ddb.Table(this, 'UserIds', {
      partitionKey: {
        type: ddb.AttributeType.STRING,
        name: 'cognitoId'
      },
      sortKey: {
        type: ddb.AttributeType.STRING,
        name: 'twitchUsername'
      },
      billingMode: ddb.BillingMode.PAY_PER_REQUEST
    });
    userIdsTable.addGlobalSecondaryIndex({
      indexName: 'twitch2cognito',
      partitionKey: {
        type: ddb.AttributeType.STRING,
        name: 'twitchUsername'
      },
      sortKey: {
        type: ddb.AttributeType.STRING,
        name: 'cognitoId'
      },
    });
    userIdsTable.addGlobalSecondaryIndex({
      indexName: 'sub2twitch',
      partitionKey: {
        type: ddb.AttributeType.STRING,
        name: 'sub'
      },
      sortKey: {
        type: ddb.AttributeType.STRING,
        name: 'twitch'
      },
    });
    userIdsTable.addGlobalSecondaryIndex({
      indexName: 'sub2cognito',
      partitionKey: {
        type: ddb.AttributeType.STRING,
        name: 'sub'
      },
      sortKey: {
        type: ddb.AttributeType.STRING,
        name: 'cognitoId'
      },
    });

    const linkRequestsTable = new ddb.Table(this, 'LinkRequestsTable', {
      partitionKey: {
        type: ddb.AttributeType.STRING,
        name: 'twitchUsername'
      },
      sortKey: {
        type: ddb.AttributeType.STRING,
        name: 'discordUsername'
      },
      billingMode: ddb.BillingMode.PAY_PER_REQUEST
    });
    linkRequestsTable.addGlobalSecondaryIndex({
      indexName: 'discord2twitchIndex',
      partitionKey: {
        type: ddb.AttributeType.STRING,
        name: 'discordUsername'
      },
      sortKey: {
        type: ddb.AttributeType.STRING,
        name: 'twitchUsername'
      },
    });

    const kudosTable = new ddb.Table(this, 'KudosStorageTable', {
      partitionKey: {
        type: ddb.AttributeType.STRING,
        name: 'requesterUsername'
      },
      sortKey: {
        type: ddb.AttributeType.STRING,
        name: 'timestamp'
      },
      billingMode: ddb.BillingMode.PAY_PER_REQUEST
    });
    kudosTable.addGlobalSecondaryIndex({
      indexName: 'recipientIndex',
      partitionKey: {
        type: ddb.AttributeType.STRING,
        name: 'recipientUsername'
      },
      sortKey: {
        type: ddb.AttributeType.STRING,
        name: 'timestamp'
      },
    });
    kudosTable.addGlobalSecondaryIndex({
      indexName: 'messageIdIndex',
      partitionKey: {
        type: ddb.AttributeType.STRING,
        name: 'discordMessageId'
      },
      sortKey: {
        type: ddb.AttributeType.STRING,
        name: 'timestamp'
      }
    });

    const countersTable = new ddb.Table(this, 'CountersTable', {
      partitionKey: {
        type: ddb.AttributeType.STRING,
        name: 'username'
      },
      sortKey: {
        type: ddb.AttributeType.STRING,
        name: 'timestamp'
      },
      billingMode: ddb.BillingMode.PAY_PER_REQUEST
    });

    const chatMessagesTable = new ddb.Table(this, 'ChatMessages', {
      partitionKey: {
        type: ddb.AttributeType.STRING,
        name: 'messageId'
      },
      billingMode: ddb.BillingMode.PAY_PER_REQUEST
    });
    chatMessagesTable.addGlobalSecondaryIndex({
      indexName: 'senderIndex',
      partitionKey: {
        type: ddb.AttributeType.STRING,
        name: 'senderUsername'
      },
      sortKey: {
        type: ddb.AttributeType.STRING,
        name: 'timestamp'
      },
    });

    const paginationTokensTable = new ddb.Table(this, 'PaginationTokensTable', {
      partitionKey: {
        type: ddb.AttributeType.STRING,
        name: 'token'
      },
      timeToLiveAttribute: 'expiration',
      billingMode: ddb.BillingMode.PAY_PER_REQUEST
    });

    const sentimentSnapshotsTable = new ddb.Table(this, 'SentimentSnapshots', {
      partitionKey: {
        type: ddb.AttributeType.STRING,
        name: 'cognitoId'
      },
      sortKey: {
        type: ddb.AttributeType.STRING,
        name: 'timestamp'
      },
      billingMode: ddb.BillingMode.PAY_PER_REQUEST
    });

    const socketSessionsTable = new ddb.Table(this, 'SocketSessionsTable', {
      partitionKey: {
        type: ddb.AttributeType.STRING,
        name: 'connectionId'
      },
      timeToLiveAttribute: 'expireTime',
      billingMode: ddb.BillingMode.PAY_PER_REQUEST
    });
    socketSessionsTable.addGlobalSecondaryIndex({
      indexName: 'userIndex',
      partitionKey: {
        type: ddb.AttributeType.STRING,
        name: 'connectedUser'
      }
    });


    const analytics = new Analytics(this, 'Analytics', {
      discoveryService: props.discoveryService
    });
    
    this.userIdsTable = userIdsTable;
    this.kudosTable = kudosTable;
    this.linkRequestsTable = linkRequestsTable;
    this.countersTable = countersTable;
    this.analytics = analytics;
    this.sentimentSnapshotsTable = sentimentSnapshotsTable;
    this.paginationTokensTable = paginationTokensTable;
    this.socketSessionTable = socketSessionsTable;
    this.chatMessages = chatMessagesTable;

    this.storageDiscoveryInstance = new discovery.NonIpInstance(this, 'TableDiscovery', {
      instanceId: 'storageTables',
      customAttributes: {
        'userids': userIdsTable.tableName,
        'linkrequests': linkRequestsTable.tableName,
        'kudos': kudosTable.tableName,
        'counters': countersTable.tableName,
        'chatmessages': chatMessagesTable.tableName,
        'sentimentsnapshots': sentimentSnapshotsTable.tableName,
        'paginationtokens': paginationTokensTable.tableName,
        'socketsessions': socketSessionsTable.tableName,
      },
      service: props.discoveryService
    });
  }
}
