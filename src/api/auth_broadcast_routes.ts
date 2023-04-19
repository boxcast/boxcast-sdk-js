//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { BaseAuthenticatedRoute } from './base_routes';

export default class AuthBroadcastRoutes extends BaseAuthenticatedRoute {
  #fetch: any;

  constructor(fetch: any) {
    super(fetch); // call the constructor of the base class
    this.#fetch = fetch;
  }
  
  get resourceBase() { return 'broadcasts'; }
}
