import * as cdk from '@aws-cdk/core';
import * as r53 from '@aws-cdk/aws-route53';

interface ShimHostedZoneProps {
  hostedZoneId: string,
  zoneName: string
}

export class ShimHostedZone implements r53.IPublicHostedZone {

  private readonly pubHostedZone : r53.IPublicHostedZone;
  private readonly props : ShimHostedZoneProps;

  constructor(scope: cdk.Construct, name: string, props: ShimHostedZoneProps) {
    this.props = props;
    this.pubHostedZone = r53.PublicHostedZone.fromHostedZoneId(scope, name, props.hostedZoneId);
  }
  
  get stack() : cdk.Stack {
    return this.pubHostedZone.stack;
  }

  get env() : cdk.ResourceEnvironment {
    return this.pubHostedZone.env;
  }

  get node() : cdk.ConstructNode {
    return this.pubHostedZone.node;
  }

  get zoneName() : string {
    return this.props.zoneName;
  }

  get hostedZoneId() : string {
    return this.props.hostedZoneId;
  }

  get hostedZoneArn() : string {
    throw new Error(`ShimHostedZone does not support hostedZoneArn.`)
  }
  
  get hostedZoneNameServers() : string[] {
    throw new Error(`ShimHostedZone does not support hostedZoneNameServers.`)
  }
}
