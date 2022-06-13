const axios = require("axios");
const express = require("express");
const puppeteer = require('puppeteer');
var crypto = require("crypto");
var fs = require('fs'),
    request = require('request');

const app = express();
// var page
// main()
app.get("/", async (req, res) => {
    res.status(200).send("receive");
});
app.get("/test", async (req, res) => {
    const browser = await puppeteer.launch({ headless: true, executablePath: '/usr/bin/chromium-browser', args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox'] });
    let page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1600 });
    await page.setDefaultNavigationTimeout(0);
    await page.goto('https://vi.pngtree.com/'); // wait until page load
    // click and wait for navigation
    await Promise.all([
        page.click('.base-public-login-button')
    ]);
    // await page.setViewport({width: 1200, height: 720});
    await page.type('#base-public-login-email-text', 'djflea@gmail.com');
    await page.type('#base-public-login-password-text', 'master1086');
    // click and wait for navigation
    await Promise.all([
        page.click('#base-sub-Login-Btn')
    ]);
    const linkImage = req.query.linkImage;
    const title = `image_${crypto.randomBytes(20).toString('hex')}.png`
    console.log(linkImage)
    try {
        await page.goto(linkImage, { waitUntil: 'load', timeout: 0 })
        await page.waitForSelector('.btn-downjpg')
        let linkImg = await page.$eval('.btn-downjpg', anchor => anchor.getAttribute('href'));
        console.log(linkImg)
        linkImg = encodeURI(`https://vi.pngtree.com${linkImg}`)
        await page.goto(linkImg, { waitUntil: 'networkidle2', timeout: 0 })
        //await page.waitForFunction("document.querySelector('.down-again').getAttribute('href')",{timeout:0});
        console.log("OK")
        const test = await page.$eval('#wrapper', anchor => anchor.innerHTML);

        //download(encodeURI(linkImg2), `./image/${title}`, function () {
        //    res.status(200).send(`/image/${title}`);
        //})
        res.status(200).send(test)
    } catch (err) {
        res.status(500).send({ error: err.message });
    } finally {
        // driver.quit();
    }
});
async function main() {
    try {
        const browser = await puppeteer.launch({ headless: true, executablePath: '/usr/bin/chromium-browser', args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox'] });
        page = await browser.newPage();
        await page.setViewport({ width: 1600, height: 1600 });
        await page.setDefaultNavigationTimeout(0);
        await page.goto('https://vi.pngtree.com/'); // wait until page load
        // click and wait for navigation
        await Promise.all([
            page.click('.base-public-login-button')
        ]);
        // await page.setViewport({width: 1200, height: 720});
        await page.type('#base-public-login-email-text', 'djflea@gmail.com');
        await page.type('#base-public-login-password-text', 'master1086');
        // click and wait for navigation
        await Promise.all([
            page.click('#base-sub-Login-Btn')
        ]);
        console.log("done init")
        return page
    }
    catch (err) {
        console.log(err)
    }
}

var download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};
const PORT = process.env.PORT || 3001;
app.listen(PORT, '207.148.71.10', () => {
    console.log(`Server started at port: ${PORT}`);
});
