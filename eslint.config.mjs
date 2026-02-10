// eslint.config.mjs
// ESLint flat configuration for JavaScript and JavaScript modules.
import globals from "globals"
import js from "@eslint/js"
import css from "@eslint/css"

export default [
  // CSS support, https://eslint.org/blog/2025/02/eslint-css-support/
  {
    files: ["**/*.css"],
    language: "css/css",
    ...css.configs.recommended,
  },
  {
    ignores: ["ext/js/**"],
  },
  js.configs.recommended,
  {
    files: ["ext/.web-ext-chrome.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  {
    files: ["ext/scripts/test-webextension-proper.js"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ["ext/scripts/**/*.js", "!ext/scripts/test-webextension-proper.js", "test/**/*"],
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
    linterOptions: {
      noInlineConfig: false,
      reportUnusedDisableDirectives: "error",
    },
    rules: {
      "no-useless-assignment": "error",
      "require-atomic-updates": "error",
      "accessor-pairs": "warn",
      "symbol-description": "warn",
      "no-eval": "error",
      "no-empty-function": "warn",
      "no-empty": "warn",
      "no-else-return": "warn",
      "no-bitwise": "warn",
      "no-var": "warn",
      "no-undefined": "warn",
      "no-undef-init": "warn",
      "no-useless-constructor": "warn",
      "no-useless-concat": "warn",
      "no-useless-computed-key": "warn",
      "no-unneeded-ternary": "warn",
      "prefer-template": "warn",
      "prefer-spread": "warn",
      "prefer-rest-params": "warn",
      "prefer-const": "warn",
      "prefer-arrow-callback": "warn",
      "operator-assignment": "warn",
      "no-throw-literal": "warn",
      "no-script-url": "warn",
      "no-return-assign": "warn",
      "no-proto": "warn",
      "no-param-reassign": "warn",
      "no-octal-escape": "warn",
      "no-object-constructor": "warn",
      "no-new-wrappers": "warn",
      "no-new-func": "warn",
      "no-new": "warn",
      "no-nested-ternary": "warn",
      "no-negated-condition": "warn",
      "no-multi-assign": "warn",
      // "no-magic-numbers": [
      //   "warn",
      //   {
      //     ignore: [-1, 0, 1, 2],
      //     ignoreArrayIndexes: true,
      //     ignoreDefaultValues: true,
      //     ignoreClassFieldInitialValues: true,
      //     enforceConst: true,
      //   },
      // ],
      "no-loop-func": "warn",
      "no-lonely-if": "warn",
      "no-implied-eval": "warn",
      "no-implicit-globals": "warn",
      "no-implicit-coercion": "warn",
      "default-case-last": "warn",
      "dot-notation": "warn",
      eqeqeq: "warn",
      "no-extend-native": "error",
    },
  },
]
