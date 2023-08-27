//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//
import qs from 'qs';
import base64 from 'base-64';
import { API_ROOT, AUTH_ROOT } from '../config';
import { STATE } from '../state';
import { authHeaders } from '../utils';
import AuthBroadcastRoutes from './auth_broadcast_routes';
import AuthChannelRoutes from './auth_channel_routes';

export default class AuthenticatedRoutes {
  #fetch: any;

  constructor(fetch: any) {
    this.#fetch = fetch;
  }

  logout() {
    STATE.lastAuthToken = null;
  }

  async authenticate(clientId, clientSecret) {
    try {
      const body = new URLSearchParams({
        'grant_type': 'client_credentials',
        'scope': 'owner'
      });

      const response = await this.#fetch(`${AUTH_ROOT}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${base64.encode(`${clientId}:${clientSecret}`)}`
        },
        body
      });
      const result = await response.json();
      STATE.lastAuthToken = result.access_token;
      return result;
    } catch (error) {
      console.error('Error authenticating:', error);
      throw error;
    }
  }

  setToken(token: string) {
    STATE.lastAuthToken = token;
  }

  async account() {
    try {
      if (!STATE.lastAuthToken) {
        throw new Error('Authentication is required');
      }
      const response = await this.#fetch(`${API_ROOT}/account`, {
        headers: authHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching account:', error);
      throw error;
    }
  }

  get token(): string {
    return STATE.lastAuthToken;
  }

  get broadcasts() {
    return new AuthBroadcastRoutes(this.#fetch);
  }

  get channels() {
    return new AuthChannelRoutes(this.#fetch);
  }
}
