---
title: Character encoding
authors:
    - Ben Garrett
date: 2022-08-30
---
# Character encoding

Character encoding is complicated, and the execution is not always precise. If you encounter a page not displaying as expected, you can transcode the text to show a different set of characters.

Transcode character encodings can be cycled by clicking the _encoding_ results under the Information header of each tab.

<figure markdown>
![A working example of transcoding](../assets/char-transcode.png)
  <figcaption>The yellow marked text can be clicked to transcode the text</figcaption>
</figure>

---

<figure markdown>
![A working example of transcoding](../assets/menus-transcode-ok.png)
  <figcaption>Here is a text document with the correct character encoding</figcaption>
</figure>

<figure markdown>
![Nonworking example of transcoding](../assets/menus-transcode-x.png)
  <figcaption>Here is the same document with the incorrect transcoding</figcaption>
</figure>

The default behavior lets RetroTxt try to determine the base character encoding of the text and, when needed, apply any transcoding.

[**UTF-8**](https://en.wikipedia.org/wiki/UTF-8) is the most common current code set to encode Unicode text[^1] and is frequently used with HTML5.

[^1]: including emojis 😉

[**ISO-8859-1**](https://en.wikipedia.org/wiki/ISO/IEC_8859-1) was the original code set used by Linux, the Commodore Amiga, and the Internet during the 1990s.

__ISO-8859-15__ is nearly identical to #1 but lacks a few European-centric characters, such as the `€` sign.

### › CP1252

Force the active tab to parse the source text using [**CP-1252**](https://en.wikipedia.org/wiki/Windows-1252) encoding.

### › ISO8859-15

Force the active tab to display the text using [**ISO-8859-15**](https://en.wikipedia.org/wiki/ISO/IEC_8859-15), the recommended encoding for Linux and the web in the 2000s.

### › USASCII

Force the active tab not to transcode and can help to make documents encoded in
[**UTF-8**](https://en.wikipedia.org/wiki/UTF-8) or [**ISO-8859-1**](https://en.wikipedia.org/wiki/ISO/IEC_8859-1) to display.

### CP1252 ›

Force the active tab to display the text using **CP-1252**, a familiar legacy Microsoft Windows encoding, instead of the default, USA MS-DOS, [**CP-437**](https://en.wikipedia.org/wiki/Code_page_437).

### ISO8859-5 ›

Force the active tab to parse the source text using [**ISO 8895-5**](https://en.wikipedia.org/wiki/ISO/IEC_8859-5) encoding.
