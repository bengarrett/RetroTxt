# Files and directories

!!! warning "TODO"
    This document needs updating to RetroTxt v5, MV3.

These are the directories and files that comprise of RetroTxt source code.

!!! tip
    Items ending with a forward-slash `/` are directories<br>
    Items starting with a dot `.` are flagged as hidden

| Item | Purpose |
| ---- | ------- |
| `.github/` | [Github repository](https://github.com/bengarrett/RetroTxt) configuration |
| `.vscode/` | [Visual Studio Code](https://code.visualstudio.com) workspace settings |
| `docs/` | This documentation |
| **`ext/`** | The RetroTxt Extension root directory |
| `fonts/` | Original font packages with documentation and licences
| `.eslintrc.json` | [ESLint configuration file](https://eslint.org/docs/user-guide/configuring) |
| `.gitattributes` | The [Git](https://git-scm.com) settings file for this repository |
| `.gitignore` | The Git file to exclude items from being recorded |
| `LICENSE` | A copy of the [GNU Lesser General Public License](http://www.gnu.org/licenses/lgpl-3.0.en.html), Version 3 |
| `package.json` | [Yarn or npm configuration file](https://docs.npmjs.com/files/package.json) |

| Extension item | Purpose |
| ---- | ------- |
| `ext/manifest.json` | Active [Extension manifest file](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json) containing read-only metadata and configuration options |
| `ext/.web-ext-chrome.js` | [web-ext configuration file](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Getting_started_with_web-ext#Setting_option_defaults_in_a_configuration_file) for packaging a Chrome distribution package |
| `ext/.web-ext-firefox.js` | web-ext configuration file for packaging a Firefox distribution and all other web-ext commands |
| **`ext/_locales/`** | Spelling differences for the UK and US English |
|  ↳ `en_US/messages.json` | Shared variables for remote URLs and BBS software names |
| **`ext/assets/`** | PNG icons for RetroTxt |
|  ↳ `snaps/` | PNG screenshots used by the Options samples tab |
|  ↳ `svg/material-icons.svg` | SVG icons for the Options tab |
| **`ext/css/`** | Extension Cascading Style Sheets in CSS3 syntax |
| ↳ `bulma.min.css` | [Bulma CSS framework](https://bulma.io) used by the Options tab |
| ↳ `fonts_home.css` | Font faces and classes for the \_Home computers_fonts |
| ↳ `fonts_ibm.css` | Font faces and classes for the _IBM PC & family_ fonts |
| ↳ `fonts_modern.css` | Font faces and classes for the _Modern_ fonts |
| ↳ `layout.css` | Base elements styles |
| ↳ `options.css` | Styles specific for the Options tab |
| ↳ `retrotxt_loader.css` | An animated spinner to display during the RetroTxt processing |
| ↳ `retrotxt.css` | Scanlines, text size, the Mona font face and cursor stylings |
| ↳ `text_animation-off.css` | For the _Blinking cursor and text_ off Option |
| ↳ `text_colors_4bit-ice.css` | ANSI Select Graphic Rendition iCE Color classes |
| ↳ `text_colors_4bit.css` | ANSI Select Graphic Rendition colour classes |
| ↳ `text_colors_8bit.css` | Xterm 256 colours for ANSI colour classes |
| ↳ `text_colors_bbs.css` | Shared BBS colours and font styles |
| ↳ `text_colors_blink.css` | Simulate terminal blinking text |
| ↳ `text_colors_c64.css` | Commodore 64 ANSI color pallete |
| ↳ `text_colors_cga_0.css` | CGA 0 ANSI color pallete |
| ↳ `text_colors_cga_1.css` | CGA 1 ANSI color pallete |
| ↳ `text_colors_gray.css` | Monochrome ANSI color pallete |
| ↳ `text_colors_iigs.css` | Apple IIGS ANSI color pallete |
| ↳ `text_colors_pcboard.css` | PCBoard BBS colour classes |
| ↳ `text_colors_pipe.css` | Renegade BBS and other BBS software colours |
| ↳ `text_colors_vga.css` | VGA ANSI color pallete |
| ↳ `text_colors_workbench.css` | Amiga Workbench ANSI color pallete |
| ↳ `text_colors_wviv-pipe.css` | WVIV BBS and other BBS software colours |
| ↳ `text_colors_xterm.css` | Xterm ANSI color pallete |
| ↳ `text_colors.css` | Colours, _text pair_ classes |
| ↳ `text_ecma_48.css` | ANSI Select Graphic Rendition function classes |
| ↳ `text_pagewrap.css` | For the _ANSI Page wrap_ on option |
| **`ext/fonts/`** | [Compressed fonts](https://developer.mozilla.org/en-US/docs/Web/Guide/WOFF) used in RetroTxt |
| **`ext/html/`** | HTML5 assets |
| ↳ `options.html` | Template for the Options page |
| **`ext/json/`** | JSON, human-readable data stores |
| ↳ `manifest_chrome.json`| Extension manifest file for Chromium based browsers |
| ↳ `manifest_firefox.json`| Extension manifest file for Firefox browsers |
| **`ext/scripts/`** | Extension JavaScripts in ES6+ (ES2015) syntax |
| ↳ `eventpage.js` | Background functions and listeners that are completely isolated from all other scripts. |
| ↳ `functions.js` | Shared functions accessible to non-isolated scripts. |
| ↳ `options.js` | Isolated functions for the Options page located at `ext/html/options.html`. |
| ↳ `parse_ansi.js` | Functions to handle ANSI and ECMA-48 controls. |
| ↳ `parse_dos.js` | Functions to handle text encodings and DOS code pages. |
| ↳ `retrotxt.js` | Invokes RetroTxt, handles the browser page display and SAUCE metadata. |
| **`ext/test/`** | Unit and sample test files |
| ↳ `example_files/` | ASCII and ANSI text test cases for use with the `files:///` protocol |
| ↳ `example_files/bbs_sheets/` | BBS text test cases for use with the `files:///` protocol |
| ↳ `index.html` | Entry point for the QUnit tests |
| ↳ `qunit.css` | QUnit stylesheet |
| ↳ `qunit.js` | [QUnit](https://qunitjs.com) JavaScript testing framework application |
| ↳ `tests-eventpage.js` | QUnit tests for `ext/scripts/eventpage.js`|
| ↳ `tests-functions.js` | QUnit tests for `ext/scripts/functions.js` |
| ↳ `tests-options.js` | QUnit tests for `ext/scripts/options.js` |
| ↳ `tests-parse_ansi.js` | QUnit tests for `ext/scripts/parse_ansi.js` |
| ↳ `tests-parse_dos.js` | QUnit tests for `ext/scripts/parse_dos.js` |
| ↳ `tests-retrotxt.js` | QUnit tests for `ext/scripts/retrotxt.js` |
