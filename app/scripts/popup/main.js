

Task.ready(function(){

  /**
   * set during runtime
   */

  var items, config;

  /**
   * Views to control action view
   */

  var counterView, actionView;


  /**
   * UI Containers
   */

  var tasks = document.querySelector('#tasklist');
  var counter = document.querySelector('#counter');

  /**
   * Event hub
   */

   var hub = new Emitter();

  /**
   * Initiallize view
   */

  fetchItems(function(){

    Task.config(function(data){
      config = data.config;

      counterView = new CounterView(config);
      actionView = new CounterActionView(config);
      actionView.on('action', function(type, task){
        console.log('INFO: ACTION: ' + type);
        if (type in Task) {
          Task[type](task);
        }
        if ('backtolist' == type) {
          fetchItems(function(){
            populateList();
            showList();
          });
        }
      });
      counter.appendChild(counterView.el);
      counter.appendChild(actionView.el);

      Task.current(function(data){
        if (!data.current) {
          populateList();
          showList();
        } else {
          showCounter(data.current, data.alarm);
        }
      });
    });
  });

  tasks.addEventListener('click', function(e){
    if (!e.target.webkitMatchesSelector('a.task')) return;
    var task
      , link = e.target
      , id = link.dataset.id
      , i = items.length;
    while(i--)
      if (items[i].id === id) {
        task = items[i];
        break;
      }
    task && showCounter(task);
  });

  Task
    .on('stop', function(task){
      counterView.stop();
      actionView.stop();
    })
    .on('start', function(data){
      counterView.setupTask();
      counterView.start(data.goal);
      actionView.start();
    })
    .on('finish', function(data){
      counterView.stop();
      actionView.stop();
    })
    .on('finish-early', function(data){
      actionView['break']();
      counterView['break']();
    })
    .on('break', function(data){
      counterView.dobreak(data.goal, data.times);
      actionView.dobreak(data.goal, data.times);
    })
    .on('breakstop', function(data){
      counterView.breakstop();
      actionView.breakstop();
    })
    .on('restart', function(data){
      counterView.dobreak(data.goal, data.times);
      actionView.dobreak(data.goal, data.times);
    })
    .on('restartstop', function(){
      actionView.restartstop();
    })
    ;

  function populateList(){
    var frag = document.createDocumentFragment();
    var list = tasks.querySelector('#tasks');
    items.forEach(function(task){
      if (task.title === '') { return; }
      var view = new TaskView(task);
      frag.appendChild(view.el);
    });

    if (!frag.childNodes.length) {
      var placeholder = document.createElement('span');
      placeholder.className = 'task';
      placeholder.textContent = 'Please add tasks to your GTask to get started.';
      frag.appendChild(placeholder);
    }

    removeChilds(list);
    list.appendChild(frag);
  }

  function showList(){
    counter.classList.add('hidden');
    tasks.classList.remove('hidden');
  }

  function showCounter(task, alarm){
    actionView.setupTask(task, config);
    counterView.setupTask(task, config);
    if (alarm){
      actionView.resume(alarm);
      counterView.resume(alarm);
    }
    counter.classList.remove('hidden');
    tasks.classList.add('hidden');
  }

  function fetchItems(fn){
    Task.items(function(data){
      items = data.items || [];
      fn && fn();
    });
  }

  /**
   * Helpers
   */

  function removeChilds(elem){
    while(elem.hasChildNodes())
      elem.removeChild(elem.lastChild);
  }

});