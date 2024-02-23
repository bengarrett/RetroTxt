---
title: Libraries in use
authors:
    - Ben Garrett
date: 2024-02-20
hide:
  - toc
---
# Libraries in use

## Package management

[PnpM](https://pnpm.io/) is a replacement for the [npm application](https://www.npmjs.com/) for its speed and reduced hard drive space. It is a drop-in replacement for npm and [yarn](https://yarnpkg.com/), and it is compatible with the universal `package.json` file.

## Build tool

The [Task](https://taskfile.dev/) application is a runner and software build tool that is a single point for all the functions needed to build the web extension. Tasks can be run in a terminal or a Windows command line.
```
$ cd RetroTxt
$ task --list

task: Available tasks for this project:
* builds:              Creates submission packages for Chrome.
* checks:              Check, run and print the versions of the task commands and dependencies.
* commit:              Applies the VERSION variable to the JSON files and commits it to GitHub.
* default:             List the available tasks.
* depends:             Copies the latest dependencies over to the package.
* docs-build:          Build the current documentation in use on https://docs.retrotxt.com.
* docs-serve:          Run an internal server to view the documentation in `docs`.
* init:                Initialises this repository for first time use after being cloned.
* update:              Update to the latest dependencies.
* version-purge:       Removes the current VERSION variable value as a tag from the GitHub repository.
* version-set:         Applies the VERSION in Taskfile.yml variable value to the manifest.json and package.json files.
```

## Documentation

This text and other documentation are in [Markdown](https://www.markdownguide.org/basic-syntax/). The documents are converted into HTML using the [MkDocs](https://www.mkdocs.org/) static site generator that is geared towards software documentation. The generated HTML is then hosted on GitHub Pages and is available at [https://docs.retrotxt.com](https://docs.retrotxt.com).

## Bulma

[Bulma](https://bulma.io/) (`bulma.min.css`) is a lightweight CSS framework used by the Options Page of the web extension. While large at over 200 KB, this size doesn't matter when used within a web extension loaded locally by the browser.

Bulma offers logical class naming conventions and extensive and responsive layout theming.

## DOM purify

[DOM purify](https://github.com/cure53/DOMPurify) (`purify.js`) is used to sanitize and prevent XSS attacks using innerHTML property values based on text loaded from unknown files and websites.

## LinkifyJS

[Linkify](https://linkify.js.org/) (`linkify.js`) is an optional feature for users to find links within plain text and convert them to HTML anchor link tags. It automatically stresses URLs, social media #hashtags, @mentions, and emails.

While Linkify detects links in plain text, the code uses the `linkify-element` library to replace links within native DOM elements.

The Linkify IP Address Plugin (`linkify-plugin-ip`) supports detecting IPv4 and some limited IPv6 addresses.

## QUnit

[QUnit](https://qunitjs.com/) (`qunit.js`, `qunit.css`) provides unit testing for standalone helper functions and classes within the JS codebase. The coverage for tests could be better, and user interface features of the web extension remain without automated testing.

QUnit has a relatively easy syntax and shows the results of the tests in the browser.

# Internal libraries

## Ajv

[Ajv](https://ajv.js.org/) (`ajv.js`) is the JSON schema validator that some other libraries use.

## dot-json

[dot-json](https://github.com/maikelvl/dot-json) provides the means to edit a JSON file using the command line. In the code, the library updates the version values of the web extension `manifest.json` and the `package.json` package management files.

## ESlint

[ESLint](https://eslint.org/) finds and fixes problems with the JS code. It is popular within the coding community, and all JS code is valid against it.

> ESLint is a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code, with the goal of making code more consistent and avoiding bugs.

The `.eslintrc.json` file configures ESLint to be compatible with the Prettier source code formatting library and support Manifest V3 specific JS features.

## Prettier

[Prettier](https://prettier.io/) is an opinionated CSS, HTML, JS, and markdown source code formatter. All the default format and syntax settings are in use except for the print semicolumns in the JS option, which is off.

## shx

[shx](https://github.com/shelljs/shx) allows the running of shell commands in both JS and Node.JS.
shx is used to file copy dependencies from the npm `node_modules/` package directories to the sub-directories of the web extension.

## wawoff2

[wawoff2](https://github.com/fontello/wawoff2) is a [WOFF font](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_fonts/WOFF) converter that runs in the terminal to handle older font packages that do not contain the WOFF2 format that offers better file compression.

All browsers used by the web extension support WOFF2, and the format offers better compression than the older WOFF or TTF. With the large number of fonts used by the web extension, better compression leads to a smaller package size and download.

## Web-ext

[Web-ext](https://github.com/mozilla/web-ext) is by Mozilla, the creators of the [Firefox browser](https://www.mozilla.org/en-US/firefox/), and is used to build a compressed zip package that gets submitted to the
[Chrome](https://chromewebstore.google.com/detail/retrotxt/gkjkgilckngllkopkogcaiojfajanahn) and [Microsoft](https://microsoftedge.microsoft.com/addons/detail/retrotxt/hmgfnpgcofcpkgkadekmjdicaaeopkog) web extension stores.

A simple configuration file can be found in `.web-ext-chrome.js`.

The [web-ext command reference](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/) is available for more information.