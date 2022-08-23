//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

/* global describe, it, before */

import chai from 'chai';
import { api } from '../lib/boxcast-sdk.js';

chai.expect();

const expect = chai.expect;

describe('authenticated api integration test', () => {
  let clientId = process.env.BOXCAST_SDK_JS__TEST_CLIENT_ID;
  let clientSecret = process.env.BOXCAST_SDK_JS__TEST_CLIENT_SECRET;

  before(function() {
    if (!clientId || !clientSecret) {
      console.warn('You must set the BOXCAST_SDK_JS__TEST_CLIENT_ID and BOXCAST_SDK_JS__TEST_CLIENT_SECRET environment variables to run authenticated tests.');
      this.skip();
    } else {
      api.auth.logout();
    }
  });

  it('should require auth', (done) => {
    api.auth.account().then(() => {
      throw new Error('should not have succeeded');
    }).catch((err) => {
      expect(err.toString()).to.equal('Authentication is required');
      done();
    });
  });

  it('should support client authentication', (done) => {
    api.auth.authenticate(clientId, clientSecret).then((result) => {
      expect(result.access_token).to.be.not.null;
    }).then(done).catch(done);
  });

  it('should support querying account', (done) => {
    api.auth.authenticate(clientId, clientSecret).then(() => {
      api.auth.account().then((a) => {
        expect(a.id).to.be.not.null;
      }).then(done).catch(done);
    });
  });

  it('should support querying broadcasts', (done) => {
    api.auth.authenticate(clientId, clientSecret).then(() => {
      api.auth.broadcasts.list().then((r) => {
        expect(r.data.length).to.be.gt(0);
      }).then(done).catch(done);
    });
  });

  it('should support querying channels', (done) => {
    api.auth.authenticate(clientId, clientSecret).then(() => {
      api.auth.channels.list().then((r) => {
        expect(r.data.length).to.be.gt(0);
      }).then(done).catch(done);
    });
  });

  it('should support full CRUD', (done) => {
    // Step 1 ... auth
    api.auth.authenticate(clientId, clientSecret).then(() => {
      // Step 2 ... create new channel
      return api.auth.channels.create({name: 'Foo'})
    }).then((channel) => {
      expect(channel.id).to.be.not.null;
      expect(channel.name).to.equal('Foo');
      // Step 3 ... retrieve that channel in full
      return api.auth.channels.get(channel.id);
    }).then((channel) => {
      // Step 4 ... update the channel name
      return api.auth.channels.update(channel.id, {name: 'Bar'});
    }).then((channel) => {
      expect(channel.name).to.equal('Bar');
      // Step 5 ... delete the channel
      return api.auth.channels.destroy(channel.id);
    }).then((response) => {
      expect(true).to.equal(true)
    }).then(done).catch(done);
  });
});
