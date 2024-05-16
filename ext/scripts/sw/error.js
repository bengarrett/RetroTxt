// File: scripts/sw/error.js
//
// Service worker error handlers.

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`error.js`)
})

/**
 * Error handler for the service workers.
 * @param [error=``] Error feedback
 * @param [log=false] Log errors `false` are logged to the browser Console
 * otherwise a JavaScript exception is thrown
 */
// eslint-disable-next-line no-unused-vars
function CheckError(error = ``, log = false) {
  if (typeof error !== `undefined`) {
    if (log !== true) {
      chrome.storage.local.get(Developer, (store) => {
        if (Developer in store) return console.warn(error)
        console.log(error)
      })
      return
    }
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (typeof tabs[0] === `undefined`) return
      chrome.tabs.sendMessage(
        tabs[0].id,
        { error: error, id: `CheckError` },
        (result) => {
          if (
            CheckLastError(
              `check error send message to tab #${tabs[0].id}: ${error}`,
            )
          )
            return
          if (DeveloperModeDebug && typeof result !== `undefined`)
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
