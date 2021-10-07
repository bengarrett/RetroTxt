// Replacement service worker with no DOM access
/*global CheckError ConsoleLoad Downloads Extension Menu Omnibox WebBrowser
Chrome Developer Firefox */

importScripts(
  "action.js",
  "downloads.js",
  "error.js",
  "extension.js",
  "helpers.js",
  "message.js",
  "menu.js",
  "omnibox.js",
  "security.js",
  "storage.js",
  "tabs.js",
  "toolbar.js"
)

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`background`)
})

// runtime.onInstalled is fired when the extension is first installed,
// when the extension is updated to a new version,
// and when Chrome is updated to a new version.
//
// details.id indicates the ID of the imported shared module extension.
// details.previousVersion indicates the previous version of the extension.
// details.reason is the reason the event is dispatched.
chrome.runtime.onInstalled.addListener((details) => {
  if (typeof qunit !== `undefined`) return

  if (chrome === undefined)
    return CheckError(
      `RetroTxt failed to run because the Extension API did not load!` +
        ` Please close this browser and try again.`,
      true
    )

  if (`management` in chrome) devMode()

  new Extension().initialize(details)

  startup()
})

// runtime.onStartup is fired when a profile that has this extension installed first starts up.
// This event is not fired when an incognito profile is started.
chrome.runtime.onStartup.addListener(startup)

// Startup RetroTxt for both onStartup and onInstalled.
function startup() {
  new Menu().startup()

  new Omnibox().startup()

  new Downloads().startup()

  switch (WebBrowser()) {
    case Chrome:
      console.info(`RetroTxt startup for the Chromium engine.`)
      break
    case Firefox:
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
