// filename: sw/toolbar.js
//
/*global */

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
    // note: the manifest.json=browser_action.default_title key contains an
    // initial title
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
