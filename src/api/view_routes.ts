//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { API_ROOT } from '../config';

export default class ViewRoutes {
  #fetch: any;

  constructor(fetch: any) {
    this.#fetch = fetch;
  }

  async get(broadcastId, params = {}) {
    if (!broadcastId) {
      return Promise.reject('broadcastId is required');
    }

    try {
      const response = await this.#fetch(`${API_ROOT}/broadcasts/${broadcastId}/view`, {params});
      const view = await response.json();
      if (view && view.playlist) {
        if (view.status.indexOf('live') < 0 && view.status.indexOf('recorded') < 0) {
          // Not yet ready; shouldn't start looking at this playlist.
          console.log('Playlist not yet ready; status is [', view.status, '] for ', view.playlist);
          view.playlist = '';
        }
      }
      return view;
    } catch (error) {
      return Promise.reject(error);
    }
  }

}
