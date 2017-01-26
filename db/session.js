var netconf = require("./netconf.js")  
var tabconf = require("./tabconf.js")  
var msg = require("./msg.js")  
var misc = require("./misc.js")  

function sendSession(gws, gmc){
  let ws = gws.ws, mc = gmc.client
  var msgObj = {type: "load_session"}
  function addTabs(tabs){
    msgObj.tabs = tabs 
    return netconf.getAllNets()
  }
  function addNets(netconfs){
    msgObj.netconfs = []
    netconfs.forEach(
      nc => {
        const st = mc.stMap[nc.name] == true;
        const net = {
          name: nc.name,
          nick: nc.nick,
          address: nc.address,
          port: nc.port,
          st: st 
          } 
        msgObj.netconfs.push(net); 
      }
    )
    return msg.pastDayMsgs()
  }
  function addMsgs(msgs){
    msgObj.msgs = msgs    
    return misc.getByName("actTab") 
  }
  function addActTab(actTab){
    if(actTab){
      msgObj.actTab = actTab.value
    }
    else{
      msgObj.actTab = false
    }
    ws.send(JSON.stringify(msgObj))
  }
  return tabconf.allTabs()
    .then(addTabs)   
    .then(addNets)
    .then(addMsgs)
    .then(addActTab)
}

exports.sendSession = sendSession;
