/* task command: test-old */
import puppeteer from 'puppeteer';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
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
  const page = await browser.newPage();
  await page.goto('chrome://newtab');
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
    console.error('Could not determine extension ID.');
    await browser.close();
    process.exit(2);
  }
  // open test index page
  const testPage = `chrome-extension://${extensionId}/test/index.html`;
  console.log(chalk.bold(`Navigating to test page`), testPage);
  // expose a function to let the browser speak directly to the Node loggers
  await page.exposeFunction('onQUnitProgress', (data) => {
    const statusUpper = data.status.toUpperCase();
    const statusColor =
      data.status === 'passed'
        ? chalk.green.bold(statusUpper)
        : data.status === 'failed'
          ? chalk.red.bold(statusUpper)
          : chalk.yellow.bold(statusUpper);
    console.log(
      ` Test "${data.title}" inside "${data.module}" -> ${statusColor}`
    );
  });

  await page.exposeFunction('onQUnitDone', (results) => {
    page.evaluate((res) => {
      window.__qunit_done_results__ = res;
    }, results);
  });
  await page.goto(testPage);
  // inject native event hooks once the QUnit instance is ready
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(window, 'QUnit', {
      configurable: true,
      set(qunitInstance) {
        this.__qunit__ = qunitInstance;
        qunitInstance.on('testEnd', (testResult) => {
          window.onQUnitProgress({
            title: testResult.name,
            module: testResult.suiteName || 'Default Module',
            status: testResult.status,
          });
        });
        qunitInstance.on('runEnd', (runResult) => {
          window.onQUnitDone(runResult);
        });
      },
      get() {
        return this.__qunit__;
      },
    });
  });

  // reload page to guarantee bindings catch the execution early
  await page.goto(testPage);
  console.log('Waiting for QUnit tests to complete...');

  let exitCode = 0;
  try {
    await page.waitForFunction('window.__qunit_done_results__ !== undefined', {
      timeout: 60000,
    });
    console.log('Tests completed, retrieving results...');
    const result = await page.evaluate(() => window.__qunit_done_results__);
    console.log(
      `QUnit Results: ${result.status.toUpperCase()} — ${result.stats.passed} passed, ${result.stats.failed} failed, ${result.stats.total} total, runtime: ${result.stats.runtime}ms`
    );
    if (result.stats.failed > 0) {
      exitCode = 1;
    }
  } catch (error) {
    console.error('Test execution failed:', error.message);
    exitCode = 1;
  }

  await browser.close();
  process.exit(exitCode);
})();
