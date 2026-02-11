#!/usr/bin/env node

/**
 * Realistic ANSI Parsing Performance Benchmark
 * 
 * This script creates a more realistic benchmark that simulates
 * the actual complexity of ANSI parsing with state management.
 */

const { performance } = require('perf_hooks');

console.log('🔍 Realistic ANSI Parsing Performance Benchmark');
console.log('==============================================\n');

// Test different file sizes
const testSizes = [
  { name: 'Small', size: 1000 },
  { name: 'Medium', size: 10000 },
  { name: 'Large', size: 50000 },
  { name: 'Very Large', size: 100000 }
];

// More realistic ANSI parsing simulation with state management
class CurrentAnsiParser {
  constructor() {
    this.html = '';
    this.currentStyle = '';
    this.rowCount = 0;
    this.inEscape = false;
    this.escapeBuffer = '';
  }
  
  parse(text) {
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      if (this.inEscape) {
        this.escapeBuffer += char;
        
        // Check if escape sequence is complete
        if (char === 'm' || char === 'A' || char === 'B' || char === 'C' || char === 'D') {
          this.html += this.processEscapeSequence(this.escapeBuffer);
          this.inEscape = false;
          this.escapeBuffer = '';
        }
      } else if (char === '\u001B') {
        this.inEscape = true;
        this.escapeBuffer = char;
      } else if (char === '\n') {
        this.html += this.endRow();
        this.html += this.startRow();
        this.rowCount++;
      } else {
        this.html += this.styleCharacter(char);
      }
    }
    
    return this.html;
  }
  
  processEscapeSequence(seq) {
    // Simulate ANSI sequence processing
    if (seq.includes('[31m')) return '<span class="red">';
    if (seq.includes('[32m')) return '<span class="green">';
    if (seq.includes('[33m')) return '<span class="yellow">';
    if (seq.includes('[34m')) return '<span class="blue">';
    if (seq.includes('[0m')) return '</span>';
    if (seq.includes('[1m')) return '<span class="bold">';
    if (seq.includes('[4m')) return '<span class="underline">';
    if (seq.includes('[A')) return ''; // Cursor up
    if (seq.includes('[B')) return ''; // Cursor down
    if (seq.includes('[C')) return ''; // Cursor forward
    if (seq.includes('[D')) return ''; // Cursor back
    return seq; // Unknown sequence
  }
  
  startRow() {
    return `<div class="row" id="row-${this.rowCount}">`;
  }
  
  endRow() {
    return '</div>';
  }
  
  styleCharacter(char) {
    if (this.currentStyle) {
      return `<span class="${this.currentStyle}">${char}</span>`;
    }
    return char;
  }
}

// Optimized array-based approach
class OptimizedAnsiParser {
  constructor() {
    this.htmlParts = [];
    this.currentStyle = '';
    this.rowCount = 0;
    this.inEscape = false;
    this.escapeBuffer = '';
  }
  
  parse(text) {
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      if (this.inEscape) {
        this.escapeBuffer += char;
        
        // Check if escape sequence is complete
        if (char === 'm' || char === 'A' || char === 'B' || char === 'C' || char === 'D') {
          this.htmlParts.push(this.processEscapeSequence(this.escapeBuffer));
          this.inEscape = false;
          this.escapeBuffer = '';
        }
      } else if (char === '\u001B') {
        this.inEscape = true;
        this.escapeBuffer = char;
      } else if (char === '\n') {
        this.htmlParts.push(this.endRow());
        this.htmlParts.push(this.startRow());
        this.rowCount++;
      } else {
        this.htmlParts.push(this.styleCharacter(char));
      }
    }
    
    return this.htmlParts.join('');
  }
  
  processEscapeSequence(seq) {
    // Simulate ANSI sequence processing
    if (seq.includes('[31m')) return '<span class="red">';
    if (seq.includes('[32m')) return '<span class="green">';
    if (seq.includes('[33m')) return '<span class="yellow">';
    if (seq.includes('[34m')) return '<span class="blue">';
    if (seq.includes('[0m')) return '</span>';
    if (seq.includes('[1m')) return '<span class="bold">';
    if (seq.includes('[4m')) return '<span class="underline">';
    if (seq.includes('[A')) return ''; // Cursor up
    if (seq.includes('[B')) return ''; // Cursor down
    if (seq.includes('[C')) return ''; // Cursor forward
    if (seq.includes('[D')) return ''; // Cursor back
    return seq; // Unknown sequence
  }
  
  startRow() {
    return `<div class="row" id="row-${this.rowCount}">`;
  }
  
  endRow() {
    return '</div>';
  }
  
  styleCharacter(char) {
    if (this.currentStyle) {
      return `<span class="${this.currentStyle}">${char}</span>`;
    }
    return char;
  }
}

function createRealisticAnsiText(size) {
  // Create more realistic ANSI text with complex sequences
  const sequences = [
    '\u001B[31m', // Red
    '\u001B[32m', // Green
    '\u001B[33m', // Yellow
    '\u001B[34m', // Blue
    '\u001B[1m',  // Bold
    '\u001B[4m',  // Underline
    '\u001B[0m',  // Reset
    '\u001B[31;1m', // Red + Bold
    '\u001B[32;4m', // Green + Underline
    '\u001B[1A',  // Cursor up
    '\u001B[1B',  // Cursor down
    '\u001B[5C',  // Cursor forward 5
    '\u001B[10D', // Cursor back 10
    '\n'          // Newline
  ];
  
  let result = '';
  let pos = 0;
  
  while (result.length < size) {
    // Add text with varying lengths
    const textLength = Math.min(20 + Math.floor(Math.random() * 30), size - result.length);
    result += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.repeat(textLength / 26).substring(0, textLength);
    
    // Add ANSI sequences - more frequently for realism
    if (result.length < size && Math.random() > 0.3) {
      const sequence = sequences[pos % sequences.length];
      result += sequence;
      pos++;
    }
  }
  
  return result;
}

async function runBenchmark() {
  console.log('📊 Benchmarking Realistic ANSI Parsing\n');
  console.log('Comparing current string concatenation vs optimized array approach\n');
  
  const results = [];
  
  for (const { name, size } of testSizes) {
    console.log(`📝 ${name} Text (${size} characters):`);
    
    const testText = createRealisticAnsiText(size);
    
    // Benchmark current approach
    const currentParser = new CurrentAnsiParser();
    const startCurrent = performance.now();
    const currentResult = currentParser.parse(testText);
    const endCurrent = performance.now();
    const currentTime = endCurrent - startCurrent;
    
    // Benchmark optimized approach
    const optimizedParser = new OptimizedAnsiParser();
    const startOptimized = performance.now();
    const optimizedResult = optimizedParser.parse(testText);
    const endOptimized = performance.now();
    const optimizedTime = endOptimized - startOptimized;
    
    // Verify results are identical
    const resultsMatch = currentResult === optimizedResult;
    
    console.log(`  String Concatenation: ${currentTime.toFixed(2)}ms`);
    console.log(`  Array Approach:       ${optimizedTime.toFixed(2)}ms`);
    
    if (currentTime > 0) {
      const improvement = (1 - optimizedTime/currentTime) * 100;
      console.log(`  Improvement:          ${improvement.toFixed(1)}%`);
    } else {
      console.log(`  Improvement:          N/A (too fast)`);
    }
    
    console.log(`  Results Match:        ${resultsMatch ? '✅' : '❌'}`);
    console.log(`  Output Length:        ${currentResult.length} characters`);
    console.log(`  Rows Generated:      ${currentParser.rowCount}\n`);
    
    results.push({
      name,
      size,
      currentTime,
      optimizedTime,
      improvement: currentTime > 0 ? (1 - optimizedTime/currentTime) * 100 : 0,
      resultsMatch,
      rowCount: currentParser.rowCount
    });
  }
  
  // Summary
  console.log('📊 Performance Summary:');
  console.log('======================');
  
  let totalImprovement = 0;
  let validTests = 0;
  let totalRows = 0;
  
  for (const result of results) {
    if (result.resultsMatch && result.currentTime > 0) {
      totalImprovement += result.improvement;
      validTests++;
      totalRows += result.rowCount;
      console.log(`${result.name.padEnd(12)}: ${result.improvement.toFixed(1)}% improvement (${result.rowCount} rows)`);
    } else {
      console.log(`${result.name.padEnd(12)}: ❌ Invalid test`);
    }
  }
  
  if (validTests > 0) {
    const avgImprovement = totalImprovement / validTests;
    console.log('\n🎯 Average Improvement: ' + avgImprovement.toFixed(1) + '%');
    console.log(`📊 Average Rows/Test: ${(totalRows / validTests).toFixed(1)}`);
  }
  
  console.log('\n💡 Analysis:');
  if (validTests > 0) {
    const avgImprovement = totalImprovement / validTests;
    
    if (avgImprovement > 15) {
      console.log('✅ Array-based approach shows significant performance improvement');
      console.log('✅ Recommend applying this optimization to parse_ansi.js');
    } else if (avgImprovement > 5) {
      console.log('🟡 Array-based approach shows moderate improvement');
      console.log('🟡 Consider optimization for very large files');
    } else if (avgImprovement > -5) {
      console.log('🟢 Performance is comparable');
      console.log('🟢 Optimization may provide memory benefits without performance cost');
    } else {
      console.log('⚠️  Array-based approach is slower in this test');
      console.log('⚠️  Current string concatenation may be optimal');
    }
  }
  
  console.log('\n📝 Key Insights:');
  console.log('- Modern JS engines optimize string concatenation well');
  console.log('- Array approach may still provide memory benefits');
  console.log('- Real-world performance depends on actual ANSI complexity');
  console.log('- Memory usage and garbage collection not measured here');
  console.log('\n🔬 Recommendation: Test with actual parse_ansi.js code for definitive results');
}

// Run the benchmark
runBenchmark().catch(console.error);