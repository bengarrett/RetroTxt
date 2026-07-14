// qunit-bridge.js
window.failedAssertions = [];

QUnit.log((details) => {
  if (!details.result) {
    window.failedAssertions.push({
      module: details.module,
      name: details.name,
      message: details.message,
      expected: details.expected,
      actual: details.actual,
    });
  }
});

QUnit.done((details) => {
  window.QUnit.doneCalled = true;
  window.QUnit.testResults = details;
  window.QUnit.failedAssertions = window.failedAssertions;
});
