
(function(){

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

})();