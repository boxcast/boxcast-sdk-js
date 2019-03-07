//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

const axios = require('axios');

import { API_ROOT } from '../config';
import { parseList } from '../utils';

export default class AuthChannelRoutes {

  constructor(headers) {
    this.headers = headers;
  }

  list(params = {}) {
    var headers = Object.assign({params}, this.headers);
    return axios.get(`${API_ROOT}/account/channels`, headers).then(parseList);
  }

  get(channelId) {
    if (!channelId) {
      return Promise.reject('channelId is required');
    }
    return axios.get(`${API_ROOT}/channels/${channelId}`, this.headers).then((r) => r.data);
  }

}
