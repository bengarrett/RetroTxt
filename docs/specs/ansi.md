---
title: ANSI/ECMA-48 support
authors:
    - Ben Garrett
date: 2022-08-30
hide:
  - toc
---
# ANSI/ECMA-48 support

[ECMA-48](http://www.ecma-international.org/publications/standards/Ecma-048.htm) forms the basis of ISO 6429, the current and acceptable standards for text control sequences. ECMA-48 expands on ANSI X3.64 [(withdrawn 1997)](https://www.nist.gov/sites/default/files/documents/itl/Withdrawn-FIPS-by-Numerical-Order-Index.pdf), which first popularised escape sequences in the late 1970s with the [DEC VT100](https://en.wikipedia.org/wiki/VT100) computer.

The following chart lists the limited ECMA-48 sequences that RetroTxt supports.

| Control | Acronym | Value | Support | Notes |
| -- | -- | -- | -- | -- |
| Cursor Forward Tabulation | CHT | | Yes | Acts as 4 forward movements |
| Cursor Down | CUD | | Yes | |
| Cursor Forward | CUF | | Yes | |
| Cursor Position | CUP | | Partial | Supports forward and down only |
| Erase in Display | ED | | | |
| to end of page | ED | `0` | Partial | Only goes to the end of the line |
| to beginning of page | ED | `1` | Yes | |
| erase all | ED | `2` | Yes | |
| Erase in Line | EL | | | |
| to end of line | EL | `0` | Yes | |
| erase line to cursor | EL | `1` | No | |
| erase whole line | EL | `2` | Yes | |
| Horizontal Vertical Position | HVP | | Partial | Supports forward and down only |
| **Select Graphic Rendition** |
| bold | SGR | `1` | Yes | |
| faint | SGR | `2` | Yes | |
| italic | SGR | `3` | Yes | |
| underline | SGR | `4` | Yes | |
| blink slow | SGR | `5` | Yes | |
| blink fast | SGR | `6` | Yes | |
| inverse | SGR | `7` | Yes | |
| conceal | SGR | `8` | Yes | |
| crossed out | SGR | `9` | Yes | |
| font normal | SGR | `10` | Yes | |
| alternative font 1 | SGR | `11` | Yes | [IBM BIOS](https://int10h.org/oldschool-pc-fonts/fontlist/font?ibm_bios) |
| alternative font 2 | SGR | `12` | Yes | [IBM CGA](https://int10h.org/oldschool-pc-fonts/fontlist/font?ibm_cga) |
| alternative font 3 | SGR | `13` | Yes | [IBM CGA](https://int10h.org/oldschool-pc-fonts/fontlist/font?ibm_cgathin) <small>thin</small> |
| alternative font 4 | SGR | `14` | Yes | Commodore Amiga Topaz |
| alternative font 5 | SGR | `15` | Yes | [IBM EGA](https://int10h.org/oldschool-pc-fonts/fontlist/font?ibm_ega_8x14) <small>8x14</small> |
| alternative font 6 | SGR | `16` | Yes | [IBM EGA](https://int10h.org/oldschool-pc-fonts/fontlist/font?ibm_ega_9x14) <small>9x14</small> |
| alternative font 7 | SGR | `17` | Yes | [IBM VGA](https://int10h.org/oldschool-pc-fonts/fontlist/font?ibm_vga_8x14) <small>8x14</small> |
| alternative font 8 | SGR | `18` | Yes | [IBM VGA](https://int10h.org/oldschool-pc-fonts/fontlist/font?ibm_vga_9x14) <small>9x14</small> |
| alternative font 9 | SGR | `19` | Yes | [IBM MDA](https://int10h.org/oldschool-pc-fonts/fontlist/font?ibm_mda) |
| Fraktur font | SGR | `20` | Yes | Germanic Gothic font<br>[Eagle Spirit PC Alt 3](https://int10h.org/oldschool-pc-fonts/fontlist/font?eaglespcga_alt3) <small>fantasy inspired font</small> |
| double underline | SGR | `21` | Yes | |
| not bold nor faint | SGR | `22` | Yes | |
| not italic nor Fraktur | SGR | `23` | Yes | |
| not underline | SGR | `24` | Yes | |
| steady | SGR | `25` | Yes | No blinking |
| positive image | SGR | `27` | Yes | Not inverse |
| revealed characters | SGR | `28` | Yes | Not concealed |
| not crossed out | SGR | `29` | Yes | |
| foreground colors | SGR | `30`…`37` | Yes | |
| foreground 256 colors[^1] | SGR | `38;5;0`…`255` | Yes | |
| foreground RGB colors[^2] | SGR | `38;2;R;G;B;` | Yes | |
| revert to default foreground | SGR | `39` | Yes | |
| background colors | SGR | `40`…`47` | Yes | |
| background 256 colors[^1] | SGR | `48;5;0`…`255` | Yes | |
| background RGB colors[^2] | SGR | `48;2;R;G;B;` | Yes | |
| revert to default background | SGR | `49` | Yes | |
| framed | SGR | `51` | Yes | |
| encircled | SGR | `52` | Yes | |
| overlined | SGR | `53` | Yes | |
| not framed nor encircled | SGR | `54` | Yes | |
| not overlined | SGR | `55` | Yes | |
| bold foreground colors[^3] | SGR | `90`…`97` | Yes | |
| bright background colors[^3] | SGR | `100`…`107` | Yes | Requires iCE colors to be enabled |

[^1]: Known as [xterm 256](http://web.archive.org/web/20130125000058/http://www.frexx.de/xterm-256-notes/) it is not an ECMA-48 standard.
[^2]: Allows for ISO-8613-3 24-bit color support, but it is not an ECMA-48 standard.
[^3]: Non-standard aixterm, [IBM AIX terminal support](https://www.ibm.com/docs/en/aix/7.1?topic=aixterm-command).