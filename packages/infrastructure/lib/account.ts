import * as cdk from '@aws-cdk/core';

export interface IJohnDavisAccount {
  dnsName: string,
  hostedZoneId: string,
  certificateArn: string,
  twitchAuthSecretArn: string,
  discordAuthSecretArn: string,
  env: cdk.Environment
}

type JohnDavisAccountProps = Omit<IJohnDavisAccount, 'env'> & {
  accountId: string,
  region: string
};

class JohnDavisAccount implements IJohnDavisAccount {

  private readonly props : JohnDavisAccountProps;

  constructor(props: JohnDavisAccountProps) {
    this.props = props;
  }

  get dnsName() {
    return this.props.dnsName;
  }
  get hostedZoneId() {
    return this.props.hostedZoneId;
  }
  get certificateArn() {
    return this.props.certificateArn;
  }
  get twitchAuthSecretArn() {
    return this.props.twitchAuthSecretArn;
  }
  get discordAuthSecretArn() {
    return this.props.discordAuthSecretArn;
  }
  get env() {
    return {
      account: this.props.accountId,
      register: this.props.region
    }
  }
} 

const HoratioProd : IJohnDavisAccount = new JohnDavisAccount({
  accountId: '427808209930',
  region: 'us-east-2',
  dnsName: '95horatio.johndavis.dev',
  certificateArn: 'arn:aws:acm:us-east-1:427808209930:certificate/49463772-5706-44f0-8ca4-b0b43f5008a4',
  hostedZoneId: 'Z09135232R82J5SHBFUJS',
  twitchAuthSecretArn: 'arn:aws:secretsmanager:us-east-2:427808209930:secret:prod/web/TwitchAuth-gd8I2K',
  discordAuthSecretArn: '',
});

const DeployAccount : cdk.Environment = {
  account: '668173261646',
  region: 'us-east-2'
}

export {
  DeployAccount,
  HoratioProd
};