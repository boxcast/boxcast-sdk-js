//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

const axios = require('axios');
const qs = require('qs');

const API_ROOT = 'https://api.boxcast.com';
const AUTH_ROOT = 'https://auth.boxcast.com';

function parseList(response) {
  return {
    pagination: JSON.parse(response.headers['x-pagination'] || '{}'),
    data: response.data
  };
}

var lastAuthToken = null;

const api = {
  broadcasts: {
    list: function (channelId, params = {}) {
      if (!channelId) {
        return Promise.reject('channelId is required');
      }
      return axios.get(`${API_ROOT}/channels/${channelId}/broadcasts`, {params}).then(parseList);
    },
    get: function (broadcastId) {
      if (!broadcastId) {
        return Promise.reject('broadcastId is required');
      }
      return axios.get(`${API_ROOT}/broadcasts/${broadcastId}`).then((response) => response.data);
    }
  },
  channels: {
    list: function (accountId, params = {}) {
      if (!accountId) {
        return Promise.reject('accountId is required');
      }
      return axios.get(`${API_ROOT}/accounts/${accountId}/channels`, {params}).then(parseList);
    }
  },
  views: {
    get: function (broadcastId, params = {}) {
      if (!broadcastId) {
        return Promise.reject('broadcastId is required');
      }
      return axios.get(`${API_ROOT}/broadcasts/${broadcastId}/view`, {params}).then((response) => response.data);
    }
  },
  auth: {
    authenticate: function (clientId, clientSecret) {
      return axios({
        method: 'post',
        url: `${AUTH_ROOT}/oauth2/token`,
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        data: qs.stringify({grant_type: 'client_credentials', scope: 'owner'}),
        auth: {username: clientId, password: clientSecret},
      }).then((response) => {
        var result = response.data;
        lastAuthToken = result.access_token;
        return result;
      });
    },
    account: function() {
      if (!lastAuthToken) {
        return Promise.reject('Authentication is required');
      }
      return axios.get(`${API_ROOT}/account`, {params}).then((response) => response.data);
    },
  }
};

export default api;
