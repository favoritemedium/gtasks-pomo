/*global domify, Emitter */

(function(){

  var html = '\
    <a class="task"></a> \
  ';

  /**
   * Expose `TaskView`
   */

  window.TaskView = TaskView;

  /**
   * Expose `TaskView`
   *
   * @param {Object} task
   * @api public
   */

  function TaskView(task){
    var el = domify(html);
    this.el = el;
    this.obj = task;
    Emitter.call(this);

    el.dataset.id = this.obj.id;
    el.textContent = task.title;
    el.addEventListener('click', this.start.bind(this), false);
  }

  /**
   * Inherit from `Emitter`
   */

  TaskView.prototype = new Emitter();

  /**
   * Remove `TaskView` from its parent
   */

  TaskView.prototype.remove = function(){
    var el = this.el;
    this.obj = undefined;
    this.el = undefined;
    el.parentNode.removeChild(el);
  };

  /**
   * Handles button click on `start` button
   */

  TaskView.prototype.start = function(){
    this.emit('start', this.obj);
  };

})();
