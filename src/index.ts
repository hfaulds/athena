import Core from './core'

import Negotiation from './rtc/rtc_client_negotiation';
import { EventEmitter } from 'events';
import * as io from 'socket.io-client';
import { Fsm } from 'machina';

new Fsm({
  initialState: "disconnected",

  negotiations: {},

  initialize : function(lobbyServer) {
    this.lobbyServer = io(window.location.origin, {'force new connection': true});

    this.lobbyServer.on('hosting', function(token) {
      this.transition("hosting", token);
    }.bind(this));

    this.lobbyServer.on('joining', function(id) {
      this.transition('joining', id);
    }.bind(this));

    [
      'createOffer', 'receiveOffer', 'acceptAnswer', 'addIceCandidate'
    ].forEach(function(e) {
      this.lobbyServer.on(e, function() {
        var id = arguments[0];
        var negotiation = this.negotiations[id];
        var args = [e].concat(Array.prototype.slice.call(arguments, 1));
        console.debug("server -> client ", e, args);
        negotiation.handle.apply(negotiation, args);
      }.bind(this));
    }.bind(this));

    var createButton = document.getElementById('create');

    createButton.onclick = function() {
      this.lobbyServer.emit('host');
    }.bind(this);

    var joinButton = document.getElementById('join');

    joinButton.onclick = function() {
      this.lobbyServer.emit('join');
    }.bind(this);
  },

  join: function(id) {
    this.lobbyServer.emit('join', id);
  },

  create: function() {
    this.lobbyServer.emit('host');
  },

  states : {
    "disconnected" : {
    },

    "joining" : {
      _onEnter: function(id, token) {
        var negotiation = new Negotiation(this.lobbyServer, id, token);
        this.negotiations[id] = negotiation;

        negotiation.on('connected', function() {
          this.transition("joined");
        }.bind(this));

        negotiation.handle("connect");
      }
    },

    "joined" : {
      _onEnter: function() {
        Core.create().start();
      },
    },

    "hosting" : {
      _onEnter: function(id, token) {
        this.lobbyServer.on('connection', function(id) {
          var negotiation = new Negotiation(this.lobbyServer, id, token);
          this.negotiations[id] = negotiation;

          negotiation.on('connected', function() {
            negotiation.reply('connected');
          }.bind(this));

          negotiation.handle("connect");
        }.bind(this));
        Core.create().start();
      }
    },
  }
});
