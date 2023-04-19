//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { api } from './api';
import { analytics } from './analytics';

export class Main {
  #fetch: any;
  
  public readonly api: any;
  public readonly analytics: any;

  constructor(fetch: any) {
    this.#fetch = fetch;
    this.api = new api(this.#fetch);
    this.analytics = new analytics(this.#fetch);
  }

}