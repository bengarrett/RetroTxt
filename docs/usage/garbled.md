---
title: Garbled or illegible text?
authors:
    - Ben Garrett
date: 2022-08-30
hide:
  - toc
---
# Garbled or illegible text?

There could be many causes, but it is generally related to the web server or browser choosing the incorrect character encoding for the text file.

Modern web browsers and documents use the universal UTF-8 encoding, while legacy text files rely on 8-bit codepages that use at most 256 different text characters or glyphs. UTF-8 decoding is not 100% backward compatible with the many legacy text encodings. But unfortunately, most browsers have no good way to fix this.

RetroTxt can attempt to resolve this by swapping out different characters based on mocking the more common historic character encodings. There is a clickable item titled encoding in the information header of the tab, and clicking this multiple times will cycle through the five other mock encodings.

<figure markdown>
![A working example of transcoding](../assets/char-transcode.png)
  <figcaption>The yellow marked text can be clicked to transcode the text</figcaption>
</figure>

<figure markdown>
![A working example of transcoding](../assets/menus-transcode-ok.png)
  <figcaption>Here is a text document with the correct character encoding</figcaption>
</figure>

<figure markdown>
![Nonworking example of transcoding](../assets/menus-transcode-x.png)
  <figcaption>Here is the same document with the incorrect transcoding</figcaption>
</figure>
