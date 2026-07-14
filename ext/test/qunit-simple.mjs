import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  console.log('🚀 Starting RetroTxt QUnit Tests');
  console.log('================================');

  const extensionPath = path.resolve(__dirname, '../../ext');
  console.log(`📁 Extension path: ${extensionPath}`);

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  console.log('🌐 Browser launched with extension loaded');

  const page = await browser.newPage();
  await page.goto('chrome://newtab');

  console.log('⏳ Waiting for extension to initialize...');
  await new Promise((r) => setTimeout(r, 2000));

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
    console.error('❌ Could not determine extension ID');
    await browser.close();
    process.exit(2);
  }

  console.log(`🆔 Extension ID: ${extensionId}`);

  const testPage = `chrome-extension://${extensionId}/test/index.html`;
  console.log(`🧪 Opening test page: ${testPage}`);

  try {
    await page.goto(testPage);
    console.log('📄 Test page loaded successfully');

    // Wait a bit for tests to start
    await new Promise((r) => setTimeout(r, 5000));

    // Check if QUnit is available
    const hasQUnit = await page.evaluate(
      () => typeof window.QUnit !== 'undefined'
    );
    console.log(`🔍 QUnit available: ${hasQUnit}`);

    if (hasQUnit) {
      const testCount = await page.evaluate(() => {
        return window.QUnit ? window.QUnit.config.queue.length : 0;
      });
      console.log(`📊 Test modules queued: ${testCount}`);
    }

    console.log('🎯 Test environment ready!');
    console.log('💡 Browser will remain open for manual test execution');
    console.log('💡 Check the browser console for QUnit test results');
    console.log('💡 Press Ctrl+C to exit when done');

    // Keep browser open for manual inspection
    await new Promise(() => {
      // intentional void
    });
  } catch (error) {
    console.error('❌ Error during test execution:', error.message);
    await browser.close();
    process.exit(1);
  }
})();
