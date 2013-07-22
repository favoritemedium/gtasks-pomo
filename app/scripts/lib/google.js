/*global OAuth2 */

'use strict';

/*!
 * Wrapper around the OAuth2 library
 * for Google API
 */

(function(){

  var Google = {};

  /**
   * Expose `Google`
   */

  window.Google = Google;

  /**
   * variable to keep track of OAuth state
   *
   * @api private
   */

  var _google;

  /**
   * Ready states of Google OAuth
   *
   * @api private
   */

  var ready = false;

  /**
   * Callbacks to be call after OAuth ready
   *
   * @api private
   */

  var fns = [];

  /**
   * Initialize Google API
   *
   * @param {String} id
   * @param {String} secret
   * @param {Array} scopes
   * @param {Function} fn
   * @api public
   */

  Google.init = function(id, secret, scopes, fn){
    console.info('INFO: Initailizing Google API');

    _google = new OAuth2('google', {
      client_id: id,
      client_secret: secret,
      api_scope: scopes.join(' ')
    });

    if ('function' === typeof fn)
      fns.push(fn);

    _google.authorize(function(){
      ready = true;
      console.info('INFO: Google API ready');
      var fn;
      while(fn = fns.shift()) fn();
    });
  };

  /**
   * Register callback to be call
   * when Google OAuth ready
   *
   * @param {Function} fn
   * @api public
   */

  Google.ready = function(fn){
    if (!ready) {
      fns.push(fn);
      return;
    }

    setTimeout(fn, 0);
  };

  /**
   * Send 'GET' request to Google API
   * callback with `fn(err, data)`
   *
   * @param {String} url
   * @param {Function} fn
   * @api public
   */

  Google.get = function(url, fn) {
    console.info('INFO: Sending Request to Google API');

    if (!ready) { throw new Error('Google OAuth is not ready'); }

    // TODO:
    // check for token expiry

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.setRequestHeader('Authorization', 'OAuth ' + _google.getAccessToken());
    xhr.onreadystatechange = function(event) {
      if (xhr.readyState !== 4) { return; }
      var err;
      if(~[200, 304].indexOf(xhr.status)) {
        console.info('INFO: Google API response');
        try {
          return fn(null, JSON.parse(xhr.responseText));
        } catch(e) {
          err = e;
        }
      } else {
        err = new Error('Unable to get data');
      }
      console.error('ERROR: ', err);
      fn(err);
    };
    xhr.send();
  };

})();
