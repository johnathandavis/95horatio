import * as cdk from '@aws-cdk/core';
import * as certs from '@aws-cdk/aws-certificatemanager';
import { IJohnDavisAccount } from '../account';

import { Website } from './website';
import { ShimHostedZone } from '../ShimHostedZone';
import { JDAuth } from '../auth/JDAuth';

interface WebStackProps {
  account: IJohnDavisAccount,
  auth: JDAuth
}

export class WebStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: WebStackProps) {
    super(scope, id, {
      env: props.account.env
    });

    const publicZone = new ShimHostedZone(this, 'PublicZone', {
      hostedZoneId: props.account.hostedZoneId,
      zoneName: props.account.dnsName
    });
    const webCert = certs.Certificate.fromCertificateArn(this, 'WebsiteCert', props.account.certificateArn);
    new Website(this, 'Website', {
      publicZone: publicZone,
      websiteCertificate: webCert,
      domainName: props.account.dnsName,
    });

  }
}
