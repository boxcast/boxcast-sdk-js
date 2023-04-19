//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//
import BoxCastSDK from '../dist/node';

const instance = new BoxCastSDK();
const { api, analytics } = instance;

describe('api integration test', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should list account channels', async () => {
    const r = await api.channels.list('DEMODEMO', { s: 'name', l: '2' });
    expect(r.pagination).toBeDefined();
    expect(r.pagination.next).toBe(1);
    expect(r.data.length).toBe(2);
  });

  describe('broadcasts list', () => {
    it('should list broadcasts in a public channel', async () => {
      const r = await api.broadcasts.list('0xQfGiFHjz3YBfO3o1jd', {
        s: 'name',
        l: '5'
      });
      expect(r.pagination).toBeDefined();
      expect(r.pagination.next).toBe(1);
      expect(r.data.length).toBe(5);
    });
  });

  describe('broadcasts get', () => {
    it('should get a single broadcast', async () => {
      const b = await api.broadcasts.get('v81f5pzf7uc7btw7uo6p');
      expect(b.id).toBe('v81f5pzf7uc7btw7uo6p');
      expect(b.timeframe).toBe('past');
    });
  });

  describe('views get', () => {
    it('should get a single broadcast view', async () => {
      const v = await api.views.get('v81f5pzf7uc7btw7uo6p', {
        extended: true,
        host: 'example.com'
      });
      expect(v.status).toBe('recorded');
      expect(v.playlist).toBeDefined();
    });
  });
});
