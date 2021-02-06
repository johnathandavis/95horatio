import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as discovery from '@aws-cdk/aws-servicediscovery';
import { IJohnDavisAccount } from '../account';

export class CoreStack extends cdk.Stack {

  readonly vpc : ec2.IVpc;
  readonly discoveryNamespace : discovery.IHttpNamespace;
  readonly discoveryService : discovery.IService;

  constructor(scope: cdk.Construct, id: string, account: IJohnDavisAccount) {
    super(scope, id, {
      env: account.env
    });

    this.vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2
    });
    this.discoveryNamespace = new discovery.HttpNamespace(this, 'Discovery', {
      name: '95horatio.johndavis.dev',
      description: 'Service discovery resources for 95horatio'
    });
    this.discoveryService = new discovery.Service(this, 'Service', {
      namespace: this.discoveryNamespace,
      name: 'horatio'
    });
  }
}
