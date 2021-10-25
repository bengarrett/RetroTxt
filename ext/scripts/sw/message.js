// filename: sw/message.js
//
/*global ConsoleLoad CheckLastError Developer Downloads Extension SessionKey SetToolbarIcon ToolbarButton */

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`message.js`)
})

// runtime onMessage to listen for and handle command messages from content scripts.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const key = Object.entries(message)[0][0]
  let DeveloperMode = false
  chrome.storage.local.get(Developer, (store) => {
    if (Developer in store) {
      DeveloperMode = true
      console.log(
        `✉ Received by runtime.onMessage.addListener(). key: ${key}
message: `,
        message
      )
    }
  })
  switch (key) {
    case `askForSettings`:
      return askForSettings(DeveloperMode, sendResponse)
    case `invoked`:
      return invoked(DeveloperMode, message, sender)
    case `monitorDownloads`:
      return monitorDownloads(DeveloperMode, message)
    case `retroTxtified`:
      return retroTxtified(DeveloperMode, message, sender)
    case `setIcon`:
      return SetToolbarIcon(message[key])
    case `transcode`:
      return transcode(DeveloperMode, message)
    default:
      return defaultCase(DeveloperMode, message, sender)
  }
})

function askForSettings(developerMode, sendResponse) {
  const extension = new Extension()
  sendResponse({ response: extension.defaults })
  if (developerMode)
    console.log(
      `✉ 'askForSettings' message request Extension().defaults response sent.`
    )
}

function invoked(developerMode, message, sender) {
  const tabId = sender.tab.id,
    value = Object.entries(message)[0][1]
  if (developerMode) console.log(`✉ Received invoke %s request.`, value)
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
  if (developerMode) console.log(`✉ Received invoke %s request.`, value)
  return new Downloads().startup(value)
}

function retroTxtified(developerMode, message, sender) {
  const button = new ToolbarButton(),
    tabId = sender.tab.id,
    value = Object.entries(message)[0][1]
  if (!(`tab` in sender)) return
  if (developerMode) console.log(`✉ Received retroTxtified %s request.`, value)
  button.id = tabId
  if (value === true) button.enable()
  if (value === false) button.disable()
}

function transcode(developerMode, message) {
  if (developerMode)
    console.log(
      `✉ Received transcode request to select '$%s'.`,
      message.transcode
    )
  return chrome.contextMenus.update(message.transcode, { checked: true })
}

function defaultCase(developerMode, message, sender) {
  if (!developerMode) return
  console.group(`✉ Unexpected message.`)
  console.log(message)
  console.log(sender)
  return console.groupEnd()
}
