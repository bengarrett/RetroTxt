# ESLint Security Plugins Guide for RetroTxt

## Introduction to ESLint Security Plugins

ESLint security plugins provide static code analysis to detect potential security vulnerabilities, code smells, and best practice violations. For a browser extension like RetroTxt that handles file downloads, URL processing, and DOM manipulation, these tools are essential for identifying security issues early in the development process.

## Recommended Security Plugins

### 1. `eslint-plugin-security`
**Purpose**: General security rules for Node.js and browser applications
**Key Features**:
- Detects common security vulnerabilities
- Identifies dangerous patterns
- Provides security best practices

### 2. `eslint-plugin-no-unsanitized`
**Purpose**: Prevents XSS vulnerabilities by detecting unsanitized data
**Key Features**:
- Detects DOM injection vulnerabilities
- Identifies unsafe HTML insertion
- Helps prevent XSS attacks

### 3. `eslint-plugin-sonarjs`
**Purpose**: Advanced code quality and security analysis
**Key Features**:
- Detects complex security issues
- Identifies code smells
- Provides maintainability insights

### 4. `eslint-plugin-xss`
**Purpose**: Cross-Site Scripting (XSS) specific detection
**Key Features**:
- Detects XSS vulnerabilities
- Identifies unsafe DOM manipulation
- Helps prevent injection attacks

## Installation Guide

### Step 1: Install Required Plugins

```bash
npm install --save-dev \
  eslint-plugin-security \
  eslint-plugin-no-unsanitized \
  eslint-plugin-sonarjs \
  eslint-plugin-xss
```

### Step 2: Update ESLint Configuration

Add the plugins to your `.eslintrc.js` or `.eslintrc.json`:

```javascript
module.exports = {
  plugins: [
    'security',
    'no-unsanitized',
    'sonarjs',
    'xss'
  ],
  extends: [
    'plugin:security/recommended',
    'plugin:sonarjs/recommended'
  ],
  rules: {
    // Security plugin rules
    'security/detect-object-injection': 'error',
    'security/detect-child-process': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-non-literal-require': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-new-buffer': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-non-literal-require': 'error',
    'security/detect-object-injection': 'error',
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-pseudoRandomBytes': 'error',
    'security/detect-unsafe-regex': 'error',
    
    // No-unsanitized plugin rules
    'no-unsanitized/method': 'error',
    'no-unsanitized/property': 'error',
    'no-unsanitized/dom': 'error',
    
    // XSS plugin rules
    'xss/no-location-href-assign': 'error',
    'xss/no-innerHTML': 'warn',  // Warn instead of error for DOM manipulation
    'xss/no-dangerouslySetInnerHTML': 'error',
    
    // SonarJS rules (security-related)
    'sonarjs/no-identical-expressions': 'error',
    'sonarjs/no-one-iteration-loop': 'error',
    'sonarjs/no-use-of-empty-return-value': 'error',
    'sonarjs/non-existent-operator': 'error',
    'sonarjs/no-all-duplicated-branches': 'error',
    'sonarjs/no-element-overwrite': 'error',
    'sonarjs/no-extra-arguments': 'error',
    'sonarjs/no-identical-functions': 'error',
    'sonarjs/no-inverted-boolean-check': 'error',
    'sonarjs/no-redundant-boolean': 'error',
    'sonarjs/no-redundant-jump': 'error',
    'sonarjs/no-unused-collection': 'error',
    'sonarjs/no-useless-catch': 'error',
    'sonarjs/prefer-immediate-return': 'warn',
    'sonarjs/prefer-object-literal': 'warn',
    'sonarjs/prefer-single-boolean-return': 'warn',
    'sonarjs/prefer-while': 'warn'
  }
}
```

## Configuration for RetroTxt Specific Needs

### Custom Rules for Browser Extensions

```javascript
// Add to your ESLint config
rules: {
  // Browser extension specific security rules
  'security/detect-object-injection': ['error', {
    object: ['chrome', 'browser', 'window', 'document'],
    methods: ['eval', 'Function', 'setTimeout', 'setInterval']
  }],
  
  // Allow some necessary DOM manipulation but warn about dangerous patterns
  'no-unsanitized/dom': ['warn', {
    allowList: [
      'textContent',
      'value',
      'setAttribute'
    ]
  }],
  
  // Special handling for extension URLs
  'security/detect-non-literal-require': ['error', {
    ignore: ['chrome.runtime.getURL', 'browser.runtime.getURL']
  }]
}
```

## Specific Security Issues These Plugins Will Detect

### 1. **DOM Injection Vulnerabilities**
```javascript
// ❌ UNSAFE - Direct DOM injection
document.getElementById('output').innerHTML = userInput;

// ✅ SAFE - Use textContent or proper sanitization
document.getElementById('output').textContent = userInput;
```

### 2. **Unsafe URL Handling**
```javascript
// ❌ UNSAFE - Direct URL construction
const url = 'https://example.com/' + userInput;
window.location.href = url;

// ✅ SAFE - Use URL API with validation
try {
  const url = new URL(userInput);
  if (allowedDomains.includes(url.hostname)) {
    window.location.href = url.toString();
  }
} catch (e) {
  console.error('Invalid URL');
}
```

### 3. **Dangerous Function Usage**
```javascript
// ❌ UNSAFE - Using eval
const result = eval(userInput);

// ✅ SAFE - Avoid eval entirely
const result = safeParse(userInput);
```

### 4. **Object Injection**
```javascript
// ❌ UNSAFE - Object property access with user input
const obj = {};
obj[userInput] = value;

// ✅ SAFE - Validate property names
if (allowedProperties.includes(userInput)) {
  obj[userInput] = value;
}
```

## Integration with RetroTxt Codebase

### Common Patterns That Will Be Flagged

#### 1. **File Download Handling** (`downloads.js`)
```javascript
// ❌ Potential issue - Direct blob handling
const reader = new FileReader();
reader.onload = (e) => {
  // This might be flagged if e.target.result is used unsafely
  processFile(e.target.result);
};

// ✅ Safer approach
const reader = new FileReader();
reader.onload = (e) => {
  const content = sanitizeFileContent(e.target.result);
  processFile(content);
};
```

#### 2. **URL Processing** (`tabs.js`)
```javascript
// ❌ Potential XSS vector
const url = tab.url;
document.getElementById('url-display').innerHTML = url;

// ✅ Safer approach
document.getElementById('url-display').textContent = url;
```

#### 3. **DOM Construction** (`retrotxt.js`)
```javascript
// ❌ Potential injection
this.head.append(CreateLink(palette.savedFilename(), link4bit));

// ✅ Safer with validation
const safeFilename = validateAndSanitize(palette.savedFilename());
if (isSafeUrl(safeFilename)) {
  this.head.append(CreateLink(safeFilename, link4bit));
}
```

## Handling False Positives

### Common False Positives in Extension Development

1. **Chrome API Usage**:
   ```javascript
   // This might be flagged as unsafe object access
   chrome.storage.local.get(key, callback);
   
   // Solution: Add to ESLint ignore comments or configure exceptions
   ```

2. **Dynamic Property Access**:
   ```javascript
   // This might be flagged as object injection
   const method = 'get';
   chrome.tabs[method](tabId, callback);
   
   // Solution: Use explicit method calls or configure allowed patterns
   ```

3. **URL Construction**:
   ```javascript
   // This might be flagged as unsafe URL handling
   const url = chrome.runtime.getURL('html/options.html');
   
   // Solution: Configure ESLint to allow chrome.runtime.getURL
   ```

## CI/CD Integration

### Add Security Linting to CI Pipeline

```yaml
# .github/workflows/security-lint.yml
name: Security Linting

on: [push, pull_request]

jobs:
  security-lint:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
    
    - name: Install dependencies
      run: npm install
    
    - name: Run security linting
      run: npx eslint . --config .eslintrc-security.js
    
    - name: Fail on security issues
      run: |
        if [ $? -ne 0 ]; then
          echo "Security linting failed - potential vulnerabilities detected"
          exit 1
        fi
```

### Create Separate Security Config

```javascript
// .eslintrc-security.js
module.exports = {
  extends: [
    './.eslintrc.js',
    'plugin:security/recommended'
  ],
  rules: {
    // Make security rules stricter for CI
    'security/detect-object-injection': 'error',
    'security/detect-eval-with-expression': 'error',
    'no-unsanitized/method': 'error',
    'no-unsanitized/property': 'error',
    'no-unsanitized/dom': 'error'
  }
}
```

## Pre-commit Hook Setup

### Install Husky for Git Hooks

```bash
npm install --save-dev husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

### Configure lint-staged

```json
// package.json
"lint-staged": {
  "*.js": [
    "eslint --fix",
    "eslint --config .eslintrc-security.js"
  ]
}
```

## Custom Security Rules for RetroTxt

### Create Custom ESLint Plugin

```javascript
// eslint-plugin-retrotxt-security/index.js
module.exports = {
  rules: {
    'no-unsafe-file-handling': {
      create(context) {
        return {
          CallExpression(node) {
            if (node.callee.name === 'fetch' || node.callee.name === 'FileReader') {
              // Check if proper validation is present
              const hasValidation = checkForValidation(context, node);
              if (!hasValidation) {
                context.report({
                  node,
                  message: 'File handling operations should include proper validation and sanitization'
                });
              }
            }
          }
        };
      }
    },
    
    'no-direct-dom-injection': {
      create(context) {
        return {
          MemberExpression(node) {
            if (node.property.name === 'innerHTML' && 
                node.object.type === 'MemberExpression' &&
                node.object.property.name === 'getElementById') {
              context.report({
                node,
                message: 'Avoid direct DOM injection. Use textContent or proper sanitization'
              });
            }
          }
        };
      }
    }
  },
  configs: {
    recommended: {
      plugins: ['retrotxt-security'],
      rules: {
        'retrotxt-security/no-unsafe-file-handling': 'error',
        'retrotxt-security/no-direct-dom-injection': 'error'
      }
    }
  }
}
```

## Security Linting Best Practices

### 1. **Regular Updates**
- Keep security plugins updated
- Regularly review new security rules
- Update configurations as new vulnerabilities are discovered

### 2. **Balanced Approach**
- Don't disable security rules - fix the underlying issues
- Use warnings for less critical issues, errors for security-critical ones
- Document exceptions and justifications

### 3. **Team Training**
- Educate team on security linting results
- Regular security code reviews
- Pair programming on security-critical components

### 4. **Progressive Enhancement**
- Start with recommended configurations
- Gradually increase strictness
- Address issues incrementally

## Example Security Issues These Plugins Will Catch

### 1. **XSS Vulnerability in DOM Manipulation**
```javascript
// ❌ UNSAFE - This will be flagged by no-unsanitized plugin
document.getElementById('output').innerHTML = `<div>${userInput}</div>`;

// ✅ SAFE - Proper sanitization
const sanitized = DOMPurify.sanitize(userInput);
document.getElementById('output').innerHTML = `<div>${sanitized}</div>`;
```

### 2. **Unsafe URL Construction**
```javascript
// ❌ UNSAFE - This will be flagged by security plugin
const scriptUrl = 'https://cdn.example.com/' + version + '/script.js';
const script = document.createElement('script');
script.src = scriptUrl;

// ✅ SAFE - Use URL API with validation
try {
  const baseUrl = new URL('https://cdn.example.com/');
  const safeUrl = new URL(version + '/script.js', baseUrl);
  if (allowedDomains.includes(safeUrl.hostname)) {
    const script = document.createElement('script');
    script.src = safeUrl.toString();
  }
} catch (e) {
  console.error('Invalid script URL');
}
```

### 3. **Dangerous Regular Expressions**
```javascript
// ❌ UNSAFE - This will be flagged by security plugin
const regex = new RegExp(userInput);

// ✅ SAFE - Validate regex patterns
if (isSafeRegexPattern(userInput)) {
  const regex = new RegExp(userInput);
}
```

## Performance Considerations

### Optimizing Security Linting

1. **Cache Results**: Use caching for repeated linting
2. **Focus on Changed Files**: Only lint modified files in CI
3. **Parallel Processing**: Run linting in parallel where possible
4. **Incremental Adoption**: Gradually introduce strict rules

### Sample Optimized CI Configuration

```yaml
name: Optimized Security Linting

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 2  # Only fetch last 2 commits for faster checkout
    
    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm install --frozen-lockfile
    
    - name: Get changed files
      id: changed-files
      uses: tj-actions/changed-files@v44
      with:
        files: '**/*.js'
    
    - name: Run security linting on changed files
      if: steps.changed-files.outputs.any_changed == 'true'
      run: |
        npx eslint ${{ steps.changed-files.outputs.all_changed_files }} \
          --config .eslintrc-security.js \
          --cache \
          --cache-location .eslintcache
    
    - name: Run full security linting on schedule
      if: github.event_name == 'schedule'
      run: |
        npx eslint . \
          --config .eslintrc-security.js \
          --cache \
          --cache-location .eslintcache
```

## Integration with Existing Tools

### Combining with Other Security Tools

1. **With QUnit Testing**:
   ```bash
   # Run security linting before tests
   npm run lint:security && npm test
   ```

2. **With Code Coverage**:
   ```bash
   # Ensure security linting passes before coverage reporting
   npm run lint:security && npm run coverage
   ```

3. **With Dependency Scanning**:
   ```bash
   # Combine security linting with dependency checking
   npm run lint:security && npm audit --production
   ```

## Monitoring and Maintenance

### Security Dashboard Setup

```javascript
// scripts/security-dashboard.js
const { ESLint } = require('eslint');
const fs = require('fs');

async function generateSecurityReport() {
  const eslint = new ESLint({
    useEslintrc: false,
    baseConfig: require('./.eslintrc-security.js'),
    fix: false
  });

  const results = await eslint.lintFiles(['scripts/**/*.js', '!scripts/**/*.test.js']);
  
  const report = {
    totalFiles: results.length,
    errorCount: 0,
    warningCount: 0,
    securityIssues: [],
    filesWithIssues: 0
  };

  results.forEach(result => {
    if (result.errorCount > 0 || result.warningCount > 0) {
      report.filesWithIssues++;
      report.errorCount += result.errorCount;
      report.warningCount += result.warningCount;
      
      result.messages.forEach(message => {
        if (message.ruleId.startsWith('security/') || 
            message.ruleId.startsWith('no-unsanitized/') ||
            message.ruleId.startsWith('xss/')) {
          report.securityIssues.push({
            file: result.filePath,
            line: message.line,
            column: message.column,
            severity: message.severity,
            rule: message.ruleId,
            message: message.message
          });
        }
      });
    }
  });

  fs.writeFileSync('security-report.json', JSON.stringify(report, null, 2));
  
  return report;
}

generateSecurityReport().then(report => {
  console.log(`Security Report Generated:`);
  console.log(`- Files scanned: ${report.totalFiles}`);
  console.log(`- Files with issues: ${report.filesWithIssues}`);
  console.log(`- Security issues found: ${report.securityIssues.length}`);
  console.log(`- Errors: ${report.errorCount}`);
  console.log(`- Warnings: ${report.warningCount}`);
  
  if (report.securityIssues.length > 0) {
    console.log('\nSecurity Issues:');
    report.securityIssues.forEach(issue => {
      console.log(`  ${issue.file}:${issue.line}:${issue.column} - ${issue.rule} - ${issue.message}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ No security issues found!');
    process.exit(0);
  }
}).catch(error => {
  console.error('Security report generation failed:', error);
  process.exit(1);
});
```

## Troubleshooting Common Issues

### 1. **False Positives in Extension Code**

**Issue**: Chrome API calls being flagged as unsafe

**Solution**:
```javascript
// .eslintrc.js
rules: {
  'security/detect-object-injection': ['error', {
    ignore: ['chrome.*', 'browser.*']
  }]
}
```

### 2. **Performance Impact**

**Issue**: Security linting slowing down development

**Solution**:
```bash
# Use caching
npx eslint --cache --cache-location .eslintcache

# Only check changed files
npx eslint --cache --cache-location .eslintcache $(git diff --name-only)
```

### 3. **Configuration Conflicts**

**Issue**: Security rules conflicting with existing code style

**Solution**:
```javascript
// Create separate security config that extends main config
module.exports = {
  extends: ['./.eslintrc.js'],
  rules: {
    // Override or add security-specific rules here
  }
}
```

## Success Metrics for Security Linting

### Implementation Goals:
- **Week 1**: Basic security linting setup
- **Week 2**: Address critical security issues
- **Week 4**: Full integration with CI/CD
- **Week 8**: Zero critical security linting issues

### Quality Metrics:
- **Security Issues**: Track number of security-related linting issues
- **False Positives**: Minimize while maintaining security
- **Coverage**: Percentage of security rules enabled
- **Response Time**: Time to fix identified security issues

## Conclusion

Implementing ESLint security plugins will significantly enhance RetroTxt's security posture by:

1. **Early Detection**: Catching security vulnerabilities during development
2. **Consistent Standards**: Enforcing security best practices across the codebase
3. **Automated Checks**: Integrating security into the development workflow
4. **Improved Quality**: Reducing security-related bugs in production

**Recommended Implementation Approach**:
1. Start with recommended configurations
2. Gradually increase rule strictness
3. Integrate with CI/CD pipeline
4. Regularly update and maintain security rules
5. Combine with other security practices (testing, code reviews)

The security plugins will complement the existing test coverage by providing static analysis that catches issues before they reach the testing phase, creating a comprehensive security strategy for the RetroTxt extension.