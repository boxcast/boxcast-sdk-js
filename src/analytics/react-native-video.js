//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

/* eslint camelcase: 0 */

const { uuid, normalizeError, normalizeAxiosError } = require('../utils');
const axios = require('axios');

const METRICS_URL = 'https://metrics.boxcast.com/player/interaction';
const PLAYING_STATES = 'play'.split(' ');
const STOPPED_STATES = 'pause buffer complete error'.split(' ');
const DOUBLE_REPORT_DEBOUNCE_MIN_MS = 1000;
const TIME_REPORT_INTERVAL_MS = 60000;
const BUFFERING_MIN_TIME_TO_REPORT_MS = 1000;

export default class ReactNativeVideoAnalytics {
  constructor(state) {
    this.browserState = state;
    this._queue = [];
  }

  async attach(params) {
    const { broadcast, channel_id, AsyncStorage, debug } = params;

    if (!broadcast) throw Error('broadcast is required');
    if (!AsyncStorage) throw Error('AsyncStorage is required');
    this.storage = AsyncStorage;
    this.debug = debug;
    this.broadcastInfo = {
      channel_id: channel_id || broadcast.channel_id,
      account_id: broadcast.account_id,
      is_live: (broadcast.timeframe === 'current'),
      broadcast_id: broadcast.id
    };
    this.lastAction = null;
    this.lastReportAt = null;
    this.lastBufferStart = null;
    this.isPlaying = false;
    this.isBuffering = false;
    this.durationPlaying = 0;
    this.durationBuffering = 0;
    this.currentLevelHeight = 0;
    this.headers = {};
    this.isSetup = false;
    this._bufferTimeoutHandle = null;

    await this._initViewerID();

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
    if (evt.isBuffering) {
      this._handleBufferingStart();
    } else {
      this._handleBufferingEnd();
    }
  }

  _onError(evt) {
    console.warn('onError:', evt);
    this._handlePlaybackError(evt);
  }

  _onLoad(evt) {
    this.debug && console.log('onLoad:', evt);
  }

  _onProgress(evt) {
    this._lastProgressTimestamp = evt.currentTime;
    this._reportTime();
  }

  _onEnd(evt) {
    this._report('complete');
    this._handleBufferingEnd();
  }

  _onPlaybackRateChange(evt) {
    // XXX: This is the primary trigger for knowing play/buffer/stall.  It goes
    // from 0<->1 depending on what is happening. The other events do not appear
    // to be reliable as of react-native-video v4.3.1

    if (evt.playbackRate === 0) {
      // rate == 0 --> pause
      this._report('pause');
      this._handleBufferingEnd();
    } else if (evt.playbackRate === 1) {
      // rate == 1 --> play
      this._report('play');
      this._handleBufferingEnd();
    }
  }

  _getCurrentTime() {
    return this._lastProgressTimestamp;
  }

  _handleBufferingStart() {
    this.isBuffering = true;
    this.lastBufferStart = this.lastBufferStart || new Date();
    if (this._bufferTimeoutHandle == null) {
      this.debug && console.log('[analytics] Detected start of buffering');
      this._bufferTimeoutHandle = setTimeout(() => {
        this.isBuffering && this._report('buffer');
      }, BUFFERING_MIN_TIME_TO_REPORT_MS);
    }
  }

  _handleBufferingEnd() {
    this.isBuffering = false;
    this.lastBufferStart = null;
    clearTimeout(this._bufferTimeoutHandle);
    this._bufferTimeoutHandle = null;
    this.debug && console.log('[analytics] Detected end of buffering');
  }

  _handlePlaybackError(error) {
    if (error === null) {
      console.warn('An error event was fired, but the error was null'); // Ugh, Firefox
    } else {
      this._report('error', Object.assign({}, this.browserState, {error_object: normalizeError(error)}));
    }
  }

  async _initViewerID() {
    var viewerId = await this.storage.getItem('boxcast-viewer-id');
    if (!viewerId) {
      viewerId = uuid().replace(/-/g, '');
      this.storage.setItem('boxcast-viewer-id', viewerId);
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
      this.isSetup = true; // avoid infinite loop
      this._report('setup', this.browserState);
    }

    // Accumulate the playing/buffering counters
    var n = new Date();
    if (this.isPlaying) {
      // Accumulate the playing counter stat between report intervals
      this.durationPlaying += (n - (this.lastReportAt || n));
    }
    if (this.isBuffering) {
      // Buffering stat is absolute (*not* accumulated between report intervals)
      this.durationBuffering = (n - (this.lastBufferStart || n));
    }
    this.isPlaying = PLAYING_STATES.indexOf(action) >= 0 || (this.isPlaying && !(STOPPED_STATES.indexOf(action) >= 0));

    // Debounce if triggering same report again (often happens with multiple "play"s during buffering)
    if (action === this.lastAction && (n - (this.lastReportAt || n)) < DOUBLE_REPORT_DEBOUNCE_MIN_MS) {
      this.debug && console.log(`[analytics] Ignoring ${action} due to debounce on last report`);
      return;
    }
    this.lastReportAt = n;
    this.lastAction = action;

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
      axios.post(METRICS_URL, options).then(() => {
        this.debug && console.log('[analytics] Posted: ', options);
      }).catch((error) => {
        options.__attempts = (options.__attempts || 0) + 1;
        if (options.__attempts <= 5) {
          console.warn('Unable to post metrics; will retry', normalizeAxiosError(error), options);
          requeue.push(options);
        } else {
          console.warn('Unable to post metrics; will not retry', normalizeAxiosError(error), options);
        }
      });
    });

    // Add any messages that failed to try to resend on next batch
    this._queue = requeue;
  }
}

