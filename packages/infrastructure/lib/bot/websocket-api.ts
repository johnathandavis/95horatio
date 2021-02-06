import * as cdk from '@aws-cdk/core';
import * as elb from '@aws-cdk/aws-elasticloadbalancingv2';
import * as r53 from '@aws-cdk/aws-route53';
import * as r53targets from '@aws-cdk/aws-route53-targets';
import * as apig from '@aws-cdk/aws-apigateway';
import * as apigv2 from '@aws-cdk/aws-apigatewayv2';
import * as certs from '@aws-cdk/aws-certificatemanager';
import * as discovery from '@aws-cdk/aws-servicediscovery';
import { IJohnDavisAccount } from '../account';
import { connect } from 'http2';

interface WebsocketApiProps {
  account: IJohnDavisAccount,
  publicZone: r53.IPublicHostedZone,
  nlb: elb.INetworkLoadBalancer,
  discoveryService: discovery.IService,
  vpcLink: apig.VpcLink,
  apiCert: certs.DnsValidatedCertificate
}

export class WebsocketApi extends cdk.Construct {

  readonly apiDiscovery : discovery.NonIpInstance;

  constructor(scope: cdk.Construct, id: string, props: WebsocketApiProps) {
    super(scope, id);

    const websocketApi = new apigv2.CfnApi(this, 'Websocket', {
      disableExecuteApiEndpoint: true,
      disableSchemaValidation: true,
      protocolType: 'WEBSOCKET',
      name: 'HoratioWebSocketApi',
      routeSelectionExpression: '$request.body.action'
    });

    const connectIntegration = new apigv2.CfnIntegration(this, 'ConnectIntegration', {
      apiId: websocketApi.ref,
      connectionType: 'VPC_LINK',
      connectionId: props.vpcLink.vpcLinkId,
      integrationType: 'HTTP',
      integrationUri: `http://${props.nlb.loadBalancerDnsName}/ws`,
      integrationMethod: 'PUT',
      requestParameters: {
        'integration.request.header.Authorization': 'context.identity.cognitoAuthenticationProvider',
        'integration.request.header.X-Websocket-ConnectionId': 'context.connectionId',
      },
      passthroughBehavior: 'WHEN_NO_MATCH'
    });

    new apigv2.CfnRoute(this, 'ConnectRoute', {
      apiId: websocketApi.ref,
      routeKey: '$connect',
      authorizationType: 'AWS_IAM',
      operationName: 'ConnectRoute',
      target: `integrations/${connectIntegration.ref}`,
    });

    const disconnectIntegration = new apigv2.CfnIntegration(this, 'DisconnectIntegration', {
      apiId: websocketApi.ref,
      connectionType: 'VPC_LINK',
      connectionId: props.vpcLink.vpcLinkId,
      integrationType: 'HTTP',
      integrationUri: `http://${props.nlb.loadBalancerDnsName}/ws`,
      integrationMethod: 'DELETE',
      requestParameters: {
        'integration.request.header.X-Websocket-ConnectionId': 'context.connectionId',
      }
    });
    new apigv2.CfnRoute(this, 'DisconnectRoute', {
      apiId: websocketApi.ref,
      routeKey: '$disconnect',
      operationName: 'DisconnectRoute',
      target: `integrations/${disconnectIntegration.ref}`
    });
    
    const defaultIntegration = new apigv2.CfnIntegration(this, 'DefaultIntegration', {
      apiId: websocketApi.ref,
      connectionType: 'VPC_LINK',
      connectionId: props.vpcLink.vpcLinkId,
      integrationType: 'HTTP',
      integrationUri: `http://${props.nlb.loadBalancerDnsName}/ws`,
      integrationMethod: 'POST',
      requestParameters: {
        'integration.request.header.X-Websocket-ConnectionId': 'context.connectionId',
      }
    });
    new apigv2.CfnRoute(this, 'DefaultRoute', {
      apiId: websocketApi.ref,
      routeKey: '$default',
      operationName: 'DefaultRoute',
      target: `integrations/${defaultIntegration.ref}`
    });

    const stage = new apigv2.CfnStage(this, 'Stage', {
      apiId: websocketApi.ref,
      stageName: 'production',
      defaultRouteSettings: {
        detailedMetricsEnabled: true,
        dataTraceEnabled: true,
        loggingLevel: 'INFO'
      },
      autoDeploy: true
    });

    const customDomain = new apigv2.CfnDomainName(this, 'WebsocketDomain', {
      domainName: 'api-ws.95horatio.johndavis.dev',
      domainNameConfigurations: [
        {
          certificateArn: props.apiCert.certificateArn,
          endpointType: 'REGIONAL'
        }
      ]
    });
    new apigv2.CfnApiMapping(this, 'WebsocketDomainMapping', {
      apiId: websocketApi.ref,
      domainName: customDomain.domainName,
      stage: stage.stageName 
    });

    this.apiDiscovery = new discovery.NonIpInstance(this, 'ApiDiscovery', {
      instanceId: 'api',
      customAttributes: {
        'websocketApiId': websocketApi.ref
      },
      service: props.discoveryService
    });
    new r53.ARecord(this, 'WebsocketApiARecord', {
      zone: props.publicZone,
      target: r53.RecordTarget.fromAlias(new r53targets.ApiGatewayv2Domain({
        node: customDomain.node,
        stack: customDomain.stack,
        env: {
          account: customDomain.stack.account,
          region: customDomain.stack.region
        },
        name: 'api-ws.95horatio.johndavis.dev',
        regionalDomainName:  cdk.Token.asString(customDomain.getAtt('RegionalDomainName')),
        regionalHostedZoneId: cdk.Token.asString(customDomain.getAtt('RegionalHostedZoneId'))
      })),
      recordName: 'api-ws'
    });    
  }
}