const exApi = require('exapi').default
const urlParser = require('url')
const status = require('./status.js')
const utils = require('./utils.js')
 
const cookies = {
    'ipb_member_id': '1940613',
    'ipb_pass_hash': '2dcd91d9959f8afe9f5c004ee0a58d4a'
    // 'igneous': *
}

const exapi = new exApi(cookies)

async function download(url, path) {
    const idToken = urlParser.parse(url).pathname.split('/').filter(x => x !== '' && x !== 'g')

    try {
        if (utils.isDuplicate(idToken[0], path)) { throw "[File Existing: ]" + idToken[0] }

        status.setDownloading(idToken[0], url)
        await exapi.downloadGallery(idToken, path)
        console.log(statusList)
        status.removeDownloading(idToken[0])
        status.setDownloaded(idToken[0], url)

    } catch (err) {
        console.error("[ERROR: ]" + err)
        status.setFailed(url, err)
    }
}

module.exports = {
    download: download
} 
