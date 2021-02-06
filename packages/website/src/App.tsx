import React, { FC } from 'react';
import AppTopMenu from './AppTopMenu';
import ContentRouter from './ContentRouter';
import {
  HashRouter as Router
} from "react-router-dom";
import "./aws-config";
import { Layout } from 'antd';

const { Header, Content } = Layout;

const App: FC = () => {

  return (
    <Layout style={{height: '100%', width: '100%'}}>
      <Router>
        <Header className="header">
          <div className="logo" />
          <AppTopMenu />
        </Header>
        <Content style={{height: '100%'}}>
          <Layout className="site-layout-background" style={{ height: '100%', width: '100%' }}>
            <ContentRouter />
          </Layout>
        </Content>
      </Router>
    </Layout>
  )

}

export default App;