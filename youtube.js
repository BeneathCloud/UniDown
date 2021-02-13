/**
 * Reencode audio & video without creating files first
 *
 * Requirements: ffmpeg, ether via a manual installation or via ffmpeg-static
 *
 * If you need more complex features like an output-stream you can check the older, more complex example:
 * https://github.com/fent/node-ytdl-core/blob/cc6720f9387088d6253acc71c8a49000544d4d2a/example/ffmpeg.js
 */

const status = require('./status.js')
const utils = require('./utils.js')
const fs = require('fs')
// Buildin with nodejs
const cp = require('child_process');
const readline = require('readline');
// External modules
const ytdl = require('ytdl-core');
const ffmpeg = require('ffmpeg-static');

async function download(url, dir) {
    const ref = url;
    const tracker = {
        start: Date.now(),
        audio: { downloaded: 0, total: Infinity },
        video: { downloaded: 0, total: Infinity },
        merged: { frame: 0, speed: '0x', fps: 0 },
    };

    const info = await ytdl.getBasicInfo(url)
    const id = info.videoDetails.videoId
    const title = info.videoDetails.title.replaceAll('/', '\\')
    const name = `(${id}) ${title}.mp4`
    const path = `${dir}/${name}`

    try {
        if (utils.isDuplicate(name, dir)) throw `file ${name} exists`

        status.setDownloading(title, url)

        // Get audio and video streams
        const audio = ytdl(ref, { quality: 'highestaudio' })
              .on('progress', (_, downloaded, total) => {
                  tracker.audio = { downloaded, total };
              });
        const video = ytdl(ref, { quality: 'highestvideo' })
              .on('progress', (_, downloaded, total) => {
                  tracker.video = { downloaded, total };
              });

        // Prepare the progress bar
        let progressbarHandle = null;
        const progressbarInterval = 1000;
        const showProgress = () => {
            readline.cursorTo(process.stdout, 0);
            const toMB = i => (i / 1024 / 1024).toFixed(2);

            process.stdout.write(`Audio  | ${(tracker.audio.downloaded / tracker.audio.total * 100).toFixed(2)}% processed `);
            process.stdout.write(`(${toMB(tracker.audio.downloaded)}MB of ${toMB(tracker.audio.total)}MB).${' '.repeat(10)}\n`);

            process.stdout.write(`Video  | ${(tracker.video.downloaded / tracker.video.total * 100).toFixed(2)}% processed `);
            process.stdout.write(`(${toMB(tracker.video.downloaded)}MB of ${toMB(tracker.video.total)}MB).${' '.repeat(10)}\n`);

            process.stdout.write(`Merged | processing frame ${tracker.merged.frame} `);
            process.stdout.write(`(at ${tracker.merged.fps} fps => ${tracker.merged.speed}).${' '.repeat(10)}\n`);

            process.stdout.write(`running for: ${((Date.now() - tracker.start) / 1000 / 60).toFixed(2)} Minutes.`);
            readline.moveCursor(process.stdout, 0, -3);
        };

        // Start the ffmpeg child process
        const ffmpegProcess = cp.spawn(ffmpeg, [
            // Remove ffmpeg's console spamming
            '-loglevel', '8', '-hide_banner',
            // Redirect/Enable progress messages
            '-progress', 'pipe:3',
            // Set inputs
            '-i', 'pipe:4',
            '-i', 'pipe:5',
            // Map audio & video from streams
            '-map', '0:a',
            '-map', '1:v',
            // Keep encoding
            '-c:v', 'copy',
            // Define output file
            path,
        ], {
            windowsHide: true,
            stdio: [
                /* Standard: stdin, stdout, stderr */
                'inherit', 'inherit', 'inherit',
                /* Custom: pipe:3, pipe:4, pipe:5 */
                'pipe', 'pipe', 'pipe',
            ],
        });
        ffmpegProcess.on('close', () => {
            console.log('ffmpeg done');
            status.removeDownloading(title)
            status.setDownloaded(title, url)
            // Cleanup
            process.stdout.write('\n\n\n\n');
            clearInterval(progressbarHandle);
        });

        ffmpegProcess.on('error', (err) => {
            console.error(`spawn ffmpeg error: ${err}`)
        })

        // Link streams
        // FFmpeg creates the transformer streams and we just have to insert / read data
        ffmpegProcess.stdio[3].on('data', chunk => {
            // Start the progress bar
            if (!progressbarHandle) progressbarHandle = setInterval(showProgress, progressbarInterval);
            // Parse the param=value list returned by ffmpeg
            const lines = chunk.toString().trim().split('\n');
            const args = {};
            for (const l of lines) {
                const [key, value] = l.split('=');
                args[key.trim()] = value.trim();
            }
            tracker.merged = args;
        });

        await audio.pipe(ffmpegProcess.stdio[4]);
        await video.pipe(ffmpegProcess.stdio[5]);

        // video.pipe(fs.createWriteStream(path + '.mp4'))
        // audio.pipe(fs.createWriteStream(path + '.mp3'))

    } catch (err) {
        console.log(`error downloading: ${err}`)
        status.removeDownloading(title)
        status.setFailed(url, err)
    }
}

module.exports = {
    download: download
}
