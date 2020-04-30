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
    return axios.get(`${API_ROOT}/broadcasts/${broadcastId}/view`, {params}).then((r) => r.data).then((view) => {
      if (view && view.playlist) {
        if (view.status.indexOf('live') < 0 && view.status.indexOf('recorded') < 0) {
          // Not yet ready; shouldn't start looking at this playlist.
          console.log('Playlist not yet ready; status is [', view.status, '] for ', view.playlist);
          view.playlist = '';
        }
      }
      return view;
    });
  }

}
