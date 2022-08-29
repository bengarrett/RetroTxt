# F.A.Q. - Common questions and fixes

To ask a question, report a bug, or request a feature, please feel free to
[leave a new issue](https://github.com/bengarrett/RetroTxt//issues/new/choose) on the GitHub
repository or [mail](mailto:code.by.ben@gmail.com).

---

## Can I adjust the size of the font?

You can change the _zoom_ of the font by using the <kbd>Ctrl</kbd> <kbd>+</kbd> and <kbd>Ctrl</kbd> <kbd>-</kbd> keys.

---

## Can I view files stored on my computer?

Many browsers are quite happy to read files and directories stored locally on your computer by typing a path into the address bar.

On Windows, for example, pasting `C:\Users\Ben\Downloads\myfile.txt` into Chrome, Brave, Edge, and Firefox will convert it into a browser-friendly file URI and view the document in the browser.

`file:///C:/Users/Ben/Downloads/myfile.txt`

- You can also browse your Windows drive `file:///C:/`.
- Or your Linux and macOS drive `file:///`.

The feature is enabled in the **Options**, **Settings** tab by either having the _Use RetroTxt as a local text file viewer_ or _Monitor downloads_ enabled.

All browsers except Firefox will also need to **Allow access to the file URLs** permission enabled (`chrome://extensions/`) if you want it to work with local files.

---

## What are the text encodings supported?

Please see the [Supported standards document](../technical).

---

## Garbled text?

There could be many causes of this, but it is generally related to the web server or browser choosing the incorrect character encoding for the file.

### Firefox

In the browser, press <kbd>ALT</kbd> <kbd>v</kbd> and select **Text Encoding**.

Choose a more suitable character encoding, but if you are not quite sure which one to use but the document is in English. First, try the **Unicode (UTF-8)** then each of the other **Western** options.

### All other browsers

Without using a 3rd-party Extension, **Chrome**, **Brave**, and **Edge** cannot switch the character encoding.

You could also manually switch the transcoding RetroTxt applies by right-clicking on the page and select **Transcode text** from the RetroTxt context menu.

<figure markdown>
  ![Context menu transcode text](assets/menus-transcode.png)
  <figcaption>Context menu</figcaption>
</figure>
