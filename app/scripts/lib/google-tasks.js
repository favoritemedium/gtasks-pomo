/*global Google */

'use strict';

/**
 * Google Tasks API
 */

(function(){

  /**
   * Constructor
   */

  function Task(id){}

  /**
   * Fetch list of tasks with the taskslist ID
   * callback with `fn(err, tasks)`
   *
   * @param {String} tid
   * @param {Function} fn
   * @api public
   */

  Task.list = function(tid, fn){
    var url = 'https://www.googleapis.com/tasks/v1/lists/' + tid + '/tasks?showCompleted=false';

    Google.get(url, function(err, res){
      if (err) return fn(err);
      var items = res.items.map(function(item){
        item.__proto__ = Task.prototype;
        return item;
      });
      fn(null, items);
    });
  };

  Task.prototype.done = function(){
    Google.patch(this.selfLink
      , { status: 'completed' }
      , function(err, data){
          console.log('done', data);
        }
      );
  };

  Task.prototype.del = function(){
    // TODO:
    // Implement del
  };

  Task.prototype.info = function(){
    // TODO:
    // Implement info
  };

  /**
   * Expose `TasksList`
   */

  window.TasksList = TasksList;

  /**
   * Constructor
   */

  function TasksList(){}

  /**
   * Fetch lists of `taskslist`
   * callback with `fn(err, lists)`
   *
   * @param {Function} fn
   * @api public
   */

  TasksList.list = function(fn){
    console.info('INFO: TASKSLIST: Getting list of taskslist');

    var url = 'https://www.googleapis.com/tasks/v1/users/@me/lists';

    Google.get(url, function(err, data){
      if (err) return fn(err);
      var items = data.items.map(function(item){
        item.__proto__ = TasksList.prototype;
        return item;
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

  TasksList.prototype.getItems = function(fn){
    console.info('INFO: TASKSLIST: Getting taskslist details');

    Task.list(this.id, fn);
  };

  TasksList.prototype.del = function(fn){
    // TODO:
    // Implement del
  };

})();
