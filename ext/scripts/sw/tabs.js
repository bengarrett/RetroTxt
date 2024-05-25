// File: scripts/sw/tabs.js
//
// Monitors and handles the interactions with new and closed browser tabs.

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`tabs.js`)
})

// tabs.onActivated fires when the active tab in a window changes.
// Note that the URL may not be set at the time this event fires;
// but an onUpdated event can be used to notify when the URL is set.
chrome.tabs.onActivated.addListener((activeInfo) => {
  if (typeof activeInfo.tabId === `undefined`) return
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (
      typeof chrome.runtime.lastError === `object` &&
      chrome.runtime.lastError.message !== ``
    )
      console.log(chrome.runtime.lastError.message)
    if (typeof tab === `undefined`) return
    if (typeof tab.url === `undefined`) return
    Console(
      `️★ Tab ID ${tab.id} activated for window ${tab.windowId}: ${tab.url}`,
    )
  })
})

// tabs.onCreated fires when a tab is created.
// Note that the tab's URL and tab group membership may not be set at the time this event is fired,
// but you can listen to onUpdated events so as to be notified when a URL is set or the tab is added to a tab group.
chrome.tabs.onCreated.addListener((tab) => {
  const tabs = new Tabs()
  tabs.tabId = tab.id
  if (!(`url` in tab)) return tabs._permissionDenied(true, `created`)
  new Tab(tab.id, tab.url, tab).create()
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
  // The refreshedTab result maybe Chrome specific.
  //
  // Reloading a tab (F5 key) must not create a new set of tab event listeners,
  // as it breaks the Toolbar button which returns the error
  // 'Could not establish connection. Receiving end does not exist.'
  // See: https://github.com/bengarrett/RetroTxt/issues/155
  const refreshedTab =
    changeInfo.status === `loading` && typeof changeInfo.url === `undefined`
  if (refreshedTab) {
    return
  }
  // Create new event listerers for the newly loaded url.
  const tabs = new Tabs()
  tabs.tabId = tabId
  if (!(`url` in tabInfo)) {
    const consoleLog = Boolean(
      `status` in changeInfo && changeInfo.status === `complete`,
    )
    return tabs._permissionDenied(consoleLog, `updated`)
  }
  new Tab(tabId, tabInfo.url, changeInfo).update()
})

// tabs.onRemoved fires when a tab is closed.
chrome.tabs.onRemoved.addListener((tabId) => {
  new Tab(tabId).remove()
})

/**
 * Handle event listeners for browser tabs.
 * @class Tabs
 */
class Tabs {
  constructor() {
    this.tabId = 0
  }
  /**
   * Add event listeners for tabs.
   */
  async listen() {
    console.log(`Tabs.listen() should be removed`)
  }
  /**
   * Remove the all event listeners for tabs.
   */
  async remove() {
    chrome.tabs.onCreated.removeListener()
    chrome.tabs.onUpdated.removeListener()
    chrome.tabs.onRemoved.removeListener()
  }
  /**
   * API access permission has been denied by the browser.
   */
  _permissionDenied(consoleLog = false, listener = ``) {
    if (consoleLog !== true) return
    Console(
      `⚠ Permission denied, cannot read the URL of ${listener} tab #${this.tabId}.`,
    )
  }
}

/**
 * Handle events for an individual browser tab.
 * @class Tab
 */
class Tab {
  /**
   * Creates an instance of Tab.
   * @param [id=0] Id of the tab
   * @param [url=``] URL of the tab
   * @param [info={}] Tab object
   * @param [menuId=``] Id of the context menus to modify
   */
  constructor(id = 0, url = ``, info = {}, menuId = ``) {
    this.id = id
    this.info = info
    this.menuId = menuId
    this.url = url
  }
  /**
   * Checks to the URL's filename and then check the tab's content to make sure
   * it's compatible with RetroTxt.
   * Intended to be run in conjunction with `this._checkURL()`.
   */
  _compatibleURL() {
    console.log(`Tabs._compatibleURL() has been requested.`)
    const config = new Configuration()
    // fetch() method initialize object
    // https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch
    const fetchInit = { method: `GET`, cache: `default` }
    // tab object
    const tab = {
      menuId: this.menuId,
      tabid: this.id,
      url: this.url,
    }
    // URI object with a domain, a skip Boolean and scheme (https|file)
    const uri = {
      domain: this._hostname(),
      ignore: !config.validateFilename(this.url),
      scheme: this.url.split(`:`)[0],
    }
    Object.freeze(config, fetchInit, tab, uri)
    // check against the hard coded black list of domains & schemes to skip any
    // false positives or conflicts
    if (config.validateDomain(uri.domain))
      return console.warn(
        `RetroTxt conflicts with the domain %s so %s is ignored.`,
        uri.domain,
        this.url,
      )
    // note there is a `uri` object and `url` string
    switch (uri.scheme) {
      case `file`:
        if (this._ignoreDir()) return
        if (this._ignoreURL(uri.ignore)) return
        if (this._ignoreEdgecase()) return
        console.info(`Loading local file ${this.url}.`)
        new Extension().invokeOnTab(tab.tabid, `unknown`)
        return
      case `http`:
      case `https`:
        // use Fetch API to download tab
        return fetch(this.url, fetchInit)
          .then((response) => {
            if (response.ok) return response.blob()
            throw new Error()
          })
          .then((data) => {
            new Downloads().parseBlob(data, tab)
            chrome.storage.local.get(Developer, (store) => {
              if (Developer in store)
                console.log(`Fetch API data results.\n`, data)
            })
          })
          .catch((error) => {
            console.error(
              `Tabs.compatibleURL(${this.menuId}, ${this.url}, ${this.id}) failed: ${error}.`,
            )
          })
      default:
        Console(
          `Tab URL '${this.url}' is not known so ignoring onClick action.`,
        )
    }
  }
  create() {
    this.menuId = `onCreated`
    chrome.tabs.query({ status: `complete` }, () => {
      const validate = () => {
        const http = new Security(`http`, this.url)
        switch (`${this.info.status}`) {
          case `complete`:
            return chrome.permissions.contains(http.test(), (result) => {
              if (result === true) return this._checkURL()
            })
          case `loading`:
            // Chrome fix:
            // when a tab is not active & tab.status is stuck at loading
            if (this.url.startsWith(`file:///`) && !this.info.active) {
              return this._checkURL()
            }
        }
      }
      // handle http protocol
      return validate()
    })
  }
  remove() {
    Console(`🗙 Closed tab #${this.id}.`)
    RemoveSession(this.id)
  }
  update() {
    chrome.tabs.query(
      {
        active: true,
        lastFocusedWindow: true,
        status: `complete`,
      },
      () => {
        const key = `${SessionKey}${this.id}`
        chrome.storage.local.get(key, (result) => {
          if (result === null) return RemoveSession(this.id)
          if (Object.entries(result).length === 0) return RemoveSession(this.id)
          const updateCounts = result[key].update
          const maximum = 2
          if (updateCounts > maximum) return RemoveSession(this.id)
          result.update = updateCounts + 1
          chrome.storage.local.set({ [key]: result[key] })
        })
        // browser specific cases
        // IMPORTANT: if there are multiple instances of RetroTxt being invoked
        // within the same browser tab, then the logic in the code below is a
        // likely suspect!
        this.menuId = `onUpdated`
        if (this.info.status === `complete`) {
          // handle file protocol
          if (this.url.startsWith(`file:///`)) {
            this._checkURL()
            return
          }
          // handle http protocol
          this._checkURL()
        }
      },
    )
  }
  /**
   * Validates `this.url` and skips URL schemes and domains that are not
   * compatible with RetroTxt.
   */
  _checkURL() {
    const valid = this._validateURLSyntax()
    if (!valid)
      return console.info(
        `RetroTxt has skipped tab #%s as it points to an incompatible URL.\n%s`,
        this.id,
        this.url,
      )
    // get and parse the URL
    const uri = {
      domain: this._hostname(),
      scheme: this.url.split(`:`)[0],
    }
    // Option `Run RetroTxt on files hosted on these domains`
    let domains = ``,
      approved = false
    chrome.storage.local.get(`settingsWebsiteDomains`, (result) => {
      domains = `${result.settingsWebsiteDomains}`
      if (domains.length === 0) {
        console.info(
          `RetroTxt is not permitted to run on any websites other than retrotxt.com`,
        )
      }
      // insert the RetroTxt URL into the approved list
      domains = `https://retrotxt.com;${domains}`
      // list of approved website domains
      approved = domains.includes(uri.domain)
      // if the URL domain is not apart of the user approved list then RetroTxt is
      // aborted for the tab
      if (uri.scheme !== `file` && approved !== true) return
      // if the URL domain is apart of the user approved list then we then test
      // the filename or body content
      this._compatibleURL()
    })
  }
  /**
   * Returns a URL without any sub-domains, ports or schemes.
   * For example `https://www.example.com:9000` will return `example.com`.
   */
  _hostname() {
    if (this.url === ``) return ``
    let url
    try {
      const u = new URL(`${this.url}`)
      url = u.hostname
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      url = this.url
    }
    let host = url.split(`/`)[2]
    if (typeof host === `undefined`) host = url
    const parts = host.split(`.`)
    if (parts.length <= 2) return host
    // drop the sub-domain
    parts.shift()
    // convert the array back to a string
    return parts.join(`.`)
  }
  _ignoreDir() {
    const directory = `/`
    if (this.url.substring(this.url.length - 1) === directory) {
      Console(`Directory detected so ignoring tab #${this.id}.\n${this.url}`)
      return true
    }
    return false
  }
  _ignoreURL(ignore = false) {
    // compare the filename extension to the ignore list
    if (ignore === true) {
      Console(
        `Invalid filename extension detected so ignoring tab #${this.id}.\n${this.url}`,
      )
      return true
    }
    return false
  }
  _ignoreEdgecase() {
    if (WebBrowser() === Os.firefox) {
      // look for filenames with extensions
      const path = this.url.split(`/`).slice(-1)
      // otherwise assume it's a directory
      if (path.toString().indexOf(`.`) < 0) {
        chrome.storage.local.get(Developer, (store) => {
          // compare the filename extension to the ignore list
          if (Developer in store)
            console.log(
              `Directory detected so ignoring tab #%s.\n%s`,
              this.id,
              this.url,
            )
        })
        return true
      }
      return false
    }
  }
  /**
   * API permission access has been denied by the browser.
   * @param [result={}] Permission test object that was denied
   */
  _permissionDenied(result = {}) {
    chrome.storage.local.get(Developer, (store) => {
      // compare the filename extension to the ignore list
      if (Developer in store)
        console.trace(
          `⚠ Permission denied for the following request.\n`,
          result,
        )
    })
  }
  /**
   * Checks the URL compatibility with RetroTxt.
   * @returns boolean
   */
  _validateURLSyntax() {
    if (this.url.length < 1) return false
    if (this.url.startsWith(`https://`)) return true
    if (this.url.startsWith(`http://`)) return true
    if (this.url.startsWith(`file:///`)) return true
    return false
  }
}

/* global Console Developer ConsoleLoad Configuration Security Extension Downloads Os
RemoveSession SessionKey WebBrowser */
