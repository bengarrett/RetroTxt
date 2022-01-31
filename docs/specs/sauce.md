---
hide:
  - toc
---
# SAUCE support

[SAUCE](http://www.acid.org/info/sauce/sauce.htm), created by Olivier "Tasmaniac" Reubens of [ACiD](http://www.acid.org), is a metadata protocol for scene artworks. RetroTxt parses these to determine text formatting and authorship results shown in the _Text & font information_ header.

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
| TInfo1 | Partial | Yes | When it exists it is used to set _Character width_ (columns of text) |
| TInfo2 | No | | |
| TInfo3 | No | | |
| TInfo4 | No | | |
| Comments | Yes | Yes | |
| TFlags | Partial | Yes | See **ANSiFlags** below |
| TInfoS | Partial | Yes | See **FontName** below |

## ANSiFlags

_ANSiFlags allow an author of ANSi and similar files to provide a clue to a viewer/editor how to render the image_.

| Flag | Name | Used | Notes |
| -- | -- | -- | -- |
| B | Non-blink mode | Yes | Also known as iCE colors |
| LS | Letter-spacing | Yes | |
| AR | Aspect Ratio | No | |