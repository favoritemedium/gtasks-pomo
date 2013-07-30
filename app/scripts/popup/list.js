
Bridge.ready(function(){

  var list, items;

  /**
   * Tasks container
   */

  var tasks = document.querySelector('#tasklist');




  var Task = Bridge.Task;

  Task.list(function(lists){
    list = lists[0];
    Task.getItems(list.id, function(_items){
      items = _items;
      ready();
    });
  });

  function ready(){

  }

});