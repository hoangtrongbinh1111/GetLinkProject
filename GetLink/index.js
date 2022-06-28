const axios = require("axios");
const express = require("express");
const puppeteer = require('puppeteer');
var crypto = require("crypto");
var fs = require('fs'),
request = require('request');
const { flatten } = require("cheerio/lib/options");
const { Cluster } = require('puppeteer-cluster');
const app = express();

const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 2,
    puppeteerOptions: {
        headless: true,
        ignoreHTTPSErrors: true
    },
});

app.get("/", async (req, res) => {
    res.status(200).send("receive");
});
app.get("/test", async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    const linkImage = req.query.linkImage;

    await cluster.task(async ({ page, data: url }) => {
        await page.setViewport({ width: 1920, height: 1600 });
        await page.setDefaultNavigationTimeout(0);

        await page.goto('https://vn.pikbest.com/'); // wait until page load
        // click and wait for navigation
        await Promise.all([
            page.click('.login')
        ]);
        await page.screenshot({ path: 'cap1.png' });
        await page.click('.base-public-rlg-tab-login');
        //await page.screenshot({ path: 'cap2.png' });
        // await page.setViewport({width: 1200, height: 720});
        await page.type('#base-public-login-email', 'mapj8420@yahoo.com');
        await page.type('#base-public-login-password', 'popopo26');
        // click and wait for navigation
        await Promise.all([
            page.click('#base-public-rlg-login-btn')
        ]);
        await page.waitForNavigation();
        const title = `image_${crypto.randomBytes(20).toString('hex')}.jpeg`
        console.log(1, linkImage)
        // console.log("title: ",title)
        //await page.screenshot({ path: 'cap3.png' });
        try {
            await page.goto(linkImage, { waitUntil: 'load', timeout: 0 });
            await page.screenshot({ path: 'cap1.png' });
            //await page.screenshot({ path: 'cap4.png' });
            await page.$eval('a.dlbtn.dljpg.ga-click', elem => elem.click());
            //await page.screenshot({ path: 'cap5.png' });
            await page.waitForSelector('.download-btn')
            let linkImg = await page.$eval('.download-btn', anchor => anchor.getAttribute('href'));
            console.log(2, linkImg);

            await page.goto("https://vn.pikbest.com" + linkImg, { waitUntil: 'load', timeout: 0 });
            await page.waitForResponse(response => {
                if (response.url().includes("https://zip.pikbest.com")) {
                    return res.status(200).send(response.url());
                }
            });
            //await page.waitForFunction("document.querySelector('.down-again').getAttribute('href')",{timeout:0});
            console.log(4, "OK")
        } catch (err) {
            return res.status(500).send({ error: err.message });
        }
        // Store screenshot, do something else
    });
    cluster.queue(linkImage);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server started at port: ${PORT}`);
});