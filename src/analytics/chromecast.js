//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

/* eslint camelcase: 0 */

const Html5VideoAnalytics = require('./html5');

const DVR_WINDOW_S = 30;

export default class ChromecastAnalytics extends Html5VideoAnalytics {
  get framework() {
    const cast = window.cast || global.cast;
    return cast.framework;
  }

  attach(params) {
    const { playerManager, broadcastInfo } = params;

    if (!playerManager) throw Error('playerManager is required');
    if (!broadcastInfo) throw Error('broadcastInfo is required');

    this.playerManager = playerManager;
    this.broadcastInfo = broadcastInfo;
    this.lastReportAt = null;
    this.lastBufferStart = null;
    this.isPlaying = false;
    this.isBuffering = false;
    this.durationPlaying = 0;
    this.durationBuffering = 0;
    this.currentLevelHeight = 0;
    this.headers = {};
    this.isSetup = false;

    this._wireEvents();

    return this;
  }

  handleSegmentRequest(requestInfo) {
    // Set the current level height to whatever level we're most recently requesting.
    if (!requestInfo.url) return;
    const m = requestInfo.url.match(/\/(\d+)p\/\d+\.ts/);
    if (!m || !m[1]) return;
    this.currentLevelHeight = parseInt(m[1], 10);
  }

  _wireEvents() {
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
      this._handleChromecastError(event);
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
      if (event.isBuffering) {
        this._handleBufferingStart();
      } else {
        this._handleNormalOperation();
        this._handleBufferingEnd();
      }
    });
  }

  _handleChromecastError(event) {
    if (this.stoppedHACK) {
      console.warn('An error occurred, but playback is stopped so this should not be a problem', event);
    } else if (event === null) {
      console.warn('An error event was fired, but the error was null');
    } else {
      let errorObject = {};
      if (event.detailedErrorCode) {
        errorObject.code = event.detailedErrorCode;
        switch (event.detailedErrorCode) {
          case this.framework.events.DetailedErrorCode.MEDIA_UNKNOWN:
            errorObject.message = 'MEDIA_UNKNOWN';
            break;
          case this.framework.events.DetailedErrorCode.MEDIA_ABORTED:
            errorObject.message = 'MEDIA_ABORTED';
            break;
          case this.framework.events.DetailedErrorCode.MEDIA_DECODE:
            errorObject.message = 'MEDIA_DECODE';
            break;
          case this.framework.events.DetailedErrorCode.MEDIA_NETWORK:
            errorObject.message = 'MEDIA_NETWORK';
            break;
          case this.framework.events.DetailedErrorCode.MEDIA_SRC_NOT_SUPPORTED:
            errorObject.message = 'MEDIA_SRC_NOT_SUPPORTED';
            break;
          case this.framework.events.DetailedErrorCode.SOURCE_BUFFER_FAILURE:
            errorObject.message = 'SOURCE_BUFFER_FAILURE';
            break;
          case this.framework.events.DetailedErrorCode.MEDIAKEYS_UNKNOWN:
            errorObject.message = 'MEDIAKEYS_UNKNOWN';
            break;
          case this.framework.events.DetailedErrorCode.MEDIAKEYS_NETWORK:
            errorObject.message = 'MEDIAKEYS_NETWORK';
            break;
          case this.framework.events.DetailedErrorCode.MEDIAKEYS_UNSUPPORTED:
            errorObject.message = 'MEDIAKEYS_UNSUPPORTED';
            break;
          case this.framework.events.DetailedErrorCode.MEDIAKEYS_WEBCRYPTO:
            errorObject.message = 'MEDIAKEYS_WEBCRYPTO';
            break;
          case this.framework.events.DetailedErrorCode.NETWORK_UNKNOWN:
            errorObject.message = 'NETWORK_UNKNOWN';
            break;
          case this.framework.events.DetailedErrorCode.SEGMENT_NETWORK:
            errorObject.message = 'SEGMENT_NETWORK';
            break;
          case this.framework.events.DetailedErrorCode.HLS_NETWORK_MASTER_PLAYLIST:
            errorObject.message = 'HLS_NETWORK_MASTER_PLAYLIST';
            break;
          case this.framework.events.DetailedErrorCode.HLS_NETWORK_PLAYLIST:
            errorObject.message = 'HLS_NETWORK_PLAYLIST';
            break;
          case this.framework.events.DetailedErrorCode.HLS_NETWORK_NO_KEY_RESPONSE:
            errorObject.message = 'HLS_NETWORK_NO_KEY_RESPONSE';
            break;
          case this.framework.events.DetailedErrorCode.HLS_NETWORK_KEY_LOAD:
            errorObject.message = 'HLS_NETWORK_KEY_LOAD';
            break;
          case this.framework.events.DetailedErrorCode.HLS_NETWORK_INVALID_SEGMENT:
            errorObject.message = 'HLS_NETWORK_INVALID_SEGMENT';
            break;
          case this.framework.events.DetailedErrorCode.HLS_SEGMENT_PARSING:
            errorObject.message = 'HLS_SEGMENT_PARSING';
            break;
          case this.framework.events.DetailedErrorCode.DASH_NETWORK:
            errorObject.message = 'DASH_NETWORK';
            break;
          case this.framework.events.DetailedErrorCode.DASH_NO_INIT:
            errorObject.message = 'DASH_NO_INIT';
            break;
          case this.framework.events.DetailedErrorCode.SMOOTH_NETWORK:
            errorObject.message = 'SMOOTH_NETWORK';
            break;
          case this.framework.events.DetailedErrorCode.SMOOTH_NO_MEDIA_DATA:
            errorObject.message = 'SMOOTH_NO_MEDIA_DATA';
            break;
          case this.framework.events.DetailedErrorCode.MANIFEST_UNKNOWN:
            errorObject.message = 'MANIFEST_UNKNOWN';
            break;
          case this.framework.events.DetailedErrorCode.HLS_MANIFEST_MASTER:
            errorObject.message = 'HLS_MANIFEST_MASTER';
            break;
          case this.framework.events.DetailedErrorCode.HLS_MANIFEST_PLAYLIST:
            errorObject.message = 'HLS_MANIFEST_PLAYLIST';
            break;
          case this.framework.events.DetailedErrorCode.DASH_MANIFEST_UNKNOWN:
            errorObject.message = 'DASH_MANIFEST_UNKNOWN';
            break;
          case this.framework.events.DetailedErrorCode.DASH_MANIFEST_NO_PERIODS:
            errorObject.message = 'DASH_MANIFEST_NO_PERIODS';
            break;
          case this.framework.events.DetailedErrorCode.DASH_MANIFEST_NO_MIMETYPE:
            errorObject.message = 'DASH_MANIFEST_NO_MIMETYPE';
            break;
          case this.framework.events.DetailedErrorCode.DASH_INVALID_SEGMENT_INFO:
            errorObject.message = 'DASH_INVALID_SEGMENT_INFO';
            break;
          case this.framework.events.DetailedErrorCode.SMOOTH_MANIFEST:
            errorObject.message = 'SMOOTH_MANIFEST';
            break;
          case this.framework.events.DetailedErrorCode.SEGMENT_UNKNOWN:
            errorObject.message = 'SEGMENT_UNKNOWN';
            break;
          case this.framework.events.DetailedErrorCode.TEXT_UNKNOWN:
            errorObject.message = 'TEXT_UNKNOWN';
            break;
          case this.framework.events.DetailedErrorCode.APP:
            errorObject.message = 'APP';
            break;
          case this.framework.events.DetailedErrorCode.BREAK_CLIP_LOADING_ERROR:
            errorObject.message = 'BREAK_CLIP_LOADING_ERROR';
            break;
          case this.framework.events.DetailedErrorCode.BREAK_SEEK_INTERCEPTOR_ERROR:
            errorObject.message = 'BREAK_SEEK_INTERCEPTOR_ERROR';
            break;
          case this.framework.events.DetailedErrorCode.IMAGE_ERROR:
            errorObject.message = 'IMAGE_ERROR';
            break;
          case this.framework.events.DetailedErrorCode.LOAD_INTERRUPTED:
            errorObject.message = 'LOAD_INTERRUPTED';
            break;
          case this.framework.events.DetailedErrorCode.LOAD_FAILED:
            errorObject.message = 'LOAD_FAILED';
            break;
          case this.framework.events.DetailedErrorCode.MEDIA_ERROR_MESSAGE:
            errorObject.message = 'MEDIA_ERROR_MESSAGE';
            break;
          case this.framework.events.DetailedErrorCode.GENERIC:
            errorObject.message = 'GENERIC';
            break;
        }
      }
      if (event.error) {
        try {
          errorObject.data = JSON.stringify(event.error);
        } catch (e) {}
      }
      this._report('error', Object.assign({}, this.browserState, {error_object: errorObject}));
    }
  }

  _getCurrentTime() {
    return this.playerManager.getCurrentTimeSec();
  }

  _getCurrentLevelHeight() {
    return this.currentLevelHeight;
  }

  _getDvrIsUse() {
    const liveSeekableRange = this.playerManager.getLiveSeekableRange();
    if (liveSeekableRange && liveSeekableRange.end) {
      if (liveSeekableRange.end - this.playerManager.getCurrentTimeSec() < DVR_WINDOW_S) {
        // Within DVR_WINDOW_S seconds of live head, so not DVR
        return false;
      }
      // More than DVR_WINDOW_S seconds behind, so DVR
      return true;
    }
    // Not live, so not DVR
    return false;
  }
}
