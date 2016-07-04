# RetroTxt Changes

### 1.25
##### 2 July 2016
- ___Automatic detect & run RetroTxt on text files feature___ __is now more reliable and intuitive__. It's (experimental) tag has been dropped and can now be considered stable.
- _Automatic detect & run RetroTxt..._ also has a hardcoded blacklist of domains to ignore which previously this feature conflicted with.
- Added [QUnit](https://qunitjs.com/) testing. A _Tests_ link to the results page will show up with Chrome in Options when using a _development_ install.
- Fixed vertical lines artefacts issue with block fonts with most colour combinations.
- Firefox specific bugs fixed including incorrect `normal` line height and weird toolbar button behaviour.
- Refactored a number of function names to be more descriptive of their purpose.
- Started the transition of replacing `var` with `let` and `const`.
- Some functions now return more meaningful errors when missing required parameters.

### 1.2
##### 22 June 2016
- __Now works in Firefox__  but requires at least Firefox (Gecko) 48.
- Tested in Opera (Blink) and works great.

###### Differences between using Firefox and Chrome?
- Chrome uses event pages while Firefox uses the less desirable persistent background pages. Event pages only load when needed so in theory they should be less resource intensive.
- Firefox and the Gecko engine renders multiple block characters better than the Blink engine used in Chrome. The Blink engine adds light but distracting vertical lines.
- Firefox's Options UI does not support the unified `chrome_style`.
- The toolbar button in Firefox does not support right-click context menus.
- Context menus in Firefox are not filtered by URL types as it doesn't support the `documentUrlPatterns` property.
- When loading RetroTxt both Chrome and Firefox will throw warnings about unrecognised items in the manifest.

### 1.1
##### 21 June 2016
- __Added ability to increase the whitespace between rows of text (line space)__.
- __Rearranged the Options menu to be more compact__.
- Changed the sample text found in the Options menu.
- Removed the Options, font selection mouseout event to make the font samples more stable.
- Added IBM BIOS font (only 2y and 2x were previously included).
- Created this file.
