'use strict';

/**
 * Current running task ID
 * `null` or String
 */

var currentTask = null;

/**
 * Running task status
 * `null` or `"completed"`
 */

var taskStatus = null;

/**
 * Default timespan
 */

// var timespan = 25 * 60 * 1000;
var timespan = 5000;

/**
 * break timespan
 */

// var breakTimespan = 5 * 60 * 1000;
// var longBreakTimespan = 30 * 60 * 1000;
var breakTimespan = 5000;
var longBreakTimespan = 5000;

/**
 * Times break
 */

var timesbreak = 0;

/**
 * States for the extension
 */

var STATES = {
  UNINITIALIZED: 0x00
, INITIALIZED: 0x01
, IDLE: 0x02
, RUNNING: 0x03
, BREAK: 0x04
}

/**
 * Keep track of extension's state
 */

var state = STATES.UNINITIALIZED;

/**
 * Bridge between background and popup
 * initalize after popup connect with background
 */

var popup;

/**
 *
 */

var al = chrome.alarms;

var Task = {
  task: null
  // 0 = no task
  // 1 = running task
  // 2 = task ended
  // 3 = taking rest
  // 4 = rest ended
, state: 0
, start: function taskstart(msg){
    console.info('INFO: Starting Task');

    var goal = +Date.now() + timespan;

    this.state = 1;
    this.task = msg.task;

    al.create('taskend', { when: goal });
    popup.postMessage({
      name: 'taskstarted'
    , task: this.task
    , goal: goal
    });
  }
, timeleft: function(){
    console.info('INFO: Getting Task timeleft');
    al.get('tasktimeleft', function(alarm){
      popup.postMessage({
        name: 'tasktimeleft'
      , timeleft: alarm.scheduledTime - (+new Date)
      });
    });
  }
, end: function(opts){
    console.info('INFO: Ending Task');
    this.state = 2;
    popup.postMessage({
      name: 'taskended'
    , task: this.task
    });
    if (opts && opts.force){
      al.clear('taskend');
    }
  }
, dobreak: function(){
    console.info('INFO: Starting break');
    this.state = 3;
    timesbreak += 1;
    var ts = timesbreak % 4 ? breakTimespan : longBreakTimespan;
    var goal = +Date.now() + ts;
    al.create('breakend', { when: goal })
    popup.postMessage({
      name: 'breakstarted'
    , task: this.task
    , times: timesbreak
    , goal: goal
    })
  }
, endbreak: function(){
    console.info('INFO: Ending break');
    this.state = 4;
    popup.postMessage({
      name: 'breakended'
    , task: this.task
    });
  }
};

chrome.runtime.onConnect.addListener(function(port){
  if ('pop' !== port.name) return;

  popup = port;
  port.onDisconnect.addListener(function(){
    popup = null;
  });
  port.onMessage.addListener(function(msg){
    if (!msg.name) return;

    switch(msg.name){
      case 'tasktimeleft': Task.timeleft(); break;
      case 'taskstart': Task.start(msg); break;
      case 'taskfinishearly': Task.end({ force: true }); break;
      case 'dobreak': Task.dobreak(); break;
    }
  });
});

chrome.alarms.onAlarm.addListener(function(alarm){
  console.log(alarm);
  switch(alarm.name){
    case 'taskend': Task.end(); break;
    case 'breakend': Task.endbreak(); break;
  }
});
