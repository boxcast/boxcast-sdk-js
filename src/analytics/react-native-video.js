//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

/* eslint camelcase: 0 */

const { uuid, normalizeError, getStorage } = require('../utils');
const axios = require('axios');

const METRICS_URL = 'https://metrics.boxcast.com/player/interaction';
const PLAYING_STATES = 'play'.split(' ');
const STOPPED_STATES = 'pause buffer complete error'.split(' ');
const TIME_REPORT_INTERVAL_MS = 60000;

const storage = getStorage();

export default class ReactNativeVideoAnalytics {
  constructor(state) {
    this.browserState = state;
    this._queue = [];
  }

  attach(params) {
    const { broadcast, channel_id } = params;

    if (!broadcast) throw Error('broadcast is required');

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
    this.isSetup = false;

    return this;
  }

  generateVideoEventProps() {
    return {
      onBuffer: this._onBuffer.bind(this),
      onError: this._onError.bind(this),
      onLoad: this._onLoad.bind(this),
      onProgress: this._onProgress.bind(this),
      onEnd: this._onEnd.bind(this),
      onPlaybackRateChange: this._onPlaybackRateChange.bind(this)
    };
  }

  _onBuffer(evt) {
    console.log('onBuffer:', evt);
    this._handleBufferingStart();
  }

  _onError(evt) {
    console.log('onError:', evt);
    this._handlePlaybackError(evt);
  }

  _onLoad(evt) {
    console.log('onLoad:', evt);
  }

  _onProgress(evt) {
    console.log('onProgress:', evt);
    this._lastProgressTimestamp = evt.currentTime;
    this._reportTime();
  }

  _onEnd(evt) {
    console.log('onEnd:', evt);
    this._report('complete');
    this._handleBufferingEnd();
  }

  _onPlaybackRateChange(evt) {
    // XXX: This is the primary trigger for knowing play/buffer/stall.  It goes
    // from 0<->1 depending on what is happening. The other events do not appear
    // to be reliable as of react-native-video v4.3.1
    console.log('onPlaybackRateChange:', evt);

    if (evt.playbackRate === 0) {
      // rate == 0 --> pause
      this._report('pause');
      this._handleBufferingEnd();
    } else if (evt.playbackRate === 1) {
      // rate == 1 --> play
      this._report('play');
      this.isPlaying = true;
      this._handleBufferingEnd();
    }
  }

  _getCurrentTime() {
    return this._lastProgressTimestamp;
  }

  _handleBufferingStart() {
    this.isBuffering = true;
    this.lastBufferStart = this.lastBufferStart || new Date();
    this._report('buffer');
  }

  _handleBufferingEnd() {
    this.isBuffering = false;
    this.lastBufferStart = null;
  }

  _handlePlaybackError(error) {
    if (error === null) {
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
    if ((n - this.lastReportAt) <= TIME_REPORT_INTERVAL_MS) {
      return;
    }
    this._report('time');
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
    options.position = this._getCurrentTime();
    options.duration = Math.round(this.durationPlaying / 1000);
    options.duration_buffering = Math.round(this.durationBuffering / 1000);
    // options.videoHeight = // XXX: TODO: figure out how to determine video height

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

