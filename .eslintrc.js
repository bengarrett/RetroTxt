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
  // To make global variables, read-only.
  globals: {
    BBS: "readonly",
    Controls: "readonly",
    BrowserEncodings: "readonly",
    BusySpinner: "readonly",
    CharacterSet: "readonly",
    Characters: "readonly",
    CheckArguments: "readonly",
    CheckError: "readonly",
    CheckRange: "readonly",
    Configuration: "readonly",
    Contrast: "readonly",
    CreateLink: "readonly",
    DisplayAlert: "readonly",
    DisplayEncodingAlert: "readonly",
    DOSText: "readonly",
    FindControlSequences: "readonly",
    FindDarkScheme: "readonly",
    FindEngine: "readonly",
    FindOS: "readonly",
    FontFamily: "readonly",
    Guess: "readonly",
    HumaniseCamelCase: "readonly",
    HumaniseFS: "readonly",
    HardwarePalette: "readonly",
    ParseToChildren: "readonly",
    QUnit: "readonly",
    OptionsReset: "readonly",
    RetroTxt: "readonly",
    SAUCE: "readonly",
    StringToBool: "readonly",
    TagBlockCharacters: "readonly",
    ToggleScanlines: "readonly",
    ToggleTextEffect: "readonly",
    Transcode: "readonly"
  }
}
