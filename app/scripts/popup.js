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

  var showUI = function(err, items){
    if (err) throw err;

    items.forEach(function(task){
      var view = new TaskView(task);
      tasks.appendChild(view.el);
    });
  };

  Google.init(
    '370558891874-tcji26dm7t571mgbl88phr42qdpbtluh.apps.googleusercontent.com'
  , 'x0wjP4psSLwuGeQyYtQ37lNg'
  , ['https://www.googleapis.com/auth/tasks']
  );

  Google.ready(function(){
    TasksList.list(function(err, taskslists){
      // Take first taskslist from GTasks
      taskslists[0].getItems(showUI);
    });
  });

})();
