/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

const options = require("./options.json");

puppeteer.use(StealthPlugin());
puppeteer
  .launch({ headless: false, args: ["--no-sandbox"] })
  .then(async (browser) => {
    console.log("LAUNCH");

    const page = await browser.newPage();
    await (await browser.pages())[0].close();
    await page.setViewport({ width: 1280, height: 800 });

    // BUILD COOKIES
    console.log("build cookies");
    await page.goto("https://www.google.com/search?q=recreation+gov");
    await page.click('a[href="https://www.recreation.gov/"]');

    // LOG IN
    console.log("log in");
    await page.waitForSelector(
      "#nav-header-container > div > nav > div.nav-interactions-holder > div.nav-links-wrap > div > div > button:nth-child(2)"
    );
    await page.click(
      "#nav-header-container > div > nav > div.nav-interactions-holder > div.nav-links-wrap > div > div > button:nth-child(2)"
    );
    await page.type("#rec-acct-sign-in-email-address", options.email, {
      delay: 100,
    });
    await page.type("#rec-acct-sign-in-password", options.password, {
      delay: 100,
    });
    await page.click(
      "body > div:nth-child(10) > div > div > div > div.flex-grid.justify-content-center > div > div > div:nth-child(2) > form > button"
    );
    await page.waitFor(5 * 1000);

    // ATC
    console.log("add to cart");
    await page.goto("https://www.recreation.gov/ticket/facility/300015");
    const atc = async () => {
      await page.click("#selectTourDatePicker");
      if (options.useTestDate) {
        await page.click('td[aria-label^="Tuesday, September 1, 2020"]');
      } else if (await page.$('td[aria-label^="Wednesday, August 5, 2020"]')) {
        await page.click('td[aria-label^="Wednesday, August 5, 2020"]');
      } else if (await page.$('td[aria-label^="Thursday, August 6, 2020"]')) {
        await page.click('td[aria-label^="Thursday, August 6, 2020"]');
      } else {
        await page.waitFor(2500);
        await page.reload();
        await atc();
      }
      await page.select("#tour-options", "3000");
      await page.click("#guest-counter");
      await page.click('button[aria-label="Add Vehicle 7-Day Entrys"]');
      await page.click("#guest-counter");
      await page.waitFor(500);
      await page.click(
        "#page-content > div > div > div > div.rec-content-container > div > div > div.flex-col-lg-4.ticket-layout-facility-aside > div > div > div > div.rec-aside-body > div > fieldset > div > div:nth-child(5) > div > button"
      );
      await page.click("#tour-times > ul > li > button");
      await page.waitFor(500);
      await page.click(
        "#page-content > div > div > div > div.rec-content-container > div > div > div.flex-col-lg-4.ticket-layout-facility-aside > div > div > div > div.rec-aside-body > div > fieldset > div > div:nth-child(6) > div > div > button"
      );
    };
    await atc();

    // PROCEED TO CHECKOUT
    console.log("pre-checkout");
    await page.waitForNavigation({ delay: "networkidle0" });
    await page.click('label[for="need-to-know-checkbox"');
    await page.waitForSelector("#orderSummaryBarProceedToCartBtn");
    await page.click("#orderSummaryBarProceedToCartBtn");
    await page.waitForSelector(
      "#page-body > div > div > div > div.flex-col-md-4 > div.cart-order-summary > div.cart-order-summary-actions > button.rec-button-primary-large"
    );
    await page.click(
      "#page-body > div > div > div > div.flex-col-md-4 > div.cart-order-summary > div.cart-order-summary-actions > button.rec-button-primary-large"
    );

    // CHECKOUT
    console.log("checkout");
    await page.waitForSelector('input[title="Name"]');
    await page.type('input[name="name"]', options.name, { delay: 100 });
    await page.type('input[maxlength="19"]', options.cc, { delay: 100 });
    await page.select('select[name="month"]', options.month);
    await page.select('select[name="year"]', options.year);
    await page.type('input[name="cvc"]', options.cvc, { delay: 100 });
    await page.click(
      "#page-body > div > div > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > button"
    );

    await page.waitForSelector(
      "#page-body > div > div > div:nth-child(2) > div:nth-child(2) > div.flex-col-md-8 > div.ml-1.mr-2 > div.flex-grid.justify-content-end.mt-3.mr-half > button.sarsa-button.ml-1.sarsa-button-primary.sarsa-button-md"
    );
    await page.click(
      "#page-body > div > div > div:nth-child(2) > div:nth-child(2) > div.flex-col-md-8 > div.ml-1.mr-2 > div.flex-grid.justify-content-end.mt-3.mr-half > button.sarsa-button.ml-1.sarsa-button-primary.sarsa-button-md"
    );
  });
