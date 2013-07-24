
(function(){

  var html = '\
    <div class="counter-action"> \
      <div class="actions"> \
        <button></button> \
        <a class="optional"></a> \
      </div> \
      <p class="message"></p> \
      <p class="break"> \
        <span></span> minutes break \
      </p> \
    </div> \
  ';

  /**
   * Expose `CounterActionView`
   */

  window.CounterActionView = CounterActionView;

  /**
   * Constructor
   */

  function CounterActionView(){
    this.el = domify(html);
    Emitter.call(this);
  }

  /**
   * Inherits `Emitter`
   */

  var proto = CounterActionView.prototype = new Emitter();

  /**
   * Updates content for restart
   */

  proto.restart = function(){};

  /**
   * Handles restart clicked
   */

  proto.onrestart = function(){}

  /**
   * Update content for finish
   */

  proto.finish = function(){};

  /**
   * Handles finish button clicked
   */

  proto.onfinish = function(){};
})();