const fs = require('fs'),
  ini = require('ini');

module.exports = function() {
  try {
    var cfg = ini.parse(fs.readFileSync('./cfg.ini', 'utf-8'));
  }
  catch (e) {
    console.log('!Can\'t load config file');
    cfg = {};
  }
  cfg.cors = cfg.cors || false;
  cfg.debug = cfg.debug || false;
  cfg.verbose = cfg.verbose || false;
  cfg.apiPort = cfg.apiPort || 3000;
  cfg.dataPath = cfg.dataPath || 'c:/';
  cfg.p1name = cfg.p1name || 'p1name.txt';
  cfg.p2name = cfg.p2name || 'p2name.txt';
  cfg.p1score = cfg.p1score || 'p1score.txt';
  cfg.p2score = cfg.p2score || 'p2score.txt';
  cfg.stage = cfg.stage || 'stage.txt';
  cfg.message = cfg.message || 'message.txt';

  var logInfo = function (str) {
    console.log(str);
  };

  var logError = function (str) {
    console.log(str);
  };

  var logDebug = function (str) {
    if (cfg.debug) {
      console.log(str);
    }
  };

  this.cfg = cfg;
  this.log = { info: logInfo, error: logError, debug: logDebug };
};
