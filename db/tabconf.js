var db = require("./mongo.js")
var mongoose = require('mongoose');

var tabEntrySchema = mongoose.Schema(
  {network: String, nick: String,  
   receiver: String, filter: String
  });

var TabEntry = mongoose.model("TabEntry", tabEntrySchema);

var fetchTabConf = function(resfunc){
  var process = function(err, entries) {
    resfunc(entries)
  }
  TabEntry.find({}, process);
} 

var setTab = function(tabObj, callback){
  var process = function(err) {
      var tabentry = new TabEntry(tabObj);
      tabentry.save(callback);
  }
  // remove old tab entries
  TabEntry.find({
    network: tabObj.network, 
    receiver: tabObj.receiver
  }).remove(process);
}

exports.setTab = setTab;
exports.fetchTabConf = fetchTabConf;
