//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { API_ROOT } from "../config";
import { authHeaders, parseFetchedList } from "../utils";

export class BaseAuthenticatedRoute {
  public headers;
  #fetch: any;

  get resourceBase(): string | void {
    throw new Error("NotImplemented");
  }
  
  constructor(fetch) {
    this.#fetch = fetch;
  }

  async list(params = {}) {
    try {
      const response = await this.#fetch(
        `${API_ROOT}/${this.resourceBase}`,
        {
          method: 'GET',
          headers: {...authHeaders(), ...{'Content-Type': 'application/json'}},
        }
      );
      return parseFetchedList(response);
    } catch (error) {
      throw new Error(`Error in list: ${error.message}`);
    }
  }

  async get(id) {
    if (!id) {
      throw new Error('id is required');
    }
    try {
      const response = await this.#fetch(
        `${API_ROOT}/${this.resourceBase}/${id}`,
        {
          method: 'GET',
          headers: {...authHeaders(), ...{'Content-Type': 'application/json'}},
        }
      );
      return response.headers.get('content-type') == 'application/json; charset=utf-8' ? response.json() : response;
    } catch (error) {
      throw new Error(`Error in get: ${error.message}`);
    }
  }

  async create(params = {}) {
    try {
      const response = await this.#fetch(
        `${API_ROOT}/${this.resourceBase}`,
        {
          method: 'POST',
          headers: {...authHeaders(), ...{'Content-Type': 'application/json'}},
          body: JSON.stringify(params),
        }
      );
      return response.headers.get('content-type') == 'application/json; charset=utf-8' ? response.json() : response;
    } catch (error) {
      throw new Error(`Error in create: ${error.message}`);
    }
  }

  async update(id, params = {}) {
    if (!id) {
      throw new Error('id is required');
    }
    try {
      const response = await this.#fetch(
        `${API_ROOT}/${this.resourceBase}/${id}`,
        {
          method: 'PUT',
          headers: {...authHeaders(), ...{'Content-Type': 'application/json'}},
          body: JSON.stringify(params),
        }
      );
      return response.headers.get('content-type') == 'application/json; charset=utf-8' ? response.json() : response;
    } catch (error) {
      throw new Error(`Error in update: ${error.message}`);
    }
  }

  async destroy(id) {
    if (!id) {
      throw new Error('id is required');
    }
    try {
      const response = await this.#fetch(
        `${API_ROOT}/${this.resourceBase}/${id}`,
        {
          method: 'DELETE',
          headers: {...authHeaders(), ...{'Content-Type': 'application/json'}},
        }
      );
      return response.headers.get('content-type') == 'application/json; charset=utf-8' ? response.json() : response;
    } catch (error) {
      throw new Error(`Error in destroy: ${error.message}`);
    }
  }
}
