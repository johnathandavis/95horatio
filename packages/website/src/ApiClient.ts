import * as apiclient from '@95horatio.johndavis.dev/api-client';
import { Auth } from 'aws-amplify';

export class ApiClient {

  getChatSummary = async () : Promise<apiclient.GetChatSummaryResponse> => {
    const client = await this.getApiClient();
    return await client.getChatSummary();
  }

  getSentKudos = async () : Promise<apiclient.GetSentKudosResponse> => {
    const client = await this.getApiClient();
    return await client.getSentKudos();
  }

  getReceivedKudos = async () : Promise<apiclient.GetReceivedKudosResponse> => {
    const client = await this.getApiClient();
    return await client.getReceivedKudos();
  }

  listChats = async (request: apiclient.ListChatsRequest) : Promise<apiclient.ListChatsResponse> => {
    const client = await this.getApiClient();
    return await client.listChats(request);
  }

  private getApiClient = async () => {
    const creds = await Auth.currentCredentials();
    return new apiclient.HoratioApi({
      accessKey: creds.accessKeyId,
      secretKey: creds.secretAccessKey,
      sessionToken: creds.sessionToken,
      endpoint: 'https://api.95horatio.johndavis.dev',
      region: 'us-east-2'
    });
  }

}