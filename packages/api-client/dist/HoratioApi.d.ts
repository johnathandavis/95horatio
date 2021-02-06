import * as models from './Models';
interface ApiClientConfig {
    endpoint: string;
    accessKey: string;
    secretKey: string;
    sessionToken: string;
    region: string;
}
export declare class HoratioApi {
    private readonly client;
    constructor(config: ApiClientConfig);
    getUserInfo: () => Promise<models.GetUserInfoResponse>;
    getSentKudos: () => Promise<models.GetSentKudosResponse>;
    getReceivedKudos: () => Promise<models.GetReceivedKudosResponse>;
    getChatSummary: () => Promise<models.GetChatSummaryResponse>;
    listChats: (request: models.ListChatsRequest) => Promise<models.ListChatsResponse>;
}
export {};
