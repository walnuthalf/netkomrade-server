var fs = require('fs');

var privateKey  = 
  fs.readFileSync(__dirname + '/ssl/key.pem', 'utf8');
var certificate = 
  fs.readFileSync(__dirname + '/ssl/cert.pem', 'utf8');

exports.privateKey = privateKey
exports.certificate = certificate
exports.pass = "deerbeer"
exports.port = 8443
