---
title: Miscellaneous support
authors:
    - Ben Garrett
date: 2022-08-30
hide:
  - toc
---
# Miscellaneous support

Other common, non-standard sequences the ANSI community uses.

| Control | Value | Support |
| -- | -- | -- |
| background RGB colours | `0;R;G;Bt` | Yes[^1] |
| foreground RGB colours | `1;R;G;Bt` | Yes[^1] |
| Blink to Bright Intensity Background | `?33h` | Yes[^2] |
| Blink normal | `?33l` | Yes[^2] |

[^1]: [PabloDraw 2014 - 24-bit ANSI](https://web.archive.org/web/20220119052803/https://picoe.ca/2014/03/07/24-bit-ansi/)
[^2]: [SyncTERM](https://web.archive.org/web/20220716214903/http://cvs.synchro.net/cgi-bin/viewcvs.cgi/*checkout*/src/conio/cterm.txt?content-type=text%2Fplain&revision=HEAD)