//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//
import qs from 'qs';
import { API_ROOT } from '../config';
import { parseFetchedList } from '../utils';

export default class BroadcastRoutes {
  #fetch: any;

  constructor(fetch: any) {
    this.#fetch = fetch;
  }

  async list(channelId, params = {}) {
    if (!channelId) {
      return Promise.reject('channelId is required');
    }
    const res = await this.#fetch(`${API_ROOT}/channels/${channelId}/broadcasts?${qs.stringify(params)}`);
    return await parseFetchedList(res);
  }

  async get(broadcastId) {
    if (!broadcastId) {
      return Promise.reject('broadcastId is required');
    }
    const res = await this.#fetch(`${API_ROOT}/broadcasts/${broadcastId}`);
    return await res.json();
  }
}
