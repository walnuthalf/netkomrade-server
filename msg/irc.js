var irc = require("irc")
var ncfuncs = require("../db/netconf.js")
var msgFuncs = require("../db/msg.js")

class MultinetClient{
  constructor(netconfs, gws){
    this.nwToClient = {};
    this.stMap = {}
    this.gws = gws
    netconfs.forEach(nc =>{
      this.connectToNetwork(nc)
    }
    )
  }

  connectToNetwork(netconf){
    var ircConf = {
      port: netconf.port, 
      secure: true
    }
    var client = new irc.Client(
      netconf.address, 
      netconf.nick, 
      ircConf
    );
    var network = netconf.name;

    client.addListener('registered', 
      this.onConnect(netconf).bind(this));
    this.nwToClient[network] = client;
  }
  connectAsync(netconf){
    let connect = this.connectToNetwork.bind(this)
    return new Promise(
      function(resolve, reject) { 
        connect(netconf);
        resolve()
      }
    )
  }

  genOnMsg(network) {
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
      var client = this.nwToClient[msg.network]; 
      client.say(msg.to, msg.text);
    }
    catch (e) {
      console.log("failed to send ", msg) 
      console.log(e)
    }
  }

  safeJoin(channel, network) {
    try {
      this.nwToClient[network].join(channel)
    }
    catch(e) {
      console.log("failed to join " + channel) 
      console.log(e)
    }
  }

  safePart(channel, network){
    try {
      this.nwToClient[network].part(channel)
    }
    catch(e) {
      console.log("failed to part " + channel) 
      console.log(e)
    }
  }

  onConnect(netconf) {
    return msg => {
      let client = this.nwToClient[netconf.name]
      let onMsg  = this.genOnMsg(netconf.name).bind(this)
      this.stMap[netconf.name] = true
      client.addListener("message", onMsg)
      if(netconf.password)
      {
        client.say("nickserv", "identify " + netconf.password); 
      }
    }
  }
}

var startIRC = function(gws, gmc) {
  var makeMC = function(netconfs) {
     gmc.client= new MultinetClient(netconfs, gws) 
  }
  ncfuncs.getAllNets().then(makeMC)
}

exports.startIRC = startIRC;
