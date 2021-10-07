// filename: sw/message.js
//
/*global ConsoleLoad CheckLastError Developer Downloads Extension ToolbarButton */

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`message.js`)
})

// runtime onMessage ... TODO move to message.js
// listen to and handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  let DeveloperMode = false
  chrome.storage.local.get(Developer, (store) => {
    if (Developer in store) {
      DeveloperMode = true
      console.log(`✉ Received by runtime.onMessage.addListener().\n`, sender)
    }
  })
  const button = new ToolbarButton(),
    extension = new Extension(),
    key = Object.entries(message)[0][0],
    value = Object.entries(message)[0][1],
    tabId = sender.tab.id
  switch (key) {
    case `askForSettings`:
      sendResponse({ response: extension.defaults })
      if (DeveloperMode)
        console.log(
          `✉ 'askForSettings' message request Extension().defaults response sent.`
        )
      return
    case `darkMode`:
      chrome.action.setIcon({
        path: {
          16: "assets/retrotxt_16-light.png",
          19: "assets/retrotxt_19-light.png",
          32: "assets/retrotxt_32-light.png",
          38: "assets/retrotxt_38-light.png",
          48: "assets/retrotxt_48-light.png",
          128: "assets/retrotxt_128-light.png",
        },
      })
      if (DeveloperMode)
        console.log(
          `✉ 'darkMode' Received Chrome specific, dark mode set icon request.`
        )
      return
    case `invoked`:
      if (DeveloperMode) console.log(`✉ Received invoke %s request.`, value)
      if (!(`tab` in sender)) return
      if (value === false) {
        const extension = new Extension()
        extension.invokeOnTab(
          tabId,
          `${sessionStorage.getItem(`tab${tabId}encoding`)}`
        )
      }
      if (value === true)
        chrome.tabs.sendMessage(tabId, { id: `toggle` }, () => {
          if (CheckLastError(`invoked tabs send message`)) return
        })
      return
    case `monitorDownloads`:
      if (DeveloperMode) console.log(`✉ Received invoke %s request.`, value)
      return new Downloads().startup(value)
    case `retroTxtified`:
      if (!(`tab` in sender)) return
      if (DeveloperMode)
        console.log(`✉ Received retroTxtified %s request.`, value)
      button.id = tabId
      if (value === true) button.enable()
      if (value === false) button.disable()
      return
    case `transcode`:
      if (DeveloperMode)
        console.log(
          `✉ Received transcode request to select '$%s'.`,
          message.transcode
        )
      return chrome.contextMenus.update(message.transcode, { checked: true })
    default:
      if (DeveloperMode) {
        console.group(`✉ Unexpected message.`)
        console.log(message)
        console.log(sender)
        return console.groupEnd()
      }
  }
})
