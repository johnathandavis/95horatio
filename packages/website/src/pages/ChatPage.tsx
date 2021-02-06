import React from 'react';
import isEqual from "lodash/isEqual";
import * as apiclient from '@95horatio.johndavis.dev/api-client';
import { ApiClient } from '../ApiClient';
import moment from 'moment';
import {
  PageHeader, Layout, Descriptions,
  Table, Tabs, Popover, Button, Tag
} from 'antd';
import { TablePaginationConfig } from 'antd/lib/table/Table';
const { TabPane } = Tabs;

type Filters = Record<string, (React.Key | boolean)[] | null>;

const createSentimentPopoverContent = (record: apiclient.ChatMessage) => {
  return (
    <div>
      <Tag color="green">Positivity ({record.positivity})</Tag>
      <Tag color="red">Negativity ({record.negativity})</Tag>
      <Tag color="blue">Neutrality ({record.neutrality})</Tag>
      <Tag color="orange">Mixed ({record.mixed})</Tag>
    </div>
  )
};

const colorForSentiment = (sentiment: string) => {
  var lower = sentiment.toLocaleLowerCase();
  if (lower === 'positive') {
    return 'green';
  } else if (lower === 'negative') {
    return 'red';
  } else if (lower === 'neutral') {
    return 'blue'
  } else if (lower === 'mixed') {
    return 'orange';
  } else {
    return 'white';
  }
}

const chatMessageColumns = [
  {
    title: 'Timestamp',
    key: 'timestamp',
    render: (text: string, record: apiclient.ChatMessage) => {
      const m = moment(record.timestamp).format('MMMM Do YYYY, h:mm:ss a');
      return (
        <>{m}</>
      )
    },
    width: "20%"
  },
  {
    title: 'Message',
    dataIndex: 'message',
    key: 'message',
    width: "50%"
  },
  {
    title: 'Sentiment',
    key: 'sentiment',
    render: (text: string, record: apiclient.ChatMessage) => {
      return (
        <Popover content={createSentimentPopoverContent(record)} title="Sentiment Details">
          <Button color={colorForSentiment(record.sentiment)} type="primary">{record.sentiment}</Button>
        </Popover>
      )
    },
    width: "50%"
  },
];

const client = new ApiClient();

interface KudosPageState {
  chatSummary: apiclient.GetChatSummaryResponse | null,
  twitchChatMessages: apiclient.ChatMessage[],
  pagination: TablePaginationConfig,
  filters: Filters,
  loading: boolean,
}



export default class Kudos extends React.Component<{}, KudosPageState> {

  private nextPageToken : string | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      chatSummary: null,
      twitchChatMessages: [],
      pagination: {
        pageSize: 25,
        onChange: this.handlePaginationChange,
        total: 26
      },
      filters: null as unknown as any,
      loading: false

    };

    this.fetchData();
    client.getChatSummary().then((summary) => {
      this.setState({
        chatSummary: summary
      })
    });
  }

  fetchData = async () => {
    const chatsResponse = await client.listChats({
      order: 'Descending',
      provider: 'Twitch',
      paginationToken: this.nextPageToken!
    });
    const newPagination = { ...this.state.pagination };
    newPagination.total = chatsResponse.messages.length;
    this.nextPageToken = chatsResponse.paginationToken!;
    this.setState({
      pagination: newPagination,
      loading: false,
      twitchChatMessages: chatsResponse.messages,
    });
  }

  handlePaginationChange = (page: number, pageSize?: number) => {
    console.log(`Page: ${page}, Page Size: ${pageSize}`);
  }
  
  handleTableChange = (pagination: TablePaginationConfig, filters: any) => {
    const pager = { ...pagination };
    // if filters not changed, don't update pagination.current
    const filtersChanged = !isEqual(filters, filters);
    if (!filtersChanged) {
      pager.current = pagination.current;
    }
    this.setState({
      pagination: pager,
      filters: filters
    });
  };

  render = () => {
    return (
        <div className="site-page-header-ghost-wrapper">
          <Layout style={{width: '100%', height: '100%'}}>
            <PageHeader
              className="site-page-header"
              onBack={() => null}
              title="Chat Summary"
              subTitle="Nice things"
            />
              <div className="site-card-wrapper">
              <Descriptions title="User Info" bordered>
                <Descriptions.Item label="Message Count">{`${this.state.chatSummary?.messageCount} (${this.state.chatSummary?.messageCountRank})`}</Descriptions.Item>
                <Descriptions.Item label="Positivity">{`${this.state.chatSummary?.positivity.value} (${this.state.chatSummary?.positivity.rank})`}</Descriptions.Item>
                <Descriptions.Item label="Negativity">{`${this.state.chatSummary?.negativity.value} (${this.state.chatSummary?.negativity.rank})`}</Descriptions.Item>
                <Descriptions.Item label="Neutrality">{`${this.state.chatSummary?.neutrality.value} (${this.state.chatSummary?.neutrality.rank})`}</Descriptions.Item>
                <Descriptions.Item label="Mixed">{`${this.state.chatSummary?.mixed.value} (${this.state.chatSummary?.mixed.rank})`}</Descriptions.Item>
              </Descriptions>
              <Tabs defaultActiveKey="1">
                <TabPane tab="Twitch" key="1">
                  <Table
                    columns={chatMessageColumns}
                    loading={this.state.loading}
                    dataSource={this.state.twitchChatMessages ?? []}
                    pagination={this.state.pagination}
                    onChange={(pagination, filters) => this.handleTableChange(pagination, filters)}/>
                </TabPane>
              </Tabs>
              </div>
          </Layout>
        </div>
      );
    }
}