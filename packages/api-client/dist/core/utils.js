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
exports.jsonToLower = exports.jsonToUpper = exports.mergeInto = exports.copy = exports.contains = exports.parseParametersToObject = exports.assertParametersDefined = exports.assertDefined = void 0;
exports.assertDefined = (object, name) => {
    if (object === undefined) {
        throw name + ' must be defined';
    }
    else {
        return object;
    }
};
exports.assertParametersDefined = (params, keys, ignore) => {
    if (keys === undefined) {
        return;
    }
    if (keys.length > 0 && params === undefined) {
        params = {};
    }
    for (var i = 0; i < keys.length; i++) {
        if (!exports.contains(ignore, keys[i])) {
            exports.assertDefined(params[keys[i]], keys[i]);
        }
    }
};
exports.parseParametersToObject = (params, keys) => {
    if (params === undefined) {
        return {};
    }
    var object = {};
    for (var i = 0; i < keys.length; i++) {
        object[keys[i]] = params[keys[i]];
    }
    return object;
};
exports.contains = (a, obj) => {
    if (a === undefined) {
        return false;
    }
    var i = a.length;
    while (i--) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
};
exports.copy = (obj) => {
    if (null == obj || "object" != typeof obj)
        return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr))
            copy[attr] = obj[attr];
    }
    return copy;
};
exports.mergeInto = (baseObj, additionalProps) => {
    if (null == baseObj || "object" != typeof baseObj)
        return baseObj;
    var merged = baseObj.constructor();
    for (var attr in baseObj) {
        if (baseObj.hasOwnProperty(attr))
            merged[attr] = baseObj[attr];
    }
    if (null == additionalProps || "object" != typeof additionalProps)
        return baseObj;
    for (attr in additionalProps) {
        if (additionalProps.hasOwnProperty(attr))
            merged[attr] = additionalProps[attr];
    }
    return merged;
};
// Completely written by John
const recursivelyModifyKeys = (o, modifier) => {
    var newO = {};
    var origKey, newKey, value;
    if (o instanceof Array) {
        return o.map(function (value) {
            if (typeof value === "object") {
                value = recursivelyModifyKeys(value, modifier);
            }
            return value;
        });
    }
    else {
        for (origKey in o) {
            if (o.hasOwnProperty(origKey)) {
                newKey = (modifier(origKey.charAt(0)) + origKey.slice(1) || origKey).toString();
                value = o[origKey];
                if (value instanceof Array || (value !== null && value.constructor === Object)) {
                    value = recursivelyModifyKeys(value, modifier);
                }
                newO[newKey] = value;
            }
        }
    }
    return newO;
};
exports.jsonToUpper = (o) => recursivelyModifyKeys(o, (str) => str.toUpperCase());
exports.jsonToLower = (o) => recursivelyModifyKeys(o, (str) => str.toLowerCase());
//# sourceMappingURL=utils.js.map