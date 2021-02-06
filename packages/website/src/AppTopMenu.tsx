import React, { useState } from 'react';
import { Menu } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  GiftOutlined,
  WechatOutlined,
  DeliveredProcedureOutlined,
  OrderedListOutlined
} from '@ant-design/icons';
import { Auth } from 'aws-amplify';
import { useHistory } from "react-router-dom";


interface TwitchUser {
  username: string,
  userId: string
}

const getTwitchUserInfo = async () : Promise<TwitchUser | undefined> => {

  const currentUserInfo = await Auth.currentUserInfo();
  console.log(currentUserInfo);
  const identities = JSON.parse(currentUserInfo.attributes['identities']);
  const userId = identities[0].userId;
  return {
    username: currentUserInfo.attributes['custom:twitch_username'],
    userId: userId
  };
}

function AppTopMenu() {
  let history = useHistory();

  const [current, setCurrent] = useState("mail");
  const [user, setUser] = useState<TwitchUser>(null as any);

  if (user === null) {
    getTwitchUserInfo().then(user => {
      console.log(user);
      setUser(user!);
    })
    .catch(() => console.log("Not signed in"));
  }

  const loginRegisterButton = (
    <Menu.Item key="userLoginRegister" icon={<UserOutlined />} style={{float: 'right'}} onClick={() => Auth.federatedSignIn({ customProvider: 'Twitch'})}>
      Login with Twitch
    </Menu.Item>
  );
  const logoutButton = (
    <Menu.Item key="userLogout" icon={<UserOutlined />} style={{float: 'right'}} onClick={() => {
      setCurrent('userLogout');
      Auth.signOut();
      history.push('/user/login');
    }}>
      {user?.username}
    </Menu.Item>
  )

  const profileElement = user === null ? loginRegisterButton : logoutButton;

  return (
    <Menu theme="dark" mode="horizontal" defaultSelectedKeys={[current]}>
      <Menu.Item key="home" icon={<HomeOutlined />} style={{float: 'left'}} onClick={() => {
        setCurrent('home');
        history.push('/');
      }}>
        Home
      </Menu.Item>
      <Menu.Item key="chat" icon={<WechatOutlined />} style={{float: 'left'}} onClick={() => {
        setCurrent('chat');
        history.push('/chat');
      }}>
        Chat
      </Menu.Item>
      <Menu.Item key="kudos" icon={<GiftOutlined />} style={{float: 'left'}} onClick={() => {
        setCurrent('kudos');
        history.push('/kudos');
      }}>
        Kudos
      </Menu.Item>
      <Menu.Item key="live" icon={<DeliveredProcedureOutlined />} style={{float: 'left'}} onClick={() => {
        setCurrent('live');
        history.push('/live');
      }}>
        Live
      </Menu.Item>
      <Menu.Item key="tasks" icon={<OrderedListOutlined />} style={{float: 'left'}} onClick={() => {
        setCurrent('tasks');
        history.push('/tasks');
      }}>
        Tasks
      </Menu.Item>
      {profileElement}
    </Menu>
  );
}

export default AppTopMenu;