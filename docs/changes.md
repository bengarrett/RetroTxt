# RetroTxt Changes

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
- Added a [privacy policy](privacy.md) with API permission requirements.
- Added Option to use a customised colour set for the text foreground and background.
- Added IBM's 2017 [Plex Mono font](https://www.ibm.com/plex/).
- Added Macintosh-Roman, ISO8859-10 code page support.
- Mouse hovering on the information header font name reveals more descriptive font information.
- Added Option to toggle blinking text and cursor animations.
- Added a `textmod.es/crew` link to SAUCE header data for some ANSI groups when their group data are matches in the SAUCE metadata.
- Added new icons for Firefox dark themes.
- Firefox uses SVG icons.
- _Center align text_ now previews in the sample text.
- RetroTxt browser toolbar button now behaves differently to avoid occasional false positives. Instead of disabling itself when an invalid page is detected, the button now shows a ✔ checkmark whenever a compatible tab is active. The compatibility results vary based on the web-extension permissions grants.
- Fixed PCBoard & Wildcat BBS colour inaccuracies in the CSS.
- Remapped CGA palettes so black is less frequent.
- Text that lack linebreaks now wrap to the browser tab.
- CSS variables are more frequently in use.
- Added install type detection that enables a verbose mode when the type is `development`.
- Sourcecode uses [Prettier](https://github.com/prettier/prettier) for opinionated formatting.
- Refactored most of the JS to use [ES5 Class expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) so the source code easier to follow.
  It is still a TODO item for `parse_ansi.js`.
- Using separate manifest.json and options.html for Firefox and Chrome. Chrome's web-extension API hasn't been updated since early 2016 and is now the legacy implementation.
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
- Regenerated internal fonts to the `woff2` format to reduce the download and install size of the WebExtension.
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
- - ![ANSI header](assets/changes-22-header.png)
- - **Normal** switches the active tab text rendering between _Normal_, _Smeared_ and _Shadowed_.
- - **IBM** switches the ANSI 16 color palette between _IBM_ VGA, Unix _xterm_ and _gray_ scale.
- - **On** toggles between iCE background colors and blinking text.

- Added a new [Option, Text render](options.md), choices are _Normal_, _Smeared_, _Shadowed_.
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

- Improved error handling and user feedback when the addon or WebExtension API fails.
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
- Removed the Options, font selection mouseout event to make the font samples more stable.
- Added IBM BIOS font (only 2y and 2x were previously included).
- Created this file.
