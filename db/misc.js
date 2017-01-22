var db = require("./mongo.js")
var mongoose = require('mongoose');

var MiscSchema = mongoose.Schema(
  {name: String, value: Object });

var Misc = mongoose.model("Misc", MiscSchema);
function getByName(name){
  return Misc.findOne({name: name})
}
function setActTab(network, receiver){
  function onFind(actTab){
    let tab = {}
    if (actTab){
      tab = actTab
    }   
    else{
      tab = new Misc({name: "actTab"})
    }
    tab.value = {
      network: network,
      receiver: receiver
    }
    return tab.save()
  } 
  return getByName("actTab").then(onFind)
}

exports.getByName = getByName;
exports.setActTab = setActTab;
