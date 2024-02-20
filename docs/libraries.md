Libraries in use and programming patterns.

Move the in-code comments about justifications over here.

All web-extension JS, CSS and HTML should be in UTF-8 using Unix-style LF controls.

"bulma": "^0.9.4",
Bulma is a light-weight CSS framework used by the Options page.
TODO: list justifications and reasoning vs other framework.

"linkify-element": "^4.1.3",
"linkify-plugin-ip": "^4.1.3",
"linkifyjs": "^4.1.3",
LinkifyJS provides ...


"dompurify": "^3.0.6",
DOM purify is a requirement of LinkifyJS


"qunit": "^2.20.0"
QUnit is the testing library for...

Developer dependencies

"ajv": "^8.12.0",

"dot-json": "^1.3.0",
dot-json injects the current version variable into the package
manifest.json files.

"eslint": "^8.56.0",
"eslint-config-prettier": "^9.1.0",
"eslint-plugin-prettier": "^4.2.1",
ESlint is a JS linter for xxx.
To maintain cross-compatiblity with Prettier, so there are
no conflicting styles, eslint-plugin-prettier is in use.

Discuss eslint testings and justifications.
  "plugins": ["prettier"],
  // extends order is important
  "extends": ["eslint:recommended", "plugin:prettier/recommended"],
  "env": {
    "browser": true,
    "es2020": true,
    "serviceworker": true,
    "webextensions": true
  },
  "ignorePatterns": ["**/*.html", ".github"],
  "rules": {
    "prettier/prettier": "error"
  }

"prettier": "^2.8.8",
Prettier is a source code formatter. We keep all the default
settings except those kept in .prettierrc.
Which currently only contains semi:false.

"shx": "^0.3.4",
SHX allows the running of shell commands in JS or node.
This is used to copy the dependencies from the node_modules
to the sub-directories of the extension.

"wawoff2": "^2.0.1",
Is a woff font coverter that runs in the terminal, most
older font libraries do not include the modern .woff2 format.
It's supported by all platforms used by the webapp and offers
better compression, than WOFF2 or TTF. This means a smaller
web extension package and possibly lower memory use?

"web-ext": "^7.9.0"
Web-Ext is created by Mozilla and is used to build the
web extension zip package, that gets submitted to the
Chrome or Microsoft stores. It relies on `.web-ext-chrome.js`.

Taskfile.yml usage...

pnpm over npm or yarn use to is compact libraries etc.

mkdocs...
Is used to create the HTML documentation.
It converts custom markdown syntax into HTML that gets
hosted on ...