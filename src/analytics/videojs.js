//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

/* eslint camelcase: 0 */

const Html5VideoAnalytics = require('./html5');

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
    this.durationBuffering = 0;
    this.currentLevelHeight = 0;
    this.headers = {};

    this._wireEvents(this.player);

    return this;
  }

  _wireEvents(v) {
    v.on('ended', () => {
      this._handleNormalOperation();
      this._report('complete');
      this._handleBufferingEnd();
    });
    v.on('error', (err) => {
      this._handlePlaybackError(err);
    });
    v.on('pause', () => {
      this._handleNormalOperation();
      this._report('pause');
      this._handleBufferingEnd();
    });
    v.on('play', () => {
      this._handleNormalOperation();
      this._report('play');
      this._handleBufferingEnd();
    });
    v.on('playing', () => {
      this._handleNormalOperation();
      this.isPlaying = true;
      this._handleBufferingEnd();
    });
    v.on('seeking', () => {
      this._handleNormalOperation();
      this._report('seek', {offset: this._getCurrentTime()});
    });
    v.on('seeked', () => {
      this._handleNormalOperation();
      this._handleBufferingEnd();
    });
    v.on('timeupdate', () => {
      this._reportTime();
    });
    v.on('stalled', () => {
      this._handleBufferingStart();
    });
    v.on('waiting', () => {
      this._handleBufferingStart();
    });
  }

  _getCurrentTime() {
    return this.player.currentTime();
  }

  _getCurrentLevelHeight() {
    return this.player.videoHeight();
  }
}
