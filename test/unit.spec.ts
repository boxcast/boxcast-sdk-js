//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//
// @ts-nocheck
import fetch from 'node-fetch';
import BoxCastSDK from '../dist/node';

jest.mock('node-fetch', () => jest.fn());

const instance = new BoxCastSDK();
const {api, analytics} = instance;

describe('BoxCast SDK', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    // *
    it('It should instantiate the object', async () => {
      expect(instance).toBeDefined();
    });

  });

  describe('Global Exports', () => {
    it('should export api', () => {
      expect(api).toBeDefined();
    });
    it('should export analytics', () => {
      expect(analytics).toBeDefined();
    });
  });

  describe('api requests', () => {
    const jsonResponse = (body) => ({
      ok: true,
      status: 200,
      headers: { get: (name) => (name.toLowerCase() === 'content-type' ? 'application/json; charset=utf-8' : null) },
      json: async () => body,
    });

    beforeEach(() => {
      fetch.mockReset();
      fetch.mockImplementation(async (url) =>
        jsonResponse(String(url).includes('/oauth2/token') ? { access_token: 'tok-123' } : { status: 'live', playlist: 'p.m3u8' })
      );
    });

    it('views.get sends params as a query string', async () => {
      await api.views.get('b1', { channel_id: 'c1', host: 'example.com' });
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch.mock.calls[0][0]).toBe('https://rest.boxcast.com/broadcasts/b1/view?channel_id=c1&host=example.com');
    });

    it('auth list sends params as a query string', async () => {
      await api.auth.authenticate('client-id', 'client-secret');
      fetch.mockClear();
      await api.auth.broadcasts.list({ q: 'timeframe:current', l: 5 });
      await api.auth.channels.list({ s: 'name' });
      api.auth.logout();
      expect(fetch.mock.calls.map((call) => call[0])).toEqual([
        'https://rest.boxcast.com/broadcasts?q=timeframe%3Acurrent&l=5',
        'https://rest.boxcast.com/account/channels?s=name',
      ]);
      expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer tok-123');
    });

    it('auth routes reject without a request when not authenticated', async () => {
      api.auth.logout();
      const calls = [
        () => api.auth.broadcasts.list(),
        () => api.auth.broadcasts.get('b1'),
        () => api.auth.broadcasts.create({ name: 'x' }),
        () => api.auth.broadcasts.update('b1', { name: 'y' }),
        () => api.auth.broadcasts.destroy('b1'),
        () => api.auth.channels.list(),
        () => api.auth.channels.get('c1'),
      ];
      for (const call of calls) {
        await expect(call()).rejects.toThrow('Authentication is required');
      }
      expect(fetch).not.toHaveBeenCalled();
    });
  });
});
