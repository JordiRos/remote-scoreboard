require('./base.js')();

var handler = require('serve-handler');
  http = require('http'),
  fs = require('fs'),
  OBSWebSocket = require('obs-websocket-js');

var obs;

function handleApiSet(data) {
  var saveFile = (file, value) => {
    if (value !== undefined) {
      log.debug('[API] Saving ' + file + ' with ' + value);
      fs.writeFile(cfg.dataPath + '/' + file, value, (err) => {
        if (err) {
          return log.error(err);
        }
      });
    }
  };

  saveFile(cfg.p1name, data.p1name);
  saveFile(cfg.p2name, data.p2name);
  saveFile(cfg.p1score, data.p1score);
  saveFile(cfg.p2score, data.p2score);
  saveFile(cfg.stage, data.stage);
  saveFile(cfg.message, data.message);
}

function handleApiObs(data) {
  if (obs) {
    log.verbose('[API] Sending OBS command: ' + data.func + ' with args ' + JSON.stringify(data.args));
    obs.send(data.func, data.args);
  }
}

function handleApi(request, response) {
  if (request.method === "OPTIONS") {
    // For CORS
    response.writeHead(200);
    response.end('TEST');
  }  
  else if (request.method === "POST") {
    var body = '';
    request.on('data', (data) => {
      body += data;
      if (body.length > 1e7) {
        response.writeHead(413, 'Request Too Large', {'Content-Type': 'text/plain'});
        response.end('');
      }
    });
    request.on('end', () => {
      log.verbose('[API] Request: ' + request.url + ' ' + JSON.stringify(body));
      var data = JSON.parse(body);
      response.writeHead(200, {'Content-Type': 'text/plain'});
      if (data.cmd === 'login') {
        log.verbose("[API] Login received");
        var params = {};
        var requests = 2;
        var endRequest = () => {
          requests--;
          if (requests === 0) {
            // end with all requests, return response
            response.end(JSON.stringify(params));
          }
        };
        obs.send('GetCurrentScene')
        .then(data => {
          log.verbose('[API] Active OBS scene is ' + data.name);
          params.selectedScene = data.name;
          endRequest();
        });
        obs.send('GetSceneList')
        .then(data => {
          log.verbose('[API] ' + data.scenes.length + ' available OBS scenes');
          params.scenes = [];
          data.scenes.forEach(scene => {
            params.scenes.push(scene.name);
          });
          endRequest();
        });
      }
      else if (data.cmd === 'set') {
        handleApiSet(data);
        response.end('');
      }
      else if (data.cmd === 'obs') {
        handleApiObs(data);
        response.end('');
      }      
      else {
        response.end(''); 
      }
    });
  }
  else {
    response.writeHead(404, '', {'Content-Type': 'text/plain'});
    response.end('');
  }
}

var init = (port) => {
  log.info('[API] Init HTTP server on port ' + port);
  http.createServer((request, response) => {
    if (cfg.cors) {
      response.setHeader('Access-Control-Allow-Origin', '*');
      response.setHeader('Access-Control-Allow-Headers', '*');
      response.setHeader('Access-Control-Allow-Methods', '*');      
    }
    var args = request.url.split('/');
    if (args[1] && args[1] === 'api') {
      return handleApi(request, response);
    }
    else {
      var params = {
        public: "./build",
        cleanUrls: false,
      };
      return handler(request, response, params);
    }
  }).listen(port, '0.0.0.0');

  if (cfg.obsHost) {
    log.info('[API] Initializing OBS...');
    obs = new OBSWebSocket();
    obs.on('error', err => {
        log.error('[API] OBS websocket error: ', err);
    });
    obs.connect({ address: cfg.obsHost, password: cfg.obsPassword })
    .then(() => {
        log.info('[API] OBS connected!');
    })
    .catch(err => {
        log.error('[API] OBS connection error: ');
        log.error(err);
    });    
  }  
};

// exports
module.exports = {
  init: init
};
