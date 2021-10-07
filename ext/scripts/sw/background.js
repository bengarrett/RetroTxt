// Replacement service worker with no DOM access
/*global CheckError ConsoleLoad Downloads Extension Menu WebBrowser Developer
Chrome Firefox */

importScripts(
  "action.js",
  "downloads.js",
  "error.js",
  "extension.js",
  "helpers.js",
  "message.js",
  "menu.js",
  //"omnibox.js", todo: This is currently broken
  "security.js",
  "storage.js",
  "tabs.js",
  "toolbar.js"
)

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`background`)
})

// Listeners must be registered synchronously from the start of the page.

// runtime onInstall ...
chrome.runtime.onInstalled.addListener((details) => {
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
          return chrome.storage.local.set({ [Developer]: true })
        case `admin`: // the add-on was installed because of an administrative policy
        case `normal`: // the add-on was installed normally from an install package
        case `sideload`: // the add-on was installed by some other software on the user's computer
        case `other`: // the add-on was installed in some other way
          return chrome.storage.local.remove(Developer)
      }
    })
  }

  new Menu().create()

  // omnibox
  // new Omnibox().initialize()

  // post install behaviour
  new Extension().initialize(details)

  // TODO: break into events?
  // file downloads event listeners
  new Downloads().listen()

  // initialisation of storage plus generate context menu on browser launch and
  // extension load
  switch (WebBrowser()) {
    case Chrome:
      console.info(`RetroTxt initialisation for the Chromium engine.`)
      break
    case Firefox:
      console.info(`RetroTxt initialisation for the Firefox engine.`)
      break
  }
})
