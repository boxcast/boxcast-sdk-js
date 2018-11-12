# BoxCast SDK for JavaScript

This library can be used for custom integration projects where the standard boxcast.js embeddable
video player may not suffice.  We do strongly encourage you to use the standard player where possible,
because it is the most robust and well tested playback option.

## Getting Started

```
<script src="https://js.boxcast.com/libs/boxcast-sdk-latest.min.js"></script>
<script>
    var analytics = window['boxcast-sdk'].analytics;
    var api = window['boxcast-sdk'].api;
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

## API Queries

Use the `api` object to query the BoxCast API for your account.  All methods return a promise.  List
responses contain both pagination information and resulting data.

Note that certain types of authenticated broadcasts (tickted, etc) are not supported and must be
viewed in the native boxcast.js player.

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

Use the `analytics` object to ensure your video player is properly reporting playback metrics.

```javascript
analytics.configure({
    browser_name: 'My Browser',       // or detected automatically from user agent
    browser_version: '3.0',           // or detected automatically from user agent
    player_version: 'my-player v2.1'  // or defaults to current version of boxcast-sdk-js
});

analytics.mode('html5').attach({
    player: $('video'),
    broadcast: broadcast,   // must contain keys: timeframe, id, account_id
    channel_id: channel_id  // or defaults to broadcast.channel_id
});
```

