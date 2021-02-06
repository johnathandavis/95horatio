import { AxiosPromise } from 'axios';
interface SigV4Client {
    accessKey: string;
    secretKey: string;
    sessionToken: string;
    serviceName: string;
    region: string;
    endpoint: string;
    makeRequest: (req: any) => AxiosPromise<any>;
}
interface SigV4ClientFactory {
    newClient: (config: any) => SigV4Client;
}
export declare const sigV4ClientFactory: SigV4ClientFactory;
export {};
