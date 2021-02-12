const pornhub = require('@justalk/pornhub-api')
const m3u8Downloader = require('./m3u8-downloader.js')
const fs = require('fs');
const status = require('./status.js')
const utils = require('./utils.js')

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

            if (utils.isDuplicate(title + '.mp4', saveDir)) { throw "[File Existing: ]" + title + '.mp4' }

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
