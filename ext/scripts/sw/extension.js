// filename: sw/extension.js
//
/*global LocalStore Menu ToolbarButton Linux MacOS Windows OptionsReset BrowserOS */
/*exported Extension */

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

    // TODO: requires window access
    // dark mode icons for Chrome
    // in firefox, dark icons are handled by the manifest.json
    // if (WebBrowser() === Chrome) {
    //   // this isn't reliable in Linux
    //   const pcs = matchMedia(`(prefers-color-scheme: dark)`)
    //   if (pcs.matches) this.setToolbarIcon(true)
    //   pcs.addEventListener(`change`, this.setToolbarIcon(pcs.matches))
    // }

    // TODO: LocalStore requires window access
    const storage = new LocalStore()
    storage.initialize()

    const checks = [`settingsNewUpdateNotice`]
    //details.reason = `update`
    switch (details.reason) {
      case `install`:
        // TODO: storage
        //localStorage.setItem(`optionTab`, `0`)
        return chrome.tabs.create({
          url: chrome.runtime.getURL(`html/options.html#newinstall`),
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
                url: chrome.runtime.getURL(`html/options.html`),
              })
              return storage.clean()
            }
          }
          const notice = results.settingsNewUpdateNotice
          if (notice === false) return
          // do not show updated notice
          else
            chrome.tabs.create({
              url: chrome.runtime.getURL(`html/options.html#update`),
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
        return chrome.action.setIcon({
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
        return chrome.action.setIcon({
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
