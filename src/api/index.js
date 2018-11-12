const axios = require('axios');

const API_ROOT = 'https://api.boxcast.com';

function parseList(response) {
  return {
    pagination: JSON.parse(response.headers['x-pagination'] || '{}'),
    data: response.data
  };
}

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
  }
};

export default api;
