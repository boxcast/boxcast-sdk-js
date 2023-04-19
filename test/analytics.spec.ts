//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//
// @ts-nocheck
import BoxCastSDK from '../dist/node';
import { JSDOM } from 'jsdom';

const instance = new BoxCastSDK();
const { api, analytics } = instance;

/**
 * These lines create a testable document and window object
 */
const { window } = new JSDOM('<!doctype html><html><body></body></html>');
global.window = window;
global.document = window.document;

// jsdom enables a testable document and window object
/**
 * @jest-environment jsdom
 */
describe('analytics', () => {
  it('should allow global configuration overrides', () => {
    analytics.configure({
      host: 'My Custom App',
      player_version: 'my-player v2.3'
    });
    const state = analytics.getState();
    expect(state.host).toEqual('My Custom App');
    expect(state.player_version).toEqual('my-player v2.3');
  });
  it('should provide an HTML5 <video> engine', () => {
    const { window } = new JSDOM('<!doctype html><html><body></body></html>');
    global.window = window;
    global.document = window.document;
    const video = document.createElement('video');
    const impl = analytics.mode('html5');
    impl.attach({
      video: video,
      broadcast: {
        account_id: 'a1000',
        channel_id: 'c1000',
        id: 'b1000',
        timeframe: 'past'
      }
    });
    expect(impl.isPlaying).toBe(false);
    expect(impl.isBuffering).toBe(false);
    impl.detach();
    expect(Object.keys(impl.listeners).length).toEqual(0);
  });
  it('should provide an HTML5 <video> engine', () => {
    const video = document.createElement('video');
    const impl = analytics.mode('html5');
    impl.attach({
      video: video,
      broadcast: {
        account_id: 'a1000',
        channel_id: 'c1000',
        id: 'b1000',
        timeframe: 'past'
      }
    });
    expect(impl.isPlaying).toBe(false);
    expect(impl.isBuffering).toBe(false);
    impl.detach();
    expect(Object.keys(impl.listeners).length).toEqual(0);
  });

  it('should provide a Video.JS engine', () => {
    const player = {
      on: (evt, callback) => {},
      off: (evt, callback) => {},
      currentTime: () => 42.0,
      videoHeight: () => 1080
    };
    const impl = analytics.mode('video.js');
    impl.attach({
      player: player,
      broadcast: {
        account_id: 'a1000',
        channel_id: 'c1000',
        id: 'b1000',
        timeframe: 'past'
      }
    });
    expect(impl.isPlaying).toBe(false);
    expect(impl.isBuffering).toBe(false);
    impl.detach();
    expect(Object.keys(impl.listeners).length).toEqual(0);
  });

  it('should provide a ChromeCast engine', () => {
    global.window.cast = {
      framework: {
        PlaybackConfig: function () {},
        events: {
          EventType: {}
        }
      }
    };
    const castOptions = {};
    const broadcastInfo = {
      account_id: 'a1000',
      channel_id: 'c1000',
      id: 'b1000',
      timeframe: 'past'
    };
    const playerManager = {
      setMediaPlaybackInfoHandler: (handler) => {
        setTimeout(
          () =>
            handler({
              media: {
                customData: { type: 'BOXCAST_METADATA', data: broadcastInfo }
              }
            }),
          0
        );
      },
      getPlaybackConfig: () => ({}),
      addEventListener: (evt, callback) => {},
      getCurrentTimeSec: () => 42.0
    };
    const impl = analytics.mode('chromecast');
    impl.attach({
      playerManager: playerManager,
      broadcastInfo: {}
    });
    expect(impl.isPlaying).toBe(false);
    expect(impl.isBuffering).toBe(false);
  });

  it('should handle buffering events', (done) => {
    // Mock the video.addEventListener function to manually fire events
    const mockEventListeners = {};
    function mockAddEventListener(evtName, callback) {
      mockEventListeners[evtName] = callback;
    }
    const video = window.document.createElement('video');
    video.addEventListener = mockAddEventListener;

    // Wire up the analytics implementation
    const impl = analytics.mode('html5');
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
    const mockReportCalls = [];
    function mockReport(action) {
      mockReportCalls.push(action);
    }
    impl._report = mockReport;

    // Now simulate normal playback behavior
    mockEventListeners['play']();
    mockEventListeners['playing']();
    expect(impl.isPlaying).toBe(true);
    expect(impl.isBuffering).toBe(false);
    expect(mockReportCalls).toEqual(['play']);
    mockReportCalls.length = 0;

    // Now simulate buffering
    mockEventListeners['stalled']();
    expect(impl.isBuffering).toBe(true);
    expect(mockReportCalls.length).toBe(0); // should be delayed
    setTimeout(() => {
      expect(mockReportCalls).toEqual(['buffer']);
      done();
    }, 600);
  });

});
