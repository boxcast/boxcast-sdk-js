//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import BroadcastRoutes from './broadcast_routes';
import ChannelRoutes from './channel_routes';
import ViewRoutes from './view_routes';
import AuthRoutes from './auth_routes';

const api = {
  // Public API Methods
  broadcasts: new BroadcastRoutes(),
  channels: new ChannelRoutes(),
  views: new ViewRoutes(),
  // Authenticated API Methods
  auth: new AuthRoutes()
};

export default api;
