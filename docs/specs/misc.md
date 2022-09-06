---
title: Miscellaneous support
authors:
    - Ben Garrett
date: 2022-08-30
hide:
  - toc
---
# Miscellaneous support

The ANSI art community agrees to other common non-standard sequences.

| Control | Value | Support | Notes |
| -- | -- | -- | -- |
| background RGB colours | `0;R;G;Bt` | Yes | [PabloDraw 2014, 24-bit ANSI implementation](http://picoe.ca/2014/03/07/24-bit-ansi/) |
| foreground RGB colours | `1;R;G;Bt` | Yes | [PabloDraw 2014, 24-bit ANSI implementation](http://picoe.ca/2014/03/07/24-bit-ansi/) |
| Blink to Bright Intensity Background | `?33h` | Yes | [SyncTERM](http://cvs.synchro.net/cgi-bin/viewcvs.cgi/*checkout*/src/conio/cterm.txt?content-type=text%2Fplain&revision=HEAD) |
| Blink normal | `?33l` | Yes | [SyncTERM](http://cvs.synchro.net/cgi-bin/viewcvs.cgi/*checkout*/src/conio/cterm.txt?content-type=text%2Fplain&revision=HEAD) |
