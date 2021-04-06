const express = require("express")
const app = express()
const bodyParser = require('body-parser')
// const http = require('http')
// const https = require('https')
// const path = require('path')
const fs = require('fs')
const axios = require('axios')
const urlParser = require('url')
const status = require('./status.js')
const pornhub = require('./p.js')
const ehentai = require('./e.js')
const instagram = require('./instagram.js')
const xvideos = require('./x.js')
const youtube = require('./youtube.js')

const config = require('./config.js')
const baseSaveDir = config.get('baseSaveDir').value()
const direct = `${baseSaveDir}/direct` // directory for direct download link
if (!fs.existsSync(direct)) fs.mkdirSync(direct)

const sources = [
    {name: 'pornhub', fn: pornhub.download, saveDir: 'pornhub'},
    {name: 'e-hentai', fn: ehentai.download, saveDir: 'ehentai'},
    {name: 'instagram', fn: instagram.download, saveDir: 'instagram'},
    {name: 'xvideos', fn: xvideos.download, saveDir: 'xvideos'},
    {name: 'youtube', fn: youtube.download, saveDir: 'youtube'}
].map((x) => {
    x.saveDir = baseSaveDir + '/' + x.saveDir
    if (!fs.existsSync(x.saveDir)){
        fs.mkdirSync(x.saveDir);
    }
    return x
})

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.listen(3000, () => {
    console.log("Server running on port 3000")
})

app.get("/status", (req, res) => {
    res.send(status.getStatus())
})

app.get("/log", (req, res) => {
    fs.readFile('./log.txt', 'utf8', (err, data) => {
        if (err) {
            console.error(err)
        } else {
            res.send(data)
        }
    })
})

app.delete("/status/failed", (req, res) => {
    res.send(status.deleteFailed())
})

app.delete("/status/downloading", (req, res) => {
    res.send(status.deleteDownloading())
})

app.delete("/status/downloaded", (req, res) => {
    res.send(status.deleteDownloaded())
})

app.delete("/status", (req, res) => {
    res.send(status.resetStatus())
})

app.delete("/log", (req, res) => {
    try {
        fs.closeSync(fs.openSync("./log.txt", 'w'));
        res.send("log file clear succeed")
    } catch (err) {
        console.error(err)
        res.send('log file clear failed: ' + err)
    }
})

app.post("/resource", (req, res) => {
    const url = req.body.url
    const hostname = urlParser.parse(url).hostname
    try {
        const source = sources.find(x => hostname.includes(x.name))
        if (source) {
            const downloadFn = source.fn
            downloadFn(url, source.saveDir)
            res.send("[Download Started: ]" + url)
        } else {
            // console.error("[Source Not Supported Yet: ]" + hostname + '\n')
            // throw "[Source Not Supported Yet: ]" + hostname + '\n'
            axios({
                method: 'get',
                url: url,
                responseType: 'stream'
            })
                .then((response) => {
                    const name = Date() + ' ' + urlParser.parse(url).pathname.split('/').pop()
                    response.data.pipe(fs.createWriteStream(`${direct}/${name}`))
                    res.send("[Download Started: ]" + url)
                })
                .catch((err) => {
                    console.error(`error when downloading direct link ${url}: ${err}`)
                    res.send('[Download Failed: ]' + err)
                })
        }
    } catch (err) {
        console.error(err)
        res.send('[Download Failed: ]' + err)
    }
})
