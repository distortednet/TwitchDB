# TwitchDB

The codebase for [TwitchDB](http://www.twitchdb.tv/)

TwitchDB is a streamer database that is the replacement to the Twitch subreddit intro database spreadsheet. TwitchDB is positioned to be the largest 3rd party database of streamers. TwitchDB helps streamers get noticed, and provides functionality for streamers to improve all aspects of their stream by gathering viewer feedback.

If you know what you're doing, feel free to do stuff.

Dev Enviroment Requirements:

- [Node.js](https://nodejs.org/)
- [RethinkDB](http://rethinkdb.com/)

Once installed, and you've added a Twitch app to your Twitch account, configure config.js.

In the directory you've cloned TwitchDB in to run:

`npm install`

Then to run TwitchDB in a Dev Enviroment run:

`node app dev`

If successful, you should see something similar to "listening on localhost:8080".

A sample database can be provided for RethinkDB. If you need that, or help setting up a dev enviroment, contact Distortednet directly.
