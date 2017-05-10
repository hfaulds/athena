import Core from './core'

import Negotiation from './rtc/rtc_client_negotiation';
import { EventEmitter } from 'events';
import * as io from 'socket.io-client';
import { Fsm } from 'machina';

new Fsm({
  initialState: "disconnected",

  negotiations: {},

  initialize : function() {
    var opts = { 'force new connection': true };
    var lobbyServer = io(window.location.origin, opts);

    lobbyServer.on('hosting', function(token: string) {
      this.transition("hosting", lobbyServer, token);
    }.bind(this));

    lobbyServer.on('joining', function(id: number) {
      this.transition('joining', lobbyServer, id);
    }.bind(this));

    [
      'createOffer', 'receiveOffer', 'acceptAnswer', 'addIceCandidate'
    ].forEach(function(e: string) {
      lobbyServer.on(e, function() {
        var id = arguments[0];
        var negotiation = this.negotiations[id];
        var args = [e].concat(Array.prototype.slice.call(arguments, 1));
        console.debug("server -> client ", e, args);
        negotiation.handle.apply(negotiation, args);
      }.bind(this));
    }.bind(this));

    var createButton = document.getElementById('create');

    createButton.onclick = function() {
      lobbyServer.emit('host');
    };

    var joinButton = document.getElementById('join');

    joinButton.onclick = function() {
      lobbyServer.emit('join');
    };
  },

  states : {
    "disconnected" : {
    },

    "joining" : {
      _onEnter: function(lobbyServer, id, token) {
        var negotiation = new Negotiation(lobbyServer, id, token);
        this.negotiations[id] = negotiation;

        negotiation.on('receiveMessage', function(data) {
          this.transition("joined", data);
        }.bind(this));

        negotiation.handle("connect");
      }
    },

    "joined" : {
      _onEnter: function(snapshot) {
        Core.create().loadWorld(snapshot);
      },
    },

    "hosting" : {
      _onEnter: function(lobbyServer, id, token) {
        var core = Core.create();
        core.newWorld();

        lobbyServer.on('connection', function(id) {
          var negotiation = new Negotiation(lobbyServer, id, token);
          this.negotiations[id] = negotiation;

          negotiation.on('connected', function() {
            negotiation.reply('connected');
            negotiation.sendMessage(core.createSnapshot());
          }.bind(this));

          negotiation.handle("connect");
        }.bind(this));
      }
    },
  }
});
