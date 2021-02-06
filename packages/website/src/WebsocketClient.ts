import { sign } from 'aws4';
import { Auth } from 'aws-amplify';
import * as apiclient from '@95horatio.johndavis.dev/api-client';

const AWS_REGION = 'us-east-2';
const WEBSOCKET_URL = `api-ws.95horatio.johndavis.dev`;
// Get a signed path
const signPathWithCreds = ( accessKeyId: string, secretAccessKey: string, sessionToken: string ) => sign({
 host: WEBSOCKET_URL,
 path: `/?X-Amz-Security-Token=${encodeURIComponent(sessionToken)}`,
 service: `execute-api`,
 region: AWS_REGION,
 signQuery: true
}, {
 accessKeyId,
 secretAccessKey
});

interface WebsocketClientProps {
  onSentiment: (sentiment: apiclient.SentimentAlert) => void;
}

export class WebsocketClient {

  private readonly props : WebsocketClientProps;
  private socket : WebSocket | undefined;

  constructor (props: WebsocketClientProps) {
    this.props = props;
  }

  connect = async () => {
    this.socket = await this.getWebsocketClient();
    this.socket.onopen = (ev) => this.onOpen(ev);
    this.socket.onclose = (ev) => this.onClose(ev);
    this.socket.onerror = (ev) => this.onError(ev);
    this.socket.onmessage = (ev) => this.onMessage(ev);
  }

  private onOpen = (evt: any) => {
    console.log(`Socket opened.`);
    console.log(evt);
  }

  private onClose = (evt: any) => {
    console.log(`Socket closed.`);
    console.log(evt);
  }

  private onError = (evt: any) => {
    console.log(`Socket error.`);
    console.log(evt);
  }

  private onMessage = (evt: MessageEvent<any>) => {
    const decoder = new TextDecoder('utf-8');
    var messageStr : string = '';
    if(evt.data instanceof ArrayBuffer ){
      var buffer = evt.data;
      messageStr = decoder.decode(buffer)
    } else if (typeof(evt.data) === 'string') {
      messageStr = evt.data;
    } else {
      console.log('Unknown websocket message type:');
      console.log(evt);
    }
    const alert = JSON.parse(messageStr) as apiclient.Alert;
    if (alert.Type === 'Sentiment') {
      this.props.onSentiment(alert.Sentiment);
    } else {
      console.log(alert);
    }
  }

  private getWebsocketClient = async () => {
    const creds = await Auth.currentCredentials();
    const signResult = signPathWithCreds(creds.accessKeyId, creds.secretAccessKey, creds.sessionToken);
    const wssPath = `wss://${WEBSOCKET_URL}${signResult.path}`;
    return new WebSocket(wssPath);
  }

}