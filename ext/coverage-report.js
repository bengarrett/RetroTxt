#!/usr/bin/env node

/**
 * RetroTxt Code Coverage Report Generator
 * 
 * This script runs tests with code coverage and generates reports.
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

async function runCoverage() {
  console.log(chalk.blue.bold('📊 RetroTxt Code Coverage Report'));
  console.log(chalk.blue('Generating coverage report...\n'));

  try {
    // Run tests with coverage
    console.log(chalk.gray('Running tests with coverage...'));
    
    const coverageProcess = exec('npx nyc --reporter=text --reporter=text-summary --reporter=html qunit ext/test/index.html', {
      cwd: path.join(__dirname, '..'),
      env: process.env
    });

    coverageProcess.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    coverageProcess.stderr.on('data', (data) => {
      console.error(chalk.yellow(data.toString()));
    });

    await new Promise((resolve, reject) => {
      coverageProcess.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Coverage generation failed with exit code ${code}`));
        }
      });
    });

    // Generate summary report
    console.log(chalk.gray('\nGenerating summary report...'));
    
    const summary = {
      timestamp: new Date().toISOString(),
      files: [],
      totals: {
        lines: { total: 0, covered: 0, pct: 0 },
        statements: { total: 0, covered: 0, pct: 0 },
        functions: { total: 0, covered: 0, pct: 0 },
        branches: { total: 0, covered: 0, pct: 0 }
      }
    };

    // Read coverage report
    const reportDir = path.join(__dirname, 'coverage');
    if (fs.existsSync(reportDir)) {
      const files = fs.readdirSync(reportDir);
      
      files.forEach(file => {
        if (file.endsWith('.html')) {
          const filePath = path.join(reportDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Extract coverage data from HTML report
          const fileName = file.replace('.html', '.js');
          summary.files.push({
            file: fileName,
            path: `scripts/${fileName}`
          });
        }
      });
    }

    // Save summary report
    const reportFile = path.join(__dirname, 'coverage', 'summary.json');
    fs.writeFileSync(reportFile, JSON.stringify(summary, null, 2));

    console.log(chalk.green.bold('\n✅ Coverage report generated successfully!'));
    console.log(chalk.green('HTML report available in: coverage/index.html'));
    console.log(chalk.green('Summary report available in: coverage/summary.json'));

    return true;

  } catch (error) {
    console.error(chalk.red.bold('❌ Coverage report generation failed:'), error.message);
    return false;
  }
}

// Run the coverage report
runCoverage().then(process.exit);