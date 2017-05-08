function OfflinePromise() {
  var worker = new SharedWorker('js/communication_worker.js');

  this.dataChannel = {
    readyState: "open",
    onmessage: function() {},
    send: function(data) {
      worker.port.postMessage(data);
    },
  };
  worker.port.onmessage = function(e) {
    this.dataChannel.onmessage(e);
  }.bind(this);
  worker.port.start();
}

OfflinePromise.prototype.onIceCandidate = function(callback) {
};

OfflinePromise.prototype.onDataChannel = function(callback) {
  callback({ channel: this.dataChannel });
};


OfflinePromise.prototype.getLocalDescription = function() {
  return '';
};


OfflinePromise.prototype.createDataChannel = function(name, opts) {
  return this.dataChannel;
};


OfflinePromise.prototype.createOffer = function() {
  return new Promise(function(resolve, reject) { resolve(); });
};

OfflinePromise.prototype.setLocalDescription = function(desc) {
  return new Promise(function(resolve, reject) { resolve(); });
};

OfflinePromise.prototype.setRemoteDescription = function(desc) {
  return new Promise(function(resolve, reject) {
    resolve();
    setTimeout(function() {
      this.dataChannel.onopen();
    }.bind(this),0);
  }.bind(this));
};

OfflinePromise.prototype.createAnswer = function() {
  return new Promise(function(resolve, reject) { resolve(); });
};

OfflinePromise.prototype.addIceCandidate = function(candidate) {
};

module.exports = OfflinePromise;
