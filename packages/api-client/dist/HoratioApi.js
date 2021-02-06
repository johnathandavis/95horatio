"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoratioApi = void 0;
const apiGatewayClient_1 = require("./core/apiGatewayClient");
class HoratioApi {
    constructor(config) {
        this.getUserInfo = () => __awaiter(this, void 0, void 0, function* () {
            var getUserInfoRequest = {
                verb: 'GET',
                path: '/user/whoami'
            };
            try {
                const response = yield this.client.makeRequest(getUserInfoRequest, 'AWS_IAM', {}, undefined);
                return response.data;
            }
            catch (err) {
                const error = err;
                throw error;
            }
        });
        this.getSentKudos = () => __awaiter(this, void 0, void 0, function* () {
            var getSentKudosRequest = {
                verb: 'GET',
                path: '/kudos/sent'
            };
            try {
                const response = yield this.client.makeRequest(getSentKudosRequest, 'AWS_IAM', {}, undefined);
                return response.data;
            }
            catch (err) {
                const error = err;
                throw error;
            }
        });
        this.getReceivedKudos = () => __awaiter(this, void 0, void 0, function* () {
            var getReceivedKudosRequest = {
                verb: 'GET',
                path: '/kudos/received'
            };
            try {
                const response = yield this.client.makeRequest(getReceivedKudosRequest, 'AWS_IAM', {}, undefined);
                return response.data;
            }
            catch (err) {
                const error = err;
                throw error;
            }
        });
        this.getChatSummary = () => __awaiter(this, void 0, void 0, function* () {
            var getChatSummaryRequest = {
                verb: 'GET',
                path: '/chat/summary'
            };
            try {
                const response = yield this.client.makeRequest(getChatSummaryRequest, 'AWS_IAM', {}, undefined);
                return response.data;
            }
            catch (err) {
                const error = err;
                throw error;
            }
        });
        this.listChats = (request) => __awaiter(this, void 0, void 0, function* () {
            var path = '/chat';
            var params = {};
            if (request.paginationToken !== null && request.paginationToken !== undefined && request.paginationToken.length > 0) {
                params['paginationToken'] = request.paginationToken;
            }
            if (request.order !== null && request.order !== undefined && request.order.length > 0) {
                params['order'] = request.order;
            }
            else {
                params['order'] = 'Descending';
            }
            params['provider'] = request.provider;
            var listChatsRequest = {
                verb: 'GET',
                path: '/chat',
                queryParams: params
            };
            try {
                const response = yield this.client.makeRequest(listChatsRequest, 'AWS_IAM', {}, undefined);
                return response.data;
            }
            catch (err) {
                const error = err;
                throw error;
            }
        });
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
        this.client = apiGatewayClient_1.apiGatewayClientFactory.newClient(simpleHttpClientConfig, sigV4ClientConfig);
    }
}
exports.HoratioApi = HoratioApi;
//# sourceMappingURL=HoratioApi.js.map