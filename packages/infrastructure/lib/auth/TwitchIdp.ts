import { Construct } from 'constructs';
import { UserPoolIdentityProviderBase } from '@aws-cdk/aws-cognito/lib/user-pool-idps/private/user-pool-idp-base';
import * as cognito from '@aws-cdk/aws-cognito';

/**
 * Properties to initialize TwitchIdp.
 */
export interface TwitchIdpProps extends cognito.UserPoolIdentityProviderProps {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly scopes?: string[];
}

export class TwitchIdp extends UserPoolIdentityProviderBase {
  /**
   * The primary identifier of this identity provider.
   */
  readonly providerName: string;
  /**
   *
   */
  constructor(scope: Construct, id: string, props: TwitchIdpProps) {
    super(scope, id, props);

    const resource = new cognito.CfnUserPoolIdentityProvider(this, 'Resource', {
      userPoolId: props.userPool.userPoolId,
      providerName: 'Twitch',
      providerType: 'OIDC',
      providerDetails: {
          client_id: props.clientId,
          client_secret: props.clientSecret,
          authorize_scopes: props.scopes!.join(' '),
          attributes_request_method: 'GET',
          oidc_issuer: 'https://id.twitch.tv/oauth2',
          authorize_url: 'https://id.twitch.tv/oauth2/authorize',
          token_url: 'https://id.twitch.tv/oauth2/token',
          attributes_url: 'https://id.twitch.tv/oauth2/userinfo',
          jwks_uri: 'https://id.twitch.tv/oauth2/keys'
      }
  });
  this.providerName = super.getResourceNameAttribute(resource.ref);
  }
}
