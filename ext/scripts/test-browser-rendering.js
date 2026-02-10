/**
 * Browser Rendering Test Script
 * 
 * Purpose: Test file rendering in actual browser environment using Puppeteer
 * Usage: Node.js script for automated browser testing
 * Requirements: Puppeteer installed
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * Main test function
 */
async function testBrowserRendering() {
  console.log('🚀 Starting browser rendering test...');
  
  let browser;
  try {
    // Launch browser
    console.log('🌐 Launching browser...');
    browser = await puppeteer.launch({
      headless: false,  // Run in non-headless mode for visual inspection
      slowMo: 50,       // Slow down for better observation
      args: [
        '--window-size=1200,800',
        '--disable-infobars',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    
    // Test file path
    const testFilePath = path.join(__dirname, '..', 'test', 'example_files', 'ZII-RTXT.ans');
    
    // Check if file exists
    if (!fs.existsSync(testFilePath)) {
      throw new Error(`Test file not found: ${testFilePath}`);
    }
    
    console.log(`📁 Test file found: ${testFilePath}`);
    
    // Create a simple HTML page to display the file content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Browser Rendering Test</title>
        <style>
          body {
            font-family: monospace;
            white-space: pre;
            background: black;
            color: white;
            padding: 20px;
            margin: 0;
          }
          #content {
            font-size: 14px;
            line-height: 1.2;
          }
          #info {
            position: fixed;
            top: 10px;
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
        <div id="info">
          <h3>Browser Rendering Test</h3>
          <p>File: ZII-RTXT.ans</p>
          <p>Status: <span id="status">Loading...</span></p>
        </div>
        <div id="content">
          <!-- Content will be loaded here -->
        </div>
        <script>
          // Load file content
          fetch('file://${testFilePath.replace(/\\/g, '/')}')
            .then(response => response.text())
            .then(content => {
              document.getElementById('content').textContent = content;
              document.getElementById('status').textContent = '✅ Loaded successfully';
              document.getElementById('status').style.color = 'lime';
            })
            .catch(error => {
              document.getElementById('status').textContent = '❌ Load failed: ' + error.message;
              document.getElementById('status').style.color = 'red';
              console.error('Load error:', error);
            });
        </script>
      </body>
      </html>
    `;
    
    // Set page content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });
    
    console.log('📄 Page loaded, attempting to load file content...');
    
    // Wait for file to load
    await page.waitForFunction(() => {
      const status = document.getElementById('status').textContent;
      return status.includes('✅') || status.includes('❌');
    }, { timeout: 10000 });
    
    // Check if loading was successful
    const status = await page.$eval('#status', el => el.textContent);
    
    if (status.includes('✅')) {
      console.log('🎉 File loaded successfully in browser!');
      
      // Take screenshot
      const screenshotPath = path.join(__dirname, '..', 'test', 'browser-rendering-test.png');
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      
      console.log(`📸 Screenshot saved: ${screenshotPath}`);
      
      // Additional checks
      const content = await page.$eval('#content', el => el.textContent);
      console.log(`📊 Content length: ${content.length} characters`);
      console.log(`📝 First 100 chars: ${content.substring(0, 100)}...`);
      
      // Check for ANSI codes
      const hasAnsiCodes = /\u001b\[[0-9;]+m/.test(content);
      console.log(`🎨 ANSI codes detected: ${hasAnsiCodes ? '✅ Yes' : '❌ No'}`);
      
    } else {
      console.log('❌ File loading failed in browser');
      console.log(`Error: ${status}`);
    }
    
    // Keep browser open for manual inspection
    console.log('👀 Browser will remain open for manual inspection...');
    console.log('💡 Press Ctrl+C to exit when done.');
    
    // Wait indefinitely (or until manually closed)
    await new Promise(() => {});
    
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
 * Alternative approach: Load file via extension
 */
async function testWithExtension() {
  console.log('🔧 Testing with RetroTxt extension...');
  
  let browser;
  try {
    // Launch browser with extension
    const extensionPath = path.join(__dirname, '..');
    
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
    
    // Navigate to a test page or extension popup
    const popupUrl = 'chrome-extension://' + (await getExtensionId(browser)) + '/html/popup.html';
    await page.goto(popupUrl, { waitUntil: 'networkidle0' });
    
    console.log('📱 Extension popup loaded');
    
    // Here you would interact with the extension to load the file
    // This is more complex and requires knowing the extension's UI
    
    console.log('ℹ️ Manual interaction may be needed to load test file');
    
  } catch (error) {
    console.error('❌ Extension test failed:', error.message);
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Helper function to get extension ID
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
  throw new Error('Could not find extension ID');
}

/**
 * Main execution
 */
(async () => {
  // Check if file exists first
  const testFilePath = path.join(__dirname, '..', 'test', 'example_files', 'ZII-RTXT.ans');
  
  if (!fs.existsSync(testFilePath)) {
    console.error(`❌ Test file not found: ${testFilePath}`);
    console.log('📁 Available test files:');
    
    const exampleFilesDir = path.join(__dirname, '..', 'test', 'example_files');
    if (fs.existsSync(exampleFilesDir)) {
      const files = fs.readdirSync(exampleFilesDir);
      files.forEach(file => {
        console.log(`  - ${file}`);
      });
    }
    
    process.exit(1);
  }
  
  // Run the main test
  await testBrowserRendering();
  
  // Note: testWithExtension() is available but more complex
  // It requires manual interaction and extension-specific knowledge
})();

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testBrowserRendering,
    testWithExtension
  };
}
