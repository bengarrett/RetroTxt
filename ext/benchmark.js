#!/usr/bin/env node

/**
 * RetroTxt Performance Benchmarking Tool
 * 
 * This script runs performance benchmarks on key RetroTxt functionality
 * and generates detailed performance reports.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

async function runBenchmarks() {
  console.log(chalk.blue.bold('⏱️  RetroTxt Performance Benchmarks'));
  console.log(chalk.blue('Measuring performance metrics...\n'));

  const results = {
    timestamp: new Date().toISOString(),
    benchmarks: [],
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`
    }
  };

  try {
    // Benchmark 1: File Loading Performance
    await benchmarkFileLoading(results);

    // Benchmark 2: DOM Manipulation
    await benchmarkDOMManipulation(results);

    // Benchmark 3: Text Processing
    await benchmarkTextProcessing(results);

    // Benchmark 4: Large File Handling
    await benchmarkLargeFiles(results);

    // Benchmark 5: Memory Usage
    await benchmarkMemoryUsage(results);

    // Save results
    saveBenchmarkResults(results);

    // Display summary
    displayBenchmarkSummary(results);

    return true;

  } catch (error) {
    console.error(chalk.red.bold('❌ Benchmarking failed:'), error.message);
    return false;
  }
}

async function benchmarkFileLoading(results) {
  const benchmark = {
    name: 'File Loading Performance',
    description: 'Measure time to load and process various file sizes',
    tests: []
  };

  const fileSizes = [
    {name: 'small', path: 'test/example_files/downloads/plain_text.txt'},
    {name: 'medium', path: 'test/example_files/downloads/large_file.txt'},
    {name: 'large', path: 'test/example_files/downloads/very_large_file.txt'}
  ];

  for (const file of fileSizes) {
    try {
      const startTime = performance.now();
      const content = await fs.promises.readFile(path.join(__dirname, file.path), 'utf8');
      const endTime = performance.now();
      
      benchmark.tests.push({
        file: file.name,
        size: content.length,
        time: endTime - startTime,
        rate: (content.length / (endTime - startTime)).toFixed(2)
      });
    } catch (error) {
      benchmark.tests.push({
        file: file.name,
        error: error.message
      });
    }
  }

  results.benchmarks.push(benchmark);
}

async function benchmarkDOMManipulation(results) {
  const benchmark = {
    name: 'DOM Manipulation Performance',
    description: 'Measure DOM operation performance (skipped in Node.js)',
    tests: []
  };

  // Skip DOM manipulation in Node.js environment
  benchmark.tests.push({
    operation: 'DOM manipulation',
    skipped: true,
    reason: 'Not available in Node.js environment'
  });

  results.benchmarks.push(benchmark);
}

async function benchmarkTextProcessing(results) {
  const benchmark = {
    name: 'Text Processing Performance',
    description: 'Measure text manipulation performance',
    tests: []
  };

  // Load a large text file
  const content = await fs.promises.readFile(
    path.join(__dirname, 'test/example_files/downloads/very_large_file.txt'),
    'utf8'
  );

  // Test 1: String replacement
  const startTime1 = performance.now();
  const replaced = content.replace(/Line/g, 'Benchmark');
  const endTime1 = performance.now();

  // Test 2: String splitting
  const startTime2 = performance.now();
  const lines = content.split('\n');
  const endTime2 = performance.now();

  // Test 3: Regex matching
  const startTime3 = performance.now();
  const matches = content.match(/\d+/g);
  const endTime3 = performance.now();

  benchmark.tests.push({
    operation: 'string replacement',
    time: endTime1 - startTime1,
    size: content.length
  });

  benchmark.tests.push({
    operation: 'string splitting',
    time: endTime2 - startTime2,
    lines: lines.length
  });

  benchmark.tests.push({
    operation: 'regex matching',
    time: endTime3 - startTime3,
    matches: matches ? matches.length : 0
  });

  results.benchmarks.push(benchmark);
}

async function benchmarkLargeFiles(results) {
  const benchmark = {
    name: 'Large File Processing',
    description: 'Measure performance with very large files',
    tests: []
  };

  // Test processing a very large file multiple times
  const content = await fs.promises.readFile(
    path.join(__dirname, 'test/example_files/downloads/very_large_file.txt'),
    'utf8'
  );

  const iterations = 10;
  const startTime = performance.now();

  for (let i = 0; i < iterations; i++) {
    // Simulate processing
    const lines = content.split('\n');
    const processed = lines.map(line => line.trim()).join('\n');
  }

  const endTime = performance.now();
  const totalTime = endTime - startTime;
  const avgTime = totalTime / iterations;

  benchmark.tests.push({
    operation: `${iterations} iterations of large file processing`,
    totalTime,
    avgTime,
    iterations,
    rate: (iterations / totalTime * 1000).toFixed(2)
  });

  results.benchmarks.push(benchmark);
}

async function benchmarkMemoryUsage(results) {
  const benchmark = {
    name: 'Memory Usage',
    description: 'Measure memory consumption',
    tests: []
  };

  // Get initial memory usage
  const initialMemory = process.memoryUsage();

  // Create large data structure
  const largeArray = [];
  for (let i = 0; i < 10000; i++) {
    largeArray.push({
      id: i,
      content: `Item ${i}: ${'x'.repeat(100)}`
    });
  }

  const afterCreation = process.memoryUsage();

  // Clear the array
  largeArray.length = 0;
  
  const afterClear = process.memoryUsage();

  benchmark.tests.push({
    operation: 'create large array',
    heapUsed: formatMemory(afterCreation.heapUsed - initialMemory.heapUsed),
    heapTotal: formatMemory(afterCreation.heapTotal)
  });

  benchmark.tests.push({
    operation: 'clear large array',
    heapUsed: formatMemory(afterClear.heapUsed - afterCreation.heapUsed),
    heapTotal: formatMemory(afterClear.heapTotal)
  });

  results.benchmarks.push(benchmark);
}

function formatMemory(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function saveBenchmarkResults(results) {
  try {
    const reportDir = path.join(__dirname, 'benchmarks');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(reportDir, `benchmark-${timestamp}.json`);

    fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
    
    console.log(chalk.green('Benchmark results saved:'), reportFile);
  } catch (error) {
    console.error(chalk.yellow('Could not save benchmark results:'), error.message);
  }
}

function displayBenchmarkSummary(results) {
  console.log(chalk.blue.bold('\n📊 Benchmark Summary'));
  console.log(chalk.blue('─────────────────────────────────────'));

  results.benchmarks.forEach(benchmark => {
    console.log(chalk`\n{white.bold ${benchmark.name}}`);
    console.log(chalk`{gray ${benchmark.description}}`);
    
    benchmark.tests.forEach(test => {
      if (test.error) {
        console.log(chalk`  {red ❌ ${test.operation}: ${test.error}}`);
      } else if (test.time !== undefined) {
        console.log(chalk`  {green ✓ ${test.operation}: ${test.time.toFixed(2)}ms}`);
        if (test.rate) console.log(chalk`     {gray (${test.rate} ops/sec)}`);
        if (test.size) console.log(chalk`     {gray (${formatMemory(test.size)})}`);
      } else if (test.heapUsed) {
        console.log(chalk`  {green ✓ ${test.operation}: ${test.heapUsed}}`);
      }
    });
  });

  console.log(chalk.blue('\n─────────────────────────────────────'));
  console.log(chalk`{gray Environment:}`);
  console.log(chalk`  {white Node:} {gray ${results.environment.nodeVersion}}`);
  console.log(chalk`  {white Platform:} {gray ${results.environment.platform} (${results.environment.arch})}`);
  console.log(chalk`  {white Memory:} {gray ${results.environment.memory}}`);
  console.log(chalk.green.bold('\n✅ Benchmarking complete!'));
}

// Run the benchmarks
if (typeof document === 'undefined') {
  // Node.js environment
  runBenchmarks().then(process.exit);
} else {
  // Browser environment - not supported for this benchmark
  console.log(chalk.yellow('⚠️  Benchmarking requires Node.js environment'));
}