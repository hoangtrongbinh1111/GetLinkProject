const express = require('express');
const app = express();
const { INFORMATION_PNGTREE } = require('./constants');
const { Cluster } = require('puppeteer-cluster');

const loginWeb_PNGTree = async (page) => {
    // LOGIN
    console.log("Start Login");
    await page.setViewport({ width: 1920, height: 1600 });
    await page.setDefaultNavigationTimeout(0);
    // click and wait for navigation
    await page.$eval(".base-public-login-button", elem => elem.click());
    await page.type('#base-public-login-email-text', "vuongle.201096@gmail.com");
    await page.type('#base-public-login-password-text', "rollie3011");
    // click and wait for navigation
    await page.$eval("#base-sub-Login-Btn", elem => elem.click());
    await page.waitForNavigation();
    console.log("End Login");
}
(async () => {
    const cpuNumber = require('os').cpus().length;
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,
        maxConcurrency: cpuNumber,
        monitor: true,
        timeout: 60000, // miliseconds
        puppeteerOptions: {
            //     headless: false,
            //     ignoreHTTPSErrors: true
            args: ['--no-sandbox']
        }
    });

    // Event handler to be called in case of problems
    cluster.on('taskerror', (err, data) => {
        console.log(`Error crawling ${data}: ${err.message}`);
    });

    // setup the function to be executed for each request
    await cluster.task(async ({ page, data }) => {
        try {
            const { url } = data;
            await page.goto(url, { waitUntil: 'load', timeout: 0 });
            // Lấy cookie của trang
            const cookies = await page.cookies();
            // Nếu không có cookie item thì sẽ tiến hành đăng nhập
            if (!cookies || !cookies.find(item => item.name === "auth_uid")) {
                await loginWeb_PNGTree(page);
            }
            // Chọn nút Tải, phần này thì phụ thuộc vào bên Client yêu cầu tải dạng nào thì mình sẽ tùy biến các nút này
            // await page.$eval(INFORMATION_PNGTREE.DOWNLOAD_ELEMENT, elem => elem.click());
            await page.waitForSelector('.down-rar-click', { timeout: 60 * 1000 });
            // Lấy link trang chuyển hướng sang Download
            let linkImg = await page.$eval('.down-rar-click', anchor => anchor.getAttribute('href'));
            // Đi đến trang Download
            await page.goto(INFORMATION_PNGTREE.DOMAIN + linkImg, { waitUntil: 'load', timeout: 0 });
            // Bắt các response và check xem có resource không?
            const httpResponseWeWaitForPromise = page.waitForResponse((response) => {
                return  response.url().includes("https://proxy-rar");
            }, { timeout: 30 * 1000 });
            // Lấy thông tin response url cần tìm trả về cho client
            const httpResponseWeWait = await httpResponseWeWaitForPromise;
            return {
                data: httpResponseWeWait,
                status: true
            };
        }
        catch (e) {
            console.log('false',e)
            return {
                status: false,
                error: e
            }
        }
    });
    // init
    const init_Page_PNGTREE = {
        url: INFORMATION_PNGTREE.DOMAIN,
    }
    await cluster.execute(init_Page_PNGTREE);
    // setup server
    app.get('/test', async function (req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        res.setHeader('Access-Control-Allow-Credentials', true);
        try {
            // run the task function for the URL
            const data_PNGTREE = {
                url: req.query.linkImage,
                type: req.query.typeDownload
            }
            const resp = await cluster.execute(data_PNGTREE);
            if (resp.status) {
                res.status(200).send(resp.data.url());
            }
            else {
                res.status(500).send(resp.error);
            }
        } catch (err) {
            // catch error
            res.end('Error: ' + err.message);
        }
    });

    const PORT = process.env.PORT || 8686;
    app.listen(PORT, '127.0.0.1', () => {
        console.log(`Server started at port: ${PORT}`);
    });
})();