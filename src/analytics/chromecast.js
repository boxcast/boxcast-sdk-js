//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

/* eslint camelcase: 0 */

const Html5VideoAnalytics = require('./html5');

export default class ChromecastAnalytics extends Html5VideoAnalytics {
  get framework() {
    const cast = window.cast || global.cast;
    return cast.framework;
  }

  attach(params) {
    const { playerManager, castOptions } = params;

    if (!playerManager) throw Error('playerManager is required');
    if (!castOptions) throw Error('castOptions is required');

    this.playerManager = playerManager;
    this.castOptions = castOptions;

    // The custom receiver doesn't have a good way to figure out which account ID,
    // broadcast ID, channel ID, etc. are in use. They are passed to us via the
    // customData of the load request.
    this.playerManager.setMediaPlaybackInfoHandler((loadRequest, playbackConfig) => {
      if (loadRequest.media.customData && loadRequest.media.customData.type &&
            (loadRequest.media.customData.type === 'BOXCAST_METADATA')) {
        this.broadcastInfo = loadRequest.media.customData.data;
      }
      return playbackConfig;
    });

    let playbackConfig = Object.assign(
      new this.framework.PlaybackConfig(),
      this.playerManager.getPlaybackConfig()
    );
    playbackConfig.segmentRequestHandler = (requestInfo) => this._handleSegmentRequest(requestInfo);
    this.castOptions.playbackConfig = playbackConfig;

    this.lastReportAt = null;
    this.lastBufferStart = null;
    this.isPlaying = false;
    this.isBuffering = false;
    this.durationPlaying = 0;
    this.durationBuffering = 0;
    this.currentLevelHeight = 0;
    this.headers = {};
    this.position = 0;
    this.currentLevelHeight = 0;

    this._wireEvents(this.player);

    return this;
  }

  _wireEvents(v) {
    this.playerManager.addEventListener(this.framework.events.EventType.ENDED, (event) => {
      this._handleNormalOperation();
      this._report('complete');
      this._handleBufferingEnd();
    });
    this.playerManager.addEventListener(this.framework.events.EventType.MEDIA_FINISHED, (event) => {
      this._handleNormalOperation();
      this._report('complete');
      this._handleBufferingEnd();
    });
    this.playerManager.addEventListener(this.framework.events.EventType.ERROR, (event) => {
      this._handlePlaybackError(event);
    });
    this.playerManager.addEventListener(this.framework.events.EventType.PAUSE, (event) => {
      this._handleNormalOperation();
      this._report('pause');
      this._handleBufferingEnd();
    });
    this.playerManager.addEventListener(this.framework.events.EventType.PLAYING, (event) => {
      this._handleNormalOperation();
      this._report('play');
      this.isPlaying = true;
      this._handleBufferingEnd();
    });
    this.playerManager.addEventListener(this.framework.events.EventType.REQUEST_STOP, (event) => {
      this._handleNormalOperation();
      this._report('stop');
      this._handleBufferingEnd();
    });
    this.playerManager.addEventListener(this.framework.events.EventType.SEEKED, (event) => {
      this._handleNormalOperation();
      this._handleBufferingEnd();
    });
    this.playerManager.addEventListener(this.framework.events.EventType.SEEKING, (event) => {
      if (event && event.currentMediaTime) {
        this._handleNormalOperation();
        this._report('seek', {offset: event.currentMediaTime});
      }
    });
    this.playerManager.addEventListener(this.framework.events.EventType.TIME_UPDATE, (event) => {
      this._reportTime();
    });
    this.playerManager.addEventListener(this.framework.events.EventType.BUFFERING, (event) => {
      this._handleBufferingStart();
    });
  }

  _getCurrentTime() {
    return this.playerManager.getCurrentTimeSec();
  }

  _getCurrentLevelHeight() {
    return this.currentLevelHeight;
  }

  _handleSegmentRequest(requestInfo) {
    // Set the current level height to whatever level we're most recently requesting.
    if (!requestInfo.url) return;
    const m = requestInfo.url.match(/\/(\d+)p\/\d+\.ts/);
    if (!m || !m[1]) return;
    this.currentLevelHeight = parseInt(m[1], 10);
  }
}
