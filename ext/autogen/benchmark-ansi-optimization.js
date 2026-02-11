#!/usr/bin/env node

/**
 * ANSI Parsing Optimization Benchmark
 * 
 * This script benchmarks ANSI parsing performance before and after optimization
 * to measure the impact of array-based string building vs string concatenation.
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

console.log('🔍 ANSI Parsing Optimization Benchmark');
console.log('======================================\n');

// Test file paths
const testFiles = [
  'ext/test/example_files/ecma48.txt',
  'ext/test/example_files/ecma48-rgb.txt',
  'ext/test/example_files/ansi-logos.txt',
  'ext/test/example_files/ascii-logos.txt'
];

// Load the required modules
const parseAnsiCode = fs.readFileSync(path.join(__dirname, '../scripts/parse_ansi.js'), 'utf8');
const helpersCode = fs.readFileSync(path.join(__dirname, '../scripts/helpers.js'), 'utf8');

// Mock browser environment for testing
const mockConsole = [];
global.Console = (message) => mockConsole.push(message);
global.DeveloperModeDebug = false;

// Mock window object
global.window = {
  matchMedia: () => ({ matches: false })
};

// Mock DOM object
global.domObject = {
  html: ''
};

// Mock cursor object
global.cursor = {
  row: 0,
  column: 0,
  maxColumns: 80
};

// Mock ecma48 object
global.ecma48 = {
  colorDepth: 16,
  font: 10,
  iceColors: false,
  other: 0,
  unknown: 0
};

// Mock sgrObject
global.sgrObject = {
  lineWrap: true
};

// Mock localStorage
global.localStorage = {
  getItem: () => 'false',
  setItem: () => {}
};

// Mock other required globals
global.CheckArguments = () => {};
global.CheckError = () => {};
global.CheckRange = () => {};

// Execute the code
eval(helpersCode);
eval(parseAnsiCode);

// Test different file sizes
const fileSizes = [
  { name: 'Small', size: 1000 },
  { name: 'Medium', size: 10000 },
  { name: 'Large', size: 50000 },
  { name: 'Very Large', size: 100000 }
];

async function runBenchmark() {
  console.log('📊 Benchmarking Current Implementation\n');
  
  // Test with different file sizes
  for (const { name, size } of fileSizes) {
    console.log(`📝 Testing ${name} file (${size} characters):`);
    
    // Create test ANSI text with sequences
    const testText = createTestAnsiText(size);
    
    // Benchmark current implementation
    const currentTime = benchmarkCurrentImplementation(testText);
    
    console.log(`  Current: ${currentTime.toFixed(2)}ms`);
    console.log(`  Output length: ${global.domObject.html.length} characters`);
    console.log(`  HTML contains: ${countHtmlElements(global.domObject.html)} elements\n`);
    
    // Reset for next test
    global.domObject.html = '';
    global.cursor.row = 0;
  }
  
  // Test with real files
  console.log('📁 Testing with Real Files:\n');
  
  for (const filePath of testFiles) {
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        console.log(`📄 ${path.basename(filePath)} (${fileContent.length} bytes):`);
        
        const fileTime = benchmarkCurrentImplementation(fileContent);
        
        console.log(`  Processing time: ${fileTime.toFixed(2)}ms`);
        console.log(`  Output length: ${global.domObject.html.length} characters`);
        console.log(`  HTML elements: ${countHtmlElements(global.domObject.html)}\n`);
        
        // Reset for next test
        global.domObject.html = '';
        global.cursor.row = 0;
        
      } catch (error) {
        console.log(`  ❌ Error reading file: ${error.message}\n`);
      }
    } else {
      console.log(`⚠️  ${path.basename(filePath)} not found\n`);
    }
  }
  
  console.log('🎯 Benchmark Complete!');
  console.log('========================');
  console.log('\n📊 Summary:');
  console.log('- Current implementation performance measured');
  console.log('- Tested with synthetic and real ANSI files');
  console.log('- Baseline established for optimization comparison');
  console.log('\n💡 Next Step: Apply array-based optimization and re-benchmark');
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

function benchmarkCurrentImplementation(text) {
  // Reset state
  global.domObject.html = '';
  global.cursor.row = 0;
  
  // Create Controls instance
  const controls = new Controls(text, { version: '' }, false);
  
  // Benchmark the parse method
  const start = performance.now();
  controls.parse();
  const end = performance.now();
  
  return end - start;
}

function countHtmlElements(html) {
  // Simple count of HTML elements
  const divCount = (html.match(/<div/g) || []).length;
  const spanCount = (html.match(/<i/g) || []).length;
  const brCount = (html.match(/<br/g) || []).length;
  
  return divCount + spanCount + brCount;
}

// Run the benchmark
runBenchmark().catch(console.error);