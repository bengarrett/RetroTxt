/**
 * Browser-Based DOMPurify Benchmark
 * Run this in a browser environment to get accurate performance measurements
 */

console.log('🔍 Browser-Based DOMPurify Benchmark');
console.log('====================================\n');

// This script should be run in a browser environment
// It tests the actual DOMPurify performance with real DOM

if (typeof DOMPurify === 'undefined') {
  console.log('❌ DOMPurify not available - run this in a browser!');
  console.log('Use: task-webextension:benchmark');
  process.exit(1);
}

// Test configurations
const CURRENT_CONFIG = { USE_PROFILES: { html: true } };

const SECURE_CONFIG = {
  USE_PROFILES: { html: false },
  ALLOWED_TAGS: ['b', 'i', 'u', 'br', 'div', 'span'],
  ALLOWED_ATTR: [],
  FORBID_TAGS: ['script', 'style', 'iframe', 'img', 'svg'],
  FORBID_ATTR: ['on*', 'style', 'class', 'id', 'data-*']
};

// Test cases
const testCases = [
  {
    name: 'Simple Text (50 chars)',
    text: 'Hello World. Simple text with no formatting.',
    iterations: 10000
  },
  {
    name: 'Basic Formatting (100 chars)',
    text: 'Hello <b>World</b>. Basic <i>formatting</i> test.',
    iterations: 5000
  },
  {
    name: 'Complex Content (200 chars)',
    text: 'Line 1<br>Line 2 with <b>bold</b> and <i>italic</i>.<br>Line 3 with blocks.',
    iterations: 2000
  },
  {
    name: 'Large Text (10KB)',
    text: 'A'.repeat(5000) + '<b>B</b>'.repeat(1000) + '<i>C</i>'.repeat(1000),
    iterations: 100
  }
];

console.log('📊 Running Browser-Based Benchmark...\n');

const results = [];
let totalCurrent = 0;
let totalSecure = 0;

testCases.forEach(({ name, text, iterations }) => {
  console.log(`${name}:`);
  
  // Benchmark current configuration
  const startCurrent = performance.now();
  for (let i = 0; i < iterations; i++) {
    DOMPurify.sanitize(text, CURRENT_CONFIG);
  }
  const endCurrent = performance.now();
  const currentTime = endCurrent - startCurrent;
  totalCurrent += currentTime;
  
  // Benchmark secure configuration
  const startSecure = performance.now();
  for (let i = 0; i < iterations; i++) {
    DOMPurify.sanitize(text, SECURE_CONFIG);
  }
  const endSecure = performance.now();
  const secureTime = endSecure - startSecure;
  totalSecure += secureTime;
  
  const impact = ((secureTime - currentTime) / currentTime * 100).toFixed(1);
  const sign = impact > 0 ? '+' : '';
  const perOpCurrent = (currentTime / iterations).toFixed(3);
  const perOpSecure = (secureTime / iterations).toFixed(3);
  
  console.log(`  Current: ${currentTime.toFixed(2)}ms total (${perOpCurrent}ms/op)`);
  console.log(`  Secure:  ${secureTime.toFixed(2)}ms total (${perOpSecure}ms/op)`);
  console.log(`  Impact:  ${sign}${impact}%\n`);
  
  results.push({
    name,
    currentTime,
    secureTime,
    impact: parseFloat(impact),
    perOpCurrent: parseFloat(perOpCurrent),
    perOpSecure: parseFloat(perOpSecure)
  });
});

// Summary
const avgImpact = ((totalSecure - totalCurrent) / totalCurrent * 100).toFixed(1);
const sign = avgImpact > 0 ? '+' : '';

console.log(`🎯 Average Performance Impact: ${sign}${avgImpact}%`);

// Assessment
console.log('\n💡 Performance Assessment:');
if (Math.abs(parseFloat(avgImpact)) < 5) {
  console.log('✅ Minimal impact - Excellent!');
  console.log('   The security hardening has negligible performance cost.');
} else if (Math.abs(parseFloat(avgImpact)) < 10) {
  console.log('🟡 Moderate impact - Acceptable');
  console.log('   The security benefits outweigh the performance cost.');
} else if (Math.abs(parseFloat(avgImpact)) < 20) {
  console.log('🟠 Significant impact - Needs justification');
  console.log('   Security benefits must outweigh performance cost.');
} else {
  console.log('⚠️ High impact - Not recommended');
  console.log('   Performance degradation is too severe.');
}

// Detailed analysis
console.log('\n📈 Per-Operation Impact:');
results.forEach(({ name, perOpCurrent, perOpSecure, impact }) => {
  const sign = impact > 0 ? '+' : '';
  console.log(`${name.padEnd(25)}: ${perOpCurrent.toFixed(3)}ms → ${perOpSecure.toFixed(3)}ms (${sign}${impact}%)`);
});

console.log('\n🛡️ Security Benefits:');
console.log('   ✅ Blocks all script tags completely');
console.log('   ✅ Prevents event handler injection (onclick, onerror, etc.)');
console.log('   ✅ Reduces attack surface significantly');
console.log('   ✅ Provides explicit control over allowed HTML');
console.log('   ✅ Defense-in-depth security approach');

console.log('\n🎉 Final Recommendation:');
if (Math.abs(parseFloat(avgImpact)) < 10) {
  console.log('🎯 PROCEED - Implement the security hardening');
  console.log('   The performance impact is acceptable for the security benefits.');
} else {
  console.log('⚠️ REVIEW - Performance impact may be too high');
  console.log('   Consider optimizing or find alternative approach.');
}

console.log('\n✅ Browser Benchmark Complete!');
console.log('   These are accurate, real-world performance measurements.');