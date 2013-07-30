/*global Google */

'use strict';

/**
 * Google Tasks API
 */

(function(){

  /**
   * Task
   */

  var taskApiRoot = 'https://www.googleapis.com/tasks/v1/lists';
  var Task = {
    url: {
      list: taskApiRoot + '/{{listid}}/tasks?showCompleted=false'
    , done: taskApiRoot + '/{{listid}}/tasks/{{taskid}}'
    }
  };

  /**
   * Fetch list of tasks with the taskslist ID
   * callback with `fn(err, items)`
   *
   * @param {String} listid
   * @param {Function} fn
   * @api public
   */

  Task.list = function(listid, fn){
    var url = this.url.list.replace('{{listid}}', listid);
    Google.get(url, function(err, res){
      if (err) return fn(err);
      fn(null, res.items);
    });
  };

  /**
   * Update a task's status to be 'completed'
   * callback with `fn(err, res)`
   *
   * @param {String} listid
   * @param {String} taskid
   * @param {Function} fn
   * @api public
   */

  Task.done = function(listid, taskid, fn){
    var url = this.url.done
      .replace('{{listid}}', listid)
      .replace('{{taskid}}', taskid);
    Google.patch(url, { status: 'completed' }, fn);
  };

  /**
   * TasksList
   */

  var tasklistApiRoot = 'https://www.googleapis.com/tasks/v1/users/@me/lists';
  var TasksList = {
    url: {
      list: tasklistApiRoot
    }
  };

  /**
   * Get list of `TasksList`
   * callback with `fn(err, items)`
   */

  TasksList.list = function(fn){
    Google.get(this.url.list, function(err, res){
      if (err) return fn(err);
      fn(null, res.items);
    });
  };

  /**
   * Expose `TasksList` and `Task`
   */

  window.Task = Task;
  window.TasksList = TasksList;

})();
