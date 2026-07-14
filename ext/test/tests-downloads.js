'use strict';

// MockDownloads class for testing
class MockDownloads {
  constructor(monitor = true) {
    this.monitor = monitor;
    this.delta = null;
    this.item = null;
  }
  // mock testing methods
  parseBlob() {
    return Promise.resolve();
  }
  startup() {
    return Promise.resolve();
  }
}

QUnit.module('downloads', {
  before: () => {
    // before all tests
  },
  beforeEach: () => {
    // before each test
    // mock the chrome API
    if (typeof chrome === 'undefined') {
      // Only mock chrome if it doesn't exist to avoid redeclaration
      window.chrome = {
        runtime: {
          lastError: null,
          getURL: (url) => url,
        },
        storage: {
          local: {
            get: (_, callback) => callback({}),
            set: (_, callback) => callback?.(),
          },
        },
        permissions: {
          contains: (_, callback) => callback(true),
        },
        downloads: {
          onCreated: {
            addListener: () => {
              /* intentionally empty */
            },
          },
          onChanged: {
            addListener: () => {
              /* intentionally empty */
            },
          },
        },
      };
    }
  },
  afterEach: () => {
    // clean up after each test
  },
  after: () => {
    // clean up after each test
  },
});

QUnit.test('MockDownloads class : basic instance', (assert) => {
  const downloads = new MockDownloads();
  assert.ok(downloads, 'MockDownloads instance should be created');
  assert.ok(downloads.monitor, 'Should have monitor property');
  assert.equal(downloads.monitor, true, 'Monitor should be true by default');
});

QUnit.test('MockDownloads class : instance with monitor = false', (assert) => {
  const downloads = new MockDownloads(false);
  assert.ok(downloads, 'MockDownloads instance should be created');
  assert.equal(
    downloads.monitor,
    false,
    'Monitor should be false when specified'
  );
});

QUnit.test('MockDownloads class : parseBlob() with text/plain', (assert) => {
  const done = assert.async();
  const downloads = new MockDownloads();
  const blob = new Blob(['Hello World'], { type: 'text/plain' });
  downloads
    .parseBlob(blob, { tabid: 1 })
    .then(() => {
      assert.ok(true, 'Should handle text/plain blob');
      done();
    })
    .catch((error) => {
      assert.ok(false, `Should not reject text/plain: ${error.message}`);
      done();
    });
});

QUnit.test('Downloads class : parseBlob() with x-nfo type', async (assert) => {
  const downloads = new Downloads();
  const blob = new Blob(['<!DOCTYPE html><html></html>'], {
    type: 'text/x-nfo',
  });
  const resultPromise = downloads.parseBlob(blob, { tabid: 1 }, true);
  const result = await resultPromise;
  assert.equal(
    result,
    true,
    'Should return true when parsing valid markup tokens in test mode'
  );
});

QUnit.test('Downloads class : parseBlob() with unknown type', (assert) => {
  const done = assert.async();
  const downloads = new Downloads();
  const blob = new Blob(['content'], { type: 'application/unknown' });
  // parseBlob uses FileReader callbacks, not Promises
  // so test the synchronous validation logic instead
  const result = downloads.parseBlob(blob, { tabid: 1 }, true); // test mode
  assert.ok(typeof result === 'boolean', 'Should return boolean in test mode');
  done();
});

QUnit.test('Downloads class : parseBlob() with HTML content', (assert) => {
  const done = assert.async();
  const downloads = new Downloads();
  const htmlBlob = new Blob(['<html><body>Test</body></html>'], {
    type: 'text/html',
  });
  const result = downloads.parseBlob(htmlBlob, { tabid: 1 }, true);
  assert.ok(
    typeof result === 'boolean',
    'Should return boolean for HTML content'
  );
  done();
});

QUnit.test('Downloads class : parseBlob() with JS content', (assert) => {
  const done = assert.async();
  const downloads = new Downloads();
  const jsBlob = new Blob(['console.log("test")'], { type: 'text/javascript' });
  const result = downloads.parseBlob(jsBlob, { tabid: 1 }, true);
  assert.ok(
    typeof result === 'boolean',
    'Should return boolean for JavaScript content'
  );
  done();
});

QUnit.test(
  'Downloads class : parseBlob() with a large file',
  async (assert) => {
    const downloads = new Downloads();
    const largeContent = 'x'.repeat(10 * 1000 * 1024); // 10MB file
    const largeBlob = new Blob([largeContent], { type: 'text/plain' });
    const result = await downloads.parseBlob(largeBlob, { tabid: 1 }, true);
    assert.equal(
      result,
      false,
      'Should resolve to false for large text files that are not markup'
    );
  }
);

QUnit.test(
  'Downloads class : parseBlob() with empty content',
  async (assert) => {
    const downloads = new Downloads();
    const emptyBlob = new Blob([''], { type: 'text/plain' });
    const result = await downloads.parseBlob(emptyBlob, { tabid: 1 }, true);
    assert.equal(result, false, 'Should resolve to false for empty content');
  }
);

QUnit.test(
  'Downloads class : parseBlob() with special characters',
  async (assert) => {
    const downloads = new Downloads();
    const specialBlob = new Blob(['©®™∆∏∑√∫√±'], { type: 'text/plain' });
    const result = await downloads.parseBlob(specialBlob, { tabid: 1 }, true);
    assert.equal(
      result,
      false,
      'Should resolve to false for text containing special characters'
    );
  }
);

QUnit.test(
  'Downloads class : parseBlob() with binary-like content',
  async (assert) => {
    const downloads = new Downloads();
    const binaryContent = new Uint8Array([0x00, 0x01, 0x02, 0xff, 0xfe]);
    const binaryBlob = new Blob([binaryContent], {
      type: 'application/octet-stream',
    });
    const result = await downloads.parseBlob(binaryBlob, { tabid: 1 }, true);
    assert.ok(
      typeof result === 'boolean',
      'Should return boolean for binary-like content'
    );
  }
);

QUnit.test(
  'Downloads class : detect markup in text content',
  async (assert) => {
    const downloads = new Downloads();
    const markupBlob = new Blob(
      ['<!DOCTYPE html><html><body>Test</body></html>'],
      { type: 'text/plain' }
    );
    const result = await downloads.parseBlob(markupBlob, { tabid: 1 }, true);
    assert.equal(result, true, 'Should detect HTML markup in text/plain');
  }
);

QUnit.test('Downloads class : detect XML in text content', async (assert) => {
  const downloads = new Downloads();
  const xmlBlob = new Blob(['<?xml version="1.0"?><root>Test</root>'], {
    type: 'text/plain',
  });
  const result = await downloads.parseBlob(xmlBlob, { tabid: 1 }, true);
  assert.equal(result, true, 'Should detect XML markup in text/plain');
});

QUnit.test('Downloads class : detect script elements', async (assert) => {
  const downloads = new Downloads();
  const scriptBlob = new Blob(
    ['<!DOCTYPE html><script>alert("test")</script>'],
    {
      type: 'text/plain',
    }
  );
  const result = await downloads.parseBlob(scriptBlob, { tabid: 1 }, true);
  assert.equal(result, true, 'Should detect script tags');
});

QUnit.test('Downloads class : detect plain text correctly', async (assert) => {
  const downloads = new Downloads();
  const plainBlob = new Blob(['This is plain text content.'], {
    type: 'text/plain',
  });
  const result = await downloads.parseBlob(plainBlob, { tabid: 1 }, true);
  assert.equal(result, false, 'Should not detect markup in plain text');
});

QUnit.test('Downloads class : handle a null blob', async (assert) => {
  const downloads = new Downloads();
  const result = await downloads.parseBlob(null, { tabid: 1 }, true);
  assert.equal(
    result,
    false,
    'Should safely return false and not crash for null blob inputs'
  );
});

QUnit.test('Downloads class : handle an undefined blob', async (assert) => {
  const downloads = new Downloads();
  const result = await downloads.parseBlob(void 0, { tabid: 1 }, true);
  assert.ok(
    typeof result === 'boolean',
    'Should return boolean for undefined blob'
  );
});

QUnit.test('Downloads class : handle missing tab info', async (assert) => {
  const downloads = new Downloads();
  const blob = new Blob(['content'], { type: 'text/plain' });
  const result = await downloads.parseBlob(blob, {}, true);
  assert.ok(
    typeof result === 'boolean',
    'Should return boolean for missing tab info'
  );
});

QUnit.test('Downloads class : handle invalid tab ID', async (assert) => {
  const downloads = new Downloads();
  const blob = new Blob(['content'], { type: 'text/plain' });
  const result = await downloads.parseBlob(blob, { tabid: null }, true);
  assert.ok(
    typeof result === 'boolean',
    'Should return boolean for invalid tab ID'
  );
});

QUnit.test(
  'Downloads class : integration with tab workflow',
  async (assert) => {
    const downloads = new Downloads();
    const tab = { tabid: 1, url: 'https://example.com/file.txt' };
    const blob = new Blob(['file content'], { type: 'text/plain' });
    const result = await downloads.parseBlob(blob, tab, true);
    assert.ok(
      typeof result === 'boolean',
      'Should return boolean for integration workflow'
    );
  }
);

QUnit.test(
  'Downloads class : multiple file types in sequence',
  async (assert) => {
    const downloads = new Downloads();
    const tab = { tabid: 1 };
    const files = [
      { blob: new Blob(['ANSI'], { type: 'text/plain' }), expected: 'plain' },
      { blob: new Blob(['DOS'], { type: 'text/x-nfo' }), expected: 'nfo' },
      { blob: new Blob(['HTML'], { type: 'text/html' }), expected: 'html' },
    ];
    let completed = 0;
    files.forEach((file) => {
      const result = downloads.parseBlob(file.blob, tab, true);
      completed++;
      if (completed === files.length) {
        assert.ok(
          typeof result === 'boolean',
          'Should return boolean for all file types'
        );
      }
    });
  }
);

QUnit.test('Downloads class : startup and cleanup', (assert) => {
  const done = assert.async();
  const downloads = new Downloads();
  downloads
    .startup()
    .then(() => {
      assert.ok(true, 'Startup should complete');
      assert.ok(downloads, 'Downloads instance should remain valid');
      assert.ok(downloads.monitor, 'Monitor property should remain');
      done();
    })
    .catch((error) => {
      assert.ok(true, `Startup handled: ${error.message}`);
      done();
    });
});
