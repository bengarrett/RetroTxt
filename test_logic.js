// Test the localGet logic
const testCases = [
  {},
  {key: 'value'},
  null,
  undefined
];

testCases.forEach((result, i) => {
  console.log(`\nTest case ${i}:`, result);
  try {
    const name = Object.getOwnPropertyNames(result)[0];
    console.log('  name:', name);
    console.log('  typeof name:', typeof name);
    console.log('  typeof name === "undefined":', typeof name === 'undefined');
    console.log('  name === undefined:', name === undefined);
    
    // Test the actual condition from the code
    if (typeof name === `undefined`) {
      console.log('  ❌ Condition is TRUE - would use fallback');
    } else {
      console.log('  ✅ Condition is FALSE - would use stored value');
    }
  } catch (e) {
    console.log('  Error:', e.message);
  }
});