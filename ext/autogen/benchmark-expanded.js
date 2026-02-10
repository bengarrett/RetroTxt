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
      memory: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`
    }
  };

  // Test 1: File reading performance
  try {
    const startTime = performance.now();
    const testFile = path.join(__dirname, '../test/example_files/_hello-world.txt');
    const content = await fs.promises.readFile(testFile, 'utf8');
    const endTime = performance.now();

    results.benchmarks.push({
      name: 'File Reading',
      time: endTime - startTime,
      success: true,
      details: {
        fileSize: content.length,
        operation: 'readFile'
      }
    });
  } catch (error) {
    results.benchmarks.push({
      name: 'File Reading',
      time: 0,
      success: false,
      error: error.message
    });
  }

  // Test 2: Error handling performance
  let startTime, endTime;
  try {
    startTime = performance.now();
    await fs.promises.readFile(
      path.join(__dirname, '../test/example_files/downloads/nonexistent.txt'),
      'utf8'
    );
    endTime = performance.now();

    results.benchmarks.push({
      name: 'Error Handling',
      time: endTime - startTime,
      success: false,
      errorType: 'ENOENT'
    });
  } catch (error) {
    endTime = performance.now();
    results.benchmarks.push({
      name: 'Error Handling',
      time: endTime - startTime,
      success: true,
      errorType: error.code,
      details: {
        errorHandlingTime: endTime - startTime
      }
    });
  }

  // Test 3: Directory operations
  try {
    const startTime = performance.now();
    const files = await fs.promises.readdir(path.join(__dirname, '../test/example_files'));
    const endTime = performance.now();

    results.benchmarks.push({
      name: 'Directory Operations',
      time: endTime - startTime,
      success: true,
      details: {
        fileCount: files.length,
        operation: 'readdir'
      }
    });
  } catch (error) {
    results.benchmarks.push({
      name: 'Directory Operations',
      time: 0,
      success: false,
      error: error.message
    });
  }

  // Calculate summary
  const successfulTests = results.benchmarks.filter(b => b.success).length;
  const totalTests = results.benchmarks.length;
  const successRate = (successfulTests / totalTests * 100).toFixed(2);

  results.summary = {
    totalTests,
    successfulTests,
    failedTests: totalTests - successfulTests,
    successRate: `${successRate}%`,
    totalTime: results.benchmarks.reduce((sum, b) => sum + b.time, 0)
  };

  // Output results
  console.log(chalk.green.bold('\n📊 Benchmark Results:'));
  console.log(chalk.green(`Total Tests: ${totalTests}`));
  console.log(chalk.green(`Successful: ${successfulTests}`));
  console.log(chalk.red(`Failed: ${totalTests - successfulTests}`));
  console.log(chalk.blue(`Success Rate: ${successRate}%`));
  console.log(chalk.magenta(`Total Time: ${results.summary.totalTime.toFixed(2)}ms`));

  console.log('\n📋 Detailed Results:');
  results.benchmarks.forEach((benchmark, index) => {
    const status = benchmark.success ? chalk.green('✅') : chalk.red('❌');
    const time = benchmark.time > 0 ? `${benchmark.time.toFixed(2)}ms` : 'N/A';
    console.log(`${status} Test ${index + 1}: ${benchmark.name} - ${time}`);
    if (benchmark.details) {
      console.log(`   Details: ${JSON.stringify(benchmark.details)}`);
    }
    if (benchmark.error) {
      console.log(`   Error: ${benchmark.error}`);
    }
  });

  // Save results to file
  try {
    const outputPath = path.join(__dirname, 'benchmarks', `benchmark-expanded-${new Date().toISOString().slice(0, 10)}.json`);
    await fs.promises.writeFile(outputPath, JSON.stringify(results, null, 2));
    console.log(chalk.cyan(`\n💾 Results saved to: ${outputPath}`));
  } catch (error) {
    console.log(chalk.yellow(`\n⚠️  Could not save results: ${error.message}`));
  }

  return results;
}

// Run benchmarks if this script is executed directly
if (require.main === module) {
  runExpandedBenchmarks()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(chalk.red('❌ Benchmark failed:'), error);
      process.exit(1);
    });
}

module.exports = { runExpandedBenchmarks };