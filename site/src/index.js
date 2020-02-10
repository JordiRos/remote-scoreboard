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
    this.state = {name: '', score: '0', id: props.id};
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
      <div className="column">
        <div className="field has-addons">
          <div className="control is-expanded">
            <input className="input player" placeholder={"Player " + this.state.id} type="text" value={this.state.name} onChange={this.onChangeName.bind(this)}/>
          </div>
          <div className="control">
            <button className="button is-danger" onClick={this.onResetName.bind(this)}>
              <span className="icon is-small">
                <i className="fas fa-times"/>
              </span>
            </button>
          </div>
        </div>
        <div className="content field has-addons">
          <div className="control">
            <button className="button is-large has-addons" onClick={this.onSubScore.bind(this)}>-</button>
            <p/>
          </div>
          <div className="control is-expanded">
            <input className="input is-large has-addons" type="text" value={this.state.score} onChange={this.onChangeScore.bind(this)}/>
          </div>
          <div className="control">
            <button className="button is-large has-addons" onClick={this.onAddScore.bind(this)}>+</button>
          </div>
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
        var style = 'button is-light';
        if (this.state.selectedScene === scene) {
          style += ' is-primary is-outlined';
        }
        else {
          style += '  ';
        }
        scenes.push(<button className={style} key={scene} data-scene={scene} onClick={this.onSelectStage.bind(this)}>{scene}</button>);
      });
    }

    return (
      <div className="container">
        <div className="box">
          <div className="columns">
            <Player ref="player1" id="1"/>
            <div className="column is-one-quarter">
              <button className="button is-primary is-fullwidth gap" onClick={this.onResetMatch.bind(this)}>Reset Match</button>
              <button className="button is-primary is-fullwidth gap" onClick={this.onCasuals.bind(this)}>Casuals</button>
            </div>
            <Player ref="player2" id="2"/>
          </div>
          <input className="input is-half-width gap" placeholder="Stage" type="text" value={this.state.stage} onChange={this.onChangeStage.bind(this)} />          
          <textarea className="textarea is-expanded gap" placeholder="Message" rows="2" type="text" value={this.state.message} onChange={this.onChangeMessage.bind(this)} />
          <div className="buttons are-medium is-centered">
            <button className="button is-centered is-danger is-medium gap" onClick={this.onReset.bind(this)}>RESET</button>
          </div>
          <div className="buttons are-medium is-centered">
            {scenes}
          </div>
        </div>
        <div className="small-text has-text-centered">
          {this.state.connected}
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Scoreboard />, document.getElementById('root'));

