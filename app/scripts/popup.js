/*globals Google, TasksList, TaskView */

'use strict';

(function(){

  /**
   * Chrome runtime api
   */

  var rt = chrome.runtime;

  /**
   * Tasks container
   */

  var tasks = document.querySelector('#tasks');


  /**
   * Counter container
   */

  var counter = document.querySelector('#counter');

  /**
   * Start alarm
   */

  var startAlarm = function(id){
    rt.sendMessage({ name:'taskstart', id:id });
  };

  var showCounter = function(){
    var f = document.createDocumentFragment();
    var c = new CounterView();
    var a = new CounterActionView();

    f.appendChild(c.el);
    f.appendChild(a.el);
    counter.appendChild(f);
  };

  var showUI = function(items){
    var frag = document.createDocumentFragment();
    items.forEach(function(task){
      var view = new TaskView(task);
      view.on('start', startAlarm);
      frag.appendChild(view.el);
    });
    tasks.appendChild(frag);
  };

  var init = function(err, items){
    if (err) throw err;
    showUI(items);
    showCounter();
  };

  Google.init(
    '370558891874-tcji26dm7t571mgbl88phr42qdpbtluh.apps.googleusercontent.com'
  , 'x0wjP4psSLwuGeQyYtQ37lNg'
  , ['https://www.googleapis.com/auth/tasks']
  );

  Google.ready(function(){
    TasksList.list(function(err, taskslists){
      // Take first taskslist from GTasks
      taskslists[0].getItems(init);
    });
  });

})();
