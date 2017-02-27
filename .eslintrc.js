module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "qunit": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 6,
        "impliedStrict": true
    },
    "rules": {
        "no-console": 0,
        "no-fallthrough": ["error", { "commentPattern": "break[\\s\\w]*omitted" }],
        "no-unused-vars": ["error", { "vars": "local" }],
        "indent": ["error", 2, { "SwitchCase": 1 }],
        "linebreak-style": [
            "off"
        ],
        "quotes": [
            "error",
            "backtick"
        ],
        "semi": [
            "error",
            "never"
        ]
    }
};