#!/usr/bin/env node

/**
 * RetroTxt Expanded Performance Benchmarks
 * 
 * Advanced benchmarking with comprehensive coverage of RetroTxt functionality.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

async function runExpandedBenchmarks() {
  console.log(chalk.blue.bold('🚀 RetroTxt Expanded Performance Benchmarks'));
  console.log(chalk.blue('Running comprehensive performance tests...\n'));

  const results = {
    timestamp: new Date().toISOString(),
    benchmarks: [],
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cpus: require('os').cpus().length,
      memory: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`
    }
  };

  try {
    // Benchmark 1: File Type Processing
    await benchmarkFileTypeProcessing(results);

    // Benchmark 2: Batch Processing
    await benchmarkBatchProcessing(results);

    // Benchmark 3: Concurrent Operations
    await benchmarkConcurrentOperations(results);

    // Benchmark 4: Error Handling Performance
    await benchmarkErrorHandling(results);

    // Benchmark 5: Startup Performance
    await benchmarkStartupPerformance(results);

    // Benchmark 6: Memory Intensive Operations
    await benchmarkMemoryIntensive(results);

    // Save results
    saveExpandedBenchmarkResults(results);

    // Display summary
    displayExpandedBenchmarkSummary(results);

    return true;

  } catch (error) {
    console.error(chalk.red.bold('❌ Expanded benchmarking failed:'), error.message);
    return false;
  }
}

async function benchmarkFileTypeProcessing(results) {
  const benchmark = {
    name: 'File Type Processing Performance',
    description: 'Measure performance across different file formats',
    tests: []
  };

  const fileTypes = [
    {name: 'plain', path: 'test/example_files/downloads/plain_text.txt', type: 'text/plain'},
    {name: 'ansi', path: 'test/example_files/downloads/ansi_art.ans', type: 'text/plain'},
    {name: 'nfo', path: 'test/example_files/downloads/nfo_file.nfo', type: 'text/plain'},
    {name: 'diz', path: 'test/example_files/downloads/diz_file.diz', type: 'text/plain'},
    {name: 'ascii', path: 'test/example_files/downloads/ascii_art.txt', type: 'text/plain'},
    {name: 'unicode', path: 'test/example_files/downloads/unicode_test.txt', type: 'text/plain'}
  ];

  for (const file of fileTypes) {
    try {
      const startTime = performance.now();
      const content = await fs.promises.readFile(path.join(__dirname, file.path), 'utf8');
      
      // Simulate processing
      const lines = content.split('\n');
      const processed = lines.map(line => line.trim()).filter(line => line.length > 0);
      
      const endTime = performance.now();
      
      benchmark.tests.push({
        file: file.name,
        size: content.length,
        lines: lines.length,
        processedLines: processed.length,
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

async function benchmarkBatchProcessing(results) {
  const benchmark = {
    name: 'Batch Processing Performance',
    description: 'Measure performance with multiple files',
    tests: []
  };

  const batchSizes = [5, 10, 20];

  for (const size of batchSizes) {
    try {
      const files = [
        'plain_text.txt',
        'ansi_art.ans',
        'nfo_file.nfo',
        'diz_file.diz',
        'ascii_art.txt',
        'unicode_test.txt'
      ].slice(0, size);

      const startTime = performance.now();

      const promises = files.map(file => 
        fs.promises.readFile(path.join(__dirname, `test/example_files/downloads/${file}`), 'utf8')
      );

      const contents = await Promise.all(promises);
      
      // Process all files
      contents.forEach(content => {
        const lines = content.split('\n');
        lines.forEach(line => line.trim());
      });

      const endTime = performance.now();

      benchmark.tests.push({
        batchSize: size,
        totalTime: endTime - startTime,
        avgTime: (endTime - startTime) / size,
        throughput: (size / (endTime - startTime) * 1000).toFixed(2)
      });
    } catch (error) {
      benchmark.tests.push({
        batchSize: size,
        error: error.message
      });
    }
  }

  results.benchmarks.push(benchmark);
}

async function benchmarkConcurrentOperations(results) {
  const benchmark = {
    name: 'Concurrent Operations Performance',
    description: 'Measure performance with concurrent file operations',
    tests: []
  };

  const concurrentLevels = [2, 5, 10];

  for (const level of concurrentLevels) {
    try {
      const startTime = performance.now();

      const promises = [];
      for (let i = 0; i < level; i++) {
        promises.push(
          fs.promises.readFile(path.join(__dirname, 'test/example_files/downloads/large_file.txt'), 'utf8')
        );
      }

      const contents = await Promise.all(promises);

      // Process all contents
      contents.forEach(content => {
        const lines = content.split('\n');
        lines.forEach(line => line.trim());
      });

      const endTime = performance.now();

      benchmark.tests.push({
        concurrency: level,
        totalTime: endTime - startTime,
        avgTime: (endTime - startTime) / level,
        throughput: (level / (endTime - startTime) * 1000).toFixed(2)
      });
    } catch (error) {
      benchmark.tests.push({
        concurrency: level,
        error: error.message
      });
    }
  }

  results.benchmarks.push(benchmark);
}

async function benchmarkErrorHandling(results) {
  const benchmark = {
    name: 'Error Handling Performance',
    description: 'Measure performance with error scenarios',
    tests: []
  };

  // Test 1: Valid file operations
  try {
    const startTime = performance.now();
    const content = await fs.promises.readFile(
      path.join(__dirname, 'test/example_files/downloads/plain_text.txt'),
      'utf8'
    );
    const endTime = performance.now();

    benchmark.tests.push({
      scenario: 'valid file operation',
      time: endTime - startTime,
      success: true
    });
  } catch (error) {
    benchmark.tests.push({
      scenario: 'valid file operation',
      error: error.message
    });
  }

  // Test 2: Invalid file operations
  try {
    const startTime = performance.now();
    await fs.promises.readFile(
      path.join(__dirname, 'test/example_files/downloads/nonexistent.txt'),
      'utf8'
    );
    const endTime = performance.now();

    benchmark.tests.push({
      scenario: 'invalid file operation',
      time: endTime - startTime,
      success: false
    });
  } catch (error) {
    const endTime = performance.now();
    benchmark.tests.push({
      scenario: 'invalid file operation',
      time: endTime - startTime,
      success: false,
      errorType: error.code
    });
  }
=======
  // Test 2: Invalid file operations
  try {
    const startTime = performance.now();
    await fs.promises.readFile(
      path.join(__dirname, 'test/example_files/downloads/nonexistent.txt'),
      'utf8'
    );
    const endTime = performance.now();

    benchmark.tests.push({
      scenario: 'invalid file operation',
      time: endTime - startTime,
      success: false
    });
  } catch (error) {
    const endTime = performance.now();
    benchmark.tests.push({
      scenario: 'invalid file operation',
      time: endTime - startTime,
      success: false,
      errorType: error.code
    });
  }

  results.benchmarks.push(benchmark);
}

async function benchmarkStartupPerformance(results) {
  const benchmark = {
    name: 'Startup Performance',
    description: 'Measure initialization and startup performance',
    tests: []
  };

  // Test 1: Module loading
  try {
    const startTime = performance.now();
    
    // Simulate module loading
    const modules = [
      'fs', 'path', 'chalk', 'performance'
    ].map(require);

    const endTime = performance.now();

    benchmark.tests.push({
      operation: 'module loading',
      modules: modules.length,
      time: endTime - startTime
    });
  } catch (error) {
    benchmark.tests.push({
      operation: 'module loading',
      error: error.message
    });
  }

  // Test 2: Configuration loading
  try {
    const startTime = performance.now();
    
    // Simulate configuration loading
    const configFiles = [
      '.nycrc',
      'coverage-summary.js',
      'benchmark.js'
    ].map(file => {
      const fullPath = path.join(__dirname, file);
      if (fs.existsSync(fullPath)) {
        return fs.readFileSync(fullPath, 'utf8');
      }
      return null;
    });

    const endTime = performance.now();

    benchmark.tests.push({
      operation: 'configuration loading',
      files: configFiles.filter(c => c !== null).length,
      time: endTime - startTime
    });
  } catch (error) {
    benchmark.tests.push({
      operation: 'configuration loading',
      error: error.message
    });
  }

  results.benchmarks.push(benchmark);
}

async function benchmarkMemoryIntensive(results) {
  const benchmark = {
    name: 'Memory Intensive Operations',
    description: 'Measure performance with memory-heavy operations',
    tests: []
  };

  // Test 1: Large array creation
  try {
    const startTime = performance.now();
    const largeArray = Array(100000).fill({ data: 'x'.repeat(100) });
    const endTime = performance.now();

    benchmark.tests.push({
      operation: 'large array creation',
      size: largeArray.length,
      time: endTime - startTime,
      memory: formatMemory(process.memoryUsage().heapUsed)
    });
  } catch (error) {
    benchmark.tests.push({
      operation: 'large array creation',
      error: error.message
    });
  }

  // Test 2: Large string manipulation
  try {
    const startTime = performance.now();
    let largeString = 'x'.repeat(1000000);
    for (let i = 0; i < 10; i++) {
      largeString += 'y'.repeat(100000);
    }
    const endTime = performance.now();

    benchmark.tests.push({
      operation: 'large string manipulation',
      size: largeString.length,
      time: endTime - startTime
    });
  } catch (error) {
    benchmark.tests.push({
      operation: 'large string manipulation',
      error: error.message
    });
  }

  results.benchmarks.push(benchmark);
}

function formatMemory(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function saveExpandedBenchmarkResults(results) {
  try {
    const reportDir = path.join(__dirname, 'benchmarks');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(reportDir, `benchmark-expanded-${timestamp}.json`);

    fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
    
    console.log(chalk.green('Expanded benchmark results saved:'), reportFile);
  } catch (error) {
    console.error(chalk.yellow('Could not save expanded benchmark results:'), error.message);
  }
}

function displayExpandedBenchmarkSummary(results) {
  console.log(chalk.blue.bold('\n📊 Expanded Benchmark Summary'));
  console.log(chalk.blue('─────────────────────────────────────'));

  results.benchmarks.forEach(benchmark => {
    console.log(chalk`\n{white.bold ${benchmark.name}}`);
    console.log(chalk`{gray ${benchmark.description}}`);
    
    benchmark.tests.forEach(test => {
      if (test.error) {
        console.log(chalk`  {red ❌ ${test.operation || test.file || test.scenario}: ${test.error}}`);
      } else if (test.time !== undefined) {
        console.log(chalk`  {green ✓ ${test.operation || test.file || test.scenario}: ${test.time.toFixed(2)}ms}`);
        if (test.rate) console.log(chalk`     {gray (${test.rate} ops/sec)}`);
        if (test.size) console.log(chalk`     {gray (${formatMemory(test.size)})}`);
        if (test.throughput) console.log(chalk`     {gray (${test.throughput} ops/sec)}`);
      } else if (test.heapUsed) {
        console.log(chalk`  {green ✓ ${test.operation}: ${test.heapUsed}}`);
      }
    });
  });

  console.log(chalk.blue('\n─────────────────────────────────────'));
  console.log(chalk`{gray Environment:}`);
  console.log(chalk`  {white Node:} {gray ${results.environment.nodeVersion}}`);
  console.log(chalk`  {white Platform:} {gray ${results.environment.platform} (${results.environment.arch})}`);
  console.log(chalk`  {white CPUs:} {gray ${results.environment.cpus}}`);
  console.log(chalk`  {white Memory:} {gray ${results.environment.memory}}`);
  console.log(chalk.green.bold('\n✅ Expanded benchmarking complete!'));
}

// Run the expanded benchmarks
if (typeof document === 'undefined') {
  // Node.js environment
  runExpandedBenchmarks().then(process.exit);
} else {
  // Browser environment - not supported
  console.log(chalk.yellow('⚠️  Expanded benchmarking requires Node.js environment'));
}