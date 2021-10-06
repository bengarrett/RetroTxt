// filename: sw/action.js
//
/*global CheckError CheckLastError Developer Extension Security Tab ToolbarButton*/

chrome.runtime.onInstalled.addListener(() => {
  if (typeof qunit !== `undefined`) return

  // TODO: replace session storage with local.store
  // simulate session by removing the two existing stores when oninstall

  console.log(`RetroTxt action service worker installed`)
})

// browser action (tool bar button) click event
chrome.action.onClicked.addListener((tab) => {
  new Action(tab.id, tab).browserAction()
})

/**
 * Handle toolbar button clicks and user tab selections.
 * @class Action
 */
class Action {
  /**
   * Creates an instance of Action.
   * @param [tabId=0] Id of the tab
   * @param [info={}] Tab object
   */
  constructor(tabId = 0, info = {}) {
    this.scheme = ``
    this.id = tabId
    this.info = info
    this.state = false
    if (`url` in this.info)
      this.scheme = `${this.info.url.split(`:`)[0].toLowerCase()}`
    else this.info.url = `tabs.Tab.url permission denied`
    if (!(`title` in this.info))
      this.info.title = `tabs.Tab.title permission denied`
  }
  /**
   * Browser tab selected and activated.
   */
  activated() {
    //const item = sessionStorage.getItem(`tab${this.id}textfile`)
    const item = ``
    chrome.storage.local.get(Developer, (store) => {
      if (Developer in store) {
        console.log(
          `↩ Activated tab #%s with a stored item = %s.\n%s\n%s`,
          this.id,
          item,
          this.info.url,
          this.info.title
        )
      }
    })
    const button = new ToolbarButton(this.id)
    button.enable()
    this.state = false
    switch (`${item}`) {
      case `true`:
        this.state = true
        return this._contextMenus()
      case `false`:
        this.state = false
        return this._contextMenus()
      case `null`:
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
          `Could not run button.update() as the sessionStorage tab#${this.id}textfile value '${item}' != Boolean.`
        )
    }
  }
  /**
   * Event sanity check after the toolbar button is clicked.
   */
  browserAction() {
    if (this._validateScheme() === true) return this._clicked() // pass
    return // fail
  }
  /**
   * Event handler for the clicking of the toolbar button.
   */
  _clicked() {
    if (!(`url` in this.info) || this.info.url.length === 0)
      return console.warn(
        `RetroTxt could not determine the URL of the active tab #%s.`,
        this.id
      )
    if (this.id === 0) return

    chrome.storage.local.get(Developer, (store) => {
      if (Developer in store)
        console.log(`↩ Toolbar button click registered for tab #%s.`, this.id)
    })
    // sessionStorage only saves strings
    const session = {
      state: sessionStorage.getItem(`tab${this.id}textfile`),
      type: sessionStorage.getItem(`tab${this.id}encoding`),
    }
    // determine if active tab is a text file and save the results to the
    // sessionStore to reduce any expensive, future HTTP HEAD requests
    if (typeof session.state !== `string`) {
      const security = new Security(`action`),
        test = security.test()
      chrome.permissions.contains(test, (containsResult) => {
        if (containsResult === false) {
          chrome.permissions.request(test, (requestResult) => {
            if (CheckLastError(`action clicked permission "${requestResult}"`))
              return
            if (requestResult === true) console.log(`Permission was granted`)
            else return console.log(`Permission was refused`)
          })
        }
        // check the tab and then refetch the session storage
        const scheme = this.info.url.split(`:`)[0]
        if (scheme === `file`) {
          const security = new Security(`files`)
          if (containsResult === false) {
            chrome.permissions.request(security.test(), (requestResult) => {
              if (CheckLastError(`files clicked permission "${requestResult}"`))
                return
              if (requestResult === true) console.log(`Permission was granted`)
              else return console.log(`Permission was refused`)
            })
          }
        }
        new Tab(this.id, this.info.url, this.info).compatibleURL()
        session.state = sessionStorage.getItem(`tab${this.id}textfile`)
      })
    }
    if (session.state === `true`) {
      chrome.storage.local.get(Developer, (store) => {
        if (Developer in store) {
          console.log(
            `RetroTxt has detected the active tab #%s is a text file encoded as %s.\n%s`,
            this.id,
            session.type,
            this.info.url
          )
        }
      })
      chrome.tabs.sendMessage(this.id, { id: `invoked` }, () => {
        if (CheckLastError(`action click invoked send message`)) return
      })
    }
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
