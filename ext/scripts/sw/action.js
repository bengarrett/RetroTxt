// filename: sw/action.js
//
/*global CheckError CheckLastError Console ConsoleLoad Developer Extension SessionKey ToolbarButton*/

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`action.js`)
})

// browser action (tool bar button) click event
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
    this.id = tab.id
    this.info = tab
    this.state = false
    if (`url` in this.info)
      this.scheme = `${this.info.url.split(`:`)[0].toLowerCase()}`
    else this.info.url = `activeTab.Tab.url permission denied`
    if (!(`title` in this.info))
      this.info.title = `activeTab.Tab.title permission denied`
  }
  /**
   * Browser tab selected and activated.
   */
  activated() {
    if (this.id === ``) return console.warn(`action actived tab ID is empty.`)
    const key = `${SessionKey}${this.id}`
    chrome.storage.local.get(`${key}`, (store) => {
      if (Object.entries(store).length === 0)
        return Console(`Ignore tab ID ${this.id}: ${this.info.title}`)
      Console(`★ Activated tab ID ${this.id}: ${this.info.title}`)
      const button = new ToolbarButton(this.id),
        textfile = store[key].textfile
      this.state = false
      switch (textfile) {
        case true:
          this.state = true
          button.enable()
          return this._contextMenus()
        case false:
          this.state = false
          button.enable()
          return this._contextMenus()
        case null:
          // null is intended for incompatible tabs, but it can also catch a dead
          // state after the Extension is reloaded and all the tab event
          // listeners are removed
          button.disable()
          this.state = false
          return this._contextMenus()
        default:
          button.disable()
          this.state = false
          this._contextMenus()
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

    if (!(`url` in this.info) || this.info.url.length === 0)
      return console.warn(
        `RetroTxt could not determine the URL of the active tab #%s.`,
        this.id
      )

    if (DeveloperMode)
      console.log(`↩ Toolbar button click registered for tab #%s.`, this.id)

    chrome.tabs.sendMessage(this.id, { id: `invoked` }, () => {
      if (CheckLastError(`action click invoked send message`)) return
    })
  }
  /**
   * Update context menus to reflect a tab's suitability for RetroTxt.
   */
  _contextMenus() {
    const update = [`transcode`]
    for (const id of Object.values(update)) {
      chrome.contextMenus.update(id, { enabled: this.state })
    }
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
