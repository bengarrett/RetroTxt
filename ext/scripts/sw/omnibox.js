// File: scripts/sw/omnibox.js
//
// Browser address bar omnibox input to handle terminal like commands.
//
// NOTE: THIS IS CURRENTLY BROKEN IN MV3
// See the open issue: https://bugs.chromium.org/p/chromium/issues/detail?id=1186804

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`omnibox.js`)
})

/**
 * Handle browser address bar omnibox commands.
 * To trigger type `rt ` (rt space).
 * @class Omnibox
 */
class Omnibox {
  constructor() {
    this.keys = []
    const suggestions = new Map()
      .set(`version`, `RetroTxt version information`)
      .set(`fonts`, `RetroTxt font selections`)
      .set(`display`, `RetroTxt text, ansi and color display options`)
      .set(`settings`, `RetroTxt settings`)
      .set(`documentation`, `RetroTxt online documentation`)
      .set(`credits`, `RetroTxt credits`)
      .set(`samples`, `RetroTxt sample ANSI and ASCII artwork links`)
      .set(`useful`, `RetroTxt useful and related links`)
    this.suggestions = suggestions
    this._keys()
  }
  /**
   * Add event listeners for the omnibox.
   */
  async startup() {
    try {
      chrome.omnibox.setDefaultSuggestion({
        description: `RetroTxt commands: ${this.keys.join(`, `)}`,
      })
    } catch (e) {
      return CheckError(
        `RetroTxt failed to load the Omnibox due to a Chromium bug in Manifest V3.`,
        false
      )
    }
    chrome.omnibox.onInputChanged.addListener((text, addSuggestions) => {
      addSuggestions(this._getMatchingProperties(text))
    })
    chrome.omnibox.onInputEntered.addListener((text, disposition) => {
      if (disposition === `currentTab`) return OpenOptions(text)
    })
  }
  _getMatchingProperties(input) {
    const result = []
    for (const prompt of this.keys) {
      if (prompt.indexOf(input) === 0) {
        result.push({
          content: prompt,
          description: this.suggestions.get(prompt),
        })
        continue
      }
      if (result.length !== 0) return result
    }
    return result
  }
  _keys() {
    this.keys = []
    this.suggestions.forEach((value, key) => {
      this.keys.push(key)
    })
    chrome.management.getSelf((info) => {
      if (info.installType !== `development`) return
      this.suggestions
        .set(`tests`, `RetroTxt QUnit tests`)
        .set(`reload`, `RetroTxt Extension reload`)
      this.keys.push(`tests`, `reload`)
    })
  }
}

/*exported Omnibox */
/*global CheckError ConsoleLoad OpenOptions */
