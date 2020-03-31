require('./base.js')();

var handler = require('serve-handler');
  http = require('http'),
  fs = require('fs'),
  fetch = require('node-fetch'),
  OBSWebSocket = require('obs-websocket-js');

var obs;

function keepObsAlive() {
  if (!obs) {
  	obs = new OBSWebSocket();
	  obs.on('error', err => {
	    obs = undefined;
	    log.error('[API] OBS websocket error: ', err);
	    log.error(err);
	  });
	  return new Promise((resolve, reject) => {
	  	log.info('[API] Connecting to OBS at ' + cfg.obsHost + '...');
	    obs.connect({ address: cfg.obsHost, password: cfg.obsPassword })
	    .then(() => {
	      log.info('[API] OBS connected!');
	    })
	    .catch(err => {
	      obs = undefined;
	      log.error('[API] OBS connection error: ');
	      log.error(err);
	    });
	  });
	}
	else {
		// send a random request to keep connection alive
    obs.send('GetCurrentScene').then(data => {}).catch(err => {});
	}
}

function handleApiSet(request, response) {
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

  saveFile(cfg.p1name, request.p1name);
  saveFile(cfg.p2name, request.p2name);
  saveFile(cfg.p1score, request.p1score);
  saveFile(cfg.p2score, request.p2score);
  saveFile(cfg.stage, request.stage);
  saveFile(cfg.message, request.message);

  response.end();
}

function handleApiObs(request, response) {
	if (obs) {
    if (request.func === 'login') {
      let params = {};
      let requests = 2;
      let endRequest = () => {
        requests--;
        if (requests === 0) {
          response.write(JSON.stringify(params));
          response.end();
        }
      };
      obs.send('GetCurrentScene')
      .then(data => {
        log.debug('[API] Active OBS scene is ' + data.name);
        params.selectedScene = data.name;
        endRequest();
      })
      .catch(err => {
        endRequest();
      });
      obs.send('GetSceneList')
      .then(data => {
        log.debug('[API] ' + data.scenes.length + ' available OBS scenes');
        params.scenes = [];
        data.scenes.forEach(scene => {
          params.scenes.push(scene.name);
        });
        endRequest();
      })
      .catch(err => {
        endRequest();
      });
    }
    else {
      log.debug('[API] Sending OBS command: ' + request.func + ' with args ' + JSON.stringify(request.args));
      obs.send(request.func, request.args);
    }
  }
}

function handleApiChallonge(request, response) {
  if (request.func = 'players') {
    var host = 'https://' + cfg.challongeUsername + ':' + cfg.challongeApiKey + '@api.challonge.com/v1/tournaments/' + request.args.tournament + '/participants.json';
    log.debug('[API] Challonge request: ' + host);
    fetch(host, {headers: {"content-type":"application/json; charset=UTF-8"}, method: "GET"})
    .then(data => {
      data.json()
      .then(data => {
        var params = {players: []};
        data.forEach(participant => {
          params.players.push(participant.participant.display_name);
        });
        response.write(JSON.stringify(params));
        response.end();
      })
      .catch(err => {});
    })
    .catch(err => {
      log.error('[API] Challonge request error:');
      log.error(err);
    });
    
  }
  else {
    response.end();
  }
}

function handleApi(request, response) {
  if (request.method === "OPTIONS") {
    response.writeHead(200);
    response.end('TEST');
  }  
  else if (request.method === "POST") {
    var body = '';
    request.on('data', (data) => {
      body += data;
      if (body.length > 1e7) {
        response.writeHead(413, 'Request Too Large', {'Content-Type': 'text/plain'});
        response.end();
      }
    });
    request.on('end', () => {
      log.info('[API] Request: ' + request.url + ' ' + JSON.stringify(body));
      var data = JSON.parse(body);
      response.writeHead(200, {'Content-Type': 'text/plain'});
      if (data.cmd === 'login') {
        log.debug("[API] Login received");
        response.end();
      }
      else if (data.cmd === 'set') {
        handleApiSet(data, response);
      }
      else if (data.cmd === 'obs') {
        handleApiObs(data, response);
      }
      else if (data.cmd === 'challonge') {
        console.log(data);
        handleApiChallonge(data, response);
      }      
      else {
        response.end(); 
      }
    });
  }
  else {
    response.writeHead(404, '', {'Content-Type': 'text/plain'});
    response.end();
  }
}

var init = (port) => {
  log.info('[API] Initialize HTTP server on port ' + port);
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

  if (cfg.challongeApiKey) {
    log.info('[API] Challonge API enabled');
  }

  if (cfg.obsHost) {
    keepObsAlive();
    setInterval(keepObsAlive, 10000);
  }
};

// exports
module.exports = {
  init: init
};
