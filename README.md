# remote-scoreboard
A remote scoreboard streaming tool, especially designed for PvP matches with scoring (ie fighting games).
It allows modifying text files linked to overlays from a local or remote PC, via a nodejs service, which serves both the site and the api.
Additionaly, it can connect to an OBS via obs-websocket plugin (https://github.com/Palakis/obs-websocket) to receive a list of available scenes, displaying them as buttons and allow selecting them from the app.
The site is built using React and Bulma, and is 100% responsive, so you can even control your streaming with your phone, similar to a Stream Deck.

TLDR; You can control your streaming remotely from another PC/tablet/phone, and modify names, score, stage, messages and select the current stremaing scene (OBS only).

# usage
If you want to just use it, download an already packed release (currently 0.1.1), do 'npm install' then 'npm run start'.
Open a browser and point to the machine where this is running, ie http://192.168.1.50:3000/index.html (or localhost if same PC).

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
- Allow more OBS options, as obs-websocket exposes ALL the API
- Link to challonge to fetch user names and stage

![Alt text](/remote-scoreboard.jpg?raw=true)
