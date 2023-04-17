// File: scripts/popup.js
//
// Functions exclusive to the RetroTxt popup.html.
// These run in isolation to the other context-scripts.

chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
  const activeTab = 0
  const url = new URL(`${tabs[activeTab].url}`)

  const name = document.getElementById(`hostname`)
  name.textContent = url.hostname

  const access = document.getElementById(`allowAccess`)
  access.addEventListener(`click`, () => {
    chrome.tabs.create(
      { url: `${chrome.runtime.getURL(`html/options.html`)}#top?t=settings` },
      (tab) => {
        console.log(tab)
      }
    )
  })
})
