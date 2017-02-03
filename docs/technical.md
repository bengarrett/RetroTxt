# RetroTxt
##  Technical specifications on supported text

- [Input code pages and text encoding](#input_cp)
- [BBS colour codes](#input_bbs)
- [Input control sequences](#input_cs)
- [ANSI.SYS support](#ansi_sys)
- [ECMA-48 support](#ecma48)

### Input code pages and text encoding
<a name="input_cp">
Regardless of the source, JavaScript converts all the text it handles into UTF-16.
UTF-16 is based on Unicode and is compatible with UTF-8, and backwards compatible with ISO-8859-1 and US-ASCII. But otherwise, all other loaded text needs to be transcoded to display all characters accurately.

| Character set | Support | About |
| ------------- | ------- | ----- |
| [US-ASCII](https://en.wikipedia.org/wiki/ISO/IEC_646) | Native | The original text encoding of the Internet, also known as ANSI X3.4 or ISO 646 |
| [CP-437](https://en.wikipedia.org/wiki/Code_page_437) | Yes | The most common encoding for ASCII, ANSI art and MS-DOS text |
| [CP-865](https://en.wikipedia.org/wiki/Code_page_865) | Yes | An alternative MS-DOS encoding occasionally found in ASCII and ANSI art |
| [ISO-8859-1](https://en.wikipedia.org/wiki/ISO/IEC_8859-1) | Native | The replacement for US-ASCII that supported twice as many characters and was the default encoding for the Commodore Amiga and legacy Linux |
| [CP-1227](https://en.wikipedia.org/wiki/Windows-1252) | Yes | Also called Windows-1252 or Windows ANSI, it's backwards compatible with ISO-8859-1 and was the default encoding for legacy Windows |
| [ISO-8859-15](https://en.wikipedia.org/wiki/ISO/IEC_8859-15) | Yes | A replacement for ISO-8859-1 that added some missing characters such as the € sign |
| [UTF-8](http://unicode.org/faq/utf_bom.html#utf8-1) | Native | The current standard encoding for HTML4/5 and many documents. It supports over a hundred thousand characters.
| [UTF-16](http://unicode.org/faq/utf_bom.html#utf16-1) | Native | The Unicode implementation used by JavaScript and many documents not written in the Latin alphabet.

### BBS colour codes
<a name="input_bbs">
BBS colour codes from the early 1990s were a natural means of applying colour to text served in bulletin board system user interfaces.

| Format | Support | Notes |
| ------ | ------- | ----- |
| Celerity pipe codes | No | |
| [PCBoard @-codes](https://defacto2.net/file/detail/af240c4) | Yes | |
| Renegade pipe codes | No | |
| [Synchronet Ctrl-A codes](http://wiki.synchro.net/custom:ctrl-a_codes) | No | |
| Telegard pipe codes | No | |
| Wildcat! @-codes | Yes | |
| [WWIV heart codes](http://docs.wwivbbs.org/en/latest/displaying_text/) | No | Uses C0 ␃ |
| [WWIV pipe codes](http://docs.wwivbbs.org/en/latest/displaying_text/) | No | |

### Input control sequences
<a name="input_cs">
Control sequences are strings of characters embedded into the text as cursor, display and presentation functions. ANSI art uses control sequences for both its colourisation and cursor positioning, as do remote terminals used by many Linux and Unix systems such as [_xterm_](http://invisible-island.net/xterm/).

| Standard | Support | Notes |
| -------- | ------- | ----- |
| [ANSI.SYS](https://msdn.microsoft.com/en-us/library/cc722862.aspx) | Partial | MS-DOS command prompt driver commonly used with ANSI art |
| [ECMA-6](http://www.ecma-international.org/publications/standards/Ecma-006.htm) | Partial | Also known as US-ASCII or ANSI X3.4 C0 controls |
| [ECMA-48](http://www.ecma-international.org/publications/standards/Ecma-048.htm) | Partial | Also known as _ANSI escape codes_, ANSI X3.64, VT-100, ISO 6429 |

#### ANSI.SYS support
<a name="ansi_sys">
Microsoft's MS-DOS [ANSI.SYS](https://msdn.microsoft.com/en-us/library/cc722862.aspx) driver supported a limited subset of ANSI X3.64 control sequences and introduced some non-standard functions. Most _ANSI art_ uses sequences that target the ANSI.SYS implementation of text controls.

RetroTxt recognises all ANSI.SYS control sequences but skips those that it doesn't support.

| Control | Support | Notes |
| ------- | ------- | ----- |
| Cursor Position | Partial | Supports forward and down only |
| Cursor Up | No | |
| Cursor Down | Yes | |
| Cursor Forward | Yes | |
| Cursor Backward | No | |
| Save cursor position | No | |
| Restore cursor position | No | |
| Erase display | Yes | |
| Erase line | Yes | |
| Set Graphics Mode | Yes | All colours and attributes are supported |
| Set Mode / Reset Mode | Yes | RetroTxt changes the font type and column width but do not attempt to simulate the screen resolution |
| Set Mode / Reset Mode 7 | Yes | Set and disable line wrapping |
| Set Keyboard Strings | No | |

#### ECMA-48 support
<a name="ecma48">
[ECMA-48](http://www.ecma-international.org/publications/standards/Ecma-048.htm) forms the basis of ISO 6429, both of which are the current and acceptable standards for text control sequences. ECMA-48 expands on ANSI X3.64 [_(withdrawn 1997)_](https://www.nist.gov/sites/default/files/documents/itl/Withdrawn-FIPS-by-Numerical-Order-Index.pdf) which first popularised escape sequences in the late 1970s with the [DEC VT100](https://en.wikipedia.org/wiki/VT100) computer.

The following chart lists the limited ECMA-48 sequences that RetroTxt supports.

| Control | Acronym | Value | Support | Notes |
| ------- | ------- | ----- | ------- | ----- |
| Cursor Down | CUD | | Yes | |
| Cursor Forward | CUF | | Yes | |
| Cursor Position | CUP | | Partial | Supports forward and down only |
| Erase in Display | ED |  |  | |
| to end of page | ED | 0 | Partial | Only goes to the end of the line  |
| to beginning of page | ED | 1 | Yes | |
| erase all | ED | 2 | Yes | |
| Erase in Line | EL |  | | |
| to end of line | EL | 0 | Yes | |
| erase line to cursor | EL | 1 | No | |
| erase whole line | EL | 2 | Yes | |
| Horizontal Vertical Position | HVP | | Partial | Supports forward and down only |
| __Select Graphic Rendition__ | SGR | | |  |
| bold | SGR | 1 | Yes |  |
| faint | SGR | 2 | Yes |  |
| italic | SGR | 3 | Yes |  |
| underline | SGR | 4 | Yes |  |
| blink slow | SGR | 5 | Yes |  |
| blink fast | SGR | 6 | Yes |  |
| inverse | SGR | 7 | Yes |  |
| conceal | SGR | 8 | Yes |  |
| crossed out | SGR | 9 | Yes |  |
| font normal | SGR | 10 | Yes |  |
| alternative font | SGR | 11…19 | Yes | See `css/text_ecma_48.css` for the fonts in use |
| Fraktur font | SGR | 20 | No | Germanic Gothic font |
| double underline | SGR | 21 | Yes |  |
| not bold nor faint | SGR | 22 | Yes |  |
| not italic nor Fraktur | SGR | 23 | Yes |  |
| not underline | SGR | 24 | Yes |  |
| steady | SGR | 25 | Yes | No blinking |
| positive image | SGR | 27 | Yes | Not inverse |
| revealed characters | SGR | 28 | Yes | Not concealed |
| not crossed out | SGR | 29 | Yes |  |
| foreground colours | SGR | 30…37 | Yes |  |
| foreground 256 colours | SGR | 38;5;0…255 | Yes | Known as [xterm 256](http://web.archive.org/web/20130125000058/http://www.frexx.de/xterm-256-notes/) but not an ECMA-48 standard |
| foreground RGB colours | SGR | 38;2;R;G;B; | No | ISO-8613-3 24-bit colour support, not an ECMA-48 standard |
| revert to default foreground | SGR | 39 | Yes |  |
| background colours | SGR | 40…47 | Yes |  |
| background 256 colours | SGR | 48;5;0…255 | Yes | Known as [xterm 256](http://web.archive.org/web/20130125000058/http://www.frexx.de/xterm-256-notes/) but not an ECMA-48 standard  |
| background RGB colours | SGR | 48;2;R;G;B; | No | ISO-8613-3 24-bit colour support, not an ECMA-48 standard |
| revert to default background | SGR | 49 | Yes |  |
| framed | SGR | 51 | Yes |  |
| encircled | SGR | 52 | Yes |  |
| overlined | SGR | 53 | Yes |  |
| not framed nor encircled | SGR | 54 | Yes |  |
| not overlined | SGR | 55 | Yes |  |

#### Miscellaneous support
Other common non-standard sequences agreed to by the ANSI art community

| Control | Acronym | Value | Support | Notes |
| ------- | ------- | ----- | ------- | ----- |
| background RGB colours | - | 0;R;G;Bt | No | [PabloDraw 2014 24-bit ANSI implementation](http://picoe.ca/2014/03/07/24-bit-ansi/) |
| foreground RGB colours | - | 1;R;G;Bt | No | [PabloDraw 2014 24-bit ANSI implementation](http://picoe.ca/2014/03/07/24-bit-ansi/) |
| Blink to Bright Intensity Background | - | ?33h | No | [ SyncTERM ](http://cvs.synchro.net/cgi-bin/viewcvs.cgi/*checkout*/src/conio/cterm.txt?content-type=text%2Fplain&revision=HEAD) |
| Blink normal | - | ?33l | No | [ SyncTERM ](http://cvs.synchro.net/cgi-bin/viewcvs.cgi/*checkout*/src/conio/cterm.txt?content-type=text%2Fplain&revision=HEAD) |
