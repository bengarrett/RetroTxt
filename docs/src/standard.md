---
title: Standards
authors:
    - Ben Garrett
date: 2024-02-21
hide:
  - toc
---
# Standards

## ASCII

The American Standard Code for Information Interchange was initially proposed in 1961 by the American National Standards Institute as a standard method to allow various computing and communication devices to communicate with each other. Before this time, machines from multiple manufacturers and even between different models couldn't understand each other's alphabetics, numerals, and other characters.

The standard was revised multiple times, but it only caught on after a 1969 mandate requiring all new systems for US federal use to use the standard to minimize incompatibility between government hardware.

ASCII became the core basis of the early Internet and part of the microcomputer and later PC revolution of the 1970s and 80s. The standard is why anyone making text files on an Apple II from 1977 can view them on an Intel PC running Microsoft Windows in 2024.

ASCII is also a subset ([C0 Controls and Basic Latin](https://www.unicode.org/charts/PDF/U0000.pdf)) of the Unicode standard, the default text encoding for the modern Internet and computing devices. The subset support often means simple text can be read and written by devices that use either standard.

### Links:

* [ISO/IEC 646:1991](https://www.iso.org/standard/4777.html) (paid)
* [EMCA-43](https://ecma-international.org/publications-and-standards/standards/ecma-43/) (free)
* [Britannica - ASCII](https://www.britannica.com/topic/ASCII)
* [The US ASCII Character Set](http://www.columbia.edu/kermit/ascii.html/)
* [Unicode charts](https://www.unicode.org/charts/)

See [Codepages and text encodings](../specs/cp.md) for the character sets supported by the code.

## ANSI

ANSI is an ambiguous term. The [American National Standards Institute](https://www.ansi.org/) is a body that has published numerous computer text standards, including the famed ANSI Standard (X3.64) Control Sequences for Video Terminals and Peripherals, which introduced the control sequences used in modern terminal applications.

It is believed that the term ANSI art originated from Microsoft's misnaming of the ANSI.SYS system driver, which allowed the use of their [MS-DOS](https://www.britannica.com/technology/MS-DOS) operating system.
ANSI usually refers to these near-identical standards.

* ISO 6429 - "Control functions for 7-bit and 8-bit coded character sets"
* ECMA-48  - "Control functions for coded character sets"

### Links:

* [ISO/IEC 6429:1992](https://www.iso.org/standard/12782.html) (paid)
* [ECMA-48](https://ecma-international.org/publications-and-standards/standards/ecma-48/) (free)
* [Microsoft ANSI.SYS](https://msdn.microsoft.com/en-us/library/cc722862.aspx)
* [XTerm Control Sequences](https://invisible-island.net/xterm/ctlseqs/ctlseqs.html)

See [ANSI / ECMA-48 support](../specs/ansi.md) for the control sequences supported by the code.