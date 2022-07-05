const axios = require("axios");
const express = require("express");
const puppeteer = require('puppeteer');
var crypto = require("crypto");
var fs = require('fs'),
    request = require('request');
const { flatten } = require("cheerio/lib/options");
const { Cluster } = require('puppeteer-cluster');
const app = express();


// var page
// main()
app.get("/", async (req, res) => {
    res.status(200).send("receive");
});
app.get("/test", async (req, res) => {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    const linkImage = req.query.linkImage;

    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 2,
        puppeteerOptions: {
            headless: true,
            ignoreHTTPSErrors: true
        },
    });
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
            //await page.$eval('a.dlbtn.dljpg.ga-click', elem => elem.click());
            const is_png = page.$('a.block-gradient.graHover.dlbtn.ga-click.cate-5');
            const old_png = page.$('a.dlbtn.dljpg.ga-click');
            if(is_png)
            {
                console.log("is_PNG: ",is_png.innerText, old_png);
            }
            if(old_png)
            {
                console.log("old_PNG: ",is_png.innerText, old_png);
            }
            
            await page.$eval('a.block-gradient.graHover.dlbtn.ga-click.cate-5', elem => elem.click());
            //await page.screenshot({ path: 'cap5.png' });
            await page.waitForSelector('.download-btn')
            let linkImg = await page.$eval('.download-btn', anchor => anchor.getAttribute('href'));
            console.log(2, linkImg);

            await page.goto("https://vn.pikbest.com" + linkImg, { waitUntil: 'load', timeout: 0 });
            await page.waitForResponse(response => {
                // console.log(response.url())
                // if (response.url().includes("https://zip.pikbest.com")) {
                //     return res.status(200).send(response.url());
                // }
                if (response.url().includes("https://proxy-tc.58pic.com")) {
                    return res.status(200).send(response.url());
                }
                
            });
            console.log(4, "OK")
        } catch (err) {
            return res.status(500).send({ error: err.message });
        }
        // Store screenshot, do something else
    });
    cluster.queue(linkImage);
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
        await page.type('#base-public-login-email-text', 'mapj8420@yahoo.com');
        await page.type('#base-public-login-password-text', 'popopo26');
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

async function global() {
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
        await page.type('#base-public-login-email-text', 'mapj8420@yahoo.com');
        await page.type('#base-public-login-password-text', 'popopo26');
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

const checkItem = async function (name_file, c_item, t_d, L_I) {
    const checkdata = await readFile(name_file)
    obj = JSON.parse(checkdata);
    // for(i=0; i<obj.data.length; i++)
    // {
    //     console.log("link",obj.data[i].Link_Html)
    //     if (obj.data[i].Link_Html===L_I)
    //     {
    //         c_item = 1;
    //         t_d = obj.data[i].Link_Download;   
    //         return [c_item,t_d];
    //     }    
    // }
    await obj.data.map(item => {
        if (item.Link_Html === L_I) {
            c_item = 1;
            t_d = item.Link_Download;
            return [c_item, t_d];
        }
    });
    return [c_item, t_d];
}

async function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', function (err, data) {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}


const PORT = process.env.PORT || 3001;
app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server started at port: ${PORT}`);
});