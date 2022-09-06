// File: scripts/sw/action.js
//
// Toolbar button actions.

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`action.js`)
})

// Browser action (toolbar button) click event.
chrome.action.onClicked.addListener((tab) => {
  if (typeof qunit !== `undefined`) return
  new Action(tab).click()
})

/**
 * Handle toolbar button clicks and user tab selections.
 * @class Action
 */
class Action {
  /**
   * Creates an instance of Action.
   * @param [tab={}] Tab object
   */
  constructor(tab = {}) {
    this.scheme = ``
    this.tab = tab
    if (`url` in this.tab)
      this.scheme = `${this.tab.url.split(`:`)[0].toLowerCase()}`
    if (this.scheme === ``) this.tab.url = `Action.tab.url permission denied`
    if (!(`title` in this.tab))
      this.tab.title = `Action.tab.title permission denied`
  }
  /**
   * Browser tab selected and activated.
   */
  activated() {
    if (this.tab.id === ``)
      return console.warn(`Action.tab.id, the actived tab ID is empty.`)
    const key = `${SessionKey}${this.tab.id}`
    chrome.storage.local.get(key, (store) => {
      const button = new ToolbarButton(this.tab.id)
      if (Object.entries(store).length === 0) {
        button.disable()
        return Console(`Ignore tab ID ${this.tab.id}: ${this.tab.title}`)
      }
      const textfile = store[key].textfile
      Console(
        `★ Activated tab ID ${this.tab.id} (${textfile}): ${this.tab.title}`
      )
      switch (textfile) {
        case true:
          return button.enable()
        case false:
        case null:
          return button.disable()
        default:
          button.disable()
          return CheckError(
            `Could not run button.update() as the ${key}.textfile value '${textfile}' is not a boolean.`
          )
      }
    })
  }
  /**
   * Event sanity check after the toolbar button is clicked.
   */
  click() {
    if (this._validateScheme() === true) return this._clicked() // pass
    return // fail
  }
  /**
   * Event handler for the clicking of the toolbar button.
   */
  _clicked() {
    let DeveloperMode = false
    chrome.storage.local.get(Developer, (store) => {
      if (Developer in store) DeveloperMode = true
    })
    if (!(`url` in this.tab) || this.tab.url.length === 0)
      return console.warn(
        `RetroTxt could not determine the URL of the active tab #%s.`,
        this.tab.id
      )
    if (DeveloperMode)
      console.log(`↩ Toolbar button click registered for tab #%s.`, this.tab.id)
    const port = chrome.tabs.connect(this.tab.id, { name: `_clicked` })
    port.postMessage({ initTab: this.tab.id })
  }
  /**
   * Checks the URL scheme against a permitted list.
   * @returns boolean
   */
  _validateScheme() {
    const result = new Extension().defaults
      .get(`schemesPermitted`)
      .includes(this.scheme)
    return result
  }
}

/* global CheckError Console ConsoleLoad Developer Extension SessionKey ToolbarButton */
