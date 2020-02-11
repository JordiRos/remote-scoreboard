# remote-scoreboard
A remote scoreboard streaming tool, especially designed for PvP matches with scoring (ie fighting games).
It allows modifying text files linked to overlays from a local or remote PC, via a nodejs service, which serves both the site and the api.
OBS integration: it can connect to an OBS via obs-websocket plugin (https://github.com/Palakis/obs-websocket) to receive a list of available scenes, displaying them as buttons and allow selecting them from the app.
Challonge integration: it can connect to Challonge with username / api key, and fetch player names from a tournament, for easier selection.
The site is built using React and Bulma and is 100% responsive, so you can control your streaming with a phone or tablet too, similar to a Stream Deck.

TLDR; control your streaming remotely from another PC/tablet/phone, modify names, score, stage, messages, plus select current streaming scene (OBS only) and fetch player names from a Challonge tournament.

# usage
If you want to just use it, download an already packed release (currently 0.1.2), do 'npm install' then 'npm run start'.
Open a browser and point to the machine where this is running, ie http://192.168.1.50:3000/index.html (or localhost if same PC).

You can edit a few options via a cfg.ini file

<code>verbose=true              # either you want some more log verbosity</code></br>
<code>apiPort=3000              # if you want a different port from the default 3000</code></br>
<code>dataPath=c:/obs_overlays  # where the streaming files will be saved</code></br>
<code>obsHost=localhost:4444    # if you want to connect to your OBS</code></br>
<code>obsPassword=password      # if your OBS is protected by a password, this is it</code></br>
<code>challongeUsername=user    # if you want to connect to Challonge</code></br>
<code>challongeApiKey=password  # apiKey for your Challonge user</code></br>

These are the file names that will be saved in the dataPath folder

p1name.txt # Player 1 name</br>
p2name.txt # Player 2 name</br>
p1score.txt # score for Player 1</br>
p2score.txt # score for Player 2</br>
stage.txt # stage (Pools, Winners, Losers, Casuals, etc)</br>
message.txt # additional message, usually while in rest mode, or to send some advice, can accomodate longer text</br>

# todo
- Add some security to prevent anyone else from connecting
- Receive the contents of all values at login time, and fill the client properly
- Allow more OBS options, as obs-websocket exposes ALL the API

![Alt text](/remote-scoreboard.jpg?raw=true)
