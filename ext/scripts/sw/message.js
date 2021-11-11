// filename: sw/message.js
//
/*global ConsoleLoad Downloads Extension GetCurrentTab SessionKey SetToolbarIcon ToolbarButton */

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`message.js`)
})

// Service worker listener to handle long-lived connections for updates sent from the content scripts.
chrome.runtime.onConnect.addListener((port) => {
  const developerMode = true
  port.onMessage.addListener((message) => {
    if (typeof message.tabID === `number`) {
      if (developerMode)
        console.log(
          `✉ long-lived message received to toggle tab ID #${message.tabID}.`
        )
      tabInvoke(developerMode, message)
      return
    }
    if (typeof message.tabModified === `boolean`) {
      buttonInvoke(developerMode, message)
      return
    }
  })
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
    case `monitorDownloads`:
      monitorDownloads(developerMode, message)
      return asynchronous
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

function monitorDownloads(developerMode, message) {
  const value = Object.entries(message)[0][1]
  if (developerMode) console.log(`✉ monitor-downloads %s command.`, value)
  new Downloads().startup(value)
}

function buttonInvoke(developerMode, message) {
  const button = new ToolbarButton(),
    value = message.tabModified
  GetCurrentTab().then((result) => {
    if (developerMode)
      console.log(`✉ tabModified tab #%s is %s command.`, result.id, value)
    if (typeof result.id !== `number`) return
    button.id = result.id
    if (value === true) button.enable()
    else button.disable()
  })
}

function tabInvoke(developerMode, message) {
  if (developerMode)
    console.log(`✉ invoked tab #%s is %s command.`, message.tabID, message.init)
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
