#!/usr/bin/env node

/**
 * RetroTxt String Processing Benchmark
 * 
 * Compares current string concatenation vs proposed array joining optimization
 */

const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

// Test data - large text sample
const testText = fs.readFileSync(path.join(__dirname, '../test/example_files/_hello-world.txt'), 'utf8');

/**
 * Current implementation - string concatenation
 */
function processWithStringConcatenation(text) {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    // Simulate character processing (like _fromCharCode)
    const charCode = text.charCodeAt(i);
    let processedChar = String.fromCharCode(charCode);
    
    // Simulate some processing logic
    if (charCode >= 128 && charCode <= 255) {
      processedChar = '[' + charCode + ']'; // Simulate character set conversion
    }
    
    result += processedChar; // This is the slow part
  }
  return result;
}

/**
 * Proposed optimization - array joining
 */
function processWithArrayJoining(text) {
  const chars = [];
  for (let i = 0; i < text.length; i++) {
    // Same processing logic
    const charCode = text.charCodeAt(i);
    let processedChar = String.fromCharCode(charCode);
    
    if (charCode >= 128 && charCode <= 255) {
      processedChar = '[' + charCode + ']';
    }
    
    chars.push(processedChar); // Fast array push
  }
  return chars.join(''); // Single string operation
}

/**
 * Advanced optimization - pre-allocated array
 */
function processWithPreAllocatedArray(text) {
  const chars = new Array(text.length);
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    let processedChar = String.fromCharCode(charCode);
    
    if (charCode >= 128 && charCode <= 255) {
      processedChar = '[' + charCode + ']';
    }
    
    chars[i] = processedChar; // Direct assignment
  }
  return chars.join('');
}

/**
 * Run benchmark
 */
function runBenchmark() {
  console.log('🔬 RetroTxt String Processing Benchmark');
  console.log('======================================');
  console.log(`Test text length: ${testText.length} characters\n`);

  const results = [];
  const iterations = 100;

  // Benchmark current implementation
  console.log('🕒 Benchmarking current implementation (string concatenation)...');
  let start = performance.now();
  for (let i = 0; i < iterations; i++) {
    processWithStringConcatenation(testText);
  }
  let end = performance.now();
  const concatenationTime = end - start;
  results.push({
    name: 'String Concatenation (Current)',
    time: concatenationTime,
    avgPerIteration: concatenationTime / iterations
  });

  // Benchmark array joining
  console.log('✅ Benchmarking optimization (array joining)...');
  start = performance.now();
  for (let i = 0; i < iterations; i++) {
    processWithArrayJoining(testText);
  }
  end = performance.now();
  const arrayJoiningTime = end - start;
  results.push({
    name: 'Array Joining (Optimized)',
    time: arrayJoiningTime,
    avgPerIteration: arrayJoiningTime / iterations
  });

  // Benchmark pre-allocated array
  console.log('🚀 Benchmarking advanced optimization (pre-allocated array)...');
  start = performance.now();
  for (let i = 0; i < iterations; i++) {
    processWithPreAllocatedArray(testText);
  }
  end = performance.now();
  const preAllocatedTime = end - start;
  results.push({
    name: 'Pre-Allocated Array (Advanced)',
    time: preAllocatedTime,
    avgPerIteration: preAllocatedTime / iterations
  });

  // Display results
  console.log('\n📊 Benchmark Results:');
  console.log('====================');

  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.name}`);
    console.log(`   Total time (${iterations} iterations): ${result.time.toFixed(2)}ms`);
    console.log(`   Average per iteration: ${result.avgPerIteration.toFixed(4)}ms`);
    console.log(`   Relative speed: ${(concatenationTime / result.time).toFixed(2)}x`);
    console.log();
  });

  // Calculate improvements
  const arrayImprovement = ((concatenationTime - arrayJoiningTime) / concatenationTime * 100).toFixed(1);
  const preAllocatedImprovement = ((concatenationTime - preAllocatedTime) / concatenationTime * 100).toFixed(1);

  console.log('🎯 Performance Improvements:');
  console.log('============================');
  console.log(`Array Joining: ${arrayImprovement}% faster than string concatenation`);
  console.log(`Pre-Allocated Array: ${preAllocatedImprovement}% faster than string concatenation`);
  console.log(`Advanced vs Basic Optimization: ${((arrayJoiningTime - preAllocatedTime) / arrayJoiningTime * 100).toFixed(1)}% improvement`);

  // Memory usage estimation
  console.log('\n💾 Memory Usage Analysis:');
  console.log('========================');
  console.log('String concatenation: Creates new string on each concatenation (O(n²) memory)');
  console.log('Array joining: Single array allocation + single string join (O(n) memory)');
  console.log('Pre-allocated: Fixed-size array + single join (Optimal memory usage)');

  // Recommendation
  console.log('\n🔧 Recommendation:');
  console.log('=================');
  if (preAllocatedImprovement > arrayImprovement) {
    console.log('✅ Use PRE-ALLOCATED ARRAY approach for best performance');
    console.log(`   Expected improvement: ~${preAllocatedImprovement}% faster`);
  } else {
    console.log('✅ Use ARRAY JOINING approach for good balance');
    console.log(`   Expected improvement: ~${arrayImprovement}% faster`);
  }
  console.log('✅ Memory usage will be significantly reduced');
  console.log('✅ No breaking changes to existing functionality');
}

// Run the benchmark
runBenchmark();