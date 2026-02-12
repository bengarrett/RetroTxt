---
title: Changes and improvements
authors:
    - Ben Garrett
date: 2026-02-12
hide:
  - toc
---

## 5.6

- Fixed an edge case for a theoretical XSS attack when viewing texts with specific characters and specific configuration enabled.
- Text parsing optimizations, to improve the performance for handling 100-500KB+ texts.
- Significantly reduced (up to 85%) temporary memory usage when parsing texts and large ansi.
- Fixed some typos and copy-paste errors in the Options font listings.
- Fixed the usage of scanlines and text shadow sometimes not being toggled.
- Fixed an occasional bug with the position of the Display Alert box.

## 5.5.1

- New [Departure Mono](https://departuremono.com/) font.

## 5.5

## June 2024

- New Text Size slider in the Options to adjust the font size and removed the Font size adjustment on the information header.
- Updated the Bulma CSS framework to v1.0. The Options themes look different due to this update, as the framework was rewritten from scratch. The fonts, tag elements and some buttons used in the Options are larger.
- Updated Cascadia Mono and Code fonts to v2024.4 to use its new _Symbols for Legacy Computing_ support, "the Cascadia family now supports a whopping 1140 new glyphs covering sextants, octants, large type pieces, eights, sedecimants, quadrants (separated), segmented digits, circles and checkerboards... In addition, the existing block elements have been aligned to fit the same grid as the new characters to make for seamless ANSI art."
- Reworked the Display Options tab.
- - The _80 column wrap_ toggle is renamed to _Narrow wrap_ and works with both ANSI and plain text documents.
- - Created a new _Style_ panel and moved a number of _Text_ toggles to it.
- - _Colors_ panel has been split into _Text color_ and _ANSI color_.
- - _Text pairs_ is now _Foreground and background pair_, and it now uses the current selected font for the color labels.
- Fixed _Blinking cursor and text_ off option not applying to the cursor.

## 5.4

### February 2024

- New Backup and restore options to save and load your RetroTxt settings.
- New reset button for the *Custom colour values* in the Options.
- New **Limit URLs** option to force Hyperlink to validate URLs, linking only links that start with an http or https protocol.
- New *Reset to defaults* button in the Settings Options.
- Changed the CSS of the *page wrap* toggle.
  It now works correctly on windows and tabs smaller than 640px in width. And it has enabled an optimized text-wrapping feature.
- Monitor downloads handles different server replies better and provides a restart recommendation when toggled on.
- **Text render** effect option is changed to use a toggle switch.
- Changed the **Line Height** slider to display variations in percentage values.
- Fixed error _Cannot read properties of null_ for new installs.

## 5.3

### January 2024

- New [Intel One Mono fonts](https://github.com/intel/intel-one-mono).
- Removed the *column wrap* toggle from the information header of a RetroTxt browser tab.
  The feature was confusing with the *page wrap* toggle, and would not work correctly with the _80 column wrap_ ANSI option in the RetroTxt Options.
- Fixed a major issue in Chrome 118+, with text files breaking due to the [Sanitizer API deprecation](https://developer.chrome.com/blog/sanitizer-api-deprecation). As a stopgap, the [DOMPurify](https://github.com/cure53/DOMPurify) library is used to sanitise the text files.
- The RetroTxt options tab changes the document title.
- Clicking the links or buttons in the toolbar popup will only ever open one RetroTxt options tab.
- Fixed Monitor downloads launching twin tabs of the same file.
- Minor tweak to the Getting Started dialog text.
- Removed `version_name` from the manifest as it hid useful version information.
- Fixed `C:/` drive being referenced on non-Windows operating systems.
- Fixed "RetroTxt has run into a problem" displaying the wrong keyboard keys on macOS.
- Fixed `package.json` `version` number not matching the manifest.

## 5.2

### June 2023

- New Display Hyperlinks option to convert plain text URLs, emails and IP addresses into hyperlinks.
- New [Cascadia Mono and Code fonts](https://github.com/microsoft/cascadia-code/), that support ligatures and Powerline symbols.
- Toolbar popup contains icons with links to the fonts, display, settings options and a link to the RetroTxt Extension Details tab.
- Update Spleen fonts to v2.0 and include the use of size 32x64 variation.
- Fixed Page wrap behaviour not replicating on new tabs.
- Hyperlinked the Allow access to file URLs is off notice in the popup.

## 5.1

### April 2023

- Change the behavior of the toolbar button to display useful usability information.
  The previous, unreliable per-tab on/off toggle function would sometimes have Chrome disconnect the button from the tab, breaking the functionality.
- The home and office computer fonts use a local, monospaced font as the fallback. Previously, the browser would show out-of-range characters in a variable-width font, making blocks and line characters look unnecessarily messy.
- Update the Information header to reorder the information displayed and mention the shortcut keys to view the original text.
- Update and fix broken links to external resources and prioritized HTTPS over HTTP schemes.
- Rearrange the Settings and Feature pane to emphasize the _add_ domain input.
- Fix a bug that gave RetroTxt access to the Suggested domains after removing them.

## 5.0

### [Migration to Manifest v3](src/mv3.md) ~ September 2022

!!! warning
    Unfortunately, some Options settings may be lost in this upgrade when updating from RetroTxt versions 4.

!!! info
    Currently this v5.0 upgrade is not available to Firefox.

### Highlights

- Options interface should be more responsive with less visual jank.
- RetroTxt features and functions are more reliable.
- Changing Options should apply to all open tabs, including focused and unfocused tabs.
<hr>
- Manifest v3 has much better error handling and there should be less uncaptured errors.
- Unfocused tabs can run RetroTxt in the background.
- Browser tab displays the SAUCE title and author when available.
- Artworks linked in the Samples tab display the title and author on the browser tab.
- Smear block characters are applied to BBS texts.
- Monitor downloads works better with 16colo.rs and defacto2.net by ignoring their incorrect `Content-Type` headers.
- New Toolbar icon setting to select dark or light mode button.
- Updated the Welcome, new install text to be a Getting started with RetroTxt brief.
- Information header encoding can be clicked to change the encoding.
<hr>
- Fixed font size adjustment for 2x and 3x values. Text now centre aligns and stopped unexpected text wrapping.
- Fixed Options reloading the page when a new tab was selected.
- Tweaked the Information header CSS to use very slight rounded corners.
- Documentation tab in Options shares the same layout and formatting as the other menus.
- Settings - Run RetroTxt on files hosted on these domains<br>
  The on/off toggle has been removed for code simplification.<br>
  Created a button to remove and restore website suggestions.<br>
  Hostname input form responds to <kbd>Enter ↵</kbd> key presses.
- Settings - Monitor downloads, toggles the optional `download` and `downloads.open` permissions.
- Mentions of the file scheme `file:///`, will under Windows display as `file:///C:/`
- Transcode context menu is disabled by default except for textfile tabs.
- Replaced the `scripts/eventpage.js` background page with modular service workers.
- Replaced and split the `scripts/functions.js` shared functions page with `scripts/helpers.js` for content-scripts and `scripts/sw/helpers.js` for service workers.
- Replaced simple one-time message requests with long-lived connections where needed.<br>
  This should fix some strange behaviour and failures that occurred in previous versions.
- Removed the use of `Window.localStorage` and `Window.sessionStorage` which held Options settings and replaced it with `chrome.storage.local`.<br>
  This was needed as the `Window` interface is not accessible by service workers which are required by Manifest v3.
- Dropped the permissions requirement for `tabs`.
- Dropped the Transcode text context menu.
<hr>
- Using pnpm as the dependencies manager.
- The use of Manifest v3 with service workers is incompatible with Firefox.
- Removed the Firefox specific build tools.

## 4.2

### October 2021

- Squared 1:1, 8x8 pixel PC fonts now use their `-2y` variants when available.
  The 2y variants are 16x16 in size, meaning they're easier to read and look better.
- 11 new color themes for the Options tab under Settings.
- Replaced deprecated API function, `extension.getURL()`.
- Fixed broken elements in `options.html`.

## 4.1

### June 2021

- Updated PC and MS-DOS fonts to Ultimate Oldschool PC Font Pack v2.2.
- Support for custom ports in URLs such as `http://localhost:8080` or `https://example.com:9999`.
- Replaced all the `woff` fonts with `woff2` fonts to offer better file compression.
  This reduces the overall file size of RetroTxt and system resource usage.
- The Options Fonts tab Jump to menu now always remains on the tab.
- Reduced page flicker when switching Options tabs.
- Fixed broken Apple Lisa fonts.
- Fixed the local file viewer toggling on non-text file tabs when the file's extension is in uppercase.
- Fixed certain fonts that use spaces within their names, breaking the loading text files.
- Fixed broken SAUCE IBM VGA50 font.
- Improved support and display of multiline SAUCE comments.
- Improve the positioning of the error alert box.
- Spelling and typo fixes for both UK and US English.
- Using Task for the build process.
- Dropped the use of the convoluted Node.createTextNode() and Node.appendChild() methods.

## 4.0

### Highlights

- Complete Options redesign, it loads in a tab and is identical across all browsers.
- Welcome tab features is merged into the Options tab.
- Refreshed the information header.
- 200+ PC/MS-DOS system fonts.
- Numerous new fonts for home computers.
- Improved the font representation for SAUCE fontname matching.
- Dropped the context menu functionality and replaced it with Option tab links.
- Omnibox support, type `rt` <kbd>space</kbd> in the browser address bar to see the list of commands.

### October 2020

- The font choice save is reset.

- Minimum Chrome requirement v72, minimum Firefox requirement v69.

- Improved compatibility with Amiga ANSI.

* Added Unscii fonts fantasy and MCR.
* Added PR Number 3 (Apple II).
* Added Apple IIGS Shaston system fonts.
* Added Apple GEOS Berkelium fonts.
* Added Pet Me Commodore 64 fonts.
* Added Tandy TRS-80 and CoCo fonts.
* Added IBM 3270 font.
* Added new Workbench ANSI theme.

- Updated Print Char 21 font (Apple II).
- Updated Unscii fonts to v2.0.
- Updated Plex Mono fonts plus new weights.

* Changed references to web-extension, web extension, WebExtension to Extension, with a capital E.
* Moved documentation from the barebones Wiki into `/docs` and https://docs.retrotxt.com.

- Options in Chrome uses a dedicated browser tab.
- Options in Chrome implements Bulma as a CSS framework for a larger and improved layout.
- Added `content-visibility` CSS attribute for Chrome 85+ to help improve large screen rendering, see issue [#91](https://github.com/bengarrett/RetroTxt/issues/91).
- Added showBrowser(), links to the Edge Add-ons page, issue [#78](https://github.com/bengarrett/RetroTxt/issues/78).
- Replaced all Material Design Icon fonts with individual SVG images. This improves icon resize scalability and user accessibility, see issue [#92](https://github.com/bengarrett/RetroTxt/issues/92).
- Fixed eventpage.js `invoke()`, checks the `lastError` value, this also fixes issue [#93](https://github.com/bengarrett/RetroTxt/issues/93).
- Fixed the broken toolbar icon swap when Chrome detects a system dark mode theme.
- Updated dev dependencies and libraries.
- Moved the programming code and assets of the Extension into `/ext`.
- Removed Windows PowerShell source code support, instead Windows users can use WSL.
- Removed 'API permissions granted' from the Options as it duplicates included browser features.
- Renamed `Storage` class to `LocalStore` to avoid browser API conflicts.
- Context menus code were difficult to maintain and inconsistent between browsers.
- Unified pages to use LF instead of CRLF.
- Added support for ECMA48 SGR20 Fraktur font.

## 3.5

### March 2020

- Added Spleen font support.
- Added Microsoft Edge browser support.
- Added Microsoft Edge Addons links.
- Improved compatibility with Blocktronics Blocky Horror & dsotb packs.
- Added labels to for() loops.
- Added `hidepassed` argument to QUnit test links.
- Added Chrome and Edge browser version info to welcome.html.
- isNum() now intentionally points to either to the Number function.
- Fixed stylesheets not being loaded for BBS coloured text formats.
- Fixed broken DOM() class unit test.
- Fixed _New width byte sequence 80_ console message.
- Fixed colorpalette() causing errors with non-ANSI art.
- Fixed missing Unscii credit on the Firefox Options About tab.
- Fixed 'Font family used for display' title mislabelling some fonts.
- Reduced the width of the Options menu buttons to better fit with Edge.

## 3.4.2

### October 2019

- Created an ANSI tab in the options.
- Created `Default color palette` selection option.
- Added links in the welcome page for extension-app store reviews.
- Replaced Download API console warnings on startup with logs.

## 3.4

### August 2019

- Improved compatibility with wide, 80+ column ANSI art.
- Improved compatibility with narrow, -80 column ANSI art.
- Much improved compatibility with late 1990s, 80 column ANSI art.
- Added new Display Option "Smear block characters" that applies CSS text-shadowing specifically on CP-437 block characters to reduce line artefacts on Windows operating systems.
- Added Celerity BBS \| color codes support.
- Added Renegade BBS \| color codes support.
- Added Telegard BBS \` color codes support.
- Added WVIV BBS \|# pipe code support.
- Added WVIV BBS ♥ heart code support.
- Added Apple IIgs and Commodore 64 palettes for 4-bit ANSI.
- Blinking text now works properly on non-black backgrounds.
- Change minimum Chromium version to 58.
- Simplified some of the JS source code.
- Horizontal tab C0 codes in ANSI art now always display the `○` character when _DOS control glyphs_ is enabled.
- - Test case `blocktronics_block_n_roll/die-already.ans`
- Improved the accuracy of parsing of iCE color ANSIflags.
- Changed the ANSI slow blink timing (SGR5) to 500ms and fast blink (SGR6) to 300ms.
- Default CSS line-height value switched from `100%` to `normal` for better compatibility with alt-fonts.
- Consolidated iCE Colors and VGA CSS classes to reduce duplication.
- [Fixed issue 71](https://github.com/bengarrett/RetroTxt/issues/71) with the incorrect colour rendering of some RGB values.
- Fixed ultrawide ANSI art wrapping to the browser tab instead of overflowing with scrollbars.
- Fixed critical issue where a corrupt SAUCE font value breaks the ANSI render.
- - Test case `blocktronics_block_n_roll/nu-ninja_cat.ans`
- Fixed welcome page not displaying _Configure RetroTxt_ and _Permissions Request_ example images.
- Fixed `@CLS@`, it now does not automatically assume a PCBoard @-code file.
- Fixed `>` `<` and `&` characters breaking the end-of-line character count in ANSI text.
- Fixed RetroTxt unintentionally triggering when the browser plays audio/video media using `file:///` URLs.
- Fixed Firefox Options sample text displaying a white shadow effect in _Normal render mode_.
- Renamed `/docs/` directory to `/md/`, most of the documentation is now located at the [Wiki](https://github.com/bengarrett/RetroTxt/wiki).
- Replaced non-working `textmod.es/crew` links with `16colo.rs/tags/group`.
- Removed the _Smeared_ text render toggle as it has been replaced with the Smear block characters setting.
- Removed the Focus mode as the technical debt to maintain was too high.
- Removed theme and display adjustments from the context menus to simplify the code.

## 3.3

### June 2019

- Added a _Focus mode_ toggle.
- Added _Unscii 8_ and _Unscii 16_ font support.
- Added _Line wrap_ toggle to the information header when displaying ANSI/ECMA-48 text.
- Added preferred dark mode support for Chrome/Chromium 67+ browsers.
- Significantly reduced the tab memory usage after rendering ANSI/ECMA-48 text.
- Dropped the use of `null` in all large, internal arrays which should slightly improve performance with the JavaScript V8 engine.
- Significantly reduced the console spam when undetected ANSI control sequences are found.
- Refactored `scripts\parse_ansi.sys` to use [ES5 Class expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) so the source code easier to follow.
- Added support for the following ECMA-48 controls.
- - _CHT_ Cursor Forward Tabulation, it acts as 4 forward space movements.
- Changed the horizontal behaviour of the ECMA-48 _HVP_ command, it will now wrap to the maximum columns limit and then continue on the new row.
- Greatly expanded the unit test coverage of parse_ansi.js.
- Fixed, duplicate downloads are triggering with some binary file types such as woff fonts.
- Fixed, _Save link as_ accidentally creating a new, empty `file:///` tab.
- Fixed ECMA-48 CUD bug where there were too many rows created.
- An error is now displayed when trying to load a `file:///` with no content.

## 3.2

### February 2019

- Added IBM AIX terminal bright and bold colour support.
- Improved _Allow access to file URLs is disabled_ notification to be more prominent.
- Added npm run scripts to the package.json.
- - `npm run build`
- - `npm run firefox`
- - `npm run lint`
- - `npm run version`
- Fixed `Downloads.listen()` causing an endless download loop (issue #56).
- Fixed `hideEntities()` not catching `<>` character combinations that broke ANSI rendering (issue #58).
- Fixed the Options _Apply RetroTxt to any local text files file:///_ link pointing to the `C:` drive on Linux and macOS.

## 3.1

### December 2018

- Re-added the ability to make additions to the _Apply RetroTxt to text files hosted on these websites_ list that was disabled in v3.0.
- Fixed the Zeus II logo for the welcome screen breaking on Linux.
- Fixed _Homepage URL_ in the Firefox addon tab.
- Fixed incorrect links in `README.md`.

## 3.0

### Highlights

- User interface improvements and bug fixes.
- Much improved legacy code page detection and support.
- New progressive permissions for enhanced security.
- New redesign of the Options menu.
- New ASCII text theme for your own custom background/foreground colours.

### November 2018

- Rewrote the Code Page 437 normaliser, the character conversions are more accurate.
- RetroTxt gracefully recovers after the unintentional deletion of storage items.
- RetroTxt out of the box is locked down with gradual permission privileges requests when features are enabled.
  Previously RetroTxt always had access to downloads, http/ftp tabs, etc. regardless of whether they were needed or not. However, these are moving to `optional_permissions` which grant access on an associated Option.
- Broad `http://*/` and `https://*/` read permissions are gone in favour of domain-specific access such as `https://retrotxt.com/*` and `http://retrotxt.com/*`.
  RetroTxt never read more than the first two characters of any HTML tab that is active, but it was not a good look for new users
  seeing _Read and change all your data on the websites that you visit_ in the add-ons menu.
- Redesigned the Options menu to better match the new user interface introduced in Chrome v69. This required the disabling of the
  `chrome_style` manifest UI option which hasn't been updated since early 2016.
- Added a [privacy policy](https://github.com/bengarrett/RetroTxt/wiki/privacy) with API permission requirements.
- Added Option to use a customised colour set for the text foreground and background.
- Added IBM's 2017 [Plex Mono font](https://www.ibm.com/plex/).
- Added Macintosh-Roman, ISO8859-10 code page support.
- Mouse hovering on the information header font name reveals more descriptive font information.
- Added Option to toggle blinking text and cursor animations.
- Added a `textmod.es/crew` link to SAUCE header data for some ANSI groups when their group data are matches in the SAUCE metadata.
- Added new icons for Firefox dark themes.
- Firefox uses SVG icons.
- _Center align text_ now previews in the sample text.
- RetroTxt browser toolbar button now behaves differently to avoid occasional false positives. Instead of disabling itself when an invalid page is detected, the button now shows a ✔ checkmark whenever a compatible tab is active. The compatibility results vary based on the Extension permissions grants.
- Fixed PCBoard & Wildcat BBS colour inaccuracies in the CSS.
- Remapped CGA palettes so black is less frequent.
- Text that lack line breaks now wrap to the browser tab.
- CSS variables are more frequently in use.
- Added install type detection that enables a verbose mode when the type is `development`.
- Source code uses [Prettier](https://github.com/prettier/prettier) for opinionated formatting.
- Refactored most of the JS to use [ES5 Class expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) so the source code easier to follow.
  It is still a TODO item for `parse_ansi.js`.
- Using separate manifest.json and options.html for Firefox and Chrome. The Chrome Extension API hasn't been updated since early 2016 and is now the legacy implementation.
- Saves the Options last active tab.
- Expanded the number of unit tests to cover more of the application.
- Fixed incorrect keyboard keys displayed on alerts with macOS.
- Fixed Options icons links with underlined artefacts in Chrome.
- Fixed Options now gracefully handle the removal of localStorage items.
- Fixed broken Options links when in `development` install type.

### Known issues

- Currently, you cannot make additions to the _Apply RetroTxt to text files hosted on these websites_ list. The problem is due to
  new permissions API implementation that requires all sites to be listed in the `manifest.json`.
- On Firefox 63 the Options fonts menu sprawls across the screen, this is fixed in version 64.
- On Firefox Linux the Zeus II logo for the welcome screen is broken.
- For some distributions with Firefox on Linux the select menus have extra large, unreadable fonts.

## 2.5

### March 2018

- Added Shift JIS support that will toggle the use of the Mona font when encountered.
- Added an _ANSI 80 column wrap_ checkbox option that lets you disable this feature.
- Added 2-bit IBM CGA palette 0 (brown/yellow).
- `Welcome.html` has been reworked and uses tooltips on links.
- Improved CSS font-stack for system fonts that should look better on all operating systems.
- Context menu now uses radio buttons instead of tick glyphs.
- Console output is now grouped and collapsed by default to reduce message spam.
- Improved rendering of PCBoard art with alternative fonts.
- Regenerated internal fonts to the `woff2` format to reduce the download and install size of the Extension.
- Fixed context menu issues.
- Fixed unsupported ECMA-48 controls reported as unknown.
- Fixed blinking cursor not positioning correctly on small ANSI documents.
- Fixed _text render_ methods not applied to ANSI documents.
- Fixed white background themes that were not showing ECMA-48 bold text due to foreground and backgrounds colours being the same.

## 2.4

### September 2017

- Added _Linux_ and _IBM PS/2_ context menu themes.
- Added _Browser monospace_ font (called fixed-width in Chrome).
- ASCII documents now obey SAUCE fontName value.
- Redesigned some of the context menus.
- Added a ▲ hide ▼ show toggle for the header.
- Added 1x and 2x font size adjust toggle in the header.
- Welcome page displays a RetroTxt updated banner that can also be turned off.
- Requires Firefox 55.
- Links in the header are not selectable to stop accidental selection when clicked.
- Replaced columns/lines statistics in the header with total pixel width/length.
- Fixed Blink engine handling of ANSI when it mistakenly sees it as ISO-8859-5 instead of Windows-1252.
- Fixed broken preview images in `welcome.html`.
- Fixed SAUCE font issue where it requests Amiga _Plus_ fonts but uses standard.
- Fixed _Some wider fonts break the ASCII text document layout_.
- Fixed SAUCE font _P0T-NOoDLE_ value not registering.
- ANSI maximum columns are now uncapped when SAUCE `TInfo1` data is corrupted by the browser.
- Internal optimisations.
- - Replaced `XMLHttpRequest()` with _FetchAPI_.
- - Dropped the generation of elements using `dom.innerHTML` = text (except in `parse_ansi.js`).
- - Removed all remaining `var` usage.
- - Replaced many `let` variables with `const` objects.
- - Renamed some variables, so they are clearer in their purpose.
- - Removed some unused functions and objects.

## 2.3

### August 2017

- Added 24-bit RGB colour support for ANSI/ECMA-48 text. That gives a choice of over 16 million colours to play with.
- New fonts, a complete set of Amiga and ATASCII (Atari 8-bit).
- Complete SAUCE FontName support.
- Added 2-bit IBM CGA magenta palette.
- Added Option checkbox, 'ANSI iCE colors'.
- Fixed some CP437 characters not displaying as intended.
- Fixed issue where 'DOS control glyphs' changes required two tab refreshes to apply.
- Any discovered SAUCE configurations are sent to the browser console.
- Browser tab titles running RetroTxt are marked with `[··]`.

## 2.2

### June 2017

- There are new clickable toggles in the information header for ANSI art.
- - **Normal** switches the active tab text rendering between _Normal_, _Smeared_ and _Shadowed_.
- - **IBM** switches the ANSI 16 color palette between _IBM_ VGA, Unix _xterm_ and _gray_ scale.
- - **On** toggles between iCE background colors and blinking text.

- Added a new [Option, Text render](https://github.com/bengarrett/RetroTxt/wiki/options), choices are _Normal_, _Smeared_, _Shadowed_.
- Increased minimum version requirements for both Chrome and Firefox to 51.
- Added support for CP-1250 and CP-1251 text encodings that are occasionally used by Chrome over the expected CP-1252.
- Fixed header not displaying when using white background themes.
- To improve performance `<links>` to CSS files are disabled instead of removed when toggling between plain text and HTML displays.
- The shortcut key combination has been switched from ALT+T to ALT+R to stop Firefox conflicts.
- Fixed ECMA48 SGR2 and SGR3 controls using the wrong CSS properties.

## 2.1

### March 2017

- Performance optimisations to reduce the memory footprint and improve rendering speed.
- ECMA48/ANSI iCE colors support.
- Automatic parsing and execution of [SAUCE ANSiFlags](http://www.acid.org/info/sauce/sauce.htm#ANSiFlags).
- Added Atari ST TOS font and theme.
- Text and font information header now conveys more information and uses CSS `position: sticky;`.
- JavaScript refactor to be [ESlint compliant](http://eslint.org/).
- Uses more [ES6 features](http://es6-features.org) such as arrow functions and for-of loops.

- Improved error handling and user feedback when the addon or Extension API fails.
- Improved embedded [SAUCE detection](http://www.acid.org/info/sauce/sauce.htm).

- Fixed ECMA48/ANSI bug that dropped the first row of text.
- Fixed mixed ANSI/ASCII documents issue that didn't parse the ECMA48 control characters.
- Fixed `<` `>` and `&` characters breaking ANSI display thanks to browser HTML entity conversions.
- Fixed `@CLS@` bug in PCBoard detection.
- Fixed `HVP` and `CUP` execution.

## 2.0

### November 2016

- Detects and converts many [ANSI Control Sequence Introduces](https://en.wikipedia.org/wiki/ANSI.SYS) used by MS-DOS ANSI.SYS to display ANSI art.
- Detects and converts legacy BBS colour codes for [PCBoard and Wildcat!](http://wiki.synchro.net/custom:colors#pcboard_wildcat_format).
- **_Apply RetroTxt to any text files hosted on these websites_** will only run on a user supplied whitelist of website domains. This will stop it from conflicting with secure login sessions used by some websites.
- Options have been reworked with a refresh to its look including the use of the [Google Material Icons](https://design.google.com/icons/).
- Introduced a new, charcoal coloured icon that should clash less with most browser themes.
- Context menu now allows you to control the page transcoding, currently CP-487, CP-865, ISO-8959-15, CP-1252 character sets are supported.
- The about encoding content menu has been removed and replaced by the Transcode None option, that works with UTF-8, UTF-16 and ISO-8959-1 text.
- **_Automatic detect & run RetroTxt on text files feature_** has been renamed to **_Apply RetroTxt to any text files hosted on these websites_**.
- Options, font samples now reset when the user's mouse leaves the font selection form.
- **_Display formatting control codes as DOS CP-437 glyphs_** has been renamed to **_DOS control glyphs_**.
- When checked **_DOS control glyphs_** will show a few ASCII control characters in the sample text.
- Refactored much of the JavaScript source to use [ECMAScript 6](http://es6-features.org) specific features.
- Improved handling of [file:///](file:///) domains.
- Uses asynchronous `XMLHttpRequest.open()` functionality as browser support of synchronous requests may end.
- Context menus now use checkmarks for active options.
- Context menus code in `eventpages.js` has been redesigned so it is now easier to add new themes and Display options.
- The toolbar button should now be more intuitive by more accurately changing its enabled state and refreshing its tip where appropriate.

#### Firefox specific fixes

- Requires Firefox 50+.
- Options dialogue is better themed to Firefox's style guides. (Unfortunately Firefox on Linux still has some strange `input` style quirks)
- Fixed Options not supporting UK locales.
- Fixed first time run bugs that required RetroTxt to reload for it to work correctly.
- Fixed RetroTxt trying to run on about: URIs.
- RetroTxt should be slightly less resource intensive as previously there were some event filters that Firefox was ignoring.

## 1.25

### 2 July 2016

- **_Automatic detect & run RetroTxt on text files feature_** **is now more reliable and intuitive**. Its (experimental) tag has been dropped and can now be considered stable.
- _Automatic detect & run RetroTxt..._ also has a hardcoded blacklist of domains to ignore which previously this feature conflicted with.
- Added [QUnit](https://qunitjs.com/) testing. A _Tests_ link to the results page will show up with Chrome in Options when using a _development_ install.
- Fixed vertical lines artefacts issue with block fonts with most colour combinations.
- Firefox specific bugs fixed including incorrect `normal` line height and weird toolbar button behaviour.
- Refactored a number of function names to be more descriptive of their purpose.
- Started the transition of replacing `var` with `let` and `const`.
- Some functions now return more meaningful errors when missing required parameters.

## 1.2

### 22 June 2016

- **Now works in Firefox** but requires at least Firefox (Gecko) 48.
- Tested in Opera (Blink) and works great.

#### Differences between using Firefox and Chrome

- Chrome uses event pages while Firefox uses the less desirable persistent background pages. Event pages only load when needed so in theory they should be less resource intensive.
- Firefox and the Gecko engine renders multiple block characters better than the Blink engine used in Chrome. The Blink engine adds light but distracting vertical lines.
- Firefox's Options UI does not support the unified `chrome_style`.
- The toolbar button in Firefox does not support right-click context menus.
- Context menus in Firefox are not filtered by URL types as it doesn't support the `documentUrlPatterns` property.
- When loading RetroTxt both Chrome and Firefox will throw warnings about unrecognised items in the manifest.

## 1.1

### 21 June 2016

- **Added ability to increase the whitespace between rows of text (line space)**.
- **Rearranged the Options menu to be more compact**.
- Changed the sample text found in the Options menu.
- Removed the Options, font selection mouse out event to make the font samples more stable.
- Added IBM BIOS font (only 2y and 2x were previously included).
- Created this file.
