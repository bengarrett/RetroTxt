import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  // Path to the unpacked extension directory (adjust if needed)
  const extensionPath = path.resolve(__dirname, '../../ext');

  const browser = await puppeteer.launch({
    headless: false, // Extensions require non-headless mode
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  // Open a dummy page to trigger extension loading
  const page = await browser.newPage();
  await page.goto('chrome://newtab');
  // Wait a moment for all targets to register
  await new Promise((r) => setTimeout(r, 2000));
  // Enumerate all targets and look for the extension ID
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
  const testPage = `chrome-extension://${extensionId}/test/index.html`;
  console.log(`🧪 Navigating to test page: ${testPage}`);
  await page.goto(testPage);

  console.log('⏳ Waiting for QUnit tests to complete (60s timeout)...');

  // Add progress logging
  const progressInterval = setInterval(async () => {
    try {
      const progress = await page.evaluate(() => {
        if (window.QUnit && window.QUnit.config) {
          return {
            current: window.QUnit.config.current,
            total: window.QUnit.config.semaphore,
            runtime: window.QUnit.config.stats.runtime,
          };
        }
        return null;
      });

      if (progress) {
        console.log(
          `📊 Test progress: ${progress.current}/${progress.total} modules, ${progress.runtime}ms`
        );
      }
    } catch {
      // Ignore errors during progress checking
    }
  }, 5000);

  let exitCode = 0;

  try {
    await page.waitForFunction('window.QUnit && window.QUnit.doneCalled', {
      timeout: 60000,
    });
    clearInterval(progressInterval);

    console.log('✅ Tests completed! Retrieving results...');
    const result = await page.evaluate(() => window.QUnit.testResults);
    const failedAssertions = await page.evaluate(() =>
      window.QUnit && window.QUnit.failedAssertions
        ? window.QUnit.failedAssertions
        : []
    );

    console.log(
      `📋 QUnit Results: ${result.passed} passed, ${result.failed} failed, ${result.total} total, runtime: ${result.runtime}ms`
    );
    if (result.failed > 0) {
      exitCode = 1;
      failedAssertions.forEach((fail) => {
        console.log(
          `\n[FAIL] ${fail.module ? `${fail.module  } - ` : ''}${fail.name}`
        );
        console.log(`  ${fail.message}`);
        if (fail.expected !== undefined || fail.actual !== undefined) {
          console.log(`    Expected: ${fail.expected}`);
          console.log(`    Actual:   ${fail.actual}`);
        }
      });
    }
  } catch (error) {
    clearInterval(progressInterval);
    console.error('❌ Test execution failed:', error.message);
    console.error('🔍 This could be due to:');
    console.error('   • Extension not loading properly');
    console.error('   • QUnit tests not initializing');
    console.error('   • Browser/extension compatibility issues');
    console.error('   • Missing test dependencies');

    // Try to get some diagnostic info
    try {
      const title = await page.title();
      console.log(`📄 Page title: ${title}`);
      const url = page.url();
      console.log(`🔗 Current URL: ${url}`);
    } catch {
      console.error('🔧 Could not retrieve page diagnostics');
    }

    console.log('💡 Try running with task test-cli for headless testing');
    console.log('💡 Or use task test-webextension for manual testing');
    exitCode = 1;
  }

  await browser.close();
  process.exit(exitCode);
})();
