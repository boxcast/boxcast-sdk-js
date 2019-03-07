# BoxCast SDK for JavaScript

![Travis](https://travis-ci.org/boxcast/boxcast-sdk-js.svg?branch=master)

This library can be used for custom integration projects where the standard BoxCast embedded
player may not suffice.

We do strongly encourage you to use the standard embedded player instead of this library where possible,
because it is the most robust and well-tested playback option.

See Related:
 * [BoxCast Embedded Player Documentation](http://boxcast.github.io/boxcast_js_docs/)
 * [BoxCast Example Video Portal](https://github.com/boxcast/example_video_portal_vuejs)
 * [BoxCast API Documentation](http://boxcast.github.io/boxcast_api/)

## Getting Started

```
<script src="https://js.boxcast.com/libs/boxcast-sdk-latest.min.js"></script>
<script>
  var analytics = BoxCastSDK.analytics;
  var api = BoxCastSDK.api;
</script>
```

_or, install via NPM_

```
# First, install the SDK from NPM
npm install boxcast-sdk-js --save

# Then, in your javascript project:
var { analytics, api } = require('boxcast-sdk-js');
```

You will need to know your BoxCast account ID and corresponding channel IDs in order to properly
utilize this library.  Contact BoxCast developer support if you need assistance.

## Public API Queries

Use the `api` object to query the BoxCast API in public scope.  All methods return a promise.  List
responses contain both pagination information and resulting data.

Notes:

 * Authenticated or restricted broadcasts (ticketed, etc) are not supported and must be
   viewed in the native boxcast.js player.
 * Your API credentials (client ID, secret) are not required to access these routes.

```javascript
api.channels.list(account_id, {
  s: 'name', // sort by
  l: 20,     // page limit
  p: 0       // page number
}).then((r) => console.log(r.pagination, r.data));

api.broadcasts.list(channel_id, {
  q: 'timeframe:current',
  s: '-starts_at',
  l: 20,
  p: 0
}).then((r) => console.log(r.pagination, r.data));

api.broadcasts.get(broadcast_id)
  .then((broadcast) => console.log(broadcast));

api.views.get(broadcast_id, {
  channel_id: channel_id,
  host: window.location.hostname,
  extended: true
}).then((view) => console.log(view));
```

## Analytics

Use the `analytics` object to ensure your custom video player is properly reporting playback metrics.

```javascript
analytics.configure({
  browser_name: 'My Browser',       // or detected automatically from user agent
  browser_version: '3.0',           // or detected automatically from user agent
  player_version: 'my-player v2.1'  // or defaults to current version of boxcast-sdk-js
});

analytics.mode('html5').attach({
  video: document.querySelector('video'),
  broadcast: broadcast,             // must contain keys: timeframe, id, account_id
  channel_id: channel_id            // or defaults to broadcast.channel_id
});

// ... or if using video.js ... //

analytics.mode('video.js').attach({
  player: player, broadcast: broadcast, channel_id: channel_id
});
```

## Authenticuated API Queries

Use the `api.auth` object to query the BoxCast API in an authenticated scope, using your
API client credentials.  Like the public API quries, all methods return a promise.

Notes:

 * When calling `api.auth.authenticate`, an `access_token` is retrieved and stored
   within the global scope of the application.  This must be called each time the
   application is reloaded to obtain a new token.
 * Your API credentials (client ID, secret) are required to access these methods, and these
   values _should never be shared_.  As a result, please do not allow this code to run
   within a client application in a browser.

```javascript
api.auth.authenticate(
  CLIENT_ID, CLIENT_SECRET
).then((r) => {
  console.log('Authenticated!', r);

  api.auth.account()
    .then((account) => console.log(account));

  api.auth.channels.create({
    name: 'My New Channel'
  }).then((channel) => {
    console.log('Created a new channel:', channel);

    api.auth.channels.list({
        s: 'name', // sort by
        l: 20,     // page limit
        p: 0       // page number
    }).then((r) => console.log('All Channels:', r.pagination, r.data));
  });

  api.auth.broadcasts.list({
    q: 'timeframe:current',
    s: '-starts_at',
    l: 20,
    p: 0
  }).then((r) => console.log('All Broadcasts:', r.pagination, r.data));

  api.auth.broadcasts.get(broadcast_id)
    .then((broadcast) => console.log(broadcast));

  api.auth.logout();
});
```
