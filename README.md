# BoxCast SDK for JavaScript


This library can be used for custom integration projects where the standard BoxCast embedded
player may not suffice.

We do strongly encourage you to use the standard embedded player instead of this library where possible,
because it is the most robust and well-tested playback option.

See Related:
 * [BoxCast Embedded Player Documentation](http://boxcast.github.io/boxcast_js_docs/)
 * [BoxCast Example Video Portal](https://github.com/boxcast/example_video_portal_vuejs)
 * [BoxCast API Documentation](http://boxcast.github.io/boxcast_api/)
 * [BoxCast SDK for React Native](https://github.com/boxcast/boxcast-sdk-react-native)

## Getting Started
There are a few ways to use this SDK: on the server (node or serverless) via NPM, or in the browser (via NPM or `<script>` tag). If you are importing it via NPM, please make sure you are importing from the correct entry point (node or browser). If you are unsure which, please contact BoxCast developer support.

**Please note: running the SDK on node or within a severless environment is required to make Authenticated API calls**

You will need to know your BoxCast account ID and corresponding channel IDs in order to properly
utilize this library.  Contact BoxCast developer support if you need assistance.

## Running on Node\Serverless
```javascript
npm install @boxcast/boxcast-sdk-js --save

import BoxCastSDK from "@boxcast/boxcast-sdk-js/node";
const { analytics, api } = new BoxCastSDK();
```
## Running in Browser\Client Application
```javascript
npm install @boxcast/boxcast-sdk-js --save

import BoxCastSDK from "@boxcast/boxcast-sdk-js/browser";
const { analytics, api } = new BoxCastSDK();
```
## Installing via `<script>` tag
```html
<script src="https://js.boxcast.com/libs/boxcast-sdk-js-2.0.1/browser.js"></script>
<script>
  const { analytics, api } = new BoxCastSDK();
</script>
```


## Public API Queries

Use the `api` object to query the BoxCast API in public scope.  All methods return a promise.  List
responses contain both pagination information and resulting data.

Notes:

 * Authenticated or restricted broadcasts (ticketed, etc) are not supported and must be
   viewed in the native boxcast.js player.
 * Your API credentials (client ID, secret) are not required to access these routes.

```javascript
// List Channels
api.channels.list(account_id, {
  s: 'name', // sort by
  l: 20,     // page limit
  p: 0       // page number
});

// List Broadcasts
api.broadcasts.list(channel_id, {
  q: 'timeframe:current',
  s: '-starts_at',
  l: 20,
  p: 0
});

// Get a Broadcast
api.broadcasts.get(broadcast_id);

// Get Views for a Broadcast
api.views.get(broadcast_id, {
  channel_id: channel_id,
  host: window.location.hostname,
  extended: true
});
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

## Authenticated API Queries

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
// Get an Auth Token
api.auth.authenticate(CLIENT_ID, CLIENT_SECRET);

// Get Account Details
api.auth.account();

// Create a Channel
api.auth.channels.create({name: 'My New Channel'});

// List Channels
api.auth.channels.list({
  s: 'name', // sort by
  l: 20,     // page limit
  p: 0       // page number
});

// List Broadcasts
api.auth.broadcasts.list({
  q: 'timeframe:past',   // query
  s: '-starts_at',          // sort by
  l: 20,                    // page limit
  p: 0                      // page number
})

// Find a Broadcast by ID
api.auth.broadcasts.get(broadcastId);

// Log Out
api.auth.logout();
```

## Running Tests
Tests in this SDK are handled by Jest, and in order to run them, you will need a BoxCast Client ID and Client Secret key. These come from the API keys page in your Dashboad within the Settings page. To set these keys, create a file at `./.jest/setEnvVars.ts` with the following lines. Your Client ID and Client Secret should go inside the empty strings.
```shell
process.env.BOXCAST_SDK_JS__TEST_CLIENT_ID = ''
process.env.BOXCAST_SDK_JS__TEST_CLIENT_SECRET = ''
```
Once you've set these, you can run the tests with `npm run test` or a single test with `npm run test -- test/test-name.ts`