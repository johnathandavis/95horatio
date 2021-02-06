import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from '@aws-cdk/aws-iam';
import * as cognito from '@aws-cdk/aws-cognito';
import * as path from 'path';
import { IStorage } from '../storage/storage-stack';

const codePath = path.resolve(__dirname, './signup');

export interface TriggersProps {
  userPool: cognito.UserPool,
  storage: IStorage,
  groupName: string
}

export class Triggers extends cdk.Construct {

  readonly lambdaFunction: lambda.IFunction;

  constructor(scope: cdk.Construct, id: string, props: TriggersProps) {
    super(scope, id);

    const lambdaRole = new iam.Role(this, 'PostConfirmRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    });
    this.lambdaFunction = new lambda.Function(this, 'PostConfirmLambda', {
      runtime: lambda.Runtime.PYTHON_3_8, // So we can use async in widget.js
      code: lambda.Code.fromAsset(codePath),
      handler: "index.handle",
      memorySize: 256,
      environment: {
        'ID_MAPPING_TABLE': props.storage.userIdsTable.tableName,
        'GROUP_NAME': props.groupName
      },
      role: lambdaRole,
      timeout: cdk.Duration.seconds(15)
    });
    lambdaRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'));

    /*
    lambdaRole.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: [ 'cognito-idp:AdminAddUserToGroup' ],
      resources: [ props.userPool.userPoolArn ]
    }));
    */
    lambdaRole.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: [ 'cognito-idp:AdminAddUserToGroup' ],
      resources: [ '*' ]
    }));
    props.storage.userIdsTable.grantFullAccess(lambdaRole);

    props.userPool.addTrigger(cognito.UserPoolOperation.POST_CONFIRMATION, this.lambdaFunction);
  }
}