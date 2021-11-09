// filename: sw/error.js
//
/*global CheckLastError ConsoleLoad Developer DeveloperModeDebug */
/*exported CheckError */

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`error.js`)
})

/**
 * Error handler for the service workers.
 * @param [error=``] Error feedback
 * @param [log=false] Log errors `false` are logged to the browser Console
 * otherwise a JavaScript exception is thrown
 */
function CheckError(error = ``, log = false) {
  if (error !== undefined) {
    if (log !== true) {
      chrome.storage.local.get(Developer, (store) => {
        if (Developer in store) return console.warn(error)
        console.log(error)
      })
      return
    }
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] === undefined) return
      chrome.tabs.sendMessage(
        tabs[0].id,
        { error: error, id: `CheckError` },
        (result) => {
          if (
            CheckLastError(
              `check error send message to tab #${tabs[0].id}: ${error}`
            )
          )
            return
          if (DeveloperModeDebug && result !== undefined) console.log(result)
        }
      )
    })
    try {
      throw new Error(error)
    } catch (result) {
      console.error(result)
    }
  }
}
