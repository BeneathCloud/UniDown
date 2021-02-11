const m3u8ToMp4 = require("m3u8-to-mp4")
const converter = new m3u8ToMp4()

var m3u8Downloader = {
    download: async function (url, path) {
        console.log("Download started: " + path)
        await converter
            .setInputFile(url)
            .setOutputFile(path)
            .start();
        console.log("Download finished: " + path)
    }
}

module.exports = m3u8Downloader

