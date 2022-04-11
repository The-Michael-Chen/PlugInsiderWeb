
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

//const functions = require('firebase-functions');
const cors = require('cors')({ origin: true});

const cheerio = require('cheerio');

const getUrls = require('get-urls');
const fetch = require('node-fetch');


const scrapeMetatags = (text) => {

    const urls = Array.from( getUrls(text) );

    const requests = urls.map(async url => {

        const res = await fetch(url);

        const html = await res.text();
        const $ = cheerio.load(html);

        const getMetatag = (name) =>
            $(`meta[name=${name}]`).attr('content') ||
            $(`meta[property="og:${name}"]`).attr('content') ||
            $(`meta[property="twitter:${name}"]`).attr('content');

        return {
            url,
            title: $('title').first().text(),
            favicon: $('link[rel="shortcut icon"]').attr('href'),
            // description: $('meta[name=description]').attr('content'),
            description: getMetatag('description'),
            image: getMetatag('image'),
            author: getMetatag('author'),
        }
    });


    return Promise.all(requests);


}

const puppeteer = require('puppeteer');

const getNewsArticles = async () =>{
    // 1. first get a list of all the links on google
    // 2. go and scrape each of those links
}

const getNewsDescriptions = async (link) => {
    var headlines = new Array();
    const browser = await puppeteer.launch( { headless: true });
    const page = await browser.newPage();
    await page.goto(link);
    // TODO: MAKE SURE THIS URL WORKS EVERY DAY NOT JUST ONE TIME
    //await page.waitForSelector(".DY5T1d");
    await page.screenshot({path: '1.png'});
    //title = await page.evaluate(element => element.textContent, element);
    const text = await page.evaluate(() => Array.from(document.querySelectorAll(".lx-media-asset-summary, .lx-stream-related-story--summary"), element => element.textContent));

    return text
    await browser.close();

    console.log(data)

    return data;
}

const getNewsHeadlines = async (link) => {
    var headlines = new Array();
    const browser = await puppeteer.launch( { headless: true });
    const page = await browser.newPage();
    await page.goto(link);
    // TODO: MAKE SURE THIS URL WORKS EVERY DAY NOT JUST ONE TIME
    //await page.waitForSelector(".DY5T1d");
    await page.screenshot({path: '1.png'});
    //title = await page.evaluate(element => element.textContent, element);
    const text = await page.evaluate(() => Array.from(document.querySelectorAll("[class^=lx-stream-post__header-text]"), element => element.textContent));

    return text
    await browser.close();

    console.log(data)

    return data;
}

const getNewsUrls = async (link) => {
      var headlines = new Array();
      const browser = await puppeteer.launch( { headless: true });
      const page = await browser.newPage();
      await page.goto(link);
      // TODO: MAKE SURE THIS URL WORKS EVERY DAY NOT JUST ONE TIME
      //await page.waitForSelector(".DY5T1d");
      await page.screenshot({path: '1.png'});
      //title = await page.evaluate(element => element.textContent, element);
      const text = await page.evaluate(() => Array.from(document.querySelectorAll("img"), element => element.textContent));

      return text
      await browser.close();

      console.log(data)

      return data;
  }


const getNewsImages = async (link) => {
    const browser = await puppeteer.launch( { headless: true });
    const page = await browser.newPage();
    await page.goto(link);
    await page.waitForSelector('img', {
            visible: true,
    });

    // Execute code in the DOM
    const data = await page.evaluate( () => {
        const images = document.querySelectorAll("img");
        const urls = Array.from(images).map(v => v.src);
        return urls
    });
    await browser.close();

    console.log(data)

    return data;
}

const scrapeImages = async (username) => {
    const browser = await puppeteer.launch( { headless: true });
    const page = await browser.newPage();

    await page.goto('https://www.instagram.com/accounts/login/');


    // Login form
    await page.screenshot({path: '1.png'});

    await page.type('[name=username]', 'the.michael.chen');

    await page.type('[name=password]', 'Login12!@');

    await page.screenshot({path: '2.png'});

    await page.click('[type=submit]');

    // Social Page

    await page.waitFor(5000);

    await page.goto(`https://www.instagram.com/${username}`);

    await page.waitForSelector('img ', {
        visible: true,
    });


    await page.screenshot({path: '3.png'});


    // Execute code in the DOM
    const data = await page.evaluate( () => {

        const images = document.querySelectorAll('img');

        const urls = Array.from(images).map(v => v.src);

        return urls
    });

    await browser.close();

    console.log(data)

    return data;
}


exports.scraper = functions.https.onRequest((request, response) => {
    cors(request, response, async () => {


        const body = request.body;
        //JSON.parse(request.body);
        const imageUrls = await getNewsImages(body.text);
        //const data = await scrapeMetatags(body.text);
        //const data = await scrapeImages(body.text);
        const headlines = await getNewsHeadlines(body.text); // 10
        const descriptions = await getNewsDescriptions(body.text);
        //const imageUrls = await getNewsUrls(body.text);

        //const db = getFirestore();

        for (const imgUrl of imageUrls) {


            await imageUrls.forEach( (imgUrl, index) => {
                  admin.firestore().doc('Articles/' + 'article' + index.toString()).set({
                      "imageUrl" : imageUrls[index],
                      "headline" : headlines[index],
                      "description" : descriptions[index]
                  })
             }, { merge: true});
        }




        response.send(imageUrls)


    });
});