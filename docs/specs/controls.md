# Control sequences

Control sequences are strings of characters embedded into the text as the cursor, display, and presentation functions. ANSI art uses control sequences for both its colorization and cursor positioning, as do remote terminals used by many Linux and Unix tools such as [xterm](http://invisible-island.net/xterm/).

| Common name | Official | Partial support | Notes |
| -- | -- | -- | -- |
| DOS ANSI | [ANSI.SYS](https://msdn.microsoft.com/en-us/library/cc722862.aspx) | Yes | MS-DOS command prompt driver commonly used with ANSI art |
| ASCII C0 | [ECMA-6](http://www.ecma-international.org/publications/standards/Ecma-006.htm) | Yes | Also known as US-ASCII or ANSI X3.4 C0 controls |
| ANSI | [ECMA-48](http://www.ecma-international.org/publications/standards/Ecma-048.htm) | Yes | Also known as _ANSI escape codes_, ANSI X3.64, VT-100, ISO 6429 |
