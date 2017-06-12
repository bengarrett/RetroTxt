# RetroTxt Changes

## 2.2

### June 2017

- There are new clickable toggles in the information header for ANSI art.
- - ![ANSI header](assets/changes-22-header.png)
- - __Normal__ switches the active tab text rendering between _Normal_, _Smeared_ and _Shadowed_.
- - __IBM__ switches the ANSI 16 color palette between _IBM_ VGA, Unix _xterm_ and _gray_ scale.
- - __On__ toggles between iCE background colors and blinking text.

- Added a new [Option, Text render](options.md), choices are _Normal_, _Smeared_, _Shadowed_.
- Increased minimum version requirements for both Chrome and Firefox to 51.
- Added support for CP-1250 and CP-1251 text encodings that are occasionally used by Chrome over the expected CP-1252.
- Fixed header not displaying when using white background themes.
- To improve performance `<links>` to CSS files are disabled instead of removed when toggling between plain text and HTML displays.
- The shortcut key combination has been switched from ALT+T to ALT+R to stop Firefox conflicts.
- Fixed ECMA48 SGR2 and SGR3 controls using the wrong CSS properties.

## 2.1

### March 2017

- Performance optimizations to reduce the memory footprint and improve rendering speed.
- ECMA48/ANSI iCE colors support.
- Automatic parsing and execution of [SAUCE ANSiFlags](http://www.acid.org/info/sauce/sauce.htm#ANSiFlags).
- Added Atari ST TOS font and theme.
- Text and font information header now conveys more information and uses CSS `position: sticky;`.
- JavaScript refactor to be [ESlint compliant](http://eslint.org/).
- Uses more [ES6 features](http://es6-features.org) such as arrow functions and for-of loops.

- Improved error handling and user feedback when the addon or Web Extension API fails.
- Improved embedded [SAUCE detection](http://www.acid.org/info/sauce/sauce.htm).

- Fixed ECMA48/ANSI bug that dropped the first row of text.
- Fixed mixed ANSI/ASCII documents issue that didn't parse the ECMA48 control characters.
- Fixed `<` `>` and `&` characters breaking ANSI display thanks to browser HTML entity conversions.
- Fixed `@CLS@` bug in PCBoard detection.
- Fixed `HVP` and `CUP` execution.

## 2.0

### November 2016

- Detects and converts many [ANSI Control Sequence Introduces](https://en.wikipedia.org/wiki/ANSI.SYS) used by MS-DOS's ANSI.SYS to display ANSI art.
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
