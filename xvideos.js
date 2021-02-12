const m3u8Downloader = require('./m3u8-downloader.js')
const xvideos = require('@rodrigogs/xvideos')
const status = require('./status.js')

async function download(url, path) {
    try {

        const info = await xvideos.videos.details({ url: url })
        const title = info.title.replaceAll('/', '\\')
        const pathName = path + '/' + title + '.mp4'

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
