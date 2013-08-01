
(function(){

  /**
   * Client ID from google apis console
   */

  var clientId = '370558891874-tcji26dm7t571mgbl88phr42qdpbtluh.apps.googleusercontent.com';

  /**
   * Client Secret from google apis console
   */

  var clientSecret = 'x0wjP4psSLwuGeQyYtQ37lNg';

  /**
   * Path to audio files
   */

  var successAudioPath = '';
  var breakendAudioPath = '';


  /**
   * Timespans for tasks and break
   */

  var timespan = {
    task: 25 * 60 * 1000 // 25mins
  , rest: 5 * 60 * 1000 // 5mins
  , longrest: 30 * 60 * 1000 // 30mins
  };

  /**
   * Audio on/off
   */

  var audioOn = true;


  window.Config = {
    timespan: new Timespan(timespan)
  };

  window.AppConfig = {
    id: clientId
  , secret: clientSecret
  , audioOn: audioOn
  , successAudioPath: successAudioPath
  , breakendAudioPath: breakendAudioPath
  };

})();