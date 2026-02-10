const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // Adjust the path if your test HTML is named differently or in another location
  await page.goto('file://' + process.cwd() + '/ext/test/index.html');
  await page.waitForFunction('window.QUnit && window.QUnit.doneCalled', {timeout: 60000});
  const result = await page.evaluate(() => window.QUnit.testResults);
  const details = await page.evaluate(() => window.QUnit && window.QUnit.config && window.QUnit.config.current && window.QUnit.config.current.assertions ? window.QUnit.config.current.assertions : []);
  if (!result) {
    console.error('QUnit did not run or no results were found.');
    await browser.close();
    process.exit(2);
  }
  console.log(`QUnit Results: ${result.passed} passed, ${result.failed} failed, ${result.total} total, runtime: ${result.runtime}ms`);
  if (result.failed > 0) {
    // Print failed assertion details from QUnit log callback
    const failedAssertions = await page.evaluate(() => window.QUnit && window.QUnit.failedAssertions ? window.QUnit.failedAssertions : []);
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