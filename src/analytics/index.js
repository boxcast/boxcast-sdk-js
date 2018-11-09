/* eslint camelcase: 0 */
/* eslint no-unused-vars: 0 */
const Html5VideoAnalytics = require('./html5.js');

var DEFAULT_PARAMETERS = {
  host: window.location.hostname,
  os: '',
  browser_name: '',
  browser_version: '',
  player_version: ''
};

const analytics = {
  configure: function(params) {
    const { host, os, browser_name, browser_version, player_version } = params;
  },
  mode: function(mode) {
    switch (mode) {
      case 'html5':
        return new Html5VideoAnalytics();
    }
    throw Error(`Mode ${mode} not supported`);
  }
};

export default analytics;
