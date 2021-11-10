// filename: sw/message.js
//
/*global ConsoleLoad CheckLastError Downloads Extension SessionKey SetToolbarIcon ToolbarButton */

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`message.js`)
})

// Service worker listener to handle long-lived connections for updates sent from the content scripts.
chrome.runtime.onConnect.addListener((port) => {
  console.log(`on connect:`)
  console.log(port)
})

// Service worker listener to handle one-time commands sent from the content scripts.
// Each key will only toggle once, afterwards a 'The message port closed before a response was received'
// message will be returned.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const key = Object.entries(message)[0][0],
    value = Object.entries(message)[0][1],
    asynchronous = true,
    synchronous = false,
    developerMode = true // for performance, do not use chrome.storage.local.get(Developer)
  if (developerMode)
    console.log(`✉ one-time command received: ${key}, request: ${value}`)
  switch (key) {
    case `askForSettings`:
      askForSettings(developerMode, sendResponse)
      return synchronous
    case `invoked`:
      // TODO: not working?
      // This needs to be replaced by a long-lived connection?
      invoked(developerMode, message, sender)
      return asynchronous
    case `monitorDownloads`:
      monitorDownloads(developerMode, message)
      return asynchronous
    case `retroTxtified`:
      retroTxtified(developerMode, message, sender)
      return synchronous
    case `setIcon`:
      SetToolbarIcon(value)
      sendResponse(`Toolbar icon applied`)
      return asynchronous
    case `transcode`:
      // TODO: not working?
      // This needs to be replaced by a long-lived connection?
      transcode(developerMode, message)
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
    console.log(`✉ ask-for-settings extension defaults response sent.`)
}

function invoked(developerMode, message, sender) {
  const tabId = sender.tab.id,
    value = Object.entries(message)[0][1]
  if (developerMode)
    console.log(`✉ invoked tab #%s is %s command.`, tabId, value)
  if (!(`tab` in sender)) return
  if (value === false) {
    const extension = new Extension(),
      key = `${SessionKey}${tabId}`
    chrome.storage.local.get(key, (result) => {
      extension.invokeOnTab(tabId, `${result.encoding}`)
    })
  }
  if (value === true)
    chrome.tabs.sendMessage(tabId, { id: `toggle` }, () => {
      if (CheckLastError(`invoked tabs send message`)) return
    })
}

function monitorDownloads(developerMode, message) {
  const value = Object.entries(message)[0][1]
  if (developerMode) console.log(`✉ monitor-downloads %s command.`, value)
  new Downloads().startup(value)
}

function retroTxtified(developerMode, message, sender) {
  const button = new ToolbarButton(),
    tabId = sender.tab.id,
    value = Object.entries(message)[0][1]
  if (!(`tab` in sender)) return
  if (developerMode)
    console.log(`✉ retroTxtified tab #%s is %s command.`, tabId, value)
  button.id = tabId
  if (value === true) button.enable()
  if (value === false) button.disable()
}

function transcode(developerMode, message) {
  if (developerMode)
    console.log(
      `✉ transcode context menu update command '$%s'.`,
      message.transcode
    )
  chrome.contextMenus.update(message.transcode, { checked: true })
}

function unexpected(developerMode, message, sender) {
  if (!developerMode) return
  console.group(`✉ Unexpected message?`)
  console.log(message)
  console.log(sender)
  console.groupEnd()
}
