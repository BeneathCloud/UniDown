const urlParser = require('url')
const status = require('./status.js')
const utils = require('./utils.js')
const fs = require('fs')
const axios = require('axios')
const { exec } = require("child_process");

const config = require('./config.js')
const username = config.get('instagram.username').value()
const password = config.get('instagram.password').value()
const following = config.get('instagram.following')

async function downloadProfile(url, path) {
    const profile = urlParser.parse(url).pathname.split('/').filter(x => x!=='')[0]
    exec(`cd ${path}; instaloader --login ${username} --password ${password} ${profile}`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`)
            return
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`)
            return
        }
        console.log(`stdout: ${stdout}`)
        following.push(profile).write()
        console.log('[Download Completed: ]' + profile)
    })
}

async function update(profile, path) {
    exec(`cd ${path}; instaloader --login ${username} --password ${password} --fast-update ${profile}`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`)
            return
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`)
            return
        }
        console.log(`stdout: ${stdout}`)
        console.log('[Update Completed: ]' + profile)
    })
}

async function updateAllFollowing(path) {
    const followList = following.value()
    exec(`cd ${path}; instaloader --login ${username} --password ${password} --fast-update ${followList.join(' ')}`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`)
            return
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`)
            return
        }
        console.log(`stdout: ${stdout}`)
        console.log('[Update All Completed: ]' + followList.join(', '))
    })
}

module.exports = {
    download: downloadProfile,
    update: update,
    updateAll: updateAllFollowing
}
