---
authors:
    - Ben Garrett
date: 2023-04-25
---

# Secure and restrict RetroTxt

!!! info inline end ""
    For security and performance, **RetroTxt will only work on websites and domains you specifically list** in the _Run RetroTxt on files hosted on these domains_ list. [From there you can add or remove the domains of your choosing](/usage/first/#monitor-a-new-website).

Unfortunately, on installation, RetroTxt v5 requests permission to _Read and change all your data on all websites_. It is a limitation of the permission configuration, and in the future, I hope these can be fine-tuned and narrowed.

If you work in a corporate environment or want to limit the access of RetroTxt, please read on.

<figure markdown>
  ![RetroTxt add extension](../assets/add-retrotxt.png){ loading=lazy, width=600 }
  <figcaption>Add extension, broad permission request</figcaption>
</figure>

## Add RetroTxt to its own isolated Profile

Firstly, I'd recommend [creating a new Chrome or Edge profile](https://support.google.com/chrome/answer/2364824) to install RetroTxt. The new profile does not need a Google or Microsoft account when using the __Continue without an account__ option. And importantly RetroTxt will only ever operate within that profile. By switching between profiles, any signed-in accounts and webpages will be wholly isolated from RetroTxt.

## Remove Suggestions

For the fans of ANSI and ASCII art, there are several websites that RetroTxt monitors in the background. Disable these by clicking the RetroTxt toolbar button, and in the popup, click the blue _To include a new website_ button.

Under __Feature__ `>` _Run RetroTxt on files hosted on these domains_, click the **remove** suggestions button, and now RetroTxt will only monitor retrotxt.com. Read on in the Manage extension section below to also block this.

## Manage extension

RetroTxt can be further isolated using the Manage extension configuration.

To access this, right-click the RetroTxt toolbar button and select _Manage extension_.

<figure markdown>
  ![RetroTxt add extension](../assets/add-retrotxt.png){ loading=lazy, width=600 }
  <figcaption>Add extension, broad permission request</figcaption>
</figure>

Scroll down to _Site access_ under _Permissions_.

Under the _Allow this extension to read and change all your data on websites you visit_, swap the _On all sites_ to __On click__.

!!! warning ""
    **This setting blocks RetroTxt from being notified of or accessing any tabs.**

<figure markdown>
  ![RetroTxt add extension](../assets/add-retrotxt.png){ loading=lazy, width=600 }
  <figcaption>Add extension, broad permission request</figcaption>
</figure>

To test the change, visit [https://retrotxt.com/e/preview_02.ans](https://retrotxt.com/e/preview_02.ans), and the untouched ANSI document is raw text, as RetroTxt cannot access this and any other tabs.

!!! tip inline end "Refresh tabs"
    After permitting access, any open tabs will need reloading.

But the RetroTxt toolbar button is subtly highlighted and embossed to signify it is blocked. Clicking it permits RetroTxt to access retrotxt.com temporarily for the browser session.

<figure markdown>
  ![RetroTxt add extension](../assets/add-retrotxt.png){ loading=lazy, width=600 }
  <figcaption>Add extension, broad permission request</figcaption>
</figure>