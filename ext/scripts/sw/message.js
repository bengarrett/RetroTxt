// File: scripts/sw/message.js
//
// Make service worker connections that can receive commands from the container-scripts.

// For performance a bool const is used instead of chrome.storage.local.
const developerMode = false

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`message.js`)
})

// Service worker listener to handle long-lived connections for updates sent from the content scripts.
chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((message) => {
    if (typeof message.tabID === `number`) {
      if (developerMode)
        console.log(
          `✉ Long-lived message received to toggle tab ID #${message.tabID}.`
        )
      tabInvoke(developerMode, message)
      return
    }
    if (typeof message.tabModified === `boolean`) {
      // This used to run: buttonInvoke(developerMode, message)
      // The tabModified message could probably be removed at a later date.
      return
    }
    if (typeof message.openOptionsPage === `boolean`) {
      if (message.openOptionsPage) chrome.runtime.openOptionsPage()
      return
    }
    unexpected(developerMode, message)
  })
})

// Service worker listener to handle one-time commands sent from the content scripts.
// Each key will only toggle once, afterwards a 'The message port closed before a response was received'
// message will be returned.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const key = Object.entries(message)[0][0],
    value = Object.entries(message)[0][1],
    asynchronous = true,
    synchronous = false
  if (developerMode)
    console.log(`✉ One-time command received: ${key}, request: ${value}`)
  switch (key) {
    case `askForSettings`:
      askForSettings(developerMode, sendResponse)
      return synchronous
    case `monitorDownloads`:
      monitorDownloads(developerMode, message)
      return asynchronous
    case `setIcon`:
      SetToolbarIcon(value)
      sendResponse(`Toolbar icon applied`)
      return asynchronous
    default:
      unexpected(developerMode, message, sender)
      return synchronous
  }
})

function askForSettings(developerMode, sendResponse) {
  const extension = new Extension()
  sendResponse({ response: extension.defaults })
  if (developerMode)
    console.log(`✉ Ask-for-settings extension defaults response sent.`)
}

function monitorDownloads(developerMode, message) {
  const value = Object.entries(message)[0][1]
  if (developerMode) console.log(`✉ Monitor-downloads %s command.`, value)
  new Downloads().startup(value)
}

function tabInvoke(developerMode, message) {
  if (developerMode)
    console.log(`✉ Invoked tab #%s is %s command.`, message.tabID, message.init)
  if (!(`init` in message)) return
  if (message.init === false) {
    const extension = new Extension(),
      key = `${SessionKey}${message.tabID}`
    chrome.storage.local.get(key, (result) => {
      extension.invokeOnTab(message.tabID, `${result.encoding}`)
    })
  }
  if (message.init === true) {
    const port = chrome.tabs.connect(message.tabID, { name: `tabInvoke` })
    port.postMessage({ toggleTab: message.tabID })
    return
  }
}

function unexpected(developerMode, message, sender) {
  if (!developerMode) return
  console.group(`✉ Unexpected message?`)
  console.log(message)
  if (typeof sender !== `undefined`) console.log(sender)
  console.groupEnd()
}

/* global ConsoleLoad Downloads Extension SessionKey SetToolbarIcon */
