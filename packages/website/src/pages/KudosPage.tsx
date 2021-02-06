import React, { useState } from 'react';
import * as apiclient from '@95horatio.johndavis.dev/api-client';
import {
  PageHeader, Layout,
  Table, Tabs
} from 'antd';
import moment from 'moment';
import { ApiClient } from '../ApiClient';
const { TabPane } = Tabs;

const receivedKudosColumns = [
  {
    title: 'Timestamp',
    key: 'timestamp',
    render: (text: string, record: apiclient.ReceivedKudo) => {
      const m = moment(record.timestamp).format('MMMM Do YYYY, h:mm:ss a');
      return (
        <>{m}</>
      )
    },
    width: 150
  },
  {
    title: 'Message',
    dataIndex: 'message',
    key: 'message'
  },
];
const sentKudosColumns = [
  {
    title: 'Timestamp',
    key: 'timestamp',
    render: (text: string, record: apiclient.SentKudo) => {
      const m = moment(record.timestamp).format('MMMM Do YYYY, h:mm:ss a');
      return (
        <>{m}</>
      )
    },
    width: 150
  },
  {
    title: 'Message',
    dataIndex: 'message',
    key: 'message'
  },
  {
    title: 'Recipient',
    dataIndex: 'recipient',
    key: 'recipient'
  },
];

const client = new ApiClient();

export default function Kudos() {

  const [receivedKudos, setReceivedKudos] = useState<apiclient.ReceivedKudo[]>(null as unknown as any);
  const [sentKudos, setSentKudos] = useState<apiclient.SentKudo[]>(null as unknown as any);

  if (receivedKudos === null) {
    client.getReceivedKudos().then((kudos) => {
      setReceivedKudos(kudos);
    }, (err) => {
      console.error('Failed to fetch received kudos :(');
      console.error(err);
    });
  }
  if (sentKudos === null) {
    client.getSentKudos().then((kudos) => {
      setSentKudos(kudos);
    }, (err) => {
      console.error('Failed to fetch sent kudos :(');
      console.error(err);
    });
  }

  return (
    <div className="site-page-header-ghost-wrapper">
      <Layout style={{width: '100%', height: '100%'}}>
        <PageHeader
          className="site-page-header"
          onBack={() => null}
          title="Kudos"
          subTitle="Nice things"
        />
          <div className="site-card-wrapper">
          <Tabs defaultActiveKey="1">
            <TabPane tab="Received" key="1">
              <Table columns={receivedKudosColumns} dataSource={receivedKudos ?? []} />
            </TabPane>
            <TabPane tab="Sent" key="2">
              <Table columns={sentKudosColumns} dataSource={sentKudos ?? []} />
            </TabPane>
          </Tabs>
          </div>
      </Layout>
    </div>
  );
}