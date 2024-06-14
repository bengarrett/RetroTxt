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

Binary formats such as [**.xb**](http://fileformats.archiveteam.org/wiki/XBIN) and **.bin** are not usable as <u>browsers refuse</u> to display unidentified binary data in a tab.

---

!!! note inline end ""
    As the browser DOM and HTML are designed for static text, creating text motion and animations would require considerable programming and hacking for little reward.

## BBS era ANSI art

Many [Bulletin Board System](https://spectrum.ieee.org/tech-history/cyberspace/social-medias-dialup-ancestor-the-bulletin-board-system) era ANSI art relied on an 80x25 fixed terminal with the cursor positioning to create motion and animations **that do not convert using RetroTxt**, including [ANSI animations](http://fileformats.archiveteam.org/wiki/ANSIMation) and [music](http://artscene.textfiles.com/ansimusic/).

---

## Text files that always download

The opinionated browser feature [MIME sniffing](https://en.wikipedia.org/wiki/Content_sniffing) often overrides RetroTxt, forcing text files to download rather than display in a tab. Nothing can be done to stop this.

Chrome and Edge browsers can produce incorrect MIME sniffing results with the `file:///` protocol.

<!--
- Firefox usually produces incorrect MIME sniffing results with the `http(s)://` protocol. -->

---

## Missing or invalid characters

Text encoded in [CP-437](https://en.wikipedia.org/wiki/Code_page_437) will fail to print several characters in the browser, as it does not support most MS-DOS-era text encodings. Instead, the browser often interprets these texts in a legacy Windows encoding.

One of the issues with 8-bit character encodings is that many code pages are missing some of the 256 codepoints.
So, while the IBM CP-437 used in many ANSI art pieces retains a complete set of codepoints, the Windows legacy [CP-1252](https://en.wikipedia.org/wiki/Windows-1252) utilized in browsers only presents 251 codepoints, meaning these five character glyphs are lost when swapping between the two.

**ü &nbsp; ì  &nbsp; Å  &nbsp; É &nbsp; ¥**

For example, fünf, German for five, is a valid word in CP-437 but breaks as a Windows CP-1252 document.

<figure markdown>
  ![fünf viewed as CP-437/OEM-US](assets/limitations-funf-1.png)
  <figcaption>fünf viewed as CP-437 (commonly known as OEM-US)</figcaption>
</figure>

<figure markdown>
  ![fünf viewed as Windows-1252](assets/limitations-funf-2.png)
  <figcaption>fünf viewed as Windows-1252</figcaption>
</figure>
