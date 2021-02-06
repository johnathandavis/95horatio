"use strict";
/*
 * Copyright 2010-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *  http://aws.amazon.com/apache2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiGatewayClientFactory = void 0;
const sigV4Client_1 = require("./sigV4Client");
const simpleHttpClient_1 = require("./simpleHttpClient");
const utils_1 = require("./utils");
var factory = {};
factory.newClient = function (simpleHttpClientConfig, sigV4ClientConfig) {
    var apiGatewayClient = {};
    //Spin up 2 httpClients, one for simple requests, one for SigV4
    var sigV4Client = sigV4Client_1.sigV4ClientFactory.newClient(sigV4ClientConfig);
    var simpleHttpClient = simpleHttpClient_1.simpleHttpClientFactory.newClient(simpleHttpClientConfig);
    apiGatewayClient.makeRequest = function (request, authType, additionalParams, apiKey) {
        //Default the request to use the simple http client
        var clientToUse = simpleHttpClient;
        if (request.headers === undefined) {
            request.headers = {};
        }
        //Attach the apiKey to the headers request if one was provided
        if (apiKey !== undefined && apiKey !== '' && apiKey !== null) {
            request.headers['x-api-key'] = apiKey;
        }
        if (request.body === undefined || request.body === null || Object.keys(request.body).length === 0) {
            request.body = undefined;
        }
        if (request.body !== undefined) {
            request.body = JSON.stringify(utils_1.jsonToUpper(JSON.parse(request.body)));
        }
        // If the user specified any additional headers or query params that may not have been modeled
        // merge them into the appropriate request properties
        request.headers = utils_1.mergeInto(request.headers, additionalParams.headers);
        request.queryParams = utils_1.mergeInto(request.queryParams, additionalParams.queryParams);
        //If an auth type was specified inject the appropriate auth client
        if (authType === 'AWS_IAM') {
            clientToUse = {
                endpoint: sigV4Client.endpoint,
                makeRequest: sigV4Client.makeRequest
            };
        }
        //Call the selected http client to make the request, returning a promise once the request is sent
        return clientToUse.makeRequest(request);
    };
    return {
        makeRequest: apiGatewayClient.makeRequest
    };
};
exports.apiGatewayClientFactory = {
    newClient: factory.newClient
};
//# sourceMappingURL=apiGatewayClient.js.map