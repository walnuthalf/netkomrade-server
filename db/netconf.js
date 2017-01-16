var db = require("./mongo.js").db
var mongoose = require('mongoose');

var nwSchema = mongoose.Schema(
  {name: String, address: String,
   port: Number, nick: String
  });

var Netconf = mongoose.model("Netconf", nwSchema);

var fetchNetconf = function(resfunc){
  var convertNetconf = function(confs) {
    var nwObj = {}    
    confs.forEach(function(conf) {
      nwObj[conf.name] = {address: conf.address,
        port: conf.port, nick: conf.nick} 
      })
    resfunc(nwObj);
  }
  var processNw = function(err, confs) {
    convertNetconf(confs)
  }
  Netconf.find({}, processNw);
} 

var setNetwork = function(nwObj){
  const name = nwObj.name; 
  var processNw = function(err, nwconf) {
    var netconf = {} 
    if (nwconf) {
      netconf = Object.assign(nwconf, nwObj)     
    }
    else {
      netconf = new Netconf(nwObj);
    }
    netconf.save()
  }
  Netconf.findOne({name: name}, processNw);
}

var removeNetwork = function(name){
  Netconf.remove({name: name})
}

exports.setNetwork = setNetwork;
exports.removeNetwork = removeNetwork;
exports.fetchNetconf = fetchNetconf;
