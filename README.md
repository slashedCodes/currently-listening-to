# Currently Listening To...

This is a server that returns the last song you've listened to on last.fm in a stylized, windows media player 12 style image, made specifically for putting on a spacehey profile.

# API

```
/:user
Returns the image. If an error occours, it will return the default WMP12 artwork.
```

# Setup

1. get a last.fm API key
2. ``git clone https://github.com/slashedCodes/currently-listening-to``
3. make a ``.env`` file and put your api key in there: ``API_KEY=[YOUR API KEY HERE]``
4. boot up the server by running ``node .`` or [pm2](https://pm2.keymetrics.io/) because its better