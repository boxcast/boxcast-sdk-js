/* global NPM_VERSION */
/* eslint camelcase: 0 */
/* eslint no-unused-vars: 0 */
const platform = require('platform');
const Html5VideoAnalytics = require('./html5.js');

var OVERRIDE_STATE = {
};

const analytics = {
  configure: function(params) {
    OVERRIDE_STATE = params;
    return this;
  },
  getState: function() {
    var browserState = {
      host: window.location.hostname,
      os: (platform.os || '').toString(),
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
    }
    throw Error(`Mode ${mode} not supported`);
  }
};

export default analytics;
