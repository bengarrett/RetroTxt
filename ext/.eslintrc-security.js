// RetroTxt Security Linting Configuration
// Compatible configuration for ESLint v10

const noUnsanitizedPlugin = require('eslint-plugin-no-unsanitized');
const sonarjsPlugin = require('eslint-plugin-sonarjs');

module.exports = [
  {
    // Base configuration
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        chrome: 'readonly',
        browser: 'readonly',
        qunit: 'readonly',
        DOMPurify: 'readonly'
      }
    },
    
    // Security plugin rules
    plugins: {
      'no-unsanitized': noUnsanitizedPlugin,
      sonarjs: sonarjsPlugin
    },
    
    rules: {
      // No-unsanitized plugin rules - prevent XSS vulnerabilities
      'no-unsanitized/method': 'error',
      'no-unsanitized/property': 'error',

      // SonarJS rules (security-related, ESLint v10 compatible)
      'sonarjs/no-identical-expressions': 'error',
      'sonarjs/no-identical-conditions': 'error',
      'sonarjs/no-extra-arguments': 'error',
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-inverted-boolean-check': 'error',
      'sonarjs/no-redundant-boolean': 'error',
      'sonarjs/no-redundant-jump': 'error',
      'sonarjs/no-unused-collection': 'error',
      'sonarjs/no-useless-catch': 'error',
      'sonarjs/no-element-overwrite': 'error',
      'sonarjs/no-all-duplicated-branches': 'error',

      // Basic security rules
      'no-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-implied-eval': 'error',
      'no-proto': 'error',

      // RetroTxt specific security rules
      'no-console': 'off',
      'no-alert': 'off'
    }
  },
  
  // Overrides for service workers
  {
    files: ['scripts/sw/**/*.js'],
    rules: {
      // Service workers can have more strict security
      'no-unsanitized/method': 'error',
      'no-unsanitized/property': 'error'
    }
  },
  
  // Overrides for content scripts
  {
    files: ['scripts/**/*.js'],
    rules: {
      // Allow some DOM manipulation in content scripts
      'no-unsanitized/method': 'warn',
      'no-unsanitized/property': 'warn'
    }
  },
  
  // Overrides for test files
  {
    files: ['test/**/*.js'],
    rules: {
      'no-unsanitized/method': 'off',
      'no-unsanitized/property': 'off'
    }
  }
];