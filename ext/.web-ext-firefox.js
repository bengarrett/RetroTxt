// spellcheck-off
/*eslint-env node*/
// Configuration for Mozilla's web-ext CLI tool
// For options: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/web-ext_command_reference
module.exports = {
  // Global options:
  // by default, any file ending in .xpi or .zip is ignored
  // any hidden file (one that starts with a dot) is ignored
  // any directory named node_modules is ignored
  ignoreFiles: [
    `md`,
    `fonts/!(woff2)`,
    `manifest_*.json`,
    `*.md`,
    `html/options.html`,
    `package.json`,
    `package-lock.json`,
    `test`,
    `tools`,
    `.web-ext-*.js`,
    `yarn.lock`,
    `*.yml`,
  ],
  verbose: false,
  // Command options:
  build: {
    overwriteDest: true,
  },
  run: {
    browserConsole: true,
    // Browser to run, either `firefox`, `firefoxdeveloperedition`
    firefox: `firefox`,
    // start URL
    startUrl: [`https://retrotxt.com/test/`, `https://retrotxt.com/e/`],
  },
}
