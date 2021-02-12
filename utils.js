const fs = require('fs')

var utils = {
    isDuplicate: function (fileName, path) {
        return fs.readdirSync(path).find(n => n == fileName) || false
    }
}

module.exports = utils
