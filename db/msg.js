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
function pastDayMsgs(){
  var yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
  return Msg.find({
    receivedAt: {
      $gt: yesterday 
    }})  
}
exports.saveMsg = saveMsg;
exports.pastDayMsgs = pastDayMsgs;
