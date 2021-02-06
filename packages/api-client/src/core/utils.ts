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

export const assertDefined = <TRes>(object: any, name: string) : TRes => {
  if (object === undefined) {
    throw name + ' must be defined';
  } else {
    return object as TRes;
  }
};
export const assertParametersDefined = (params: any, keys: string[], ignore: string[]) : any => {
  if (keys === undefined) {
    return;
  }
  if (keys.length > 0 && params === undefined) {
    params = {};
  }
  for (var i = 0; i < keys.length; i++) {
    if(!contains(ignore, keys[i])) {
      assertDefined(params[keys[i]], keys[i]);
    }
  }
};

export const parseParametersToObject = (params: any, keys: string[]) : any => {
  if (params === undefined) {
    return {};
  }
  var object : any = { };
  for (var i = 0; i < keys.length; i++) {
    object[keys[i]] = params[keys[i]];
  }
  return object;
};

export const contains = (a: any[], obj: any) : boolean => {
  if(a === undefined) { return false;}
  var i = a.length;
  while (i--) {
    if (a[i] === obj) {
      return true;
    }
  }
  return false;
}

export const copy = (obj: any) : any => {
  if (null == obj || "object" != typeof obj) return obj;
  var copy = obj.constructor();
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
  }
  return copy;
};

export const mergeInto = (baseObj: any, additionalProps: any) : any => {
  if (null == baseObj || "object" != typeof baseObj) return baseObj;
  var merged = baseObj.constructor();
  for (var attr in baseObj) {
    if (baseObj.hasOwnProperty(attr)) merged[attr] = baseObj[attr];
  }
  if (null == additionalProps || "object" != typeof additionalProps) return baseObj;
  for (attr in additionalProps) {
    if (additionalProps.hasOwnProperty(attr)) merged[attr] = additionalProps[attr];
  }
  return merged;
}


// Completely written by John

const recursivelyModifyKeys = (o: any, modifier: (s: string) => string) : any => {
  var newO : {
    [index: string]: any
  } = {};
  var origKey, newKey, value
  if (o instanceof Array) {
    return o.map(function(value) {
        if (typeof value === "object") {
          value = recursivelyModifyKeys(value, modifier)
        }
        return value
    })
  } else {
    for (origKey in o) {
      if (o.hasOwnProperty(origKey)) {
        newKey = (modifier(origKey.charAt(0)) + origKey.slice(1) || origKey).toString()
        value = o[origKey]
        if (value instanceof Array || (value !== null && value.constructor === Object)) {
          value = recursivelyModifyKeys(value, modifier)
        }
        newO[newKey] = value
      }
    }
  }
  return newO
}

export const jsonToUpper = (o: any) : any => recursivelyModifyKeys(o, (str) => str.toUpperCase());
export const jsonToLower = (o: any) : any => recursivelyModifyKeys(o, (str) => str.toLowerCase());