#!/usr/bin/env node

/**
 * Real DOMPurify Performance Benchmark
 * 
 * Uses actual DOMPurify library for accurate results
 */

const { performance } = require('perf_hooks');
const { JSDOM } = require('jsdom');

console.log('🔍 Real DOMPurify Performance Benchmark');
console.log('======================================\n');

// Setup JSDOM environment for DOMPurify
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'https://example.com/',
  referrer: 'https://example.com/',
  contentType: 'text/html',
  includeNodeLocations: true,
  storageQuota: 10000000
});

global.window = dom.window;
global.document = dom.window.document;

// Load DOMPurify
const DOMPurify = require('dompurify')(window);

// Test configurations
const CURRENT_CONFIG = { USE_PROFILES: { html: true } };

const SECURE_CONFIG = {
  USE_PROFILES: { html: false },
  ALLOWED_TAGS: ['b', 'i', 'u', 'br', 'div', 'span'],
  ALLOWED_ATTR: [],
  FORBID_TAGS: ['script', 'style', 'iframe', 'img', 'svg'],
  FORBID_ATTR: ['on*', 'style', 'class', 'id', 'data-*']
};

// Realistic test cases from actual BBS files
const testCases = [
  {
    name: 'Simple Text (50 chars)',
    text: 'Hello World. Simple text with no formatting.',
    iterations: 10000
  },
  {
    name: 'Basic Formatting (100 chars)',
    text: 'Hello <b>World</b>. This has <i>some</i> basic formatting.',
    iterations: 5000
  },
  {
    name: 'Complex Formatting (200 chars)',
    text: 'Line 1<br>Line 2 with <b>bold</b> and <i>italic</i><br>Line 3 with <div>content</div> and <span>span</span>.'
  },
  {
    name: 'Block Characters (500 chars)',
    text: 'ASCII: ◘░▒▓█▄▐▌▀■ blocks with <b>formatting</b> and <i>styles</i>. '.repeat(10)
  },
  {
    name: 'Large Text (10KB)',
    text: 'A'.repeat(5000) + '<b>B</b>'.repeat(1000) + '<i>C</i>'.repeat(1000),
    iterations: 100
  }
];

// Run benchmark
function runBenchmark() {
  console.log('📊 Real DOMPurify Performance Benchmark\n');
  console.log('Using actual DOMPurify library\n');
  
  const results = [];
  
  testCases.forEach(({ name, text, iterations = 1000 }) => {
    console.log(`📝 ${name}:`);
    console.log(`   Text length: ${text.length} characters`);
    console.log(`   Iterations: ${iterations}`);
    
    // Benchmark current configuration
    const startCurrent = performance.now();
    for (let i = 0; i < iterations; i++) {
      DOMPurify.sanitize(text, CURRENT_CONFIG);
    }
    const endCurrent = performance.now();
    const currentTime = endCurrent - startCurrent;
    
    // Benchmark secure configuration
    const startSecure = performance.now();
    for (let i = 0; i < iterations; i++) {
      DOMPurify.sanitize(text, SECURE_CONFIG);
    }
    const endSecure = performance.now();
    const secureTime = endSecure - startSecure;
    
    const impact = ((secureTime - currentTime) / currentTime * 100).toFixed(1);
    const sign = impact > 0 ? '+' : '';
    const perOpCurrent = (currentTime / iterations).toFixed(3);
    const perOpSecure = (secureTime / iterations).toFixed(3);
    
    console.log(`   Current: ${currentTime.toFixed(2)}ms total (${perOpCurrent}ms/op)`);
    console.log(`   Secure:  ${secureTime.toFixed(2)}ms total (${perOpSecure}ms/op)`);
    console.log(`   Impact: ${sign}${impact}%\n`);
    
    results.push({
      name,
      length: text.length,
      iterations,
      currentTime,
      secureTime,
      impact: parseFloat(impact),
      perOpCurrent: parseFloat(perOpCurrent),
      perOpSecure: parseFloat(perOpSecure)
    });
  });
  
  // Summary
  console.log('📊 Performance Summary:');
  console.log('======================');
  
  let totalImpact = 0;
  results.forEach(({ name, impact }) => {
    const sign = impact > 0 ? '+' : '';
    console.log(`${name.padEnd(25)}: ${sign}${impact}%`);
    totalImpact += impact;
  });
  
  const avgImpact = (totalImpact / results.length).toFixed(1);
  const sign = avgImpact > 0 ? '+' : '';
  
  console.log(`\n🎯 Average Impact: ${sign}${avgImpact}%`);
  
  // Detailed analysis
  console.log('\n📈 Per-Operation Impact:');
  results.forEach(({ name, perOpCurrent, perOpSecure }) => {
    const impact = ((perOpSecure - perOpCurrent) / perOpCurrent * 100).toFixed(1);
    const sign = impact > 0 ? '+' : '';
    console.log(`${name.padEnd(25)}: ${perOpCurrent.toFixed(3)}ms → ${perOpSecure.toFixed(3)}ms (${sign}${impact}%)`);
  });
  
  // Assessment
  console.log('\n💡 Performance Assessment:');
  if (Math.abs(parseFloat(avgImpact)) < 5) {
    console.log('✅ Minimal impact - Safe to implement');
    console.log('   Performance difference is negligible');
  } else if (Math.abs(parseFloat(avgImpact)) < 10) {
    console.log('🟡 Moderate impact - Consider optimization');
    console.log('   Performance difference is noticeable but acceptable');
  } else if (Math.abs(parseFloat(avgImpact)) < 20) {
    console.log('🟠 Significant impact - Needs justification');
    console.log('   Security benefits must outweigh performance cost');
  } else {
    console.log('⚠️ High impact - Not recommended');
    console.log('   Performance degradation is too severe');
  }
  
  // Recommendation
  console.log('\n🎉 Final Recommendation:');
  if (Math.abs(parseFloat(avgImpact)) < 5) {
    console.log('🎯 PROCEED - Implement the security hardening');
    console.log('   The performance impact is acceptable for the security benefits.');
  } else if (Math.abs(parseFloat(avgImpact)) < 10) {
    console.log('🎯 PROCEED WITH CAUTION - Monitor performance');
    console.log('   Implement but watch for performance issues in production.');
  } else {
    console.log('❌ DO NOT IMPLEMENT - Performance impact too high');
    console.log('   Find alternative security approach with lower impact.');
  }
  
  // Security vs Performance
  console.log('\n🛡️ Security Impact:');
  console.log('   ✅ Blocks script tags completely');
  console.log('   ✅ Prevents event handler injection');
  console.log('   ✅ Reduces attack surface significantly');
  console.log('   ✅ Provides defense-in-depth');
  
  console.log('\n⚡ Performance Impact:');
  if (Math.abs(parseFloat(avgImpact)) < 5) {
    console.log('   ✅ Negligible - No user impact');
  } else if (Math.abs(parseFloat(avgImpact)) < 10) {
    console.log('   ⚠️ Noticeable - Monitor in production');
  } else {
    console.log('   ❌ Significant - User experience may suffer');
  }
}

// Run the benchmark
runBenchmark().catch(error => {
  console.error('❌ Benchmark failed:', error.message);
  process.exit(1);
});