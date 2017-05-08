Machina = require('machina');

module.exports = Machina.Fsm.extend({
  initialState: "waitingForOfferer",

  shareIceCandidate : function(con, candidate) {
  },

  initialize : function (id) {
    this.id = id;
  },

  states : {
    "waitingForOfferer" : {
      "connect" : function(con) {
        this.offererCon = con;

        con.emit("createOffer", this.id);

        this.transition("waitingForOffer");
      }
    },

    "waitingForOffer" : {
      "connect" : function() {
        this.deferUntilTransition('waitingForAnswerer');
      },
      "shareOffer" : function(offer) {
        this.offer = offer;
        this.transition("waitingForAnswerer");
      },
      "shareIceCandidate" : function() {
        this.deferUntilTransition('waitingForIceCandidates');
      }
    },

    "waitingForAnswerer" : {
      "connect" : function(con) {
        this.answererCon = con;
        this.transition("waitingForAnswerCreation");
      },
      "shareIceCandidate" : function() {
        this.deferUntilTransition('waitingForIceCandidates');
      }
    },

    "waitingForAnswerCreation" : {
      _onEnter: function() {
        this.answererCon.emit("receiveOffer", this.id, this.offer);
      },
      "shareAnswer" : function(answer) {
        this.answer = answer;
        this.transition("waitingForAnswerAccept");
      },
      "shareIceCandidate" : function() {
        this.deferUntilTransition('waitingForIceCandidates');
      }
    },

    "waitingForAnswerAccept" : {
      _onEnter: function() {
        this.offererCon.emit("acceptAnswer", this.id, this.answer);
      },
      "acceptAnswer" : function() {
        this.transition("waitingForIceCandidates");
      },
      "shareIceCandidate" : function() {
        this.deferUntilTransition('waitingForIceCandidates');
      }
    },

    "waitingForIceCandidates" : {
      "connected" : function(answer) {
        this.transition("connected");
      },
      "shareIceCandidate" : function(con, candidate) {
        if(con == this.offererCon) {
          this.answererCon.emit("addIceCandidate", this.id, candidate);
        } else if(con == this.answererCon) {
          this.offererCon.emit("addIceCandidate", this.id, candidate);
        }
      }
    },

    "connected" : {
      _onEnter: function() {}
    }
  }
});
