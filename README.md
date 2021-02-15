# UniDown
(Personal use) An API for control downloading remotely, e.g. on a raspberry pi with external HDDs

## Current Supports
1. `p***hub`
2. xvideos
3. e-hentai
4. instagram
5. youtube
6. direct downloading

## Prerequsites

1. `pip3 install instaloader` (for instagram)
2. `sudo apt install chromium-browser` if you are using Raspberry Pi
3. ffmpeg (for youtube)
4. and of course, nodejs

## Installation

1. clone this repo
2. run `npm install`
3. modify the `config.json`, set the `baseSaveDir` to the directory you want to put your files in, set ehentai `id` & `hash` from your logged in browser session, set instagram usename and password if necessary(if you don't want, set the `login` option to `false`), set `installoader` path
4. run `./run` or `node app.js` in current directory, or add it as a service if you want

After all these, you should be able to access the api from your browser at port `3000`, e.g. `http://127.0.0.1:3000`:
- POST `/resource`, with a body `url` where you put the url you want to download, will download automaticaly
- GET `/status`, show current download status
- GET `/log`, show log
- and others, you can find them in app.js
