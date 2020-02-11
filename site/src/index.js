import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const DEV_API_PORT = 0; // set a port for local dev (running backend and react in different ports)
const SEND_CMD_TIME = 500; // delay in ms for field change detect/send

var cmdTimer = 0;
var cmdParams = {};

function sendCommand(params, now) {
  var func = (params) => {
    let host = DEV_API_PORT ? window.location.hostname + ':' + DEV_API_PORT : window.location.host;
    return fetch('http://' + host + '/api', {headers: {"content-type":"application/json; charset=UTF-8"}, body: JSON.stringify(params), method: "POST"});
  };

  if (now) {
    return func(params);
  }
  else {
    return new Promise((resolve, reject) => {
      if (cmdTimer) {
        clearTimeout(cmdTimer); 
      }
      Object.assign(cmdParams, params);
      cmdTimer = setTimeout(() => { func(cmdParams).then(response => resolve(response)).catch(err => { reject(err); }); cmdParams = {}; }, SEND_CMD_TIME);
    });
  }
}

function sendObsCommand(func, args) {
  let params = {};
  params.cmd = 'obs';
  params.func = func;
  params.args = args;
  return sendCommand(params, true);
}

function sendChallongeCommand(func, args) {
  let params = {};
  params.cmd = 'challonge';
  params.func = func;
  params.args = args;
  return sendCommand(params, true);
}

class Player extends React.Component {
  constructor(props) {
    super(props);
    this.state = {name: '', score: '', id: props.id};
  }

  changeField(field, value) {
    // update state
    let params = {};
    params[field] = value;
    this.setState(params);
    // send to api
    params = {};
    params.cmd = 'set';
    params['p' + this.state.id + field] = value;
    sendCommand(params).catch(err => {});
  }

  onChangeName(event) {
    this.changeField('name', event.target.value);
  }

  onResetName(event) {
    this.changeField('name', '');
  }  

  onChangeScore(event) {
    this.changeField('score', event.target.value);
  }

  onResetScore(event) {
    this.changeField('score', '0');
  }

  onClearScore(event) {
    this.changeField('score', '');
  }

  onSubScore(event) {
    var score = 0;
    try {
      score = Math.max(parseInt(this.state.score) - 1, 0);
    }
    catch { }
    if (isNaN(score)) {
      score = 0;
    }
    this.changeField('score', score);
  }

  onAddScore(event) {
    var score = 1;
    try {
      score = parseInt(this.state.score) + 1;
    }
    catch { }
    if (isNaN(score)) {
      score = 1;
    }
    this.changeField('score', score);
  }

  render() {
    return (
      <div className="column">
        <div className="field has-addons">
          <div className="control is-expanded">
            <input className="input player" placeholder={"Player " + this.state.id} type="text" value={this.state.name} onChange={e => this.onChangeName(e)}/>
          </div>
          <div className="control">
            <button className="button is-danger" onClick={e => this.onResetName(e)}>
              <span className="icon is-small">
                <i className="fas fa-times"/>
              </span>
            </button>
          </div>
        </div>
        <div className="content field has-addons">
          <div className="control">
            <button className="button is-large" onClick={e => this.onSubScore(e)}>-</button>
          </div>
          <div className="control is-expanded">
            <input className="input is-large" type="text" value={this.state.score} onChange={e => this.onChangeScore(e)}/>
          </div>
          <div className="control">
            <button className="button is-large" onClick={e => this.onAddScore(e)}>+</button>
          </div>
        </div>        
      </div>
    );
  }
}

class Scoreboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {stage: '', message: '', connected: 'Connecting...', selectedScene: '', scenes: [], players: [], playerFilter: ''};
    // Login to check API
    sendCommand({cmd: 'login'}, true)
    .then(response => {
      this.setState({connected: response.ok ? 'Connected' : 'Service error!'});
      this.onReset();
      // Request OBS scenes
      sendObsCommand('login')
      .then(data => {
        data.json()
        .then(data => {
          this.setState({selectedScene: data.selectedScene, scenes: data.scenes});
        })
        .catch(err => {});
      })
      .catch(err => {});
    })
    .catch(err => {});
  }

  changeField(field, value) {
    // update state
    let params = {};
    params[field] = value;
    this.setState(params);
    // send to api
    params.cmd = 'set';
    sendCommand(params).catch(err => {});
  }

    onResetMatch(event) {
    this.refs.player1.onResetName();
    this.refs.player2.onResetName();
    this.refs.player1.onResetScore();
    this.refs.player2.onResetScore();
  }

  onCasuals(event) {
    this.refs.player1.onClearScore();
    this.refs.player2.onClearScore();
    this.changeField('stage', 'CASUALS');
  }  

  onChangeStage(event) {
    this.changeField('stage', event.target.value);
  }

  onResetStage(event) {
    this.changeField('stage', '');
  }

  onChangeMessage(event) {
    this.changeField('message', event.target.value);
  }

  onResetMessage(event) {
    this.changeField('message', '');
  }

  onReset(event) {
    this.onResetMatch();
    this.onResetStage();
    this.onResetMessage();
  }  

  onSelectStage(event) {
    let scene = event.target.getAttribute('data-scene');
    this.setState({selectedScene: scene});
    sendObsCommand('SetCurrentScene', {'scene-name': scene});
  }

  onGetChallongePlayers(event) {
    sendChallongeCommand('players', {tournament: this.challongeTournament})
    .then(data => {
      data.json()
      .then(data => {
        this.setState({players: data.players});
      });
    })
    .catch(err => {});
  }

  onChangePlayerFilter(event) {
    this.setState({playerFilter: event.target.value});
  }

  onSetPlayer1Name(event) {
    this.refs.player1.onChangeName({target: {value: document.getElementById("playerName").textContent}});
  }

  onSetPlayer2Name(event) {
    this.refs.player2.onChangeName({target: {value: document.getElementById("playerName").textContent}});
  }  

  render() {
    const scenes = [];
    if (this.state.scenes) {
      this.state.scenes.forEach(scene => {
        var style = 'button is-light';
        if (this.state.selectedScene === scene) {
          style += ' is-primary is-outlined';
        }
        scenes.push(<button className={style} key={scene} data-scene={scene} onClick={e => this.onSelectStage(e)}>{scene}</button>);
      });
    }

    const players = [];
    if (this.state.players) {
      this.state.players.forEach(player => {
        if (player.toUpperCase().indexOf(this.state.playerFilter.toUpperCase()) >= 0) {
          players.push(<option value={player} key={player}>{player}</option>);
        }
      });
    }    

    return (
      <div className="container">
        <div className="box">
          <div className="columns">
            <Player ref="player1" id="1"/>
            <div className="column is-one-quarter">
              <button className="button is-primary is-fullwidth gap" onClick={e => this.onResetMatch(e)}>Reset Match</button>
              <button className="button is-primary is-fullwidth gap" onClick={e => this.onCasuals(e)}>Casuals</button>
            </div>
            <Player ref="player2" id="2"/>
          </div>
          <input className="input is-half-width gap" placeholder="Stage" type="text" value={this.state.stage} onChange={e => this.onChangeStage(e)} />          
          <textarea className="textarea is-expanded gap" placeholder="Message" rows="2" type="text" value={this.state.message} onChange={e => this.onChangeMessage(e)} />
          <div className="buttons are-medium is-centered">
            <button className="button is-centered is-danger is-medium gap" onClick={e => this.onReset(e)}>RESET</button>
          </div>
          <div className="buttons are-medium is-centered">
            {scenes}
          </div>
          <nav className="level gap">
            <div className="level-item">
              <div className="field has-addons">
                <div className="control">
                  <input className="input is-quarter-width" placeholder="Tournament" onChange={e => {this.challongeTournament=e.target.value;}}/>
                </div>
                <div className="control">
                  <button className="button is-primary" onClick={e => this.onGetChallongePlayers(e)}>Fetch Challonge Players</button>
                </div>
              </div>
            </div>
            <div className="level-item">
              <div className="field has-addons">
                <div className="control">
                  <input className="input" placeholder="Filter" onChange={e => this.onChangePlayerFilter(e)}/>
                </div>
                <div className="control">
                  <div className="select" id="playerName">
                    <select ref="playerName">
                      {players}
                    </select>
                  </div>
                </div>
                <div className="control">
                  <button className="button is-primary" onClick={e => this.onSetPlayer1Name(e)}>To P1</button>
                </div>
                <div className="control">
                  <button className="button is-primary" onClick={e => this.onSetPlayer2Name(e)}>To P2</button>
                </div>
              </div>
            </div>
          </nav>
        </div>
        <div className="small-text has-text-centered">
          {this.state.connected}
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Scoreboard />, document.getElementById('root'));

