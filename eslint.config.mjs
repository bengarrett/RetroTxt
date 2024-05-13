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
    files: ["ext/scripts/**/*.js", "test/**/*"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.browser,
        browser: "readonly", // browser is firefox only
        chrome: "readonly",
      },
    },
  },
]
