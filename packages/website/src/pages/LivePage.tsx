import React from 'react';
import {
  PageHeader, Layout,
} from 'antd';
import { WebsocketClient } from '../WebsocketClient';
import { SentimentTicker } from '../components';
import * as apiclient from '@95horatio.johndavis.dev/api-client';

interface ILivePageState {
  alerts: {
    [username: string] : apiclient.SentimentAlert
  }
}

export default class LivePage extends React.Component<{}, ILivePageState> {

  private readonly client;
  private maxSymbols : number = 5;

  constructor(props: {}) {
    super({});

    this.state = {
      alerts: {}
    }
    this.handleResize();
    this.client = new WebsocketClient({
      onSentiment: (alert) => this.handleSentimentAlert(alert)
    });
  }

  private handleSentimentAlert = (alert: apiclient.SentimentAlert) => {
    console.log('Sentiment alert received:');
    console.log(alert);
    const alerts : {
      [username: string] : apiclient.SentimentAlert
    } = this.state.alerts;
    var usernames = Object.keys(this.state.alerts);
    if (!usernames.includes(alert.TwitchUsername) && usernames.length === this.maxSymbols) {
      var oldestAlert : apiclient.SentimentAlert | undefined = undefined;
      for (let username of usernames) {
        const alert = this.state.alerts[username];
        if (oldestAlert === undefined || alert.TimestampEpochSeconds < oldestAlert!.TimestampEpochSeconds) {
          oldestAlert = alert;
        }
      }
      if (oldestAlert !== undefined) {
        delete alerts[oldestAlert.TwitchUsername];
      } 
    } 
    alerts[alert.TwitchUsername] = alert;
    this.setState({
      alerts: alerts
    })
  }

  componentDidMount = () => {
    this.client.connect().then(() => {
      console.log('Connected!');
    });
    window.onresize = (_: any) => this.handleResize();
  }

  handleResize = () => {
    this.maxSymbols = Math.floor(window.innerWidth / 150.0) - 1;
  }

  componentWillUnmount = () => {
  }

  render = () => {
    return (
      <div className="site-page-header-ghost-wrapper">
        <Layout style={{width: '100%', height: '100%'}}>
          <PageHeader
            className="site-page-header"
            onBack={() => null}
            title="Live Data"
            subTitle="A live view of the neighborhood"
          />
            <div className="site-card-wrapper" >
              <SentimentTicker alerts={Object.values(this.state.alerts)} />
            </div>
        </Layout>
      </div>
    )
  }

}