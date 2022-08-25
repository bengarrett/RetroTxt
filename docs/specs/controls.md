---
hide:
  - toc
---
Control sequences are strings of characters embedded into the text as the cursor, display, and presentation functions. ANSI art uses control sequences for its colorization and cursor positioning, as do remote terminals used by many Linux and Unix tools such as [xterm](http://invisible-island.net/xterm/).

| Common name | Official | Partial support | Notes |
| -- | -- | -- | -- |
| DOS ANSI | [ANSI.SYS](https://msdn.microsoft.com/en-us/library/cc722862.aspx) | Yes | An Microsoft DOS system driver commonly used with ANSI art |
| ASCII C0 | [ECMA-6](http://www.ecma-international.org/publications/standards/Ecma-006.htm)[^1] | Yes | Also known as ASCII control codes |
| ANSI | [ECMA-48](http://www.ecma-international.org/publications/standards/Ecma-048.htm)[^2] | Yes | Also known as ANSI escape codes |

[^1]: Historically known as ANSI X3.4.
[^2]: Traditionally known as ANSI X3.64, VT-100, or ISO 6428