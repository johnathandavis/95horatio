import React, { useState } from 'react';
import {
  PageHeader, Layout,
  Row, Col,
  Card, Tooltip,
  Result, Button
} from 'antd';
import { Auth } from 'aws-amplify';

interface TwitchUser {
  twitchUsername: string,
  discordUsername: string,
  userId: string,
  score: number
}

const getTwitchUserInfo = async () : Promise<TwitchUser | undefined> => {

  const currentUserInfo = await Auth.currentUserInfo();
  const identities = JSON.parse(currentUserInfo.attributes['identities']);
  const userId = identities[0].userId;

  return {
    twitchUsername: currentUserInfo.attributes['custom:twitch_username'],
    discordUsername: currentUserInfo.attributes['custom:discord_username'],
    userId: userId,
    score: 0
  };
}

const createTwitchCard = (user: TwitchUser) : JSX.Element => {
  return (
    <Card title="Twitch" bordered={false}>
      <b>Username:</b> {user.twitchUsername}
    </Card>
  )
};

const createDiscordCard = (user: TwitchUser) : JSX.Element => {
  if (user.discordUsername === null || user.discordUsername === undefined) {
    return (
      <Card title="Discord" bordered={false}>
        <b>Step 1:</b> <Button onClick={() => window.open('https://discord.gg/JtZdQzXbcm', 'blank')}>Join the Discord!</Button>.
        <br />
        <b>Step 2:</b> Link your Twitch account with your Discord account by using the <code>!linkdiscord</code> command in the <a target='_blank' rel='noreferrer' href='https://www.twitch.tv/95horatio'>Twitch chat</a>.
        <br />
        <b>Step 3:</b> Confirm the link by responding to the 95HoratioBot's DM with the confirmation code.
      </Card>
    )
  } else {
    const justUsername = user.discordUsername.split('#')[0];
    return (
      <Card title="Discord" bordered={false}>
        <b>Username:</b>
        <Tooltip title={user.discordUsername}>
          {justUsername}
        </Tooltip>
      </Card>
    );
  }
};

const createContent = (user: TwitchUser | undefined) : JSX.Element => {
  if (user === null || user === undefined) {
    return (
      <Result
        status="info"
        title="Login to use this Console"
        subTitle="You can use your Twitch account to login, then link you Discord account."
        extra={[
          <Button type="primary" key="console" onClick={() => Auth.federatedSignIn({ customProvider: 'Twitch'})}>
            Login With Twitch
          </Button>
        ]}
      />
    )
  } else {
    const twitchCard = createTwitchCard(user!);
    const discordCard = createDiscordCard(user!);
    return (
      <Row gutter={16}>
        <Col span={8}>
          {twitchCard}
        </Col>
        <Col span={8}>
          {discordCard}
        </Col>
        <Col span={8}>
        </Col>
      </Row>
    )
  }
};

export default function Home() {
  const [user, setUser] = useState<TwitchUser>(null as any);

  if (user === null) {
    getTwitchUserInfo().then(user => {
      console.log(user);
      setUser(user!);
    })
    .catch(() => console.log("Not signed in"));
  }
  const content = createContent(user);

  return (
    <div className="site-page-header-ghost-wrapper">
      <Layout style={{width: '100%', height: '100%'}}>
        <PageHeader
          className="site-page-header"
          onBack={() => null}
          title="Home"
          subTitle="Is where the heart is"
        />
          <div className="site-card-wrapper">
            {content}
          </div>
      </Layout>
    </div>
  );
}