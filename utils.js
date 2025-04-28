const axios = require('axios').default;
const fs = require("fs");
require('dotenv').config();


const apiKey = process.env.API_KEY;
if (!process.env.API_KEY) {
    console.error("API_KEY or API_SECRET missing in .env");
    process.exit(1);
}


module.exports = {
    getDate,
    convertToValidFilename,
    getRecentTracks,
    getAlbum,
    downloadFile
};

function getDate() {
    const date = new Date();
    return date.toISOString().replace("T", " ").replace("Z", "");
}

function convertToValidFilename(string) {
    return (string.replace(/[\/|\\:*.?"<>]/g, ""));
}

async function downloadFile(fileUrl, outputLocationPath) {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(outputLocationPath)) resolve(true);
        const writer = fs.createWriteStream(outputLocationPath);

        return axios({
            method: 'get',
            url: fileUrl,
            responseType: 'stream',
        }).then(response => {

            response.data.pipe(writer);
            let error = null;
            writer.on('error', err => {
                error = err;
                writer.close();
                reject(err);
            });

            writer.on('close', () => {
                if (!error) resolve(true);
            });
        });
    });
}

async function getRecentTracks(user) {
    return new Promise((resolve, reject) => {
        axios.get(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${user}&api_key=${apiKey}&format=json`)
            .then(response => {
                const data = response.data;
                if (data.error) return reject(`Error getting recent tracks for user ${user}: ${data.message}`);
                if (!data.recenttracks || !data.recenttracks.track) return reject(`No recent tracks found for user ${user}.`);
                resolve(data.recenttracks.track);
            })
            .catch(error => {
                if (error.response && error.response.status === 404) {
                    reject("Invalid user.");
                } else {
                    reject(`Error fetching recent tracks: ${error.message}`);
                }
            });
    });
}

async function getAlbum(mbid) {
    try {
        if (!mbid || mbid.trim() === '') {
            console.error('No mbid provided');
            return null;
        }
        const req = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${apiKey}&mbid=${mbid}&format=json`);
        const data = req.data;
        if (data.error) {
            console.error(`Error getting album info for mbid ${mbid}: ${data.message}`);
            return;
        }
        return data.album;
    } catch (error) {
        console.error(`Error getting album info for mbid ${mbid}: ${error.message}`);
        return null;
    }
}