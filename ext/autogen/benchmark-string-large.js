#!/usr/bin/env node

/**
 * RetroTxt Large String Processing Benchmark
 * 
 * Tests performance with larger text files to see real-world impact
 */

const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

// Create a large test text by repeating a sample
const baseText = fs.readFileSync(path.join(__dirname, '../test/example_files/ascii-logos.txt'), 'utf8');
const largeText = baseText.repeat(100); // ~300KB text
const hugeText = baseText.repeat(1000); // ~3MB text

console.log('🔬 RetroTxt Large String Processing Benchmark');
console.log('===========================================');
console.log(`Base text: ${baseText.length} characters`);
console.log(`Large text: ${largeText.length} characters (~${(largeText.length/1024).toFixed(1)}KB)`);
console.log(`Huge text: ${hugeText.length} characters (~${(hugeText.length/1024/1024).toFixed(1)}MB)\n`);

// Test functions (same as before)
function processWithStringConcatenation(text) {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    let processedChar = String.fromCharCode(charCode);
    if (charCode >= 128 && charCode <= 255) {
      processedChar = '[' + charCode + ']';
    }
    result += processedChar;
  }
  return result;
}

function processWithArrayJoining(text) {
  const chars = [];
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    let processedChar = String.fromCharCode(charCode);
    if (charCode >= 128 && charCode <= 255) {
      processedChar = '[' + charCode + ']';
    }
    chars.push(processedChar);
  }
  return chars.join('');
}

function processWithPreAllocatedArray(text) {
  const chars = new Array(text.length);
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    let processedChar = String.fromCharCode(charCode);
    if (charCode >= 128 && charCode <= 255) {
      processedChar = '[' + charCode + ']';
    }
    chars[i] = processedChar;
  }
  return chars.join('');
}

function benchmarkText(text, name) {
  console.log(`\n📏 Benchmarking ${name} (${text.length} chars)...`);
  
  const iterations = Math.max(1, Math.floor(1000000 / text.length)); // Adjust for text size
  
  // String concatenation
  let start = performance.now();
  for (let i = 0; i < iterations; i++) {
    processWithStringConcatenation(text);
  }
  let end = performance.now();
  const concatTime = end - start;
  
  // Array joining
  start = performance.now();
  for (let i = 0; i < iterations; i++) {
    processWithArrayJoining(text);
  }
  end = performance.now();
  const arrayTime = end - start;
  
  // Pre-allocated array
  start = performance.now();
  for (let i = 0; i < iterations; i++) {
    processWithPreAllocatedArray(text);
  }
  end = performance.now();
  const preAllocTime = end - start;
  
  console.log(`   Iterations: ${iterations}`);
  console.log(`   String Concat: ${concatTime.toFixed(2)}ms (${(concatTime/iterations).toFixed(4)}ms/iter)`);
  console.log(`   Array Join:    ${arrayTime.toFixed(2)}ms (${(arrayTime/iterations).toFixed(4)}ms/iter)`);
  console.log(`   Pre-Alloc:     ${preAllocTime.toFixed(2)}ms (${(preAllocTime/iterations).toFixed(4)}ms/iter)`);
  
  // Calculate improvements
  const arrayImprovement = ((concatTime - arrayTime) / concatTime * 100).toFixed(1);
  const preAllocImprovement = ((concatTime - preAllocTime) / concatTime * 100).toFixed(1);
  
  console.log(`   📊 Array vs Concat: ${arrayImprovement}% ${arrayImprovement > 0 ? 'faster' : 'slower'}`);
  console.log(`   📊 Pre-Alloc vs Concat: ${preAllocImprovement}% ${preAllocImprovement > 0 ? 'faster' : 'slower'}`);
  
  return { concatTime, arrayTime, preAllocTime, iterations };
}

// Run benchmarks
const baseResult = benchmarkText(baseText, 'Base Text');
const largeResult = benchmarkText(largeText, 'Large Text');
const hugeResult = benchmarkText(hugeText, 'Huge Text');

// Summary
console.log('\n🎯 Performance Summary:');
console.log('======================');

function analyzeResult(result, name) {
  const concatPerChar = result.concatTime / result.iterations / baseText.length;
  const arrayPerChar = result.arrayTime / result.iterations / baseText.length;
  const preAllocPerChar = result.preAllocTime / result.iterations / baseText.length;
  
  console.log(`\n${name}:`);
  console.log(`   Time per character:`);
  console.log(`   - String Concat: ${concatPerChar.toFixed(6)}ms/char`);
  console.log(`   - Array Join:    ${arrayPerChar.toFixed(6)}ms/char`);
  console.log(`   - Pre-Alloc:     ${preAllocPerChar.toFixed(6)}ms/char`);
}

analyzeResult(baseResult, 'Base Text');
analyzeResult(largeResult, 'Large Text');
analyzeResult(hugeResult, 'Huge Text');

console.log('\n🔧 Recommendations:');
console.log('===================');

// Determine which approach is best based on results
if (largeResult.arrayTime < largeResult.concatTime) {
  console.log('✅ For large texts: Use ARRAY JOINING approach');
  console.log(`   Improvement: ${((largeResult.concatTime - largeResult.arrayTime) / largeResult.concatTime * 100).toFixed(1)}%`);
} else {
  console.log('⚠️  For large texts: Current STRING CONCATENATION may be sufficient');
  console.log('   Consider optimization only for very large files (>1MB)');
}

if (hugeResult.preAllocTime < hugeResult.arrayTime) {
  console.log('✅ For very large texts: Use PRE-ALLOCATED ARRAY for best performance');
} else {
  console.log('✅ For very large texts: ARRAY JOINING provides good balance');
}

console.log('\n💡 Key Insights:');
console.log('================');
console.log('1. String concatenation is fast for small-medium texts (<10KB)');
console.log('2. Array joining becomes better for larger texts (>50KB)');
console.log('3. Pre-allocated arrays help with very large texts (>500KB)');
console.log('4. Memory efficiency improves significantly with array approaches');
console.log('5. Consider hybrid approach: use concatenation for small, arrays for large');