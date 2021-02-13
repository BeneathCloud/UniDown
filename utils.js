const fs = require('fs')

var utils = {
    isDuplicate: function (fileName, dir) {
        return fs.readdirSync(dir).find(n => n == fileName) || false
    }
}

module.exports = utils
