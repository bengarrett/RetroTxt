---
title: Privacy policy
authors:
    - Ben Garrett
date: 2022-08-30
---

**RetroTxt does not collect or transmit any data created by your web browser.**

All Extension data is stored locally on your computer using the [storage.local API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/local).

## Technical

The `ext/manifest.json` lists all the Extension permissions RetroTxt requires for operation.

```json title="manifest.json extraction"
{
  "optional_permissions": ["downloads", "downloads.open"],
  "permissions": ["activeTab", "contextMenus", "scripting", "storage"],
}
```

`"permissions"` contain the required permissions.

`"optional_permissions"` have the optional permissions.

## Permissions

RetroTxt gets these permissions automatically on installation.

### [`"activeTab"`](https://developer.chrome.com/docs/extensions/mv3/manifest/activeTab/)

It is needed so RetroTxt can read the current URL of the active browser tab and is used to determine:

1. If the URL is known to the **Run RetroTxt on files hosted on these domains** list.
1. If the URL matches `*://retrotxt.com/*`.
1. If the file points to a known text filename, such as a file extension `.nfo` or `.txt`.

**The read URLs are never saved or transmitted.**

### [`"contextMenus"`](https://developer.chrome.com/docs/extensions/reference/contextMenus/)

It grants RetroTxt access to the context menus API and allows it to create menus on a browser tab and RetroTxt toolbar icon.

### [`"scripting"`](https://developer.chrome.com/docs/extensions/reference/scripting/)

Allows RetroTxt to inject and execute JavaScripts and CSS files into a browser tab and transform it into usable HTML.

### [`"storage"`](https://developer.chrome.com/docs/extensions/mv3/manifest/storage/)

Grants RetroTxt access to the Storage API and allows it to save and retrieve user Options configurations.

## Optional permissions

These permissions toggle when you enable specific RetroTxt Options. The browser will prompt you for a permissions request; if you deny this, the feature will remain off.

### [`"downloads"`](https://developer.chrome.com/docs/extensions/reference/downloads/)<br>`"downloads.open"`

Are needed by the **Monitor downloads** feature. RetroTxt ignores all downloads except those which match the following conditions.

1. The file has a MIME type of either `text/plain`, `text/x-nfo`, or `text-unknown`.
1. The content of the text file does not begin with the characters `<!` or `<?`, usually HTML or scripts.
