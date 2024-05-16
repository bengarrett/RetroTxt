// File: scripts/sw/extension.js
//
// RetroTxt initialisation, defaults and activation.

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`extension.js`)
})

/**
 * Extension initialisation, defaults and activation.
 * @class Extension
 */
// eslint-disable-next-line no-unused-vars
class Extension {
  constructor() {
    this.defaults = new OptionsReset().options
  }
  /**
   * Initialise RetroTxt after it is first installed or updated.
   * @param details
   */
  install(details) {
    console.log(`Reticulating splines.`)
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
              chrome.storage.local.set({ [`optionTab`]: `0` })
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
   * @param [tab={}] Tab object
   * @param [blob] Optional fetch API data blob
   */
  activateTab(tab = {}, blob) {
    let data = blob
    if (typeof data === `undefined` || data === null || !(`type` in data))
      data = { type: `unknown` }
    // is the tab hosting a text file and what is the tab page encoding?
    SessionNew(tab.tabid, data)
    // if the tab has previously been flagged as 'do not autorun' then finish up
    const key = `${SessionKey}${tab.tabid}`
    chrome.storage.local.get(`${key}`, (store) => {
      const textfile = Object.values(store)[0].textfile
      if (!textfile) return
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
    const lastErrorCallback = () => {
      if (typeof chrome.runtime.lastError === `undefined`) return false
      if (typeof chrome.runtime.lastError.message === `undefined`) return false
      if (chrome.runtime.lastError.message === ``) return false
      console.error(
        `Extension.invokeOnTab() aborted for tab #%s\nReason: %s`,
        tabId,
        chrome.runtime.lastError.message,
      )
      return true
    }
    // first, load the helper script for shared functions
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
            if (lastErrorCallback()) return
          },
        )
      },
    )
    // then, load the other required scripts
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        files: [
          `scripts/encoding.js`,
          `scripts/checks.js`,
          `scripts/parse_ansi.js`,
          `scripts/parse_dos.js`,
        ],
      },
      () => {
        if (lastErrorCallback()) return
      },
    )
    // dependency scripts
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        files: [
          `js/linkify.js`,
          `js/linkify-element.js`,
          `js/linkify-plugin-ip.js`,
          `js/purify.js`,
        ],
      },
      () => {
        if (lastErrorCallback()) return
      },
    )
    // finally, load and run retrotxt.js
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        files: [`scripts/retrotxt.js`],
      },
      () => {
        if (lastErrorCallback()) return
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
            if (lastErrorCallback()) return
          },
        )
      },
    )
  }
}

/*global ConsoleLoad LocalStore SessionNew OptionsReset SessionKey */
