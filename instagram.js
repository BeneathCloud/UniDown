const urlParser = require('url')
const status = require('./status.js')
const utils = require('./utils.js')
const fs = require('fs')
const axios = require('axios')
const cp = require("child_process");

const config = require('./config.js')
const username = config.get('instagram.username').value()
const password = config.get('instagram.password').value()
const login = config.get('instagram.login').value()
const following = config.get('instagram.following')
const downloader = config.get('instagram.pathToInstaloader').value()

let args = undefined
if (login) {
    args = [`--login=${username}`, `--password=${password}`]
} else {
    args = []
}

async function downloadProfile(url, path) {
    const profile = urlParser.parse(url).pathname.split('/').filter(x => x!=='')[0]

    if (following.value().find(x => x === profile)) {
        console.log(`${profile} is in following list, download canceled, please use update`)
        status.setFailed(profile, `${profile} is in following list, download canceled, please use update`)
        return
    }

    const downProcess = cp.spawn(downloader, args.concat([profile]), {
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
            status.setFailed(profile, `child process exited with code ${code}`)
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
        status.setFailed(profile, err)
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
