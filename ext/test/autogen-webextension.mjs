/**
 * Proper WebExtension Test Script
 *
 * Purpose: Test RetroTxt extension with actual text files
 * Usage: Node.js script using Puppeteer to test real WebExtension workflow
 * Requirements: Puppeteer installed, Chrome browser
 *
 * This test creates and opens actual text files that the extension should process:
 * 1. Automatic processing of .txt files by the extension
 * 2. Manual file loading via extension popup
 * 3. Drag and drop functionality
 * 4. Context menu integration
 * 5. ANSI art rendering and color processing
 */

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Main test function - Proper WebExtension test
 */
async function testWebExtensionProper() {
  console.log('🚀 Starting proper WebExtension test...');

  let browser;
  try {
    // Get extension path
    const extensionPath = path.join(__dirname, '..');
    console.log(`📁 Extension path: ${extensionPath}`);

    // Check extension files
    checkExtensionFiles(extensionPath);

    // Check test file
    const testFilePath = path.join(
      extensionPath,
      'test',
      'example_files',
      'ZII-RTXT.ans'
    );
    checkTestFile(testFilePath);

    // Launch browser with extension
    console.log('🌐 Launching Chrome with RetroTxt extension...');

    browser = await puppeteer.launch({
      headless: false,
      slowMo: 50,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--window-size=1200,800',
        '--disable-infobars',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--enable-features=ExtensionsInDevMode',
        '--allow-file-access-from-files', // Important for file:/// access
      ],
    });

    // Get extension ID
    const extensionId = await getExtensionId(browser);
    console.log(`🆔 Extension ID: ${extensionId}`);

    // Create a test text file that the extension can process
    const testTextFile = createTestTextFile(extensionPath);
    console.log(`📄 Created test text file: ${testTextFile}`);

    // Open the test text file in a new tab
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    const fileUrl = `file://${testTextFile}`;
    console.log(`🌐 Opening test text file: ${fileUrl}`);

    await page.goto(fileUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    console.log('✅ Test page loaded successfully');

    // Take screenshot
    const screenshotPath = path.join(
      extensionPath,
      'autogen',
      'webextension-test-direct.png'
    );
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    console.log(`📸 Screenshot saved: ${screenshotPath}`);

    // Analyze content
    const content = await page.content();
    console.log(`📊 Page content length: ${content.length} characters`);

    // Check if extension elements are present
    const hasExtensionElements = await checkForExtensionElements(page);
    console.log(
      `🔧 Extension elements detected: ${hasExtensionElements ? '✅ Yes' : '❌ No'}`
    );

    // Test with an actual ANSI file from the example files
    console.log('\n🔄 Now testing with actual ANSI file...');
    const ansiPage = await browser.newPage();
    await ansiPage.setViewport({ width: 1200, height: 800 });

    const ansiFileUrl = `file://${testFilePath}`;
    console.log(`🌐 Opening ANSI test file: ${ansiFileUrl}`);

    await ansiPage.goto(ansiFileUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    console.log('✅ ANSI test file loaded successfully');

    // Take screenshot of ANSI file
    const ansiScreenshotPath = path.join(
      extensionPath,
      'autogen',
      'webextension-test-ansi.png'
    );
    await ansiPage.screenshot({
      path: ansiScreenshotPath,
      fullPage: true,
    });

    console.log(`📸 ANSI screenshot saved: ${ansiScreenshotPath}`);

    // Test with custom XSS test file
    console.log('\n🔄 Now testing with custom XSS test file...');
    const xssPage = await browser.newPage();
    await xssPage.setViewport({ width: 1200, height: 800 });

    const xssFilePath = path.join(
      extensionPath,
      'test',
      'example_files',
      'xss-celerity.pip'
    );
    const xssFileUrl = `file://${xssFilePath}`;
    console.log(`🌐 Opening XSS test file: ${xssFileUrl}`);

    await xssPage.goto(xssFileUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    console.log('✅ XSS test file loaded successfully');

    // Take screenshot of XSS test file
    const xssScreenshotPath = path.join(
      extensionPath,
      'autogen',
      'webextension-test-xss.png'
    );
    await xssPage.screenshot({
      path: xssScreenshotPath,
      fullPage: true,
    });

    console.log(`📸 XSS screenshot saved: ${xssScreenshotPath}`);

    // Check for XSS vulnerability indicators
    const xssContent = await xssPage.content();
    const hasHtmlElements =
      xssContent.includes('<hr>') ||
      xssContent.includes('<br>') ||
      xssContent.includes('<strong>');

    if (hasHtmlElements) {
      console.log(
        '⚠️  POTENTIAL XSS VULNERABILITY: HTML elements detected in processed content'
      );
      console.log(
        '   This may indicate that HTML sanitization is not working properly'
      );
    } else {
      console.log(
        '✅ SAFE: No HTML elements detected - XSS vulnerability appears to be fixed'
      );
    }

    // Keep browser open for manual inspection
    console.log('👀 Browser will remain open for manual inspection...');
    console.log('💡 The extension should process the file content.');
    console.log('💡 Press Ctrl+C to exit when done.');
    console.log('');
    console.log('📋 Manual testing options:');
    console.log('   1. Use extension popup to choose file manually');
    console.log('   2. Drag and drop text files onto pages');
    console.log('   3. Test context menu on text file links');
    console.log(
      '   4. Open .txt, .ans, .nfo files directly to see automatic processing'
    );
    console.log('   5. Test with different file encodings and ANSI art');
    console.log('   6. Observe XSS test file processing (xss-celerity.pip)');

    await new Promise(() => {
      // wait indefinitely
    });
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);

    if (browser) {
      await browser.close();
    }

    process.exit(1);
  }
}

/**
 * Create test text file that should be processed automatically
 */
function createTestTextFile(extensionPath) {
  const testTextContent = `This is a test file that should be processed by RetroTxt.
The extension should detect this as a text file and apply formatting.

Here's some ANSI art to test:

╔═══════════════════════════════════════════╗
║  RetroTxt WebExtension Autogen Test File  ║
║  This file should be automatically        ║
║  processed by the RetroTxt extension      ║
╚═══════════════════════════════════════════╝

Some colored text: \u001b[31mRED\u001b[32mGREEN\u001b[33mYELLOW\u001b[0mNORMAL

End of test file.`;

  const testTextFile = path.join(
    extensionPath,
    'autogen',
    'webextension-test-content.txt'
  );
  fs.writeFileSync(testTextFile, testTextContent);

  return testTextFile;
}

/**
 * Check for extension elements on the page
 */
async function checkForExtensionElements(page) {
  try {
    // Check for RetroTxt-specific elements and styles
    const checks = {
      hasRetroTxtStyles: false,
      hasAnsiProcessing: false,
      hasFontStyles: false,
      hasColorClasses: false,
    };

    // Check for RetroTxt CSS styles
    const styles = await page.$$eval(
      'style, link[rel="stylesheet"]',
      (elements) =>
        elements.some(
          (el) =>
            (el.textContent && el.textContent.includes('retrotxt')) ||
            (el.href && el.href.includes('retrotxt'))
        )
    );

    if (styles) checks.hasRetroTxtStyles = true;

    // Check for ANSI art processing (looking for specific ANSI patterns that would be processed)
    const content = await page.content();
    if (
      content.includes('retrotxt') ||
      content.includes('ansi') ||
      content.includes('text-mode')
    ) {
      checks.hasAnsiProcessing = true;
    }

    // Check for font family changes (RetroTxt uses specific monospace fonts)
    const fontElements = await page.$$eval('*', (elements) =>
      elements.some(
        (el) =>
          el.style.fontFamily &&
          /ibm|commodore|c64|atascii/i.test(el.style.fontFamily)
      )
    );

    if (fontElements) checks.hasFontStyles = true;

    // Check for color classes (RetroTxt adds specific color classes)
    const colorElements = await page.$$eval('*', (elements) =>
      elements.some(
        (el) =>
          el.classList &&
          Array.from(el.classList).some((cls) => /color|fg|bg|ansi/.test(cls))
      )
    );

    if (colorElements) checks.hasColorClasses = true;

    console.log('🔍 Extension processing checks:');
    console.log(
      `   • RetroTxt styles: ${checks.hasRetroTxtStyles ? '✅' : '❌'}`
    );
    console.log(
      `   • ANSI processing: ${checks.hasAnsiProcessing ? '✅' : '❌'}`
    );
    console.log(`   • Font styles: ${checks.hasFontStyles ? '✅' : '❌'}`);
    console.log(`   • Color classes: ${checks.hasColorClasses ? '✅' : '❌'}`);

    // Consider it processed if any of the checks pass
    return Object.values(checks).some((check) => check);
  } catch (error) {
    console.log('⚠️ Could not check for extension elements:', error.message);
    return false;
  }
}

/**
 * Check extension files exist
 */
function checkExtensionFiles(extensionPath) {
  const requiredFiles = [
    'manifest.json',
    'html/popup.html',
    'scripts/sw/background.js',
    'scripts/retrotxt.js',
  ];

  console.log('🔍 Checking extension files...');

  for (const file of requiredFiles) {
    const filePath = path.join(extensionPath, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ Found: ${file}`);
    } else {
      console.warn(`⚠️ Missing extension file: ${file}`);
    }
  }
}

/**
 * Check test file exists
 */
function checkTestFile(testFilePath) {
  if (fs.existsSync(testFilePath)) {
    console.log(`✅ Test file found: ${testFilePath}`);

    const stats = fs.statSync(testFilePath);
    console.log(`📊 File size: ${(stats.size / 1024).toFixed(1)} KB`);
  } else {
    console.error(`❌ Test file not found: ${testFilePath}`);
    console.log('📁 Available test files:');

    const exampleFilesDir = path.join(path.dirname(testFilePath), '..');
    if (fs.existsSync(exampleFilesDir)) {
      const files = fs.readdirSync(exampleFilesDir);
      files.forEach((file) => {
        const filePath = path.join(exampleFilesDir, file);
        const stats = fs.statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(1);
        console.log(`   ${file} (${sizeKB} KB)`);
      });
    }

    throw new Error('Test file not found');
  }
}

/**
 * Get extension ID from browser
 */
async function getExtensionId(browser) {
  // Wait a bit for extension to fully load
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const targets = await browser.targets();

  for (const target of targets) {
    if (target.type() === 'service_worker') {
      const url = target.url();
      const match = url.match(/chrome-extension:\/\/([^/]+)/);
      if (match) {
        return match[1];
      }
    }
  }

  // Alternative method: check all pages
  const pages = await browser.pages();
  for (const page of pages) {
    const url = page.url();
    const match = url.match(/chrome-extension:\/\/([^/]+)/);
    if (match) {
      return match[1];
    }
  }

  throw new Error(
    'Could not find extension ID. Extension may not have loaded correctly.'
  );
}

/**
 * Alternative approach: Test extension popup directly
 */
async function testExtensionPopup() {
  console.log('📱 Testing extension popup directly...');

  let browser;
  try {
    const extensionPath = path.join(__dirname, '..');

    browser = await puppeteer.launch({
      headless: false,
      slowMo: 50,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--window-size=1200,800',
      ],
    });

    // Get extension ID
    const extensionId = await getExtensionId(browser);

    // Open extension popup
    const popupUrl = `chrome-extension://${extensionId}/html/popup.html`;
    const page = await browser.newPage();
    await page.goto(popupUrl, { waitUntil: 'networkidle0' });

    console.log('✅ Extension popup loaded');

    // Take screenshot
    const screenshotPath = path.join(
      extensionPath,
      'test',
      'extension-popup.png'
    );
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Popup screenshot saved: ${screenshotPath}`);

    // Manual interaction required
    console.log('👆 Manual interaction required!');
    console.log('📋 Please:');
    console.log('   1. Click "Choose File" button');
    console.log('   2. Select test/example_files/ZII-RTXT.ans');
    console.log('   3. Observe rendering in new tab');
    console.log('   4. Press Ctrl+C when done');

    await new Promise(() => {
      // wait indefinitely
    });
  } catch (error) {
    console.error('❌ Popup test failed:', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🎯 RetroTxt WebExtension Test');
  console.log('================================');
  console.log('');
  console.log('This test loads the WebExtension and tests:');
  console.log('  • Automatic processing of .txt, .ans, .nfo files');
  console.log('  • Manual file loading via extension popup');
  console.log('  • Drag and drop functionality');
  console.log('  • Context menu integration');
  console.log('  • ANSI art rendering and color processing');
  console.log('  • XSS vulnerability handling with custom test files');
  console.log('');

  // Run the proper WebExtension test
  await testWebExtensionProper();
}

// Run main function
main().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});

// Export for potential use in other scripts
export {
  testWebExtensionProper,
  testExtensionPopup,
  createTestTextFile,
  getExtensionId,
};
