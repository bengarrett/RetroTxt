# RetroTxt

## Limitations and known issues

These are known unfixable problems due to restrictions with the browser or operating system.

### A lot of [Bulletin Board System](https://spectrum.ieee.org/tech-history/cyberspace/social-medias-dialup-ancestor-the-bulletin-board-system) era ANSI art that relied on an 80x25 fixed terminal with cursor positioning to create motion and animations do not convert using RetroTxt.

Fixing this would require a considerable amount of programming work for little reward as it would be a massive hit to browser performance and most larger and complicated ANSI would probably never render as the browser would flag the tab as unresponsive.

### Microsoft Windows applies font hinting that causes line artefacts `████` with sequences of block elements.

### Browser [MIME sniffing](https://en.wikipedia.org/wiki/Content_sniffing) will often override RetroTxt, forcing text files to download rather than display in a tab.

### Firefox will usually produce incorrect MIME sniffing results with the `http(s)://` protocol.

### Chromium-based browsers can produce incorrect MIME sniffing results with the `file:///` protocol.

## Unsupported text formats

Due to limitations with the current Unicode specification **Atari ATASCII** and **Commodore PETSCII** texts are not supported.

Binary formats such as **.xbin** and **.bin** are not supported as browsers refuse to render unknown file data in a browser page.

## Fonts and styling accuracy

The extension uses TrueType fonts which are affected by the operating system font hinting; ClearType on Windows, Quartz in macOS and FreeType on Linux. [Oliver Schmidhauser has a useful summary of the issue](https://glow.li/technology/2016/7/15/using-pixel-fonts-in-a-browser-without-font-smoothing/).

Some fonts are for 40 columns (characters per line of text), but the extension doesn't enforce that limitation.

The browser and the operating system can make modifications the font width, height, and space for either accessibility or due to user applied themes.

## [FAQ - Common questions and fixes](qa.md)
