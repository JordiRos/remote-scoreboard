require('./base.js')();

var ws = require('ws'),
  fs = require('fs'),
  path = require('path');

var init = function (port) {
  log.info('[APP] Init WS server on port ' + port);
  let wsServer = new ws.Server({ host: '0.0.0.0', port: port });
  let obsData = {};
  let sockets = [];

  // load data from OBS files
  let loadData = function (data) {
      const files = {
        'p1name.txt': 'this.player1.name',
        'p1score.txt': 'this.player1.score',
        'p2name.txt': 'this.player2.name',
        'p2score.txt': 'this.player2.score',
        'stage.txt': 'this.stage',
        'message.txt': 'this.message'
      };
      for (let filename in files) {
        let filePath = path.join(cfg.dataPath, filename);
        fs.readFile(filePath, 'utf8', (err, data) => {
          if(err) { return log.error(err); }
          eval(files[filename] + "=`" + data + "`");          
        });
      }
  };

  // save data to OBS files
  let saveData = function (data) {
    const files = {
      'p1name.txt': data.player1.name,
      'p1score.txt': data.player1.score,
      'p2name.txt': data.player2.name,
      'p2score.txt': data.player2.score,
      'stage.txt': data.stage,
      'message.txt': data.message,
    };    
    for (let filename in files) {
      var filePath = path.join(cfg.dataPath, filename);
      fs.writeFile(filePath, files[filename], function(err) {
        if(err) { return log.error(err); }
      });
    }
  };

  wsServer.on('connection', (socket, req) => {
    socket.connected = true;
    socket.remoteAddress = req.connection.remoteAddress;
    log.debug('[APP] Request Headers: ' + JSON.stringify(req.headers));
    log.info('[APP] Client connected: ' + socket.remoteAddress);
    socket.on('msg', (msg) => {
      log.debug('[APP] Msg received: ' + msg.toString());
      try {
        var cmd = JSON.parse(msg);
      } catch (err) {
        var cmd = '';
      }
      switch (cmd.req) {
        case 'set': executeLogin(socket, cmd); break;
      }
    });
    socket.on('close', function (code, reason) {
      if (socket.connected) {
        log.info('[APP] Client closed: ' + socket.remoteAddress);
      }
    });
    socket.on('error', function (code, reason) {
      log.error('[APP] Client error: ' + socket.remoteAddress);
    });
  });
};

// exports
module.exports = {
  init: init
};
