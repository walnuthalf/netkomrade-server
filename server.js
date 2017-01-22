// Dependencies
var express = require('express');
var https = require('https')

var mfuncs = require("./msg/funcs.js")  
var config = require("./config/main.js")
var session = require("./db/session.js")
var ircClient = require("./msg/irc.js")

// https setup
var privateKey  = config.privateKey;
var certificate = config.certificate;

var credentials = {key: privateKey, cert: certificate};
var app = express();
app.get('/', function(req, res,next) {  
      res.send("hello");
});

//pass in your express app and credentials to create an https server
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(config.port);
console.log('listening on port: %s', config.port);

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({
server: httpsServer
});

var gws = {ready: false, ws: null}
var gmc = {ready: false, client: null};

function connection(ws) {
  function incoming(msg) {
    var msgObj = mfuncs.safeJSONparse(msg)
    if (msgObj && msgObj.type == "load_session" 
      && msgObj.pass == config.pass) {
      gws.ws = ws
      mfuncs.onClientMsg(gws, gmc);
      session.sendSession(ws)      
    }
  }
  ws.on('message', incoming);
}

wss.on('connection', connection);

ircClient.startIRC(gws, gmc);
