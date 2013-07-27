/*globals Google, TasksList, TaskView */

'use strict';

(function(){

  /**
   * Chrome runtime api
   */

  var rt = chrome.runtime;

  /**
   * Bridge between background and popup
   */

  var bg = chrome.runtime.connect({ name:'pop' });

  /**
   * Tasks container
   */

  var tasks = document.querySelector('#tasklist');


  /**
   * Counter container
   */

  var counter = document.querySelector('#counter');

  /**
   * Actions View
   */

  var actionView = new CounterActionView();

  /**
   * Actions View
   */

  var counterView = new CounterView();

  /**
   * Start alarm
   */

  var showCounter = function(task){
    actionView.setupTask(task);
    counter.classList.remove('hidden');
    tasks.classList.add('hidden');
  };

  var hideCounter = function(){
    actionView.reset();
    counterView.reset();
    counter.classList.add('hidden');
    tasks.classList.remove('hidden');
  }

  var setupCounter = function(){
    actionView.on('action', function(type, task){
      switch(type){
        case 'start':
          bg.postMessage({ name:'taskstart', task:task });
          break;
        case 'break':
          bg.postMessage({ name:'dobreak', task:task });
          break;
        case 'backtolist':
          hideCounter();
          break;
      }
    });
    counter.appendChild(counterView.el);
    counter.appendChild(actionView.el);
  };

  var setupList = function(items){
    var frag = document.createDocumentFragment();
    items.forEach(function(task){
      var view = new TaskView(task);
      view.on('start', showCounter);
      frag.appendChild(view.el);
    });
    tasks.querySelector('#tasks').appendChild(frag);
  };

  var init = function(err, items){
    if (err) throw err;

    // setupList(items);
    // setupCounter()

    counter.classList.add('hidden');
  };

  Bridge.ready(function(){
    Bridge.Task.list(function(taskslists){
      Bridge.Task.getItems(taskslists[0].id, init);
    });
  });

  bg.onMessage.addListener(function(msg){
    console.log(msg)
    switch(msg.name){
      case 'taskstarted':  taskstarted(msg); break;
      case 'taskended':    taskended(msg); break;
      case 'breakstarted': breakstarted(msg); break;
      case 'breakended':   breakended(msg); break;
    }
  });

  function taskstarted(msg){
    actionView.start();
    counterView.setupTask(msg.goal);
    counterView.start();
    console.info('INFO: COUNTER: Count started');
  }

  function taskended(msg){
    actionView.end();
    counterView.end();
  }

  function breakstarted(msg){
    actionView.dobreak(msg.times)
    counterView.dobreak(msg.goal, msg.times);
  }

  function breakended(msg){
    actionView.breakend();
    counterView.breakend();
  }

})();
