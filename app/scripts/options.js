
(function(){

  /**
   * Bridge to communicate between background page
   * and this page
   */

  var tsbridge = chrome.runtime.connect({ name:'options' });
  var audiobridge = chrome.runtime.connect({ name:'audio' });

  /**
   * Keep track of timespan
   */

  var timespan;

  /**
   * Audio toggle
   */

  var audioToggle = document.querySelector('#audio-on-off');
  audioToggle.addEventListener('change', function(){
    audiobridge.postMessage({ name:'toggle' });
  }, false);

  /**
   * Handles timespan changes
   */

  document.querySelector('form').addEventListener('change', function(e){
    var target = e.target;
    if ( ! target.webkitMatchesSelector('input[type=number]')) return;

    var key = target.id;
    var mins = parseInt(target.value, 10);

    if (!mins) return alert('Value must be integer');

    timespan[key] = mins * 60 * 1000;
    tsbridge.postMessage({ name: 'write', data: timespan });

  }, false);

  tsbridge.onMessage.addListener(function tssync(req) {
    switch(req.name){
      case 'read':
        timespan = req.data;
        for (var k in timespan)
          document.querySelector('#'+k).value = timespan[k] / 60 / 1000 | 0;
        break;
      case 'ready':
        tsbridge.postMessage({ name:'read' });
        break;
    }
  });

  audiobridge.onMessage.addListener(function audiosync(req){
    switch(req.name){
      case 'read':
        audioToggle.checked = req.data; break;
      case 'ready': audiobridge.postMessage({ name:'read' }); break;
    }
  });

})();
