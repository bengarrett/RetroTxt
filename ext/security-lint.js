#!/usr/bin/env node

/**
 * RetroTxt Security Linting Script
 * 
 * This script runs ESLint with security plugins to detect potential
 * security vulnerabilities in the RetroTxt extension codebase.
 */

const { ESLint } = require('eslint');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

async function runSecurityLinting() {
  console.log(chalk.blue.bold('🔒 RetroTxt Security Linting'));
  console.log(chalk.blue('Scanning for potential security vulnerabilities...\n'));

  try {
    // Create ESLint instance with security configuration
    const eslint = new ESLint({
      cwd: __dirname,
      overrideConfig: require('./.eslintrc-security.js'),
      fix: false,
      cache: true,
      cacheLocation: path.join(__dirname, '.eslintcache-security')
    });

    // Define files to lint
    const filesToLint = [
      'scripts/**/*.js',
      'scripts/sw/**/*.js'
    ];

    console.log(chalk.gray(`Scanning files: ${filesToLint.join(', ')}\n`));

    // Run linting
    const results = await eslint.lintFiles(filesToLint);

    // Generate report
    const report = {
      totalFiles: results.length,
      filesWithIssues: 0,
      errorCount: 0,
      warningCount: 0,
      securityIssues: [],
      startTime: new Date()
    };

    // Process results
    results.forEach(result => {
      if (result.errorCount > 0 || result.warningCount > 0) {
        report.filesWithIssues++;
        report.errorCount += result.errorCount;
        report.warningCount += result.warningCount;

        result.messages.forEach(message => {
          // Filter for security-related issues
          if (message.ruleId.startsWith('security/') || 
              message.ruleId.startsWith('no-unsanitized/') ||
              message.ruleId.startsWith('xss/') ||
              message.ruleId.startsWith('sonarjs/')) {
            
            report.securityIssues.push({
              file: result.filePath,
              line: message.line,
              column: message.column,
              severity: message.severity,
              rule: message.ruleId,
              message: message.message,
              ruleUrl: getRuleUrl(message.ruleId)
            });
          }
        });
      }
    });

    report.endTime = new Date();
    report.duration = (report.endTime - report.startTime) / 1000;

    // Display results
    displayResults(report);

    // Save report
    saveReport(report);

    // Exit with appropriate code
    return report.securityIssues.length > 0 ? 1 : 0;

  } catch (error) {
    console.error(chalk.red.bold('❌ Security linting failed:'), error.message);
    return 1;
  }
}

function getRuleUrl(ruleId) {
  const [plugin, rule] = ruleId.split('/');
  const pluginUrls = {
    'security': 'https://github.com/eslint-community/eslint-plugin-security/blob/main/docs/rules/',
    'no-unsanitized': 'https://github.com/mozilla/eslint-plugin-no-unsanitized/blob/main/docs/rules/',
    'xss': 'https://github.com/Rantanen/eslint-plugin-xss/blob/master/docs/rules/',
    'sonarjs': 'https://github.com/SonarSource/eslint-plugin-sonarjs/blob/master/docs/rules/'
  };

  return pluginUrls[plugin] ? `${pluginUrls[plugin]}${rule}.md` : null;
}

function displayResults(report) {
  console.log(chalk.blue.bold('📊 Security Linting Results'));
  console.log(chalk.blue('─────────────────────────────────────'));
  console.log(chalk`{gray Files scanned:} {white ${report.totalFiles}}`);
  console.log(chalk`{gray Files with issues:} {yellow ${report.filesWithIssues}}`);
  console.log(chalk`{gray Security issues found:} {red ${report.securityIssues.length}}`);
  console.log(chalk`{gray Errors:} {red ${report.errorCount}}`);
  console.log(chalk`{gray Warnings:} {yellow ${report.warningCount}}`);
  console.log(chalk`{gray Duration:} {gray ${report.duration.toFixed(2)}s}`);
  console.log(chalk.blue('─────────────────────────────────────\n'));

  if (report.securityIssues.length > 0) {
    console.log(chalk.red.bold('🚨 Security Issues Found:'));
    console.log();

    report.securityIssues.forEach((issue, index) => {
      const severityColor = issue.severity === 2 ? chalk.red : chalk.yellow;
      const severityText = issue.severity === 2 ? 'ERROR' : 'WARNING';

      console.log(chalk`{gray ${index + 1}.} ${severityColor.bold(severityText)} {white ${issue.file}:${issue.line}:${issue.column}}`);
      console.log(chalk`   {white ${issue.rule}} {gray ${issue.message}}`);
      if (issue.ruleUrl) {
        console.log(chalk`   {gray More info:} {blue.underline ${issue.ruleUrl}}`);
      }
      console.log();
    });

    console.log(chalk.red.bold('❌ Security linting completed with issues.'));
    console.log(chalk.red('Please review and fix the security vulnerabilities before proceeding.'));
  } else {
    console.log(chalk.green.bold('✅ No security issues found!'));
    console.log(chalk.green('All files passed security linting checks.'));
  }
  
  console.log();
}

function saveReport(report) {
  try {
    const reportDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(reportDir, `security-report-${timestamp}.json`);

    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(chalk.gray(`Report saved: ${reportFile}`));
  } catch (error) {
    console.error(chalk.yellow('⚠️  Could not save security report:'), error.message);
  }
}

// Run the security linting
runSecurityLinting().then(process.exit);