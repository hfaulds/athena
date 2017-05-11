import Assets from './assets'
import Core from './core'
import Negotiation from './rtc/rtc_client_negotiation';
import World from './World'

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
      this.transition("loading", "hosting", lobbyServer, token);
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
          this.transition("loading", "joined", data);
        }.bind(this));

        negotiation.handle("connect");
      }
    },

    "loading": {
      _onEnter: function() {
        var args = Array.prototype.slice.call(arguments)
        Assets.load(function(assets) {
          var innerArgs = args.concat([assets]);
          this.transition.apply(this, innerArgs);
        }.bind(this));
      }
    },

    "joined" : {
      _onEnter: function(snapshot, assets) {
        var world = World.fromSnapshot(assets, snapshot);
        Core.create(world).tick();
      },
    },

    "hosting" : {
      _onEnter: function(lobbyServer, token, assets) {
        var world = World.create(assets);
        var core = Core.create(world).tick();

        lobbyServer.on('connection', function(id) {
          var negotiation = new Negotiation(lobbyServer, id, token);
          this.negotiations[id] = negotiation;

          negotiation.on('connected', function() {
            negotiation.reply('connected');
            negotiation.sendMessage(world.createSnapshot());
          }.bind(this));

          negotiation.handle("connect");
        }.bind(this));
      },
    }
  }
});
