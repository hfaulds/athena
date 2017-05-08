export default class RTCPeerPromise {
  public connection;

  constructor(config) {
    this.connection = new RTCPeerConnection(config);
  }

  public onIceCandidate(callback) {
    this.connection.onicecandidate = callback;
  };

  public onDataChannel(callback) {
    this.connection.ondatachannel = callback;
  };


  public getLocalDescription() {
    return this.connection.localDescription;
  };


  public createDataChannel(name, opts) {
    return this.connection.createDataChannel(name, opts);
  };


  public createOffer() {
    var that = this;
    return new Promise(function(resolve, reject) {
      that.connection.createOffer(resolve, reject);
    });
  };

  public setLocalDescription(desc) {
    var that = this;
    return new Promise(function(resolve, reject) {
      that.connection.setLocalDescription(desc, resolve, reject);
    });
  };

  public setRemoteDescription(desc) {
    var that = this;
    return new Promise(function(resolve, reject) {
      that.connection.setRemoteDescription(desc, resolve, reject);
    });
  };

  public createAnswer() {
    var that = this;
    return new Promise(function(resolve, reject) {
      that.connection.createAnswer(resolve, reject);
    });
  };


  public addIceCandidate(candidate) {
    this.connection.addIceCandidate(candidate);
  };
}
