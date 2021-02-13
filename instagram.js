const urlParser = require('url')
const status = require('./status.js')
const utils = require('./utils.js')
const fs = require('fs')
const axios = require('axios')
const cp = require("child_process");

const config = require('./config.js')
const username = config.get('instagram.username').value()
const password = config.get('instagram.password').value()
const following = config.get('instagram.following')
const downloader = config.get('instagram.pathToInstaloader').value()

async function downloadProfile(url, path) {
    const profile = urlParser.parse(url).pathname.split('/').filter(x => x!=='')[0]

    const downProcess = cp.spawn(downloader, [`--login ${username}`, `--password ${password}`, profile], {
        cwd: path
    })

    const processStatus = {
        error: false,
    }
    
    downProcess.on('spawn', () => {
        console.log(`child process spawned successfully`)
        status.setDownloading(profile, url)
    })
    
    downProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`)
    })

    downProcess.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`)
        processStatus.error = true
    })

    downProcess.on('exit', (code) => {
        console.log(`child process exited with code ${code}`)
        status.removeDownloading(profile)
        if (processStatus.error) {
            status.setFailed(profile, error)
            console.log('[Download Failed: ]' + profile)
        } else {
            const followList = following.value()
            if (!followList.find(x => x == profile)) {
                following.push(profile).write()
            }
            console.log('[Download Completed: ]' + profile)
            status.setDownloaded(profile, url)
        }
    })

    downProcess.on('error', (err) => {
        console.error(`spawn child process error: ${err}`)
        status.setFailed(profile, error)
    })

    // exec(`cd ${path}; ${downloader} --login ${username} --password ${password} ${profile}`, (error, stdout, stderr) => {
    //     if (error) {
    //         console.log(`error: ${error.message}`)
    //         status.setFailed(profile, error)
    //         status.removeDownloading(profile)
    //         return
    //     }
    //     if (stderr) {
    //         console.log(`stderr: ${stderr}`)
    //         status.setFailed(profile, stderr)
    //         status.removeDownloading(profile)
    //         return
    //     }
    //     console.log(`stdout: ${stdout}`)
    //     const followList = following.value()
    //     if (!followList.find(x => x == profile)) {
    //         following.push(profile).write()
    //     }
    //     console.log('[Download Completed: ]' + profile)

    //     status.removeDownloading(profile)
    //     status.setDownloaded(profile, url)
    // })
}

async function update(profile, path) {

    status.setDownloading(profile, "updating...")
    
    exec(`cd ${path}; ${downloader} --login ${username} --password ${password} --fast-update ${profile}`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`)
            status.setFailed(profile, error)
            status.removeDownloading(profile)
            return
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`)
            status.setFailed(profile, stderr)
            status.removeDownloading(profile)
            return
        }
        console.log(`stdout: ${stdout}`)
        console.log('[Update Completed: ]' + profile)

        status.removeDownloading(profile)
        status.setDownloaded(profile, "updated")
    })
}

async function updateAllFollowing(path) {

    status.setDownloading("updating all following...")
    
    const followList = following.value()
    exec(`cd ${path}; ${downloader} --login ${username} --password ${password} --fast-update ${followList.join(' ')}`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`)
            status.setFailed("update all", error)
            status.removeDownloading("updating all following...")
            return
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`)
            status.setFailed("update all", stderr)
            status.removeDownloading("updating all following...")
            return
        }
        console.log(`stdout: ${stdout}`)
        console.log('[Update All Completed: ]' + followList.join(', '))

        status.removeDownloading("updating all following...")
        status.setDownloaded("updated all following")
    })
}

module.exports = {
    download: downloadProfile,
    update: update,
    updateAll: updateAllFollowing
}
