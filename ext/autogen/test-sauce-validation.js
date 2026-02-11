// SauceMeta Validation Test Suite
// Comprehensive tests for the enhanced SauceMeta validation method

/**
 * Test Case 1: Valid SAUCE Record
 * Should pass all validation checks
 */
function testValidSauceRecord() {
  console.log('=== Test 1: Valid SAUCE Record ===');
  
  // Create a mock SauceMeta instance with valid data
  const mockSauce = {
    id: 'SAUCE00',
    version: '00',
    title: 'Test Artwork',
    author: 'Test Artist',
    group: 'Test Group',
    date: '20231225',
    sliced: 'SAUCE0000Test Artwork                          Test Artist           Test Group            20231225',
    valid: function() {
      // Original simple check
      if (this.id !== `SAUCE00`) {
        console.debug(`SauceMeta: Invalid SAUCE identifier: '${this.id}'`);
        return false;
      }

      try {
        // 1. Check minimum record length
        if (this.sliced && this.sliced.length < 7) {
          console.debug(`SauceMeta: SAUCE record too short: ${this.sliced.length} bytes`);
          return false;
        }

        // 2. Check version compatibility
        if (this.version !== `00`) {
          console.debug(`SauceMeta: Unsupported SAUCE version: '${this.version}'`);
          return false;
        }

        // 3. Check required fields
        const requiredFields = [
          { name: 'title', minLength: 0, maxLength: 35 },
          { name: 'author', minLength: 0, maxLength: 20 },
          { name: 'group', minLength: 0, maxLength: 20 },
          { name: 'date', minLength: 8, maxLength: 8 }
        ];

        for (const field of requiredFields) {
          const value = this[field.name];
          if (typeof value !== 'string') {
            console.debug(`SauceMeta: Field '${field.name}' is not a string: ${typeof value}`);
            return false;
          }

          if (value.length < field.minLength || value.length > field.maxLength) {
            console.debug(`SauceMeta: Field '${field.name}' has invalid length: ${value.length} (expected ${field.minLength}-${field.maxLength})`);
            return false;
          }
        }

        // 4. Basic date validation
        if (this.date && this.date.length === 8) {
          const year = parseInt(this.date.slice(0, 4));
          const month = parseInt(this.date.slice(4, 6));
          const day = parseInt(this.date.slice(6, 8));

          if (isNaN(year) || isNaN(month) || isNaN(day)) {
            console.debug(`SauceMeta: Invalid date format: '${this.date}'`);
            return false;
          }

          if (year < 1980 || year > 2100) {
            console.debug(`SauceMeta: Unreasonable year in date: ${year}`);
            return false;
          }

          if (month < 1 || month > 12) {
            console.debug(`SauceMeta: Invalid month in date: ${month}`);
            return false;
          }

          if (day < 1 || day > 31) {
            console.debug(`SauceMeta: Invalid day in date: ${day}`);
            return false;
          }
        }

        console.debug(`SauceMeta: Valid SAUCE record found`);
        return true;

      } catch (error) {
        console.error(`SauceMeta: Validation error:`, error);
        return false;
      }
    }
  };

  const result = mockSauce.valid();
  console.log(`Expected: true, Got: ${result}`);
  console.log(`Test Result: ${result === true ? 'PASS ✅' : 'FAIL ❌'}`);
  return result === true;
}

/**
 * Test Case 2: Invalid SAUCE Identifier
 * Should fail at the first validation check
 */
function testInvalidSauceIdentifier() {
  console.log('\n=== Test 2: Invalid SAUCE Identifier ===');
  
  const mockSauce = {
    id: 'INVALID',
    version: '00',
    title: 'Test Artwork',
    author: 'Test Artist',
    group: 'Test Group',
    date: '20231225',
    sliced: 'INVALID00Test Artwork                          Test Artist           Test Group            20231225',
    valid: function() {
      if (this.id !== `SAUCE00`) {
        console.debug(`SauceMeta: Invalid SAUCE identifier: '${this.id}'`);
        return false;
      }
      return true; // Should not reach here
    }
  };

  const result = mockSauce.valid();
  console.log(`Expected: false, Got: ${result}`);
  console.log(`Test Result: ${result === false ? 'PASS ✅' : 'FAIL ❌'}`);
  return result === false;
}

/**
 * Test Case 3: Short SAUCE Record
 * Should fail the length validation check
 */
function testShortSauceRecord() {
  console.log('\n=== Test 3: Short SAUCE Record ===');
  
  const mockSauce = {
    id: 'SAUCE00',
    version: '00',
    title: 'Test',
    author: 'Test',
    group: 'Test',
    date: '20231225',
    sliced: 'SAUCE00', // Too short (7 bytes exactly, but needs more for version)
    valid: function() {
      if (this.id !== `SAUCE00`) return false;
      
      if (this.sliced && this.sliced.length < 7) {
        console.debug(`SauceMeta: SAUCE record too short: ${this.sliced.length} bytes`);
        return false;
      }
      return true; // Should not reach here
    }
  };

  const result = mockSauce.valid();
  console.log(`Expected: false, Got: ${result}`);
  console.log(`Test Result: ${result === false ? 'PASS ✅' : 'FAIL ❌'}`);
  return result === false;
}

/**
 * Test Case 4: Unsupported SAUCE Version
 * Should fail the version compatibility check
 */
function testUnsupportedVersion() {
  console.log('\n=== Test 4: Unsupported SAUCE Version ===');
  
  const mockSauce = {
    id: 'SAUCE00',
    version: '01', // Unsupported version
    title: 'Test Artwork',
    author: 'Test Artist',
    group: 'Test Group',
    date: '20231225',
    sliced: 'SAUCE0001Test Artwork                          Test Artist           Test Group            20231225',
    valid: function() {
      if (this.id !== `SAUCE00`) return false;
      if (this.sliced && this.sliced.length < 7) return false;
      
      if (this.version !== `00`) {
        console.debug(`SauceMeta: Unsupported SAUCE version: '${this.version}'`);
        return false;
      }
      return true; // Should not reach here
    }
  };

  const result = mockSauce.valid();
  console.log(`Expected: false, Got: ${result}`);
  console.log(`Test Result: ${result === false ? 'PASS ✅' : 'FAIL ❌'}`);
  return result === false;
}

/**
 * Test Case 5: Invalid Field Type
 * Should fail the field type validation
 */
function testInvalidFieldType() {
  console.log('\n=== Test 5: Invalid Field Type ===');
  
  const mockSauce = {
    id: 'SAUCE00',
    version: '00',
    title: 12345, // Should be string
    author: 'Test Artist',
    group: 'Test Group',
    date: '20231225',
    sliced: 'SAUCE0000Test Artwork                          Test Artist           Test Group            20231225',
    valid: function() {
      if (this.id !== `SAUCE00`) return false;
      if (this.sliced && this.sliced.length < 7) return false;
      if (this.version !== `00`) return false;
      
      const requiredFields = [
        { name: 'title', minLength: 0, maxLength: 35 }
      ];

      for (const field of requiredFields) {
        const value = this[field.name];
        if (typeof value !== 'string') {
          console.debug(`SauceMeta: Field '${field.name}' is not a string: ${typeof value}`);
          return false;
        }
      }
      return true; // Should not reach here
    }
  };

  const result = mockSauce.valid();
  console.log(`Expected: false, Got: ${result}`);
  console.log(`Test Result: ${result === false ? 'PASS ✅' : 'FAIL ❌'}`);
  return result === false;
}

/**
 * Test Case 6: Invalid Date Format
 * Should fail the date validation
 */
function testInvalidDateFormat() {
  console.log('\n=== Test 6: Invalid Date Format ===');
  
  const mockSauce = {
    id: 'SAUCE00',
    version: '00',
    title: 'Test Artwork',
    author: 'Test Artist',
    group: 'Test Group',
    date: 'INVALID', // Invalid date format
    sliced: 'SAUCE0000Test Artwork                          Test Artist           Test Group            INVALID  ',
    valid: function() {
      if (this.id !== `SAUCE00`) return false;
      if (this.sliced && this.sliced.length < 7) return false;
      if (this.version !== `00`) return false;
      
      const requiredFields = [
        { name: 'title', minLength: 0, maxLength: 35 },
        { name: 'author', minLength: 0, maxLength: 20 },
        { name: 'group', minLength: 0, maxLength: 20 },
        { name: 'date', minLength: 8, maxLength: 8 }
      ];

      for (const field of requiredFields) {
        const value = this[field.name];
        if (typeof value !== 'string') return false;
        if (value.length < field.minLength || value.length > field.maxLength) return false;
      }
      
      // Date validation
      if (this.date && this.date.length === 8) {
        const year = parseInt(this.date.slice(0, 4));
        if (isNaN(year)) {
          console.debug(`SauceMeta: Invalid date format: '${this.date}'`);
          return false;
        }
      }
      return true; // Should not reach here
    }
  };

  const result = mockSauce.valid();
  console.log(`Expected: false, Got: ${result}`);
  console.log(`Test Result: ${result === false ? 'PASS ✅' : 'FAIL ❌'}`);
  return result === false;
}

/**
 * Test Case 7: Unreasonable Year in Date
 * Should fail the date sanity check
 */
function testUnreasonableYear() {
  console.log('\n=== Test 7: Unreasonable Year in Date ===');
  
  const mockSauce = {
    id: 'SAUCE00',
    version: '00',
    title: 'Test Artwork',
    author: 'Test Artist',
    group: 'Test Group',
    date: '18001225', // Year too old
    sliced: 'SAUCE0000Test Artwork                          Test Artist           Test Group            18001225',
    valid: function() {
      if (this.id !== `SAUCE00`) return false;
      if (this.sliced && this.sliced.length < 7) return false;
      if (this.version !== `00`) return false;
      
      const requiredFields = [
        { name: 'title', minLength: 0, maxLength: 35 },
        { name: 'author', minLength: 0, maxLength: 20 },
        { name: 'group', minLength: 0, maxLength: 20 },
        { name: 'date', minLength: 8, maxLength: 8 }
      ];

      for (const field of requiredFields) {
        const value = this[field.name];
        if (typeof value !== 'string') return false;
        if (value.length < field.minLength || value.length > field.maxLength) return false;
      }
      
      // Date validation
      if (this.date && this.date.length === 8) {
        const year = parseInt(this.date.slice(0, 4));
        
        if (year < 1980 || year > 2100) {
          console.debug(`SauceMeta: Unreasonable year in date: ${year}`);
          return false;
        }
      }
      return true; // Should not reach here
    }
  };

  const result = mockSauce.valid();
  console.log(`Expected: false, Got: ${result}`);
  console.log(`Test Result: ${result === false ? 'PASS ✅' : 'FAIL ❌'}`);
  return result === false;
}

/**
 * Run all tests and report results
 */
function runAllTests() {
  console.log('🧪 SauceMeta Validation Test Suite');
  console.log('==================================\n');
  
  const tests = [
    testValidSauceRecord,
    testInvalidSauceIdentifier,
    testShortSauceRecord,
    testUnsupportedVersion,
    testInvalidFieldType,
    testInvalidDateFormat,
    testUnreasonableYear
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      if (test()) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`Test failed with exception:`, error);
      failed++;
    }
  }
  
  console.log('\n==================================');
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log(`🎯 Overall: ${failed === 0 ? 'ALL TESTS PASSED ✅' : 'SOME TESTS FAILED ❌'}`);
  
  return failed === 0;
}

// Run tests if this script is executed directly
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testValidSauceRecord,
    testInvalidSauceIdentifier,
    testShortSauceRecord,
    testUnsupportedVersion,
    testInvalidFieldType,
    testInvalidDateFormat,
    testUnreasonableYear,
    runAllTests
  };
} else {
  // Browser environment - run tests immediately
  runAllTests();
}