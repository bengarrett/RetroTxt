---
title: Limitations and known issues
summary: ANSI, browser mime sniffing, codepage missing characters.
authors:
    - Ben Garrett
date: 2022-08-30
---
# Limitations and known issues

These are known unfixable problems due to browser or operating system restrictions.

## BBS era ANSI

Many [Bulletin Board System](https://spectrum.ieee.org/tech-history/cyberspace/social-medias-dialup-ancestor-the-bulletin-board-system) era ANSI art relied on an 80x25 fixed terminal with the cursor positioning to create motion and animations that do not convert using RetroTxt.

Fixing this would require a considerable amount of programming work for little reward. It would be a massive hit to browser performance, and most larger and more complicated ANSI would probably never render as the browser would flag the tab as unresponsive.
## MIME sniffing

Browser [MIME sniffing](https://en.wikipedia.org/wiki/Content_sniffing) often overrides RetroTxt, forcing text files to download rather than display in a tab.

- Firefox usually produces incorrect MIME sniffing results with the `http(s)://` protocol.

- Chrome-based browsers can produce incorrect MIME sniffing results with the `file:///` protocol.
## Unsupported text formats

- Non-standard microcomputer ASCII such as **Atari ATASCII** and **Commodore PETSCII** texts are not supported.

- Binary formats such as **.xbin** and **.bin** are not usable as browsers refuse to render unidentified file data on a page.

## Missing or invalid characters

When used by text encoded in [CP-437](https://en.wikipedia.org/wiki/Code_page_437), the following five characters will not display correctly in a web browser.

**ü ì Å É ¥**

One of the many issues with legacy 8-bit character encodings is that not all code pages use every character. So while the original IBM CP-437 used by many ANSI art pieces has a complete set of 256 characters, the browser-friendly [Windows CP-1252](https://en.wikipedia.org/wiki/Windows-1252) offers 251 characters.

For example, fünf German for five is a legitimate word in CP-437 (OEM-US) but breaks in Windows CP-1252.

<figure markdown>
  ![fünf viewed as CP-437/OEM-US](assets/limitations-funf-1.png)
  <figcaption>fünf viewed as CP-437 or OEM-US</figcaption>
</figure>

<figure markdown>
  ![fünf viewed as Windows-1252](assets/limitations-funf-2.png)
  <figcaption>fünf viewed as Windows-1252</figcaption>
</figure>

## Fonts and styling accuracy

- The extension uses [TrueType fonts](https://en.wikipedia.org/wiki/TrueType), which are affected by the operating system font hinting; ClearType on Windows, Quartz in macOS, and FreeType on Linux. [Oliver Schmidhauser has a helpful summary of the issue](https://glow.li/technology/2016/7/15/using-pixel-fonts-in-a-browser-without-font-smoothing).

- Some fonts are for 40-column screens (characters per line of text), but the extension doesn't enforce that limitation.

- The browser and the operating system can modify the font width, height, and space for either accessibility or due to user-applied themes.
