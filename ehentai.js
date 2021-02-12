const exApi = require('exapi').default
const urlParser = require('url')
const status = require('./status.js')
 
const cookies = {
    'ipb_member_id': '1940613',
    'ipb_pass_hash': '2dcd91d9959f8afe9f5c004ee0a58d4a'
    // 'igneous': *
}

const exapi = new exApi(cookies)

async function download(url, path) {
    const idToken = urlParser.parse(url).pathname.split('/').filter(x => x !== '' && x !== 'g')

    status.setDownloading(idToken[0], url)

    exapi.downloadGallery(idToken, path)
        .then((statusList) => {
            console.log(statusList)
            status.removeDownloading(idToken[0])
            status.setDownloaded(idToken[0], url)
        })
        .catch((err) => {
            console.error(err)
            status.setFailed(url, err)
        })
}

module.exports = {
    download: download
} 
