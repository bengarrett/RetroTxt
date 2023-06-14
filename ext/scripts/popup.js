// File: scripts/popup.js
//
// Functions exclusive to the RetroTxt popup.html.
// These run in isolation to the other context-scripts.

chrome.tabs.query({ currentWindow: true, active: true }, () => {
  // list website domains
  chrome.storage.local.get(`settingsWebsiteDomains`, (store) => {
    const domains = store.settingsWebsiteDomains
    domains.push(`retrotxt.com`)
    domains.sort()
    document.getElementById(`websites`).textContent = `${domains.join(", ")}`
  })

  // display the extension version
  const data = chrome.runtime.getManifest(),
    element = document.getElementById(`version`)
  if (`version` in data) element.textContent = ` v${data.version}`

  // is file scheme access allowed?
  chrome.extension.isAllowedFileSchemeAccess((allowed) => {
    if (!allowed) {
      const div = document.getElementById(`localfiles`)
      div.textContent = `When allow access to file URLs is toggled, ${div.textContent}`
    }
  })

  // link to the options page to add new urls
  const access = document.getElementById(`allowAccess`)
  access.title = `Open the settings of RetroTxt`
  access.addEventListener(`click`, () => {
    chrome.tabs.create({
      url: `${chrome.runtime.getURL(`html/options.html`)}#top?t=settings`,
    })
  })

  // link to the display settings page
  const display = document.getElementById(`displaySettings`)
  display.title = `Open the display settings of RetroTxt`
  display.addEventListener(`click`, () => {
    chrome.tabs.create({
      url: `${chrome.runtime.getURL(`html/options.html`)}#top?t=display`,
    })
  })
})
