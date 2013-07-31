
# GTasks Pomo

Pomodoro for your GTasks

## Dependencies

```
$ npm install
```

## Setting up

1. Create a new app in [Google APIs Console][1]
2. Generate a client ID
3. Set **Authorized Redirect URIs** to `http://www.google.com/robots.txt`
4. Set **Authorized JavaScript Origins** to `http://www.google.com`
5. Copy and update the client ID and secret in `app/scripts/background/config.js`
6. Load the app into your browser from the Chrome extensions page

[1]: https://code.google.com/apis/console