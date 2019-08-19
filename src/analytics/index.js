//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

/* global NPM_VERSION */
/* eslint camelcase: 0 */

const platform = require('platform');
const Html5VideoAnalytics = require('./html5.js');
const VideoJsAnalytics = require('./videojs.js');
const ChromecastAnalytics = require('./chromecast.js');
const ReactNativeVideoAnalytics = require('./react-native-video.js');

var OVERRIDE_STATE = {};

function guessHost() {
  try {
    return window.location.hostname;
  } catch (e) {
    return '';
  }
}

function guessOS() {
  return (platform.os || '').toString();
}

const analytics = {
  configure: function(params) {
    OVERRIDE_STATE = params;
    return this;
  },
  getState: function() {
    var browserState = {
      host: guessHost(),
      os: guessOS(),
      browser_name: platform.name,
      browser_version: platform.version,
      player_version: `boxcast-sdk-js v${NPM_VERSION}`
    };

    return Object.assign({}, browserState, OVERRIDE_STATE);
  },
  mode: function(mode) {
    switch (mode) {
      case 'html5':
        return new Html5VideoAnalytics(this.getState());
      case 'video.js':
        return new VideoJsAnalytics(this.getState());
      case 'chromecast':
        return new ChromecastAnalytics(this.getState());
      case 'react-native-video':
        return new ReactNativeVideoAnalytics(this.getState());
    }
    throw Error(`Mode ${mode} not supported`);
  }
};

export default analytics;
