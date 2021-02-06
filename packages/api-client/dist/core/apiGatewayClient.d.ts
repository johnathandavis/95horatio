import { AxiosResponse } from 'axios';
interface IApiGatewayClientFactory {
    newClient: (simpleConfig: any, sigV4Config: any) => IApiGatewayClient;
}
export interface IApiGatewayRequest<T> {
    headers?: {
        [index: string]: string;
    };
    queryParams?: {
        [index: string]: string;
    };
    body?: T | string;
    verb: string;
    path: string;
}
export interface IApiGatewayClient {
    makeRequest: <TReq, TRes>(request: IApiGatewayRequest<TReq>, authType: any, additionalParams: any, apiKey?: string) => Promise<AxiosResponse<TRes>>;
}
export declare const apiGatewayClientFactory: IApiGatewayClientFactory;
export {};
