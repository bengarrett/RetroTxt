// File: scripts/sw/error.js
//
// Service worker error handlers.

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`error.js`)
})

/**
 * Error handler for the service workers.
 * @param {string} [error=''] Error message to process or log
 * @param {boolean} [log=false] If true, sends error to active tab and throws exception.
 *                              If false, logs to console only.
 * @returns {void}
 */
// eslint-disable-next-line no-unused-vars
function CheckError(error = ``, log = false) {
  if (error) {
    if (log !== true) {
      chrome.storage.local.get(Developer, (store) => {
        if (Developer in store) return console.warn(error)
        console.log(error)
      })
      return
    }
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error('Failed to query active tab:', chrome.runtime.lastError)
        return
      }
      if (!tabs?.[0]?.id) return
      chrome.tabs.sendMessage(
        tabs[0].id,
        { error: error, id: `CheckError` },
        (result) => {
          if (chrome.runtime.lastError) {
            console.error('Failed to send error to tab:', chrome.runtime.lastError)
            return
          }
          if (
            CheckLastError(
              `check error send message to tab #${tabs[0].id}: ${error}`,
            )
          )
            return
          if (DeveloperModeDebug && result !== undefined)
            console.log(result)
        },
      )
    })
    try {
      throw new Error(error)
    } catch (result) {
      console.error(result)
    }
  }
}

/*global CheckLastError ConsoleLoad Developer DeveloperModeDebug */
