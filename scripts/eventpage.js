// filename: eventpage.js
// The WebExtension background page.
// Run by the browser onload, by RetroTxt onload or refresh.
"use strict"

// Globals set here are not shared with browser tabs
// retrotxt developer verbose feedback (this is dynamically set)
// TODO Always set RetroTxt.developer to false before public release!
var RetroTxt = { developer: false }

/**
 * Error handler for this eventpage.js.
 * @param [error=``] error feedback
 * @param [log=false] `false` errors are logged to the browser Console otherwise a JavaScript exception is thrown
 */
function CheckError(error = ``, log = false) {
  const debug = false
  if (error !== undefined) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0] !== undefined) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { error: error, id: `CheckError` },
          result => {
            if (debug && result !== undefined) console.log(result) // debug message passing
          }
        )
      }
    })
    if (log !== true) {
      if (RetroTxt.developer === true) console.trace(error)
      else console.log(error)
    } else {
      try {
        throw new Error(error)
      } catch (result) {
        console.error(result)
      }
    }
  }
}

/**
 * Handle event listenders for browser tabs.
 * @class Tabs
 */
class Tabs {
  constructor() {
    this.tabId = 0
  }
  /**
   * Add event listeners for tabs
   */
  async listen() {
    chrome.tabs.onCreated.addListener(tab => {
      this.tabId = tab.id
      if (!(`url` in tab)) return this.permissionDenied(true, `created`)
      const callback = new Tab(tab.id, tab.url, tab)
      callback.create()
    })
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
      this.tabId = tabId
      let consoleLog = false
      if (!(`url` in tabInfo)) {
        if (`status` in changeInfo && changeInfo.status === `complete`)
          consoleLog = true
        return this.permissionDenied(consoleLog, `updated`)
      }
      // don't run the update when the tab isn't 'active'
      if (!tabInfo.active) return
      const callback = new Tab(tabId, tabInfo.url, changeInfo)
      callback.update()
    })
    chrome.tabs.onRemoved.addListener(tabId => {
      const callback = new Tab(tabId)
      callback.remove()
    })
  }
  /**
   * Remove all event listeners for tabs
   */
  async remove() {
    chrome.tabs.onCreated.removeListener()
    chrome.tabs.onUpdated.removeListener()
    chrome.tabs.onRemoved.removeListener()
  }
  /**
   * API access permission has been denied to RetroTxt by the browser.
   */
  permissionDenied(consoleLog = false, listener = ``) {
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
   * @param [id=0] id of the tab
   * @param [url=``] uri or url of the tab
   * @param [info={}] tab object
   * @param [menuId=``] id the context menus to modify
   */
  constructor(id = 0, url = ``, info = {}, menuId = ``) {
    this.id = id
    this.info = info
    this.menuId = menuId
    this.url = url
  }
  create() {
    this.menuId = `onCreated`
    chrome.tabs.query({ status: `complete` }, () => {
      const validate = () => {
        const http = new Security(`http`, this.url)
        switch (`${this.info.status}`) {
          case `complete`:
            chrome.permissions.contains(http.test(), result => {
              if (result === true) return this.checkURL()
            })
            return
          case `loading`:
            // Chrome fix: when a tab is not active & tab.status is stuck at loading
            if (this.url.startsWith(`file:///`) && !this.info.active) {
              const files = new Security(`files`)
              const test = files.test()
              chrome.permissions.contains(test, result => {
                if (result === true) return this.checkURL()
                else this.permissionDenied(test)
              })
            }
        }
      }
      // handle file protocol
      if (this.url.startsWith(`file:///`)) {
        const files = new Security(`files`)
        const test = files.test()
        chrome.permissions.contains(test, result => {
          if (result === true) validate()
          else this.permissionDenied(test)
        })
        return
      }
      // handle http protocol
      return validate()
    })
  }
  update() {
    chrome.tabs.query(
      {
        active: true,
        lastFocusedWindow: true,
        status: `complete`
      },
      () => {
        // sessionStorage cleanup
        const updateCount = sessionStorage.getItem(`tab${this.id}update`)
        if (updateCount === null) {
          sessionStorage.setItem(`tab${this.id}update`, 1)
        } else {
          sessionStorage.setItem(
            `tab${this.id}update`,
            parseInt(updateCount) + 1
          )
        }
        if (updateCount >= 3) {
          sessionStorage.removeItem(`tab${this.id}encoding`)
          sessionStorage.removeItem(`tab${this.id}textfile`)
          sessionStorage.removeItem(`tab${this.id}update`)
        }
        // browser specific cases
        // important: if there are multiple instances of RetroTxt being invoked within the same browser tab the logic in this code
        // below is the likely suspect!
        this.menuId = `onUpdated`
        if (this.info.status === `complete`) {
          // handle file protocol
          if (this.url.startsWith(`file:///`)) {
            const files = new Security(`files`)
            const test = files.test()
            chrome.permissions.contains(test, result => {
              if (result === true) this.checkURL()
              else this.permissionDenied(test)
            })
            return
          }
          // handle http protocol
          const http = new Security(`http`, this.url)
          const test = http.test()
          chrome.permissions.contains(test, result => {
            if (result === true) return this.checkURL()
            else return this.permissionDenied(test)
          })
        }
      }
    )
  }
  remove() {
    if (RetroTxt.developer) console.log(`🗙 Closed tab #${this.id}.`)
    // clean up sessionStorage used by tab
    for (const key in sessionStorage) {
      if (key.includes(`tab${this.id}`)) {
        sessionStorage.removeItem(key)
      }
    }
  }
  /**
   * API permission access has been denied to RetroTxt by the browser.
   * @param [result={}] permission test object that was denied
   */
  permissionDenied(result = {}) {
    if (RetroTxt.developer) {
      console.log(`⚠ Permission denied for the following request\n`, result)
    }
  }
  /**
   * Validates `this.url` and skips URL schemes and domains that are not compatible with RetroTxt.
   */
  checkURL() {
    const valid = this.validateURLSyntax()
    if (!valid) {
      return console.info(
        `RetroTxt has skipped tab #%s as it points to an incompatible URL.\n%s`,
        this.id,
        this.url
      )
    }
    // get and parse the url
    const uri = {
      domain: this.removeSubDomains(),
      scheme: this.url.split(`:`)[0]
    }
    // Option `Apply RetroTxt to any text files hosted on these websites`
    let domains = `${localStorage.getItem(`runWebUrlsPermitted`)}`
    let approved = false
    if (domains.length === 0) {
      chrome.storage.local.get(`runWebUrlsPermitted`, result => {
        const value = `${result.runWebUrlsPermitted}`
        if (value.length < 1) {
          const storage = new Storage()
          storage.scan()
          CheckError(
            `Could not obtain the required runWebUrlsPermitted setting requested by eventUrl().`,
            false
          )
        } else localStorage.setItem(`runWebUrlsPermitted`, value)
      })
      domains = `${localStorage.getItem(`runWebUrlsPermitted`)}`
      if (domains.length === 0) {
        // redundancy in case localStorage doesn't work
        const extension = new WebExtension()
        domains = extension.defaults.get(`runWebUrlsPermitted`)
      }
    }
    // insert the RetroTxt URL into the approved list
    // see _locales/en_US/messages.json url for the http address
    domains = `${chrome.i18n.getMessage(`url`)};${domains}`
    // list of approved website domains
    approved = domains.includes(uri.domain)
    // as the compatibleURL() function silently breaks functionality with some secured website logins such as online banks
    // it must NEVER be run passively in the eventpage.js except for preselected web domains
    if (this.url === chrome.extension.getURL(`welcome.ans`))
      return this.compatibleURL()
    // if the URL domain is not apart of the user approved list then RetroTxt is aborted for this tab
    if (uri.scheme !== `file` && approved !== true) return
    // if the URL domain is apart of the user approved list then we then test the filename or body content
    this.compatibleURL()
  }
  /**
   * Checks the URL compatibility with RetroTxt.
   * @returns boolean
   */
  validateURLSyntax() {
    if (this.url.length < 1) return false
    if (this.url === chrome.extension.getURL(`welcome.ans`)) return false
    // TODO: There is a strange bug in Firefox that cannot be replicated that tries to
    // parse about:blank activeTab but results in an permissions denied loop.
    if (this.url.startsWith(`https://`)) return true
    if (this.url.startsWith(`http://`)) return true
    if (this.url.startsWith(`file:///`)) return true
    // all other URIs
    return false
  }
  /**
   * Checks to the filename of the URL and then checks the
   * content of the tab to make sure it's compatible with RetroTxt.
   * Intended to be run in conjunction with this.checkURL().
   */
  compatibleURL() {
    console.log(`Tabs.compatibleURL() has been requested.`)
    const config = new Configuration()
    const downloads = new Downloads()
    // fetch() method init object
    // https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch
    const fetchInit = { method: `GET`, cache: `default` }
    // tab object
    const tab = { menuId: this.menuId, tabid: this.id, url: this.url }
    // uri (URL) object with a domain, scheme `https` or `file` and a skip Boolean
    const uri = {
      domain: this.removeSubDomains(),
      ignore: config.validateFilename(this.url),
      scheme: this.url.split(`:`)[0]
    }
    // check against the hard coded black list of domains & schemes to skip any false positives or conflicts
    if (config.validateDomain(uri.domain)) {
      return console.warn(
        `RetroTxt conflicts with the domain %s so %s is ignored.`,
        uri.domain,
        this.url
      )
    }
    const files = new Security(`files`)
    switch (uri.scheme) {
      // note there is a `uri` object and `url` string
      case `file`:
        // if last character is `/` then it is most probably a directory
        if (this.url.substring(this.url.length - 1) === `/`) {
          if (RetroTxt.developer)
            console.log(
              `Directory detected so ignoring tab #%s.\n%s`,
              this.id,
              this.url
            )
          return
        }
        // compare local file name extension to the file name ignore list
        if (uri.ignore === true) {
          if (RetroTxt.developer)
            console.log(
              `Invalid filename extension detected so ignoring tab #%s.\n%s`,
              this.id,
              this.url
            )
          return
        }
        if (FindEngine() === `gecko`) {
          // look for file names with extensions
          const path = this.url.split(`/`).slice(-1)
          // otherwise, assume it's a dir
          if (path.toString().indexOf(`.`) < 0) {
            if (RetroTxt.developer)
              console.log(
                `Directory detected so ignoring tab #%s.\n%s`,
                this.id,
                this.url
              )
            return
          }
        }
        console.info(`Loading local file ${this.url}.`)
        chrome.permissions.contains(files.test(), result => {
          if (result === true) {
            const extension = new WebExtension()
            extension.activateTab(null, tab)
          } else files.fail()
        })
        break
      case `http`:
      case `https`:
        // use Fetch API to download tab
        fetch(this.url, fetchInit)
          .then(response => {
            if (response.ok) return response.blob()
            throw new Error()
          })
          .then(data => {
            downloads.parseBlob(data, tab)
            if (RetroTxt.developer)
              console.log(`Fetch API data results.\n`, data)
          })
          .catch(error => {
            console.error(
              `Tabs.compatibleURL(${this.menuId}, ${this.url}, ${
                this.id
              }) failed: ${error}.`
            )
          })
        break
      default:
        if (RetroTxt.developer)
          console.log(
            `Tab URL '%s' is not known so ignoring onClick action.`,
            this.url
          )
    }
  }
  /**
   * Returns a url without any sub-domains or schemes.
   * For example `https://www.example.com` will return `example.com`.
   */
  removeSubDomains() {
    // convert hostname into an array
    if (this.url === ``) return ``
    let host = this.url.split(`/`)[2]
    if (typeof host === `undefined`) host = this.url
    const parts = host.split(`.`)
    if (parts.length <= 2) return host
    // drop the sub-domain
    parts.shift()
    // convert the array back to a string
    return parts.join(`.`)
  }
}

/**
 * Handle toolbar button display.
 * @class ToolbarButton
 */
class ToolbarButton {
  /**
   * Creates an instance of ToolbarButton.
   * @param [tabId=0] id of the tab
   */
  constructor(tabId = 0) {
    this.id = tabId
    // note manifest.json browser_action.default_title contains the initial title
    this.title = `RetroTxt`
  }
  disable() {
    if (this.id === 0) return
    chrome.browserAction.setBadgeText({ text: `` })
    chrome.browserAction.setTitle({ title: this.title, tabId: this.id })
    chrome.browserAction.enable(this.id)
  }
  enable() {
    if (this.id === 0) return
    chrome.browserAction.setBadgeText({ text: `✓` }) // checkmark styles: ✓ ✔ 🗹 ✅
    chrome.browserAction.setTitle({ title: this.title, tabId: this.id })
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
   * @param [tabId=0] id of the tab
   * @param [info={}] tab object
   */
  constructor(tabId = 0, info = {}) {
    this.scheme = ``
    this.id = tabId
    this.info = info
    this.state = false
    if (`url` in this.info) {
      this.scheme = `${this.info.url.split(`:`)[0].toLowerCase()}`
    } else {
      this.info.url = `tabs.Tab.url permission denied`
      this.info.title = `tabs.Tab.title permission denied`
    }
  }
  /**
   * Browser tab activated (selected).
   */
  activated() {
    const item = sessionStorage.getItem(`tab${this.id}textfile`)
    if (RetroTxt.developer) {
      console.log(
        `↩ Activated tab #%s with a stored item = %s.\n%s\n%s`,
        this.id,
        item,
        this.info.url,
        this.info.title
      )
    }
    const button = new ToolbarButton(this.id)
    button.enable()
    this.state = false
    switch (`${item}`) {
      case `true`:
        this.state = true
        return this.contextMenus()
      case `false`:
        this.state = false
        return this.contextMenus()
      case `null`:
        // for incompatible tabs but also this can be a dead state as after the web-extension is reloaded all the tab event listeners are gone
        button.disable()
        this.state = false
        return this.contextMenus()
      default:
        button.disable()
        this.state = false
        this.contextMenus()
        return CheckError(
          `Could not run button.update() as the sessionStorage tab#${
            this.id
          }textfile value '${item}' != Boolean.`
        )
    }
  }
  /**
   * Update context menus to reflect the tab's suitability for RetroTxt.
   */
  contextMenus() {
    const update = [`transcode`]
    for (const id in update) {
      chrome.contextMenus.update(update[id], { enabled: this.state })
    }
  }
  /**
   * Event handler sanity check when a user clicks the RetroTxt button in the toolbar.
   */
  browserAction() {
    // pass
    if (this.validateScheme() === true) return this.clicked()
    // fail
    return
  }
  /**
   * Checks the URL scheme against a permitted list.
   * @returns boolean
   */
  validateScheme() {
    const extension = new WebExtension()
    const result = extension.defaults
      .get(`schemesPermitted`)
      .includes(this.scheme)
    return result
  }
  /**
   * Event handler for user clicks on the RetroTxt button in the toolbar.
   */
  clicked() {
    if (!(`url` in this.info) || this.info.url.length === 0) {
      return console.warn(
        `RetroTxt could not determine the URL of the active tab #%s.`,
        this.id
      )
    }
    if (this.id === 0) return
    if (RetroTxt.developer)
      console.log(`↩ Toolbar button click registered for tab #%s.`, this.id)
    // sessionStorage only saves strings
    const session = {
      state: sessionStorage.getItem(`tab${this.id}textfile`),
      type: sessionStorage.getItem(`tab${this.id}encoding`)
    }
    // determine if active tab is a text file and save the results to a sessionStore to reduce any future, expensive HTTP HEAD requests
    if (typeof session.state !== `string`) {
      const security = new Security(`action`)
      const test = security.test()
      chrome.permissions.contains(test, containsResult => {
        if (containsResult === false) {
          chrome.permissions.request(test, requestResult => {
            if (requestResult === true) {
              console.log(`Permission was granted`)
            } else {
              return console.log(`Permission was refused`)
            }
          })
        }
        // check the tab & then refetch session storage
        const tab = new Tab(this.id, this.info.url, this.info)
        const scheme = this.info.url.split(`:`)[0]
        if (scheme === `file`) {
          const security = new Security(`files`)
          if (containsResult === false) {
            chrome.permissions.request(security.test(), requestResult => {
              if (requestResult === true) {
                console.log(`Permission was granted`)
              } else {
                return console.log(`Permission was refused`)
              }
            })
          }
        }
        tab.compatibleURL()
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
      chrome.tabs.sendMessage(this.id, { id: `invoked` })
    }
  }
}

/**
 * Web-extension permissions interface.
 * @class Security
 */
class Security {
  /**
   * Creates an instance of Security.
   * @param [type=``] permission type to handle: `action`, `downloads`, `files` or `http`
   * @param [origin=``] an optional url or uri
   */
  constructor(type = ``, origin = ``) {
    // IMPORTANT! These Map values must sync to those in the Security class in options.js
    // Firefox REQUIRES tabs permission to access url in the queryInfo parameter to tabs.query().
    const permissions = new Map()
      .set(`action`, [`tabs`])
      .set(`downloads`, [`downloads`, `downloads.open`, `tabs`])
      .set(`files`, [`tabs`])
      // `http` needs to be `activeTab` instead of `tabs` otherwise URLs listed in `permissions` will not toggle
      .set(`http`, [`activeTab`])
    const origins = new Map()
      .set(`action`, [])
      .set(`downloads`, [`file:///*/`])
      .set(`files`, [`file:///*/`])
      .set(`http`, this.httpToOrigins())
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
   * Creates a collection of permissions for use with permissions methods.
   * @returns `permissions.Permissions` object
   */
  test() {
    if (RetroTxt.developer)
      console.trace(`⚿ Security test request for '${this.type}'.`)
    if (this.type === `http`) {
      this.origins = this.httpToOrigins()
    }
    const permissionsToRequest = {
      permissions: this.permissions,
      origins: this.origins
    }
    return permissionsToRequest
  }
  /**
   * Converts a url or uri supplied by `this.origin` into a
   * collection of host permissions.
   * @returns array containing host permissions
   */
  httpToOrigins() {
    if (typeof this.origin === `undefined`) return this.origins
    if (this.origin.length < 1) return this.origins
    // parse url to valid host
    let noScheme = this.origin
    if (this.origin.includes(`://`)) {
      noScheme = this.origin.slice(this.origin.indexOf(`://`) + 3)
    }
    const hostname = noScheme.split(`/`, 1)[0]
    return [`*://${hostname}/*`]
  }
  /**
   * API access permission has been denied to RetroTxt by the browser.
   */
  fail() {
    console.warn(
      `⚠ WebExtension permission access '${
        this.permissions
      }' is denied for %s.`,
      this.type
    )
  }
}

/**
 * Web-extension local storage interface.
 * @class Storage
 */
class Storage {
  /**
   * There are 4 types of browser storage that is accessible to RetroTxt.
   * `sessionStorage` is temporary and is cleared whenever the browser is closed.
   * `localStorage` is persistant and offers immediate access but is not able to be accessed by all parts of RetroTxt.
   * `chrome.Storage.local` is persistant but much slower than localStorage, but can be accessed by all parts of RetroTxt.
   * `chrome.Storage.sync` allows cloud saving and syncing storage but is currently not implemented by RetroTxt.
   */
  constructor() {
    const extension = new WebExtension()
    this.defaults = extension.defaults
    this.redundant = new Set().add(`runFileDownloads`).add(`runFileUrls`)
    // TODO The following MUST be disabled in production as it erases all the storage objects whenever this web-extension is reloaded
    this.storageReset = false
    this.redundantTest = false
  }
  /**
   * Cleans up and validates RetroTxt storage requirements.
   * Intended for use when RetroTxt is loaded.
   */
  initialize() {
    if (this.storageReset) {
      this.wipe()
      this.clean()
    } else if (this.redundantTest) {
      chrome.storage.local.set({ runFileDownloads: true })
    }
    sessionStorage.clear()
    this.scan()
  }
  /**
   * Iterates through the `this.defaults` Map and looks for matching keys in chrome.Storage.local.
   * If a matching key in Storage is found then the pass() function is called otherwise fail() is used.
   */
  scan() {
    this.defaults.forEach((value, key) => {
      chrome.storage.local.get(`${key}`, data => {
        if (key in data) this.pass(key, Object.values(data)[0])
        else this.fail(key)
      })
    })
  }
  /**
   * Scan success callback that looks for an identical localStorage key/value pair.
   * If a matching localStorage item is not found then it is set here.
   * @param [key=``] storage.local key
   * @param [value=``] storage.local value
   */
  pass(key = ``, value = ``) {
    const local = localStorage.getItem(`${key}`)
    if (local === null) localStorage.setItem(`${key}`, `${value}`)
  }
  /**
   * Scan failed callback that saves the `this.defaults` value to the storage area and then updates the context menus.
   * @param [key=``] storage.local key
   */
  fail(key = ``) {
    const value = this.defaults.get(`${key}`)
    // convert the array object to a ; separated string
    if (key === `runWebUrlsPermitted`) {
      const valuesJoined = value.join(`;`)
      chrome.storage.local.set({ [key]: valuesJoined })
      this.pass(key, valuesJoined)
    }
    // retroColor `this.defaults` are missing an expected `theme-` prefix
    else if (key === `retroColor` && !value.startsWith(`theme-`)) {
      const newValue = `theme-${value}`
      chrome.storage.local.set({ [key]: newValue })
      this.pass(key, newValue)
    }
    // otherwise save the value as a string
    else {
      chrome.storage.local.set({ [key]: value })
      this.pass(key, value)
    }
    // update context menus
    if (
      [
        `retroColor`,
        `textBgScanlines`,
        `textCenterAlignment`,
        `textFontInformation`
      ].includes(key)
    ) {
      const menu = new Menu()
      if (key === `retroColor`) return menu.itemChecked(value)
      menu.itemChecked(key, value)
    }
  }
  /**
   * Removes legacy storagelocal items that may have been configured
   * and used in earlier RetroTxt versions.
   */
  clean() {
    this.redundant.forEach(key => {
      chrome.storage.local.remove(`${key}`)
    })
  }
  /**
   * Outputs any chrome.storage changes to the background page console.
   * @param changes object describing the change
   * @param areaName name of the storage area where changes were made
   */
  event(changes, areaName) {
    for (const item of Object.keys(changes)) {
      const oldValue = changes[item].oldValue
      // newValue must be saved as a string otherwise context menu errors will occur
      const newValue = `${changes[item].newValue}`
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
      // handle colour pair and theme changes, this may trigger twice
      if (item === `retroColor` || item === `retroFont`) {
        const selectOther = () => {
          chrome.contextMenus.update(`no-theme`, {
            enabled: true,
            checked: true
          })
        }
        const disableOther = () => {
          chrome.contextMenus.update(`no-theme`, {
            enabled: false,
            checked: false
          })
        }
        const menu = new Menu()
        const savedColor = `${localStorage.getItem(`retroColor`)}`
        const savedFont = `${localStorage.getItem(`retroFont`)}`
        let valid = false
        for (let theme of menu.themes) {
          const themeId = theme[0]
          const themeColor = theme[1][1]
          const themeFont = theme[1][0]
          if (savedColor === themeColor && savedFont === themeFont) {
            if (RetroTxt.developer)
              console.log(`🖫 Theme property swap to '%s' detected.`, themeId)
            valid = true
            return disableOther()
          }
        }
        if (valid === false) {
          if (RetroTxt.developer) console.log(`🖫 Theme swapout detected.`)
          return selectOther()
        }
      }
    }
  }
  /**
   * Erases local, session & WebExtension local storage items that
   * were created by RetroTxt.
   */
  wipe() {
    localStorage.clear()
    sessionStorage.clear()
    chrome.storage.local.clear(() => {
      console.warn(
        `🖫 Deleted RetroTxt localStorage, sessionStorage and chrome.storage.local settings.`
      )
    })
  }
}

/**
 * Apply RetroTxt to any downloaded text files.
 * @class Downloads
 */
class Downloads {
  /**
   * Creates an instance of Downloads.
   * @param [monitor=true] `true` to monitor downloads or `false` to ignore
   */
  constructor(monitor = true) {
    this.delta
    this.item
    this.monitor = monitor
  }
  /**
   * Monitor file downloads.
   * TODO Firefox 62+ access is still disabled, see the `complete` state of update() for the reasons
   */
  async listen() {
    if (FindEngine() === `gecko`) return
    // exit when chrome.downloads is inaccessible due Extensions configurations
    if (`downloads` in chrome === false)
      return console.warn(`chrome.downloads API is inaccessible`)
    if (`onCreated` in chrome.downloads === false)
      return console.warn(
        `chrome.downloads API onCreated event is inaccessible`
      )
    const downloads = new Downloads()
    const security = new Security(`downloads`, `downloads`)
    const test = security.test()
    switch (this.monitor) {
      case true:
        chrome.downloads.onCreated.addListener(item => {
          downloads.item = item
          // security check blocks downloads.create()
          // otherwise any Options changes will require a web-extension reload
          chrome.permissions.contains(test, result => {
            if (result !== true) {
              if (RetroTxt.developer) security.fail()
              return // abort
            } else {
              downloads.create()
            }
          })
        })
        chrome.downloads.onChanged.addListener(delta => {
          downloads.delta = delta
          // a fix for the Chrome endless loop issue where it incorrectly identifies a text file as a binary
          // (application/octet-stream) and forces it to download instead of render in a tab
          if (!(`item` in downloads)) return
          if (!(`mime` in downloads.item)) return
          if (downloads.item.mime === `application/octet-stream`) {
            if (
              `state` in downloads.delta &&
              downloads.delta.state.current === `complete`
            ) {
              const config = new Configuration()
              const textFile = config.validateFileExtension(
                downloads.item.finalUrl
              )
              if (textFile === true)
                console.warn(
                  `Downloaded filename looks to be a text file but the host server says it's a binary file: `,
                  downloads.item.finalUrl
                )
            }
            return
          }
          downloads.update()
        })
        break
      case false:
        chrome.downloads.onCreated.removeListener(this.create)
        chrome.downloads.onChanged.removeListener(this.update)
        break
    }
  }
  /**
   * Runs a permissions check whenever a new user download is started.
   * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/onCreated
   */
  initialize() {
    console.log(`Initialize`)
    const downloads = new Downloads()
    switch (this.monitor) {
      case true:
        chrome.downloads.onCreated.addListener(item => {
          downloads.item = item
          downloads.create()
        })
        chrome.downloads.onChanged.addListener(delta => {
          downloads.delta = delta
          downloads.update()
        })
        break
      case false:
        chrome.downloads.onCreated.removeListener(this.create)
        chrome.downloads.onChanged.removeListener(this.update)
        break
    }
  }
  /**
   * Initialise the new file download so RetroTxt can monitor its download state.
   */
  create() {
    // sanity checks
    const valid = () => {
      if (!(`id` in this.item)) return false
      if (!(`url` in this.item)) return false
      if (!(`filename` in this.item)) return false
      // some browsers leave the filename property empty
      // so sessionStorage can also be set in this.update()
      if (this.item.filename.length < 1) return false
      if (this.item.url.length < 11) return false
      return true
    }
    if (valid === false) return
    // only monitor HTTP downloads
    const config = new Configuration()
    const schemes = [`http`, `https`]
    const scheme = this.item.url.split(`:`)[0]
    if (schemes.includes(scheme) === false) return
    // check file name extension isn't an obvious non-text file
    if (config.validateFilename(this.item.filename)) return
    // location of saved local file
    sessionStorage.setItem(
      `download${this.item.id}-localpath`,
      `${this.item.filename}`
    )
  }
  /**
   * Handle any changes to the download state including aborts and completed downloads.
   * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/onChanged
   * @param [data={}] download item properties and status of changes
   */
  update() {
    // sanity checks
    const valid = () => {
      if (!(`id` in this.delta)) return
    }
    if (valid === false) return
    this.setFilename()
    const itemName = `download${this.delta.id}-localpath`
    const item = sessionStorage.getItem(itemName)
    if (item === null) return
    // handle all errors including cancelled downloads
    if (`error` in this.delta && `current` in this.delta.error) {
      return sessionStorage.removeItem(itemName)
    }
    // completed downloads
    if (`state` in this.delta && `current` in this.delta.state) {
      if (this.delta.state.current === `complete`) {
        sessionStorage.removeItem(itemName)
        // Windows friendly path conversion
        const path = item.replace(/\\/g, `/`)
        const uri = `file:///${path}`
        // open a new tab with the loaded text file
        // Chrome will force-close any new tabs that it believes are binary files or dangerous
        // Firefox refuses to open privileged URLS such as file:///
        chrome.tabs.create({ active: false, url: uri })
        // Firefox refuses to open downloads without User Input which is lost by this point.
        // ↳ "Error: downloads.open may only be called from a user input handler"
        //chrome.downloads.open(this.delta.id)
      }
    }
  }
  setFilename() {
    if (!(`filename` in this.delta)) return false
    if (!(`current` in this.delta.filename)) return false
    const filename = this.delta.filename.current
    if (filename.length < 1) return false
    const config = new Configuration()
    if (config.validateFilename(filename)) return false
    sessionStorage.setItem(`download${this.delta.id}-localpath`, `${filename}`)
    return true
  }
  /**
   * Determines if the data blob is a text file.
   * Blob object: https://developer.mozilla.org/en-US/docs/Web/API/Blob
   * @param [data] fetch api data blob
   * @param [tab={}] tab object
   */
  parseBlob(data, tab = {}, test = false) {
    // mime type split (text/plain)
    const split = data.type.split(`/`, 2)
    // if data.type.split is empty then the browser couldn't work out the MIME type
    // but we will assume it is a text file as the browser didn't attempt to download/render it
    const format = split[0] || `text`
    let subType = ``
    if (split[0] === ``) {
      console.log(`Tab #%s Blob MIME type is unknown.`, tab.tabid)
      subType = `unknown`
    } else {
      // sub-type split (plain;charset=iso-8859-1)
      subType = split[1].split(`;`, 1)[0]
    }
    // data
    const dataSlice = data.slice(0, 2)
    const reader = new FileReader()
    switch (format) {
      case `text`: {
        switch (subType) {
          case `plain`:
          case `x-nfo`:
          case `unknown`: {
            // check to makesure text/plain is not mark-up
            reader.onload = loadedEvent => {
              const text = loadedEvent.target.result.trim()
              // if the body starts with <! or <? then it is most likely mark-up
              const markUpCheck = [`<!`, `<?`].includes(text.substring(0, 2))
              if (test === true) return markUpCheck
              if (markUpCheck === false) {
                if (RetroTxt.developer)
                  console.log(
                    `Retrotxt activated on tab #%s.\n%s`,
                    tab.tabid,
                    tab.url
                  )
                const extension = new WebExtension()
                extension.activateTab(data, tab)
              }
            }
            if (test === false) return reader.readAsText(dataSlice)
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
}

/**
 * Web extension initialisation, defaults and activation.
 * @class WebExtension
 */
class WebExtension {
  constructor() {
    // import from functions.js
    this.defaults = new OptionsReset().options
  }
  /**
   * Initialise RetroTxt after it is first installed or updated.
   * @param details
   */
  initialize(details) {
    console.log(`Reticulating splines.`)
    const storage = new Storage()
    storage.initialize()
    const checks = [`updatedNotice`]
    switch (details.reason) {
      case `install`:
        chrome.tabs.create({
          url: chrome.extension.getURL(`html/welcome.html`)
        })
        break
      case `update`:
        // push redundant items into checks array for storage.local.get()
        storage.redundant.forEach(key => {
          checks.push(`${key}`)
        })
        chrome.storage.local.get(checks, results => {
          for (const result in results) {
            if (result === `updatedNotice`) continue
            // if any of the redundant checks are set to true, then show the welcome page
            if (results[result] === true) {
              chrome.tabs.create({
                url: chrome.extension.getURL(`html/welcome.html#permission`)
              })
              storage.clean()
              return
            }
          }
          const notice = results.updatedNotice
          if (notice === false) return
          // do not show updated notice
          else
            chrome.tabs.create({
              url: chrome.extension.getURL(`html/welcome.html#update`)
            })
        })
        break
      case `browser_update`:
      case `shared_module_update`:
        break
    }
  }
  /**
   * Activates and prepares browser tab to invoke RetroTxt.
   * @param [data] optional fetch api data blob
   * @param [tab={}] tab object
   */
  activateTab(data, tab = {}) {
    if (data === null || !(`type` in data)) {
      data = { type: `unknown` }
    }
    // is the tab hosting a text file and what is the page encoding?
    sessionStorage.setItem(`tab${tab.tabid}textfile`, true)
    sessionStorage.setItem(`tab${tab.tabid}encoding`, data.type)
    sessionStorage.removeItem(`tab${tab.tabid}update`)
    // Update the browser tab UI
    const button = new ToolbarButton(tab.tabid)
    button.enable()
    const menu = new Menu()
    menu.enableTranscode()
    // if tab has previously been flagged as 'do not autorun' then finish up
    if (sessionStorage.getItem(`tab${tab.tabid}execute`) === `false`) return
    // otherwise execute RetroTxt on the tab
    const execute = localStorage.getItem(`runWebUrls`)
    if (typeof execute !== `string` || execute === `false`) return // if unchecked
    this.invoke(tab.tabid, data.type)
  }
  /**
   * Invokes for the first time RetroTxt in browser tab.
   * @param [tabId=0] id of the tab
   * @param [pageEncoding=``] optional, text character encoding
   */
  invoke(tabId = 0, pageEncoding = ``) {
    const lastError = () => {
      console.error(
        `WebExtension.invoke() aborted for tab #%s\nReason: %s`,
        tabId,
        chrome.runtime.lastError.mess
      )
    }
    // Firefox doesn't support background.persistent and the manifest returns null
    // the runtime.lastError checks are only needed when background.persistent is true otherwise they will throw false positives
    const persistent =
      chrome.runtime.getManifest().background.persistent || false
    // execute RetroTxt
    chrome.tabs.executeScript(
      tabId,
      {
        file: `/scripts/functions.js`,
        runAt: `document_start`
      },
      () => {
        if (persistent && typeof chrome.runtime.lastError !== `undefined`)
          return lastError()
        // automatic invocation that will be run after this eventpage.js page is loaded and at the start of the document
        chrome.tabs.executeScript(tabId, {
          code: `BusySpinner()`,
          runAt: `document_start`
        })
      }
    )
    chrome.tabs.executeScript(
      tabId,
      {
        file: `/scripts/parse_ansi.js`,
        runAt: `document_start`
      },
      () => {
        if (persistent && typeof chrome.runtime.lastError !== `undefined`)
          return lastError()
      }
    )
    chrome.tabs.executeScript(
      tabId,
      {
        file: `/scripts/parse_dos.js`,
        runAt: `document_start`
      },
      () => {
        if (persistent && typeof chrome.runtime.lastError !== `undefined`)
          return lastError()
      }
    )
    chrome.tabs.executeScript(
      tabId,
      {
        file: `/scripts/retrotxt.js`,
        runAt: `document_start`
      },
      () => {
        if (persistent && typeof chrome.runtime.lastError !== `undefined`)
          return lastError()
        // automatic execute, has to be run after retrotxt.js is loaded
        chrome.tabs.executeScript(
          tabId,
          {
            code: `InvokeRetroTxt(${tabId},"${pageEncoding.toUpperCase()}")`,
            runAt: `document_idle`
          },
          () => {
            if (persistent && typeof chrome.runtime.lastError !== `undefined`)
              return lastError()
          }
        )
      }
    )
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
    // browser_action: tool bar button
    // page: right click on the body of the web page / text file
    this.contexts = [`browser_action`, `page`]
    // these are URL patterns that will trigger the menus to avoid inappropriate reveals on system tabs ie on chrome://extensions/
    this.urlPatterns = [`http://*/*`, `https://*/*`, `file:///*`]
    // context menu titles
    this.titles = new Map()
      .set(`textOrder`, [
        `textFontInformation`,
        `textCenterAlignment`,
        `textBgScanlines`
      ])
      .set(`codeOrder`, [
        `browserGuess➡`,
        `cp_1252➡`,
        `iso_8859_15➡`,
        `us_ascii➡`,
        `cp_1252`,
        `iso_8859_5`
      ])
      .set(`linux`, `Terminal dark`)
      .set(`windows`, `Terminal light`)
      .set(`ibmps2`, `IBM PS/2`)
      .set(`msdos`, `IBM PC`)
      .set(`amiga`, `Amiga`)
      .set(`appleii`, `Apple II`)
      .set(`atarist`, `Atari ST`)
      .set(`c64`, `Commodore 64`)
      .set(`textBgScanlines`, `Scanlines`)
      .set(`textCenterAlignment`, `Text alignment`)
      .set(`textFontInformation`, `Text + font information`)
      .set(`browserGuess➡`, `Automatic`)
      .set(`cp_1252`, `CP-1252 ↻`) // ↺
      .set(`cp_1252➡`, `CP-1252`) // ↻
      .set(`iso_8859_5`, `ISO 8859-5 ↻`) // ↺
      .set(`iso_8859_15➡`, `ISO 8859-15`) // ↻
      .set(`us_ascii➡`, `US-ASCII`) // ↻
    // font and colour themes
    this.themes = new Map()
      .set(`order`, [
        `linux`,
        `windows`,
        `ibmps2`,
        `msdos`,
        `amiga`,
        `appleii`,
        `atarist`,
        `c64`
      ])
      .set(`amiga`, [`topaza500`, `theme-amiga`])
      .set(`appleii`, [`appleii`, `theme-appleii`])
      .set(`atarist`, [`atarist`, `theme-atarist`])
      .set(`c64`, [`c64`, `theme-c64`])
      .set(`ibmps2`, [`iso8`, `theme-msdos`])
      .set(`linux`, [`monospace`, `theme-msdos`])
      .set(`msdos`, [`vga8`, `theme-msdos`])
      .set(`windows`, [`monspace`, `theme-windows`])
    // create a set of theme ids aka `theme-amiga`, `theme-appleii` ...
    this.themeIds = new Set()
    this.themes.forEach((value, key) => {
      if (key === `order`) return
      if (value.length < 2) return
      this.themeIds.add(value[0])
    })
  }
  itemDisplay() {
    chrome.contextMenus.create({
      title: `Display`,
      contexts: this.contexts,
      documentUrlPatterns: this.urlPatterns,
      id: `displaysub`
    })
    // generate `Display` child items
    for (const id of this.titles.get(`textOrder`)) {
      // determine checked state
      let checkedItem = false
      if (`${localStorage.getItem(id)}` === `true`) checkedItem = true
      chrome.contextMenus.create({
        type: `checkbox`,
        checked: checkedItem,
        title: this.titles.get(id),
        contexts: this.contexts,
        id: id,
        parentId: `displaysub`,
        documentUrlPatterns: this.urlPatterns
      })
    }
  }
  itemHelpAction() {
    chrome.contextMenus.create({
      title: `Help`,
      contexts: [`browser_action`],
      documentUrlPatterns: this.urlPatterns,
      id: `helpbrowser`
    })
  }
  itemHelpPage() {
    chrome.contextMenus.create({
      title: `Help`,
      contexts: [`page`],
      documentUrlPatterns: this.urlPatterns,
      id: `helppage`
    })
  }
  itemOptions() {
    chrome.contextMenus.create({
      title: `Options`,
      contexts: [`page`],
      documentUrlPatterns: this.urlPatterns,
      id: `options`
    })
  }
  /**
   * Inserts a line divider into the context menu.
   * @param [id=1] unique id to assign the separator
   * @param [targets=[`page`]] array of contexts in which to display (see this.contexts)
   */
  itemSeparator(id = 1, targets = [`page`]) {
    chrome.contextMenus.create({
      type: `separator`,
      contexts: targets,
      id: `sep${id}`,
      documentUrlPatterns: this.urlPatterns
    })
  }
  itemThemes() {
    let storedItem = `${localStorage.getItem(`retroColor`)}`
    if (storedItem === `null`) {
      const reset = new OptionsReset()
      storedItem = `theme-${reset.get(`retroColor`)}`
    }
    let otherItem = true
    for (const id of this.themes.get(`order`)) {
      let checkedItem = false
      if (id === `-`) this.itemSeparator()
      else {
        // determine checked state
        if (`${storedItem}` === `theme-${id}`) {
          checkedItem = true
          otherItem = false
        }
        chrome.contextMenus.create({
          type: `radio`,
          contexts: [`page`],
          checked: checkedItem,
          title: this.titles.get(id),
          id: id,
          documentUrlPatterns: this.urlPatterns
        })
      }
    }
    // append a radio placeholder for other colour/font combinations
    chrome.contextMenus.create({
      enabled: otherItem,
      type: `radio`,
      contexts: [`page`],
      checked: otherItem,
      title: `other`,
      id: `no-theme`,
      documentUrlPatterns: this.urlPatterns
    })
  }
  itemTranscode() {
    chrome.contextMenus.create({
      title: `Transcode text`,
      contexts: this.contexts,
      documentUrlPatterns: this.urlPatterns,
      id: `transcode`
    })
    // generate `Transcode text` child items
    for (const id of this.titles.get(`codeOrder`)) {
      // only type `normal` works correctly with this menu as the transcode configuration is a per-tab configuration while these
      // context menus apply to all tabs
      chrome.contextMenus.create({
        type: `normal`,
        title: this.titles.get(id),
        contexts: this.contexts,
        id: id,
        parentId: `transcode`,
        documentUrlPatterns: this.urlPatterns
      })
    }
  }
  /**
   * Creates the context menus used on pages and on the task bar button.
   */
  async create() {
    // remove any existing menus to avoid undetected errors in any callbacks
    chrome.contextMenus.removeAll()
    //  Firefox imposes a 6 item limit for `browser_action` and `page_action` contexts
    //  see: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/menus/ContextType
    this.itemOptions()
    this.itemHelpAction()
    this.itemDisplay()
    this.itemSeparator(1)
    this.itemTranscode()
    if (FindEngine() === `gecko`) {
      // `browser_action` context creates an unintentional double separator in Firefox, so only use it with `page`
      this.itemSeparator(2)
    } else {
      this.itemSeparator(2, this.contexts)
    }
    this.itemThemes()
    this.itemSeparator(3)
    this.itemHelpPage()
  }
  /**
   * Handles the results after a menu item is clicked.
   * @param [id=``] id of the menu item that was clicked
   * @param [tab={}] tab details where the click took place (tabs.Tab)
   */
  async event(id = ``, tab = {}) {
    const autorun = localStorage.getItem(`runWebUrls`)
    switch (id) {
      case `options`:
        chrome.runtime.openOptionsPage()
        break
      case `textFontInformation`:
      case `textCenterAlignment`:
      case `textBgScanlines`: {
        this.newOption(id)
        break
      }
      case `amiga`:
      case `appleii`:
      case `atarist`:
      case `c64`:
      case `ibmps2`:
      case `linux`:
      case `msdos`:
      case `windows`: {
        this.newTheme(id)
        break
      }
      case `cp_1252`:
      case `iso_8859_5`:
      case `browserGuess➡`:
      case `iso_8859_15➡`:
      case `us_ascii➡`:
      case `cp_1252➡`: {
        // see handleMessages() in retrotxt.js for the event handler
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
          chrome.tabs.sendMessage(
            tabs[0].id,
            {
              action: id,
              id: `transcode`
            },
            () => {
              // save a session item to tell RetroTxt how to render the text on this tab. session storage is isolated to the one active tab
              sessionStorage.setItem(`transcode`, id)
            }
          )
        })
        break
      }
      case `helpbrowser`:
      case `helppage`: {
        chrome.tabs.create({ url: chrome.i18n.getMessage(`url_help`) })
        break
      }
    }
    // if a theme option is clicked while viewing the browser default text then also apply the new theme
    if (typeof autorun !== `string` || autorun === `false`) {
      const extension = new WebExtension()
      switch (id) {
        case `msdos`:
        case `windows`:
        case `amiga`:
        case `appleii`:
        case `atarist`:
        case `c64`:
        case `ibmps2`:
        case `linux`:
          return extension.invoke(null, tab)
      }
    }
  }
  /**
   * Toggles checked for all context menu tabs for both checkboxes and radios.
   * @param [menuId=``] menu item id
   * @param [checked=true] toggle checkbox, either `true` to check or `false` to un-check
   */
  itemChecked(menuId = ``, checked = true) {
    if (typeof menuId !== `string`) CheckArguments(`menuId`, `string`, menuId)
    if (menuId.length < 1) CheckRange(`menuId`, `length`, `1`, menuId.length)
    if (typeof checked !== `boolean`)
      CheckArguments(`checked`, `boolean`, checked)
    chrome.contextMenus.update(menuId, { checked: checked })
  }
  /**
   * Switches the RetroTxt font and colour theme.
   * @param [theme=``] name of the theme
   */
  newTheme(theme = ``) {
    if (typeof theme !== `string`) CheckArguments(`theme`, `string`, theme)
    if (theme.length < 1) CheckRange(`theme`, `length`, `1`, theme.length)
    const style = this.themes.get(theme)
    if (typeof style !== `object`)
      return CheckError(`Theme name "${theme}" could not be found in themes().`)
    localStorage.setItem(`retroFont`, style[0])
    localStorage.setItem(`retroColor`, style[1])
    chrome.storage.local.set({ retroFont: `${style[0]}` })
    chrome.storage.local.set({ retroColor: `${style[1]}` })
    // remove any existing theme menu check-marks
    for (const id of this.themes.get(`order`)) {
      if (id === `-`) continue
      if (theme !== id) this.itemChecked(id, false)
    }
    // add new check-mark
    this.itemChecked(theme, true)
  }
  /**
   * Switches Options using the content menu.
   * Only options with boolean toggles (on/off) are supported.
   * @param [key=``] name of the storage item to change.
   */
  newOption(key = ``) {
    if (typeof key !== `string`) CheckArguments(`key`, `string`, key)
    if (key.length < 1) CheckRange(`key`, `length`, `1`, key.length)
    const newValue = () => {
      const extension = new WebExtension()
      switch (localStorage.getItem(key)) {
        case `true`:
          return false
        case `false`:
          return true
        default:
          // no existing local storage for setting
          return extension.defaults.get(key)
      }
    }
    const value = newValue()
    // create and save setting object to local storage
    const setting = { [key]: value }
    // localStorage value must be a string
    localStorage.setItem(key, `${value}`)
    chrome.storage.local.set(setting)
    // update any context menus to apply
    this.itemChecked(key, value)
  }
  /**
   * Unlock the Transcode text context menu
   */
  enableTranscode() {
    chrome.contextMenus.update(`transcode`, {
      enabled: true
    })
  }
}

// self-invoking expressions that run after this page is loaded by the browser
(() => {
  // exit if running a qunit test
  if (typeof qunit !== `undefined`) return
  // browser failure
  if (chrome === undefined) {
    CheckError(
      `RetroTxt failed to run because the browser's WebExtension API did not load! Please close this browser and try again.`
    )
  }
  // detect developer mode
  if (`management` in chrome) {
    chrome.management.getSelf(info => {
      switch (info.installType) {
        // the add-on was installed unpacked from disk
        case `development`:
          console.info(`Development RetroTxt method detected.`)
          RetroTxt.developer = true
          break
        case `admin`: // the add-on was installed because of an administrative policy
        case `normal`: // the add-on was installed normally from an install package
        case `sideload`: // the add-on was installed by some other software on the user's computer
        case `other`: // the add-on was installed in some other way
          break
      }
    })
  }
  // browser tabs
  const tabs = new Tabs()
  tabs.listen()
  // context menus
  const menu = new Menu()
  if (menu.support === true) menu.create()
  //  extension post install behaviour
  const extension = new WebExtension()
  chrome.runtime.onInstalled.addListener(details => {
    extension.initialize(details)
  })
  // listen for and handle messages from content scripts
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (RetroTxt.developer)
      console.log(`✉ Received by runtime.onMessage.addListener().\n`, sender)
    const key = Object.entries(message)[0][0]
    const value = Object.entries(message)[0][1]
    const downloads = new Downloads()
    switch (key) {
      case `askForSettings`:
        sendResponse({ response: extension.defaults })
        if (RetroTxt.developer)
          console.log(
            `✉ 'askForSettings' message request WebExtension().defaults response sent.`
          )
        break
      case `invoked`:
        if (RetroTxt.developer)
          console.log(`✉ Received invoke %s request.`, value)
        if (!(`tab` in sender)) return
        else {
          const tabId = sender.tab.id
          if (value === false) {
            const extension = new WebExtension()
            extension.invoke(
              tabId,
              `${sessionStorage.getItem(`tab${tabId}encoding`)}`
            )
          } else if (value === true) {
            chrome.tabs.sendMessage(tabId, { id: `toggle` })
          }
        }
        break
      case `monitorDownloads`:
        if (RetroTxt.developer)
          console.log(`✉ Received invoke %s request.`, value)
        downloads.listen(value)
        break
      case `retroTxtified`:
        if (!(`tab` in sender)) return
        else {
          if (RetroTxt.developer)
            console.log(`✉ Received retroTxtified %s request.`, value)
          const tabId = sender.tab.id
          const button = new ToolbarButton(tabId, message.retroTxtified)
          if (value === true) button.enable()
          if (value === false) button.disable()
          break
        }
      case `transcode`:
        if (RetroTxt.developer)
          console.log(
            `✉ Received transcode request to select '$%s'.`,
            message.transcode
          )
        chrome.contextMenus.update(message.transcode, { checked: true })
        break
      default:
        if (!RetroTxt.developer) return
        console.group(`✉ Unexpected message.`)
        console.log(message)
        console.log(sender)
        console.groupEnd()
    }
  })
  // browser tab activated listener
  chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.get(activeInfo.tabId, tab => {
      const action = new Action(tab.id, tab)
      action.activated()
    })
  })
  // browser action (tool bar button) click event
  chrome.browserAction.onClicked.addListener(tab => {
    const action = new Action(tab.id, tab)
    action.browserAction()
  })
  // file downloads event listeners
  const downloads = new Downloads()
  downloads.listen()
  // monitor saved changes to Options, so the context menu can be updated
  const storage = new Storage()
  chrome.storage.onChanged.addListener((changes, areaName) => {
    storage.event(changes, areaName)
  })
  // context menus clicked event
  if (`onClicked` in chrome.contextMenus) {
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      menu.event(info.menuItemId, tab)
    })
  }
  // initialisation of storage and generate context menu on browser launch and extension load
  const browserEngine = FindEngine()
  console.info(
    `RetroTxt is being initialised for the %s%s engine.`,
    browserEngine.charAt(0).toUpperCase(),
    browserEngine.slice(1)
  )
})()
