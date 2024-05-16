// .web-ext-chrome.js
// Configuration for Mozilla's web-ext CLI tool
// For options: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/web-ext_command_reference
module.exports = {
  // Global options:
  // by default, any file ending in .xpi or .zip is ignored
  // any hidden file (one that starts with a dot) is ignored
  // any directory named node_modules is ignored
  ignoreFiles: [
    `json/font_info.json`,
    `manifest_*.json`,
    `*.md`,
    `package.json`,
    `package-lock.json`,
    `*.py`,
    `test`,
    `.web-ext-*.js`,
    `fonts/woff2.sh`,
    `*.lock`,
    `*.yml`,
  ],
  verbose: false,
  // Command options:
  build: {
    overwriteDest: true,
  },
}
/* global module */
