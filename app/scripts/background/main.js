
(function(){

  var al = chrome.alarms;

  /**
   * Items to be set in runtime
   */

  var list, current;

  var items = [];

  /**
   * Callbacks when data is ready
   */

  var fns = [];

  /**
   * Ready state
   */

  var ready = false;


  var config = window.Config;

  var taskport;

  var state = 'idle';

  Google.init(
    '370558891874-tcji26dm7t571mgbl88phr42qdpbtluh.apps.googleusercontent.com'
  , 'x0wjP4psSLwuGeQyYtQ37lNg'
  , ['https://www.googleapis.com/auth/tasks']
  );

  Google.ready(function(){

    TasksList.list(function(err, lists){
      list = lists[0];
      fetchItems(function(){
        ready = true;
        for(var f;f=fns.shift();)
          setTimeout(f,0);
      });
    });
  });

  function fetchItems(fn){
    Task.list(list.id, function(err, _items){
      items = _items;
      fn && fn();
    });
  };

  chrome.runtime.onConnect.addListener(function(port){
    if ('config' !== port.name) return;
    port.onMessage.addListener(function(msg){

    });
  });
  chrome.runtime.onConnect.addListener(function(port){
    if ('task' !== port.name) return;
    taskport = port;
    port.onMessage.addListener(function(msg){
      if (msg.name in actions) {
        actions[msg.name](msg);
      }
    });
    port.onDisconnect.addListener(function(){
      if ('task' == port.name) taskport = undefined;
    });
  });

  var alarmFns = {};

  al.onAlarm.addListener(function(alarm){
    if (false === alarm.name in alarmFns) return;

    switch(alarm.name){
      case 'start':
        state = 'finish';
      break;
      case 'restart':
        state = 'restartend';
      break;
      case 'break':
      case 'breakstop':
        current = null;
        state = 'idle';
      break;
    }

    console.log(alarm.name, state);

    var fn = alarmFns[alarm.name];
    delete alarmFns[alarm.name];
    fn && fn();
  });

  var actions = {};
  actions.start = function(msg){
    var task = msg.task;
    current = task;

    var goal = +Date.now() + config.timespan.task;
    var data = { task: msg.task, goal: goal };
    taskport && taskport.postMessage({ name:msg.name, data:data });

    var stopNS = msg.name == 'break' ? 'break' : '';
    console.log('state', msg.name, stopNS);
    state = stopNS || 'start';
    var alarmId = stopNS+'start';
    alarmFns[alarmId] = function(){
      var data = { task:task };
      console.log(state);
      if (state == 'break'){
        state = 'idle';
      }
      taskport && taskport.postMessage({ name:stopNS+'stop', data:data });
    };
    al.create(alarmId, { when: goal });
  };
  actions.finish =
  actions['finish-early'] = function(msg){
    Task.done(list.id, msg.task.id, function(){
      fetchItems(function(){
        if (msg.name == 'finish-early') {
          msg.name = 'break';
          // actions['break'](msg, taskport);
        } else {
          taskport && taskport.postMessage({ name:msg.name, task:msg.task });
        }
        actions['break'](msg, taskport);
      });
    });
  };
  actions.current = function(msg){
    var data = { current:current };
    var send = function(){ taskport && taskport.postMessage({ name:'current', data:data }); };
    console.log(state);
    if (current && 'idle' != state) {
      data.alarm = {};
      data.alarm.state = state;
      try {
        al.get(state, function(alarm){
          if (alarm) {
            data.alarm.goal = alarm.scheduledTime;
            data.alarm.times = config.times;
          }
          send();
        });
      } catch (err) { send(); }
    } else send();
  };
  actions.items = function(msg){
    var data = { items:items };
    fetchItems(function(){
      data.items = items || [];
      taskport && taskport.postMessage({ name:'items', data:data });
    });
  };
  actions.config = function(msg){
    var data = { config:Config };
    taskport && taskport.postMessage({ name:'config', data:data });
  };
  actions.ready = function(msg){
    if (ready) taskport && taskport.postMessage({ name:'ready' });
    else fns.push(function(){
      taskport && taskport.postMessage({ name:'ready' });
    });
  };
  actions['break'] =
  actions.restart = function(msg){
    var task = msg.task;

    var times = config.times = config.times + 1;
    var ts = times % 4 ? 'rest' : 'longrest';;

    var goal = +Date.now() + config.timespan[ts];
    var data = {
      task: msg.task
    , goal: goal
    , times:times
    };

    if ('restart' == msg.name)
      state = 'restart';
    else
      state = 'break';

    taskport && taskport.postMessage({ name:state, data:data });

    var name = state + 'stop';
    var alarmId = state;
    alarmFns[alarmId] = function(){
      var data = { task:task };
      console.log(name);
      taskport && taskport.postMessage({ name:name, data:data });
    };
    al.create(alarmId, { when:goal });
    try{ al.clear('start'); } catch (err) { /* ignore */ }
  };
  actions.done = function(msg){
    Task.done(list.id, msg.taskid, function(err, res){
      current = null;
      fetchItems(function(){
        port.postMessage({
          name: 'done'
        , items:items
        });
      });
    });
  };

})();
