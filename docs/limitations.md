---
title: Limitations and known issues
summary: ANSI, browser mime sniffing, codepage missing characters.
authors:
    - Ben Garrett
date: 2022-08-30
---
# Limitations and known issues

This page contains the known but unfixable problems that may occur using RetroTxt.

## Unsupported text formats

Micro-computer era, non-standard ASCII are not supported.

- [**Atari ATASCII**](https://atariwiki.org/wiki/Wiki.jsp?page=Atari%20ATASCII%20Table)
- [**Commodore PETSCII**](https://sta.c64.org/cbm64pet.html)

Binary formats such as [**.xb**](http://fileformats.archiveteam.org/wiki/XBIN) and **.bin** are not usable as browsers refuse to display unidentified file data in a tab.

---

!!! note inline end ""
    Creating motion and animations would require a considerable amount of programming work for little reward. It would be a massive hit to browser performance, and most larger and more complicated ANSI would probably never render as the browser would flag the tab as unresponsive.

## BBS era ANSI art

Many [Bulletin Board System](https://spectrum.ieee.org/tech-history/cyberspace/social-medias-dialup-ancestor-the-bulletin-board-system) era ANSI art relied on an 80x25 fixed terminal with the cursor positioning to create motion and animations **that do not convert using RetroTxt**, including [ANSI animations](http://fileformats.archiveteam.org/wiki/ANSIMation) and [music](http://artscene.textfiles.com/ansimusic/).

---

## MIME sniffing

Browser [MIME sniffing](https://en.wikipedia.org/wiki/Content_sniffing) often overrides RetroTxt, forcing text files to download rather than display in a tab.

Chrome browsers can produce incorrect MIME sniffing results with the `file:///` protocol.

<!--
- Firefox usually produces incorrect MIME sniffing results with the `http(s)://` protocol. -->

---

## Missing or invalid characters

Text encoded in [CP-437](https://en.wikipedia.org/wiki/Code_page_437) will fail to print the following five characters in a browser.

**ü &nbsp; ì  &nbsp; Å  &nbsp; É &nbsp; ¥**

One of the many issues with legacy 8-bit character encodings is that not all code pages use all available 256 codepoints. So while the original IBM CP-437 used by many ANSI art pieces has a complete set of 256 characters, the [Windows CP-1252](https://en.wikipedia.org/wiki/Windows-1252) used by web browsers only offers 251 characters, meaning five character glyphs are lost.

For example, fünf German for five is a valid word in CP-437 (OEM-US) but breaks in Windows CP-1252.

<figure markdown>
  ![fünf viewed as CP-437/OEM-US](assets/limitations-funf-1.png)
  <figcaption>fünf viewed as CP-437 or OEM-US</figcaption>
</figure>

<figure markdown>
  ![fünf viewed as Windows-1252](assets/limitations-funf-2.png)
  <figcaption>fünf viewed as Windows-1252</figcaption>
</figure>
