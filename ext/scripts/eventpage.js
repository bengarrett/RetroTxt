// filename: eventpage.js
//
// The Extension background page.
//
// It is run by the browser onload, by RetroTxt's onload or a refresh.
//
/*global CheckLastError Chrome Firefox Windows MacOS Linux
Windows_1252_English ISO8859_5 OutputCP1252 OutputISO8859_15 OutputUS_ASCII UseCharSet*/
/*exported RetroTxt CheckError LocalStore*/
"use strict"

// Globals set here are not shared with browser tabs
// RetroTxt developer verbose feedback (this is dynamically set)
// NOTE: Always set RetroTxt.developer to false before public release!
var RetroTxt = { developer: false }

/**
 * Error handler for this `scripts/eventpage.js`.
 * @param [error=``] Error feedback
 * @param [log=false] Log errors `false` are logged to the browser Console
 * otherwise a JavaScript exception is thrown
 */
function CheckError(error = ``, log = false) {
  const debug = false
  if (error !== undefined) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] === undefined) return
      chrome.tabs.sendMessage(
        tabs[0].id,
        { error: error, id: `CheckError` },
        (result) => {
          if (CheckLastError(`check error send message`)) return
          if (debug && result !== undefined) console.log(result)
        }
      )
    })
    if (log !== true) {
      if (RetroTxt.developer === true) return console.trace(error)
      return console.log(error)
    }
    try {
      throw new Error(error)
    } catch (result) {
      console.error(result)
    }
  }
}

function openOptions(page = ``) {
  const key = `optionTab`
  switch (page) {
    case `v`:
    case `ver`:
    case `version`:
      localStorage.setItem(key, `0`)
      break
    case `c`:
    case `credits`:
      localStorage.setItem(key, `1`)
      break
    case `samp`:
    case `samples`:
      localStorage.setItem(key, `2`)
      break
    case `u`:
    case `useful`:
      localStorage.setItem(key, `3`)
      break
    case `f`:
    case `fonts`:
      localStorage.setItem(key, `4`)
      break
    case `d`:
    case `display`:
      localStorage.setItem(key, `5`)
      break
    case `s`:
    case `settings`:
      localStorage.setItem(key, `6`)
      break
    case `doc`:
    case `help`:
    case `documentation`:
      localStorage.setItem(key, `7`)
      break
    case `reload`:
      chrome.management.getSelf((info) => {
        if (info.installType !== `development`) return
        return chrome.runtime.reload()
      })
      return chrome.runtime.reload()
    case `tests`:
    case `unit`:
    case `unittests`:
      chrome.management.getSelf((info) => {
        if (info.installType !== `development`) return
        localStorage.setItem(`optionTab`, `99`)
      })
      break
    case `wipe`:
      new LocalStore().wipe()
      return chrome.runtime.reload()
    default:
      return
  }
  return chrome.runtime.openOptionsPage(() => {
    if (CheckLastError(`open options page "${page}"`)) return
  })
}

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
    chrome.tabs.onCreated.addListener((tab) => {
      this.tabId = tab.id
      if (!(`url` in tab)) return this._permissionDenied(true, `created`)
      new Tab(tab.id, tab.url, tab).create()
    })
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
      this.tabId = tabId
      if (!(`url` in tabInfo)) {
        const consoleLog =
          `status` in changeInfo && changeInfo.status === `complete`
            ? true
            : false
        return this._permissionDenied(consoleLog, `updated`)
      }
      // don't run the update when the tab isn't 'active'
      if (tabInfo.active) new Tab(tabId, tabInfo.url, changeInfo).update()
    })
    chrome.tabs.onRemoved.addListener((tabId) => {
      new Tab(tabId).remove()
    })
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
    if (RetroTxt.developer)
      console.log(
        `⚠ Permission denied, cannot read the URL of %s tab #${this.tabId}.`,
        listener
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
  compatibleURL() {
    console.log(`Tabs.compatibleURL() has been requested.`)
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
    // check against the hard coded black list of domains & schemes to skip any
    // false positives or conflicts
    if (config.validateDomain(uri.domain))
      return console.warn(
        `RetroTxt conflicts with the domain %s so %s is ignored.`,
        uri.domain,
        this.url
      )
    const files = new Security(`files`)
    switch (uri.scheme) {
      // note there is a `URI` object and `URL` string
      case `file`:
        if (this._ignoreDir()) return
        if (this._ignoreURL(uri.ignore)) return
        if (this._ignoreEdgecase()) return
        console.info(`Loading local file ${this.url}.`)
        return chrome.permissions.contains(files.test(), (result) => {
          result === true
            ? new Extension().activateTab(null, tab)
            : files.fail()
        })
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
            if (RetroTxt.developer)
              console.log(`Fetch API data results.\n`, data)
          })
          .catch((error) => {
            console.error(
              `Tabs.compatibleURL(${this.menuId}, ${this.url}, ${this.id}) failed: ${error}.`
            )
          })
      default:
        if (RetroTxt.developer)
          console.log(
            `Tab URL '%s' is not known so ignoring onClick action.`,
            this.url
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
              const test = new Security(`files`).test()
              chrome.permissions.contains(test, (result) => {
                if (result === true) return this._checkURL()
                this._permissionDenied(test)
              })
            }
        }
      }
      // handle file protocol
      if (this.url.startsWith(`file:///`)) {
        const test = new Security(`files`).test()
        return chrome.permissions.contains(test, (result) => {
          result === true ? validate() : this._permissionDenied(test)
        })
      }
      // handle http protocol
      return validate()
    })
  }
  remove() {
    if (RetroTxt.developer) console.log(`🗙 Closed tab #${this.id}.`)
    const keys = Object.keys(sessionStorage)
    for (const key of keys) {
      if (key.includes(`tab${this.id}`)) sessionStorage.removeItem(key)
    }
  }
  update() {
    chrome.tabs.query(
      {
        active: true,
        lastFocusedWindow: true,
        status: `complete`,
      },
      () => {
        // `sessionStorage` clean up
        const updateCount = sessionStorage.getItem(`tab${this.id}update`)
        if (updateCount === null)
          sessionStorage.setItem(`tab${this.id}update`, 1)
        else
          sessionStorage.setItem(
            `tab${this.id}update`,
            parseInt(updateCount) + 1
          )
        if (updateCount >= 3) {
          sessionStorage.removeItem(`tab${this.id}encoding`)
          sessionStorage.removeItem(`tab${this.id}textfile`)
          sessionStorage.removeItem(`tab${this.id}update`)
        }
        // browser specific cases
        // IMPORTANT: if there are multiple instances of RetroTxt being invoked
        // within the same browser tab, then the logic in the code below is a
        // likely suspect!
        this.menuId = `onUpdated`
        if (this.info.status === `complete`) {
          // handle file protocol
          if (this.url.startsWith(`file:///`)) {
            const test = new Security(`files`).test()
            return chrome.permissions.contains(test, (result) => {
              result === true ? this._checkURL() : this._permissionDenied(test)
            })
          }
          // handle http protocol
          const test = new Security(`http`, this.url).test()
          chrome.permissions.contains(test, (result) => {
            result === true ? this._checkURL() : this._permissionDenied(test)
          })
        }
      }
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
        this.url
      )
    // get and parse the URL
    const uri = {
      domain: this._hostname(),
      scheme: this.url.split(`:`)[0],
    }
    // Option `Run RetroTxt on files hosted on these domains`
    let domains = `${localStorage.getItem(`settingsWebsiteDomains`)}`,
      approved = false
    if (domains.length === 0) {
      chrome.storage.local.get(`settingsWebsiteDomains`, (result) => {
        const value = `${result.settingsWebsiteDomains}`
        if (value.length < 1) {
          new LocalStore().scan()
          return CheckError(
            `Could not obtain the required settingsWebsiteDomains setting requested by eventUrl().`,
            false
          )
        }
        localStorage.setItem(`settingsWebsiteDomains`, value)
      })
      domains = `${localStorage.getItem(`settingsWebsiteDomains`)}`
      if (domains.length === 0) {
        // redundancy in case localStorage doesn't work
        domains = new Extension().defaults.get(`settingsWebsiteDomains`)
      }
    }
    // insert the RetroTxt URL into the approved list
    // see `_locales/en_US/messages.json` URL for the http address
    domains = `${chrome.i18n.getMessage(`url`)};${domains}`
    // list of approved website domains
    approved = domains.includes(uri.domain)
    // if the URL domain is not apart of the user approved list then RetroTxt is
    // aborted for the tab
    if (uri.scheme !== `file` && approved !== true) return
    // if the URL domain is apart of the user approved list then we then test
    // the filename or body content
    this.compatibleURL()
  }
  /**
   * Returns a URL without any sub-domains, ports or schemes.
   * For example `https://www.example.com:9000` will return `example.com`.
   */
  _hostname() {
    if (this.url === ``) return ``
    var url = ``
    try {
      const u = new URL(`${this.url}`)
      url = u.hostname
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
      if (RetroTxt.developer)
        console.log(
          `Directory detected so ignoring tab #%s.\n%s`,
          this.id,
          this.url
        )
      return true
    }
    return false
  }
  _ignoreURL(ignore = false) {
    // compare the filename extension to the ignore list
    if (ignore === true) {
      if (RetroTxt.developer)
        // compare the filename extension to the ignore list
        console.log(
          `Invalid filename extension detected so ignoring tab #%s.\n%s`,
          this.id,
          this.url
        )
      return true
    }
    return false
  }
  _ignoreEdgecase() {
    if (WebBrowser() === Firefox) {
      // look for filenames with extensions
      const path = this.url.split(`/`).slice(-1)
      // otherwise assume it's a directory
      if (path.toString().indexOf(`.`) < 0) {
        if (RetroTxt.developer)
          console.log(
            `Directory detected so ignoring tab #%s.\n%s`,
            this.id,
            this.url
          )
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
    if (RetroTxt.developer)
      console.trace(`⚠ Permission denied for the following request\n`, result)
  }
  /**
   * Checks the URL compatibility with RetroTxt.
   * @returns boolean
   */
  _validateURLSyntax() {
    if (this.url.length < 1) return false
    // NOTE: There is a strange bug in Firefox that is not replicable,
    // that tries to parse about:blank but results in a permission denied loop.
    if (this.url.startsWith(`https://`)) return true
    if (this.url.startsWith(`http://`)) return true
    if (this.url.startsWith(`file:///`)) return true
    return false
  }
}

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
    chrome.browserAction.setBadgeText({ text: `` })
    chrome.browserAction.setTitle({
      title: `RetroTxt${this.title}`,
      tabId: this.id,
    })
    chrome.browserAction.enable(this.id)
  }
  enable() {
    if (this.id === 0) return
    // alternative checkmark styles: ✓ ✔ 🗹 ✅
    const checkMark = `✓`
    chrome.browserAction.setBadgeText({ text: `${checkMark}` })
    chrome.browserAction.setTitle({
      title: `RetroTxt${this.title}`,
      tabId: this.id,
    })
    chrome.browserAction.enable(this.id)
  }
}

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
    const item = sessionStorage.getItem(`tab${this.id}textfile`)
    if (RetroTxt.developer)
      console.log(
        `↩ Activated tab #%s with a stored item = %s.\n%s\n%s`,
        this.id,
        item,
        this.info.url,
        this.info.title
      )
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
    if (RetroTxt.developer)
      console.log(`↩ Toolbar button click registered for tab #%s.`, this.id)
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
      if (RetroTxt.developer)
        console.log(
          `RetroTxt has detected the active tab #%s is a text file encoded as %s.\n%s`,
          this.id,
          session.type,
          this.info.url
        )
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

/**
 * Extension permissions interface.
 * @class Security
 */
class Security {
  /**
   * Creates an instance of Security.
   * @param [type=``] Permission type to handle `action`, `downloads`, `files` or `http`
   * @param [origin=``] An optional URL or URI
   */
  constructor(type = ``, origin = ``) {
    // IMPORTANT!
    // These Map values must match those in the `scripts/options.js` Security class.
    // Firefox REQUIRES tabs permission to access URL in the queryInfo
    // parameter to tabs.query().
    const permissions = new Map()
      .set(`action`, [`tabs`])
      .set(`downloads`, [`downloads`, `downloads.open`, `tabs`])
      .set(`files`, [`tabs`])
      // http must be `activeTab` instead of `tabs`, otherwise URLs listed
      // in `permissions` will not toggle
      .set(`http`, [`activeTab`])
    const origins = new Map()
      .set(`action`, [])
      .set(`downloads`, [`file:///*/`])
      .set(`files`, [`file:///*/`])
      .set(`http`, this._httpToOrigins())
    if (typeof type === `undefined`)
      return CheckError(
        `⚿ Security('${type}') is invalid, it must be either: ${Array.from(
          permissions.keys()
        )}.`
      )
    this.permissions = permissions.get(`${type}`)
    this.origins = origins.get(`${type}`)
    this.origin = origin
    this.type = type
  }
  /**
   * API access permission has been denied by the browser.
   */
  fail() {
    console.warn(
      `⚠ Extension permission access '${this.permissions}' is denied for %s.`,
      this.type
    )
  }
  /**
   * Creates a collection of permissions for use with the permissions methods.
   * @returns `permissions.Permissions` object
   */
  test() {
    if (RetroTxt.developer)
      console.trace(`⚿ Security test request for '${this.type}'.`)
    if (this.type === `http`) this.origins = this._httpToOrigins()
    const permissionsToRequest = {
      permissions: this.permissions,
      origins: this.origins,
    }
    return permissionsToRequest
  }
  /**
   * Converts a URL supplied by `this.origin` into a collection of host permissions.
   * @returns Array containing host permissions
   */
  _httpToOrigins() {
    if (typeof this.origin === `undefined`) return this.origins
    if (this.origin.length < 1) return this.origins
    // parse URL to valid host
    const url = new URL(this.origin)
    return [`*://${url.hostname}/*`]
  }
}

/**
 * Extension local storage interface.
 * @class LocalStore
 */
class LocalStore {
  /**
   * There are 4 types of browser storage that is accessible to RetroTxt.
   * `sessionStorage` is temporary & is cleared whenever the browser is closed.
   * `localStorage` is persistent & offers immediate access but is not able to
   * be accessed by all parts of RetroTxt.
   * `chrome.Storage.local` is persistent and much slower than localStorage, but
   * can be accessed by all parts of RetroTxt.
   * `chrome.Storage.sync` allows cloud saving & syncing storage but is
   * currently not implemented by RetroTxt and support varies by browser.
   */
  constructor() {
    this.defaults = new Extension().defaults
    this.redundant = new Set().add(`runFileDownloads`).add(`runFileUrls`)
    // NOTE: The following MUST be disabled in production as it erases all the
    // storage objects whenever the Extension is reloaded
    this.storageReset = false
    this.redundantTest = false
    this.importV3Test = false
    const v3Imports = new Map()
      // display tab
      .set(`lineHeight`, `normal`)
      .set(`textSmearBlocks`, `true`)
      .set(`textBgScanlines`, `true`)
      .set(`textBlinkAnimation`, `false`)
      .set(`textCenterAlignment`, `false`)
      .set(`textDosCtrlCodes`, `true`)
      .set(`textEffect`, `shadowed`)
      .set(`textAnsiWrap80c`, `false`)
      .set(`textAnsiIceColors`, `false`)
      .set(`retroColor`, `theme-c64`)
      .set(`customForeground`, `#ff0000`)
      .set(`customBackground`, `blue`)
      .set(`colorPalette`, `gray`)
      // settings tab
      //.set(`runWebUrls`, `true`)
      .set(`runWebUrlsPermitted`, `example.com;example.org;example.net`)
      .set(`textFontInformation`, `false`)
      .set(`updatedNotice`, `false`)
    this.v3Imports = v3Imports
  }
  /**
   * Cleans up and validates RetroTxt storage requirements.
   * Intended for use when RetroTxt is loaded.
   */
  initialize() {
    if (this.storageReset) {
      this.wipe()
      this.clean()
    } else if (this.redundantTest)
      chrome.storage.local.set({ runFileDownloads: true })
    sessionStorage.clear()
    this.scan()
    if (this.importV3Test) {
      this.v3Imports.forEach((value, v3key) => {
        chrome.storage.local.set({ [v3key]: value })
        localStorage.setItem(`${v3key}`, `${value}`)
        console.log(`Set RetroTxt v3 localStorage item ${v3key}=${value}`)
      })
    }
  }
  /**
   * Removes legacy storage local items that may have been configured by
   * earlier editions of RetroTxt.
   */
  clean() {
    this.redundant.forEach((key) => {
      chrome.storage.local.remove(`${key}`)
    })
  }
  /**
   * Outputs any chrome.storage changes to the background page console.
   * @param changes Object describing the change
   * @param areaName Name of the storage area where changes were made
   */
  event(changes, areaName) {
    for (const item of Object.keys(changes)) {
      // newValue must be a string otherwise context menu errors will occur
      const oldValue = changes[item].oldValue,
        newValue = `${changes[item].newValue}`
      if (RetroTxt.developer)
        console.log(
          `🖫 RetroTxt %sStorage %s change: %s 🡒 %s (%s).`,
          areaName,
          item,
          oldValue,
          newValue,
          typeof newValue
        )
      if (`${oldValue}` === `undefined`) return
    }
  }
  /**
   * Iterates through the `this.defaults` Map and looks for matching keys in
   * `chrome.Storage.local`. If a matching key in Storage is found then the
   * `pass()` function is called otherwise `fail()` is used.
   */
  scan() {
    this.defaults.forEach((value, key) => {
      chrome.storage.local.get(`${key}`, (data) => {
        key in data ? this._pass(key, Object.values(data)[0]) : this._fail(key)
      })
    })
  }
  /**
   * Erases local, session & Extension storage items that were created by RetroTxt.
   */
  wipe() {
    localStorage.clear()
    sessionStorage.clear()
    chrome.storage.local.clear(() => {
      console.log(
        `🖫 Deleted RetroTxt localStorage, sessionStorage and chrome.storage.local settings.`
      )
    })
  }
  /**
   * Scan success callback that looks for an identical localStorage pair.
   * If a matching localStorage item is not found then it is set here.
   * @param [key=``] storage.local key
   * @param [value=``] storage.local value
   */
  _pass(key = ``, value = ``) {
    const local = localStorage.getItem(`${key}`)
    if (local === null) localStorage.setItem(`${key}`, `${value}`)
  }
  /**
   * A scan failed callback that saves the `this.defaults` value to the storage
   * area and then updates the context menus.
   * @param [key=``] storage.local key
   */
  _fail(key = ``) {
    const value = this.defaults.get(`${key}`)
    // convert the array object to a ; separated string
    if (key === `settingsWebsiteDomains`) {
      const valuesJoined = value.join(`;`)
      chrome.storage.local.set({ [key]: valuesJoined })
      return this._pass(key, valuesJoined)
    }
    // colorsTextPairs `this.defaults` are missing an expected `theme-` prefix
    if (key === `colorsTextPairs` && !value.startsWith(`theme-`)) {
      const newValue = `theme-${value}`
      chrome.storage.local.set({ [key]: newValue })
      return this._pass(key, newValue)
    }
    // otherwise save the value as a string
    chrome.storage.local.set({ [key]: value })
    this._pass(key, value)
  }
}

/**
 * Apply RetroTxt to any downloaded text files.
 * @class Downloads
 */
class Downloads {
  /*
FIREFOX NOTES:
  Firefox supports the API functionality needed to implement this feature,
  except it still fails due to a security design choice at Mozilla.
  1. `file:///` access is a requirement to view any downloads in the browser.
  2. Firefox refuses to open privileged URLs such as `file:///` without a user
  input handler, such as a button click.
  3. Such access is initially granted but is lost by the time
  chrome.tabs.create({ active: false, url: url }) is run at the end of this._update().
  4. Instead, one of the following errors will return:
  ↳ "Error: downloads.open may only be called from a user input handler"
  ↳ "Error: Illegal URL"
CHROME NOTES:
  Chrome is aggressive with its sanity checks and will refuse to open any file in
  a tab that it deems a binary or a dangerous file. A text file with control codes
  may be forcefully closed by the browser, even if the host server's HTTP information
  declares it's text.
*/
  /**
   * Creates an instance of Downloads.
   * @param [monitor=true] Monitor downloads `true` or `false` to ignore
   */
  constructor(monitor = true) {
    this.delta
    this.item
    this.monitor = monitor
  }
  /**
   * Monitor file downloads.
   */
  async listen() {
    if (WebBrowser() === Firefox) return
    // exit when chrome.downloads is inaccessible due Extensions configurations
    if (`downloads` in chrome === false)
      return console.log(`chrome.downloads API is inaccessible`)
    if (`onCreated` in chrome.downloads === false)
      return console.log(`chrome.downloads API onCreated event is inaccessible`)
    const downloads = new Downloads(),
      security = new Security(`downloads`, `downloads`),
      test = security.test()
    switch (this.monitor) {
      case true:
        chrome.downloads.onCreated.addListener((item) => {
          if (CheckLastError(`on created downloads`)) return
          downloads.item = item
          // security check blocks `downloads.create()`
          // otherwise any Options changes will require an Extension reload
          chrome.permissions.contains(test, (result) => {
            if (result !== true) {
              if (RetroTxt.developer) security.fail()
              return // abort
            }
            downloads._create()
          })
        })
        chrome.downloads.onChanged.addListener((delta) => {
          if (CheckLastError(`on changed downloads`)) return
          downloads.delta = delta
          // a fix for the endless loop issue, where Chrome incorrectly
          // identifies a text file as a binary (application/octet-stream)
          // and forces the file to download instead of render in a tab
          if (!(`item` in downloads)) return
          if (!(`mime` in downloads.item)) return
          // catch all mime types that use binary types such as
          // `application/octet-stream`, `application/x-font`
          const type = downloads.item.mime.split(`/`)
          if (type[0] === `application`) {
            if (
              `state` in downloads.delta &&
              downloads.delta.state.current === `complete`
            ) {
              const config = new Configuration(),
                textFile = config.validateFileExtension(downloads.item.finalUrl)
              if (textFile === true)
                console.warn(
                  `Downloaded filename looks to be a text file but the host server says it's a binary file: `,
                  downloads.item.finalUrl
                )
            }
            return
          }
          downloads._update()
        })
        break
      case false:
        chrome.downloads.onCreated.removeListener(this._create)
        chrome.downloads.onChanged.removeListener(this._update)
        break
    }
  }
  /**
   * Determines if the data blob is a text file.
   * @param [data] Fetch API data blob
   * @param [tab={}] Tab object
   */
  parseBlob(data, tab = {}, test = false) {
    // Blob object API: https://developer.mozilla.org/en-US/docs/Web/API/Blob
    // mime type split (text/plain)
    const split = data.type.split(`/`, 2)
    // if `data.type.split` is empty, then the browser couldn't work out the MIME
    // type. it is assumed to be a text file, as the browser didn't attempt to
    // download or render
    const format = split[0] || `text`
    let subType = ``
    if (split[0] === ``) {
      console.log(`Tab #%s Blob MIME type is unknown.`, tab.tabid)
      subType = `unknown`
    }
    // sub-type split, ie `plain;charset=iso-8859-1`
    else subType = split[1].split(`;`, 1)[0]
    // data
    const reader = new FileReader()
    switch (format) {
      case `text`: {
        switch (subType) {
          case `plain`:
          case `x-nfo`:
          case `unknown`: {
            // check to make sure `text/plain` is not HTML, XML or other markup
            reader.onload = (loadedEvent) => {
              const text = loadedEvent.target.result.trim()
              // if the body starts with <! or <? then it is most likely markup
              const markUpCheck = [`<!`, `<?`].includes(text.substring(0, 2))
              if (test === true) return markUpCheck
              if (markUpCheck === false) {
                if (RetroTxt.developer)
                  console.log(
                    `Retrotxt activated on tab #%s.\n%s`,
                    tab.tabid,
                    tab.url
                  )
                new Extension().activateTab(data, tab)
              }
            }
            if (test === false) return reader.readAsText(data.slice(0, 2))
          }
        }
      }
    }
    if (test === true) return false
    if (RetroTxt.developer)
      console.log(
        `Skipped Retrotxt execution on tab #%s.\n%s`,
        tab.tabid,
        tab.url
      )
    // if tab is not holding a text file
    return
  }
  /**
   * Initialise the new file download so RetroTxt can monitor the download state.
   */
  _create() {
    // sanity checks
    const valid = () => {
      if (!(`id` in this.item)) return false
      const error = `Create download #${this.item.id} cannot be monitored as the`
      if (!(`url` in this.item)) return false
      if (!(`filename` in this.item)) {
        console.log(`${error} filename is missing.\n(${this.item.url})`)
        return false
      }
      // note: some browsers and sites leave the filename as an property empty
      // so as an alternative monitor method, the sessionStorage may ALSO be set in this.update()
      if (this.item.filename.length < 1) {
        console.log(
          `${error} filename cannot be determined\n(${this.item.url})`
        )
        return false
      }
      if (this.item.url.length < 11) {
        console.log(`${error} URL is invalid\n(${this.item.url})`)
        return false
      }
      return true
    }
    if (valid() === false) return
    // only monitor HTTP downloads
    const config = new Configuration(),
      schemes = [`http`, `https`],
      scheme = this.item.url.split(`:`)[0]
    if (schemes.includes(scheme) === false) return
    // check filename extension isn't an obvious non-text file
    if (!config.validateFilename(this.item.filename)) return
    // location of saved local file
    sessionStorage.setItem(
      `download${this.item.id}-localpath`,
      `${this.item.filename}`
    )
  }
  _setFilename() {
    if (!(`filename` in this.delta)) return false
    if (!(`current` in this.delta.filename)) return false
    const filename = this.delta.filename.current
    if (filename.length < 1) return false
    const valid = new Configuration().validateFilename(filename)
    console.log(
      `Update download #${this.delta.id} determined the filename of the download.\n"${filename}", and ${valid}, it is a text based file.`
    )
    if (!valid) return false
    sessionStorage.setItem(`download${this.delta.id}-localpath`, `${filename}`)
    return true
  }
  /**
   * Handle changes to the download state including aborts and completed downloads.
   * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/onChanged
   * @param [data={}] Download item properties and status of changes
   */
  _update() {
    // sanity checks
    const valid = () => {
      if (!(`id` in this.delta)) return
    }
    if (valid() === false) return
    this._setFilename()
    const itemName = `download${this.delta.id}-localpath`,
      item = sessionStorage.getItem(itemName)
    if (item === null) return
    // handle all errors including cancelled downloads
    if (`error` in this.delta && `current` in this.delta.error)
      return sessionStorage.removeItem(itemName)
    // completed downloads
    if (`state` in this.delta && `current` in this.delta.state) {
      if (this.delta.state.current === `complete`) {
        sessionStorage.removeItem(itemName)
        // Windows friendly path conversion
        const path = item.replace(/\\/g, `/`),
          url = `file:///${path}`
        // note: see notes in class Downloads on why this may fail
        chrome.tabs.create({ active: false, url: url })
      }
    }
  }
}

/**
 * Extension initialisation, defaults and activation.
 * @class Extension
 */
class Extension {
  constructor() {
    // import from `functions.js`
    this.defaults = new OptionsReset().options
  }
  /**
   * Initialise RetroTxt after it is first installed or updated.
   * @param details
   */
  initialize(details) {
    console.log(`Reticulating splines.`)
    // dark mode icons for Chrome
    // in firefox, dark icons are handled by the manifest.json
    if (WebBrowser() === Chrome) {
      // this isn't reliable in Linux
      const pcs = matchMedia(`(prefers-color-scheme: dark)`)
      if (pcs.matches) this.setToolbarIcon(true)
      pcs.addEventListener(`change`, this.setToolbarIcon(pcs.matches))
    }
    const storage = new LocalStore()
    storage.initialize()
    const checks = [`settingsNewUpdateNotice`]
    //details.reason = `update`
    switch (details.reason) {
      case `install`:
        localStorage.setItem(`optionTab`, `0`)
        return chrome.tabs.create({
          url: chrome.extension.getURL(`html/options.html#newinstall`),
        })
      case `update`:
        // push redundant items into checks array for `storage.local.get()`
        // storage.redundant.forEach((key) => {
        //   checks.push(`${key}`)
        // })
        return chrome.storage.local.get(checks, (results) => {
          results: for (const result of Object.keys(results)) {
            if (result === `updatedNotice`) continue results // legacy
            if (result === `settingsNewUpdateNotice`) continue results
            // if any of the redundant checks are set to true, then show the
            // option page
            if (results[result] === true) {
              localStorage.setItem(`optionTab`, `0`)
              chrome.tabs.create({
                url: chrome.extension.getURL(`html/options.html`),
              })
              return storage.clean()
            }
          }
          const notice = results.settingsNewUpdateNotice
          if (notice === false) return
          // do not show updated notice
          else
            chrome.tabs.create({
              url: chrome.extension.getURL(`html/options.html#update`),
            })
        })
      case `browser_update`:
      case `shared_module_update`:
        return
    }
  }
  /**
   * Activates and prepares browser tab to invoke RetroTxt.
   * @param [data] Optional fetch API data blob
   * @param [tab={}] Tab object
   */
  activateTab(data, tab = {}) {
    if (data === null || !(`type` in data)) data = { type: `unknown` }
    // is the tab hosting a text file and what is the tab page encoding?
    sessionStorage.setItem(`tab${tab.tabid}textfile`, true)
    sessionStorage.setItem(`tab${tab.tabid}encoding`, data.type)
    sessionStorage.removeItem(`tab${tab.tabid}update`)
    // update the browser tab interface
    new ToolbarButton(tab.tabid).enable()
    new Menu().enableTranscode()
    // if the tab has previously been flagged as 'do not autorun' then finish up
    if (sessionStorage.getItem(`tab${tab.tabid}execute`) === `false`) return
    // otherwise execute RetroTxt on the tab
    const execute = localStorage.getItem(`settingsWebsiteDomains`)
    // if unchecked
    if (typeof execute !== `string` || execute === `false`) return
    this.invoke(tab.tabid, data.type)
  }
  /**
   * Invokes RetroTxt for the first time in the browser tab.
   * @param [tabId=0] Id of the tab
   * @param [pageEncoding=``] Optional text character encoding
   */
  invoke(tabId = 0, pageEncoding = ``) {
    const persistent =
      chrome.runtime.getManifest().background.persistent || false
    const lastErrorCallback = () => {
      // Chrome lastError callback
      if (persistent) {
        if (chrome.runtime.lastError === `undefined`) return false
        console.error(
          `Extension.invoke() aborted for tab #%s\nReason: %s`,
          tabId,
          chrome.runtime.lastError.mess
        )
        return true
      }
      // Firefox specific lastError callback
      if (typeof chrome.runtime.lastError === `undefined`) return false
      if (chrome.runtime.lastError === null) return false
      if (typeof chrome.runtime.lastError.mess === `undefined`) return false
      console.warn(
        `Extension.invoke() warning for tab #%s\nReason: %s`,
        tabId,
        chrome.runtime.lastError.mess
      )
      return false
    }
    // execute RetroTxt
    chrome.tabs.executeScript(
      tabId,
      {
        file: `/scripts/functions.js`,
        runAt: `document_start`,
      },
      () => {
        if (lastErrorCallback(persistent)) return
        // this automatic invocation will be run after the `scripts/eventpage.js`
        // page is loaded and at the start of the document
        chrome.tabs.executeScript(
          tabId,
          {
            code: `BusySpinner()`,
            runAt: `document_start`,
          },
          () => {
            if (lastErrorCallback(persistent)) return
          }
        )
      }
    )
    chrome.tabs.executeScript(
      tabId,
      {
        file: `/scripts/parse_ansi.js`,
        runAt: `document_start`,
      },
      () => {
        if (lastErrorCallback(persistent)) return
      }
    )
    chrome.tabs.executeScript(
      tabId,
      {
        file: `/scripts/parse_dos.js`,
        runAt: `document_start`,
      },
      () => {
        if (lastErrorCallback(persistent)) return
      }
    )
    chrome.tabs.executeScript(
      tabId,
      {
        file: `/scripts/retrotxt.js`,
        runAt: `document_start`,
      },
      () => {
        if (lastErrorCallback(persistent)) return
        // automatic execute,
        // but has to be run after `scripts/retrotxt.js` is loaded
        chrome.tabs.executeScript(
          tabId,
          {
            code: `Execute(${tabId},"${pageEncoding.toUpperCase()}")`,
            runAt: `document_idle`,
          },
          () => {
            if (lastErrorCallback(persistent)) return
          }
        )
      }
    )
  }
  /**
   * Changes the Extension icon in the toolbar of Chrome.
   * @param {*} darkMode Use the icon set intended for dark system themes
   */
  setToolbarIcon(darkMode = false) {
    const os = () => {
      switch (BrowserOS()) {
        case Windows:
          return `Windows`
        case MacOS:
          return `macOS`
        case Linux:
          return `Linux/Unix`
        default:
          return `unknown`
      }
    }
    switch (darkMode) {
      case true:
        console.log(`Chrome thinks the ${os()} system theme is in dark mode.`)
        return chrome.browserAction.setIcon({
          path: {
            16: "assets/retrotxt_16-light.png",
            19: "assets/retrotxt_19-light.png",
            32: "assets/retrotxt_32-light.png",
            38: "assets/retrotxt_38-light.png",
            48: "assets/retrotxt_48-light.png",
            128: "assets/retrotxt_128-light.png",
          },
        })
      default:
        console.log(`Chrome thinks the ${os()} system theme is in light mode.`)
        return chrome.browserAction.setIcon({
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
}

/**
 * Manage RetroTxt context menus.
 * @class Menu
 */
class Menu {
  constructor() {
    this.support = chrome.contextMenus.onClicked !== undefined
    // contexts types for the RetroTxt context menus
    // browser_action: is the tool bar button
    // page: is found by right clicking the body of a page or text file
    this.contexts = [`browser_action`, `page`]
    // URL patterns to trigger the menus, to avoid inappropriate reveals
    this.urlPatterns = [`http://*/*`, `https://*/*`, `file:///*`]
    // context menu titles
    this.titles = new Map()
      .set(`codeOrder`, [
        UseCharSet,
        OutputCP1252,
        OutputISO8859_15,
        OutputUS_ASCII,
        Windows_1252_English,
        ISO8859_5,
      ])
      .set(UseCharSet, `Automatic charset`)
      .set(Windows_1252_English, `CP-1252 ↻`)
      .set(OutputCP1252, `CP-1252`)
      .set(ISO8859_5, `ISO 8859-5 ↻`)
      .set(OutputISO8859_15, `ISO 8859-15`)
      .set(OutputUS_ASCII, `US-ASCII`)
  }
  /**
   * Creates the context menus used on pages and on the task bar button.
   */
  async create() {
    // each separator requires a unique id
    const id1 = 1,
      id2 = 2
    // remove any existing menus to avoid undetected callback errors
    chrome.contextMenus.removeAll()
    // add items in order of display
    this._itemTranscode()
    this._itemSeparator(id1)
    this._itemVersion()
    this._itemFonts()
    this._itemDisplay()
    this._itemSettings()
    this._itemSeparator(id2)
    this._itemDocumentation()
    this._itemCredits()
    this._itemSamples()
    this._itemUseful()
  }
  /**
   * Handles the results after a menu item is clicked.
   * @param [id=``] Id of the menu item that was clicked
   * @param [tab={}] Tab details where the click took place (`tabs.Tab`)
   */
  async event(id = ``) {
    switch (id) {
      case `version`:
      case `credits`:
      case `samples`:
      case `useful`:
      case `fonts`:
      case `display`:
      case `settings`:
      case `documentation`:
        return openOptions(`${id}`)
      case Windows_1252_English:
      case ISO8859_5:
      case UseCharSet:
      case OutputISO8859_15:
      case OutputUS_ASCII:
      case OutputCP1252: {
        // see `handleMessages()` in `scripts/retrotxt.js` for the event handler
        return chrome.tabs.query(
          { active: true, currentWindow: true },
          (tabs) => {
            chrome.tabs.sendMessage(
              tabs[0].id,
              {
                action: id,
                id: `transcode`,
              },
              () => {
                if (CheckLastError(`transcode tabs send message`)) return
                // save a session item to tell RetroTxt how to render the text
                // for this tab, session storage is isolated to the one active tab
                sessionStorage.setItem(`transcode`, id)
              }
            )
          }
        )
      }
      default:
        return console.error(`an unknown Menu event id "${id}" was requested`)
    }
  }
  /**
   * Unlock the Transcode text context menu.
   */
  enableTranscode() {
    chrome.contextMenus.update(`transcode`, {
      enabled: true,
    })
  }

  _itemVersion() {
    chrome.contextMenus.create(
      {
        title: `Version`,
        contexts: [`page`],
        documentUrlPatterns: this.urlPatterns,
        id: `version`,
      },
      () => {
        if (CheckLastError(`create "version" context menu`)) return
      }
    )
  }
  _itemFonts() {
    chrome.contextMenus.create(
      {
        title: `Fonts`,
        contexts: [`page`],
        documentUrlPatterns: this.urlPatterns,
        id: `fonts`,
      },
      () => {
        if (CheckLastError(`create "fonts" context menu`)) return
      }
    )
  }
  _itemDisplay() {
    chrome.contextMenus.create(
      {
        title: `Display`,
        contexts: [`page`],
        documentUrlPatterns: this.urlPatterns,
        id: `display`,
      },
      () => {
        if (CheckLastError(`create "display" context menu`)) return
      }
    )
  }
  _itemSettings() {
    chrome.contextMenus.create(
      {
        title: `Settings`,
        contexts: [`page`],
        documentUrlPatterns: this.urlPatterns,
        id: `settings`,
      },
      () => {
        if (CheckLastError(`create "settings" context menu`)) return
      }
    )
  }
  _itemDocumentation() {
    chrome.contextMenus.create(
      {
        title: `Documentation`,
        contexts: [`page`],
        documentUrlPatterns: this.urlPatterns,
        id: `documentation`,
      },
      () => {
        if (CheckLastError(`create "documentation" context menu`)) return
      }
    )
  }
  _itemCredits() {
    chrome.contextMenus.create(
      {
        title: `Credits`,
        contexts: [`page`],
        documentUrlPatterns: this.urlPatterns,
        id: `credits`,
      },
      () => {
        if (CheckLastError(`create "credits" context menu`)) return
      }
    )
  }
  _itemSamples() {
    chrome.contextMenus.create(
      {
        title: `Samples`,
        contexts: [`page`],
        documentUrlPatterns: this.urlPatterns,
        id: `samples`,
      },
      () => {
        if (CheckLastError(`create "samples" context menu`)) return
      }
    )
  }
  _itemUseful() {
    chrome.contextMenus.create(
      {
        title: `Useful`,
        contexts: [`page`],
        documentUrlPatterns: this.urlPatterns,
        id: `useful`,
      },
      () => {
        if (CheckLastError(`create "useful" context menu`)) return
      }
    )
  }
  /**
   * Inserts a line divider into the context menu.
   * @param [id=1] Unique id to assign the separator
   * @param [targets=[`page`]] Array of contexts in which to display
   * (see this.contexts)
   */
  _itemSeparator(id = 1, targets = [`page`]) {
    chrome.contextMenus.create(
      {
        type: `separator`,
        contexts: targets,
        id: `sep${id}`,
        documentUrlPatterns: this.urlPatterns,
      },
      () => {
        if (CheckLastError(`create "separator" context menu`)) return
      }
    )
  }
  _itemTranscode() {
    chrome.contextMenus.create(
      {
        title: `Transcode this text`,
        contexts: this.contexts,
        documentUrlPatterns: this.urlPatterns,
        id: `transcode`,
      },
      () => {
        if (CheckLastError(`create "transcode" context menu`)) return
      }
    )
    // generate `Transcode text` child items
    for (const id of this.titles.get(`codeOrder`)) {
      // only type `normal` works correctly with this menu as the transcode
      // configuration is a per-tab configuration, while these context menus
      // apply to all tabs
      chrome.contextMenus.create(
        {
          type: `normal`,
          title: this.titles.get(id),
          contexts: this.contexts,
          id: id,
          parentId: `transcode`,
          documentUrlPatterns: this.urlPatterns,
        },
        () => {
          if (CheckLastError(`create "transcode normal" context menu`)) return
        }
      )
    }
  }
}

// self-invoking expressions that runs after this page is loaded by the browser
;(() => {
  if (typeof qunit !== `undefined`) return
  if (chrome === undefined)
    CheckError(
      `RetroTxt failed to run because the Extension API did not load! Please close this browser and try again.`
    )
  // detect developer mode
  if (`management` in chrome) {
    chrome.management.getSelf((info) => {
      switch (info.installType) {
        // the add-on was installed unpacked from disk
        case `development`:
          console.info(`Development RetroTxt method detected.`)
          return (RetroTxt.developer = true)
        case `admin`: // the add-on was installed because of an administrative policy
        case `normal`: // the add-on was installed normally from an install package
        case `sideload`: // the add-on was installed by some other software on the user's computer
        case `other`: // the add-on was installed in some other way
          return
      }
    })
  }
  // browser tabs
  new Tabs().listen()
  // context menus
  const menu = new Menu()
  if (menu.support === true) menu.create()
  // omnibox
  const omni = new Omnibox()
  omni.initialize()
  // post install behaviour
  const extension = new Extension()
  chrome.runtime.onInstalled.addListener((details) => {
    extension.initialize(details)
  })
  // listen to and handle messages from content scripts
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (RetroTxt.developer)
      console.log(`✉ Received by runtime.onMessage.addListener().\n`, sender)
    const button = new ToolbarButton(),
      key = Object.entries(message)[0][0],
      value = Object.entries(message)[0][1],
      tabId = sender.tab.id
    switch (key) {
      case `askForSettings`:
        sendResponse({ response: extension.defaults })
        if (RetroTxt.developer)
          console.log(
            `✉ 'askForSettings' message request Extension().defaults response sent.`
          )
        return
      case `darkMode`:
        console.log(`HONK VALUE`, value)
        chrome.browserAction.setIcon({
          path: {
            16: "assets/retrotxt_16-light.png",
            19: "assets/retrotxt_19-light.png",
            32: "assets/retrotxt_32-light.png",
            38: "assets/retrotxt_38-light.png",
            48: "assets/retrotxt_48-light.png",
            128: "assets/retrotxt_128-light.png",
          },
        })
        if (RetroTxt.developer)
          console.log(
            `✉ 'darkMode' Received Chrome specific, dark mode set icon request.`
          )
        return
      case `invoked`:
        if (RetroTxt.developer)
          console.log(`✉ Received invoke %s request.`, value)
        if (!(`tab` in sender)) return
        if (value === false) {
          const extension = new Extension()
          extension.invoke(
            tabId,
            `${sessionStorage.getItem(`tab${tabId}encoding`)}`
          )
        }
        if (value === true)
          chrome.tabs.sendMessage(tabId, { id: `toggle` }, () => {
            if (CheckLastError(`invoked tabs send message`)) return
          })
        return
      case `monitorDownloads`:
        if (RetroTxt.developer)
          console.log(`✉ Received invoke %s request.`, value)
        return new Downloads().listen(value)
      case `retroTxtified`:
        if (!(`tab` in sender)) return
        if (RetroTxt.developer)
          console.log(`✉ Received retroTxtified %s request.`, value)
        button.id = tabId
        if (value === true) button.enable()
        if (value === false) button.disable()
        return
      case `transcode`:
        if (RetroTxt.developer)
          console.log(
            `✉ Received transcode request to select '$%s'.`,
            message.transcode
          )
        return chrome.contextMenus.update(message.transcode, { checked: true })
      default:
        if (!RetroTxt.developer) return
        console.group(`✉ Unexpected message.`)
        console.log(message)
        console.log(sender)
        return console.groupEnd()
    }
  })
  // browser tab activated listener
  chrome.tabs.onActivated.addListener((activeInfo) => {
    if (typeof activeInfo.tabId === `undefined`) return
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (
        typeof chrome.runtime.lastError === `object` &&
        chrome.runtime.lastError.message !== ``
      )
        console.log(chrome.runtime.lastError.message)
      if (typeof tab === `undefined`) return
      new Action(tab.id, tab).activated()
    })
  })
  // browser action (tool bar button) click event
  chrome.browserAction.onClicked.addListener((tab) => {
    new Action(tab.id, tab).browserAction()
  })
  // file downloads event listeners
  new Downloads().listen()
  // monitor saved changes to Options so the context menu can be updated
  chrome.storage.onChanged.addListener((changes, areaName) => {
    new LocalStore().event(changes, areaName)
  })
  // context menus clicked event
  if (`onClicked` in chrome.contextMenus) {
    chrome.contextMenus.onClicked.addListener((info) => {
      menu.event(info.menuItemId)
    })
  }
  // initialisation of storage plus generate context menu on browser launch and
  // extension load
  switch (WebBrowser()) {
    case Chrome:
      console.info(`RetroTxt is being initialised for the Chrome/Blink engine.`)
      break
    case Firefox:
      console.info(
        `RetroTxt is being initialised for the Firefox/Gecko engine.`
      )
      break
  }
})()
