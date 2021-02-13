const m3u8Downloader = require('./m3u8-downloader.js')
const xvideos = require('@rodrigogs/xvideos')
const status = require('./status.js')
const utils = require('./utils.js')

async function download(url, path) {
    try {

        const info = await xvideos.videos.details({ url: url })
        const title = info.title.replaceAll('/', '\\')
        const fileName = title + '.mp4'
        const pathName = path + '/' + fileName

        if (utils.isDuplicate(fileName, path)) throw `file ${fileName} exists in ${path}`

        status.setDownloading(title, url)
        await m3u8Downloader.download(info.files.HLS, pathName)
        status.removeDownloading(title)
        status.setDownloaded(title, url)
        
    } catch (err) {
        console.error(err)
        status.setFailed(url, err)
    }
}

module.exports = {
    download: download
}
