//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

const axios = require('axios');
const qs = require('qs');

import { API_ROOT, AUTH_ROOT } from '../config';
import { STATE } from '../state';
import { authHeaders } from '../utils';
import AuthBroadcastRoutes from './auth_broadcast_routes';
import AuthChannelRoutes from './auth_channel_routes';

export default class AuthenticatedRoutes {

  logout() {
    STATE.lastAuthToken = null;
  }

  authenticate(clientId, clientSecret) {
    return axios({
      method: 'post',
      url: `${AUTH_ROOT}/oauth2/token`,
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: qs.stringify({
        'grant_type': 'client_credentials',
        'scope': 'owner'
      }),
      auth: {
        'username': clientId,
        'password': clientSecret
      }
    }).then((response) => {
      var result = response.data;
      STATE.lastAuthToken = result.access_token;
      return result;
    });
  }

  account() {
    if (!STATE.lastAuthToken) {
      return Promise.reject('Authentication is required');
    }
    return axios.get(`${API_ROOT}/account`, authHeaders()).then((r) => r.data);
  }

  get broadcasts() {
    return new AuthBroadcastRoutes(authHeaders());
  }

  get channels() {
    return new AuthChannelRoutes(authHeaders());
  }

}
