var irc = require("irc")
var ncfuncs = require("../db/netconf.js")
var msgFuncs = require("../db/msg.js")

class MultinetClient{

  constructor(netconf, gws){
    this.nameToClient = {};
    this.gws = gws

    for (var name in netconf) {
      var conf = netconf[name];
      var ircConf = {port: conf.port, secure: true }
      if (conf.channels) {
        ircConf.channels = conf.channels;  
      }
      var client = new irc.Client(conf.address, 
        conf.nick, ircConf);

      client.addListener("message", 
        this.saveToDBandSend(name, conf).bind(this))
      client.addListener('registered', 
        this.onConnect(name, conf).bind(this));
      this.nameToClient[name] = client;
   } 
  }  
  saveToDBandSend(network) {
    return function(from, to, text) {
      var msgObj = {network: network,
        from: from, to: to, text: text, receivedAt: new Date()
      }   
      msgFuncs.saveMsg(msgObj); 
      if (this.gws.ws) {
        var clientMsg = {type: "irc_msg", msg: msgObj}  
        this.gws.ws.send(JSON.stringify(clientMsg))
      }
    }
  }

  send(msg){
    try {
      var client = this.nameToClient[msg.network]; 
      client.say(msg.to, msg.text);
    }
    catch (e) {
      console.log("failed to send ", msg) 
    }
  }
  safeJoin(channel, network) {
    try {
      this.nameToClient[network].join(channel)
    }
    catch(e) {
      console.log("failed to join " + channel) 
    }
  }

  safePart(channel, network){
    try {
      this.nameToClient[network].part(channel)
    }
    catch(e) {
      console.log("failed to part " + channel) 
    }
    
  }

  onConnect(name, conf) {
    return function(msg) {
      if(conf.password)
      {
        var client = this.nameToClient[name];
        client.say("nickserv", "identify " + conf.password); 
      }
    }
  }
}


var startIRC = function(gws, gmc) {
  var makeMC = function(nc) {
     gmc.client= new MultinetClient(nc, gws) 
  }
  ncfuncs.fetchNetconf(makeMC)
}

exports.startIRC = startIRC;
