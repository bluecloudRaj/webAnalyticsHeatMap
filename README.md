# Heater

Free website analytics and visitors tracking system. Heater is tracking every movement, scroll and click of every visitor. Even in real-time! You can play every visitor session or analyse parts of your website just by inserting piece of code into your website.

## Features
- Live tracking: Track your visitors in real-time!
- Playable user sessions: You can play, see and analyse everything your visitors do.
- Heat maps: Visualise the most important parts of your website!
- Reports: Display all sessions by chosen visitor.
- UI analyser: Analyse your user interface and improve it.

## How does it work?

It's simple! First of all you have to register a new account.Next you have to add< a new website into your account. The last step is inserting integration script on every page of your website you want to track. You can find it in administration by clicking on integration tile.

## Installation

Requirements: Node.js, MongoDB.

1. Download source code from Github
2. Install packages `npm install`
3. Edit config values
  * /server/config/app.js - change `secret` to secured string and `appUrl, appPort` to your server configuration
  * /server/static/heater.min.js - change `appUrl` to your server url
  * /src/app/shared/config.ts  - change `apiUrl` to your server url
4. Build administration `ng build -prod`
5. Start node server `node server.js` (or create a service for its purpose)
6. Enjoy!

## Open source

Code is available on Github for everyone and for free! Feel free to customise and install it on your own servers. If you have any feedback feel free to contact me. Application is using MEAN Stack [with Angular (2)] and socket.io for real-time features.