var db = require("./mongo.js").db
var mongoose = require('mongoose');

var msgSchema = mongoose.Schema(
  {network: String, to: String,
   from: String, text: String, receivedAt: Date
  });

var Msg = mongoose.model("Msg", msgSchema);

var saveMsg = function(msg){
  var msgDoc = new Msg(msg); 
  msgDoc.save()
}

exports.saveMsg = saveMsg;
