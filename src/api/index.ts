//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import BroadcastRoutes from "./broadcast_routes";
import ChannelRoutes from './channel_routes';
import ViewRoutes from './view_routes';
import AuthRoutes from './auth_routes';

export class api {
  #fetch: any;
  public readonly broadcasts: any;
  public readonly channels: any;
  public readonly auth: any;
  public readonly views: any;

  constructor(fetch: any) {
    this.#fetch = fetch;
    this.broadcasts = new BroadcastRoutes(this.#fetch);
    this.channels = new ChannelRoutes(this.#fetch);
    this.auth = new AuthRoutes(this.#fetch);
    this.views = new ViewRoutes(this.#fetch);
  }
}

export default api;
