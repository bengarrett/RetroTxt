/**
 * Custom XSS Vulnerability Tests
 * 
 * Purpose: Test for XSS vulnerabilities using custom test files
 * Status: Safe testing - no malicious payloads
 * Coverage: Tests Celerity BBS pipe code processing
 */

// Import test helper functions
import { 
  loadTestFile, 
  processWithRetroTxt, 
  createTestElement, 
  checkForHtmlElements 
} from './tests-helpers.js';

QUnit.module('Custom XSS Vulnerability Tests', {
  beforeEach: function() {
    // Set up test environment
    this.testContainer = createTestElement('div', 'xss-test-container');
    document.body.appendChild(this.testContainer);
  },
  
  afterEach: function() {
    // Clean up
    if (this.testContainer && this.testContainer.parentNode) {
      this.testContainer.parentNode.removeChild(this.testContainer);
    }
  }
});

/**
 * Test Celerity BBS XSS vulnerability using custom test file
 * Method: _normalizeCelerity()
 * Location: scripts/parse_dos.js
 * Uses: example_files/xss-celerity.pip
 */
QUnit.test('Celerity BBS - Custom XSS vulnerability test', async function(assert) {
  const done = assert.async();
  
  try {
    // Load custom test file
    const fileContent = await loadTestFile('example_files/xss-celerity.pip');
    
    // Process with RetroTxt
    const result = processWithRetroTxt(fileContent);
    
    // Add to test container
    this.testContainer.innerHTML = result;
    
    // Check for HTML elements (indicates potential vulnerability)
    const hasHrElements = this.testContainer.querySelectorAll('hr').length > 0;
    const hasBrElements = this.testContainer.querySelectorAll('br').length > 0;
    const hasStrongElements = this.testContainer.querySelectorAll('strong').length > 0;
    
    // Test assertions
    assert.ok(true, 'Custom Celerity BBS test file loaded successfully');
    
    // These would indicate the vulnerability exists
    if (hasHrElements) {
      assert.ok(false, '⚠️ VULNERABILITY: <hr> elements found - XSS risk detected');
    } else {
      assert.ok(true, '✅ SAFE: No <hr> elements found');
    }
    
    if (hasBrElements) {
      assert.ok(false, '⚠️ VULNERABILITY: <br> elements found - XSS risk detected');
    } else {
      assert.ok(true, '✅ SAFE: No <br> elements found');
    }
    
    if (hasStrongElements) {
      assert.ok(false, '⚠️ VULNERABILITY: <strong> elements found - XSS risk detected');
    } else {
      assert.ok(true, '✅ SAFE: No <strong> elements found');
    }
    
    done();
  } catch (error) {
    assert.ok(false, `Custom XSS test failed: ${error.message}`);
    done();
  }
});

/**
 * Test file content analysis
 * Verify the test file contains expected patterns
 */
QUnit.test('Celerity BBS - Test file content validation', async function(assert) {
  const done = assert.async();
  
  try {
    // Load and analyze the test file content
    const fileContent = await loadTestFile('example_files/xss-celerity.pip');
    
    // Check for expected patterns
    const hasPipeCodes = fileContent.includes('|k') || fileContent.includes('|S');
    const hasHtmlElements = fileContent.includes('<hr>') || fileContent.includes('<br>') || fileContent.includes('<strong>');
    const hasColorCodes = fileContent.includes('|r') || fileContent.includes('|g') || fileContent.includes('|b');
    
    assert.ok(true, 'Test file loaded successfully');
    assert.ok(hasPipeCodes, 'Test file contains pipe codes');
    assert.ok(hasHtmlElements, 'Test file contains HTML elements for testing');
    assert.ok(hasColorCodes, 'Test file contains color codes');
    
    done();
  } catch (error) {
    assert.ok(false, `Content validation failed: ${error.message}`);
    done();
  }
});

// Export for potential use in other test files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runCustomXssTests: function() {
      QUnit.start();
    }
  };
}