const express = require("express")
const app = express()
const bodyParser = require('body-parser')
// const http = require('http')
// const https = require('https')
// const path = require('path')
const fs = require('fs')
const urlParser = require('url')
const status = require('./status.js')
const pornhub = require('./pornhub.js')
const ehentai = require('./ehentai.js')

const raw = fs.readFileSync('config.json')
const config = JSON.parse(raw)

const baseSaveDir = config.baseSaveDir
// if (!fs.existsSync(baseSaveDir)){
//     fs.mkdirSync(baseSaveDir);
// }

const sources = [
    {name: 'pornhub', fn: pornhub.download, saveDir: 'pornhub'},
    {name: 'e-hentai', fn: ehentai.download, saveDir: 'ehentai'}
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

app.post("/resource", (req, res) => {
    const url = req.body.url
    const hostname = urlParser.parse(url).hostname

    try {
        const source = sources.find(x => hostname.includes(x.name))
        if (source) {
            const downloadFn = source.fn
            downloadFn(url, source.saveDir)
        } else {
            console.error("[Source Not Supported Yet: ]" + hostname)
        }
    } catch (err) {
        console.error(err)
    }
    
    res.send("[Download Started: ]" + url)
})
