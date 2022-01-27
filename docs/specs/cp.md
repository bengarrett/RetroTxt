# Code pages and text encoding

Regardless of the source, JavaScript converts all the text it handles into UTF-16.
UTF-16 is based on Unicode and is compatible with UTF-8, and backwards compatible with ISO-8859-1 and US-ASCII. But otherwise, all other loaded text needs to be transcoded to display all characters accurately.

| Character set                                                | Support | About                                                                                                                                      |
| ------------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| [US-ASCII](https://en.wikipedia.org/wiki/ISO/IEC_646)        | Browser | The original text encoding of the Internet, also known as ANSI X3.4 or ISO 646                                                             |
| [CP-437](https://en.wikipedia.org/wiki/Code_page_437)        | Yes     | The most common encoding for ASCII, ANSI art and MS-DOS text                                                                               |
| [CP-1252](https://en.wikipedia.org/wiki/Windows-1252)        | Yes     | Also called Windows-1252 or Windows ANSI, it's backwards compatible with ISO-8859-1 and was the default encoding for legacy Windows        |
| [ISO-8859-1](https://en.wikipedia.org/wiki/ISO/IEC_8859-1)   | Browser | The replacement for US-ASCII that supported twice as many characters and was the default encoding for the Commodore Amiga and legacy Linux |
| [ISO-8859-15](https://en.wikipedia.org/wiki/ISO/IEC_8859-15) | Yes     | A replacement for ISO-8859-1 that added some missing characters such as the `€` sign                                                       |
| [SHIFT JIS](https://en.wikipedia.org/wiki/Shift_JIS)         | Browser | A legacy Japanese encoding used by Shift JIS art                                                                                           |
| [UTF-8](http://unicode.org/faq/utf_bom.html#utf8-1)          | Browser | The current standard encoding for HTML4/5 and many documents, it supports over a hundred thousand characters                               |
| [UTF-16](http://unicode.org/faq/utf_bom.html#utf16-1)        | Browser | The Unicode implementation used by JavaScript and many documents not written in the Latin alphabet                                         |
| CP-1250, CP-1251, ISO-8859-5                                 | Yes     | Encodings that are mistakenly used by Chromium when viewing ANSI and ASCII art                                                             |
