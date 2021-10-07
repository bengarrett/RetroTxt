// filename: sw/error.js
//
/*global CheckLastError ConsoleLoad Developer */
/*exported CheckError */

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`error.js`)
})

/**
 * Error handler for this `scripts/eventpage.js`.
 * @param [error=``] Error feedback
 * @param [log=false] Log errors `false` are logged to the browser Console
 * otherwise a JavaScript exception is thrown
 */
function CheckError(error = ``, log = false) {
  const debug = false
  if (error !== undefined) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] === undefined) return
      chrome.tabs.sendMessage(
        tabs[0].id,
        { error: error, id: `CheckError` },
        (result) => {
          if (CheckLastError(`check error send message`)) return
          if (debug && result !== undefined) console.log(result)
        }
      )
    })
    if (log !== true) {
      chrome.storage.local.get(Developer, (store) => {
        if (Developer in store) return console.trace(error)
        else console.log(error)
      })
      return
    }
    try {
      throw new Error(error)
    } catch (result) {
      console.error(result)
    }
  }
}
