
(function(){

  var successSound = new Audio();
  var breakendSound = new Audio();

  successSound.volume = 0.5;
  breakendSound.volume = 0.5;
  successSound.src = AppConfig.successAudioPath;
  breakendSound.src = AppConfig.breakendAudioPath;

  var al = chrome.alarms;

  /**
   * Items to be set in runtime
   */

  var list, current, taskport;

  /**
   * Callbacks when data is ready
   */

  var fns = [];

  /**
   * Callback for alarms
   */

  var alarmFns = {};

  /**
   * Ready state
   */

  var ready = false;

  /**
   * State of the current running task
   */

  var state = 'idle';

  Google.init(
    AppConfig.id
  , AppConfig.secret
  , ['https://www.googleapis.com/auth/tasks']
  );

  Google.ready(function(){
    TasksList.list(function(err, lists, f){
      ready = true;
      list = lists[0];
      while(f = fns.shift()) setTimeout(f, 0);
    });
  });

  chrome.runtime.onConnect.addListener(function(port){
    if ('task' !== port.name) return;

    taskport = port;

    port.onMessage.addListener(function(msg){
      if (msg.name in actions)
        actions[msg.name](msg);
    });
    port.onDisconnect.addListener(function(){
      if ('task' == port.name) taskport = undefined;
    });
  });

  al.onAlarm.addListener(function(alarm){
    if (false === alarm.name in alarmFns) return;

    switch(alarm.name){
      case 'start':
        state = 'finish';
        successSound.play();
      break;
      case 'restart':
        state = 'restartend';
      break;
      case 'break':
      case 'breakstop':
        current = null;
        state = 'idle';
        breakendSound.play();
      break;
    }

    var fn = alarmFns[alarm.name];
    delete alarmFns[alarm.name];

    fn && fn();
  });

  /**
   * Actions to handle communication
   * between popup and the background
   * page
   */

  var actions = {};

  actions.start = function(msg){
    var task = msg.task
      , goal = +Date.now() + Config.timespan.task
      , stopNS = msg.name == 'break' ? 'break' : ''
      , alarmId = stopNS+'start';

    current = task;
    state = stopNS || 'start';
    send(msg.name, { task: msg.task, goal: goal });

    alarmFns[alarmId] = function(){
      if (state == 'break') state = 'idle';
      send(stopNS+'stop', { task:task });
    };
    al.create(alarmId, { when: goal });
  };

  actions.finish = function(msg){
    Task.done(list.id, msg.task.id, function(){
      if (msg.name == 'finish-early') {
        msg.name = 'break';
        successSound.play();
      } else send(msg.name, { task: msg.task });

      actions['break'](msg, taskport);
    });
  };

  actions['finish-early'] = actions.finish;

  actions.current = function(msg){
    var data = { current: current };
    var done = function(){
      send('current', data);
    };

    if (current && 'idle' != state) {
      data.alarm = {};
      data.alarm.state = state;
      try {
        al.get(state, function(alarm){
          if (alarm) {
            data.alarm.goal = alarm.scheduledTime;
            data.alarm.times = Config.times;
          }
          done();
        });
      } catch (err) { done(); }
    } else done();
  };

  actions.items = function(msg){
    Task.list(list.id, function(err, items){
      send('items', { items: items });
    });
  };

  actions.config = function(msg){
    send('config', { config: Config });
  };

  actions.ready = function(msg){
    if (ready) taskport && taskport.postMessage({ name:'ready' });
    else fns.push(function(){
      send('ready');
    });
  };

  actions.restart = function(msg){
    var task = msg.task;

    var times = Config.times = Config.times + 1;
    var ts = times % 4 ? 'rest' : 'longrest';;
    var goal = +Date.now() + Config.timespan[ts];

    if ('restart' == msg.name)
      state = 'restart';
    else
      state = 'break';

    send(state, {
      task: msg.task
    , goal: goal
    , times: times
    });

    var name = state + 'stop';
    alarmFns[state] = function(){
      send(name, { task: task });
    };
    al.create(state, { when: goal });
    try{ al.clear('start'); } catch (err) { /* ignore */ }
  };
  actions['break'] = actions.restart;

  actions.done = function(msg){
    Task.done(list.id, msg.taskid, function(err, res){
      current = null;
      send('done');
    });
  };

  function send(name, data){
    var params = { name: name };
    if (data) params.data = data;
    taskport && taskport.postMessage(params);
  }

})();
