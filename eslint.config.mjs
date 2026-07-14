// eslint.config.mjs
// ESLint flat configuration for JavaScript and JavaScript modules.
import globals from 'globals';
import js from '@eslint/js';
import css from '@eslint/css';

export default [
  {
    ignores: [
      'ext/js/**',
      'ext/test/qunit.js',
      'site/assets/javascripts/**',
      '**/*.min.js',
      '**/*.min.css',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    rules: {
      ...js.configs.recommended.rules,
    },
  },
  //js.configs.recommended,
  {
    files: ['ext/.web-ext-chrome.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  {
    files: ['ext/scripts/test-webextension-proper.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: [
      // 'ext/scripts/**/*.js',
      // '!ext/scripts/test-webextension-proper.js',
      // 'test/**/*',
      'ext/scripts/**/*.js',
      '!ext/scripts/test-webextension-proper.js',
      'test/**/*.js',
      'test/**/*.mjs',
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      parserOptions: {
        ecmaFeatures: {
          impliedStrict: true,
        },
      },
      globals: {
        ...globals.browser,
        browser: 'readonly', // browser is for firefox only
        chrome: 'readonly',
      },
    },
    linterOptions: {
      noInlineConfig: false,
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      'no-useless-assignment': 'error',
      'require-atomic-updates': 'error',
      'accessor-pairs': 'warn',
      'symbol-description': 'warn',
      'no-eval': 'error',
      'no-empty-function': 'warn',
      'no-empty': 'warn',
      'no-else-return': 'warn',
      'no-bitwise': 'warn',
      'no-var': 'warn',
      'no-undefined': 'warn',
      'no-undef-init': 'warn',
      'no-useless-constructor': 'warn',
      'no-useless-concat': 'warn',
      'no-useless-computed-key': 'warn',
      'no-unneeded-ternary': 'warn',
      'prefer-template': 'warn',
      'prefer-spread': 'warn',
      'prefer-rest-params': 'warn',
      'prefer-const': 'warn',
      'prefer-arrow-callback': 'warn',
      'operator-assignment': 'warn',
      'no-throw-literal': 'warn',
      'no-script-url': 'warn',
      'no-return-assign': 'warn',
      'no-proto': 'warn',
      'no-param-reassign': 'warn',
      'no-octal-escape': 'warn',
      'no-object-constructor': 'warn',
      'no-new-wrappers': 'warn',
      'no-new-func': 'warn',
      'no-new': 'warn',
      'no-nested-ternary': 'warn',
      'no-negated-condition': 'warn',
      'no-multi-assign': 'warn',
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
      'no-loop-func': 'warn',
      'no-lonely-if': 'warn',
      'no-implied-eval': 'warn',
      'no-implicit-globals': 'warn',
      'no-implicit-coercion': 'warn',
      'default-case-last': 'warn',
      'dot-notation': 'warn',
      eqeqeq: 'warn',
      'no-extend-native': 'error',
    },
  },
  // Qunit tests files
  {
    files: [
      'ext/test/tests-expanded-examples.js',
      'ext/test/tests-file-examples.js',
      'ext/test/tests-helpers.js',
      'ext/test/tests-parse_ansi-sequences.js',
      'ext/test/tests-parse_ansi.js',
      'ext/test/tests-parse_dos.js',
      'ext/test/tests-retrotxt.js',
      'ext/test/tests-xss.js',
    ],
    languageOptions: {
      globals: {
        ...globals.qunit,
      },
    },
    rules: {
      'no-undefined': 'off',
    },
  },
  {
    files: ['ext/test/tests-errors.js'],
    languageOptions: {
      globals: {
        ...globals.qunit,
        Security: 'readonly',
      },
    },
    rules: {
      'no-undefined': 'off',
    },
  },
  {
    files: ['ext/test/tests-downloads.js'],
    languageOptions: {
      globals: {
        ...globals.qunit,
        Downloads: 'readonly',
      },
    },
    rules: {
      'no-undefined': 'off',
    },
  },
  {
    files: ['ext/test/tests-security.js'],
    languageOptions: {
      globals: {
        ...globals.qunit,
        global: 'readonly',
      },
    },
    rules: {
      'no-undefined': 'off',
    },
  },
  // Puppeteer test files
  {
    files: [
      'ext/test/autogen-benchmark-1.mjs',
      'ext/test/autogen-benchmark-2.mjs',
      'ext/test/autogen-benchmark.mjs',
      'ext/test/autogen-lint-security.mjs',
      'ext/test/autogen-metric.mjs',
      'ext/test/autogen-webextension.mjs',
      'ext/test/qunit-headless.mjs',
      'ext/test/qunit-puppeteer.mjs',
      'ext/test/qunit-simple.mjs',
      'ext/test/qunit-terminal.mjs',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-undefined': 'off',
    },
  },
  // CSS support, https://eslint.org/blog/2025/02/eslint-css-support/
  {
    files: ['ext/css/**/*.css'],
    language: 'css/css',
    ...css.configs.recommended,
    rules: {
      ...css.configs.recommended.rules,
      'require-atomic-updates': 'off',
      'no-irregular-whitespace': 'off',
      'no-useless-assignment': 'off',
      'css/use-baseline': 'off',
      'css/font-family-fallbacks': 'off',
      'css/no-invalid-properties': [
        'error',
        {
          allowUnknownVariables: true,
        },
      ],
    },
  },
];
