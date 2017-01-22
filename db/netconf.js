var db = require("./mongo.js").db
var mongoose = require('mongoose');

var nwSchema = mongoose.Schema(
  {name: String, address: String,
   port: Number, nick: String, password: String
  });

var Netconf = mongoose.model("Netconf", nwSchema);

function getAllNets(){
  return Netconf.find({})
}

function makeThenAll(netconf){
  function newAndAll(n){
    return (new Netconf(netconf))
      .save()
      .then(getAllNets)
  }

  return Netconf
    .remove(netconf)
    .then(newAndAll)
}

function removeThenAll(network){
  return Netconf.remove({name: network})
    .then(getAllNets) 
}

exports.makeThenAll = makeThenAll;
exports.getAllNets = getAllNets;
exports.removeThenAll = removeThenAll 
