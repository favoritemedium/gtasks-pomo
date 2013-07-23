'use strict';

/**
 * Current running task ID
 * `null` or String
 */

var currentId = null;

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
 * Handles events pubsub
 */

chrome.runtime.onMessage.addListener(function(msg, sender){
  if (! (msg || msg.name) ) return;

  switch(msg.name){
    case 'taskstart':
      currentId = msg.id;
      taskStatus = null;
      chrome.alarms.create(
        'taskend'
      , { when: Date.now() + timespan }
      );
    break;
  }

});

/**
 * Handles pomo task ended
 */

chrome.alarms.onAlarm.addListener(function(alarm){
  switch(alarm.name){
    case 'taskend':
      taskStatus = 'completed';
      alert(currentId + ' Complete');
      currentId = null;
    break;
  }
});
