const pornhub = require('@justalk/pornhub-api')
const m3u8Downloader = require('./m3u8-downloader.js')
const fs = require('fs');
const db = require('./db.js')

var pornhubDownloader = {
    download: async function (url, saveDir) {
        db.read()
        try {
            const video = await pornhub.page(url, ['title', 'download_urls'])
            if (video.error) throw "fetch url failed"
            const title = video.title
            const directUrls = video.download_urls
            const highestResolution = Math.max(...Object.keys(directUrls).map((x) => {return parseInt(x.slice(0, -1))})) + 'P'
            const directUrl = directUrls[highestResolution]
            const path = saveDir + '/' + title + '.mp4'

            const existingVideos = fs.readdirSync(saveDir)
            if (existingVideos.find(fileName => fileName == (title + '.mp4'))) {
                throw "file existing"
            }

            db.get('downloading')
                .push({title: title, url: directUrl})
                .write()
            await m3u8Downloader.download(directUrl, path)
            db.get('downloading')
                .remove({title: title})
                .write()
            db.get('downloaded')
                .push({title: title, url: directUrl})
                .write()
        } catch (err) {
            console.error("Download failed: " + url + "\n" + err)
            db.get('failed')
                .push({url: url, description: err})
                .write()
        }
    }
}

module.exports = pornhubDownloader
