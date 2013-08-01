
var bridge = chrome.runtime.connect({ name:'options' });

var timespan;

function sync(req) {
  var k;
  switch(req.name){
    case 'read':
      timespan = req.data;
      for (k in timespan) {
        document.querySelector('#'+k).value = timespan[k] / 60 / 1000 | 0;
      }
      break;
    case 'ready':
      bridge.postMessage({ name:'read' });
      break;
  }
}

document.querySelector('form').addEventListener('change', function(e){
  var target = e.target;
  if ( ! target.webkitMatchesSelector('input[type=number]')) return;

  var key = target.id;
  var mins = parseInt(target.value, 10);

  if (!mins) return alert('Value must be integer');

  timespan[key] = mins * 60 * 1000;

  bridge.postMessage({ name: 'write', data: timespan });

}, false);


bridge.onMessage.addListener(sync);