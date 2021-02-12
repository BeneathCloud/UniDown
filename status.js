const db = require('./db.js')

function setDownloading(title, url) {
    db.get('downloading')
        .push({title: title, url: url})
        .write()
}

function removeDownloading(title) {
    db.get('downloading')
        .remove({title: title})
        .write()
}

function setDownloaded(title, url) {
    db.get('downloaded')
        .push({title: title, url: url})
        .write()
}

function setFailed(url, err) {
    db.get('failed')
        .push({url: url, description: err})
        .write()
}

function getStatus() {
    db.read()
    return db.getState()
}

function deleteFailed() {
    db.set('failed', []).write()
    return getStatus()
}

function deleteDownloading() {
    db.set('downloading', []).write()
    return getStatus()
}

function deleteDownloaded() {
    db.set('downloaded', []).write()
    return getStatus()
}

function resetStatus() {
    db.setState({ downloading: [], downloaded: [], failed: [] }).write()
    return getStatus()
}

module.exports = {
    setDownloading: setDownloading,
    setDownloaded: setDownloaded,
    removeDownloading: removeDownloading,
    setFailed: setFailed,
    getStatus: getStatus,
    deleteFailed: deleteFailed,
    deleteDownloading: deleteDownloading,
    deleteDownloaded: deleteDownloaded,
    resetStatus: resetStatus
}
