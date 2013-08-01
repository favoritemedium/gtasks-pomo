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

  var accessToken = function(){
    return _google.hasAccessToken() &&
      !_google.isAccessTokenExpired() &&
      _google.getAccessToken() || null;
  };

  var refreshToken = function(){
    return _google.get().refreshToken || null;
  }

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

    _google = new OAuth2('google');
    if (! (accessToken() || refreshToken()) )
      _google.setSource({
        clientId: id,
        clientSecret: secret,
        apiScope: scopes.join(' ')
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
    console.info('INFO: Registering ready function');

    if (!ready) {
      fns.push(fn);
      return;
    }

    console.log('INFO: Google API ready');
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

  Google.get = function(url, query, fn) {
    console.info('INFO: Sending Request to Google API');

    if (!ready) { throw new Error('Google API is not ready'); }

    if ('function' === typeof query) {
      fn = query;
      query = undefined;
    }

    if (_google.isAccessTokenExpired()){
      _google.authorize(function(){
        Google.get(url, query, fn);
      });
      return;
    }

    var qs = '';

    if (query) {
      qs = '?';
      Object.keys(query).forEach(function(k){
        qs += k + '=';
        qs += encodeURIComponent(query[k]);
        qs += '&';
      });
      qs = qs.substring(0, qs.length - 1);
    }

    // TODO:
    // check for token expiry

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url + qs, false);
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

  Google.patch = function(url, data, fn){

    if (_google.isAccessTokenExpired()){
      _google.authorize(function(){
        Google.patch(url, data, fn);
      });
      return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open('PATCH', url, false);
    xhr.setRequestHeader('Authorization', 'OAuth ' + _google.getAccessToken());
    xhr.setRequestHeader('Content-Type', 'application/json');
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
    xhr.send(JSON.stringify(data));
  };

})();
