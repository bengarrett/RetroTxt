// filename: omnibox.js
//

/*exported Omnibox */
/*global openOptions */

// NOTE: THIS IS CURRENTLY BROKEN IN MV3

/**
 * Handle browser address bar omnibox commands.
 * To trigger type `rt ` &nbsp; (rt space).
 * @class Omnibox
 */
class Omnibox {
  constructor() {
    this.keys = []
    const suggestions = new Map()
      .set(`version`, `RetroTxt version information.`)
      .set(`fonts`, `RetroTxt font selections`)
      .set(`display`, `RetroTxt text, ansi and color display options`)
      .set(`settings`, `RetroTxt settings`)
      .set(`documentation`, `RetroTxt online documentation`)
      .set(`credits`, `RetroTxt credits`)
      .set(`samples`, `RetroTxt sample ANSI and ASCII artwork links`)
      .set(`useful`, `RetroTxt useful and related links`)
    // .set(
    //   `wipe`,
    //   `Wipe all your RetroTxt configurations to reset to the defaults`
    // )
    this.suggestions = suggestions
    this._keys()
  }
  /**
   * Add event listeners for the omnibox.
   */
  async initialize() {
    chrome.omnibox.setDefaultSuggestion({
      description: `RetroTxt commands: ${this.keys.join(`, `)}`,
    })
    chrome.omnibox.onInputChanged.addListener((text, addSuggestions) => {
      addSuggestions(this._getMatchingProperties(text))
    })
    chrome.omnibox.onInputEntered.addListener((text, disposition) => {
      if (disposition === `currentTab`) return openOptions(text)
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
