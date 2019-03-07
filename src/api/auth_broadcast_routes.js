//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { BaseAuthenticatedRoute } from './base_route';

export default class AuthBroadcastRoutes extends BaseAuthenticatedRoute {
  get resourceBase() { return 'broadcasts'; }
}
