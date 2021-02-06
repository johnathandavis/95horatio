import { apiGatewayClientFactory, IApiGatewayClient, IApiGatewayRequest } from './core/apiGatewayClient'

import * as models from './Models';
import { AxiosError } from 'axios';

interface ApiClientConfig {
  endpoint: string,
  accessKey: string,
  secretKey: string,
  sessionToken: string,
  region: string
}

export class HoratioApi {

  private readonly client : IApiGatewayClient;

  constructor(config: ApiClientConfig) {
    var sigV4ClientConfig = {
        accessKey: config.accessKey,
        secretKey: config.secretKey,
        sessionToken: config.sessionToken,
        serviceName: 'execute-api',
        region: config.region,
        endpoint: config.endpoint,
        defaultContentType: 'application/json',
        defaultAcceptType: 'application/json'
    };
    var simpleHttpClientConfig = {
        endpoint: config.endpoint,
        defaultContentType: 'application/json',
        defaultAcceptType: 'application/json'
    };
    this.client = apiGatewayClientFactory.newClient(simpleHttpClientConfig, sigV4ClientConfig);
  }

  getUserInfo = async () : Promise<models.GetUserInfoResponse> => {
    var getUserInfoRequest : IApiGatewayRequest<models.GetUserInfoResponse> = {
      verb: 'GET',
      path: '/user/whoami'
    };
    
    try {
      const response = await this.client.makeRequest<{},models.GetUserInfoResponse>(getUserInfoRequest, 'AWS_IAM', {}, undefined);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      throw error;
    }
  }

  getSentKudos = async () : Promise<models.GetSentKudosResponse> => {
    var getSentKudosRequest : IApiGatewayRequest<models.GetSentKudosResponse> = {
      verb: 'GET',
      path: '/kudos/sent'
    };
    
    try {
      const response = await this.client.makeRequest<{},models.GetSentKudosResponse>(getSentKudosRequest, 'AWS_IAM', {}, undefined);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      throw error;
    }
  }

  getReceivedKudos = async () : Promise<models.GetReceivedKudosResponse> => {
    var getReceivedKudosRequest : IApiGatewayRequest<models.GetReceivedKudosResponse> = {
      verb: 'GET',
      path: '/kudos/received'
    };
    
    try {
      const response = await this.client.makeRequest<{},models.GetReceivedKudosResponse>(getReceivedKudosRequest, 'AWS_IAM', {}, undefined);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      throw error;
    }
  }

  getChatSummary = async () : Promise<models.GetChatSummaryResponse> => {
    var getChatSummaryRequest : IApiGatewayRequest<models.GetChatSummaryResponse> = {
      verb: 'GET',
      path: '/chat/summary'
    };
    
    try {
      const response = await this.client.makeRequest<{},models.GetChatSummaryResponse>(getChatSummaryRequest, 'AWS_IAM', {}, undefined);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      throw error;
    }
  }

  listChats = async (request: models.ListChatsRequest) : Promise<models.ListChatsResponse> => {
    var path = '/chat';
    var params : { 
      [index: string] : string
    } = {};
    if (request.paginationToken !== null && request.paginationToken !== undefined && request.paginationToken.length > 0) {
      params['paginationToken'] = request.paginationToken!;
    }
    if (request.order !== null && request.order !== undefined && request.order.length > 0) {
      params['order'] = request.order!;
    } else {
      params['order'] = 'Descending';
    }
    params['provider'] = request.provider;
    
    var listChatsRequest : IApiGatewayRequest<models.ListChatsResponse> = {
      verb: 'GET',
      path: '/chat',
      queryParams: params
    };
    
    try {
      const response = await this.client.makeRequest<{},models.ListChatsResponse>(listChatsRequest, 'AWS_IAM', {}, undefined);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      throw error;
    }
  }
}