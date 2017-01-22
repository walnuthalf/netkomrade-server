var netconf = require("./netconf.js")  
var tabconf = require("./tabconf.js")  
var misc = require("./misc.js")  

function sendSession(ws){
  var msgObj = {type: "load_session"}
  function addTabs(tabs){
    msgObj.tabs = tabs 
    return netconf.getAllNets()
  }
  function addNets(netconfs){
    msgObj.netconfs = netconfs
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
    .then(addActTab)
}

exports.sendSession = sendSession;
