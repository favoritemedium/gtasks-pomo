/*global Google */

'use strict';

/**
 * Google Tasks API
 */

(function(){

  // var apiRoot = 'https://www.googleapis.com/tasks/v1/lists/@me';
  var apiRoot = 'https://www.googleapis.com/tasks/v1/users/@me/lists';

  /**
   * Expose `TasksList`
   */

  window.TasksList = TasksList;


  /**
   * Constructor
   */

  function TasksList(id, title){
    this.id = id;
    this.title = title;
  }

  /**
   * Fetch lists of `taskslist`
   * callback with `fn(err, lists)`
   *
   * @param {Function} fn
   * @api public
   */

  TasksList.list = function(fn){
    console.info('INFO: TASKSLIST: Getting list of taskslist');

    Google.get(apiRoot, function(err, data){
      if (err) return fn(err);

      var items = data.items.map(function(item){
        return new TasksList(item.id, item.title);
      });
      fn(null, items);
    });
  };

  /**
   * Fetch `tasklist` with its items
   * callback with `fn(err, list)`
   *
   * @param {Function} fn
   * @api public
   */

  TasksList.prototype.get = function(fn){
    console.info('INFO: TASKSLIST: Getting taskslist details');

    var url = apiRoot + '/' + this.id;
    Google.get(url, function(err, list){
      if (err) return fn(err);
      console.log(list);
      Google.get(url + '/tasks', function(err, items){
        console.log(items);
        fn(null, items);
      });
    });
  };

  TasksList.prototype.del = function(fn){
    // TODO:
    // Implement del
  };


  function Task(id){

  }

  Task.prototype.done = function(){};

  Task.prototype.del = function(){};

  Task.prototype.info = function(){};

})();
