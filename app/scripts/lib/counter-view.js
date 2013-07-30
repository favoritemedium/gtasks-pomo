/*global Emitter */

(function(){

  var round = Math.round;

  var html = '\
    <div class="counter curved-shadow"> \
      <div class="state-art"> \
        <object id="tomato" data="/images/tomato.svg" type="image/svg+xml"></object> \
        <object id="timer" data="/images/timer.svg" type="image/svg+xml"></object> \
      </div> \
      <div class="timer"> \
        <span class="minutes"></span> \
        <span class="seconds"></span> \
      </div> \
    </div> \
  ';

  var TIMERSTATES = {
    DOTASK: 0x00
  , DOBREAK: 0x01
  , DOLONGBREAK: 0x02
  , IDLE: 0x04
  };

  /**
   * Expose `CounterView`
   */

  window.CounterView = CounterView;

  /**
   * Constructor
   *
   * @param {Object} config
   */

  function CounterView(config){
    var el = domify(html);

    Emitter.call(this);

    this.el = el;
    this.ui = {
      minutes: el.querySelector('.minutes')
    , seconds: el.querySelector('.seconds')
    , tomato: el.querySelector('#tomato')
    , timer: el.querySelector('#timer')
    };
    this.config = config;
    this.goal = null;
    this.state = TIMERSTATES.IDLE;

    this.reset();
  }

  /**
   * Inherits from `Emitter`
   */

  var proto = CounterView.prototype = new Emitter();

  proto.timeleft = function(){
    var timeleft = Math.round((this.goal - (new Date)) / 1000)
      , secs = timeleft % 60
      , mins = (timeleft - secs) / 60 | 0;
    return {
      minutes: mins
    , seconds: secs
    };
  };

  proto.update_timeleft = function(){
    var timeleft = this.timeleft();
    this.ui.minutes.textContent = (timeleft.minutes < 10 ? '0' : '') + timeleft.minutes;
    this.ui.seconds.textContent = (timeleft.seconds < 10 ? '0' : '') + timeleft.seconds;
  };

  proto.setupTask = function(){ };

  proto.resume = function(alarm){
    switch(alarm.state) {
      case 'break':
      case 'restart':
        this.dobreak(alarm.goal, alarm.times);
        break;
      case 'start':
        this.start(alarm.goal);
        break;
      case 'finish':
        this.reset();
        break;
    }
  };

  proto['break'] = function(){
    clearTimeout(this._timeout);
    this.state = TIMERSTATES.IDLE;
  };

  proto.reset = function(){
    var secs = (this.config.timespan.task / 1000) % 60;
    var mins = (this.config.timespan.task / 1000 - secs) / 60;

    this.ui.minutes.textContent = (mins < 10 ? '0' : '') + mins;
    this.ui.seconds.textContent = (secs < 10 ? '0' : '') + secs;

    this.goal = null;
    this.showTomato();
    this.stop();
  };

  proto.showClock = function(){
    this.ui.timer.classList.remove('invisible');
    this.ui.tomato.classList.add('invisible');
  };

  proto.showTomato = function(){
    this.ui.timer.classList.add('invisible');
    this.ui.tomato.classList.remove('invisible');
  };

  proto.update_clock = function(){
    var svg = this.ui.timer.contentDocument;

    if (! (this.goal && svg) ) { return; }

    var timespan = this.config.timespan;
    var selector;
    if (this.state === TIMERSTATES.DOTASK) {
      selector = '#timer-task';
      ts = timespan.task;
    } else {
      selector = '#timer-break';
      ts = this.state == TIMERSTATES.DOBREAK ?
        timespan.rest : timespan.longrest;
    }

    // extra 180 to buffer for the time lost in
    // between the communication of background
    // page and the popup
    var diff = 1 - (this.goal - Date.now() - 180) / ts;
    var deg = 360 * diff | 0;
    target = svg.querySelector(selector);
    target.style.webkitTransform = 'rotate(' + deg + 'deg)';
  };

  /**
   * Toggle state to start
   */

  proto.start = function(goal){
    var ui = this.ui;
    this.goal = +goal;
    this.state = TIMERSTATES.DOTASK;
    this.showClock();
    this.tick();
  };

  /**
   * Rest
   */

  proto.dobreak = function(goal, times){
    if (times % 4)
      this.state = TIMERSTATES.DOBREAK;
    else
      this.state = TIMERSTATES.DOLONGBREAK;

    this.goal = goal;
    this.showClock();
    this.tick();
  };

  /**
   * Toggle state to stop
   */

  proto.stop = function(){
    this.state = TIMERSTATES.IDLE;
    clearTimeout(this._timeout);
  };

  proto.breakstop = proto.stop;

  /**
   * Handles tick of the counter
   */

  proto.tick = function(){
    if (this.goal < +new Date) return;
    this.update_timeleft();
    this.update_clock();
    this._timeout = setTimeout(this.tick.bind(this), 300);
  };


})();