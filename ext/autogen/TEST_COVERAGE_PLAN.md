# RetroTxt Extension - Test Coverage Implementation Plan

## Current Test Coverage Status

### ✅ Well Covered Areas:
- ANSI parsing (comprehensive test suite)
- DOS parsing (good coverage)
- Core DOM functionality
- Basic service worker classes
- Helper functions

### ⚠️ Partially Covered Areas:
- Core RetroTxt functionality
- Service worker interactions
- Input/output handling
- Basic error conditions

### ❌ Missing Coverage Areas:
- Security module comprehensive testing
- Download handling edge cases
- Advanced error condition testing
- Performance testing
- Integration testing
- Browser compatibility testing
- Malicious input testing
- Permission scenario testing

## Test Coverage Goals

### Phase 1: Critical Coverage (High Priority)
**Target**: 80% unit test coverage, basic integration testing
**Timeline**: 2-4 weeks
**Focus**: Security, downloads, error handling

### Phase 2: Comprehensive Coverage (Medium Priority)
**Target**: 90% unit test coverage, integration testing
**Timeline**: 4-8 weeks
**Focus**: Performance, edge cases, workflows

### Phase 3: Advanced Coverage (Long-term)
**Target**: 95%+ coverage with performance benchmarks
**Timeline**: 8+ weeks
**Focus**: Browser compatibility, automation, CI/CD integration

## Detailed Implementation Plan

### 1. Security Module Testing (`security.js`)

**Current Coverage**: Minimal
**Target Coverage**: 90%+
**Test Cases Needed**:

```javascript
// Test permission handling
QUnit.test(`Security class - permission handling`, (assert) => {
  const security = new Security('http', 'https://example.com')
  assert.deepEqual(security.permissions, ['activeTab'], 'HTTP permissions should be activeTab')
  assert.deepEqual(security.origins, ['*://example.com/*'], 'Origins should match URL')
})

// Test URL validation
QUnit.test(`Security class - URL validation`, (assert) => {
  const security = new Security('http', 'invalid-url')
  assert.deepEqual(security.origins, ['*://invalid-url/*'], 'Should handle invalid URLs')
})

// Test permission failure scenarios
QUnit.test(`Security class - permission failures`, (assert) => {
  // Mock chrome.permissions.contains to return false
  const originalContains = chrome.permissions.contains
  chrome.permissions.contains = (permissions, callback) => callback(false)
  
  const security = new Security('downloads', 'test')
  security.fail() // Should not throw
  
  chrome.permissions.contains = originalContains
})
```

**Files to Create/Update**:
- `test/tests-security.js` (new file)
- Update `test/index.html` to include new test file

### 2. Downloads Module Testing (`downloads.js`)

**Current Coverage**: Basic
**Target Coverage**: 85%+
**Test Cases Needed**:

```javascript
// Test file type detection
QUnit.test(`Downloads class - file type detection`, (assert) => {
  const downloads = new Downloads()
  const blob = new Blob(['test content'], {type: 'text/plain'})
  
  const result = downloads.parseBlob(blob, {tabid: 1}, true)
  assert.false(result, 'Plain text should not be marked as markup')
})

// Test malicious file handling
QUnit.test(`Downloads class - malicious file handling`, (assert) => {
  const downloads = new Downloads()
  const maliciousBlob = new Blob(['<script>alert("xss")</script>'], {type: 'text/plain'})
  
  // Should not execute the script
  const result = downloads.parseBlob(maliciousBlob, {tabid: 1}, true)
  assert.false(result, 'Malicious content should be detected')
})

// Test large file handling
QUnit.test(`Downloads class - large file handling`, (assert) => {
  const downloads = new Downloads()
  const largeContent = 'x'.repeat(1000000) // 1MB file
  const largeBlob = new Blob([largeContent], {type: 'text/plain'})
  
  const result = downloads.parseBlob(largeBlob, {tabid: 1}, true)
  assert.false(result, 'Large files should be handled without crashing')
})
```

**Files to Create/Update**:
- Expand `test/tests-sw.js` with download-specific tests
- Add performance benchmarks for large file handling

### 3. Error Condition Testing

**Current Coverage**: Limited
**Target Coverage**: 90%+
**Test Cases Needed**:

```javascript
// Test DOM error conditions
QUnit.test(`DOM class - error conditions`, (assert) => {
  // Mock document.body to be null
  const originalBody = document.body
  document.body = null
  
  try {
    new DOM()
    assert.fail('Should throw error when body is null')
  } catch (error) {
    assert.ok(true, 'Should handle missing body gracefully')
  }
  
  document.body = originalBody
})

// Test network error conditions
QUnit.test(`Tab class - network errors`, (assert) => {
  const tab = new Tab(1, 'https://nonexistent.example.com')
  
  // Mock fetch to fail
  const originalFetch = window.fetch
  window.fetch = () => Promise.reject(new Error('Network error'))
  
  tab._compatibleURL().catch(() => {
    assert.ok(true, 'Should handle network errors gracefully')
  })
  
  window.fetch = originalFetch
})
```

**Files to Create/Update**:
- Add error condition tests to existing test files
- Create `test/tests-errors.js` for comprehensive error testing

### 4. Integration Testing

**Current Coverage**: None
**Target Coverage**: Basic workflow coverage
**Test Approach**:

```javascript
// Test complete workflow: download → parse → display
QUnit.module('integration', {
  before: () => {
    // Setup test environment
  },
  after: () => {
    // Cleanup test environment
  }
})

QUnit.test('Complete workflow - ANSI file', (assert) => {
  const done = assert.async()
  
  // Simulate file download
  const blob = new Blob(['\x1b[31mRed Text\x1b[0m'], {type: 'text/plain'})
  
  // Parse the content
  const input = new Input('text/plain', await blob.text())
  
  // Verify parsing
  assert.equal(input.format, ANSIText, 'Should detect ANSI format')
  
  // Verify DOM construction
  const dom = new DOM()
  // ... additional assertions
  
  done()
})
```

**Files to Create/Update**:
- `test/tests-integration.js` (new file)
- Update test runner to handle async tests

### 5. Performance Testing

**Current Coverage**: None
**Target Coverage**: Basic performance benchmarks
**Test Approach**:

```javascript
QUnit.module('performance', {
  before: () => {
    console.info('Starting performance tests')
  }
})

QUnit.test('DOM manipulation performance', (assert) => {
  const start = performance.now()
  
  // Perform DOM operations
  const dom = new DOM()
  for (let i = 0; i < 100; i++) {
    dom.construct()
    // Cleanup
  }
  
  const end = performance.now()
  const duration = end - start
  
  assert.ok(duration < 500, `DOM operations should complete in under 500ms, took ${duration}ms`)
})

QUnit.test('Large file parsing performance', (assert) => {
  const done = assert.async()
  
  const start = performance.now()
  const largeContent = 'x'.repeat(100000) // 100KB
  
  const input = new Input('text/plain', largeContent)
  
  const end = performance.now()
  const duration = end - start
  
  assert.ok(duration < 200, `Large file parsing should complete in under 200ms, took ${duration}ms`)
  
  done()
})
```

**Files to Create/Update**:
- `test/tests-performance.js` (new file)
- Add performance measurement utilities

## Testing Tools Recommendation

### Current Tools:
- **QUnit**: Already integrated, good for unit testing

### Recommended Additions:

1. **Jest** (for advanced testing):
   ```bash
   npm install --save-dev jest @types/jest
   ```
   - Better mocking capabilities
   - Advanced assertions
   - Code coverage reporting

2. **Puppeteer** (for integration testing):
   ```bash
   npm install --save-dev puppeteer
   ```
   - Browser automation
   - UI testing
   - Integration testing

3. **ESLint Security Plugins**:
   ```bash
   npm install --save-dev eslint-plugin-security eslint-plugin-no-unsanitized
   ```
   - Static code analysis
   - Security vulnerability detection

4. **Lighthouse CI** (for performance):
   ```bash
   npm install --save-dev lighthouse @lhci/cli
   ```
   - Performance benchmarks
   - Best practice audits
   - Automated reporting

## Test Coverage Implementation Roadmap

### Week 1-2: Security and Downloads Testing
- [ ] Create comprehensive security tests
- [ ] Add download handling edge case tests
- [ ] Implement malicious input testing
- [ ] Add permission scenario tests

### Week 3-4: Error Handling and Integration
- [ ] Add comprehensive error condition tests
- [ ] Create basic integration tests
- [ ] Implement workflow testing
- [ ] Add cross-module interaction tests

### Week 5-6: Performance and Browser Compatibility
- [ ] Add performance benchmarks
- [ ] Implement browser compatibility tests
- [ ] Add memory leak testing
- [ ] Create performance regression tests

### Week 7-8: Automation and CI/CD
- [ ] Set up continuous integration
- [ ] Add automated test reporting
- [ ] Implement test coverage monitoring
- [ ] Add pre-commit hooks for testing

## Test Coverage Metrics

### Current Metrics (Estimated):
- **Unit Test Coverage**: ~60-70%
- **Integration Test Coverage**: ~10%
- **Performance Test Coverage**: ~0%
- **Security Test Coverage**: ~30%

### Target Metrics:
- **Phase 1 (4 weeks)**: 80% unit, 20% integration, 10% performance, 60% security
- **Phase 2 (8 weeks)**: 90% unit, 40% integration, 30% performance, 80% security
- **Phase 3 (12 weeks)**: 95% unit, 60% integration, 50% performance, 90% security

## Test Coverage Monitoring

### Recommended Approach:

1. **Add Istanbul/NYC for coverage reporting**:
   ```bash
   npm install --save-dev nyc
   ```

2. **Add coverage to package.json**:
   ```json
   "scripts": {
     "test": "qunit test/index.html && nyc report --reporter=text",
     "coverage": "nyc qunit test/index.html"
   }
   ```

3. **Add coverage thresholds**:
   ```json
   "nyc": {
     "check-coverage": true,
     "per-file": true,
     "lines": 80,
     "statements": 80,
     "functions": 80,
     "branches": 70
   }
   ```

## Continuous Integration Setup

### Recommended CI Configuration (.github/workflows/test.yml):

```yaml
name: Test Coverage

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
    
    - name: Install dependencies
      run: npm install
    
    - name: Run tests with coverage
      run: npm run coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        token: ${{ secrets.CODECOV_TOKEN }}
```

## Test Data Management

### Recommended Test Data Structure:

```
test/
├── data/
│   ├── ansi/
│   │   ├── basic.ans
│   │   ├── colors.ans
│   │   └── complex.ans
│   ├── dos/
│   │   ├── cp437.txt
│   │   └── extended.txt
│   ├── security/
│   │   ├── malicious.txt
│   │   └── edge-cases.txt
│   └── performance/
│       ├── large.txt (1MB)
│       └── huge.txt (10MB)
└── fixtures/
    ├── dom.html
    └── mock-chrome.js
```

## Test Environment Setup

### Recommended Test Environment Configuration:

1. **Mock Chrome API**:
   ```javascript
   // test/fixtures/mock-chrome.js
   global.chrome = {
     runtime: {
       onMessage: { addListener: () => {} },
       lastError: null,
       getURL: (url) => url
     },
     storage: {
       local: {
         get: (keys, callback) => callback({}),
         set: (data, callback) => callback?.(),
         clear: (callback) => callback?.()
       },
       onChanged: { addListener: () => {} }
     },
     permissions: {
       contains: (permissions, callback) => callback(true)
     },
     downloads: {
       onCreated: { addListener: () => {} },
       onChanged: { addListener: () => {} }
     },
     tabs: {
       onCreated: { addListener: () => {} },
       onUpdated: { addListener: () => {} },
       onRemoved: { addListener: () => {} }
     }
   }
   ```

2. **Test Setup Script**:
   ```javascript
   // test/setup.js
   before(() => {
     // Load mock Chrome API
     require('./fixtures/mock-chrome')
     
     // Set up test environment
     global.qunit = true
     global.Developer = 'developer'
   })
   ```

## Test Coverage Best Practices

### Writing Effective Tests:

1. **Follow the AAA Pattern**: Arrange, Act, Assert
2. **Test One Thing per Test**: Keep tests focused
3. **Use Descriptive Names**: Test names should describe behavior
4. **Test Edge Cases**: Include boundary conditions
5. **Avoid Test Interdependence**: Tests should be isolated
6. **Use Setup/Teardown**: Properly clean up after tests
7. **Test Error Conditions**: Don't just test happy paths

### Test Naming Convention:

```javascript
// Good examples:
QUnit.test('DOM class - should handle missing body element')
QUnit.test('Security class - should validate URLs correctly')
QUnit.test('Downloads class - should reject malicious files')
QUnit.test('Tab class - should handle network errors gracefully')
```

## Implementation Priority Matrix

| Area | Current Coverage | Importance | Effort | Priority |
|------|-----------------|------------|--------|----------|
| Security Testing | Low | High | Medium | 1 |
| Downloads Testing | Medium | High | Medium | 1 |
| Error Handling | Low | High | Low | 2 |
| Integration Testing | None | High | High | 2 |
| Performance Testing | None | Medium | Medium | 3 |
| Browser Compatibility | None | Medium | High | 4 |

## Getting Started - Immediate Actions

1. **Set up test coverage monitoring**:
   ```bash
   npm install --save-dev nyc
   ```

2. **Create basic security tests**:
   ```bash
   touch test/tests-security.js
   ```

3. **Enhance download tests**:
   ```bash
   # Add test cases to test/tests-sw.js
   ```

4. **Add error condition tests**:
   ```bash
   touch test/tests-errors.js
   ```

5. **Set up CI/CD pipeline**:
   ```bash
   # Create .github/workflows/test.yml
   ```

## Success Metrics

### Short-term (4 weeks):
- ✅ 80% unit test coverage
- ✅ Basic integration tests implemented
- ✅ Security test coverage at 60%+
- ✅ CI/CD pipeline with test reporting

### Medium-term (8 weeks):
- ✅ 90% unit test coverage
- ✅ Comprehensive integration tests
- ✅ Performance benchmarks established
- ✅ Automated test reporting

### Long-term (12 weeks):
- ✅ 95%+ overall test coverage
- ✅ Full CI/CD integration
- ✅ Performance regression testing
- ✅ Automated browser compatibility testing

## Conclusion

This test coverage implementation plan provides a comprehensive roadmap to improve RetroTxt's testing from the current ~60-70% coverage to 95%+ coverage with comprehensive security, performance, and integration testing.

**Recommended Starting Point**: Begin with security and downloads testing (Phase 1) as these provide the highest risk reduction and quality improvement with moderate effort.

**Next Steps**:
1. Implement test coverage monitoring
2. Create security test suite
3. Enhance download testing
4. Set up CI/CD pipeline

The plan balances immediate quality improvements with long-term maintainability and reliability goals.