# remote-scoreboard
A remote scoreboard streaming tool, especially designed for PvP matches with scoring.
It allows modifying text files linked to overlays from a local or remote PC, via a nodejs service, which serves both the site and the api.
Additionaly, it can connect to an OBS via obs-websocket plugin (https://github.com/Palakis/obs-websocket) to receive a list of available scenes, displaying them as buttons and allow selecting the active one from the app.

TLDR; You can control your streaming remotely from another PC or tablet, in a kind of expanded Stream Deck, where you can control score, set names, stage, messages and even select the current scene.

# usage
Downloading should be enough, it's already packed (made with React) and you just need to 'npm install' and 'npm run start'
Open a browser and point to the machine where this is running, ie http://192.168.1.50:3000/index.html (or localhost if same PC). Only tested on Chrome.

You can edit a few options via a cfg.ini file

<code>verbose=true              # either you want some more log verbosity</code></br>
<code>apiPort=3000              # if you want a different port from the default 3000</code></br>
<code>dataPath=c:/obs_overlays  # where the streaming files will be saved</code></br>
<code>obsHost=localhost:4444    # if you want to connect to your local OBS for getting and setting scenes remotely</code></br>
<code>obsPassword=obs_password  # if your OBS is protected by a password, this is it</code></br>

These are the file names that will be saved in the dataPath folder

p1name.txt # Player 1 name</br>
p2name.txt # Player 2 name</br>
p1score.txt # score for Player 1</br>
p2score.txt # score for Player 2</br>
stage.txt # stage (Pools, Winners, Losers, Casuals, etc)</br>
message.txt # additional message, usually while in rest mode, or to send some advice, can accomodate longer text</br>

# todo
- Add some security to prevent anyone else from connecting
- Auto reconnect to OBS if not available at init time
- Receive the contents of all values at login time, and fill the client properly
- Use BULMA or any other fancy CSS for simpler and responsive site (would be nice if it fits a phone too)
- Allow more OBS options, as obs-websocket exposes ALL the API
- Link to challonge to fetch user names and stage

![Alt text](/remote-scoreboard.jpg?raw=true)
