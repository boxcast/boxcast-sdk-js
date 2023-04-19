//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

/* eslint camelcase: 0 */
// @ts-nocheck
import Html5VideoAnalytics from './html5';

export default class VideoJsAnalytics extends Html5VideoAnalytics {
  attach(params) {
    const { player, broadcast, channel_id } = params;

    if (!player) throw Error('player is required');
    if (!broadcast) throw Error('broadcast is required');

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
      this.player.off(evtName, this.listeners[evtName]);
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
      'error': (err) => {
        this._handlePlaybackError(err);
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
        this._report('seek', {offset: this._getCurrentTime()});
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
      v.on(evtName, listeners[evtName]);
    });

    return listeners;
  }

  _getCurrentTime() {
    return this.player.currentTime();
  }

  _getCurrentLevelHeight() {
    return this.player.videoHeight();
  }
}
