
(function(){

  var html = '\
    <div class="counter-action"> \
      <div class="actions"> \
        <button></button> \
        <a class="optional"></a> \
      </div> \
      <p class="message"></p> \
      <p class="break-message"> \
        <span>5</span> minutes break \
      </p> \
    </div> \
  ';

  /**
   * States
   */

  var STATES = {
    START: 0x01
  , RUNNING: 0x02
  , END: 0x03
  , BREAK: 0x04
  , LONGBREAK: 0x05
  , RESTART: 0x06
  };

  /**
   * Expose `CounterActionView`
   */

  window.CounterActionView = CounterActionView;

  /**
   * Constructor
   *
   * @param {Object} config
   */

  function CounterActionView(config){
    Emitter.call(this);

    var el = domify(html);
    this.el = el;
    this._restart = false;
    this.config = config;
    this.ui = {
      main: el.querySelector('.actions button')
    , sub: el.querySelector('.actions a')
    , message: el.querySelector('.message')
    , rest: el.querySelector('.break-message span')
    };
    this.reset();

    this.ui.main.addEventListener('click', this.mainAction.bind(this), false);
    this.ui.sub.addEventListener('click', this.subAction.bind(this), false);
  }

  /**
   * Inherits `Emitter`
   */

  var proto = CounterActionView.prototype = new Emitter();

  /**
   * Handles main actions trigger
   */

  proto.mainAction = function(e){
    var action;
    var task = this.task;

    switch(this.state){
      case STATES.START:
        action = 'start'; break;
      case STATES.RUNNING:
        action = 'finish-early'; break;
      case STATES.END:
        action = 'finish'; break;
      case STATES.BREAK:
        break;
      case STATES.RESTART:
        action = 'start'; break;
    }

    if (action)
      this.emit('action', action, task);
  };

  /**
   * Handles sub actions trigger
   */

  proto.subAction = function(e){
    var action;
    var task = this.task;

    switch(this.state){
      case STATES.START:
      case STATES.RESTART:
        action = 'backtolist'; break;
      case STATES.END:
        action = 'restart';
      break;
      case STATES.RUNNING:
        break;
      case STATES.BREAK:
        break;
    }

    if (action)
      this.emit('action', action, this.task);
  };

  proto.reset = function(){
    this.task = null;
    this.state = null;
  };

  proto.switchState = function(){
    var el = this.el
      , ui = this.ui;

    if (!this.state) {
      this.state = STATES.START;
    }
    switch(this.state){
      case STATES.START:
        ui.main.textContent = 'Start';
        ui.sub.textContent = 'Start a different task?';
        ui.message.textContent = this.task.title;
        el.classList.remove('break');
        el.classList.add('start');
      break;
      case STATES.RESTART:
        ui.main.textContent = 'Restart';
        ui.sub.textContent = 'Start a different task?';
        el.classList.remove('break');
        el.classList.add('start');
      break;
      case STATES.RUNNING:
        ui.main.textContent = 'Finish early?';
        ui.sub.textContent = '';
        el.classList.remove('start');
        el.classList.add('running');
      break;
      case STATES.END:
        ui.main.textContent = 'Finish!';
        ui.sub.textContent = 'Restart?';
        el.classList.remove('running');
        el.classList.add('end');
      break;
      case STATES.BREAK:
      case STATES.LONGBREAK:
        el.classList.remove('start');
        el.classList.remove('running');
        el.classList.remove('end');
        el.classList.add('break');
      break;
    }

  };

  proto.setupTask = function(task){
    console.log('INFO: ACTION VIEW: INIT');
    this.task = task;
    this.state = null;
    this._restart = false;
    this.switchState();
  };

  proto.start = function(){
    console.log('INFO: ACTION VIEW: START');

    this.state = STATES.RUNNING;
    this.switchState();
  };

  proto.stop = function(){
    console.log('INFO: ACTION VIEW: STOP');

    this.state = STATES.END;
    this.switchState();
  };

  proto.resume = function(alarm){
    switch (alarm.state){
      case 'start':
        this.start();
        break;
      case 'break':
        this.dobreak(alarm.goal, alarm.times);
        break;
      case 'restart':
        this.restart(alarm.goal, alarm.times);
        break;
      case 'restartend':
        this.restartstop();
        break;
      case 'finish':
        this.stop();
        break;
    }
  };

  proto.restart = function(goal, times){
    this._restart = true;
    this.dobreak();
  };

  proto['break'] = function(){
    this.state = STATES.END;
    this.switchState();
  };

  proto.dobreak = function(goal, times){
    console.log('INFO: ACTION VIEW: BREAK');

    var state, type;
    var ts = this.config.timespan;

    if (times % 4) {
      state = STATES.BREAK;
      type = 'rest';
    } else {
      state = STATES.LONGBREAK;
      type = 'longrest';
    }

    this.state = state;
    this.ui.rest.textContent = Math.round(ts[type] / 60000);
    this.switchState();
  };

  proto.breakstop = function(){
    console.log('INFO: ACTION VIEW: BREAK STOP');

    if (this._restart) {
      this._restart = false;
      this.state = STATES.RESTART;
      this.switchState();
    } else {
      this.emit('action', 'backtolist');
      return;
    }
  };

  proto.restartstop = function(){
    this.state = STATES.RESTART;
    this.switchState();
  };

  /**
   * Update content for finish
   */

  proto.finish = function(){};
})();