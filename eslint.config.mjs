// eslint.config.mjs
// ESLint flat configuration for JavaScript and JavaScript modules.
import globals from "globals"
import js from "@eslint/js"

export default [
  {
    ignores: ["ext/js/**"],
  },
  js.configs.recommended,
  {
    files: ["ext/.web-ext-chrome.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  {
    files: ["ext/scripts/**/*.js", "test/**/*"],
    languageOptions: {
      ecmaVersion: "latest",
      parserOptions: {
        ecmaFeatures: {
          impliedStrict: true,
        },
      },
      globals: {
        ...globals.browser,
        browser: "readonly", // browser is for firefox only
        chrome: "readonly",
      },
    },
  },
]
