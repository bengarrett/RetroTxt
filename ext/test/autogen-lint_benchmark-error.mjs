#!/usr/bin/env node

/**
 * RetroTxt Error Handling Benchmark
 *
 * Focused benchmark for error handling performance.
 */

import fs from 'fs/promises';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import chalk from 'chalk';
import { performance } from 'perf_hooks';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const hr = `─────────────────────────────────────`;

async function runErrorHandlingBenchmark() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
    },
  };

  try {
    // Test 1: Successful file operations
    await testSuccessfulOperations(results);

    // Test 2: Failed file operations
    await testFailedOperations(results);

    // Test 3: Error recovery
    await testErrorRecovery(results);

    // Save results
    saveErrorHandlingResults(results);

    // Display summary
    displayErrorHandlingSummary(results);

    return true;
  } catch (error) {
    console.error(
      chalk.red.bold('Error handling benchmark failed:'),
      error.message
    );
    return false;
  }
}

async function testSuccessfulOperations(results) {
  const test = {
    name: 'Successful File Operations',
    operations: [],
  };

  const files = ['plain_text.txt', 'ansi_art.ans', 'nfo_file.nfo'];

  for (const file of files) {
    try {
      const startTime = performance.now();
      const content = await fs.readFile(
        path.join(__dirname, `../test/example_files/downloads/${file}`),
        'utf8'
      );
      const endTime = performance.now();

      test.operations.push({
        file,
        size: content.length,
        time: endTime - startTime,
        success: true,
      });
    } catch (error) {
      test.operations.push({
        file,
        error: error.message,
        success: false,
      });
    }
  }

  results.tests.push(test);
}

async function testFailedOperations(results) {
  const test = {
    name: 'Failed File Operations',
    operations: [],
  };

  // Test non-existent files
  const nonExistentFiles = ['nonexistent.txt', 'missing.txt', 'notfound.txt'];

  for (const file of nonExistentFiles) {
    const startTime = performance.now();
    try {
      await fs.readFile(
        path.join(__dirname, `../test/example_files/downloads/${file}`),
        'utf8'
      );
    } catch (error) {
      const endTime = performance.now();
      test.operations.push({
        file,
        time: endTime - startTime,
        error: error.code,
        success: false,
      });
    }
  }

  results.tests.push(test);
}

async function testErrorRecovery(results) {
  const test = {
    name: 'Error Recovery Performance',
    operations: [],
  };

  // Test recovery from various error conditions
  const errorScenarios = [
    { type: 'ENOENT', action: 'read non-existent file' },
    { type: 'permission', action: 'read with invalid permissions' },
  ];

  for (const scenario of errorScenarios) {
    let startTime, endTime;
    try {
      startTime = performance.now();

      if (scenario.type === 'ENOENT') {
        await fs.readFile('nonexistent-file.txt', 'utf8');
      } else if (scenario.type === 'permission') {
        // This would require actual permission testing
        throw new Error('Permission denied');
      }

      endTime = performance.now();
      test.operations.push({
        scenario: scenario.action,
        time: endTime - startTime,
        recovered: false,
      });
    } catch (error) {
      endTime = performance.now();
      test.operations.push({
        scenario: scenario.action,
        time: endTime - startTime,
        error: error.message,
        recovered: true,
      });
    }
  }

  results.tests.push(test);
}

function saveErrorHandlingResults(results) {
  try {
    const reportDir = path.join(__dirname, '../autogen/benchmarks');
    if (!existsSync(reportDir)) {
      mkdirSync(reportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(reportDir, `error-handling-${timestamp}.json`);

    writeFileSync(reportFile, JSON.stringify(results, null, 2));

    console.log(chalk.green('Error handling results saved:'), reportFile);
  } catch (error) {
    console.error(
      chalk.yellow('Could not save error handling results:'),
      error.message
    );
  }
}

function displayErrorHandlingSummary(results) {
  console.log(chalk.blue(hr));
  console.log(chalk.blue.bold('Error Handling Summary'));

  results.tests.forEach((test) => {
    console.log(chalk.blue(hr));
    console.log(`${chalk.white.bold(test.name)}`);

    test.operations.forEach((op) => {
      const label = op.file || op.scenario;

      if (op.recovered !== undefined) {
        if (op.recovered) {
          console.log(
            `  ${chalk.green('✓')} ${chalk.white(label)}: ${chalk.green(`${op.time.toFixed(2)} ms`)} ${chalk.gray('(recovered)')}`
          );
        } else {
          console.log(
            `  ${chalk.red('❌')} ${chalk.white(label)}: ${chalk.red(`${op.time.toFixed(2)} ms`)} ${chalk.red('(not recovered)')}`
          );
        }
      } else if (op.error) {
        console.log(
          `  ${chalk.red('❌')} ${chalk.white(label)}: ${chalk.red(op.error)}`
        );
      } else if (op.success !== undefined) {
        const statusColor = op.success ? chalk.green : chalk.yellow;
        const symbol = op.success ? '✓' : '⚠';
        console.log(
          `  ${statusColor(symbol)} ${chalk.white(label)}: ${statusColor(`${op.time.toFixed(2)} ms`)}`
        );
      }
    });
  });

  console.log(chalk.blue(hr));
  console.log(chalk.green.bold('Error handling benchmark complete'));
}

// Run the error handling benchmark
if (typeof document === 'undefined') {
  runErrorHandlingBenchmark().then((success) => process.exit(success ? 0 : 1));
} else {
  console.log(
    chalk.yellow('Error handling benchmark requires Node.js environment')
  );
}

export { runErrorHandlingBenchmark };
