const express = require('express');
const app = express();
const { Cluster } = require('puppeteer-cluster');

(async () => {
    const cpuNumber = require('os').cpus().length;
    console.log(cpuNumber);
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,
        maxConcurrency: cpuNumber,
        monitor: true,
        timeout: 30000, // miliseconds
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
    await cluster.task(async ({ page, data: url }) => {
        // ==== End LOGIN
        await page.goto(url);
        
        return "hihi";
    });

    // setup server
    app.get('/test', async function (req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        res.setHeader('Access-Control-Allow-Credentials', true);
        try {
            // run the task function for the URL
            const resp = await cluster.execute(req.query.linkImage);
            // respond with the result
            res.status(200).send("hihi");
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