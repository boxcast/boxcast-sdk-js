//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

const axios = require('axios');

import { API_ROOT } from '../config';
import { parseList } from '../utils';

export default class BroadcastRoutes {

  list(channelId, params = {}) {
    if (!channelId) {
      return Promise.reject('channelId is required');
    }
    return axios.get(`${API_ROOT}/channels/${channelId}/broadcasts`, {params}).then(parseList);
  }

  get(broadcastId) {
    if (!broadcastId) {
      return Promise.reject('broadcastId is required');
    }
    return axios.get(`${API_ROOT}/broadcasts/${broadcastId}`).then((r) => r.data);
  }

}
