---
hide:
  - toc
---
# Files and directories

These are the directories and files that comprise of RetroTxt source code.

!!! tip
    Items ending with a forward-slash `/` are directories<br>
    Items starting with a dot `.` are flagged as hidden

| Directory | Purpose |
| -- | -- |
| `.github/` | [GitHub repository](https://github.com/bengarrett/RetroTxt) configuration |
| `.vscode/` | [Visual Studio Code](https://code.visualstudio.com) workspace settings |
| `docs/` | This documentation written in [mkdocs Markdown](https://www.mkdocs.org/) |
| **`ext/`** | The RetroTxt Extension root directory |
| `fonts/` | Original font packages with documentation and licences
| `site/` | Documentation built by `mkdocs` into a website |

| File | Purpose |
| -- | -- |
| `.eslintrc.json` | [ESLint configuration file](https://eslint.org/docs/user-guide/configuring) |
| `.gitattributes` | The [Git](https://git-scm.com) settings file for this repository |
| `.gitignore` | The Git file to exclude items from being recorded |
| `.prettierrc` | [Prettier configuration file](https://prettier.io/) |
| `LICENSE` | A copy of the [GNU Lesser General Public License](http://www.gnu.org/licenses/lgpl-3.0.en.html), Version 3 |
| `mkdocs.yml` | [mkdocs configuration file](https://www.mkdocs.org/) |
| `package.json` | [Pnpm configuration file](https://pnpm.io/) |
| `pnpm-lock.yml` | Pnpm lockfile |
| `Taskfile.yml` | [Task configuration file](https://taskfile.dev) |

| Stylesheet | Purpose |
| -- | -- |
| **`ext/css/`** | Extension Cascading Style Sheets in CSS3 syntax |
| ↳ `bulma.min.css` | [Bulma CSS framework](https://bulma.io) used by the Options tab |
| ↳ `fonts_home.css` | Font faces and classes for the **Home computers** fonts |
| ↳ `fonts_ibm.css` | Font faces and classes for the **IBM PC & family** fonts |
| ↳ `fonts_modern.css` | Font faces and classes for the **Modern** fonts |
| ↳ `layout.css` | Base elements styles |
| ↳ `options.css` | Styles specific for the Options tab |
| ↳ `retrotxt_loader.css` | An animated spinner to display during the RetroTxt processing |
| ↳ `retrotxt.css` | Scanlines, text size, the Mona font face and cursor stylings |
| ↳ `text_animation-off.css` | For the **Blinking cursor and text** off Option |
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
| ↳ `text_colors.css` | Colours, **text pair** classes |
| ↳ `text_ecma_48.css` | ANSI Select Graphic Rendition function classes |
| ↳ `text_pagewrap.css` | For the **ANSI Page wrap** on option |

| Script | Purpose |
| -- | -- |
| **`ext/scripts/`** | Manifest V3 Extension scripts |
| ↳ `checks.js` | Error, argument checkers and alerts |
| ↳ `encoding.js` | Character sets, browser encodings, code page handlers |
| ↳ `helpers.js` | Content-scripts helper, shared functions |
| ↳ `options.js` | Isolated functions for the Options page located at `ext/html/options.html` |
| ↳ `parse_ansi.js` | Functions to handle ANSI and ECMA-48 controls |
| ↳ `parse_dos.js` | Functions to handle text encodings and DOS code pages |
| ↳ `retrotxt.js` | Content-script to apply RetroTxt to a browser tab DOM, or restore the tab to its original raw text state |
| **`ext/scripts/sw/`** | Manifest V3 service workers |
| ↳ `action.js` | Toolbar button actions |
| ↳ `background.js` | Background service worker functions and `importScripts` |
| ↳ `downloads.js` | Apply RetroTxt transformations to text file downloads |
| ↳ `error.js` | Service worker error handlers |
| ↳ `extension.js` | RetroTxt initialisation, defaults and activation |
| ↳ `helpers.js` | Service worker helper, shared functions |
| ↳ `menu.js` | RetroTxt _(right-click)_ context menus |
| ↳ `message.js` | Make service worker connections that can receive commands from the container-scripts |
| ↳ `security.js` | Web extension API restriction checks and permission grants |
| ↳ `session.js` | Uses the local storage API to simulate a session storage store |
| ↳ `tabs.js` | Monitors and handles the interactions with new and closed browser tabs |
| ↳ `toolbar.js` | Toolbar button icon and badge |

| Extension item | Purpose |
| -- | -- |
| `ext/.web-ext-chrome.js` | The [web-ext configuration file](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Getting_started_with_web-ext#Setting_option_defaults_in_a_configuration_file) for packaging a Chrome distribution package |
| `ext/manifest.json` | An [Extension manifest file](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json) containing read-only metadata and configuration options |
| **`ext/_locales/`** | Spelling differences for the UK and US English |
|  ↳ `en_GB/messages.json` | Shared variables British UK spelling and names |
|  ↳ `en_US/messages.json` | Shared variables for remote URLs and BBS software names |
| **`ext/assets/`** | PNG icons for RetroTxt |
|  ↳ `snaps/` | PNG screenshots used by the Options samples tab |
|  ↳ `svg/material-icons.svg` | SVG icons for the Options tab |
| **`ext/fonts/`** | [Compressed fonts](https://developer.mozilla.org/en-US/docs/Web/Guide/WOFF) used in RetroTxt |
| **`ext/html/`** | HTML5 assets |
| ↳ `options.html` | Template for the Options page |
| **`ext/json/`** | JSON, human-readable data stores |
| ↳ `font_info.json` | Font metadata for [The Ultimate Oldschool PC Font Pack](https://int10h.org/oldschool-pc-fonts/) (v2.2)<br>Required by [retrotxt-fonts](https://github.com/bengarrett/retrotxt-fonts) |
| **`ext/test/`** | Unit and sample test files |
| ↳ `example_files/` | ASCII and ANSI text test cases for use with the `files:///` protocol |
| ↳ `example_files/bbs_sheets/` | BBS text test cases for use with the `files:///` protocol |
| ↳ `index.html` | Entry point for the QUnit tests |
| ↳ `qunit.css` | QUnit stylesheet |
| ↳ `qunit.js` | [QUnit](https://qunitjs.com) JS testing framework application |
| ↳ `tests-*.js` | QUnit tests |
