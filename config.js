const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('config.json')
const db = low(adapter)

db.defaults({
    baseSaveDir: "",
    ehentai: {
        id: "",
        hash: ""
    },
    instagram: {
        username: "",
        password: "",
        following: []
    }
})
  .write()

module.exports = db
