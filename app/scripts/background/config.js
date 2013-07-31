
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
   * Times of task completed
   */

  var times = 0;

  /**
   * Timespans for tasks and break
   */

  var timespan = {
    task: 25 * 60 * 1000 // 25mins
  , rest: 5 * 60 * 1000 // 5mins
  , longrest: 30 * 60 * 1000 // 30mins
  };


  window.Config = {
    timespan: timespan
  , times: times
  };

  window.AppConfig = {
    id: clientId
  , secret: clientSecret
  };

})();