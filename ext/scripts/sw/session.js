// File: scripts/sw/session.js
//
// Uses the local storage API to simulate a session storage store.
// Session storage is not available to service workers.

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
// eslint-disable-next-line no-unused-vars
function SessionNew(tabID = 0, data) {
  if (data === null || !(`type` in data))
    CheckError(`required data for sessionNew(${tabID}) is empty`)
  const key = `${SessionKey}${tabID}`
  const store = {
    textfile: true,
    encoding: data.type,
    update: 0,
  }
  if (data.type === `unknown`) store.textfile = false
  if (data.encoding === ``) store.textfile = false
  chrome.storage.local.set({ [key]: store })
  Console(`Session, textfile on for tab #${tabID}.`)
}

// Create a new session local storage object for the browser tab with an active update value.
// eslint-disable-next-line no-unused-vars
function SessionOff(tabID = 0) {
  const key = `${SessionKey}${tabID}`
  const store = {
    textfile: false,
    encoding: ``,
    update: 1,
  }
  chrome.storage.local.set({ [key]: store })
  Console(`Session, textfile off for tab #${tabID}.`)
}

// Remove the session local storage object for the browser tab.
function RemoveSession(tabID = 0) {
  const key = `${SessionKey}${tabID}`
  Console(`Session, textfile remove: ${key}.`)
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

/* global CheckError CheckLastError Console ConsoleLoad */
