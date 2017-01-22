var db = require("./mongo.js")
var netconf = require("./netconf.js")
var mongoose = require('mongoose');

var tabSchema = mongoose.Schema({
  network: String,
  receiver: String, 
  filter: String
});

var Tab = mongoose.model("Tab", tabSchema);

function getAllTabs(tab){
  return Tab.find({})
}
function allTabs(){
  return Tab.find({})
}
function removeThenAll(network, receiver){
  var tabObj = {
    network: network,  
    receiver: receiver,
    filter: ""
  }
  return Tab.remove(tabObj)
    .then(getAllTabs) 
}

function makeThenAll(network, receiver){
  var tabObj = {
    network: network,  
    receiver: receiver,
    filter: ""
  }

  function newAndAll(t){
    return (new Tab(tabObj))
      .save()
      .then(getAllTabs)
    
  }
  return Tab.remove(tabObj).then(newAndAll)
}

exports.makeThenAll = makeThenAll;;
exports.removeThenAll = removeThenAll;;
exports.allTabs = allTabs;;
