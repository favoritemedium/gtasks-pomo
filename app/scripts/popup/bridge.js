

(function(){

  var port = chrome.runtime.connect({ name:'task' });

  var taskEvent = function(data, fn){
    var onmsg = function(msg){
      if (data.name !== msg.name) return;
      port.onMessage.removeListener(onmsg);
      fn && fn(msg.data);
      Task.emit(msg.name, msg.data);
    };
    port.onMessage.addListener(onmsg);
    port.postMessage(data);
  };

  var Task = new Emitter();
  Task.config = function(fn){
    taskEvent({ name:'config' }, fn);
  };
  Task.finish = function(task, fn){
    var data = { name:'finish', task:task };
    taskEvent(data, fn);
  };
  Task['finish-early'] = function(task, fn){
    var data = { name:'finish-early', task:task };
    taskEvent(data, fn);
  };
  Task.current = function(fn){
    taskEvent({ name:'current' }, fn);
  };
  Task.start = function(task, fn){
    var data = { name:'start', task:task };
    taskEvent(data, fn);
  };
  Task.restart = function(task, fn){
    var data = { name:'restart', task:task };
    taskEvent(data, fn);
  };
  Task['break'] = function(task, fn){
    var data = { name:'break', task:task };
    taskEvent(data, fn);
  };
  Task.ready = function(fn){
    taskEvent({ name:'ready' }, fn);
  };
  Task.items = function(fn){
    var data = { name:'items' };
    taskEvent(data, fn);
  };
  Task.done = function(taskid, fn){
    var data = { name:'done', taskid:taskid };
    taskEvent(data, fn);
  };

  port.onMessage.addListener(function(msg){
    switch(msg.name){
      case 'stop':
      case 'breakstop':
      case 'break':
      case 'restartstop':
        Task.emit(msg.name, msg.data);
      break;
    }
  });

  window.Task = Task;

})();

