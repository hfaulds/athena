var ports = [];

onconnect = function(e) {
	var port = e.ports[0];
  var index = ports.length;

  ports[index] = port;

	port.onmessage = function(e) {
    ports.forEach(function(p) {
      if(p != port) {
        p.postMessage(e.data);
      }
    });
	};
};
