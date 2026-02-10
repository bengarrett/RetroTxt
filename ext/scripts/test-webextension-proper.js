/**
 * Proper WebExtension Test Script
 * 
 * Purpose: Test RetroTxt extension with actual file:/// URLs
 * Usage: Node.js script using Puppeteer to test real WebExtension workflow
 * Requirements: Puppeteer installed, Chrome browser
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

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
    const testFilePath = path.join(extensionPath, 'test', 'example_files', 'ZII-RTXT.ans');
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
        '--allow-file-access-from-files'  // Important for file:/// access
      ]
    });
    
    // Get extension ID
    const extensionId = await getExtensionId(browser);
    console.log(`🆔 Extension ID: ${extensionId}`);
    
    // Create a test HTML file that the extension can process
    const testHtmlFile = createTestHtmlFile(extensionPath, testFilePath);
    console.log(`📄 Created test HTML file: ${testHtmlFile}`);
    
    // Open the test HTML file in a new tab
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    
    const fileUrl = `file://${testHtmlFile}`;
    console.log(`🌐 Opening test file: ${fileUrl}`);
    
    await page.goto(fileUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    console.log('✅ Test page loaded successfully');
    
    // Take screenshot
    const screenshotPath = path.join(extensionPath, 'test', 'webextension-test.png');
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
    
    // Analyze content
    const content = await page.content();
    console.log(`📊 Page content length: ${content.length} characters`);
    
    // Check if extension elements are present
    const hasExtensionElements = await checkForExtensionElements(page);
    console.log(`🔧 Extension elements detected: ${hasExtensionElements ? '✅ Yes' : '❌ No'}`);
    
    // Keep browser open for manual inspection
    console.log('👀 Browser will remain open for manual inspection...');
    console.log('💡 The extension should process the file content.');
    console.log('💡 Press Ctrl+C to exit when done.');
    
    // Wait indefinitely
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
 * Create test HTML file that loads the ANSI file
 */
function createTestHtmlFile(extensionPath, testFilePath) {
  const testHtmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>RetroTxt WebExtension Test</title>
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
        <h2>RetroTxt WebExtension Test</h2>
        <p>Testing file:/// URL handling</p>
      </div>
      <div id="content">
        <!-- File content will be loaded here by the extension -->
        Loading file content...
      </div>
      <div id="info">
        <p>This page simulates a file loaded with file:/// protocol.</p>
        <p>The RetroTxt extension should process this content.</p>
      </div>
      
      <script>
        // Load the ANSI file content
        fetch('file://${testFilePath.replace(/\\/g, '/')}')
          .then(response => response.text())
          .then(content => {
            document.getElementById('content').textContent = content;
            console.log('File loaded successfully');
          })
          .catch(error => {
            console.error('Error loading file:', error);
            document.getElementById('content').textContent = 
              'Error loading file: ' + error.message;
          });
      </script>
    </body>
    </html>
  `;
  
  const testHtmlFile = path.join(extensionPath, 'test', 'webextension-test.html');
  fs.writeFileSync(testHtmlFile, testHtmlContent);
  
  return testHtmlFile;
}

/**
 * Check for extension elements on the page
 */
async function checkForExtensionElements(page) {
  try {
    // Check for common extension elements
    const extensionElements = await page.$$eval('*', elements => 
      elements.filter(el => 
        el.classList && Array.from(el.classList).some(cls => 
          cls.includes('retrotxt') || cls.includes('extension')
        )
      )
    );
    
    return extensionElements.length > 0;
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
    'scripts/retrotxt.js'
  ];
  
  console.log('🔍 Checking extension files...');
  
  for (const file of requiredFiles) {
    const filePath = path.join(extensionPath, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Missing extension file: ${file}`);
    } else {
      console.log(`✅ Found: ${file}`);
    }
  }
}

/**
 * Check test file exists
 */
function checkTestFile(testFilePath) {
  if (!fs.existsSync(testFilePath)) {
    console.error(`❌ Test file not found: ${testFilePath}`);
    console.log('📁 Available test files:');
    
    const exampleFilesDir = path.join(path.dirname(testFilePath), '..');
    if (fs.existsSync(exampleFilesDir)) {
      const files = fs.readdirSync(exampleFilesDir);
      files.forEach(file => {
        const filePath = path.join(exampleFilesDir, file);
        const stats = fs.statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(1);
        console.log(`   ${file} (${sizeKB} KB)`);
      });
    }
    
    throw new Error('Test file not found');
  } else {
    console.log(`✅ Test file found: ${testFilePath}`);
    
    const stats = fs.statSync(testFilePath);
    console.log(`📊 File size: ${(stats.size / 1024).toFixed(1)} KB`);
  }
}

/**
 * Get extension ID from browser
 */
async function getExtensionId(browser) {
  // Wait a bit for extension to fully load
  await new Promise(resolve => setTimeout(resolve, 2000));
  
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
  
  // Alternative method: check all pages
  const pages = await browser.pages();
  for (const page of pages) {
    const url = page.url();
    const match = url.match(/chrome-extension:\/\/([^\/]+)/);
    if (match) {
      return match[1];
    }
  }
  
  throw new Error('Could not find extension ID. Extension may not have loaded correctly.');
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
        '--window-size=1200,800'
      ]
    });
    
    // Get extension ID
    const extensionId = await getExtensionId(browser);
    
    // Open extension popup
    const popupUrl = `chrome-extension://${extensionId}/html/popup.html`;
    const page = await browser.newPage();
    await page.goto(popupUrl, { waitUntil: 'networkidle0' });
    
    console.log('✅ Extension popup loaded');
    
    // Take screenshot
    const screenshotPath = path.join(extensionPath, 'test', 'extension-popup.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Popup screenshot saved: ${screenshotPath}`);
    
    // Manual interaction required
    console.log('👆 Manual interaction required!');
    console.log('📋 Please:');
    console.log('   1. Click "Choose File" button');
    console.log('   2. Select test/example_files/ZII-RTXT.ans');
    console.log('   3. Observe rendering in new tab');
    console.log('   4. Press Ctrl+C when done');
    
    // Wait indefinitely
    await new Promise(() => {});
    
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
  console.log('This test loads the WebExtension and tests file:/// URL handling.');
  console.log('');
  
  // Run the proper WebExtension test
  await testWebExtensionProper();
}

// Run main function
main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testWebExtensionProper,
    testExtensionPopup,
    createTestHtmlFile,
    getExtensionId
  };
}
