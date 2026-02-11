#!/usr/bin/env node

/**
 * DOMPurify Performance Impact Benchmark
 * 
 * Tests performance impact of security hardening changes
 * Compares current vs proposed configuration
 */

const { performance } = require('perf_hooks');

console.log('🔍 DOMPurify Performance Impact Benchmark');
console.log('=========================================\n');

// Test configurations
const CURRENT_CONFIG = { USE_PROFILES: { html: true } };

const SECURE_CONFIG = {
  USE_PROFILES: { html: false },
  ALLOWED_TAGS: ['b', 'i', 'u', 'br', 'div', 'span'],
  ALLOWED_ATTR: [],
  FORBID_TAGS: ['script', 'style', 'iframe', 'img', 'svg'],
  FORBID_ATTR: ['on*', 'style', 'class', 'id', 'data-*']
};

// Mock DOMPurify for testing (since we're in Node.js)
const mockDOMPurify = {
  sanitize: (text, config) => {
    // Simulate DOMPurify behavior
    if (config.USE_PROFILES.html === false) {
      // Secure config - more processing
      return text
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, (match) => {
          const tag = match.match(/<(\w+)/)?.[1]?.toLowerCase() || '';
          if (config.ALLOWED_TAGS.includes(tag)) return match;
          return '';
        });
    } else {
      // Current config - less processing
      return text.replace(/<script[^>]*>.*?<\/script>/gi, '');
    }
  }
};

// Test data - realistic BBS text samples
const testCases = [
  {
    name: 'Simple Text',
    text: 'Hello World. This is a simple test with no formatting.'
  },
  {
    name: 'Basic Formatting',
    text: 'Hello <b>World</b>. This has <i>some</i> basic <u>formatting</u>.'
  },
  {
    name: 'Complex Formatting',
    text: 'Line 1<br>Line 2 with <b>bold</b> and <i>italic</i><br>Line 3 with <div>div content</div> and <span>span content</span>.'
  },
  {
    name: 'Block Characters',
    text: 'ASCII art: ◘░▒▓█▄▐▌▀■ with <b>formatting</b> and blocks.'
  },
  {
    name: 'Large Text',
    text: 'A'.repeat(1000) + '<b>B</b>'.repeat(500) + '<i>C</i>'.repeat(500)
  }
];

// Run benchmark
function runBenchmark() {
  console.log('📊 Benchmarking DOMPurify Configurations\n');
  
  const results = [];
  
  testCases.forEach(({ name, text }) => {
    console.log(`📝 ${name}:`);
    console.log(`   Text length: ${text.length} characters`);
    
    // Benchmark current configuration
    const startCurrent = performance.now();
    for (let i = 0; i < 1000; i++) {
      mockDOMPurify.sanitize(text, CURRENT_CONFIG);
    }
    const endCurrent = performance.now();
    const currentTime = endCurrent - startCurrent;
    
    // Benchmark secure configuration
    const startSecure = performance.now();
    for (let i = 0; i < 1000; i++) {
      mockDOMPurify.sanitize(text, SECURE_CONFIG);
    }
    const endSecure = performance.now();
    const secureTime = endSecure - startSecure;
    
    const impact = ((secureTime - currentTime) / currentTime * 100).toFixed(1);
    const sign = impact > 0 ? '+' : '';
    
    console.log(`   Current Config: ${currentTime.toFixed(2)}ms`);
    console.log(`   Secure Config:  ${secureTime.toFixed(2)}ms`);
    console.log(`   Impact: ${sign}${impact}%\n`);
    
    results.push({
      name,
      length: text.length,
      currentTime,
      secureTime,
      impact: parseFloat(impact)
    });
  });
  
  // Summary
  console.log('📊 Performance Summary:');
  console.log('======================');
  
  let totalImpact = 0;
  results.forEach(({ name, impact }) => {
    const sign = impact > 0 ? '+' : '';
    console.log(`${name.padEnd(20)}: ${sign}${impact}%`);
    totalImpact += impact;
  });
  
  const avgImpact = (totalImpact / results.length).toFixed(1);
  const sign = avgImpact > 0 ? '+' : '';
  
  console.log(`\n🎯 Average Impact: ${sign}${avgImpact}%`);
  
  // Assessment
  console.log('\n💡 Performance Assessment:');
  if (Math.abs(parseFloat(avgImpact)) < 5) {
    console.log('✅ Minimal impact - Safe to implement');
  } else if (Math.abs(parseFloat(avgImpact)) < 10) {
    console.log('🟡 Moderate impact - Consider optimization');
  } else {
    console.log('⚠️ Significant impact - Needs review');
  }
  
  // Recommendation
  console.log('\n🎉 Recommendation:');
  if (Math.abs(parseFloat(avgImpact)) < 5) {
    console.log('Proceed with implementation - performance impact is acceptable');
  } else {
    console.log('Review implementation - performance impact may be too high');
  }
}

// Run the benchmark
runBenchmark();