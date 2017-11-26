# RetroTxt

## QA

To ask a question, report a bug or request a feature please feel free to [leave a new issue](https://github.com/bengarrett/RetroTxt/issues) on the GitHub repository or get in contact with [@bens_zone](https://twitter.com/bens_zone) on Twitter.

* [Can I adjust the size of the font ?](#font-size)
* [Can I view files stored on my computer ?](#view-files)
* [Are the fonts and styling historically accurate ?](#font-accurate)
* [What text encodings are supported ?](#text-encodings)
* [Garbled text ?](#garbled)
* [Code page tables](#cp-tables)

### Known issues

* A browser's [MIME sniffing](https://en.wikipedia.org/wiki/Content_sniffing) will often override RetroTxt, forcing text files to download rather than display in a tab.
* Firefox (Gecko) will usually produce incorrect MIME sniffing results with the `http(s)://` protocol.
* Chrome (Blink) can produce incorrect MIME sniffing results with the `file:///` protocol.
* Unsupported formats include Atari ATASCII and Commodore PETSCII.

<a id="font-size"></a>

### Can I adjust the size of the font ?

You can change the _zoom_ of the font by using the <kbd>Ctrl</kbd> <kbd>+</kbd> and <kbd>Ctrl</kbd> <kbd>-</kbd> keys.

<a id="view-files"></a>

### Can I view files stored on my computer ?

By typing a path into the address bar, many browsers are quite happy to read files and directories stored locally on your computer.

On Windows, for example, pasting `C:\Users\Ben\Downloads\myfile.txt` into Chrome and Firefox will convert it to into a browser-friendly file URI and view the document in the browser.

`file:///C:/Users/Ben/Downloads/myfile.txt`

You can also [browse your Windows drive](file:///C:/) or [your Linux and macOS drives](file:///).

Chrome will need to [__Allow access to the file URLs__ permission](chrome://extensions/) enabled if you want them to work with local files automatically.

In Windows to make a web browser your default text file viewer.

1. Right-click on the desktop and choose __text file__ under __New__ to create the file `New Text Document.txt`
1. Right-click on the file, select __Choose another app__ (_Choose default program..._ in Windows 7) under __Open with__ item
1. Then under __Other options__ scroll down and select your browser

<a id="font-accurate"></a>

### Are the fonts and styling historically accurate ?

* The extension uses TrueType fonts which are affected by the operating system font smoothing effects; ClearType on Windows, Quartz in macOS and FreeType on Linux. [Oliver Schmidhauser has a useful summary on the issue](https://oliverse.ch/technology/2016/07/16/using-pixel-fonts-in-a-browser-without-font-smoothing.html).

* Some fonts are for 40 columns (characters per line of text), but the extension doesn't enforce that limitation.

* The web browser and the operating system can make modifications the font width, height, and space for either accessibility or due to user applied themes.

<a id="text-encodings"></a>

### What text encodings are supported ?

Please see [Technical Specifications on supported text](technical.md)

<a id="garbled"></a>

### Garbled text ?

There could be many causes of this, but generally, it is related to the web server or browser choosing the incorrect character encoding for the file.

In __Firefox__ press <kbd>ALT</kbd> <kbd>v</kbd> and select __Text Encoding__.

Choose a more suitable character encoding but if you are not quite sure which one to use but the document is in English. First, try the __Unicode (UTF-8)__ then each of the other __Western__ options.

Without using a 3rd-party web extension, **Chrome** cannot switch the character encoding.

You could also try to manually switch the transcoding RetroTxt applies by right-clicking on the page and select __Transcode text__ from the __RetroTxt__ context menu.

![Context menu transcode text](assets/context_menu_transcode_text.png)

<a id="cp-tables"></a>

### Code page tables

* [ASCII codes](http://www.ascii-codes.com/)
* [ASCII-1967/US-ASCII](http://0x6a.org/ASCII)
* [CP-437](https://msdn.microsoft.com/en-us/goglobal/cc305156)
* [ISO 8859-1](https://msdn.microsoft.com/en-us/goglobal/cc305167)
* [Windows 1252](https://msdn.microsoft.com/en-us/goglobal/cc305145)
* [Unicode](http://unicode-table.com/)
