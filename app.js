const express = require("express")
const app = express()
const bodyParser = require('body-parser')
// const http = require('http')
// const https = require('https')
// const path = require('path')
const fs = require('fs')
const urlParser = require('url')
const pornhub = require('./pornhub.js')
const db = require('./db.js')

const raw = fs.readFileSync('config.json')
const config = JSON.parse(raw)

const baseSaveDir = config.baseSaveDir
// if (!fs.existsSync(baseSaveDir)){
//     fs.mkdirSync(baseSaveDir);
// }

const sources = [
    {name: 'pornhub', fn: pornhub.download, saveDir: 'pornhub'}
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
    db.read()
    const state = db.getState()
    res.send(state)
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
    db.set('failed', []).write()
    res.send(db.read().getState())
})

app.delete("/status/downloading", (req, res) => {
    db.set('downloading', []).write()
    res.send(db.read().getState())
})

app.delete("/status/downloaded", (req, res) => {
    db.set('downloaded', []).write()
    res.send(db.read().getState())
})

app.delete("/status", (req, res) => {
    db.setState({ downloading: [], downloaded: [], failed: [] }).write()
    res.send(db.read().getState())
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
            console.error("Source not supported yet: " + hostname)
        }
    } catch (err) {
        console.error(err)
    }
    
    res.send("download started")
})
