const { createCanvas, loadImage } = require('canvas');
const express = require('express');
const axios = require('axios').default;
const fs = require('fs');
const path = require('path');
const utils = require('./utils.js');
const rateLimit = require('express-rate-limit');

const app = express();
const port = 3000;
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 50, // Limit each IP to 100 requests per windowMs
    message: "Too many requests, please try again later."
});

app.use(express.static("www"));

const artworkPath = path.join(__dirname, "artwork.png");
const templatePath = path.join(__dirname, "template.png");

if (!fs.existsSync(artworkPath) || !fs.existsSync(templatePath)) {
    console.error("Required image files are missing.");
    process.exit(1); // Exit the server if critical files are missing
}

if(!fs.existsSync("albums")) fs.mkdirSync("albums");

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "www", "index.html"));
});

app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
})

app.get('/:user', limiter, async (req, res) => {
    try {
        console.log(`${utils.getDate()} - Got a request for username ${req.params.user}, from the URL ${req.headers.referer}`);
        const user = req.params.user.trim();
        if (!user || user.length > 50) return res.sendFile(path.join(__dirname, "artwork.png"));

        const data = await utils.getRecentTracks(req.params.user);

        let artworkFilename;
        if (data[0].album["#text"].trim() === "") {
            artworkFilename = "artwork.png";
        } else {
            const artworkURL = data[0].image[2]["#text"];
            if (!artworkURL || artworkURL.trim() === "") {
                console.warn(`${utils.getDate()} - No artwork URL found for album ${data[0].album["#text"]}.`);
                artworkFilename = "artwork.png";
            } else {
                try {
                    artworkFilename = path.join("albums", utils.convertToValidFilename(data[0].album["#text"]) + ".png");
                    await utils.downloadFile(artworkURL, artworkFilename);
                } catch (error) {
                    console.error(`${utils.getDate()} - Failed to download artwork for album ${data[0].album["#text"]}.`);
                    artworkFilename = "artwork.png";
                }
            }

        }

        // Draw the image
        const canvas = createCanvas(238, 238);
        const ctx = canvas.getContext('2d');
        const artwork = await loadImage(artworkFilename);
        const template = await loadImage("template.png");

        ctx.drawImage(artwork, 0, 0, 238, 238);
        ctx.drawImage(template, 0, 0, 238, 238);
        ctx.font = '12px Segoe UI';
        ctx.fillStyle = "white";

        if (data[0].name.length >= 26) {
            ctx.fillText(data[0].name.substring(0, 26) + "...", 12, 20);
        } else {
            ctx.fillText(data[0].name, 12, 20);
        }

        const stream = canvas.createPNGStream();
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "no-cache");
        stream.pipe(res);
    } catch (error) {
        console.error(`${utils.getDate()} - Error fetching recent tracks for user ${req.params.user}: ${error}`);
        res.sendFile(path.join(__dirname, "artwork.png"));
    }
});

app.listen(port, () => {
    console.log(`Server is running at port ${port}.`)
});