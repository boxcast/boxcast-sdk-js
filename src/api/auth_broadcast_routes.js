//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

const axios = require('axios');

import { API_ROOT } from '../config';
import { parseList } from '../utils';

export default class AuthBroadcastRoutes {

  constructor(headers) {
    this.headers = headers;
  }

  list(params = {}) {
    var headers = Object.assign({params}, this.headers);
    return axios.get(`${API_ROOT}/broadcasts`, headers).then(parseList);
  }

  get(broadcastId) {
    if (!broadcastId) {
      return Promise.reject('broadcastId is required');
    }
    return axios.get(`${API_ROOT}/broadcasts/${broadcastId}`, this.headers).then((r) => r.data);
  }

}
