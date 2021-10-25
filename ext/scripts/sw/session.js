// filename: sw/session.js
//
// This is replicates the feature set that previously used sessionStorage in MV2.
//
/*global CheckError CheckLastError Console ConsoleLoad */
/*exported NewSession NewSessionUpdate RemoveSession SessionKey */

const SessionKey = `_tabSession`

// fired when the extension is installed, or updated
chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`session.js`)
  removeSessions()
})
// fired when a chrome user profile first starts up
chrome.runtime.onStartup.addListener(() => {
  removeSessions()
})
// fired when the extension is unloaded
chrome.runtime.onSuspend.addListener(() => {
  removeSessions()
})
// fired when a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  RemoveSession(tabId)
})

// Create a new session local storage object for the browser tab.
function NewSession(tabID = 0, data) {
  if (data === null || !(`type` in data))
    CheckError(`required data for newSession(${tabID}) session is empty`)
  const key = `${SessionKey}${tabID}`
  const store = {
    execute: true,
    textfile: true,
    encoding: data.type,
    update: 0,
  }
  chrome.storage.local.set({ [key]: store })
  Console(`New session for tab #${tabID}.`)
}

// Create a new session local storage object for the browser tab with an active update value.
function NewSessionUpdate(tabID = 0) {
  const key = `${SessionKey}${tabID}`
  const store = {
    execute: true,
    textfile: true,
    encoding: ``,
    update: 1,
  }
  chrome.storage.local.set({ [key]: store })
  Console(`New session for tab #${tabID}.`)
}

// Remove the session local storage object for the browser tab.
function RemoveSession(tabID = 0) {
  const key = `${SessionKey}${tabID}`
  Console(`Remove session data: ${key}.`)
  chrome.storage.local.remove(`${key}`)
}

// Remove all the local storage session objects.
function removeSessions() {
  chrome.storage.local.get(null, (items) => {
    if (chrome.runtime.lastError) CheckLastError(`removeSessions`)
    const keys = Object.keys(items)
    for (const key of keys) {
      if (key.startsWith(`${SessionKey}`)) {
        Console(`Remove session data: ${key}.`)
        chrome.storage.local.remove(key)
      }
    }
  })
}
