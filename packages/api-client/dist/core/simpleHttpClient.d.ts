interface SimpleHttpClientFactory {
    newClient: (config: any) => SimpleHttpClient;
}
interface SimpleHttpClient {
    endpoint: string;
    makeRequest: (request: any) => any;
}
export declare const simpleHttpClientFactory: SimpleHttpClientFactory;
export {};
