require('./base.js')();

var api = require('./api.js');

console.log('Remote scoreboard streaming tool v0.1. Jordi Ros <shine.3p@gmail.com>');
console.log('Allow Cors = ' + cfg.cors);
console.log('Data Path = ' + cfg.dataPath);
console.log('Obs Host = ' + cfg.obsHost);

api.init(cfg.apiPort);
