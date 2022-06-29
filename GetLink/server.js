const express = require('express');
const app = express();
const { INFORMATION_PIKBEST } = require('./constants');
const { Cluster } = require('puppeteer-cluster');

const loginWeb_PIKBEST = async (page) => {
    // LOGIN
    console.log("Start Login");
    await page.setViewport({ width: 1920, height: 1600 });
    await page.setDefaultNavigationTimeout(0);
    // click and wait for navigation
    await Promise.all([
        page.click('.login')
    ]);
    await page.click('.base-public-rlg-tab-login');
    await page.type('#base-public-login-email', INFORMATION_PIKBEST.ACCOUNT);
    await page.type('#base-public-login-password', INFORMATION_PIKBEST.PASSWORD);
    // click and wait for navigation
    await Promise.all([
        page.click('#base-public-rlg-login-btn')
    ]);
    await page.waitForNavigation();
    console.log("End Login");
}

(async () => {
    const cpuNumber = require('os').cpus().length;
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,
        maxConcurrency: cpuNumber,
        monitor: true,
        timeout: 60000 // miliseconds
        // puppeteerOptions: {
        //     headless: false,
        //     ignoreHTTPSErrors: true
        // },
    });

    // Event handler to be called in case of problems
    cluster.on('taskerror', (err, data) => {
        console.log(`Error crawling ${data}: ${err.message}`);
    });

    // setup the function to be executed for each request
    await cluster.task(async ({ page, data }) => {
        const { url, type } = data;
        await page.goto(url, { waitUntil: 'load', timeout: 0 });
        // Lấy cookie của trang
        const cookies = await page.cookies();
        // Nếu không có cookie item thì sẽ tiến hành đăng nhập
        if (!cookies || !cookies.find(item => item.name === "auth_id")) {
            await loginWeb_PIKBEST(page);
        }
        if (type !== 0) {
            console.log(1111,type);
            // Chọn nút Tải, phần này thì phụ thuộc vào bên Client yêu cầu tải dạng nào thì mình sẽ tùy biến các nút này
            let elementClick = "a.dlbtn.dljpg.ga-click";
            if (type === 2)
            {
                elementClick = "a.block-gradient.graHover.dlbtn.ga-click";
            }
            await page.$eval(elementClick, elem => elem.click());
            await page.waitForSelector('.download-btn');
            // Lấy link trang chuyển hướng sang Download
            let linkImg = await page.$eval('.download-btn', anchor => anchor.getAttribute('href'));
            // Đi đến trang Download
            await page.goto(INFORMATION_PIKBEST.DOMAIN + linkImg, { waitUntil: 'load', timeout: 0 });
            // Bắt các response và check xem có resource không?
            const httpResponseWeWaitForPromise = page.waitForResponse((response) => {
                //return response.url().includes("https://zip.pikbest.com");
                if (response.url().includes("https://proxy-t") || response.url().includes("https://zip.pikbest.com")) {
                    return response.url();
                }
            });
            // Lấy thông tin response url cần tìm trả về cho client
            const httpResponseWeWait = await httpResponseWeWaitForPromise;
            return httpResponseWeWait;
        }
    });
    // init
    const init_Page_PIKBEST = {
        url: INFORMATION_PIKBEST.DOMAIN,
        type: 0 // type for download only
    }
    await cluster.execute(init_Page_PIKBEST);
    // setup server
    app.get('/test', async function (req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        res.setHeader('Access-Control-Allow-Credentials', true);
        try {
            // run the task function for the URL
            const data_PIKBEST = {
                url: req.query.linkImage,
                type: req.query.typeDownload
            }
            const resp = await cluster.execute(data_PIKBEST);
            // respond with the result
            res.status(200).send(resp.url());
        } catch (err) {
            // catch error
            res.end('Error: ' + err.message);
        }
    });

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, '127.0.0.1', () => {
        console.log(`Server started at port: ${PORT}`);
    });
})();