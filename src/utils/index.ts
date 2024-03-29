//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import Clock from './clock';
export { Clock };

import MonotonicClock from './monotonic_clock';
export { MonotonicClock };

import { STATE } from "../state";

// /* eslint max-len: 0 */

export function getStorage() {
  try {
    try {
      localStorage.setItem('__sentinel__', 'foo');
      if (localStorage.getItem('__sentinel__') === 'foo') {
        localStorage.removeItem('__sentinel__');
        return localStorage;
      }
      return sessionStorage;
    } catch (e) {
      // Possible DOMException reading localStorage; try sessionStorage
      return sessionStorage;
    }
  } catch (e) {
    // Possible DOMException reading sessionStorage; use in-memory mock
    const mockStorage = {
      getItem: function(key) {
        return this[key];
      },
      setItem: function(key, value) {
        this[key] = value;
      }
    };
    return mockStorage;
  }
}

export function uuid() {
  var r = function(n) {
    var text = '',
      possible = '0123456789ABCDEF';
    for (var i = 0; i < 5; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };
  return r(8) + '-' + r(4) + '-' + r(4) + '-' + r(4) + '-' + r(12);
}

export function cleanQuotesFromViewerID(viewerId) {
  if (!viewerId || viewerId.length < 3) {
    return viewerId || '';
  }
  if (viewerId[0] === '"' && viewerId[viewerId.length - 1] === '"') {
    return viewerId.substring(1, viewerId.length - 1);
  }
  return viewerId;
}

export function normalizeError(error, source) {
  // This error object could come from various sources, depending on playback
  // and circumstance:
  //   a) string error description
  //   b) dictionary with `message` and `data` keys
  //   c) dictionary with `evt` and `data` keys from hls.js, where `data` is an object with `type`, `details`, and a whole bunch of other keys
  //   d) error object from native HTML5 video element
  //
  // Please note, per the HTML5 spec, these are the following error code values:
  //   MEDIA_ERR_ABORTED (1) The fetching process for the media resource was aborted by the user agent at the user's request.
  //   MEDIA_ERR_NETWORK (2) A network error of some description caused the user agent to stop fetching the media resource, after the resource was established to be usable.
  //   MEDIA_ERR_DECODE (3) An error of some description occurred while decoding the media resource, after the resource was established to be usable.
  //   MEDIA_ERR_SRC_NOT_SUPPORTED (4) The media resource indicated by the src attribute was not suitable.
  //
  // Let's try to normalize the reported error a touch
  error = error || {};
  const code = (error.code) || (error.data && error.data.code);
  let message = error.message;
  if (!message && error.data) {
    message = error.data.details /* hlsError, cannot be stringified */ || JSON.stringify(error.data);
  } else {
    message = error.toString();
  }
  if (message === '[object MediaError]') {
    message = 'MediaError occurred';
  }
  let errorObject = {
    message: message,
    code: code,
    data: error.data
  } as {
    message: string,
    code: string,
    data: Record<string, unknown>,
    source?: unknown
  };
  if (source) {
    errorObject.source = source;
  }
  return errorObject;
}

export function normalizeAxiosError(error) {
  // Error could be nil, or it could be a response-like object, or it could
  // contain a nested response :(
  if (!error) {
    return 'Unknown error';
  } else if (error.response && error.response.data) {
    return error.response.data;
  } else if (error.data) {
    return error.data;
  }
  return error;
}

export async function parseFetchedList(response) {
  const isJsonResponse = response.headers?.get('content-type') && response.headers?.get('content-type').indexOf('application/json') == 0;
  let pagination = JSON.parse(response.headers?.get('x-pagination') || "{}");
  let obj = {
    pagination,
  } as { pagination: { total: number; next: number; last: number }; data: {} };
  obj.data = isJsonResponse ? await response.json() : response;
  return obj;
}

export function authHeaders() {
  return {
    Authorization: `Bearer ${STATE.lastAuthToken}`,
  };
}
