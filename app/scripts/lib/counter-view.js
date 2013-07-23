/*global Emitter */

(function(){

  /**
   * Constructor
   *
   * @param {Integer} time
   */

  function CounterView(time){
    this.time = time;
    Emitter.call(this);
  }

  /**
   * Inherits from `Emitter`
   */

  CounterView.prototype = new Emitter();

  /**
   * Handles tick of the counter
   */

  CounterView.prototype.tick =
  CounterView.prototype.start = function(){
    var timeleft = this.time - (+new Date);
    this.emit('tick', timeleft);
    if (timeleft <= 0)
      setTimeout(this.tick.bind(this), 500);
  };


})();