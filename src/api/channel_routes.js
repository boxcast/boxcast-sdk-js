//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

const axios = require('axios');

import { API_ROOT } from '../config';
import { parseList } from '../utils';

export default class ChannelRoutes {

  list(accountId, params = {}) {
    if (!accountId) {
      return Promise.reject('accountId is required');
    }
    return axios.get(`${API_ROOT}/accounts/${accountId}/channels`, {params}).then(parseList);
  }

}
