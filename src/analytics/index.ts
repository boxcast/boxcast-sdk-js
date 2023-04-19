//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//
/* global NPM_VERSION */
/* eslint camelcase: 0 */
// @ts-nocheck

import platform from 'platform';
import Html5VideoAnalytics from './html5';
import VideoJsAnalytics from './videojs';
import ChromecastAnalytics from './chromecast';
import ReactNativeVideoAnalytics from './react-native-video';

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

export class analytics {
  #fetch: any;

  constructor(fetch: any) {
    this.#fetch = fetch;
  }

  public configure = (params) => {
    OVERRIDE_STATE = params;
    return this;
  }

  public getState = () => {
    var browserState = {
      host: guessHost(),
      os: guessOS(),
      browser_name: platform.name,
      browser_version: platform.version,
      player_version: `boxcast-sdk-js v${process.env.NPM_VERSION}`
    };

    return Object.assign({}, browserState, OVERRIDE_STATE);
  }

  public mode = (mode) => {
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
  
}



export default analytics;
