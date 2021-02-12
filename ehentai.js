const exApi = require('exApi').default
const urlParser = require('url')
 
const cookies = {
    'ipb_member_id': '1940613',
    'ipb_pass_hash': '2dcd91d9959f8afe9f5c004ee0a58d4a'
    // 'igneous': *
}

const exapi = new exApi(cookies)

async function download(url, path) {
    const idToken = urlParser.parse(url).pathname.split('/').filter(x => x !== '' && x !== 'g')

    exapi.downloadGallery(idToken, path)
        .then((statusList) => {
            console.log(statusList)
        })
}

module.exports = {
    download: download
} 
