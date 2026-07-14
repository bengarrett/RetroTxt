/* task command: test */
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  console.log('   RetroTxt QUnit Test Runner   ');
  console.log('================================');
  console.log('Running tests with terminal output...\n');

  // init puppeteer
  const extensionPath = path.resolve(__dirname, '../../ext');
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });
  // create browser tab
  const pages = await browser.pages();
  const page = pages[0] || (await browser.newPage());
  await new Promise((r) => setTimeout(r, 2000));
  // load extension
  const targets = browser.targets();
  let extensionId = null;
  for (const t of targets) {
    const url = t.url();
    const match = url.match(/chrome-extension:\/\/([a-z]{32})/);
    if (match) {
      extensionId = match[1];
      break;
    }
  }
  if (!extensionId) {
    console.error('Could not determine extension ID');
    await browser.close();
    process.exit(2);
  }
  // open test index page
  const testPage = `chrome-extension://${extensionId}/test/index.html`;
  await page.goto(testPage);
  await page.bringToFront();
  console.log('   Test environment status:');
  console.log('   Extension ID:', extensionId);
  console.log('   Test page:', testPage);

  // check the test environment
  const hasQUnit = await page.evaluate(
    () => typeof window.QUnit !== 'undefined'
  );
  const hasTests = await page.evaluate(() => {
    return window.QUnit ? window.QUnit.config.queue.length : 0;
  });
  console.log('   QUnit available:', hasQUnit ? '✅ Yes' : '❌ No');
  console.log('   Test modules loaded:', hasTests);
  if (!hasQUnit) {
    console.error('QUnit framework not found');
    console.log('Check if test dependencies are properly installed');
    await browser.close();
    process.exit(1);
  }
  if (hasTests === 0) {
    console.warn('   No test modules found');
    console.log('   This could indicate:');
    console.log('   • Test files not properly loaded');
    console.log('   • QUnit configuration issues');
    console.log('   • Missing test dependencies');
  } else {
    console.log('   Test environment ready');
    console.log('   Test modules available for execution');
  }
  console.log('\nThe browser will remain open for manual inspection');
  console.log('Check the browser console for detailed test results');
  console.log('Press Ctrl+C to exit when done');
  // keep browser open
  await new Promise((resolve) => {
    browser.on('disconnected', () => {
      console.log('\nBrowser closed');
      resolve();
    });
  });
  process.exit(0);
})();
