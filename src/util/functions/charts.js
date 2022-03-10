const { chromium } = require('playwright');

(async () => {
	const browser = await chromium.launch({ headless: true });
	let context = await browser.newContext();

	let page = await context.newPage();
	await page.goto(encodeURI('https://www.tradingview.com/chart/?symbol=NASDQ%3ATSLA'));
	await page.click('button:has-text("Accept")');
	await page.close();

	async function isDarkMode() {
		const page = await context.newPage();
		await page.goto('https://www.tradingview.com/markets/');
		let isDark = await page.evaluate(() => window.localStorage.getItem('tradingview.current_theme.name')) === 'dark';
		await page.close();
		return isDark;
	}

	async function toggleDarkMode() {
		const page = await context.newPage();
		await page.goto('https://www.tradingview.com/markets/');
		await page.click('[aria-label="Open\\ user\\ menu"]');
		await page.check('input[type="checkbox"]');
		await page.close();
	}

	async function getChart(ticker, time) {
		context = await browser.newContext();
		const page = await context.newPage();
		await page.goto(encodeURI('https://www.tradingview.com/chart/?symbol='+ticker));
		await page.click('text='+time);

		await page.locator('[class="price-axis-currency-label-wrapper-25tFaE37"]').evaluate(node => node.remove());

		const result = await page.locator('[class="layout__area--center"]').screenshot();

		await context.close();

		return result;
	}

	await toggleDarkMode();


	module.exports = { getChart }
})();