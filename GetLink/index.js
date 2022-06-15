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
    // read file json
    let count_item = 0;
    let temp_download = "";
    var obj = {
        data: []
    };

    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 2,
      });
    await cluster.task(async ({ page, data: url }) => {
        const data = await checkItem("data.json",count_item,temp_download,linkImage);
        console.log(data)
        if (data[0] === 1)
        {
            console.log("dung")
            return res.status(200).send(data[1]);
        }
        await page.setViewport({ width: 1600, height: 1600 });
        await page.setDefaultNavigationTimeout(0);

        await page.goto('https://vn.pikbest.com/'); // wait until page load
        // click and wait for navigation
        await Promise.all([
            page.click('.login')
        ]);
        await page.screenshot({ path: 'cap1.png' });
        await Promise.all([
            page.click('.base-public-rlg-tab-login')
        ]);
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
        console.log(linkImage)
        // console.log("title: ",title)
        //await page.screenshot({ path: 'cap3.png' });
        try {
            await page.goto(linkImage, { waitUntil: 'load', timeout: 0 })
            //await page.screenshot({ path: 'cap4.png' });
            await page.$eval('a.dlbtn.dljpg.ga-click', elem => elem.click());
            //await page.screenshot({ path: 'cap5.png' });
            await page.waitForSelector('.download-btn')
            let linkImg = await page.$eval('.download-btn', anchor => anchor.getAttribute('href'));
            //await page.screenshot({ path: 'cap6.png' });
            console.time('test');
            let linkImage_dl = linkImage.replace('//vn.', '//img.');
            linkImage_dl = linkImage_dl.replace('.html','.png');
            linkImage_dl = linkImage_dl.replace('qianku-','qianku/');
            linkImage_dl = linkImage_dl.replace('qiantu-','qiantu/');
            
            let linkImg_URI = encodeURI(linkImage_dl)
            console.log(linkImg_URI)
            // await page.goto(linkImg, { waitUntil: 'networkidle2', timeout: 0 })
            await page.goto(linkImg_URI, { waitUntil: 'networkidle2', timeout: 0 })
            //await page.waitForFunction("document.querySelector('.down-again').getAttribute('href')",{timeout:0});
            console.log("OK")
            download(linkImg_URI, `./image/${title}`, function () {
                fs.exists('data.json', function(exists) {      
                    if (exists) {            
                        console.log("yes file exists");               
                        fs.readFile('data.json', function readFileCallback(err, data) {
                            if (err) {
                                console.log(err);
                            } else {
                                obj = JSON.parse(data);
                                obj.data.push({
                                    "Link_Html": linkImage,
                                    "Link_Download": `./image/${title}`
                                });
                                var json = JSON.stringify(obj);
                                fs.writeFile('data.json',json, function(err){
                                    if(err) return console.log(err);
                                    console.log('Note added');
                                });
                            }
                        });
                    } else {
                        console.log("file not exists");
                        obj.data.push({
                            "Link_Html": linkImage,
                            "Link_Download": `./image/${title}`
                        });
                        var json = JSON.stringify(obj);
                        fs.writeFileSync('data.json', json);
                    }
                });
                res.status(200).send(`./image/${title}`);
            })
            console.timeEnd('test');    
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

var download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

const checkItem = async function(name_file,c_item,t_d,L_I) {
    const checkdata =await readFile(name_file)
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
        if (item.Link_Html===L_I)
        {
            c_item = 1;
            t_d = item.Link_Download;   
            return [c_item,t_d];
        } 
    });
    return [c_item,t_d];
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