//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

/* global describe, it, before */

import BoxCastSDK from '../dist/node';

const instance = new BoxCastSDK();
const { api, analytics } = instance;

describe('authenticated api integration test', () => {
  let clientId = process.env.BOXCAST_SDK_JS__TEST_CLIENT_ID;
  let clientSecret = process.env.BOXCAST_SDK_JS__TEST_CLIENT_SECRET;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(function() {
    if (!clientId || !clientSecret) {
      console.warn('You must set the BOXCAST_SDK_JS__TEST_CLIENT_ID and BOXCAST_SDK_JS__TEST_CLIENT_SECRET environment variables to run authenticated tests.');
      this.skip();
    } else {
      api.auth.logout();
    }
  });

  it('should require auth', async () => {
    await expect(api.auth.account()).rejects.toThrow('Authentication is required');
  });

  it('should support client authentication', async () => {
    const result = await api.auth.authenticate(clientId, clientSecret);
    expect(result.access_token).not.toBeNull();
  });

  it('should support querying account', async () => {
    await api.auth.authenticate(clientId, clientSecret);
    const a = await api.auth.account();
    expect(a.error).not.toEqual('unauthorized'); // request should be authorized
    expect(a.error).toBeUndefined(); // there should be no errors
    expect(a.id).not.toBeNull(); // should return an ID
  });

  it('should support querying broadcasts', async () => {
    await api.auth.authenticate(clientId, clientSecret);
    const r = await api.auth.broadcasts.list();
    expect(r.data.length).toBeGreaterThan(0);
  });

  it('should support querying channels', async () => {
    await api.auth.authenticate(clientId, clientSecret);
    const r = await api.auth.channels.list();
    expect(r.data.length).toBeGreaterThan(0);
  });

  it('should support full CRUD', async () => {
    // Step 1 ... auth
    await api.auth.authenticate(clientId, clientSecret);
    // Step 2 ... create new channel
    const channel = await api.auth.channels.create({name: 'Foo'});
    expect(channel.error).not.toEqual('unauthorized'); // request should be authorized
    expect(channel.error).not.toEqual('unprocessable_entity'); // request should be valid
    expect(channel.error).toBeUndefined(); // there should be no errors
    expect(channel.id).not.toBeNull();
    expect(channel.name).toEqual('Foo');
    // Step 3 ... retrieve that channel in full
    const retrievedChannel = await api.auth.channels.get(channel.id);
    // Step 4 ... update the channel name
    const updatedChannel = await api.auth.channels.update(channel.id, {name: 'Bar'});
    expect(updatedChannel.name).toEqual('Bar');
    // Step 5 ... delete the channel
    const response = await api.auth.channels.destroy(channel.id);
    expect(true).toEqual(true);
  });
});

