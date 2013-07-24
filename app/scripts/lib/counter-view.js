/*global Emitter */

(function(){

  var html = '\
    <div class="counter curved-shadow"> \
      <object id="tomato" data="/images/tomato.svg" type="image/svg+xml"></object> \
      <object id="timer" class="hidden" data="/images/timer.svg" type="image/svg+xml"></object> \
      <div class="timer"> \
        <span class="minutes"></span> \
        <span class="seconds"></span> \
      </div> \
    </div> \
  ';

  /**
   * Expose `CounterView`
   */

  window.CounterView = CounterView;

  /**
   * Constructor
   *
   * @param {Integer} time
   */

  function CounterView(time){
    var el = domify(html);
    this.el = el;
    // this.time = time;
    Emitter.call(this);

    el.querySelector('.minutes').textContent = '25';
    el.querySelector('.seconds').textContent = '00';
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