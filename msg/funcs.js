var tabconf = require("../db/tabconf.js")
var netconf = require("../db/netconf.js")
var msgdb = require("../db/msg.js")

var safeJSONparse = function(str) {
  try {
    return JSON.parse(str);
  }
  catch(e){
    return false;   
  }
}

var clientMsg = function(msgObj, ws, mc) {
  mc.send(msgObj.msg);  
  if(msgObj.msg && msgObj.msg.type === "pm"){
     msddb.saveMsg(msgObj.msg); 
  }
}
var setNetwork = function(msgObj, ws, mc) {
  netconf.setNetwork(msgObj.nwObj) 
}
var getNetwork = function(msgObj, ws, mc) {
  
}
var query = function(msgObj, ws, mc){
  var network = msgObj.network   
  var nick = msgObj.nick   
  var addTab = function(nc) {
    var saveCB = function(err) {
      var sendSession = function(tabs) {
        var msgObj = {
          type: "load_session", 
          tabs: tabs 
        }
        ws.send(JSON.stringify(msgObj))
      }
      tabconf.fetchTabConf(sendSession);
    }

    var myNick = nc[network].nick   
    tabconf.setTab({
      network: network, nick: myNick, receiver: nick, type: "pm", filter: ""
    },
    saveCB
    )

  }
  netconf.fetchNetconf(addTab);
}
var close = function(msgObj, ws, mc){
  var network = msgObj.network   
  var receiver = msgObj.receiver   
  var onRemove = function(err) {
    if (receiver.startsWith("#")) {
      mc.safePart(receiver, network)
    } 
    var sendSession = function(tabs) {
      var msgObj = {
        type: "load_session", 
        tabs: tabs 
      }
      ws.send(JSON.stringify(msgObj))
    }
    tabconf.fetchTabConf(sendSession);
  } 
  tabconf.removeTab(msgObj, onRemove) 
}

var join = function(msgObj, ws, mc){
  var network = msgObj.network   
  var channel = msgObj.channel   
  var addTab = function(nc) {
    var saveCB = function(err) {
      var sendSession = function(tabs) {
        var msgObj = {
          type: "load_session", 
          tabs: tabs 
        }
        ws.send(JSON.stringify(msgObj))
      }
      tabconf.fetchTabConf(sendSession);
    }

    var myNick = nc[network].nick   
    mc.safeJoin(channel, network);

    tabconf.setTab({
      network: network, 
      nick: myNick, 
      receiver: channel, 
      type: "channel", 
      filter: ""
      },
      saveCB
    )
  }
  netconf.fetchNetconf(addTab);
}

var removeNetwork = function(msgObj, ws, mc){
  const name = msgObj.name  
  netconf.removeNetwork(name)
}

var dispatchMap = {
  msg: clientMsg,
  query: query,
  join: join,
  remove_network: removeNetwork,
  close: close,
  set_network: setNetwork,
  get_network: getNetwork
  }

var onClientMsg = function(gws, gmc) {
  var processMsg = function(msg) {
    var msgObj = safeJSONparse(msg);
    if (msgObj && msgObj.type && msgObj.type in dispatchMap)
    {
      dispatchMap[msgObj.type](msgObj, gws.ws, gmc.client)   
    }
  };
  gws.ws.on('message', processMsg);
}
exports.safeJSONparse = safeJSONparse;
exports.onClientMsg = onClientMsg;
