
(function(){

  var timespan = Config.timespan;

  chrome.runtime.onConnect.addListener(function(port){
    if ('options' !== port.name) return;

    port.onMessage.addListener(readwrite);
    port.onDisconnect.addListener(function off(){
      port.onMessage.removeListener(readwrite);
      port.onDisconnect.removeListener(off);
    });

    function readwrite(msg){
      console.log(msg);
      switch(msg.name){
        case 'read':
          port.postMessage({ name: 'read', data: timespan });
          break;
        case 'write':
          timespan.save(msg.data);
          break;
      }
    }
    
    port.postMessage({ name:'ready' });

  });

})();