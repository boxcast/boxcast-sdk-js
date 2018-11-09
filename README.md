# BoxCast SDK for JavaScript

This library can be used for custom integration projects where the standard boxcast.js embeddable
video player may not suffice.  We do strongly encourage you to use the standard player where possible,
because it is the most robust and well tested playback option.

![Travis](https://travis-ci.org/boxcast/boxcast-sdk-js.svg?branch=master)

## Getting Started

```
npm install boxcast-sdk-js --save
```

You will need to know your BoxCast account ID and corresponding channel IDs in order to properly
utilize this library.  Contact BoxCast developer support if you need assistance.

## API Queries

Use the `api` object to query the BoxCast API for your account.  All methods return a promise.  List
responses contain both pagination information and resulting data.

Note that certain types of authenticated broadcasts (tickted, etc) are not supported and must be
viewed in the native boxcast.js player.

```javascript
var { api } = require('boxcast-sdk-js');

api.channels.list(account_id, {s: 'name', l: 20, p: 1}).then((response) => console.log(response));
api.broadcasts.list(channel_id, {q: 'timeframe:current', s: '-starts_at', l: 20, p: 1}).then((response) => console.log(response));
api.broadcasts.get(broadcast_id).then((response) => console.log(response));
api.views.get(broadcast_id, {channel_id: channel_id, host: '', extended: true}).then((response) => console.log(response));
```

## Analytics

Use the `analytics` object to ensure your video player is properly reporting playback metrics.

```javascript
var { analytics } = require('boxcast-sdk-js');

analytics.configure({
	host: 'override', // or window.location.hostname
	os: 'override', // or detected automatically from user agent
	browser_name: 'override', // or detected automatically from user agent
	browser_version: 'override', // or detected automatically from user agent
	player_version: 'override', // or defaults to version of the boxcast plugins library
});

analytics.attach({
	player: $('video'),
	mode: analytics.MODE_HTML5, // or MODE_VIDEOJS or MODE_CLAPPR or MODE_TVMLKIT
	broadcast: broadcast, // must contain keys: timeframe, id, account_id
	channel_id: channel_id, // or defaults to broadcast.channel_id
});
```

