class DataChannel {
  public readyState = "open";

  constructor(public worker) { }

  public onmessage() {}

  public send(data) {
    this.worker.port.postMessage(data);
  }
}

export default class OfflinePromise {
  public dataChannel;

  constructor() {
    var worker = new SharedWorker('js/communication_worker.js');
    this.dataChannel = new DataChannel(worker);

    worker.port.onmessage = function(e) {
      this.dataChannel.onmessage(e);
    }.bind(this);
    worker.port.start();
  }

  public onIceCandidate = function(callback) {};

  public addIceCandidate(candidate) { };

  public onDataChannel(callback) {
    callback({ channel: this.dataChannel });
  };

  public getLocalDescription() {
    return '';
  };

  public createDataChannel(name, opts) {
    return this.dataChannel;
  };

  public createOffer() {
    return new Promise(function(resolve, reject) { resolve(); });
  };

  public setLocalDescription(desc) {
    return new Promise(function(resolve, reject) { resolve(); });
  };

  public setRemoteDescription(desc) {
    return new Promise(function(resolve, reject) {
      resolve();
      setTimeout(function() {
        this.dataChannel.onopen();
      }.bind(this),0);
    }.bind(this));
  };

  public createAnswer() {
    return new Promise(function(resolve, reject) { resolve(); });
  };
}

