/* eslint camelcase: 0 */
/* eslint no-unused-vars: 0 */
const { uuid, normalizeError, getStorage } = require('../utils');
const axios = require('axios');

const METRICS_URL = 'https://metrics.boxcast.com/player/interaction';
const PLAYING_STATES = 'play'.split(' ');
const STOPPED_STATES = 'pause buffer idle stop complete error'.split(' ');
const TIME_REPORT_INTERVAL_MS = 60000;

const storage = getStorage();

export default class Html5VideoAnalytics {
  constructor(state) {
    this.browserState = state;
    this._queue = [];
  }

  attach(params) {
    const { player, broadcast, channel_id } = params;

    this.player = player;
    this.broadcastInfo = {
      channel_id: channel_id || broadcast.channel_id,
      account_id: broadcast.account_id,
      is_live: (broadcast.timeframe === 'current'),
      broadcast_id: broadcast.id
    };
    this.lastReportAt = null;
    this.lastBufferStart = null;
    this.isPlaying = false;
    this.isBuffering = false;
    this.durationPlaying = 0;
    this.durationBuffering = 0;
    this.currentLevelHeight = 0;
    this.headers = {};
    this.position = 0;

    this._wireEvents(this.player);

    return this;
  }

  _wireEvents(v) {
    v.addEventListener('ended', () => {
      this._handleNormalOperation();
      this._report('complete');
      this._handleBufferingEnd();
    }, true);
    v.addEventListener('error', () => {
      this._handlePlaybackError(this.player.error);
    }, true);
    v.addEventListener('pause', () => {
      this._handleNormalOperation();
      this._report('pause');
      this._handleBufferingEnd();
    }, true);
    v.addEventListener('play', () => {
      this._handleNormalOperation();
      this._report('play');
      this._handleBufferingEnd();
    }, true);
    v.addEventListener('playing', () => {
      this._handleNormalOperation();
      this._handleBufferingEnd();
    }, true);
    v.addEventListener('seeking', () => {
      this.handleNormalOperation();
      this.report('seek', {offset: this.player.currentTime});
    }, true);
    v.addEventListener('seeked', () => {
      this._handleNormalOperation();
      this._handleBufferingEnd();
    }, true);
    v.addEventListener('timeupdate', () => {
      this._reportTime();
    }, true);
    v.addEventListener('stalled', () => {
      this._handleBufferingStart();
    }, true);
    v.addEventListener('waiting', () => {
      this._handleBufferingStart();
    }, true);
  }

  _handleBufferingStart() {
    this.isBuffering = true;
    this.lastBufferStart = this.lastBufferStart || new Date();
    this._report('buffer');
  }

  _handleNormalOperation() {
    this.stoppedHACK = false;
  }

  _handleBufferingEnd() {
    this.isBuffering = false;
    this.lastBufferStart = null;
  }

  _handlePlaybackError(error) {
    if (this.stoppedHACK) {
      console.warn('An error occurred, but playback is stopped so this should not be a problem', error);
    } else if (error === null) {
      console.warn('An error event was fired, but the error was null'); // Ugh, Firefox
    } else {
      this._report('error', Object.assign({}, this.browserState, {error_object: normalizeError(error)}));
    }
  }

  _setup() {
    var viewerId = storage.getItem('boxcast-viewer-id', null);
    if (!viewerId) {
      viewerId = uuid().replace(/-/g, '');
      storage.setItem('boxcast-viewer-id', viewerId);
    }
    this.headers = Object.assign({
      view_id: uuid().replace(/-/g, ''),
      viewer_id: viewerId
    }, this.broadcastInfo);
  }

  _reportTime() {
    if (!this.isSetup || !this.isPlaying) {
      return;
    }
    var n = new Date();
    if ((n - this.lastReportAt) > TIME_REPORT_INTERVAL_MS) {
      this._report('time');
    }
  }

  _report(action, options) {
    if (!this.isSetup) {
      this._setup();
      this.isSetup = true; // avoid infinite loop
      this._report('setup', this.browserState);
    }

    var n = new Date();

    // Accumulate the playing/buffering counters
    if (this.isPlaying) {
      this.durationPlaying += (n - (this.lastReportAt || n));
    }
    if (this.isBuffering) {
      this.durationBuffering += (n - (this.lastBufferStart || n));
    }
    this.isPlaying = PLAYING_STATES.indexOf(action) >= 0 || (this.isPlaying && !(STOPPED_STATES.indexOf(action) >= 0));
    this.lastReportAt = n;

    options = options || {};
    options = Object.assign({}, this.headers, options);
    options.timestamp = n.toISOString();
    options.hour_of_day = n.getHours(); // hour-of-day in local time
    options.day_of_week = n.getDay();
    options.action = action;
    options.position = this.player.currentTime;
    options.duration = Math.round(this.durationPlaying / 1000);
    options.duration_buffering = Math.round(this.durationBuffering / 1000);

    // TODO: consider a more appropriate way to get level height, e.g. if using hls.js
    options.videoHeight = this.player.videoHeight;

    this._queue.push(options);
    this._dequeue();
  }

  _dequeue() {
    var requeue = [];

    this._queue.forEach((options) => {
      axios.post(METRICS_URL, options).catch((error) => {
        options.__attempts = (options.__attempts || 0) + 1;
        if (options.__attempts <= 5) {
          console.error('Unable to post metrics; will retry', error, options);
          requeue.push(options);
        } else {
          console.error('Unable to post metrics; will not retry', error, options);
        }
      });
    });

    // Add any messages that failed to try to resend on next batch
    this._queue = requeue;
  }
}
