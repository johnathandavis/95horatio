import * as cdk from '@aws-cdk/core';
import * as elb from '@aws-cdk/aws-elasticloadbalancingv2';
import * as r53 from '@aws-cdk/aws-route53';
import * as r53targets from '@aws-cdk/aws-route53-targets';
import * as apig from '@aws-cdk/aws-apigateway';
import * as certs from '@aws-cdk/aws-certificatemanager';
import * as discovery from '@aws-cdk/aws-servicediscovery';
import { IJohnDavisAccount } from '../account';
import { IStorage } from '../storage/storage-stack';
import { JDAuth } from '../auth/JDAuth';
import { WebsocketApi } from './websocket-api';

interface BotApiProps {
  account: IJohnDavisAccount,
  publicZone: r53.IPublicHostedZone,
  nlb: elb.INetworkLoadBalancer,
  storage: IStorage,
  auth: JDAuth,
  discoveryService: discovery.IService
}

export class BotApi extends cdk.Construct {

  constructor(scope: cdk.Construct, id: string, props: BotApiProps) {
    super(scope, id);

    const vpcLink = new apig.VpcLink(this, 'VpcLink', {
    });
    vpcLink.addTargets(props.nlb);

    const api = new apig.RestApi(this, 'RestApi', {
      defaultCorsPreflightOptions: {
        allowOrigins: ['https://95horatio.johndavis.dev'],
        allowCredentials: true,
        allowHeaders: [
          'Authorization', 'Content-Type',
          'x-amz-date','x-amz-security-token',
          'Referer'],
        allowMethods: apig.Cors.ALL_METHODS
      },
      deployOptions: {
        loggingLevel: apig.MethodLoggingLevel.INFO,
        dataTraceEnabled: true
      },
    });
      
    const user = api.root.addResource('user');
    const whoAmI = user.addResource('whoami');
    whoAmI.addMethod('GET', new apig.HttpIntegration(`http://${props.nlb.loadBalancerDnsName}/user/whoami`, {
      options: {
        connectionType: apig.ConnectionType.VPC_LINK,
        vpcLink: vpcLink,
        requestParameters: {
          'integration.request.header.Authorization': 'context.identity.cognitoAuthenticationProvider'
        },
        integrationResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Headers': `'Authorization,Content-Type,x-amz-date,x-amz-security-token,Referer'`,
              'method.response.header.Access-Control-Allow-Origin': `'*'`,
              'method.response.header.Access-Control-Allow-Credentials': `'true'`,
              'method.response.header.Access-Control-Allow-Methods': `'POST,GET,HEAD,OPTIONS,PATCH,PUT'`,
            }
          }
        ],
      },
      httpMethod: 'GET',
    }), {
      authorizationType: apig.AuthorizationType.IAM,
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Headers': true,
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true,
            'method.response.header.Access-Control-Allow-Methods': true,
          }
        }
      ],
    });

    const kudos = api.root.addResource('kudos');
    const sentKudos = kudos.addResource('sent');
    sentKudos.addMethod('GET', new apig.HttpIntegration(`http://${props.nlb.loadBalancerDnsName}/kudos/sent`, {
      options: {
        connectionType: apig.ConnectionType.VPC_LINK,
        vpcLink: vpcLink,
        requestParameters: {
          'integration.request.header.Authorization': 'context.identity.cognitoAuthenticationProvider'
        },
        integrationResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Headers': `'Authorization,Content-Type,x-amz-date,x-amz-security-token,Referer'`,
              'method.response.header.Access-Control-Allow-Origin': `'*'`,
              'method.response.header.Access-Control-Allow-Credentials': `'true'`,
              'method.response.header.Access-Control-Allow-Methods': `'POST,GET,HEAD,OPTIONS,PATCH,PUT'`,
            }
          }
        ],
      },
      httpMethod: 'GET',
    }), {
      authorizationType: apig.AuthorizationType.IAM,
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Headers': true,
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true,
            'method.response.header.Access-Control-Allow-Methods': true,
          }
        }
      ],
    });

    const receivedKudos = kudos.addResource('received');
    receivedKudos.addMethod('GET', new apig.HttpIntegration(`http://${props.nlb.loadBalancerDnsName}/kudos/received`, {
      options: {
        connectionType: apig.ConnectionType.VPC_LINK,
        vpcLink: vpcLink,
        requestParameters: {
          'integration.request.header.Authorization': 'context.identity.cognitoAuthenticationProvider'
        },
        integrationResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Headers': `'Authorization,Content-Type,x-amz-date,x-amz-security-token,Referer'`,
              'method.response.header.Access-Control-Allow-Origin': `'*'`,
              'method.response.header.Access-Control-Allow-Credentials': `'true'`,
              'method.response.header.Access-Control-Allow-Methods': `'POST,GET,HEAD,OPTIONS,PATCH,PUT'`,
            }
          }
        ],
      },
      httpMethod: 'GET',
    }), {
      authorizationType: apig.AuthorizationType.IAM,
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Headers': true,
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true,
            'method.response.header.Access-Control-Allow-Methods': true,
          }
        }
      ],
    });

    const chatResource = api.root.addResource('chat');
    const chatSummaryResource = chatResource.addResource('summary');
    chatSummaryResource.addMethod('GET', new apig.HttpIntegration(`http://${props.nlb.loadBalancerDnsName}/chat/summary`, {
      options: {
        connectionType: apig.ConnectionType.VPC_LINK,
        vpcLink: vpcLink,
        requestParameters: {
          'integration.request.header.Authorization': 'context.identity.cognitoAuthenticationProvider'
        },
        integrationResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Headers': `'Authorization,Content-Type,x-amz-date,x-amz-security-token,Referer'`,
              'method.response.header.Access-Control-Allow-Origin': `'*'`,
              'method.response.header.Access-Control-Allow-Credentials': `'true'`,
              'method.response.header.Access-Control-Allow-Methods': `'POST,GET,HEAD,OPTIONS,PATCH,PUT'`,
            }
          }
        ],
      },
      httpMethod: 'GET',
    }), {
      authorizationType: apig.AuthorizationType.IAM,
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Headers': true,
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true,
            'method.response.header.Access-Control-Allow-Methods': true,
          }
        }
      ],
    });

    chatResource.addMethod('GET', new apig.HttpIntegration(`http://${props.nlb.loadBalancerDnsName}/chat`, {
      options: {
        connectionType: apig.ConnectionType.VPC_LINK,
        vpcLink: vpcLink,
        requestParameters: {
          'integration.request.header.Authorization': 'context.identity.cognitoAuthenticationProvider',
          'integration.request.querystring.paginationToken' : 'method.request.querystring.paginationToken',
          'integration.request.querystring.provider' : 'method.request.querystring.provider',
          'integration.request.querystring.order' : 'method.request.querystring.order'
        },
        integrationResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Headers': `'Authorization,Content-Type,x-amz-date,x-amz-security-token,Referer'`,
              'method.response.header.Access-Control-Allow-Origin': `'*'`,
              'method.response.header.Access-Control-Allow-Credentials': `'true'`,
              'method.response.header.Access-Control-Allow-Methods': `'POST,GET,HEAD,OPTIONS,PATCH,PUT'`
            }
          }
        ]
      },
      httpMethod: 'GET',
    }), {
      authorizationType: apig.AuthorizationType.IAM,
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Headers': true,
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true,
            'method.response.header.Access-Control-Allow-Methods': true,
          }
        }
      ],
      requestParameters: {
        'method.request.querystring.paginationToken': false,
        'method.request.querystring.provider': true,
        'method.request.querystring.order': false
      }
    });
    
    const apiCert = new certs.DnsValidatedCertificate(this, 'ApiCert', {
      hostedZone: props.publicZone,
      domainName: 'api.95horatio.johndavis.dev',
      subjectAlternativeNames: [
        'api-ws.95horatio.johndavis.dev'
      ]
    });

    const domain = api.addDomainName('Domain', {
      endpointType: apig.EndpointType.REGIONAL,
      domainName: 'api.95horatio.johndavis.dev',
      certificate: apiCert
    });


    new r53.ARecord(this, 'ApiARecord', {
      zone: props.publicZone,
      target: r53.RecordTarget.fromAlias(new r53targets.ApiGatewayDomain(domain)),
      recordName: 'api'
    });    

    new WebsocketApi(this, 'WebsocketApi', {
      ...props,
      vpcLink: vpcLink,
      apiCert: apiCert
    })
  }
}
