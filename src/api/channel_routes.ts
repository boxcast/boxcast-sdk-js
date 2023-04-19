//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//
import qs from 'qs';
import { API_ROOT } from '../config';
import { parseFetchedList } from '../utils';

export default class ChannelRoutes {
  #fetch: any;

  constructor(fetch: any) {
    this.#fetch = fetch;
  }

  async list(accountId, params = {}) {
    if (!accountId) {
      return Promise.reject('accountId is required');
    }
    const res = await this.#fetch(
      `${API_ROOT}/accounts/${accountId}/channels?${qs.stringify(params)}`
    );
    return await parseFetchedList(res);
  }
}
