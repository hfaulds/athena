import { Fsm } from 'machina';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import * as Schema from './schema';
import RTCPeerPromise from './rtc_peer_promise'
//import RTCPeerPromise from './offline_promise'

export default Fsm.extend({
  initialState: "disconnected",

  reply: function() {
    var event = arguments[0];
    var args = [event, this.id].concat(Array.prototype.slice.call(arguments, 1));
    console.debug("client -> server", args);
    this.lobbyServer.emit.apply(this.lobbyServer, args);
  },

  initialize : function (lobbyServer, id, config) {
    this.lobbyServer = lobbyServer;
    this.id = id;
    this.config = config;

    this.simulatedLatency = 0;
    this.simulatedPacketLoss = 0;
    this.messages = new EventEmitter();
  },

  setupChannel : function(channel) {
    this.channel = channel;
    this.channel.onopen = function() {
      this.transition("connected");
      this.emit("connected");
    }.bind(this);
    this.channel.onclose = function(e) {
      this.handle("disconnect");
      this.emit("disconnected");
    }.bind(this);
    this.channel.onerror = function(e) {
      this.handle("disconnect");
      this.emit("error");
    }.bind(this);
    this.channel.onmessage = function(e) {
      this.handle("receiveMessage", e.data);
    }.bind(this);
  },

  error : function(e) {
    console.log('error');
    console.log(e);
  },

  states : {
    "disconnected" : {
      "connect" : function() {
        var that = this;
        this.connection = new RTCPeerPromise(this.config);
        this.connection.onIceCandidate(function(e) {
          if(e.candidate) {
            that.reply("shareIceCandidate", e.candidate);
          }
        });
        this.reply("startNegotiation");
      },
      "createOffer" : function() {
        var that = this;

        this.setupChannel(this.connection.createDataChannel("sendDataChannel", {reliable: false}));

        that.connection.createOffer().then(function(offer) {
          return that.connection.setLocalDescription(offer);
        }).then(function(offer) {
          that.reply("shareOffer", that.connection.getLocalDescription());
        }).catch(function(e) {
          that.error(e);
        });
      },
      "receiveOffer" : function(offerDesc) {
        var that = this;
        this.connection.onDataChannel(function (e) {
          that.setupChannel(e.channel);
        });

        this.connection.setRemoteDescription(offerDesc).
          then(function() {
            return that.connection.createAnswer();
          }).then(function(answerDesc) {
            return that.connection.setLocalDescription(answerDesc);
          }).then(function() {
            that.reply("shareAnswer", that.connection.getLocalDescription());
            that.transition("remoteDescriptionSet");
          }).catch(function(e) {
            that.error(e);
          });
      },
      "acceptAnswer" : function(desc) {
        var that = this;
        this.connection.setRemoteDescription(desc).
          then(function() {
            that.reply("answerAccepted");
            that.transition("remoteDescriptionSet");
          }).catch(function(e) {
            that.error(e);
          });
      },
      "addIceCandidate" : function() {
        this.deferUntilTransition("remoteDescriptionSet");
      },
      "sendMessage" : function() {
        this.deferUntilTransition("connected");
      },
    },

    "remoteDescriptionSet" : {
      "addIceCandidate" : function(candidate) {
        this.connection.addIceCandidate(candidate);
      },
      "sendMessage" : function() {
        this.deferUntilTransition("connected");
      }
    },

    "connected" : {
      "sendMessage" : function(message) {
        var data = JSON.stringify(message);
        if(this.simulatedPacketLoss > 0) {
          if(Math.random() > this.simulatedPacketLoss / 100) return;
        }

        if(this.simulatedLatency > 0) {
          var sendMessageReal = function() {
            if(this.channel.readyState === "open") {
              this.channel.send(data);
            }
          }.bind(this);
          setTimeout(sendMessageReal, this.simulatedLatency);
        } else {
          this.channel.send(data);
        }
      },
      "receiveMessage" : function(data) {
        var message = JSON.parse(data);
        var messageType = message['messageType'];
        var content = Schema[messageType].decode(message['content']);
        this.messages.emit(messageType, content)
      },
      "disconnect" : function() {
        this.channel.close();
        this.transition("disconnected");
      }
    }
  },

  setSimulatedLatency : function(latency) {
    this.simulatedLatency = latency;
  },

  setSimulatedPacketLoss : function(packetLoss) {
    this.simulatedPacketLoss = packetLoss;
  },

  sendMessage : function(messageType, content) {
    this.handle(
      'sendMessage',
      {
        messageType: messageType,
        content: Schema[messageType].encode(content),
      }
    );
  },

  onMessage : function(messageType, callback) {
    this.messages.on(messageType, callback);
  },

  onceMessage : function(messageType, callback) {
    this.messages.once(messageType, callback);
  },
});
