//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

/* global describe, it, before */

import chai from 'chai';
import { api, analytics } from '../lib/boxcast-sdk.js';

chai.expect();

const expect = chai.expect;

describe('BoxCast SDK Global Exports', () => {
  it('should export api', () => {
    expect(api).to.be.not.null;
  });
  it('should export analytics', () => {
    expect(analytics).to.be.not.null;
  });
});

describe('analytics', () => {
  it('should allow global configuration overrides', () => {
    analytics.configure({
      host: 'My Custom App',
      player_version: 'my-player v2.3'
    });
    var state = analytics.getState();
    expect(state.host).to.equal('My Custom App');
    expect(state.player_version).to.equal('my-player v2.3');
  });
  it('should provide an HTML5 <video> engine', () => {
    var video = document.createElement('video');
    var impl = analytics.mode('html5');
    impl.attach({
      video: video,
      broadcast: {
        account_id: 'a1000',
        channel_id: 'c1000',
        id: 'b1000',
        timeframe: 'past'
      }
    });
    expect(impl.isPlaying).to.be.false;
    expect(impl.isBuffering).to.be.false;
  });
  it('should provide a Video.JS engine', () => {
    var player = {
      on: (evt, callback) => {},
      currentTime: () => 42.0,
      videoHeight: () => 1080
    };
    var impl = analytics.mode('video.js');
    impl.attach({
      player: player,
      broadcast: {
        account_id: 'a1000',
        channel_id: 'c1000',
        id: 'b1000',
        timeframe: 'past'
      }
    });
    expect(impl.isPlaying).to.be.false;
    expect(impl.isBuffering).to.be.false;
  });
  it('should provide a ChromeCast engine', () => {
    window.cast = {
      framework: {
        PlaybackConfig: function() {},
        events: {
          EventType: {},
        }
      }
    };
    var castOptions = {};
    var broadcastInfo = {
      account_id: 'a1000',
      channel_id: 'c1000',
      id: 'b1000',
      timeframe: 'past'
    };
    var playerManager = {
      setMediaPlaybackInfoHandler: (handler) => {
        setTimeout(() => handler({media: {customData: {type: 'BOXCAST_METADATA', data: broadcastInfo}}}), 0);
      },
      getPlaybackConfig: () => ({}),
      addEventListener: (evt, callback) => {},
      getCurrentTimeSec: () => 42.0,
    };
    var impl = analytics.mode('chromecast');
    impl.attach({
      playerManager: playerManager,
      broadcastInfo: {},
    });
    expect(impl.isPlaying).to.be.false;
    expect(impl.isBuffering).to.be.false;
  });
});

describe('api integration test', () => {
  it('should list account channels', (done) => {
    api.channels.list('DEMODEMO', {s: 'name', l: '2'}).then((r) => {
      expect(r.pagination).to.be.not.null;
      expect(r.pagination.next).to.equal(1);
      expect(r.data.length).to.equal(2);
    }).then(done).catch(done);
  });
  it('should list broadcasts in a public channel', (done) => {
    api.broadcasts.list('0xQfGiFHjz3YBfO3o1jd', {s: 'name', l: '5'}).then((r) => {
      expect(r.pagination).to.be.not.null;
      expect(r.pagination.next).to.equal(1);
      expect(r.data.length).to.equal(5);
    }).then(done).catch(done);
  });
  it('should get a single broadcast', (done) => {
    api.broadcasts.get('v81f5pzf7uc7btw7uo6p').then((b) => {
      expect(b.id).to.equal('v81f5pzf7uc7btw7uo6p');
      expect(b.timeframe).to.equal('past');
    }).then(done).catch(done);
  });
  it('should get a single broadcast view', (done) => {
    api.views.get('v81f5pzf7uc7btw7uo6p', {extended: true, host: 'example.com'}).then((v) => {
      expect(v.status).to.equal('recorded');
      expect(v.playlist).to.be.not.null;
    }).then(done).catch(done);
  });
});

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
