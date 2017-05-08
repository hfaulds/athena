var express = require('express');
var Socket = require('socket.io');
var webpack = require('webpack');
var webpackConfig = require('../webpack.config');
var RtcNegotiation = require('./rtc/rtc_server_negotiation.js');

var app = express();
var http = require('http').Server(app)
var io = Socket(http);
var compiler = webpack(webpackConfig);

var twilioCredentials = require('../twilio.json');
var twilio = require('twilio')(twilioCredentials.accountSid, twilioCredentials.authToken);

app.use(require("webpack-dev-middleware")(compiler, {
    noInfo: true, publicPath: webpackConfig.output.publicPath
}));
app.use(require("webpack-hot-middleware")(compiler));

app.use(express.static('public'));

var lobbies = {}
var rtc_negotiations = {};

io.on('connection', function(socket) {
  socket.on('host', function () {
    var id = socket.id;
    lobbies[id] = {
      socket: socket,
    };
    twilio.tokens.create({}, function(err, token) {
      socket.emit('hosting', { iceServers: token.iceServers });
    });
  });

  socket.on('join', function() {
    var lobby = Object.values(lobbies)[0];
    if(lobby) {
      var id = socket.id;
      rtc_negotiations[socket.id] = new RtcNegotiation(id);
      lobby.socket.emit('connection', id);
      twilio.tokens.create({}, function(err, token) {
        socket.emit('joining', id, { iceServers: token.iceServers });
      });
    }
  });

  socket.on("startNegotiation", function(id) {
    rtc_negotiations[id].handle("connect", socket);
  });

  socket.on("shareOffer", function(id, desc) {
    rtc_negotiations[id].handle("shareOffer", desc);
  });

  socket.on("shareAnswer", function(id, desc) {
    rtc_negotiations[id].handle("shareAnswer", desc);
  });

  socket.on("answerAccepted", function(id) {
    rtc_negotiations[id].handle("acceptAnswer");
  });

  socket.on("shareIceCandidate", function(id, candidate) {
    rtc_negotiations[id].handle("shareIceCandidate", socket, candidate);
  });

  socket.on('connected', function(id) {
    if (rtc_negotiations[id]) {
      delete rtc_negotiations[id];
    }
  });

  socket.on('disconnect', function() {
    delete lobbies[socket.id];
  });
});

http.listen(8080, function () {
  console.log('Listening on port 8080!')
})
