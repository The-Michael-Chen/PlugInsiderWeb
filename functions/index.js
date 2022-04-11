
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


const getNewsDescriptions = async (link) => {
    var headlines = new Array();
    const browser = await puppeteer.launch( { headless: true });
    const page = await browser.newPage();
    await page.goto(link);
    // TODO: MAKE SURE THIS URL WORKS EVERY DAY NOT JUST ONE TIME
    //await page.waitForSelector(".DY5T1d");
    //await page.screenshot({path: '1.png'});
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
    //await page.screenshot({path: '1.png'});
    //title = await page.evaluate(element => element.textContent, element);
    const text = await page.evaluate(() => Array.from(document.querySelectorAll("[class^=lx-stream-post__header-text]"), element => element.textContent));

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
        console.log("returning Urls now");
        return urls
    });
    await browser.close();

    console.log(data)

    return data;
}

exports.scraper = functions.https.onRequest((request, response) => {
          cors(request, response, async () => {
              console.log("got inside scraper");

              const body = request.body;
              const imageUrls = await getNewsImages(body.text);
              console.log("scraped the images");
              const headlines = await getNewsHeadlines(body.text); // 10
              console.log("scraped the headlines");
              const descriptions = await getNewsDescriptions(body.text);
              console.log("scraped the descriptions");
              //const imageUrls = await getNewsUrls(body.text);

              //const db = getFirestore();
//              imageUrls.forEach( (imgUrl, index) => {
//                    await admin.firestore().doc('Articles/' + 'article' + index.toString()).set({
//                        "imageUrl" : imageUrls[index],
//                        "headline" : headlines[index],
//                        "description" : descriptions[index]
//                    })
//               }, { merge: true});

               for (let index = 0; index < imageUrls.length; index++) {
                  await admin.firestore().doc('Articles/' + 'article' + index.toString()).set({
                      "imageUrl" : imageUrls[index],
                      "headline" : headlines[index],
                      "description" : descriptions[index]
                  });
               }

//               for (const imgUrl of imageUrls) {
//                    await admin.firestore().doc('Articles/' + 'article' + index.toString()).set({
//                        "imageUrl" : imageUrls[index],
//                        "headline" : headlines[index],
//                        "description" : descriptions[index]
//                    });
//               }

              console.log("stored data in firebase");

              response.send(imageUrls)


          });
      });

//exports.convertLargeFile = functions
//    .runWith({
//      // Ensure the function has enough memory and time
//      // to process large files
//      timeoutSeconds: 300,
//      memory: "8GB",
//    })
//    .storage.object()
//    .onFinalize(async (object) => {
//      // Do some complicated things that take a lot of memory and time
//        console.log("got inside scraper");
//        const text = "https://www.bbc.com/russian/topics/cez0n29ggrdt";
//        const imageUrls = await getNewsImages(text);
//        console.log("scraped the images");
//        const headlines = await getNewsHeadlines(text); // 10
//        console.log("scraped the headlines");
//        const descriptions = await getNewsDescriptions(text);
//        console.log("scraped the descriptions");
//
//
//        for (const imgUrl of imageUrls) {
//            console.log("got inside for loop");
//
//            await imageUrls.forEach( (imgUrl, index) => {
//                  admin.firestore().doc('Articles/' + 'article' + index.toString()).set({
//                      "imageUrl" : imageUrls[index],
//                      "headline" : headlines[index],
//                      "description" : descriptions[index]
//                  })
//             }, { merge: true});
//        }
//
//
//        console.log("stored data in firebase");
//
//        response.send(imageUrls)
//    });


//const getNewsUrls = async (link) => {
//      var headlines = new Array();
//      const browser = await puppeteer.launch( { headless: true });
//      const page = await browser.newPage();
//      await page.goto(link);
//      // TODO: MAKE SURE THIS URL WORKS EVERY DAY NOT JUST ONE TIME
//      //await page.waitForSelector(".DY5T1d");
//      await page.screenshot({path: '1.png'});
//      //title = await page.evaluate(element => element.textContent, element);
//      const text = await page.evaluate(() => Array.from(document.querySelectorAll("img"), element => element.textContent));
//
//      return text
//      await browser.close();
//
//      console.log(data)
//
//      return data;
//  }


//const scrapeImages = async (username) => {
//    const browser = await puppeteer.launch( { headless: true });
//    const page = await browser.newPage();
//
//    await page.goto('https://www.instagram.com/accounts/login/');
//
//
//    // Login form
//    await page.screenshot({path: '1.png'});
//
//    await page.type('[name=username]', 'the.michael.chen');
//
//    await page.type('[name=password]', 'Login12!@');
//
//    await page.screenshot({path: '2.png'});
//
//    await page.click('[type=submit]');
//
//    // Social Page
//
//    await page.waitFor(5000);
//
//    await page.goto(`https://www.instagram.com/${username}`);
//
//    await page.waitForSelector('img ', {
//        visible: true,
//    });
//
//
//    await page.screenshot({path: '3.png'});
//
//
//    // Execute code in the DOM
//    const data = await page.evaluate( () => {
//
//        const images = document.querySelectorAll('img');
//
//        const urls = Array.from(images).map(v => v.src);
//
//        return urls
//    });
//
//    await browser.close();
//
//    console.log(data)
//
//    return data;
//}