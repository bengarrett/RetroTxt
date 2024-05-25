// File: scripts/sw/background.js
//
// Service workers replace background pages that make the code more modular.
// They are event based, and like event pages they do not persist between invocations.
// Each of these helpers have their own event listeners.
// Gotchas: Service workers must be registered at root level:
// they cannot be in a nested directory.

importScripts(
  "downloads.js",
  "error.js",
  "extension.js",
  "helpers.js",
  "message.js",
  "menu.js",
  "omnibox.js",
  "security.js",
  "session.js",
  "storage.js",
  "tabs.js",
  "toolbar.js",
)

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`background`)
})

// runtime.onInstalled is fired when
// 1) the extension is first installed
// 2) the extension is updated to a new version
// 3) Chrome is updated to a new version
//
// details.id indicates the ID of the imported shared module extension.
// details.previousVersion indicates the previous version of the extension.
// details.reason is the reason the event is dispatched.
chrome.runtime.onInstalled.addListener((details) => {
  if (typeof qunit !== `undefined`) return
  if (typeof chrome === `undefined`)
    return CheckError(
      `RetroTxt failed to run because the Extension API did not load!` +
        ` Please close this browser and try again.`,
      true,
    )
  if (`management` in chrome) devMode()
  new Extension().install(details)
  startup()
})

// runtime.onStartup is fired when a profile that has this extension installed first starts up.
// This event is not fired when an incognito profile is started.
chrome.runtime.onStartup.addListener(startup)

// Startup RetroTxt for both onStartup and onInstalled events.
function startup() {
  setPlatform()

  new Menu().startup()
  new Omnibox().startup()
  new Downloads().startup()

  switch (WebBrowser()) {
    case Engine.chrome:
      console.info(`RetroTxt startup for the Chromium engine.`)
      break
    case Engine.firefox:
      console.info(`RetroTxt startup for the Firefox engine.`)
      break
  }
}

// Detect the browser Developer mode.
function devMode() {
  chrome.management.getSelf((info) => {
    switch (info.installType) {
      // the add-on was installed unpacked from disk
      case `development`:
        console.info(`Development RetroTxt method detected.`)
        return chrome.storage.local.set({ [Developer]: true })
      case `admin`: // the add-on was installed because of an administrative policy
      case `normal`: // the add-on was installed normally from an install package
      case `sideload`: // the add-on was installed by some other software on the user's computer
      case `other`: // the add-on was installed in some other way
        return chrome.storage.local.remove(Developer)
    }
  })
}

// Save the platform code so it can be used with content-scripts.
// Previously the deprecated `Navigator.platform` method was used.
function setPlatform() {
  chrome.runtime.getPlatformInfo((info) => {
    const windows = `win`,
      macOS = `mac`
    let store
    switch (info.os) {
      case windows:
        store = Os.windows
        break
      case macOS:
        store = Os.macOS
        break
      default:
        // Android, ChromeOS, Linux, FreeBSD
        store = Os.linux
        break
    }
    chrome.storage.local.set({ [`platform`]: store })
  })
}

/* global importScripts CheckError ConsoleLoad Developer Downloads Engine Extension Menu Omnibox Os WebBrowser */
