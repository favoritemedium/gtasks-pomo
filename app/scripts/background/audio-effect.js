
(function(){

  var on = AppConfig.audioOn;

  try { on = JSON.parse(localStorage.getItem('tomato-task-audio-on')) || on; }
  catch (e) { /* do nothing */ }

  var sounds = {
    success: new Audio()
  , 'break': new Audio()
  };

  sounds.success.volume = 0.5;
  sounds['break'].volume = 0.5;
  sounds.success.src = AppConfig.successAudioPath;
  sounds['break'].src = AppConfig.breakendAudioPath;

  chrome.runtime.onConnect.addListener(function(port){
    if ('audio' !== port.name) return;
    port.onMessage.addListener(function(msg){

      switch(msg.name){
        case 'read': port.postMessage({ name:'read', data:on }); break;
        case 'toggle':
          on = !on;
          localStorage.setItem('tomato-task-audio-on', on);
          break;
      }
    });
    port.postMessage({ name:'ready' });
  });

  var AudioEffect = window.AudioEffect = {};

  /**
   * Play type of audio effect given in the param
   * i.e. "success" or "break"
   *
   * @param {String} type
   */

  AudioEffect.play = function(type) {
    if (!on) return;
    type in sounds && sounds[type].play();
  };


})();