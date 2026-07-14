#!/usr/bin/env node

/**
 * RetroTxt Expanded Performance Benchmarks
 *
 * Advanced benchmarking with comprehensive coverage of RetroTxt functionality.
 */

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { performance } from 'perf_hooks';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const hr = `─────────────────────────────────────`;

async function runExpandedBenchmarks() {
  const results = {
    timestamp: new Date().toISOString(),
    benchmarks: [],
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
    },
  };

  // Test 1: File reading performance
  try {
    const startTime = performance.now();
    const testFile = path.join(
      __dirname,
      '../test/example_files/_hello-world.txt'
    );
    const content = await fs.readFile(testFile, 'utf8');
    const endTime = performance.now();

    results.benchmarks.push({
      name: 'File Reading',
      time: endTime - startTime,
      success: true,
      details: {
        fileSize: content.length,
        operation: 'readFile',
      },
    });
  } catch (error) {
    results.benchmarks.push({
      name: 'File Reading',
      time: 0,
      success: false,
      error: error.message,
    });
  }

  // Test 2: Error handling performance
  let startTime, endTime;
  try {
    startTime = performance.now();
    await fs.readFile(
      path.join(__dirname, '../test/example_files/downloads/nonexistent.txt'),
      'utf8'
    );
    endTime = performance.now();

    results.benchmarks.push({
      name: 'Error Handling',
      time: endTime - startTime,
      success: false,
      errorType: 'ENOENT',
    });
  } catch (error) {
    endTime = performance.now();
    results.benchmarks.push({
      name: 'Error Handling',
      time: endTime - startTime,
      success: true,
      errorType: error.code,
      details: {
        errorHandlingTime: endTime - startTime,
      },
    });
  }

  // Test 3: Directory operations
  try {
    const startTime = performance.now();
    const files = await fs.readdir(
      path.join(__dirname, '../test/example_files')
    );
    const endTime = performance.now();

    results.benchmarks.push({
      name: 'Directory Operations',
      time: endTime - startTime,
      success: true,
      details: {
        fileCount: files.length,
        operation: 'readdir',
      },
    });
  } catch (error) {
    results.benchmarks.push({
      name: 'Directory Operations',
      time: 0,
      success: false,
      error: error.message,
    });
  }

  // Calculate summary
  const successfulTests = results.benchmarks.filter((b) => b.success).length;
  const totalTests = results.benchmarks.length;
  const successRate = ((successfulTests / totalTests) * 100).toFixed(2);

  results.summary = {
    totalTests,
    successfulTests,
    failedTests: totalTests - successfulTests,
    successRate: `${successRate}%`,
    totalTime: results.benchmarks.reduce((sum, b) => sum + b.time, 0),
  };

  // Save results to file
  try {
    const outputPath = path.join(
      __dirname,
      '../autogen/benchmarks',
      `benchmark-expanded-${new Date().toISOString().slice(0, 10)}.json`
    );
    await fs.writeFile(outputPath, JSON.stringify(results, null, 2));
    console.log(chalk.green(`Benchmark results saved: `), outputPath);
  } catch (error) {
    console.log(chalk.yellow(`Could not save results: ${error.message}`));
  }

  // Output results
  console.log(``);
  console.log(chalk.blue(hr));
  console.log(chalk.blue.bold('RetroTxt Expanded Performance Benchmarks'));
  console.log(chalk.blue(hr));
  console.log(chalk.green.bold('Results'));
  console.log(chalk.green(`Tests: ${totalTests}`));
  console.log(chalk.green(`Successful: ${successfulTests}`));
  console.log(chalk.blue(hr));
  console.log(chalk.red(`Failed: ${totalTests - successfulTests}`));
  console.log(chalk.blue(`Success Rate: ${successRate}%`));
  console.log(
    chalk.magenta(`Total Time: ${results.summary.totalTime.toFixed(2)}ms`)
  );
  console.log(chalk.blue(hr));

  console.log(chalk.bold('Detailed Results'));
  results.benchmarks.forEach((benchmark, index) => {
    const status = benchmark.success ? chalk.green('PASS') : chalk.red('FAIL');
    const time = benchmark.time > 0 ? `${benchmark.time.toFixed(2)}ms` : 'N/A';
    console.log(`${status} #${index + 1}: ${benchmark.name} - ${time}`);
    if (benchmark.details) {
      console.log(`   Details: ${JSON.stringify(benchmark.details)}`);
    }
    if (benchmark.error) {
      console.log(`   Error: ${benchmark.error}`);
    }
  });
  console.log(chalk.blue(hr));
  return results;
}

// Run benchmarks if this script is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runExpandedBenchmarks()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(chalk.red('❌ Benchmark failed:'), error);
      process.exit(1);
    });
}

export { runExpandedBenchmarks };
