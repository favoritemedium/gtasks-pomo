
(function(){

  /**
   * Expose `Timespan`
   */

  window.Timespan = Timespan;

  function Timespan(ori){
    // default values
    this.task = ori.task;
    this.rest = ori.rest;
    this.longrest = ori.longrest;

    // get user set value from localStorage
    try {
      var source = localStorage.getItem('tomato-tasks-timespan');
      var data = JSON.parse(source);
      for (var k in this) this[k] = data[k];
    } catch(e) { /* do nothing */ }
  }

  Timespan.prototype.save = function(data){
    for (var k in this) this[k] = +data[k] || this[k];
    localStorage.setItem('tomato-tasks-timespan', JSON.stringify(this));
  };

})();
