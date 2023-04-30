---
hide:
---
# First-time usage

!!! tip inline end "Read and change all data"
    Despite this access, __RetroTxt always ignores websites other than those you tell it to monitor in the background__. It also ignores all markup text, such as HTML or XML, for your privacy and overall browser performance.

    [If unrestricted access remains a worry, you can configure the browser to restrict RetroTxt further](/usage/secure/).

## Add extension

On installation from the [Chrome web store](https://chrome.google.com/webstore/detail/retrotxt/gkjkgilckngllkopkogcaiojfajanahn) or [Microsoft Edge add-ons](https://microsoftedge.microsoft.com/addons/detail/retrotxt/hmgfnpgcofcpkgkadekmjdicaaeopkog), your browser will prompt for permission to read and change all data on all websites. Unfortunately, there is no workaround to avoid this.

<figure markdown>
  ![RetroTxt add extension](../assets/add-retrotxt.png){ loading=lazy, width=600 }
  <figcaption>Add "RetroTxt"? prompt to Add extension</figcaption>
</figure>

---

## New install

!!! question inline end "What is .ans?"
    The `.ans` filename extension signifies text files embedded with ANSI escape control characters for terminals to permit the layout and colorization of the text.

Once installed, you can test the functionality by viewing the RetroTxt ANSI logo hosted at:

[https://retrotxt.com/e/preview_02.ans](https://retrotxt.com/e/preview_02.ans)

<figure markdown>
  ![RetroTxt new logo](../assets/new-install.png){ loading=lazy, width=600 }
  <figcaption>RetroTxt ANSI logo in the tab</figcaption>
</figure>

---

## Hide the header

You can click the blue arrow on the upper-left corner to hide the header and remove the clutter.

<figure markdown>
  ![RetroTxt hidden header](../assets/hide-the-header.png){ loading=lazy, width=600 }
  <figcaption>The clutter free displays</figcaption>
</figure>

---

## Original text

If you want to view the original ANSI document, focus the tab and to launch a view source tab, tap:

++ctrl++ <kbd>u</kbd> &nbsp; or &nbsp; ++command++ ++option++ <kbd>u</kbd>

<figure markdown>
  ![RetroTxt raw text](../assets/original-text.png){ loading=lazy, width=600 }
  <figcaption>RetroTxt logo raw ANSI text</figcaption>
</figure>

---

## Monitor a new website

This example shows how to add a new website to the collection that RetroTxt monitors in the background. In this case, we will use the Internet Assigned Numbers Authority website at [iana.org](https://www.iana.org), which hosts many documents in plain text.

In a tab, open the text document [special-use-domain-names.txt](https://www.iana.org/assignments/special-use-domain-names/special-use-domain-names.txt).

Despite being plain text, RetroTxt ignores the page as it is not monitoring [iana.org](https://www.iana.org).

<figure markdown>
  ![RetroTxt toolbar menu](../assets/special-use-domain-names.png){ loading=lazy, width=600 }
  <figcaption>Special-Use Domain Names text document</figcaption>
</figure>

Click the RetroTxt toolbar button and a popup will display the websites it monitors in the background. [You can learn more about or remove these websites](/usage/secure/#remove-suggestions).

In the popup, click the blue _To include a new website_ button.

<figure markdown>
  ![RetroTxt popup](../assets/popup.png){ loading=lazy, width=600 }
  <figcaption>Toolbar popup</figcaption>
</figure>

Under __Feature__ `>` _Run RetroTxt on files hosted on these domains_ `>` _Paste a URL or hostname_ input, copy and __add__ the website URL:

[https://www.iana.org](https://www.iana.org)

<figure markdown>
  ![Run RetroTxt on files hosted on these domains](../assets/feature-add-url.png){ loading=lazy, width=600 }
  <figcaption>Add and monitor www.iana.org</figcaption>
</figure>

!!! info inline end "Reload a tab"
    To reload or refresh a tab, tap <kbd>F5</kbd> &nbsp; or &nbsp; ++command++ <kbd>r</kbd>

Switch back to the tab with the `special-use-domain-names.txt` document and reload. RetroTxt will now format the text!

<figure markdown>
  ![RetroTxt default plain text styling](../assets/special-use-domain-names-apply.png){ loading=lazy, width=600 }
  <figcaption>Special-Use Domain Names styled with the IBM VGA font</figcaption>
</figure>

---

## Change the font

Click the <u>__Settings__</u> link in the information header page and then the _Fonts_ tab.

Choose _IBM Plex_ from the __Suggested fonts__.

<figure markdown>
  ![RetroTxt suggested fonts](../assets/font-flexmono.png){ loading=lazy, width=600 }
  <figcaption>IBM Plex suggested fonts</figcaption>
</figure>

Switch back to the tab with the `special-use-domain-names.txt` text, and the font will update.

<figure markdown>
  ![RetroTxt using IBM Plex Mono](../assets/special-use-domain-names-plex.png){ loading=lazy, width=600 }
  <figcaption>Special-Use Domain Names using the IBM Plex mono font</figcaption>
</figure>

---

## Swap colors

Click the __Settings__ link and then the _Display_ tab.

Under __Colors__ `>` _Text pairs_, choose the _white on dark_ selection.

<figure markdown>
  ![RetroTxt text pairs](../assets/colors-text-pairs.png){ loading=lazy, width=600 }
  <figcaption>White on light text pair selection</figcaption>
</figure>

!!! tip inline end "ANSI text"
    A black background _Text pair_ works best with ANSI text.

Switch to the tab with the `special-use-domain-names.txt` text, and the page colors will reflect the change. Feel free to revert to the _MS-DOS_ color pair or choose another.

<figure markdown>
  ![RetroTxt white on light text](../assets/special-use-domain-names-white-bg.png){ loading=lazy, width=600 }
  <figcaption>The document using the white on light text pair selection</figcaption>
</figure>

---

## Remove a website monitor

Finally, to remove the monitoring of [www.iana.org](https://www.iana.org). Click the RetroTxt toolbar button and also the blue, _To include a new website_ button.

<figure markdown>
  ![RetroTxt pop](../assets/popup.png){ loading=lazy, width=600 }
</figure>

Click the delete __x__ button besides the [www.iana.org](https://www.iana.org) entry.

<figure markdown>
  ![RetroTxt delete entry](../assets/iana-tag.png){ loading=lazy, width=300 }
  <figcaption>Delete a website monitor</figcaption>
</figure>

Switch back to the `special-use-domain-names.txt` document tab and reload. It should revert to the original, unformatted text.

<figure markdown>
  ![Original document](../assets/special-use-domain-names.png){ loading=lazy, width=600 }
  <figcaption>The plain text document is in a browser tab</figcaption>
</figure>
