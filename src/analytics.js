/* eslint camelcase: 0 */
/* eslint no-unused-vars: 0 */

var DEFAULT_PARAMETERS = {
  host: window.location.hostname,
  os: '',
  browser_name: '',
  browser_version: '',
  player_version: ''
};

class Html5VideoAnalytics {
  attach(params) {
    const { player, broadcast, channel_id } = params;
  }
}

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
