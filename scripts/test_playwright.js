const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://www.fotmob.com');
  const data = await page.evaluate(async () => {
      const res = await fetch('https://www.fotmob.com/api/teams?id=8634&tab=fixtures');
      return await res.json();
  });
  console.log(JSON.stringify(data).substring(0, 200));
  await browser.close();
})();
