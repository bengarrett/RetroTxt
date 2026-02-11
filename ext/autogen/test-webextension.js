#!/usr/bin/env node

/**
 * Test WebExtension compatibility
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing WebExtension Compatibility');
console.log('=====================================');

// Check for common WebExtension issues
function checkWebExtensionIssues() {
  const issues = [];
  
  // 1. Check manifest.json
  console.log('\n📄 Checking manifest.json...');
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '../manifest.json'), 'utf8'));
    console.log(`✅ Manifest version: ${manifest.manifest_version}`);
    console.log(`✅ Browser action: ${manifest.browser_action ? 'found' : 'not found'}`);
  } catch (error) {
    issues.push(`Manifest error: ${error.message}`);
  }
  
  // 2. Check content scripts
  console.log('\n📜 Checking content scripts...');
  const contentScripts = ['retrotxt.js', 'parse_dos.js', 'parse_ansi.js'];
  
  contentScripts.forEach(file => {
    try {
      const content = fs.readFileSync(path.join(__dirname, `../scripts/${file}`), 'utf8');
      
      // Check for browser API usage
      if (content.includes('chrome.') || content.includes('browser.')) {
        console.log(`✅ ${file} uses browser APIs`);
      }
      
      // Check for our new function
      if (content.includes('withPerformanceTracking')) {
        console.log(`✅ ${file} uses withPerformanceTracking`);
      }
      
    } catch (error) {
      issues.push(`Content script ${file} error: ${error.message}`);
    }
  });
  
  // 3. Check service workers
  console.log('\n⚙️ Checking service workers...');
  const serviceWorkers = ['background.js', 'downloads.js', 'extension.js'];
  
  serviceWorkers.forEach(file => {
    try {
      const content = fs.readFileSync(path.join(__dirname, `../scripts/sw/${file}`), 'utf8');
      
      // Check for importScripts
      if (content.includes('importScripts')) {
        console.log(`✅ ${file} uses importScripts`);
        
        // Check if it loads helpers.js
        if (content.includes('helpers.js')) {
          console.log(`✅ ${file} loads helpers.js`);
        }
      }
      
    } catch (error) {
      issues.push(`Service worker ${file} error: ${error.message}`);
    }
  });
  
  // 4. Check for global scope issues
  console.log('\n🌍 Checking global scope...');
  
  // Check helpers.js for global declarations
  try {
    const helpersContent = fs.readFileSync(path.join(__dirname, '../scripts/helpers.js'), 'utf8');
    
    if (helpersContent.includes('withPerformanceTracking')) {
      console.log('✅ withPerformanceTracking defined in helpers.js');
    }
    
    if (helpersContent.includes('/* global')) {
      console.log('✅ Global declarations found in helpers.js');
    }
    
  } catch (error) {
    issues.push(`Helpers.js error: ${error.message}`);
  }
  
  // 5. Check parse_dos.js for global usage
  try {
    const parseDosContent = fs.readFileSync(path.join(__dirname, '../scripts/parse_dos.js'), 'utf8');
    
    if (parseDosContent.includes('withPerformanceTracking')) {
      console.log('✅ parse_dos.js uses withPerformanceTracking');
      
      // Check if it's in global declarations
      const globalDeclIndex = parseDosContent.indexOf('/*global');
      const endIndex = parseDosContent.indexOf('*/', globalDeclIndex);
      const globalDecl = parseDosContent.substring(globalDeclIndex, endIndex + 2);
      
      if (globalDecl.includes('withPerformanceTracking')) {
        console.log('✅ withPerformanceTracking declared in global scope');
      } else {
        issues.push('withPerformanceTracking not declared in parse_dos.js global scope');
      }
    }
    
  } catch (error) {
    issues.push(`parse_dos.js error: ${error.message}`);
  }
  
  // Summary
  console.log('\n📋 Summary:');
  console.log('============');
  
  if (issues.length === 0) {
    console.log('✅ No issues found!');
    console.log('✅ WebExtension should work correctly');
  } else {
    console.log(`⚠️  Found ${issues.length} potential issues:`);
    issues.forEach(issue => console.log(`   - ${issue}`));
  }
  
  return issues.length === 0;
}

// Run the check
const success = checkWebExtensionIssues();
process.exit(success ? 0 : 1);