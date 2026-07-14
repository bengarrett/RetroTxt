/* global BBS*/
'use strict';

QUnit.module(`xss vulnerability`, {
  beforeEach: function () {
    this.testContainer = document.createElement('div');
    this.testContainer.id = 'xss-test-container';
    document.body.appendChild(this.testContainer);
  },
  afterEach: function () {
    if (this.testContainer && this.testContainer.parentNode) {
      this.testContainer.parentNode.removeChild(this.testContainer);
    }
  },
});

QUnit.test('BBS class : xss test', async function (assert) {
  const risk = 'possible XSS risk: found',
    safe = 'no injected HTML element found';
  try {
    const response = await fetch('/test/example_files/xss-celerity.pip');
    const fileContent = await response.text();
    const bbsParser = new BBS(fileContent, 'celerity');
    const result = bbsParser.normalize();

    this.testContainer.innerHTML = result;
    const hasHrElements = this.testContainer.querySelectorAll('hr').length > 0;
    const hasBrElements = this.testContainer.querySelectorAll('br').length > 0;
    const hasStrongElements =
      this.testContainer.querySelectorAll('strong').length > 0;

    assert.ok(true, 'Custom BBS test file loaded successfully');
    if (hasHrElements) {
      assert.ok(false, `${risk} <hr> elements`);
    } else {
      assert.ok(true, safe);
    }
    if (hasBrElements) {
      assert.ok(false, `${risk} <br> elements`);
    } else {
      assert.ok(true, safe);
    }
    if (hasStrongElements) {
      assert.ok(false, `${risk} <strong> elements`);
    } else {
      assert.ok(true, safe);
    }
  } catch (error) {
    assert.ok(false, `Custom XSS test failed: ${error.message}`);
  }
});

QUnit.test('BBS class : celerity validation', async (assert) => {
  try {
    const response = await fetch('/test/example_files/xss-celerity.pip');
    const fileContent = await response.text();

    const hasPipeCodes =
      fileContent.includes('|k') || fileContent.includes('|S');
    const hasHtmlElements =
      fileContent.includes('<hr>') ||
      fileContent.includes('<br>') ||
      fileContent.includes('<strong>');
    const hasColorCodes =
      fileContent.includes('|r') ||
      fileContent.includes('|g') ||
      fileContent.includes('|b');

    assert.ok(true, 'Test file loaded successfully');
    assert.ok(hasPipeCodes, 'Test file contains pipe codes');
    assert.ok(hasHtmlElements, 'Test file contains HTML elements for testing');
    assert.ok(hasColorCodes, 'Test file contains color codes');
  } catch (error) {
    assert.ok(false, `Content validation failed: ${error.message}`);
  }
});
