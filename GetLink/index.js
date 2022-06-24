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
var chechCookie = {
    country:"",
    user_source_remark:""
}
var setcookies = [];
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
    const title = `image_${crypto.randomBytes(20).toString('hex')}.jpeg`
    console.log(1, linkImage);
    // console.log("title: ",title)
    //await page.screenshot({ path: 'cap3.png' });
    await withBrowser(async (browser) => {
        await withPage(browser)(async (page) => {
            try {
                await page.setViewport({ width: 1920, height: 1600 });
                await page.setDefaultNavigationTimeout(0);
                const client = await page.target().createCDPSession();
                const pageCookies = (await client.send('Network.getAllCookies')).cookies;
                console.log("allnew: ",pageCookies.length)
                //page =await main(page);
                console.log("setcookies: ",setcookies)
                if (pageCookies.length === 0)
                {
                    if (setcookies.length === 0)
                    {
                        page =await main(page);
                        console.log("dang nhap xong");
                    }
                    else{
                        await page.setCookie(...setcookies);
                        console.log("set log: cookie",)
                        await page.goto('https://vn.pikbest.com/');
                    }
                   
                }
                // pageCookies.map(item => {
                //     if (item.name ==="country"){
                //         if(item.value !== chechCookie.country)
                //         {
                //             page =main(page);
                //         }
                //     }
                //     if (item.name ==="user_source_remark"){
                //         if(item.value !== chechCookie.user_source_remark)
                //         {
                //             page =main(page);
                //         }
                //     }
                // })
                await page.goto(linkImage, { waitUntil: 'load', timeout: 0 });
                await page.screenshot({ path: 'cap1.png' });
                //await page.screenshot({ path: 'cap4.png' });
                let bt ="";
                let url_check ="";
                if (await page.$('a.dlbtn.dljpg.ga-click') !== null)
                {
                    bt = 'a.dlbtn.dljpg.ga-click';
                    url_check = "https://zip.pikbest.com";
                    console.log('bt: ',bt);
                } 
                else{
                    bt = 'a.block-gradient.graHover.dlbtn.ga-click.cate-5';
                    url_check = "https://proxy-tc.58pic.com";
                    console.log('bt: ',bt);
                } 
                await page.$eval(bt, elem => elem.click());
                //await page.screenshot({ path: 'cap5.png' });
                await page.waitForSelector('.download-btn')
                let linkImg = await page.$eval('.download-btn', anchor => anchor.getAttribute('href'));
                console.log(2, linkImg);
        
                await page.goto("https://vn.pikbest.com" + linkImg, { waitUntil: 'load', timeout: 0 });
                await page.waitForResponse(response => {
                    console.log(response.url())
                    if (response.url().includes(url_check)) {
                        return res.status(200).send(response.url());
                    }
                    
                });
                console.log(4, "OK")
                } catch (err) {
                    return res.status(500).send({ error: err.message });
                }
            });
    
        }
    );

    
});

async function main(page) {
    try {
        // const browser = await puppeteer.launch({ headless: true, args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox'] });
        // page = await browser.newPage();
        // await page.setCookie(...setcookies);
        // console.log("set log: cookie",)
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
        // Get cookies
        const client = await page.target().createCDPSession();
        const cookies = (await client.send('Network.getAllCookies')).cookies;
        cookies.map(item => {
            if (item.name==="country")
            {
                chechCookie.country = item.value; 
            }
            if (item.name==="user_source_remark")
            {
                chechCookie.user_source_remark = item.value; 
            }
        })
        setcookies = cookies;
        console.log("cookie: ", chechCookie);
        await page.waitForNavigation();
        console.log("done init")
        return page
    }
    catch (err) {
        console.log(err)
    }
}

const withPage = (browser) => async (fn) => {
	const page = await browser.newPage();
	try {
		return await fn(page);
	} finally {
		await page.close();
	}
}

var download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};
const withBrowser = async (fn) => {
	const browser = await puppeteer.launch({/* ... */});
	try {
		return await fn(browser);
	} finally {
		await browser.close();
	}
}
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