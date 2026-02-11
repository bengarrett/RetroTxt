/**
 * Fix doesNotThrow with Native QUnit Patterns
 * 
 * Purpose: Replace assert.doesNotThrow() with native QUnit try-catch patterns
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing doesNotThrow with Native QUnit Patterns');
console.log('===============================================\n');

// Process tests-errors.js
try {
  const filePath = path.join(__dirname, '../test/tests-errors.js');
  let content = fs.readFileSync(filePath, 'utf8');
  
  console.log('📁 Processing tests-errors.js...');
  
  // Remove the doesNotThrow implementation first
  const implStart = content.indexOf('// Add doesNotThrow assertion if not available');
  const implEnd = content.indexOf('\nQUnit.module(\'error handling\',', implStart);
  
  if (implStart !== -1 && implEnd !== -1) {
    content = content.substring(0, implStart) + content.substring(implEnd);
    console.log('   ✅ Removed doesNotThrow implementation');
  }
  
  // Replace specific doesNotThrow calls
  const replacements = [
    {
      pattern: `assert.doesNotThrow(() => {\n    dom.construct()\n  }, 'construct() should handle missing elements')`,
      replacement: `try {
    dom.construct()
    assert.ok(true, 'construct() should handle missing elements')
  } catch (error) {
    assert.ok(false, 'construct() should handle missing elements - threw: ' + error.message)
  }`
    },
    {
      pattern: `assert.doesNotThrow(() => {\n    dom.constructHeader()\n  }, 'Should handle missing header elements')`,
      replacement: `try {
    dom.constructHeader()
    assert.ok(true, 'Should handle missing header elements')
  } catch (error) {
    assert.ok(false, 'Should handle missing header elements - threw: ' + error.message)
  }`
    },
    {
      pattern: `assert.doesNotThrow(() => {\n    tab._hostname()\n  }, 'Should handle invalid URLs in _hostname()')`,
      replacement: `try {
    tab._hostname()
    assert.ok(true, 'Should handle invalid URLs in _hostname()')
  } catch (error) {
    assert.ok(false, 'Should handle invalid URLs in _hostname() - threw: ' + error.message)
  }`
    },
    {
      pattern: `assert.doesNotThrow(() => {\n    extension.activateTab({}, null)\n  }, 'Should handle invalid tab activation')`,
      replacement: `try {
    extension.activateTab({}, null)
    assert.ok(true, 'Should handle invalid tab activation')
  } catch (error) {
    assert.ok(false, 'Should handle invalid tab activation - threw: ' + error.message)
  }`
    },
    {
      pattern: `assert.doesNotThrow(() => {\n    extension.install({reason: 'unknown'})\n  }, 'Should handle unknown installation reasons')`,
      replacement: `try {
    extension.install({reason: 'unknown'})
    assert.ok(true, 'Should handle unknown installation reasons')
  } catch (error) {
    assert.ok(false, 'Should handle unknown installation reasons - threw: ' + error.message)
  }`
    },
    {
      pattern: `assert.doesNotThrow(() => {\n    security.fail()\n  }, 'Should handle permission denial')`,
      replacement: `try {
    security.fail()
    assert.ok(true, 'Should handle permission denial')
  } catch (error) {
    assert.ok(false, 'Should handle permission denial - threw: ' + error.message)
  }`
    },
    {
      pattern: `assert.doesNotThrow(() => {\n    tab.create()\n  }, 'Should handle missing tab info')`,
      replacement: `try {
    tab.create()
    assert.ok(true, 'Should handle missing tab info')
  } catch (error) {
    assert.ok(false, 'Should handle missing tab info - threw: ' + error.message)
  }`
    },
    {
      pattern: `assert.doesNotThrow(() => {\n    downloads.parseBlob(invalidBlob)\n  }, 'Should handle invalid blob type')`,
      replacement: `try {
    downloads.parseBlob(invalidBlob)
    assert.ok(true, 'Should handle invalid blob type')
  } catch (error) {
    assert.ok(false, 'Should handle invalid blob type - threw: ' + error.message)
  }`
    },
    {
      pattern: `assert.doesNotThrow(() => {\n    tab.create()\n  }, 'Should handle complete workflow')`,
      replacement: `try {
    tab.create()
    assert.ok(true, 'Should handle complete workflow')
  } catch (error) {
    assert.ok(false, 'Should handle complete workflow - threw: ' + error.message)
  }`
    },
    {
      pattern: `assert.doesNotThrow(() => {\n    dom.construct()\n    dom.constructHeader()\n    dom.constructPalette()\n  }, 'Should handle multiple operations')`,
      replacement: `try {
    dom.construct()
    dom.constructHeader()
    dom.constructPalette()
    assert.ok(true, 'Should handle multiple operations')
  } catch (error) {
    assert.ok(false, 'Should handle multiple operations - threw: ' + error.message)
  }`
    }
  ];
  
  let replacementCount = 0;
  replacements.forEach(replacement => {
    if (content.includes(replacement.pattern)) {
      content = content.replace(replacement.pattern, replacement.replacement);
      replacementCount++;
    }
  });
  
  console.log(`   ✅ Replaced ${replacementCount} doesNotThrow calls with native QUnit patterns`);
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, content);
  console.log('   ✅ File updated successfully\n');
  
} catch (error) {
  console.log(`❌ Error processing tests-errors.js: ${error.message}\n`);
}

// Process tests-security.js
try {
  const filePath = path.join(__dirname, '../test/tests-security.js');
  let content = fs.readFileSync(filePath, 'utf8');
  
  console.log('📁 Processing tests-security.js...');
  
  // Remove the doesNotThrow implementation first
  const implStart = content.indexOf('// Add doesNotThrow assertion if not available');
  const implEnd = content.indexOf('\nQUnit.module(\'security\',', implStart);
  
  if (implStart !== -1 && implEnd !== -1) {
    content = content.substring(0, implStart) + content.substring(implEnd);
    console.log('   ✅ Removed doesNotThrow implementation');
  }
  
  // The security test already has the native pattern from our earlier manual fix
  console.log('   ✅ Already using native QUnit pattern');
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, content);
  console.log('   ✅ File updated successfully\n');
  
} catch (error) {
  console.log(`❌ Error processing tests-security.js: ${error.message}\n`);
}

console.log('🎉 Conversion to Native QUnit Patterns Complete!');
console.log('\n📊 Summary:');
console.log('   ✅ Removed custom doesNotThrow implementations');
console.log('   ✅ Replaced with native QUnit try-catch patterns');
console.log('   ✅ Maintained test functionality');
console.log('   ✅ Improved compatibility with standard QUnit');

console.log('\n💡 Next Steps:');
console.log('   Run tests to verify the conversion works:');
console.log('   task test');