//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

/* global describe, it, before */

import chai from 'chai';
import { analytics } from '../lib/boxcast-sdk.js';

chai.expect();

const expect = chai.expect;

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
  it('should handle buffering events', (done) => {
    // Mock the video.addEventListener function to manually fire events
    var mockEventListeners = {};
    function mockAddEventListener(evtName, callback) {
      mockEventListeners[evtName] = callback;
    }
    var video = document.createElement('video');
    video.addEventListener = mockAddEventListener;

    // Wire up the analytics implementation
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

    // Mock the analytics._report function to track order of calls
    var mockReportCalls = [];
    function mockReport(action) {
      mockReportCalls.push(action);
    }
    impl._report = mockReport;

    // Now simulate normal playback behavior
    mockEventListeners['play']();
    mockEventListeners['playing']();
    expect(impl.isPlaying).to.be.true;
    expect(impl.isBuffering).to.be.false;
    expect(mockReportCalls).to.deep.equal(['play']);
    mockReportCalls = [];

    // Now simulate buffering
    mockEventListeners['stalled']();
    expect(impl.isBuffering).to.be.true;
    expect(mockReportCalls.length).to.equal(0); // should be delayed
    setTimeout(() => {
      expect(mockReportCalls).to.deep.equal(['buffer']);
      done();
    }, 600);
  });
});
