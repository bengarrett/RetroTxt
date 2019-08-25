// spellcheck-off
// Configuration for Mozilla's web-ext CLI tool
// For options: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/web-ext_command_reference
module.exports = {
  // Global options:
  // by default, any file ending in .xpi or .zip is ignored
  // any hidden file (one that starts with a dot) is ignored
  // any directory named node_modules is ignored
  ignoreFiles: [
    `assets/snaps/options_config-chrome.png`,
    `assets/snaps/preview_permissions-chrome.png`,
    `css/options_chrome.css`,
    `md`,
    `fonts/!(woff2)`,
    `manifest_*.json`,
    `*.md`,
    `html/options_chrome.html`,
    `package.json`,
    `package-lock.json`,
    `libs/tippyjs/README.md`,
    `test`,
    `tools`,
    `web-ext-chrome.js`,
    `web-ext-config.js`,
    `yarn.lock`,
    `*.yml`
  ],
  verbose: false,
  // Command options:
  build: {
    overwriteDest: true
  },
  run: {
    browserConsole: true,
    // Browser to run, either `firefox`, `firefoxdeveloperedition`
    firefox: `firefox`,
    // start URL
    startUrl: [`https://retrotxt.com/test/`, `https://retrotxt.com/e/`]
  }
}
