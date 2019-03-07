//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

const axios = require('axios');

import { API_ROOT } from '../config';

export default class ViewRoutes {

  get(broadcastId, params = {}) {
    if (!broadcastId) {
      return Promise.reject('broadcastId is required');
    }
    return axios.get(`${API_ROOT}/broadcasts/${broadcastId}/view`, {params}).then((r) => r.data);
  }

}
