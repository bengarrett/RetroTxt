# RetroTxt

## Toolbar button and context menus

The context menu can be found by right-clicking on the active tab (web page) content, and also in Chrome by right-clicking the RetroTxt toolbar button.

![Font options selection](assets/menu_base.png)
![Font options selection](assets/menu.png)

Active tab context menu

![Font options selection](assets/retrotxt_toolbar_menu.png)

Chrome toolbar context menu

### Options

Launch the RetroTxt [Options dialogue](options.md).

#### Display

![Font options selection](assets/menu_display.png)

##### Text and font information

Apply the text and font information header detailing the document metadata and font information.

##### Text alignment

Positions the text document from the left-top margin to the centre the of the display.

##### Scan lines

Apply a subtle scan line effect to the background of the page. The result is more pronounced on light backgrounds and is not applied to the text.

#### Transcode text

Character encoding is complicated and the execution not always precise. If you encounter text that is not displaying as expected, you can transcode the text to show a different set of characters. Transcode text selections only apply to the active browser tab.

![Font options selection](assets/menu_transcode_text.png)

![Font options selection](assets/text_transcode_ok.png)

A text document with the correct character encoding

![Font options selection](assets/text_transcode_x.png)

The same document with the incorrect transcoding

##### System guess

**The default behaviour**, this lets RetroTxt try to determine the base character encoding of the text and when needed, apply any transcoding.

##### ↺ CP-1252

Force the active tab to parse the source text using [**CP-1252**](https://en.wikipedia.org/wiki/Windows-1252) encoding.

##### ↻ CP-1252

Force the active tab to display the text using **CP-1252**, a familiar legacy Microsoft Windows encoding instead of the default MS-DOS [*CP-437*](https://en.wikipedia.org/wiki/Code_page_437).

##### ↺ ISO 8859-5

Force the active tab to parse the source text using [**ISO 8895-5**](https://en.wikipedia.org/wiki/ISO/IEC_8859-5) encoding.

##### ↻ ISO 8859-15

Force the active tab to display the text using [**ISO-8859-15**](https://en.wikipedia.org/wiki/ISO/IEC_8859-15), the recommended encoding for Linux and the web in the 2000s.

##### ↻ US-ASCII

Force the active tab not to transcode. Aforementioned can be used to make documents encoded in [**UTF-8**](https://en.wikipedia.org/wiki/UTF-8) or [**ISO-8859-1**](https://en.wikipedia.org/wiki/ISO/IEC_8859-1) to display.

**UTF-8** is the most common, contemporary code set to encoded Unicode text (including Emojis) and it is nearly always in use with HTML5. **ISO-8859-1** was the original code set used by Linux, the Commodore Amiga and online during the 1990s. It is near identical to _ISO-8859-15_ but lacks a few European-centric characters such as the `€` sign.

### Terminal Black / Terminal White

Applies the Chrome *Fixed-width font* or the Firefox *Monospace* font. To either MS-DOS grey text on a **black** background or black text on a **white** background.

![Font options selection](assets/theme_terminal-black.png)

### IBM PS/2

Applies a 1-bit (2 colours) theme and ISO 8px font to all browser tabs that mimics the [IBM PS/2](https://en.wikipedia.org/wiki/IBM_Personal_System/2) grey text on a black background.

![Font options selection](assets/theme_ps2.png)

### IBM PC

Applies a 1-bit (2 colours) theme and VGA 8px font to all browser tabs that mimics the [IBM-PC](http://oldcomputers.net/ibm5150.html)/MS-DOS grey text on a black background.

![Font options selection](assets/theme_ms-dos.png)

### Amiga

Applies a 1-bit (2 colours) theme and Topaz font to all browser tabs that mimics the [Commodore Amiga 500](http://oldcomputers.net/amiga500.html) Workbench white text on a grey background.

![Font options selection](assets/theme_amiga.png)

### Apple II

Applies a 1-bit (2 colours) theme and font to all browser tabs that mimics the [Apple II](http://oldcomputers.net/appleii.html) DOS screen black text on a green background.

![Font options selection](assets/theme_appleii.png)

### Atari ST

Applies a 1-bit (2 colours) theme and font to all browser tabs that mimics the [ATARI ST](http://oldcomputers.net/atari520st.html) TOS screen black text on a white background.

![Font options selection](assets/theme_atari-st.png)

### Commodore 64

Applies a 1-bit (2 colours) theme and font to all browser tabs that mimics the [Commodore 64](http://oldcomputers.net/c64.html) load screen blue text on a dark blue background.

![Font options selection](assets/theme_c64.png)

### Help

Opens a new browser tab and loads the [documentation](https://github.com/bengarrett/RetroTxt/blob/master/docs/index.md) hosted on GitHub.
