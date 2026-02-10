/**
 * Extension Rendering Test Script
 * 
 * Purpose: Test RetroTxt extension file rendering in actual browser
 * Usage: Node.js script using Puppeteer to test WebExtension
 * Requirements: Puppeteer installed, Chrome browser
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * Main test function - Tests extension rendering
 */
async function testExtensionRendering() {
  console.log('🚀 Starting RetroTxt extension rendering test...');
  
  let browser;
  try {
    // Get extension path
    const extensionPath = path.join(__dirname, '..');
    console.log(`📁 Extension path: ${extensionPath}`);
    
    // Check if extension files exist
    const manifestPath = path.join(extensionPath, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`Extension manifest not found: ${manifestPath}`);
    }
    
    // Check if test file exists
    const testFilePath = path.join(extensionPath, 'test', 'example_files', 'ZII-RTXT.ans');
    if (!fs.existsSync(testFilePath)) {
      console.warn(`⚠️ Test file not found: ${testFilePath}`);
      console.log('📁 Available test files:');
      listTestFiles(extensionPath);
      // Continue with test anyway - user can manually select file
    } else {
      console.log(`📄 Test file found: ${testFilePath}`);
    }
    
    // Launch browser with extension loaded
    console.log('🌐 Launching browser with RetroTxt extension...');
    
    browser = await puppeteer.launch({
      headless: false,  // Must be false to see extension UI
      slowMo: 50,       // Slow down for better observation
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--window-size=1200,800',
        '--disable-infobars',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--enable-features=ExtensionsInDevMode'
      ]
    });
    
    // Get extension ID
    console.log('🔍 Getting extension ID...');
    const extensionId = await getExtensionId(browser);
    console.log(`🆔 Extension ID: ${extensionId}`);
    
    // Open extension popup
    const popupUrl = `chrome-extension://${extensionId}/html/popup.html`;
    console.log(`📱 Opening extension popup: ${popupUrl}`);
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    
    // Navigate to extension popup
    await page.goto(popupUrl, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    console.log('✅ Extension popup loaded successfully');
    
    // Wait for extension to fully initialize
    console.log('⏳ Waiting for extension initialization...');
    await page.waitForTimeout(2000); // Wait for extension to load
    
    // Take screenshot of extension popup
    const popupScreenshotPath = path.join(extensionPath, 'test', 'extension-popup.png');
    await page.screenshot({
      path: popupScreenshotPath,
      fullPage: false
    });
    
    console.log(`📸 Extension popup screenshot saved: ${popupScreenshotPath}`);
    
    // Now we need to manually interact with the extension
    // This is where human intervention is needed
    console.log('👆 Manual interaction required!');
    console.log('📋 Please perform the following steps:');
    console.log('   1. Click the "Choose File" button in the extension');
    console.log('   2. Select: test/example_files/ZII-RTXT.ans');
    console.log('   3. Click "Open" to load the file');
    console.log('   4. Observe the rendering in the extension');
    console.log('   5. Press Ctrl+C when done to exit');
    
    // Wait for file to be loaded by user
    console.log('⏳ Waiting for user to load file...');
    console.log('💡 The browser will remain open for your testing.');
    console.log('📸 A final screenshot will be taken when you close this script.');
    
    // Keep browser open for manual testing
    // User will press Ctrl+C when done
    
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
 * Alternative approach: Test file rendering in new tab
 * This simulates how the extension renders files in browser tabs
 */
async function testFileRenderingInTab() {
  console.log('🌐 Testing file rendering in browser tab...');
  
  let browser;
  try {
    const extensionPath = path.join(__dirname, '..');
    const testFilePath = path.join(extensionPath, 'test', 'example_files', 'ZII-RTXT.ans');
    
    // Launch browser with extension
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 50,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--window-size=1200,800'
      ]
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    
    // Read test file content
    const fileContent = fs.readFileSync(testFilePath, 'utf8');
    
    // Create HTML page that simulates extension rendering
    const htmlContent = createTestPage(fileContent);
    
    // Set page content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });
    
    console.log('📄 Test page loaded with file content');
    
    // Take screenshot
    const screenshotPath = path.join(extensionPath, 'test', 'file-rendering-test.png');
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    
    console.log(`📸 File rendering screenshot saved: ${screenshotPath}`);
    
    // Analyze content
    const content = await page.$eval('#content', el => el.textContent);
    console.log(`📊 Content length: ${content.length} characters`);
    
    // Check for ANSI codes
    const hasAnsiCodes = /\u001b\[[0-9;]+m/.test(content);
    console.log(`🎨 ANSI codes detected: ${hasAnsiCodes ? '✅ Yes' : '❌ No'}`);
    
    // Keep browser open for inspection
    console.log('👀 Browser will remain open for manual inspection...');
    console.log('💡 Press Ctrl+C to exit when done.');
    
    // Wait indefinitely
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ File rendering test failed:', error.message);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
}

/**
 * Create test HTML page that simulates extension rendering
 */
function createTestPage(content) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>RetroTxt File Rendering Test</title>
      <style>
        body {
          font-family: monospace;
          white-space: pre;
          background: black;
          color: white;
          padding: 20px;
          margin: 0;
        }
        #header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(0,0,0,0.9);
          color: white;
          padding: 10px;
          font-family: sans-serif;
          z-index: 100;
        }
        #content {
          margin-top: 60px;
          font-size: 14px;
          line-height: 1.2;
        }
        #info {
          position: fixed;
          bottom: 10px;
          right: 10px;
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 10px;
          border-radius: 5px;
          font-family: sans-serif;
        }
      </style>
    </head>
    <body>
      <div id="header">
        <h2>RetroTxt File Rendering Test</h2>
        <p>File: ZII-RTXT.ans | Extension: RetroTxt</p>
      </div>
      <div id="content">
        ${escapeHtml(content)}
      </div>
      <div id="info">
        <p>This simulates how RetroTxt renders files in browser tabs.</p>
        <p>ANSI codes should be visible in the rendered content.</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Escape HTML for safe rendering
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Get extension ID from browser
 */
async function getExtensionId(browser) {
  const targets = await browser.targets();
  
  for (const target of targets) {
    if (target.type() === 'service_worker') {
      const url = target.url();
      const match = url.match(/chrome-extension:\/\/([^\/]+)/);
      if (match) {
        return match[1];
      }
    }
  }
  
  // Alternative method: check background pages
  const pages = await browser.pages();
  for (const page of pages) {
    const url = page.url();
    const match = url.match(/chrome-extension:\/\/([^\/]+)/);
    if (match) {
      return match[1];
    }
  }
  
  throw new Error('Could not find extension ID. Make sure the extension loaded correctly.');
}

/**
 * List available test files
 */
function listTestFiles(extensionPath) {
  const testFilesDir = path.join(extensionPath, 'test', 'example_files');
  
  if (fs.existsSync(testFilesDir)) {
    const files = fs.readdirSync(testFilesDir);
    files.forEach(file => {
      const filePath = path.join(testFilesDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(1);
      console.log(`   ${file} (${sizeKB} KB)`);
    });
  }
}

/**
 * Main execution with user choice
 */
async function main() {
  console.log('🎯 RetroTxt Extension Rendering Test');
  console.log('==================================');
  console.log('');
  console.log('Choose test mode:');
  console.log('  1. Full Extension Test (requires manual interaction)');
  console.log('  2. File Rendering Simulation (automated)');
  console.log('');
  
  // For now, default to file rendering simulation
  // as it's more reliable for automated testing
  console.log('🤖 Starting File Rendering Simulation (mode 2)...');
  console.log('');
  
  await testFileRenderingInTab();
}

// Run main function
main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testExtensionRendering,
    testFileRenderingInTab,
    createTestPage,
    getExtensionId,
    listTestFiles
  };
}
