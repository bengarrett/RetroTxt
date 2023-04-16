---
title: SAUCE support
authors:
    - Ben Garrett
date: 2022-08-30
hide:
  - toc
---
# SAUCE support

[SAUCE](https://www.acid.org/info/sauce/sauce.htm), created by Olivier Reubens[^1] is a metadata protocol for scene artworks. RetroTxt parses these to determine text formatting and authorship results shown in the _Text & font information_ header.

| Name | Interpreted | Displayed | Notes |
| -- | -- | -- | -- |
| ID | Yes | No | |
| Version | Yes | No | |
| Title | Yes | Yes | |
| Author | Yes | Yes | |
| Group | Yes | Yes | |
| Date | Yes | Yes | |
| FileSize | No | | |
| DataType | No | | |
| FileType | No | | |
| TInfo1 | Partial | Yes | When found, is used to set the character width[^2] |
| TInfo2 | No | | |
| TInfo3 | No | | |
| TInfo4 | No | | |
| Comments | Yes | Yes | |
| TFlags | Partial | Yes | See **ANSI flags** below |
| TInfoS | Partial | Yes | |

## ANSI flags

_ANSIFlags allow an author of ANSI and similar files to provide a clue to a viewer/editor on how to render the image_.

| Flag | Name | Used |
| -- | -- | -- |
| B | Non-blink mode[^3] | Yes |
| LS | Letter-spacing | Yes |
| AR | Aspect Ratio | No |

[^1]: "Tasmaniac" of [ACiD](https://www.acid.org).
[^2]: Columns of text.
[^3]: Also known as **iCE colors**.