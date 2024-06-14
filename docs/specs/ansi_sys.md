---
title: ANSI.SYS support
authors:
    - Ben Garrett
date: 2022-08-30
hide:
  - toc
---
# ANSI.SYS support

Microsoft's MS-DOS [ANSI.SYS](https://msdn.microsoft.com/en-us/library/cc722862.aspx) driver supported a limited subset of ANSI X3.64 control sequences and introduced several non-standard functions. ANSI art generally uses sequences that target the ANSI.SYS implementation of text controls. RetroTxt recognizes all ANSI.SYS controls sequences but skips those that it doesn't support.

| Control | Support | Notes |
| -- | -- | -- |
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
| Set Mode / Reset Mode | Yes | RetroTxt changes the font type and column width but does not attempt to simulate the screen resolution |
| Set Mode / Reset Mode 7 | Yes | Set and disable line wrapping |
| Set Keyboard Strings | No | |