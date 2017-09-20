# RetroTxt

## Options

The Options dialogue lets you select a wide variety of font, colour and size combinations.
That RetroTxt will use when theming text in the browser, as well as a number behaviour configurations to automate the execution of RetroTxt when it encounters text files.

In Chrome, you can launch the Options dialogue by right-clicking the RetroTxt toolbar button and selecting __Options__.

![Line height selection](assets/retrotxt_toolbar_button_chrome.png)

In Firefox the Options dialogue can be accessed from the Extensions tab.
To do this, in a new tab enter the address `about:addons` and select **Extensions**.
Then click the Options button under the RetroTxt listing.

### Fonts

![Font options selection](assets/options_fonts.png)

RetroTxt has 25 different monospaced font choices to apply to text. Some fonts have wide and tall variants.
Those listed in the left pane are IBM PC, PS/2 and MS-DOS clone system fonts while the ones on the right belong to other home computer systems.

### Display

![Display behaviour checks](assets/options_display_behavior.png)

### Colour pair

![Colour pair](assets/options_colour_pair.png)

The Colour pair menu allows you to apply a colour to text and background theme to all text handled by RetroTxt.
These pairs are also base colours for colourize ANSI text.

The choices ordered into three categories. Systems are recreations of ancient computer operating systems.
Dark and Light correspond to colours used on either a black (Dark) or white (Light) background.

The RGB values of these colour pairs are in the source code `\css\text-colors.css`

- **MS-DOS** uses VGA grey text on black.
- **Windows** is themed on its `notepad.exe` program and uses black text on white.
- **Apple II** based on the Apple home computer.
- **Amiga** based on the Commodore Amiga Workbench with white text on grey.
- **Atari ST** based on the Atari TOS with black text on white.
- **C-64** based on the Commodore 64 boot screen with a light on a dark blue colour pair.

![Font options selection](assets/theme_ms-dos.png) ![Font options selection](assets/theme_windows.png) ![Font options selection](assets/theme_amiga.png) ![Font options selection](assets/theme_appleii.png) ![Font options selection](assets/theme_c64.png) ![Font options selection](assets/theme_atari-st.png)

### Line height

![Line height selection](assets/options_line_height.png)

Line height lets you add padding between each line of text. The amount of padding used is dependent on the size of the font.
A **25%** line height would introduce padding 1/4 of the height of the font.
A **1x** (100%) value would pad the same height as the font in use.

### Information header

When styling text RetroTxt injects a text header detailing the document metadata and font information.
You can hover the mouse over its text for a brief description of each value.

![Example text & font information header](assets/options_header_example.png)

`▲ ▼`

The up triangle will hide the information header while the down triangle will display it.

`640x544`

These are the _width_ x _length_ values.
Width is the number of pixels used from left to right.
Length is the number of pixels used from top to bottom.

`26.2kB`

Is the number of characters contained in the text measured as a decimal unit.

`CP1252`

Is the document character encoding set by the browser.

`CP437`

Is the character encoding used to display the document.
Character encoding is a complicated subject and the execution not always precise.
If you encounter text that is not showing the expected characters, you can transcode the document to apply a different set of characters and its technical name will be displayed here.

- **CP437** IBM/MS-DOS Code Page 437
- **CP1252** Code Page 1252 commonly used in legacy Microsoft Windows systems
- **ISO8859-1** ISO-8859 Part 1: Latin alphabet No. 1 alternatively known as ECMA-94
- **ISO8859-5** ISO-8859 Part 5: Latin alphabet No. 5
- **ISO8859-15** ISO-8859 Part 15: Latin alphabet No. 9
- **UTF-8** Universal Coded Character Set 8-bit
- **US-ASCII** Plain text, alternatively known as ASA X3.4, ANSI X3.4, ECMA-6, ISO/IEC 646

`VGA8`

Is the font name used.

#### Additional information may include

`ANSI`

Any special controls or functions embedded into the text. ANSI art, for example, uses ANSI control sequences while ASCII art doesn't use any special controls.

- **ANSI** ECMA-48/ANSI X3.64 presentation control and cursor functions
- **PCBoard** PCBoard BBS text colourisation
- **Wildcat!** Wildcat! BBS text colourisation

`1 unknown control found`

Highlights any errors or warnings encountered when parsing ANSI encoded text.

[SAUCE metadata](http://www.acid.org/info/sauce/sauce.htm) may also be inserted into the header.
_Standard Architecture for Universal Comment Extensions_ is often found in ANSI art but can be attached to any document and allows the author to include titles, dates, comments and affiliations.

### Centre align text

Positions the text document from the left-top margin to the centre the of the display.

### DOS control glyphs

The PC/MS-DOS _Code Page 437_ is not completely standards compliant as it uses C0 characters normally reserved for common formatting controls to display character glyphs.
As such these characters are never displayed but enabling this option will reveal these glyphs in the text document.

◘ <small>_= backspace_</small>
○ <small>_= tab_</small>
♪ <small>_= carriage return_</small>
→ <small>_= end of file_</small>
⌂ <small>_= delete_</small>

### Background scanlines

Apply a subtle scan line effect to the backdrop of the page. The effect is more pronounced on light backgrounds but is not applied to the text.

### Text render

#### Normal

Does nothing but the host operating system or browser will most likely apply some font smoothing to the text characters.

![Normal text render](assets/text_render_normal.png)

##### Smeared

Most browsers (other than FireFox on Windows) display vertical line artefacts when showing block characters. This option implements a `text-shadow` property in an attempt to correct this. It unfortunately also blurs alphanumeric characters that make them less readable.

![Smeared text render](assets/text_render_smeared.png)

##### Shadowed

Apply a subtle shadow effect to each character.

![Shadowed text render](assets/text_render_shadowed.png)

## Config

![Execution behaviour checks](assets/options_execution_behavior.png)

### Apply RetroTxt to any text files hosted on these websites

When check the web extension runs in the background and applies RetroTxt to all text files served by websites listed in the textbox.
You can add additional sites to this list by including their domain name appended by a semicolon, for example

- [Defacto2](https://defacto2.net) `defacto2.net;`
- [Gutenberg.org](https://www.gutenberg.org) `gutenberg.org;`
- [Scene.org](https://www.scene.org) `scene.org;`

`defacto2.net;gutenberg.org;scene.org;`

Erasing the textbox content will reset the website list to the RetroTxt defaults.

### Apply RetroTxt to any local text files

Web browsers can load and display documents stored in a computer file system using the [`file:///`](file:///) protocol.
With this option checked the web extension runs in the background.
It applies RetroTxt to all text files that are served using the [`file:///`](file:///) protocol, allowing you to use RetroTxt as an offline NFO, ANSI and ASCII viewer.

### Apply RetroTxt to any downloaded text files

With this option, the web extension will monitor all your file downloads to attempt to apply RetroTxt to all saved text.
It is the browser that determines which files are binary or text so the results could be wrong.

Firefox does not support the feature.
