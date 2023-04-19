(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(global, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/analytics/chromecast.ts":
/*!*************************************!*\
  !*** ./src/analytics/chromecast.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => /* binding */ ChromecastAnalytics
/* harmony export */ });
/* harmony import */ var _html5__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./html5 */ "./src/analytics/html5.ts");
//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

const DVR_WINDOW_S = 30;
class ChromecastAnalytics extends _html5__WEBPACK_IMPORTED_MODULE_0__.default {
    get framework() {
        const cast = typeof window !== 'undefined' ? window.cast : global.cast;
        return cast.framework;
    }
    attach(params) {
        const { playerManager, broadcastInfo } = params;
        if (!playerManager)
            throw Error('playerManager is required');
        if (!broadcastInfo)
            throw Error('broadcastInfo is required');
        this.playerManager = playerManager;
        this.broadcastInfo = broadcastInfo;
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
        this._wireEvents();
        return this;
    }
    handleSegmentRequest(requestInfo) {
        // Set the current level height to whatever level we're most recently requesting.
        if (!requestInfo.url)
            return;
        const m = requestInfo.url.match(/\/(\d+)p\/\d+\.ts/);
        if (!m || !m[1])
            return;
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
                this._report('seek', { offset: event.currentMediaTime });
            }
        });
        this.playerManager.addEventListener(this.framework.events.EventType.TIME_UPDATE, (event) => {
            if (event.currentMediaTime && this.lastTimeUpdateTime && (event.currentMediaTime !== this.lastTimeUpdateTime)) {
                this._handleNormalOperation();
                this._handleBufferingEnd();
            }
            this.lastTimeUpdateTime = event.currentMediaTime;
            this._reportTime();
        });
        this.playerManager.addEventListener(this.framework.events.EventType.BUFFERING, (event) => {
            if (event.isBuffering) {
                this._handleBufferingStart();
            }
            else {
                this._handleNormalOperation();
                this._handleBufferingEnd();
            }
        });
    }
    _handleChromecastError(event) {
        if (this.stoppedHACK) {
            console.warn('An error occurred, but playback is stopped so this should not be a problem', event);
        }
        else if (event === null) {
            console.warn('An error event was fired, but the error was null');
        }
        else {
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
                }
                catch (e) { }
            }
            this._report('error', Object.assign({}, this.browserState, { error_object: errorObject }));
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


/***/ }),

/***/ "./src/analytics/html5.ts":
/*!********************************!*\
  !*** ./src/analytics/html5.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => /* binding */ Html5VideoAnalytics
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");
//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* eslint camelcase: 0 */
// @ts-nocheck

const METRICS_URL = 'https://metrics.boxcast.com/player/interaction';
const PLAYING_STATES = 'play'.split(' ');
const STOPPED_STATES = 'pause buffer idle stop complete error'.split(' ');
const TIME_REPORT_INTERVAL_MS = 60000;
const storage = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getStorage)();
class Html5VideoAnalytics {
    constructor(state) {
        this.browserState = state;
        this._queue = [];
        this.listeners = {};
    }
    attach(params) {
        const { video, broadcast, channel_id } = params;
        if (!video)
            throw Error('video is required');
        if (!broadcast)
            throw Error('broadcast is required');
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
                this._report('seek', { offset: this.player.currentTime });
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
        this.lastBufferStart = this.lastBufferStart || _utils__WEBPACK_IMPORTED_MODULE_0__.MonotonicClock.now();
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
        }
        else if (error === null) {
            console.warn('An error event was fired, but the error was null'); // Ugh, Firefox
        }
        else {
            this._report('error', Object.assign({}, this.browserState, { error_object: (0,_utils__WEBPACK_IMPORTED_MODULE_0__.normalizeError)(error) }));
        }
    }
    _setup() {
        var viewerId = storage.getItem('boxcast-viewer-id', null);
        if (!viewerId) {
            viewerId = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.cleanQuotesFromViewerID)((0,_utils__WEBPACK_IMPORTED_MODULE_0__.uuid)().replace(/-/g, ''));
            storage.setItem('boxcast-viewer-id', viewerId);
        }
        this.headers = Object.assign({
            view_id: (0,_utils__WEBPACK_IMPORTED_MODULE_0__.uuid)().replace(/-/g, ''),
            viewer_id: viewerId
        }, this.broadcastInfo);
    }
    _reportTime() {
        if (!this.isSetup || !this.isPlaying) {
            return;
        }
        var n = _utils__WEBPACK_IMPORTED_MODULE_0__.MonotonicClock.now();
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
        var n = _utils__WEBPACK_IMPORTED_MODULE_0__.MonotonicClock.now();
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
        let c = _utils__WEBPACK_IMPORTED_MODULE_0__.Clock.now();
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
    _dequeue() {
        return __awaiter(this, void 0, void 0, function* () {
            var requeue = [];
            for (const options of this._queue) {
                try {
                    const response = yield fetch(METRICS_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(options)
                    });
                    if (!response.ok) {
                        throw new Error(`Failed to post metrics with status ${response.status}`);
                    }
                }
                catch (error) {
                    options.__attempts = (options.__attempts || 0) + 1;
                    if (options.__attempts <= 5) {
                        console.warn('Unable to post metrics; will retry', (0,_utils__WEBPACK_IMPORTED_MODULE_0__.normalizeError)(error), options);
                        requeue.push(options);
                    }
                    else {
                        console.warn('Unable to post metrics; will not retry', (0,_utils__WEBPACK_IMPORTED_MODULE_0__.normalizeError)(error), options);
                    }
                }
            }
            // Add any messages that failed to try to resend on next batch
            this._queue = requeue;
        });
    }
}


/***/ }),

/***/ "./src/analytics/index.ts":
/*!********************************!*\
  !*** ./src/analytics/index.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "analytics": () => /* binding */ analytics,
/* harmony export */   "default": () => __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ });
/* harmony import */ var platform__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! platform */ "platform");
/* harmony import */ var platform__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(platform__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _html5__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./html5 */ "./src/analytics/html5.ts");
/* harmony import */ var _videojs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./videojs */ "./src/analytics/videojs.ts");
/* harmony import */ var _chromecast__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./chromecast */ "./src/analytics/chromecast.ts");
/* harmony import */ var _react_native_video__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./react-native-video */ "./src/analytics/react-native-video.ts");
//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//
/* global NPM_VERSION */
/* eslint camelcase: 0 */
// @ts-nocheck
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var _fetch;





var OVERRIDE_STATE = {};
function guessHost() {
    try {
        return window.location.hostname;
    }
    catch (e) {
        return '';
    }
}
function guessOS() {
    return ((platform__WEBPACK_IMPORTED_MODULE_0___default().os) || '').toString();
}
class analytics {
    constructor(fetch) {
        _fetch.set(this, void 0);
        this.configure = (params) => {
            OVERRIDE_STATE = params;
            return this;
        };
        this.getState = () => {
            var browserState = {
                host: guessHost(),
                os: guessOS(),
                browser_name: (platform__WEBPACK_IMPORTED_MODULE_0___default().name),
                browser_version: (platform__WEBPACK_IMPORTED_MODULE_0___default().version),
                player_version: `boxcast-sdk-js v${"2.0.0"}`
            };
            return Object.assign({}, browserState, OVERRIDE_STATE);
        };
        this.mode = (mode) => {
            switch (mode) {
                case 'html5':
                    return new _html5__WEBPACK_IMPORTED_MODULE_1__.default(this.getState());
                case 'video.js':
                    return new _videojs__WEBPACK_IMPORTED_MODULE_2__.default(this.getState());
                case 'chromecast':
                    return new _chromecast__WEBPACK_IMPORTED_MODULE_3__.default(this.getState());
                case 'react-native-video':
                    return new _react_native_video__WEBPACK_IMPORTED_MODULE_4__.default(this.getState());
            }
            throw Error(`Mode ${mode} not supported`);
        };
        __classPrivateFieldSet(this, _fetch, fetch);
    }
}
_fetch = new WeakMap();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (analytics);


/***/ }),

/***/ "./src/analytics/react-native-video.ts":
/*!*********************************************!*\
  !*** ./src/analytics/react-native-video.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => /* binding */ ReactNativeVideoAnalytics
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");
//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* eslint camelcase: 0 */
// @ts-nocheck

const METRICS_URL = 'https://metrics.boxcast.com/player/interaction';
const PLAYING_STATES = 'play'.split(' ');
const STOPPED_STATES = 'pause buffer complete error'.split(' ');
const DOUBLE_REPORT_DEBOUNCE_MIN_MS = 1000;
const TIME_REPORT_INTERVAL_MS = 60000;
const BUFFERING_MIN_TIME_TO_REPORT_MS = 1000;
class ReactNativeVideoAnalytics {
    constructor(state) {
        this.browserState = state;
        this._queue = [];
    }
    attach(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { broadcast, channel_id, AsyncStorage, debug } = params;
            if (!broadcast)
                throw Error('broadcast is required');
            if (!AsyncStorage)
                throw Error('AsyncStorage is required');
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
            this.activeBufferingDuration = 0;
            this.totalDurationBuffering = 0;
            this.currentLevelHeight = 0;
            this.headers = {};
            this.isSetup = false;
            this._bufferTimeoutHandle = null;
            yield this._initViewerID();
            return this;
        });
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
        }
        else {
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
        }
        else if (evt.playbackRate === 1) {
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
        this.lastBufferStart = this.lastBufferStart || _utils__WEBPACK_IMPORTED_MODULE_0__.MonotonicClock.now();
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
        // When done buffering, accumulate the time since it started buffering and
        // reset the active buffering timer.
        this.totalDurationBuffering += this.activeBufferingDuration;
        this.activeBufferingDuration = 0;
        clearTimeout(this._bufferTimeoutHandle);
        this._bufferTimeoutHandle = null;
        this.debug && console.log('[analytics] Detected end of buffering');
    }
    _handlePlaybackError(error) {
        if (error === null) {
            console.warn('An error event was fired, but the error was null'); // Ugh, Firefox
        }
        else {
            this._report('error', Object.assign({}, this.browserState, { error_object: (0,_utils__WEBPACK_IMPORTED_MODULE_0__.normalizeError)(error) }));
        }
    }
    _initViewerID() {
        return __awaiter(this, void 0, void 0, function* () {
            var viewerId = yield this.storage.getItem('boxcast-viewer-id');
            if (!viewerId) {
                viewerId = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.uuid)().replace(/-/g, '');
                this.storage.setItem('boxcast-viewer-id', viewerId);
            }
            this.headers = Object.assign({
                view_id: (0,_utils__WEBPACK_IMPORTED_MODULE_0__.uuid)().replace(/-/g, ''),
                viewer_id: viewerId
            }, this.broadcastInfo);
        });
    }
    _reportTime() {
        if (!this.isSetup || !this.isPlaying) {
            return;
        }
        var n = _utils__WEBPACK_IMPORTED_MODULE_0__.MonotonicClock.now();
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
        var n = _utils__WEBPACK_IMPORTED_MODULE_0__.MonotonicClock.now();
        if (this.isPlaying) {
            // Accumulate the playing counter stat between report intervals
            this.durationPlaying += (n - (this.lastReportAt || n));
        }
        if (this.isBuffering) {
            // The active buffering stat is absolute (*not* accumulated between report intervals)
            this.activeBufferingDuration = (n - (this.lastBufferStart || n));
        }
        this.isPlaying = PLAYING_STATES.indexOf(action) >= 0 || (this.isPlaying && !(STOPPED_STATES.indexOf(action) >= 0));
        // Debounce if triggering same report again (often happens with multiple "play"s during buffering)
        if (action === this.lastAction && (n - (this.lastReportAt || n)) < DOUBLE_REPORT_DEBOUNCE_MIN_MS) {
            this.debug && console.log(`[analytics] Ignoring ${action} due to debounce on last report`);
            return;
        }
        this.lastReportAt = n;
        this.lastAction = action;
        let c = _utils__WEBPACK_IMPORTED_MODULE_0__.Clock.now();
        options = options || {};
        options = Object.assign({}, this.headers, options);
        options.timestamp = c.toISOString();
        options.hour_of_day = c.getHours(); // hour-of-day in local time
        options.day_of_week = c.getDay();
        options.action = action;
        options.position = this._getCurrentTime();
        options.duration = Math.round(this.durationPlaying / 1000);
        options.duration_buffering = Math.round((this.totalDurationBuffering + this.activeBufferingDuration) / 1000);
        // options.videoHeight = // XXX: TODO: figure out how to determine video height
        this._queue.push(options);
        this._dequeue();
    }
    _dequeue() {
        var requeue = [];
        this._queue.forEach((options) => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(METRICS_URL, {
                    method: 'POST',
                    body: JSON.stringify(options),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error(`Response status ${response.status}`);
                }
                this.debug && console.log('[analytics] Posted: ', options);
            }
            catch (error) {
                options.__attempts = (options.__attempts || 0) + 1;
                if (options.__attempts <= 5) {
                    console.warn('Unable to post metrics; will retry', (0,_utils__WEBPACK_IMPORTED_MODULE_0__.normalizeError)(error), options);
                    requeue.push(options);
                }
                else {
                    console.warn('Unable to post metrics; will not retry', (0,_utils__WEBPACK_IMPORTED_MODULE_0__.normalizeError)(error), options);
                }
            }
        }));
        // Add any messages that failed to try to resend on next batch
        this._queue = requeue;
    }
}


/***/ }),

/***/ "./src/analytics/videojs.ts":
/*!**********************************!*\
  !*** ./src/analytics/videojs.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => /* binding */ VideoJsAnalytics
/* harmony export */ });
/* harmony import */ var _html5__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./html5 */ "./src/analytics/html5.ts");
//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//
/* eslint camelcase: 0 */
// @ts-nocheck

class VideoJsAnalytics extends _html5__WEBPACK_IMPORTED_MODULE_0__.default {
    attach(params) {
        const { player, broadcast, channel_id } = params;
        if (!player)
            throw Error('player is required');
        if (!broadcast)
            throw Error('broadcast is required');
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
                this._report('seek', { offset: this._getCurrentTime() });
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


/***/ }),

/***/ "./src/api/auth_broadcast_routes.ts":
/*!******************************************!*\
  !*** ./src/api/auth_broadcast_routes.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => /* binding */ AuthBroadcastRoutes
/* harmony export */ });
/* harmony import */ var _base_routes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base_routes */ "./src/api/base_routes.ts");
//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var _fetch;

class AuthBroadcastRoutes extends _base_routes__WEBPACK_IMPORTED_MODULE_0__.BaseAuthenticatedRoute {
    constructor(fetch) {
        super(fetch); // call the constructor of the base class
        _fetch.set(this, void 0);
        __classPrivateFieldSet(// call the constructor of the base class
        this, _fetch, fetch);
    }
    get resourceBase() { return 'broadcasts'; }
}
_fetch = new WeakMap();


/***/ }),

/***/ "./src/api/auth_channel_routes.ts":
/*!****************************************!*\
  !*** ./src/api/auth_channel_routes.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => /* binding */ AuthChannelRoutes
/* harmony export */ });
/* harmony import */ var _base_routes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base_routes */ "./src/api/base_routes.ts");
//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var _fetch;

class AuthChannelRoutes extends _base_routes__WEBPACK_IMPORTED_MODULE_0__.BaseAuthenticatedRoute {
    constructor(fetch) {
        super(fetch); // call the constructor of the base class
        _fetch.set(this, void 0);
        __classPrivateFieldSet(// call the constructor of the base class
        this, _fetch, fetch);
    }
    get resourceBase() { return 'account/channels'; }
}
_fetch = new WeakMap();


/***/ }),

/***/ "./src/api/auth_routes.ts":
/*!********************************!*\
  !*** ./src/api/auth_routes.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => /* binding */ AuthenticatedRoutes
/* harmony export */ });
/* harmony import */ var base_64__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! base-64 */ "base-64");
/* harmony import */ var base_64__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(base_64__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../config */ "./src/config.ts");
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../state */ "./src/state.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");
/* harmony import */ var _auth_broadcast_routes__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./auth_broadcast_routes */ "./src/api/auth_broadcast_routes.ts");
/* harmony import */ var _auth_channel_routes__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./auth_channel_routes */ "./src/api/auth_channel_routes.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _fetch;






class AuthenticatedRoutes {
    constructor(fetch) {
        _fetch.set(this, void 0);
        __classPrivateFieldSet(this, _fetch, fetch);
    }
    logout() {
        _state__WEBPACK_IMPORTED_MODULE_2__.STATE.lastAuthToken = null;
    }
    authenticate(clientId, clientSecret) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = new URLSearchParams({
                    'grant_type': 'client_credentials',
                    'scope': 'owner'
                });
                const response = yield __classPrivateFieldGet(this, _fetch).call(this, `${_config__WEBPACK_IMPORTED_MODULE_1__.AUTH_ROOT}/oauth2/token`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Authorization": `Basic ${base_64__WEBPACK_IMPORTED_MODULE_0___default().encode(`${clientId}:${clientSecret}`)}`,
                    },
                    body,
                });
                const result = yield response.json();
                _state__WEBPACK_IMPORTED_MODULE_2__.STATE.lastAuthToken = result.access_token;
                return result;
            }
            catch (error) {
                console.error("Error authenticating:", error);
                throw error;
            }
        });
    }
    account() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!_state__WEBPACK_IMPORTED_MODULE_2__.STATE.lastAuthToken) {
                    throw new Error("Authentication is required");
                }
                const response = yield __classPrivateFieldGet(this, _fetch).call(this, `${_config__WEBPACK_IMPORTED_MODULE_1__.API_ROOT}/account`, {
                    headers: (0,_utils__WEBPACK_IMPORTED_MODULE_3__.authHeaders)(),
                });
                return yield response.json();
            }
            catch (error) {
                console.error("Error fetching account:", error);
                throw error;
            }
        });
    }
    get broadcasts() {
        return new _auth_broadcast_routes__WEBPACK_IMPORTED_MODULE_4__.default(__classPrivateFieldGet(this, _fetch));
    }
    get channels() {
        return new _auth_channel_routes__WEBPACK_IMPORTED_MODULE_5__.default(__classPrivateFieldGet(this, _fetch));
    }
}
_fetch = new WeakMap();


/***/ }),

/***/ "./src/api/base_routes.ts":
/*!********************************!*\
  !*** ./src/api/base_routes.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BaseAuthenticatedRoute": () => /* binding */ BaseAuthenticatedRoute
/* harmony export */ });
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config */ "./src/config.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");
//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _fetch;


class BaseAuthenticatedRoute {
    constructor(fetch) {
        _fetch.set(this, void 0);
        __classPrivateFieldSet(this, _fetch, fetch);
    }
    get resourceBase() {
        throw new Error("NotImplemented");
    }
    list(params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield __classPrivateFieldGet(this, _fetch).call(this, `${_config__WEBPACK_IMPORTED_MODULE_0__.API_ROOT}/${this.resourceBase}`, {
                    method: 'GET',
                    headers: Object.assign(Object.assign({}, (0,_utils__WEBPACK_IMPORTED_MODULE_1__.authHeaders)()), { 'Content-Type': 'application/json' }),
                });
                return (0,_utils__WEBPACK_IMPORTED_MODULE_1__.parseFetchedList)(response);
            }
            catch (error) {
                throw new Error(`Error in list: ${error.message}`);
            }
        });
    }
    get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id) {
                throw new Error('id is required');
            }
            try {
                const response = yield __classPrivateFieldGet(this, _fetch).call(this, `${_config__WEBPACK_IMPORTED_MODULE_0__.API_ROOT}/${this.resourceBase}/${id}`, {
                    method: 'GET',
                    headers: Object.assign(Object.assign({}, (0,_utils__WEBPACK_IMPORTED_MODULE_1__.authHeaders)()), { 'Content-Type': 'application/json' }),
                });
                return response.headers.get('content-type') == 'application/json; charset=utf-8' ? response.json() : response;
            }
            catch (error) {
                throw new Error(`Error in get: ${error.message}`);
            }
        });
    }
    create(params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield __classPrivateFieldGet(this, _fetch).call(this, `${_config__WEBPACK_IMPORTED_MODULE_0__.API_ROOT}/${this.resourceBase}`, {
                    method: 'POST',
                    headers: Object.assign(Object.assign({}, (0,_utils__WEBPACK_IMPORTED_MODULE_1__.authHeaders)()), { 'Content-Type': 'application/json' }),
                    body: JSON.stringify(params),
                });
                return response.headers.get('content-type') == 'application/json; charset=utf-8' ? response.json() : response;
            }
            catch (error) {
                throw new Error(`Error in create: ${error.message}`);
            }
        });
    }
    update(id, params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id) {
                throw new Error('id is required');
            }
            try {
                const response = yield __classPrivateFieldGet(this, _fetch).call(this, `${_config__WEBPACK_IMPORTED_MODULE_0__.API_ROOT}/${this.resourceBase}/${id}`, {
                    method: 'PUT',
                    headers: Object.assign(Object.assign({}, (0,_utils__WEBPACK_IMPORTED_MODULE_1__.authHeaders)()), { 'Content-Type': 'application/json' }),
                    body: JSON.stringify(params),
                });
                return response.headers.get('content-type') == 'application/json; charset=utf-8' ? response.json() : response;
            }
            catch (error) {
                throw new Error(`Error in update: ${error.message}`);
            }
        });
    }
    destroy(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id) {
                throw new Error('id is required');
            }
            try {
                const response = yield __classPrivateFieldGet(this, _fetch).call(this, `${_config__WEBPACK_IMPORTED_MODULE_0__.API_ROOT}/${this.resourceBase}/${id}`, {
                    method: 'DELETE',
                    headers: Object.assign(Object.assign({}, (0,_utils__WEBPACK_IMPORTED_MODULE_1__.authHeaders)()), { 'Content-Type': 'application/json' }),
                });
                return response.headers.get('content-type') == 'application/json; charset=utf-8' ? response.json() : response;
            }
            catch (error) {
                throw new Error(`Error in destroy: ${error.message}`);
            }
        });
    }
}
_fetch = new WeakMap();


/***/ }),

/***/ "./src/api/broadcast_routes.ts":
/*!*************************************!*\
  !*** ./src/api/broadcast_routes.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => /* binding */ BroadcastRoutes
/* harmony export */ });
/* harmony import */ var qs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! qs */ "qs");
/* harmony import */ var qs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(qs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../config */ "./src/config.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _fetch;
//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//



class BroadcastRoutes {
    constructor(fetch) {
        _fetch.set(this, void 0);
        __classPrivateFieldSet(this, _fetch, fetch);
    }
    list(channelId, params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!channelId) {
                return Promise.reject("channelId is required");
            }
            const res = yield __classPrivateFieldGet(this, _fetch).call(this, `${_config__WEBPACK_IMPORTED_MODULE_1__.API_ROOT}/channels/${channelId}/broadcasts?${qs__WEBPACK_IMPORTED_MODULE_0___default().stringify(params)}`);
            return yield (0,_utils__WEBPACK_IMPORTED_MODULE_2__.parseFetchedList)(res);
        });
    }
    get(broadcastId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!broadcastId) {
                return Promise.reject("broadcastId is required");
            }
            const res = yield __classPrivateFieldGet(this, _fetch).call(this, `${_config__WEBPACK_IMPORTED_MODULE_1__.API_ROOT}/broadcasts/${broadcastId}`);
            return yield res.json();
        });
    }
}
_fetch = new WeakMap();


/***/ }),

/***/ "./src/api/channel_routes.ts":
/*!***********************************!*\
  !*** ./src/api/channel_routes.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => /* binding */ ChannelRoutes
/* harmony export */ });
/* harmony import */ var qs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! qs */ "qs");
/* harmony import */ var qs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(qs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../config */ "./src/config.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _fetch;
//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//



class ChannelRoutes {
    constructor(fetch) {
        _fetch.set(this, void 0);
        __classPrivateFieldSet(this, _fetch, fetch);
    }
    list(accountId, params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!accountId) {
                return Promise.reject("accountId is required");
            }
            const res = yield __classPrivateFieldGet(this, _fetch).call(this, `${_config__WEBPACK_IMPORTED_MODULE_1__.API_ROOT}/accounts/${accountId}/channels?${qs__WEBPACK_IMPORTED_MODULE_0___default().stringify(params)}`);
            return yield (0,_utils__WEBPACK_IMPORTED_MODULE_2__.parseFetchedList)(res);
        });
    }
}
_fetch = new WeakMap();


/***/ }),

/***/ "./src/api/index.ts":
/*!**************************!*\
  !*** ./src/api/index.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "api": () => /* binding */ api,
/* harmony export */   "default": () => __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ });
/* harmony import */ var _broadcast_routes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./broadcast_routes */ "./src/api/broadcast_routes.ts");
/* harmony import */ var _channel_routes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./channel_routes */ "./src/api/channel_routes.ts");
/* harmony import */ var _view_routes__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./view_routes */ "./src/api/view_routes.ts");
/* harmony import */ var _auth_routes__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./auth_routes */ "./src/api/auth_routes.ts");
//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _fetch;




class api {
    constructor(fetch) {
        _fetch.set(this, void 0);
        __classPrivateFieldSet(this, _fetch, fetch);
        this.broadcasts = new _broadcast_routes__WEBPACK_IMPORTED_MODULE_0__.default(__classPrivateFieldGet(this, _fetch));
        this.channels = new _channel_routes__WEBPACK_IMPORTED_MODULE_1__.default(__classPrivateFieldGet(this, _fetch));
        this.auth = new _auth_routes__WEBPACK_IMPORTED_MODULE_3__.default(__classPrivateFieldGet(this, _fetch));
        this.views = new _view_routes__WEBPACK_IMPORTED_MODULE_2__.default(__classPrivateFieldGet(this, _fetch));
    }
}
_fetch = new WeakMap();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (api);


/***/ }),

/***/ "./src/api/view_routes.ts":
/*!********************************!*\
  !*** ./src/api/view_routes.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => /* binding */ ViewRoutes
/* harmony export */ });
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config */ "./src/config.ts");
//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _fetch;

class ViewRoutes {
    constructor(fetch) {
        _fetch.set(this, void 0);
        __classPrivateFieldSet(this, _fetch, fetch);
    }
    get(broadcastId, params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!broadcastId) {
                return Promise.reject('broadcastId is required');
            }
            try {
                const response = yield __classPrivateFieldGet(this, _fetch).call(this, `${_config__WEBPACK_IMPORTED_MODULE_0__.API_ROOT}/broadcasts/${broadcastId}/view`, { params });
                const view = yield response.json();
                if (view && view.playlist) {
                    if (view.status.indexOf('live') < 0 && view.status.indexOf('recorded') < 0) {
                        // Not yet ready; shouldn't start looking at this playlist.
                        console.log('Playlist not yet ready; status is [', view.status, '] for ', view.playlist);
                        view.playlist = '';
                    }
                }
                return view;
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
}
_fetch = new WeakMap();


/***/ }),

/***/ "./src/config.ts":
/*!***********************!*\
  !*** ./src/config.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "API_ROOT": () => /* binding */ API_ROOT,
/* harmony export */   "AUTH_ROOT": () => /* binding */ AUTH_ROOT
/* harmony export */ });
//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//
const API_ROOT = 'https://rest.boxcast.com';
const AUTH_ROOT = 'https://auth.boxcast.com';


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Main": () => /* binding */ Main
/* harmony export */ });
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./api */ "./src/api/index.ts");
/* harmony import */ var _analytics__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./analytics */ "./src/analytics/index.ts");
//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _fetch;


class Main {
    constructor(fetch) {
        _fetch.set(this, void 0);
        __classPrivateFieldSet(this, _fetch, fetch);
        this.api = new _api__WEBPACK_IMPORTED_MODULE_0__.api(__classPrivateFieldGet(this, _fetch));
        this.analytics = new _analytics__WEBPACK_IMPORTED_MODULE_1__.analytics(__classPrivateFieldGet(this, _fetch));
    }
}
_fetch = new WeakMap();


/***/ }),

/***/ "./src/node.ts":
/*!*********************!*\
  !*** ./src/node.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => /* binding */ BoxCastSDK
/* harmony export */ });
/* harmony import */ var _main__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./main */ "./src/main.ts");

class BoxCastSDK extends _main__WEBPACK_IMPORTED_MODULE_0__.Main {
    constructor() {
        super(__webpack_require__(/*! node-fetch */ "node-fetch"));
    }
}


/***/ }),

/***/ "./src/state.ts":
/*!**********************!*\
  !*** ./src/state.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "STATE": () => /* binding */ STATE
/* harmony export */ });
//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//
// Global state
var STATE = {
    lastAuthToken: null
};


/***/ }),

/***/ "./src/utils/clock.ts":
/*!****************************!*\
  !*** ./src/utils/clock.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => /* binding */ Clock
/* harmony export */ });
//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//
class Clock {
    static now() {
        return new Date();
    }
}


/***/ }),

/***/ "./src/utils/index.ts":
/*!****************************!*\
  !*** ./src/utils/index.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Clock": () => /* reexport safe */ _clock__WEBPACK_IMPORTED_MODULE_0__.default,
/* harmony export */   "MonotonicClock": () => /* reexport safe */ _monotonic_clock__WEBPACK_IMPORTED_MODULE_1__.default,
/* harmony export */   "getStorage": () => /* binding */ getStorage,
/* harmony export */   "uuid": () => /* binding */ uuid,
/* harmony export */   "cleanQuotesFromViewerID": () => /* binding */ cleanQuotesFromViewerID,
/* harmony export */   "normalizeError": () => /* binding */ normalizeError,
/* harmony export */   "normalizeAxiosError": () => /* binding */ normalizeAxiosError,
/* harmony export */   "parseFetchedList": () => /* binding */ parseFetchedList,
/* harmony export */   "authHeaders": () => /* binding */ authHeaders
/* harmony export */ });
/* harmony import */ var _clock__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./clock */ "./src/utils/clock.ts");
/* harmony import */ var _monotonic_clock__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./monotonic_clock */ "./src/utils/monotonic_clock.ts");
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../state */ "./src/state.ts");
//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};





// /* eslint max-len: 0 */
function getStorage() {
    try {
        try {
            localStorage.setItem('__sentinel__', 'foo');
            if (localStorage.getItem('__sentinel__') === 'foo') {
                localStorage.removeItem('__sentinel__');
                return localStorage;
            }
            return sessionStorage;
        }
        catch (e) {
            // Possible DOMException reading localStorage; try sessionStorage
            return sessionStorage;
        }
    }
    catch (e) {
        // Possible DOMException reading sessionStorage; use in-memory mock
        const mockStorage = {
            getItem: function (key) {
                return this[key];
            },
            setItem: function (key, value) {
                this[key] = value;
            }
        };
        return mockStorage;
    }
}
function uuid() {
    var r = function (n) {
        var text = '', possible = '0123456789ABCDEF';
        for (var i = 0; i < 5; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };
    return r(8) + '-' + r(4) + '-' + r(4) + '-' + r(4) + '-' + r(12);
}
function cleanQuotesFromViewerID(viewerId) {
    if (!viewerId || viewerId.length < 3) {
        return viewerId || '';
    }
    if (viewerId[0] === '"' && viewerId[viewerId.length - 1] === '"') {
        return viewerId.substring(1, viewerId.length - 1);
    }
    return viewerId;
}
function normalizeError(error, source) {
    // This error object could come from various sources, depending on playback
    // and circumstance:
    //   a) string error description
    //   b) dictionary with `message` and `data` keys
    //   c) dictionary with `evt` and `data` keys from hls.js, where `data` is an object with `type`, `details`, and a whole bunch of other keys
    //   d) error object from native HTML5 video element
    //
    // Please note, per the HTML5 spec, these are the following error code values:
    //   MEDIA_ERR_ABORTED (1) The fetching process for the media resource was aborted by the user agent at the user's request.
    //   MEDIA_ERR_NETWORK (2) A network error of some description caused the user agent to stop fetching the media resource, after the resource was established to be usable.
    //   MEDIA_ERR_DECODE (3) An error of some description occurred while decoding the media resource, after the resource was established to be usable.
    //   MEDIA_ERR_SRC_NOT_SUPPORTED (4) The media resource indicated by the src attribute was not suitable.
    //
    // Let's try to normalize the reported error a touch
    error = error || {};
    const code = (error.code) || (error.data && error.data.code);
    let message = error.message;
    if (!message && error.data) {
        message = error.data.details /* hlsError, cannot be stringified */ || JSON.stringify(error.data);
    }
    else {
        message = error.toString();
    }
    if (message === '[object MediaError]') {
        message = 'MediaError occurred';
    }
    let errorObject = {
        message: message,
        code: code,
        data: error.data
    };
    if (source) {
        errorObject.source = source;
    }
    return errorObject;
}
function normalizeAxiosError(error) {
    // Error could be nil, or it could be a response-like object, or it could
    // contain a nested response :(
    if (!error) {
        return 'Unknown error';
    }
    else if (error.response && error.response.data) {
        return error.response.data;
    }
    else if (error.data) {
        return error.data;
    }
    return error;
}
function parseFetchedList(response) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const isJsonResponse = ((_a = response.headers) === null || _a === void 0 ? void 0 : _a.get('content-type')) && ((_b = response.headers) === null || _b === void 0 ? void 0 : _b.get('content-type').indexOf('application/json')) == 0;
        let pagination = JSON.parse(((_c = response.headers) === null || _c === void 0 ? void 0 : _c.get('x-pagination')) || "{}");
        let obj = {
            pagination,
        };
        obj.data = isJsonResponse ? yield response.json() : response;
        return obj;
    });
}
function authHeaders() {
    return {
        Authorization: `Bearer ${_state__WEBPACK_IMPORTED_MODULE_2__.STATE.lastAuthToken}`,
    };
}


/***/ }),

/***/ "./src/utils/monotonic_clock.ts":
/*!**************************************!*\
  !*** ./src/utils/monotonic_clock.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => /* binding */ MonotonicClock
/* harmony export */ });
/* harmony import */ var _clock__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./clock */ "./src/utils/clock.ts");
//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

var supportsPerformanceAPI = null;
class MonotonicClock {
    static now() {
        if (supportsPerformanceAPI === null) {
            // This code should only run on the first call to this function to evaluate whether or not the performance API is
            // supported.
            supportsPerformanceAPI = !!(window.performance && window.performance.now);
            if (supportsPerformanceAPI) {
                // Test it out... let's make sure it doesn't explode
                try {
                    window.performance.now();
                }
                catch (err) {
                    console.warn('Error calling window.performance.now():', err);
                    supportsPerformanceAPI = false;
                }
            }
            if (!supportsPerformanceAPI) {
                console.warn('Browser does not support performance API; MonotonicClock falling back to Clock');
            }
        }
        if (supportsPerformanceAPI) {
            return window.performance.now();
        }
        return _clock__WEBPACK_IMPORTED_MODULE_0__.default.now().getTime();
    }
}


/***/ }),

/***/ "base-64":
/*!**************************!*\
  !*** external "base-64" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("base-64");;

/***/ }),

/***/ "node-fetch":
/*!*****************************!*\
  !*** external "node-fetch" ***!
  \*****************************/
/***/ ((module) => {

module.exports = require("node-fetch");;

/***/ }),

/***/ "platform":
/*!***************************!*\
  !*** external "platform" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("platform");;

/***/ }),

/***/ "qs":
/*!*********************!*\
  !*** external "qs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("qs");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => module['default'] :
/******/ 				() => module;
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__("./src/node.ts");
/******/ })()
.default;
});
//# sourceMappingURL=node.js.map