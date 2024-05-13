// File: scripts/sw/omnibox.js
//
// Browser address bar omnibox input to handle terminal like commands.
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/omnibox
// https://developer.chrome.com/docs/extensions/reference/omnibox/

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`omnibox.js`)
})

/**
 * Handle browser address bar omnibox commands.
 * To trigger type `txt ` (txt space).
 * @class Omnibox
 */
// eslint-disable-next-line no-unused-vars
class Omnibox {
  constructor() {
    this.keys = []
    const suggestions = new Map()
      .set(`version`, `RetroTxt - version information`)
      .set(`fonts`, `RetroTxt - font selection`)
      .set(`display`, `RetroTxt - text, ANSI and color display options`)
      .set(`settings`, `RetroTxt - settings`)
      .set(`documentation`, `RetroTxt - read the online documentation`)
      .set(`credits`, `RetroTxt - credits`)
      .set(`samples`, `RetroTxt - sample ANSI and ASCII artworks`)
      .set(`useful`, `RetroTxt - useful and related links`)
    this.suggestions = suggestions
    this._keys()
  }
  /**
   * Add event listeners for the omnibox.
   */
  async startup() {
    try {
      // Defines the first suggestion that appears in the drop-down when the user enters the keyword for your extension, followed by a space.
      chrome.omnibox.setDefaultSuggestion({
        description: `RetroTxt commands: ${this.keys.join(`, `)}`,
      })
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      return CheckError(`RetroTxt failed to load the Omnibox.`, false)
    }
    // Fired whenever the user's input changes, after they have focused the address bar and typed your extension's omnibox keyword, followed by a space.
    chrome.omnibox.onInputChanged.addListener((text, suggest) => {
      Console(`⌨ Omnibox input: ${text}`)
      suggest(this._getMatchingProperties(text))
      // the ominbox does not display anything with extact matches
      // so instead this will auto-launch those matches
      const match = this.suggestions.get(text)
      if (typeof match === `undefined`) return
      if (match.length > 0) return OpenOptions(text)
    })
    // Fired when the user accepts one of your extension's suggestions.
    chrome.omnibox.onInputEntered.addListener((text, disposition) => {
      Console(`⌨ Entered in ${disposition}: ${text}`)
      if (disposition === `currentTab`) return OpenOptions(text)
    })
  }
  _getMatchingProperties(text) {
    const result = []
    for (const prompt of this.keys) {
      if (prompt.startsWith(text)) {
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

/*global CheckError Console ConsoleLoad OpenOptions */
