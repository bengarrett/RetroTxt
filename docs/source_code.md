RetroTxt employs an [open sourced license](https://choosealicense.com/licenses/lgpl-3.0/) with the complete source code available on [GitHub](https://github.com/bengarrett/RetroTxt). This page instructs on how to use the source in both Chromium based and Firefox web browsers.

[Visual Studio Code](https://code.visualstudio.com) is used to create RetroTxt, and so it has some `.vscode` conveniences included in the package such as workspace settings and extension recommendations.

There are also [Node.js](https://nodejs.org) with [yarn](https://yarnpkg.com/) (or npm) dependencies for the programming and build tools.

The source code is linted with [ESLint](https://eslint.org/) and stylised using [Prettier](https://prettier.io/), an opinionated formatter.

## Download

Download the RetroTxt source code onto your local computer.

Run the following [Git](https://git-scm.com) or [gh](https://cli.github.com) command in a terminal.

=== "git"

      ```bash
      git clone https://github.com/bengarrett/RetroTxt.git
      ```

=== "gh"

      ```bash
      gh repo clone bengarrett/RetroTxt
      ```

## Install build dependencies with yarn

[Yarn package manager](https://yarnpkg.com).

```sh
cd RetroTxt
yarn
```

If the installation of the tools is successful, this command should return the `web-ext` version number.

```sh
yarn run web-ext --version
```

### Convert and compact a Truetype font into WOFF2 for use by RetroTxt.

[wawoff2 tool](https://github.com/fontello/wawoff2).

```bash
yarn run font mona.ttf mona.woff2
```

!!! note "Windows"

      Windows users may need to edit `package.json`

      ```json
      "scripts": { "font": "woff2_compress.js.cmd" }
      ```

### Run RetroTxt in **Firefox** with automatic extension reloading.

[Web-ext command line tool](https://github.com/mozilla/web-ext) to help build, run, and test WebExtensions.

For this to work [Firefox needs to be installed](https://www.mozilla.org/en-US/firefox/) on your computer and then RetroTxt on Firefox will reload whenever a change is made to this source code.

```sh
cp ext/json/manifest_firefox.json ext/manifest.json
yarn run web-ext run -s=ext
```

### Analyse the source code for any errors using Mozilla's web-ext lint tool.

```sh
cp ext/json/manifest_firefox.json ext/manifest.json
yarn run web-ext lint -s=ext
```

## Use on Chrome, Edge, Brave and Chromium

I suggest that you create a [new user profile](https://support.google.com/chrome/answer/2364824?co=GENIE.Platform%3DDesktop&hl=en) for use and to edit the Extension.

Open a new tab and type in the address of the Extension.

=== "Chrome"

      ```
      chrome://extensions
      ```

=== "Edge"

      ```
      edge://extensions
      ```

=== "Brave"

      ```
      brave://extensions
      ```

1.  In the Extensions tab, toggle **Developer mode**
1.  Click the **Load unpacked** button
1.  Navigate to the local directory containing the RetroTxt source code and select OK

RetroTxt should load. The Options link behind the **Details** button and allows you to configure RetroTxt styling and behaviour.

=== "Chrome"

    <figure markdown>
      ![Chrome extensions developer mode](assets/source_code-chrome.png)
      <figcaption>Chrome Extensions developer mode</figcaption>
    </figure>

=== "Edge"

    <figure markdown>
      ![Edge extensions developer mode](assets/source_code-edge.png)
      <figcaption>Edge Extensions developer mode</figcaption>
    </figure>

## Use on Firefox

Firefox is locked down and doesn't permit the loading of extensions outside of the Firefox Add-ons page.

Mozilla's `web-ext` tool is the easiest method to bypass this with a [dedicated web page](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext) but requires Node.js.

1. [Install Node.js if needed](https://nodejs.org)
1. `cd RetroTxt` into the cloned RetroTxt directory
1. Copy the Firefox manifest<br>
   `cp ext/json/manifest_firefox.json ext/manifest.json`
1. `yarn` to install web-ext and dependencies
1. `yarn run web-ext run -s=ext` to load RetroTxt in Firefox with automatic extension reloading

```bash
yarn run web-ext run -s=ext
```

```
Applying config file: ./package.json
Running web extension from /RetroTxt/ext
Use --verbose or open Tools > Web Developer > Browser Console to see logging
Installed /RetroTxt/ext as a temporary add-on
The extension will reload if any source file changes
Press R to reload (and Ctrl-C to quit)
```

To restore the the Chrome manifest after you have quit Firefox.<br>

```bash
cp ext/json/manifest_chrome.json ext/manifest.json
```

## Use on Firefox Developer Edition

1. Edit `ext/.web-ext-firefox.js`
1. Update
   ```js title="Original"
   "run": { "firefox": "firefox" }
   ```
   ```js title="Replacement"
   "run": { "firefox": "firefoxdeveloperedition" }
   ```
1. Follow the above **Use on Firefox** instructions

## Directory and file structure

These are the directories and files that comprise of RetroTxt.

- `.github/` [Github repo](https://github.com/bengarrett/RetroTxt) settings.
- `.vscode/` Workspace settings for [Visual Studio Code](https://code.visualstudio.com).
- `docs/` Documentation in [Material for MkDocs](https://squidfunk.github.io/mkdocs-material) markdown.
- `fonts/` Original font packages with documentation and licences.
- `.eslintrc.json` [ESLint configuration file](https://eslint.org/docs/user-guide/configuring).
- `.gitattributes` The [Git](https://git-scm.com) settings file for this repository.
- `.gitignore` The Git file to exclude items from being checked into this repository.
- `LICENSE` A copy of the [GNU Lesser General Public License](http://www.gnu.org/licenses/lgpl-3.0.en.html), Version 3.
- `package.json` [Yarn configuration file](https://docs.npmjs.com/files/package.json) (npm compatible).

---

- **`ext/`** The RetroTxt Extension root directory.

* `ext/_locales/` Spelling differences for the UK and US English.
* `ext/_locales/en_US/messages.json` Also includes shared variables for remote URLs and BBS software names.
* `ext/assets/snaps/` PNG screenshots used by the Options samples tab.
* `ext/assets/svg/material-icons.svg` SVG icons for the Options tab.
* `ext/assets/` PNG icons for RetroTxt.

- **`ext/css/`** Extension Cascading Style Sheets in CSS3 syntax.
- `bulma.min.css` [Bulma CSS framework](https://bulma.io) used by the Options tab.
- `fonts_home.css` Font faces and classes for the \_Home computers_fonts.
- `fonts_ibm.css` Font faces and classes for the _IBM PC & family_ fonts.
- `fonts_modern.css` Font faces and classes for the _Modern_ fonts.
- `layout.css` Base elements styles.
- `options.css` Styles specific for the Options tab.
- `retrotxt_loader.css` An animated spinner to display during the RetroTxt processing.
- `retrotxt.css` Scanlines, text size, the Mona font face and cursor stylings.
- `text_animation-off.css` For the _Blinking cursor and text_ off Option.
- `text_colors_4bit-ice.css` ANSI Select Graphic Rendition iCE Color classes.
- `text_colors_4bit.css` ANSI Select Graphic Rendition colour classes.
- `text_colors_8bit.css` Xterm 256 colours for ANSI colour classes.
- `text_colors_bbs.css` Shared BBS colours and font styles.
- `text_colors_blink.css` Simulate terminal blinking text.
- `text_colors_c64.css` Commodore 64 ANSI color pallete.
- `text_colors_cga_0.css` CGA 0 ANSI color pallete.
- `text_colors_cga_1.css` CGA 1 ANSI color pallete.
- `text_colors_gray.css` Monochrome ANSI color pallete.
- `text_colors_iigs.css` Apple IIGS ANSI color pallete.
- `text_colors_pcboard.css` PCBoard BBS colour classes.
- `text_colors_pipe.css` Renegade BBS and other BBS software colours.
- `text_colors_vga.css` VGA ANSI color pallete.
- `text_colors_workbench.css` Amiga Workbench ANSI color pallete.
- `text_colors_wviv-pipe.css` WVIV BBS and other BBS software colours.
- `text_colors_xterm.css` Xterm ANSI color pallete.
- `text_colors.css` Colours, _text pair_ classes.
- `text_ecma_48.css` ANSI Select Graphic Rendition function classes.
- `text_pagewrap.css` For the _ANSI Page wrap_ on option.

* `ext/fonts/` [Compressed fonts](https://developer.mozilla.org/en-US/docs/Web/Guide/WOFF) used in RetroTxt.
* `ext/html/options.html` HTML5 template for the Options page.

- **`ext/json/`** JSON, human-readable data stores.
- `manifest_chrome.json` Extension manifest file for Chromium based browsers.
- `manifest_firefox.json` Extension manifest file for Firefox browsers.

* **`ext/scripts/`** Extension JavaScripts in ES6+ (ES2015) syntax.
* `eventpage.js` Background functions and listeners that are completely isolated from all other scripts.
* `functions.js` Shared functions accessible to non-isolated scripts.
* `options.js` Isolated functions for the Options page located at `ext/html/options.html`.
* `parse_ansi.js` Functions to handle ANSI and ECMA-48 controls.
* `parse_dos.js` Functions to handle text encodings and DOS code pages.
* `retrotxt.js` Invokes RetroTxt, handles the browser page display and SAUCE metadata.

- **`ext/test/`** Unit and sample test files.
- `example_files/` ASCII and ANSI text test cases for use with the `files:///` protocol.
- `example_files/bbs_sheets/` BBS text test cases for use with the `files:///` protocol.
- `index.html` Entry point for the QUnit tests.
- `qunit.css` QUnit stylesheet.
- `qunit.js` [QUnit](https://qunitjs.com) JavaScript testing framework application.
- `tests-eventpage.js` QUnit tests for `ext/scripts/eventpage.js`.
- `tests-functions.js` QUnit tests for `ext/scripts/functions.js`.
- `tests-options.js` QUnit tests for `ext/scripts/options.js`.
- `tests-parse_ansi.js` QUnit tests for `ext/scripts/parse_ansi.js`.
- `tests-parse_dos.js` QUnit tests for `ext/scripts/parse_dos.js`.
- `tests-retrotxt.js` QUnit tests for `ext/scripts/retrotxt.js`.

* `ext/manifest.json` In use, [Extension manifest file](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json) containing read-only metadata and configuration options.
* `ext/.web-ext-chrome.js` [web-ext configuration file](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Getting_started_with_web-ext#Setting_option_defaults_in_a_configuration_file) for packaging a Chrome distribution package.
* `ext/.web-ext-firefox.js` web-ext configuration file for packaging a Firefox distribution and all other web-ext commands.
