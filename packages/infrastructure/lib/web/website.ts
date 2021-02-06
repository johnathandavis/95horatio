import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';
import * as r53 from '@aws-cdk/aws-route53';
import * as r53_targets from '@aws-cdk/aws-route53-targets';
import * as certs from '@aws-cdk/aws-certificatemanager';
import * as s3_deploy from '@aws-cdk/aws-s3-deployment';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as path from 'path';

const websitePath = path.resolve(path.join(__dirname, '../../../website/build'))

interface WebsiteProps {
  domainName: string,
  websiteCertificate: certs.ICertificate,
  publicZone: r53.IPublicHostedZone
}

export class Website extends cdk.Construct {

  constructor(parent: cdk.Construct, name: string, props: WebsiteProps) {
    super(parent, name);

    const cfId = new cloudfront.OriginAccessIdentity(this, 'OriginAccessId');

    const websiteBucket = new s3.Bucket(this, 'Bucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL
    });

    const policyStatement = new iam.PolicyStatement();
    policyStatement.addActions('s3:GetBucket*');
    policyStatement.addActions('s3:GetObject*');
    policyStatement.addActions('s3:List*');
    policyStatement.addResources(websiteBucket.bucketArn);
    policyStatement.addResources(`${websiteBucket.bucketArn}/*`);
    policyStatement.addCanonicalUserPrincipal(cfId.cloudFrontOriginAccessIdentityS3CanonicalUserId);
    websiteBucket.addToResourcePolicy(policyStatement);

    const distributon = new cloudfront.CloudFrontWebDistribution(this, 'Distribution', {
      viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(props.websiteCertificate, {
        aliases: [
          props.domainName
        ],
      }),
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: websiteBucket,
            originAccessIdentity: cfId,
          },
          behaviors: [
            {
              isDefaultBehavior: true
            }
          ]
        }
      ]
    });

    new s3_deploy.BucketDeployment(this, 'Deployment', {
      destinationBucket: websiteBucket,
      sources: [
        s3_deploy.Source.asset(websitePath)
      ],
      distributionPaths: [
        '/*'
      ],
      distribution: distributon
    }); 

    new r53.ARecord(this, 'ARecord', {
      zone: props.publicZone,
      target: r53.RecordTarget.fromAlias(new r53_targets.CloudFrontTarget(distributon))
    });

    new r53.AaaaRecord(this, 'AaaaRecord', {
      zone: props.publicZone,
      target: r53.RecordTarget.fromAlias(new r53_targets.CloudFrontTarget(distributon))
    });
  }
}