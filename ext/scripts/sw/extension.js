// filename: sw/extension.js
//
/*global BrowserOS ConsoleLoad LocalStore Menu ToolbarButton OptionsReset Os */
/*exported Extension */

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`extension.js`)
})

/**
 * Extension initialisation, defaults and activation.
 * @class Extension
 */
class Extension {
  constructor() {
    this.defaults = new OptionsReset().options
  }
  /**
   * Initialise RetroTxt after it is first installed or updated.
   * @param details
   */
  install(details) {
    console.log(`🖫 Reticulating splines.`)

    const checks = [`settingsNewUpdateNotice`]
    const store = new LocalStore()
    store.startup()

    switch (details.reason) {
      case `install`:
        chrome.storage.local.set({ [`optionTab`]: `0` })
        return chrome.tabs.create({
          url: chrome.runtime.getURL(`html/options.html#newinstall`),
        })
      case `update`:
        return chrome.storage.local.get(checks, (results) => {
          results: for (const result of Object.keys(results)) {
            if (result === `settingsNewUpdateNotice`) continue results
            // if any of the redundant checks are set to true, then show the
            // option page
            if (results[result] === true) {
              localStorage.setItem(`optionTab`, `0`)
              chrome.tabs.create({
                url: chrome.runtime.getURL(`html/options.html`),
              })
              return store.clean()
            }
          }
          if (results.settingsNewUpdateNotice === false) return
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
    chrome.storage.local.set({ [`tab${tab.tabid}textfile`]: true })
    chrome.storage.local.set({ [`tab${tab.tabid}encoding`]: data.type })
    chrome.storage.local.remove(`tab${tab.tabid}update`)
    // update the browser tab interface
    new ToolbarButton(tab.tabid).enable()
    new Menu().enableTranscode()
    // if the tab has previously been flagged as 'do not autorun' then finish up
    chrome.storage.local.get(`tab${tab.tabid}execute`, (store) => {
      if (Object.values(store)[0] === `false`) return
      chrome.storage.local.get(`settingsWebsiteDomains`, (store) => {
        if (Object.values(store)[0] === `false`) return
        this.invokeOnTab(tab.tabid, data.type)
      })
    })
  }
  /**
   * Invokes RetroTxt for the first time in the browser tab.
   * @param [tabId=0] Id of the tab
   * @param [pageEncoding=``] Optional text character encoding
   */
  invokeOnTab(tabId = 0, pageEncoding = ``) {
    const persistent =
      chrome.runtime.getManifest().background.persistent || false
    const lastErrorCallback = () => {
      // Chrome lastError callback
      if (persistent) {
        if (chrome.runtime.lastError === `undefined`) return false
        console.error(
          `Extension.invokeOnTab() aborted for tab #%s\nReason: %s`,
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
        `Extension.invokeOnTab() warning for tab #%s\nReason: %s`,
        tabId,
        chrome.runtime.lastError.mess
      )
      return false
    }
    SetToolbarIcon(true)
    // NOTE: As of Oct-2020, scripting.executeScript files[] only support a single entry.
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        files: [`scripts/helpers.js`],
      },
      () => {
        function spin() {
          window.BusySpinner()
        }
        chrome.scripting.executeScript(
          { target: { tabId: tabId }, func: spin },
          () => {
            if (lastErrorCallback(persistent)) return
          }
        )
      }
    )
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        files: [`scripts/encoding.js`],
      },
      () => {
        if (lastErrorCallback(persistent)) return
      }
    )
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        files: [`scripts/checks.js`],
      },
      () => {
        if (lastErrorCallback(persistent)) return
      }
    )
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        files: [`scripts/parse_ansi.js`],
      },
      () => {
        if (lastErrorCallback(persistent)) return
      }
    )
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        files: [`scripts/parse_dos.js`],
      },
      () => {
        if (lastErrorCallback(persistent)) return
      }
    )
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        files: [`scripts/retrotxt.js`],
      },
      () => {
        if (lastErrorCallback(persistent)) return
        function execute(tabId = ``, page = ``) {
          window.Execute(tabId, page)
        }
        chrome.scripting.executeScript(
          {
            target: { tabId: tabId },
            func: execute,
            args: [tabId, pageEncoding.toUpperCase()],
          },
          () => {
            if (lastErrorCallback(persistent)) return
          }
        )
      }
    )
  }
}

/**
 * Changes the Extension icon in the toolbar of Chrome.
 * @param {*} darkMode Use the icon set intended for dark system themes
 */
function SetToolbarIcon(darkMode = false) {
  // Oct 2020: chrome.action.setIcon currently breaks.
  // Uncaught (in promise) TypeError: failureCallback is not a function
  //  at extensions::setIcon:35
  if (darkMode || !darkMode) return

  const os = () => {
    switch (BrowserOS()) {
      case Os.windows:
        return `Windows`
      case Os.macOS:
        return `macOS`
      case Os.linux:
        return `Linux/Unix`
      default:
        return `unknown`
    }
  }
  switch (darkMode) {
    case true:
      console.log(`Chrome thinks the ${os()} system theme is in dark mode.`)
      chrome.action.setIcon(
        {
          path: {
            16: "assets/retrotxt_16-light.png",
            19: "assets/retrotxt_19-light.png",
            32: "assets/retrotxt_32-light.png",
            38: "assets/retrotxt_38-light.png",
            48: "assets/retrotxt_48-light.png",
            128: "assets/retrotxt_128-light.png",
          },
        },
        (x) => {
          console.warn(x)
        }
      )
      return
    default:
      console.log(`Chrome thinks the ${os()} system theme is in light mode.`)
      chrome.action.setIcon({
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
