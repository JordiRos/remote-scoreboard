const fs = require('fs'),
  ini = require('ini');

module.exports = function() {
  this.ERR_OK = 0;
  this.ERR_API = 'invalid api call';
  this.ERR_FILE_NOT_FOUND = 'file not found';

  var cfg = ini.parse(fs.readFileSync('./cfg.ini', 'utf-8'));
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

  // Add timestamp information to console.x methods
  /*
  require('console-stamp')(console, {
    pattern: 'dd/mm/yyyy HH:MM:ss.l',
    colors: { stamp: 'yellow' },
    label: false
  });
  */

  var logInfo = function (str) {
    console.log(str);
  };

  var logError = function (str) {
    console.log(str);
  };

  var logVerbose = function (str) {
    if (cfg.verbose || cfg.debug) {
      console.log(str);
    }
  };

  var logDebug = function (str) {
    if (cfg.debug) {
      console.log(str);
    }
  };

  this.cfg = cfg;
  this.log = { info: logInfo, error: logError, verbose: logVerbose, debug: logDebug };
};
