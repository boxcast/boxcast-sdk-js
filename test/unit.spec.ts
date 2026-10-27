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
  });
});
