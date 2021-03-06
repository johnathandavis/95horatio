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

import axios, { AxiosPromise, AxiosRequestConfig } from 'axios';
import CryptoJS from 'crypto-js';
import { assertDefined, copy, jsonToLower, jsonToUpper } from './utils';

interface SigV4Client {
  accessKey: string,
  secretKey: string,
  sessionToken: string,
  serviceName: string,
  region: string,
  endpoint: string,
  makeRequest: (req: any) => AxiosPromise<any>
}

interface SigV4ClientFactory {
  newClient: (config: any) => SigV4Client
}

var sigV4Factory : Partial<SigV4ClientFactory> = {};
sigV4Factory.newClient = (config: any) : SigV4Client => {
    var AWS_SHA_256 = 'AWS4-HMAC-SHA256';
    var AWS4_REQUEST = 'aws4_request';
    var AWS4 = 'AWS4';
    var X_AMZ_DATE = 'x-amz-date';
    var X_AMZ_SECURITY_TOKEN = 'x-amz-security-token';
    var HOST = 'host';
    var AUTHORIZATION = 'Authorization';

    function hash(value: any) {
        return CryptoJS.SHA256(value);
    }

    function hexEncode(value: any) {
        return value.toString(CryptoJS.enc.Hex);
    }

    function hmac(secret: any, value: any) {
        return CryptoJS.HmacSHA256(value, secret, {asBytes: true});
    }

    function buildCanonicalRequest(method: string, path: string, queryParams: any, headers: any, payload: any) {
        return method + '\n' +
            buildCanonicalUri(path) + '\n' +
            buildCanonicalQueryString(queryParams) + '\n' +
            buildCanonicalHeaders(headers) + '\n' +
            buildCanonicalSignedHeaders(headers) + '\n' +
            hexEncode(hash(payload));
    }

    function hashCanonicalRequest(request: any) {
        return hexEncode(hash(request));
    }

    function buildCanonicalUri(uri: string) {
        return encodeURI(uri);
    }

    function buildCanonicalQueryString(queryParams: any) {
        if (Object.keys(queryParams).length < 1) {
            return '';
        }

        var sortedQueryParams = [];
        for (var property in queryParams) {
            if (queryParams.hasOwnProperty(property)) {
                sortedQueryParams.push(property);
            }
        }
        sortedQueryParams.sort();

        var canonicalQueryString = '';
        for (var i = 0; i < sortedQueryParams.length; i++) {
            canonicalQueryString += sortedQueryParams[i] + '=' + fixedEncodeURIComponent(queryParams[sortedQueryParams[i]]) + '&';
        }
        return canonicalQueryString.substr(0, canonicalQueryString.length - 1);
    }

    function fixedEncodeURIComponent (str: any) {
      return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
        return '%' + c.charCodeAt(0).toString(16).toUpperCase();
      });
    }

    function buildCanonicalHeaders(headers: any) {
        var canonicalHeaders = '';
        var sortedKeys = [];
        for (var property in headers) {
            if (headers.hasOwnProperty(property)) {
                sortedKeys.push(property);
            }
        }
        sortedKeys.sort();

        for (var i = 0; i < sortedKeys.length; i++) {
            canonicalHeaders += sortedKeys[i].toLowerCase() + ':' + headers[sortedKeys[i]] + '\n';
        }
        return canonicalHeaders;
    }

    function buildCanonicalSignedHeaders(headers: any) {
        var sortedKeys = [];
        for (var property in headers) {
            if (headers.hasOwnProperty(property)) {
                sortedKeys.push(property.toLowerCase());
            }
        }
        sortedKeys.sort();

        return sortedKeys.join(';');
    }

    function buildStringToSign(datetime: any, credentialScope: any, hashedCanonicalRequest: any) {
        return AWS_SHA_256 + '\n' +
            datetime + '\n' +
            credentialScope + '\n' +
            hashedCanonicalRequest;
    }

    function buildCredentialScope(datetime: any, region: any, service: any) {
        return datetime.substr(0, 8) + '/' + region + '/' + service + '/' + AWS4_REQUEST
    }

    function calculateSigningKey(secretKey: any, datetime: any, region: any, service: any) {
        return hmac(hmac(hmac(hmac(AWS4 + secretKey, datetime.substr(0, 8)), region), service), AWS4_REQUEST);
    }

    function calculateSignature(key: any, stringToSign: any) {
        return hexEncode(hmac(key, stringToSign));
    }

    function buildAuthorizationHeader(accessKey: any, credentialScope: any, headers: any, signature: any) {
        return AWS_SHA_256 + ' Credential=' + accessKey + '/' + credentialScope + ', SignedHeaders=' + buildCanonicalSignedHeaders(headers) + ', Signature=' + signature;
    }

    var awsSigV4Client : Partial<SigV4Client> = { };
    if(config.accessKey === undefined || config.secretKey === undefined) {
        return awsSigV4Client as any;
    }
    awsSigV4Client.accessKey = assertDefined<string>(config.accessKey, 'accessKey');
    awsSigV4Client.secretKey = assertDefined<string>(config.secretKey, 'secretKey');
    awsSigV4Client.sessionToken = config.sessionToken;
    awsSigV4Client.serviceName = assertDefined<string>(config.serviceName, 'serviceName');
    awsSigV4Client.region = assertDefined<string>(config.region, 'region');
    awsSigV4Client.endpoint = assertDefined<string>(config.endpoint, 'endpoint');

    awsSigV4Client.makeRequest = function (request) {
        var verb = assertDefined<string>(request.verb, 'verb');
        var path = assertDefined<string>(request.path, 'path');
        var queryParams = copy(request.queryParams);
        if (queryParams === undefined) {
            queryParams = {};
        }
        var headers = copy(request.headers);
        if (headers === undefined) {
            headers = {};
        }

        //If the user has not specified an override for Content type the use default
        if(headers['Content-Type'] === undefined) {
            headers['Content-Type'] = config.defaultContentType;
        }

        //If the user has not specified an override for Accept type the use default
        if(headers['Accept'] === undefined) {
            headers['Accept'] = config.defaultAcceptType;
        }

        var body = copy(request.body);
        if (body === undefined || verb === 'GET') { // override request body and set to empty when signing GET requests
            body = '';
        }

        //If there is no body remove the content-type header so it is not included in SigV4 calculation
        if(body === '' || body === undefined || body === null) {
            delete headers['Content-Type'];
        }

        var datetime = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z').replace(/[:\-]|\.\d{3}/g, '');
        headers[X_AMZ_DATE] = datetime;
        var parser = document.createElement('a');
        parser.href = awsSigV4Client.endpoint!;
        headers[HOST] = parser.hostname;

        var canonicalRequest = buildCanonicalRequest(verb, path, queryParams, headers, body);
        var hashedCanonicalRequest = hashCanonicalRequest(canonicalRequest);
        var credentialScope = buildCredentialScope(datetime, awsSigV4Client.region, awsSigV4Client.serviceName);
        var stringToSign = buildStringToSign(datetime, credentialScope, hashedCanonicalRequest);
        var signingKey = calculateSigningKey(awsSigV4Client.secretKey, datetime, awsSigV4Client.region, awsSigV4Client.serviceName);
        var signature = calculateSignature(signingKey, stringToSign);
        headers[AUTHORIZATION] = buildAuthorizationHeader(awsSigV4Client.accessKey, credentialScope, headers, signature);
        if(awsSigV4Client.sessionToken !== undefined && awsSigV4Client.sessionToken !== '') {
            headers[X_AMZ_SECURITY_TOKEN] = awsSigV4Client.sessionToken;
        }
        delete headers[HOST];

        var url = config.endpoint + path;
        var queryString = buildCanonicalQueryString(queryParams);
        if (queryString != '') {
            url += '?' + queryString;
        }

        //Need to re-attach Content-Type if it is not specified at this point
        if(headers['Content-Type'] === undefined) {
            headers['Content-Type'] = config.defaultContentType;
        }

        var signedRequest : AxiosRequestConfig = {
            method: verb as any,
            url: url,
            headers: headers,
            data: body
        };

        return axios(signedRequest);
    };

    return {
      accessKey: awsSigV4Client.accessKey!,
      secretKey: awsSigV4Client.secretKey!,
      sessionToken: awsSigV4Client.sessionToken!,
      serviceName: awsSigV4Client.serviceName!,
      endpoint: awsSigV4Client.endpoint!,
      makeRequest: awsSigV4Client.makeRequest!,
      region: awsSigV4Client.region!
    };
};

export const sigV4ClientFactory : SigV4ClientFactory = {
  newClient: sigV4Factory.newClient!
};