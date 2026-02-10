const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  // Path to the unpacked extension directory (adjust if needed)
  const extensionPath = path.resolve(__dirname, 'ext');

  const browser = await puppeteer.launch({
    headless: false, // Extensions require non-headless mode
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ]
  });

  // Open a dummy page to trigger extension loading
  const page = await browser.newPage();
  await page.goto('chrome://newtab');
  // Wait a moment for all targets to register
  await new Promise(r => setTimeout(r, 2000));
  // Enumerate all targets and look for the extension ID
  const targets = await browser.targets();
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
    console.error('Could not determine extension ID.');
    await browser.close();
    process.exit(2);
  }
  const testPage = `chrome-extension://${extensionId}/test/index.html`;
  await page.goto(testPage);
  await page.waitForFunction('window.QUnit && window.QUnit.doneCalled', {timeout: 60000});
  const result = await page.evaluate(() => window.QUnit.testResults);
  const failedAssertions = await page.evaluate(() => window.QUnit && window.QUnit.failedAssertions ? window.QUnit.failedAssertions : []);
  console.log(`QUnit Results: ${result.passed} passed, ${result.failed} failed, ${result.total} total, runtime: ${result.runtime}ms`);
  if (result.failed > 0) {
    failedAssertions.forEach((fail, i) => {
      console.log(`\n[FAIL] ${fail.module ? fail.module + ' - ' : ''}${fail.name}`);
      console.log(`  ${fail.message}`);
      if (fail.expected !== undefined || fail.actual !== undefined) {
        console.log(`    Expected: ${fail.expected}`);
        console.log(`    Actual:   ${fail.actual}`);
      }
    });
  }
  await browser.close();
  process.exit(result.failed ? 1 : 0);
})();
