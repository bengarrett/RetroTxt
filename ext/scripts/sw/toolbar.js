// filename: sw/toolbar.js
//
/*global BrowserOS ConsoleLoad Os */
/*exported SetToolbarIcon ToolbarButton */

/*
Icon formats
For packed extensions (installed from a .crx file), images can be in most formats that the Blink rendering engine can display, including PNG, JPEG, BMP, ICO, and others (SVG is not supported). Unpacked extensions must use images in the PNG format.

Tooltip titles
The tooltip, or title, appears when the user hovers the mouse on the extension's icon in the toolbar. It is also included in the accessible text spoken by screenreaders when the button gets focus.

Badge
Actions can optionally display a "badge" — a bit of text layered over the icon. This makes it easy to update the action to display a small amount of information about the state of the extension, such as a counter. The badge has a text component and a background color.
*/

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`toolbar.js`)
})

/**
 * Handle toolbar button display.
 * @class ToolbarButton
 */
class ToolbarButton {
  /**
   * Creates an instance of `ToolbarButton`.
   * @param [tabId=0] Id of the tab
   */
  constructor(tabId = 0) {
    this.id = tabId
    // note: the manifest.json=browser_action.default_title
    // key contains an initial title
    this.title = ``
  }
  disable() {
    if (this.id === 0) return
    chrome.action.setBadgeText({ text: `` })
    chrome.action.setTitle({
      title: `RetroTxt${this.title}`,
      tabId: this.id,
    })
    chrome.action.enable(this.id)
  }
  enable() {
    if (this.id === 0) return
    // alternative checkmark styles: ✓ ✔ 🗹 ✅
    const checkMark = `✓`
    chrome.action.setBadgeText({ text: `${checkMark}` })
    chrome.action.setTitle({
      title: `RetroTxt${this.title}`,
      tabId: this.id,
    })
    chrome.action.enable(this.id)
  }
}

/**
 * Changes the Extension icon in the toolbar of Chrome.
 * @param {*} darkMode Use the icon set intended for dark system themes
 */
function SetToolbarIcon(darkMode = false) {
  // Oct 2020: chrome.action.setIcon currently breaks.
  // Uncaught (in promise) TypeError: failureCallback is not a function
  //  at extensions::setIcon:35
  if (darkMode || !darkMode) return

  const os = () => {
    switch (BrowserOS()) {
      case Os.windows:
        return `Windows`
      case Os.macOS:
        return `macOS`
      case Os.linux:
        return `Linux/Unix`
      default:
        return `unknown`
    }
  }
  switch (darkMode) {
    case true:
      console.log(
        `Set the toolbar icon to match the ${os()} dark mode system theme.`
      )
      chrome.action.setIcon({
        path: {
          16: "assets/retrotxt_16-light.png",
          19: "assets/retrotxt_19-light.png",
          32: "assets/retrotxt_32-light.png",
          38: "assets/retrotxt_38-light.png",
          48: "assets/retrotxt_48-light.png",
          128: "assets/retrotxt_128-light.png",
        },
      })
      return
    default:
      console.log(
        `Set the toolbar icon to match the ${os()} light mode system theme.`
      )
      chrome.action.setIcon({
        path: {
          16: "assets/retrotxt_16.png",
          19: "assets/retrotxt_19.png",
          32: "assets/retrotxt_32.png",
          38: "assets/retrotxt_38.png",
          48: "assets/retrotxt_48.png",
          128: "assets/retrotxt_128.png",
        },
      })
  }
}
