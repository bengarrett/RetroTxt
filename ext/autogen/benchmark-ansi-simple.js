#!/usr/bin/env node

/**
 * Simple ANSI Parsing Performance Benchmark
 * 
 * This script creates a focused benchmark for ANSI parsing performance
 * comparing string concatenation vs array-based approaches.
 */

const { performance } = require('perf_hooks');

console.log('🔍 ANSI Parsing Performance Benchmark');
console.log('=====================================\n');

// Test different file sizes
const testSizes = [
  { name: 'Small', size: 1000 },
  { name: 'Medium', size: 10000 },
  { name: 'Large', size: 50000 },
  { name: 'Very Large', size: 100000 }
];

// Simulate the current string concatenation approach
function simulateCurrentApproach(text) {
  let html = '';
  
  // Simulate processing ANSI sequences and building HTML
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    // Simulate ANSI sequence detection and HTML building
    if (char === '\u001B') {
      // ANSI escape sequence
      const sequence = text.substr(i, 5); // Simplified
      html += `<span class="ansi">${sequence}</span>`;
      i += 4; // Skip ahead
    } else if (char === '\n') {
      html += '</div><div class="row">';
    } else {
      html += char;
    }
  }
  
  return html;
}

// Simulate the optimized array-based approach
function simulateOptimizedApproach(text) {
  const htmlParts = [];
  
  // Simulate processing ANSI sequences and building HTML
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    // Simulate ANSI sequence detection and HTML building
    if (char === '\u001B') {
      // ANSI escape sequence
      const sequence = text.substr(i, 5); // Simplified
      htmlParts.push(`<span class="ansi">${sequence}</span>`);
      i += 4; // Skip ahead
    } else if (char === '\n') {
      htmlParts.push('</div><div class="row">');
    } else {
      htmlParts.push(char);
    }
  }
  
  return htmlParts.join('');
}

function createTestAnsiText(size) {
  // Create ANSI text with various sequences
  const sequences = [
    '\u001B[31m', // Red text
    '\u001B[1m',  // Bold
    '\u001B[4m',  // Underline
    '\u001B[0m',  // Reset
    '\u001B[32m', // Green text
    '\u001B[33m', // Yellow text
    '\u001B[34m', // Blue text
    '\n'          // Newline
  ];
  
  let result = '';
  let pos = 0;
  
  while (result.length < size) {
    // Add some regular text
    const textLength = Math.min(50, size - result.length);
    result += 'A'.repeat(textLength);
    
    // Add an ANSI sequence
    if (result.length < size) {
      const sequence = sequences[pos % sequences.length];
      result += sequence;
      pos++;
    }
  }
  
  return result;
}

async function runBenchmark() {
  console.log('📊 Benchmarking String Concatenation vs Array Approach\n');
  
  const results = [];
  
  for (const { name, size } of testSizes) {
    console.log(`📝 ${name} Text (${size} characters):`);
    
    const testText = createTestAnsiText(size);
    
    // Benchmark current approach (string concatenation)
    const startCurrent = performance.now();
    const currentResult = simulateCurrentApproach(testText);
    const endCurrent = performance.now();
    const currentTime = endCurrent - startCurrent;
    
    // Benchmark optimized approach (array-based)
    const startOptimized = performance.now();
    const optimizedResult = simulateOptimizedApproach(testText);
    const endOptimized = performance.now();
    const optimizedTime = endOptimized - startOptimized;
    
    // Verify results are identical
    const resultsMatch = currentResult === optimizedResult;
    
    console.log(`  String Concatenation: ${currentTime.toFixed(2)}ms`);
    console.log(`  Array Approach:       ${optimizedTime.toFixed(2)}ms`);
    console.log(`  Improvement:          ${((1 - optimizedTime/currentTime) * 100).toFixed(1)}%`);
    console.log(`  Results Match:        ${resultsMatch ? '✅' : '❌'}`);
    console.log(`  Output Length:        ${currentResult.length} characters\n`);
    
    results.push({
      name,
      size,
      currentTime,
      optimizedTime,
      improvement: (1 - optimizedTime/currentTime) * 100,
      resultsMatch
    });
  }
  
  // Summary
  console.log('📊 Performance Summary:');
  console.log('======================');
  
  let totalImprovement = 0;
  let validTests = 0;
  
  for (const result of results) {
    if (result.resultsMatch) {
      totalImprovement += result.improvement;
      validTests++;
      console.log(`${result.name.padEnd(12)}: ${result.improvement.toFixed(1)}% improvement`);
    } else {
      console.log(`${result.name.padEnd(12)}: ❌ Results don't match`);
    }
  }
  
  if (validTests > 0) {
    const avgImprovement = totalImprovement / validTests;
    console.log('\n🎯 Average Improvement: ' + avgImprovement.toFixed(1) + '%');
  }
  
  console.log('\n💡 Recommendation:');
  if (validTests > 0 && totalImprovement / validTests > 10) {
    console.log('✅ Array-based approach shows significant performance improvement');
    console.log('✅ Consider applying this optimization to parse_ansi.js');
  } else {
    console.log('⚠️  Performance improvement may not justify the complexity');
    console.log('⚠️  Current approach may be sufficient');
  }
  
  console.log('\n📝 Notes:');
  console.log('- This is a simplified simulation of ANSI parsing');
  console.log('- Real-world performance may vary');
  console.log('- Memory usage benefits not measured in this benchmark');
}

// Run the benchmark
runBenchmark().catch(console.error);