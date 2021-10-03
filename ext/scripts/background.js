// Extension event listeners are a little different from the patterns you may have seen in DOM or
// Node.js APIs. The below event listener registration can be broken in to 4 distinct parts:
//
// * chrome      - the global namespace for Chrome's extension APIs
// * runtime     – the namespace of the specific API we want to use
// * onInstalled - the event we want to subscribe to
// * addListener - what we want to do with this event
//
// See https://developer.chrome.com/docs/extensions/reference/events/ for additional details.
//
// Chrome extension samples:
// https://github.com/GoogleChrome/chrome-extensions-samples
//
// API references of note
//
//

importScripts("functions.js")

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log(`Hello, world background:`, details)
})
