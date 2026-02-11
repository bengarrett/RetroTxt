/**
 * Convert doesNotThrow to Native QUnit Patterns
 * 
 * Purpose: Replace assert.doesNotThrow() with native QUnit try-catch patterns
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Converting doesNotThrow to Native QUnit Patterns');
console.log('================================================\n');

// Files to process
const filesToProcess = [
  { path: '../test/tests-security.js', name: 'tests-security.js' },
  { path: '../test/tests-errors.js', name: 'tests-errors.js' }
];

filesToProcess.forEach(fileInfo => {
  try {
    const filePath = path.join(__dirname, fileInfo.path);
    let content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`📁 Processing ${fileInfo.name}...`);
    
    // Remove the doesNotThrow implementation first
    const doesNotThrowImpl = /\/\/ Add doesNotThrow assertion if not available[\s\S]*?^\n}/m;
    if (doesNotThrowImpl.test(content)) {
      content = content.replace(doesNotThrowImpl, '');
      console.log('   ✅ Removed doesNotThrow implementation');
    }
    
    // Replace doesNotThrow calls with native QUnit patterns
    const doesNotThrowPattern = /assert\.doesNotThrow\(\(\) => \{\n([\s\S]*?)\n\}, '([^']+)'\)/g;
    
    let match;
    let replacementCount = 0;
    
    while ((match = doesNotThrowPattern.exec(content)) !== null) {
      const functionBody = match[1].trim();
      const message = match[2];
      
      const replacement = `try {
${functionBody}
assert.ok(true, '${message}')
} catch (error) {
assert.ok(false, '${message} - threw: ' + error.message)
}`;
      
      content = content.replace(match[0], replacement);
      replacementCount++;
    }
    
    console.log(`   ✅ Replaced ${replacementCount} doesNotThrow calls with native QUnit patterns`);
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, content);
    console.log(`   ✅ File updated successfully\n`);
    
  } catch (error) {
    console.log(`❌ Error processing ${fileInfo.name}: ${error.message}\n`);
  }
});

console.log('🎉 Conversion Complete!');
console.log('\n📊 Summary:');
console.log('   ✅ Removed custom doesNotThrow implementations');
console.log('   ✅ Replaced with native QUnit try-catch patterns');
console.log('   ✅ Maintained test functionality');
console.log('   ✅ Improved compatibility with standard QUnit');

console.log('\n💡 Next Steps:');
console.log('   Run tests to verify the conversion works:');
console.log('   task test');