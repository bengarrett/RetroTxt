---
title: Garbled or illegible text?
authors:
    - Ben Garrett
date: 2022-08-30
hide:
  - toc
---
# Garbled or illegible text?

There could be many causes, but it is generally related to the web server or browser choosing the incorrect character encoding for the text file.

Modern web browsers and documents use the [universal UTF-8 Unicode](https://home.unicode.org/), while legacy text files rely on [8-bit codepages that use at most 256 unique text characters or glyphs](https://www.ibm.com/docs/en/informix-servers/14.10?topic=locale-code-sets-character-data). UTF-8 decoding is not 100% backward compatible with the many legacy text encodings. But unfortunately, most browsers have no good way to fix this.

RetroTxt can attempt to resolve this by swapping out different characters based on mocking the more common historic character encodings.

On a RetroTxt rendered tab, there is a clickable item titled __encoding__ in the tab's information header; clicking this multiple times will cycle through the five other mock encodings.

<figure markdown>
![Mocking codepage](../assets/char-transcode.png)
  <figcaption>The yellow marked text can be clicked to mock the text encoding</figcaption>
</figure>

<figure markdown>
![Text with correct legacy encoding](../assets/menus-transcode-ok.png)
  <figcaption>Here is a text document with the correct character encoding</figcaption>
</figure>

<figure markdown>
![Text with incorrect legacy encoding](../assets/menus-transcode-x.png)
  <figcaption>Here is the same text with the incorrect character encoding</figcaption>
</figure>
