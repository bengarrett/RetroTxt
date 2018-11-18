module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    webextensions: true
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 2017
  },
  rules: {
    "no-console": ["off"],
    quotes: ["error", "backtick"]
  },
  // set to false to make global vars read-only
  globals: {
    BBS: false,
    BrowserEncodings: false,
    BuildEcma48: false,
    BusySpinner: false,
    CharacterSet: false,
    Characters: false,
    CheckArguments: false,
    CheckError: false,
    CheckRange: false,
    Configuration: false,
    Contrast: false,
    CreateLink: false,
    DisplayAlert: false,
    DOSText: false,
    FindControlSequences: false,
    FindEngine: false,
    FontFamily: false,
    Guess: false,
    HumaniseCamelCase: false,
    HumaniseFS: false,
    HardwarePalette: false,
    ParseToChildren: false,
    QUnit: false,
    OptionsReset: false,
    RetroTxt: false,
    SAUCE: false,
    StringToBool: false,
    ToggleScanlines: false,
    ToggleTextEffect: false,
    Transcode: false
  }
}
