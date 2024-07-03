const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const CONFIG = {
    APPNAME: process.env['APPNAME'] || "Admin",
    APPURL: process.env['APPURL'] || "http://172.17.0.1",
    APPURLREGEX: process.env['APPURLREGEX'] || "^.*$",
    APPFLAG: process.env['APPFLAG'] || "dev{flag}",
    APPLIMITTIME: Number(process.env['APPLIMITTIME'] || "60"),
    APPLIMIT: Number(process.env['APPLIMIT'] || "5"),
    APPEXTENSIONS: (() => {
        const extDir = path.join(__dirname, 'extensions');
        const dir = []
        fs.readdirSync(extDir).forEach(file => {
            if (fs.lstatSync(path.join(extDir, file)).isDirectory()) {
                dir.push(path.join(extDir, file))
            }
        });
        return dir.join(',')
    })()
}


console.table(CONFIG)

function sleep(s) {
    return new Promise((resolve) => setTimeout(resolve, s))
}

function getBrowser(){
    const browserPaths = [
        "/usr/bin/chromium-browser",
        "/usr/bin/google-chrome",
        "/usr/bin/chromium"
    ]
    for (const browserPath of browserPaths) {
        if (fs.existsSync(browserPath)) {
            return browserPath
        }
    }
    throw new Error("No browser found")
}

const initBrowser = puppeteer.launch({
    executablePath: getBrowser(),
    headless: false,
    args: [
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--no-gpu',
        '--disable-default-apps',
        '--disable-translate',
        '--disable-device-discovery-notifications',
        '--disable-software-rasterizer',
        '--disable-xss-auditor',
        ...(() => {
            if (CONFIG.APPEXTENSIONS === "") return [];
            return [
                `--disable-extensions-except=${CONFIG.APPEXTENSIONS}`,
                `--load-extension=${CONFIG.APPEXTENSIONS}`
            ]
        })()
    ],
    ipDataDir: '/home/bot/data/',
    ignoreHTTPSErrors: true
});

console.log("Bot started...");

module.exports = {
    name: CONFIG.APPNAME,
    urlRegex: CONFIG.APPURLREGEX,
    rateLimit: {
        windowS: CONFIG.APPLIMITTIME,
        max: CONFIG.APPLIMIT
    },
    bot: async (urlToVisit) => {
        const browser = await initBrowser;
        const context = await browser.createBrowserContext()
        try {
            // Goto main page
            const page = await context.newPage();

            // Set Flag
            await page.setCookie({
                name: "flag",
                httpOnly: false,
                value: CONFIG.APPFLAG,
                url: CONFIG.APPURL
            })

            // Visit URL from user
            console.log(`bot visiting ${urlToVisit}`)
            await page.goto(urlToVisit, {
                waitUntil: 'networkidle2'
            });
            await sleep(15000);

            // Close
            console.log("browser close...")
            await context.close()
            return true;
        } catch (e) {
            console.error(e);
            await context.close();
            return false;
        }
    }
}
