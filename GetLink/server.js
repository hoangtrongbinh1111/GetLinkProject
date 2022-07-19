const express = require('express');
const app = express();
const { INFORMATION, TYPE_PNGTREE, TYPE_PIKBEST } = require('./constants');
const { matchResponse } = require('./utils');
const { Cluster } = require('puppeteer-cluster');

const loginWeb = async (page, type) => {
    // LOGIN
    await page.setViewport({ width: 1920, height: 1600 });
    await page.setDefaultNavigationTimeout(0);
    const information_type = INFORMATION.find(info => info.type === type);
    switch (type) {
        case TYPE_PIKBEST:
            console.log("Start Login PIKBEST");
            // click and wait for navigation
            await page.$eval(".login", elem => elem.click());
            await page.$eval(".base-public-rlg-tab-login", elem => elem.click());
            await page.type('#base-public-login-email', information_type.account);
            await page.type('#base-public-login-password', information_type.password);
            // click and wait for navigation
            await page.$eval("#base-public-rlg-login-btn", elem => elem.click());
            await page.waitForNavigation();
            console.log("End Login PIKBEST");
        case TYPE_PNGTREE:
            console.log("Start Login PNGTREE");
            // click and wait for navigation
            await page.$eval(".btn-logo.base-public-login-button.index-login-click", elem => elem.click());
            if ((await page.$(".lr-another.another-login-btn")) !== null) {
                await page.$eval(".lr-another.another-login-btn", elem => elem.click());
            }
            await page.type('#base-public-login-email-text', information_type.account);
            await page.type('#base-public-login-password-text', information_type.password);
            // click and wait for navigation
            await page.$eval("#base-sub-Login-Btn", elem => elem.click());
            await page.waitForNavigation();
            console.log("End Login PNGTREE");
        default:
            console.log("None");
    }
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
            let { url, type, isLogin } = data;
            type = parseInt(type);
            await page.goto(url, { waitUntil: 'load', timeout: 0 });
            // information config
            const information_type = INFORMATION.find(info => info.type === type);
            // Lấy cookie của trang
            const cookies = await page.cookies();
            // Nếu không có cookie item thì sẽ tiến hành đăng nhập
            if (!cookies || !cookies.find(item => item.name === information_type.cookie)) {
                await loginWeb(page, type);
            }
            
            if (!isLogin) {
                if (type === TYPE_PIKBEST) {
                    // Chọn nút Tải, phần này thì phụ thuộc vào bên Client yêu cầu tải dạng nào thì mình sẽ tùy biến các nút này
                    await page.$eval("a.block-gradient.graHover.dlbtn.ga-click", elem => elem.click());
                    await page.waitForSelector('.download-btn', { timeout: 60 * 1000 });
                    // Lấy link trang chuyển hướng sang Download
                    let linkImg = await page.$eval('.download-btn', anchor => anchor.getAttribute('href'));
                    // Đi đến trang Download
                    await page.goto(information_type.domain_name + linkImg, { waitUntil: 'load', timeout: 0 });
                    // Bắt các response và check xem có resource không?
                    const httpResponseWeWaitForPromise = page.waitForResponse((response) => {
                        const flag = matchResponse(information_type.downnload_resource, response.url());
                        return flag;
                    }, { timeout: 30 * 1000 });
                    // Lấy thông tin response url cần tìm trả về cho client
                    const httpResponseWeWait = await httpResponseWeWaitForPromise;
                    return {
                        data: httpResponseWeWait,
                        status: true
                    };
                }
                else if (type === TYPE_PNGTREE) {
                    await page.waitForSelector('.down-rar-click', { timeout: 60 * 1000 });
                    // Lấy link trang chuyển hướng sang Download
                    let linkImg = await page.$eval('.down-rar-click', anchor => anchor.getAttribute('href'));
                    // Đi đến trang Download
                    await page.goto(information_type.domain_name + linkImg, { waitUntil: 'load', timeout: 0 });
                    // Bắt các response và check xem có resource không?
                    const httpResponseWeWaitForPromise = page.waitForResponse((response) => {
                        const flag = matchResponse(information_type.downnload_resource, response.url());
                        return flag;
                    }, { timeout: 30 * 1000 });
                    // Lấy thông tin response url cần tìm trả về cho client
                    const httpResponseWeWait = await httpResponseWeWaitForPromise;
                    return {
                        data: httpResponseWeWait,
                        status: true
                    };
                }
            }
            return {
                status: false,
                error: "Not Found link"
            };
        }
        catch (e) {
            return {
                status: false,
                error: e
            }
        }
    });
    // init
    await Promise.all(INFORMATION.map(async (info) => {
        const query = {
            url: info.domain_name,
            type: info.type,
            isLogin: true
        }
        await cluster.execute(query);
    }));

    // setup server
    app.get('/getFile', async function (req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        res.setHeader('Access-Control-Allow-Credentials', true);
        try {
            // run the task function for the URL
            const query = {
                url: req.query.linkImage,
                type: req.query.pageDownload,
                isLogin: false
            }
            const resp = await cluster.execute(query);
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