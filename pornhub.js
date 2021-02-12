const pornhub = require('@justalk/pornhub-api')
const m3u8Downloader = require('./m3u8-downloader.js')
const fs = require('fs');
const status = require('./status.js')

var pornhubDownloader = {
    download: async function (url, saveDir) {
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

            status.setDownloading(title, directUrl)
            await m3u8Downloader.download(directUrl, path)
            status.removeDownloading(title)
            status.setDownloaded(title, directUrl)
        } catch (err) {
            console.error("[Download Failed: ]" + url + "\n" + err)
            status.setFailed(url, err)
        }
    }
}

module.exports = pornhubDownloader
