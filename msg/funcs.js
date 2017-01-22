var tabconf = require("../db/tabconf.js")
var netconf = require("../db/netconf.js")
var msgdb = require("../db/msg.js")
var misc = require("../db/misc.js")
var mirc = require("../msg/irc.js")

var safeJSONparse = function(str) {
  try {
    return JSON.parse(str);
  }
  catch(e){
    return false;   
  }
}

function clientMsg(msgObj, ws, mc) {
  mc.send(msgObj.msg);  
  msgdb.saveMsg(msgObj.msg); 
}

function genSendTabs(network, receiver, ws) {
  return function(tabs) {
    misc.setActTab(network, receiver)
    var msgObj = {
      type: "send_tabs",
      tabs: tabs,
      actTab: {network: network, receiver: receiver}
    }
    ws.send(JSON.stringify(msgObj));
  }
}

function genSendTabsActFirst(ws) {
  return function(tabs) {
    var network = ""
    var receiver = ""
    var actTab = false;
    if (tabs.length > 0){
      network = tabs[0].network, 
      receiver = tabs[0].receiver
      actTab = {
        network: network, 
        receiver: receiver
      }
    }
    var msgObj = {
      type: "send_tabs",
      tabs: tabs,
      actTab: actTab
      }
    ws.send(JSON.stringify(msgObj));
  }
}
function query(msgObj, ws, mc){
  var network = msgObj.network   
  var receiver = msgObj.receiver

  tabconf.makeThenAll(network, receiver)
    .then(genSendTabs(network, receiver, ws))
}

function close(msgObj, ws, mc){
  var network = msgObj.network   
  var receiver = msgObj.receiver   
  if (receiver && receiver.startsWith("#")) {
    mc.safePart(receiver, network)
  } 
  tabconf.removeThenAll(network, receiver)
    .then(genSendTabsActFirst(ws))
}

function join(msgObj, ws, mc){
  var network = msgObj.network   
  var receiver = msgObj.receiver   

  mc.safeJoin(receiver, network);
  tabconf.makeThenAll(network, receiver)
    .then(genSendTabs(network, receiver, ws))
}

function removeNetwork(msgObj, ws, mc){
  function onAll(netconfs){
    var msgObj = {
      type: "send_nets",
      netconfs: netconfs
      }
    ws.send(JSON.stringify(msgObj));
  }
  const name = msgObj.name  
  netconf.removeThenAll(name)
    .then(genSendNetconfs(ws)) 
}

function genSendNetconfs(ws) {
  return function(netconfs){
    var msgObj = {
      type: "set_networks",
      netconfs: netconfs
    }
    ws.send(JSON.stringify(msgObj))
  } 
}

function setNetwork(msgObj, ws, mc) {
  mc.connectToNetwork(msgObj.nwObj)
  netconf.makeThenAll(msgObj.nwObj)
    .then(genSendNetconfs(ws))
}

var dispatchMap = {
  msg: clientMsg,
  query: query,
  join: join,
  remove_network: removeNetwork,
  close: close,
  set_network: setNetwork
}

var onClientMsg = function(gws, gmc) {
  var processMsg = function(msg) {
    var msgObj = safeJSONparse(msg);
    if (msgObj && msgObj.type && msgObj.type in dispatchMap)
    {
      // try{
        dispatchMap[msgObj.type](msgObj, gws.ws, gmc.client)   
      // }
      // catch(e){
      //  console.log(e)
      // }
    }
  };
  gws.ws.on('message', processMsg);
}


exports.safeJSONparse = safeJSONparse;
exports.onClientMsg = onClientMsg;
