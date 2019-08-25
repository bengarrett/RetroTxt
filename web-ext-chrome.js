// spellcheck-off
// Configuration for Mozilla's web-ext CLI tool
// This is used by `task build-chrome` to create a Chrome specific package
// for submission to the chrome web store
module.exports = {
  // Global options:
  // by default, any file ending in .xpi or .zip is ignored
  // any hidden file (one that starts with a dot) is ignored
  // any directory named node_modules is ignored
  ignoreFiles: [
    `assets/snaps/options_config-firefox.png`,
    `assets/snaps/preview_permissions-firefox.png`,
    `css/options_firefox.css`,
    `md`,
    `fonts/!(woff2)`,
    `manifest_*.json`,
    `*.md`,
    `html/options_firefox.html`,
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
  }
}
