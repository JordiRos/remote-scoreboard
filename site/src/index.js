import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const SEND_CMD_TIME = 500; // ms

var cmdTimer = 0;
var cmdParams = {};

function sendCommand(params, callback, now) {
  //console.log(params);

  var func = (params) => {
    //console.log('POST: ' + JSON.stringify(params));
    fetch('http://' + window.location.host + '/api', {headers: {"content-type":"application/json; charset=UTF-8"}, body: JSON.stringify(params), method: "POST"})
      .then(response => { if (callback) callback(response); })
      .catch(error => console.log(error));
  };

  if (now) {
    func(params);
  }
  else {
    if (cmdTimer) {
      clearTimeout(cmdTimer); 
    }
    Object.assign(cmdParams, params);
    cmdTimer = setTimeout(() => { func(cmdParams); cmdParams = {}; }, SEND_CMD_TIME);
  }
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
    sendCommand(params);
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
      <div className="columnplayer">
        <div className="content panel">
          <input className="name playername" type="text" value={this.state.name} onChange={this.onChangeName.bind(this)}/>
          <button className="button playerreset" onClick={this.onResetName.bind(this)}>X</button>
        </div>
        <div className="content panel">
          <button className="button buttonsubscore" onClick={this.onSubScore.bind(this)}>-</button>
          <input className="name playerscore" type="text" value={this.state.score} onChange={this.onChangeScore.bind(this)}/>
          <button className="button buttonaddscore" onClick={this.onAddScore.bind(this)}>+</button>
        </div>        
      </div>
    );
  }
}

class Scoreboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {stage: '', message: '', connected: 'Connecting...', selectedScene: '', scenes: []};
    // Do login, wait for login reply with obs info if any
    sendCommand({cmd: 'login'}, (response) => {
      //console.log(response);
      response.json()
      .then(data => {
        //console.log(data);
        this.setState({connected: response.ok ? 'Connected' : 'Service error!', selectedScene: data.selectedScene, scenes: data.scenes});
      })
      .catch(error => {
        this.setState({connected: response.ok ? 'Connected' : 'Service error!'});
      });
    }, true);
  }

  changeField(field, value) {
    // update state
    let params = {};
    params[field] = value;
    this.setState(params);
    // send to api
    params.cmd = 'set';
    sendCommand(params);
  }

  sendObsCommand(func, args) {
    // send to api
    let params = {};
    params.cmd = 'obs';
    params.func = func;
    params.args = args;
    sendCommand(params, undefined, true);    
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
    this.sendObsCommand('SetCurrentScene', {'scene-name': scene});
  }

  render() {
    const scenes = [];
    if (this.state.scenes) {
      this.state.scenes.forEach(scene => {
        var style = 'button buttonscene';
        if (this.state.selectedScene === scene) {
          style += ' buttonselected';
        }
        scenes.push(<button className={style} key={scene} data-scene={scene} onClick={this.onSelectStage.bind(this)}>{scene}</button>);
      });
    }

    return (
      <div className="container">

        <div className="columns">
          <Player ref="player1" id="1"/>
          <div className="columnmiddle">
            <button className="button content buttonmatch" onClick={this.onResetMatch.bind(this)}>Reset Match</button>
            <button className="button content buttoncasuals" onClick={this.onCasuals.bind(this)}>Casuals</button>
            <input className="name content namestage" placeholder="Stage" type="text" value={this.state.stage} onChange={this.onChangeStage.bind(this)} />
          </div>
          <Player ref="player2" id="2"/>
        </div>

        <div className="columns">
          <div className="columnsingle content">
            <textarea className="name namemessage" type="text" value={this.state.message} onChange={this.onChangeMessage.bind(this)} />
          </div>
        </div>
        <div className="columns">
          <div className="columnsingle content">
            <button className="button buttonclear" onClick={this.onReset.bind(this)}>CLEAR</button>
          </div>
        </div>
        <div className="columns content">
          {scenes}
        </div>
        <div className="columns">
          <div className="columnsingle footer">
            {this.state.connected}
          </div>
        </div>        
      </div>
    );
  }
}

ReactDOM.render(<Scoreboard />, document.getElementById('root'));

