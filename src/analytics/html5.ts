//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

/* eslint camelcase: 0 */
// @ts-nocheck
import { uuid, normalizeError, getStorage,
  cleanQuotesFromViewerID, Clock, MonotonicClock } from '../utils';

const METRICS_URL = 'https://metrics.boxcast.com/player/interaction';
const PLAYING_STATES = 'play'.split(' ');
const STOPPED_STATES = 'pause buffer idle stop complete error'.split(' ');
const TIME_REPORT_INTERVAL_MS = 60000;

const storage = getStorage();

export default class Html5VideoAnalytics {
  constructor(state) {
    this.browserState = state;
    this._queue = [];
    this.listeners = {};
  }

  attach(params) {
    const { video, broadcast, channel_id } = params;

    if (!video) throw Error('video is required');
    if (!broadcast) throw Error('broadcast is required');

    // Check if we're already attached and reset if so
    if (Object.keys(this.listeners).length > 0) {
      this.detach();
    }

    this.player = video;
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
    this.activeBufferingDuration = 0;
    this.totalDurationBuffering = 0;
    this.currentLevelHeight = 0;
    this.headers = {};
    this.isSetup = false;

    this.listeners = this._wireEvents(this.player);

    return this;
  }

  detach() {
    // Remove video event listeners
    Object.keys(this.listeners).forEach((evtName) => {
      this.player.removeEventListener(evtName, this.listeners[evtName], true);
    });
    this.listeners = {};

    // Clear up other state
    clearTimeout(this._waitForBufferingCheck);

    return this;
  }

  _wireEvents(v) {
    const listeners = {
      'ended': () => {
        this._handleNormalOperation();
        this._report('complete');
        this._handleBufferingEnd();
      },
      'error': () => {
        this._handlePlaybackError(this.player.error);
      },
      'pause': () => {
        this._handleNormalOperation();
        this._report('pause');
        this._handleBufferingEnd();
      },
      'play': () => {
        this._handleNormalOperation();
        this._report('play');
        this._handleBufferingEnd();
      },
      'playing': () => {
        this._handleNormalOperation();
        this.isPlaying = true;
        this._handleBufferingEnd();
      },
      'resize': () => {
        this._handleNormalOperation();
        this._report('quality');
        this._handleBufferingEnd();
      },
      'seeking': () => {
        this._handleNormalOperation();
        this._report('seek', {offset: this.player.currentTime});
      },
      'seeked': () => {
        this._handleNormalOperation();
        this._handleBufferingEnd();
      },
      'timeupdate': () => {
        this._reportTime();
      },
      'stalled': () => {
        this._handleBufferingStart();
      },
      'waiting': () => {
        this._handleBufferingStart();
      }
    };

    Object.keys(listeners).forEach((evtName) => {
      v.addEventListener(evtName, listeners[evtName], true);
    });

    return listeners;
  }

  _isActuallyPlaying() {
    return !!(this.player.currentTime > 0 && !this.player.paused && !this.player.ended && this.player.readyState > 2);
  }

  _getCurrentTime() {
    return this.player.currentTime;
  }

  _getCurrentLevelHeight() {
    // TODO: consider a more appropriate way to get level height, e.g. if using hls.js
    return this.player.videoHeight;
  }

  _handleBufferingStart() {
    this.isBuffering = true;
    this.lastBufferStart = this.lastBufferStart || MonotonicClock.now();

    // Make sure it *stays* buffering for at least 500ms before reporting
    if (this._waitForBufferingCheck) {
      return;
    }
    this._waitForBufferingCheck = setTimeout(() => {
      this._waitForBufferingCheck = null;
      if (!this.isBuffering) {
        return;
      }
      if (this._isActuallyPlaying()) {
        this._handleBufferingEnd();
        return;
      }
      this._report('buffer');
    }, 500);
  }

  _handleNormalOperation() {
    this.stoppedHACK = false;
  }

  _handleBufferingEnd() {
    this.isBuffering = false;
    this.lastBufferStart = null;

    clearTimeout(this._waitForBufferingCheck);
    this._waitForBufferingCheck = null;

    // When done buffering, accumulate the time since it started buffering and
    // reset the active buffering timer.
    this.totalDurationBuffering += this.activeBufferingDuration;
    this.activeBufferingDuration = 0;
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
      viewerId = cleanQuotesFromViewerID(uuid().replace(/-/g, ''));
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
    var n = MonotonicClock.now();
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

    var n = MonotonicClock.now();

    if (this.isPlaying) {
      // Accumulate the playing counter stat between report intervals
      this.durationPlaying += (n - (this.lastReportAt || n));
    }
    if (this.isBuffering) {
      // The active buffering stat is absolute (*not* accumulated between report intervals)
      this.activeBufferingDuration = (n - (this.lastBufferStart || n));
    }
    this.isPlaying = PLAYING_STATES.indexOf(action) >= 0 || (this.isPlaying && !(STOPPED_STATES.indexOf(action) >= 0));
    this.lastReportAt = n;

    let c = Clock.now();
    options = options || {};
    options = Object.assign({}, this.headers, options);
    options.timestamp = c.toISOString();
    options.hour_of_day = c.getHours(); // hour-of-day in local time
    options.day_of_week = c.getDay();
    options.action = action;
    options.position = this._getCurrentTime();
    options.duration = Math.round(this.durationPlaying / 1000);
    options.duration_buffering = Math.round((this.totalDurationBuffering + this.activeBufferingDuration) / 1000);
    options.videoHeight = this._getCurrentLevelHeight();
    if (this._getDvrIsUse) {
      options.dvr = this._getDvrIsUse();
    }

    this._queue.push(options);
    this._dequeue();
  }

  async _dequeue() {
    var requeue = [];

    for (const options of this._queue) {
      try {
        const response = await fetch(METRICS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(options)
        });
        if (!response.ok) {
          throw new Error(`Failed to post metrics with status ${response.status}`);
        }
      } catch (error) {
        options.__attempts = (options.__attempts || 0) + 1;
        if (options.__attempts <= 5) {
          console.warn('Unable to post metrics; will retry', normalizeError(error), options);
          requeue.push(options);
        } else {
          console.warn('Unable to post metrics; will not retry', normalizeError(error), options);
        }
      }
    }

    // Add any messages that failed to try to resend on next batch
    this._queue = requeue;
  }
}
