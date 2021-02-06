import * as cdk from '@aws-cdk/core';
import * as discovery from '@aws-cdk/aws-servicediscovery';
import { IJohnDavisAccount } from '../account';
import { IStorage } from '../storage/storage-stack';

import { JDAuth } from './JDAuth';

interface AuthStackProps {
  account: IJohnDavisAccount,
  storage: IStorage,
  discoveryService: discovery.IService
}

export class AuthStack extends cdk.Stack {

  readonly auth : JDAuth;
  readonly discoveryInstance : discovery.NonIpInstance;

  constructor(scope: cdk.Construct, id: string, props: AuthStackProps) {
    super(scope, id, {
      env: props.account.env
    });

    this.auth = new JDAuth(this, 'Auth', {
      storage: props.storage,
      account: props.account
    });


    this.discoveryInstance = new discovery.NonIpInstance(this, 'AuthDiscovery', {
      instanceId: 'auth',
      customAttributes: {
        'userpoolid': this.auth.userPool.userPoolId
      },
      service: props.discoveryService
    });
  }
}
