---
title: Codepages and text encodings
authors:
    - Ben Garrett
date: 2022-08-30
hide:
  - toc
---
# Codepages and text encodings

Regardless of the source, JavaScript (JS) converts all the text it handles into UTF-16.

UTF-16 is based on Unicode and is compatible with UTF-8 and backward compatible with ISO-8859-1 and US-ASCII.

But otherwise, all other loaded text must be transcoded to accurately display the characters.

| Character set | Support | About |
| -- | -- | -- |
| [US-ASCII](https://en.wikipedia.org/wiki/ISO/IEC_646)[^1] | Yes [^4] | The original text encoding of the Internet |
| [CP-437](https://en.wikipedia.org/wiki/Code_page_437) | Mock | The most common encoding for ASCII, ANSI art, and text for PC and MS-DOS |
| [CP-1252](https://en.wikipedia.org/wiki/Windows-1252)[^2] | Mock | The default English encoding for legacy Windows[^3] is backward compatible with ISO-8859-1 |
| [ISO-8859-1](https://en.wikipedia.org/wiki/ISO/IEC_8859-1) | Yes [^4] | The replacement for US-ASCII that supported two times the characters and was the default encoding for the Commodore Amiga and legacy Linux |
| [ISO-8859-15](https://en.wikipedia.org/wiki/ISO/IEC_8859-15) | Mock | An update for ISO-8859-1 that added some missing characters such as the `€` Euro sign |
| [SHIFT JIS](https://en.wikipedia.org/wiki/Shift_JIS) | Yes [^4] | A legacy Japanese encoding used by Shift JIS art |
| [UTF-8](https://unicode.org/faq/utf_bom.html#utf8-1) | Yes [^4] | The current standard encoding for modern HTML and most documents it supports over a hundred thousand characters |
| [UTF-16](https://unicode.org/faq/utf_bom.html#utf16-1) | Yes [^4] | The Unicode implementation used by JavaScript and common for documents not written in the Latin alphabet |
| CP-1250<br>CP-1251<br>ISO-8859-5 | Yes [^4] | Encodings that are mistakenly used by Chromium when viewing ANSI and ASCII art |

[^1]: Historically known as ANSI X3.4 or ISO 646.
[^2]: Also called Windows-1252 or Windows ANSI.
[^3]: Created in 1985 for Microsoft Windows 1.0, it was revised in multiple releases of Windows, including Windows 95 and 98.
[^4]: The browser natively handles this character set.