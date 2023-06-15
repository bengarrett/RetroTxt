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

  // link to the options page and fonts tab
  const fonts = document.getElementById(`fonts`)
  fonts.title = `Open the RetroTxt fonts options`
  fonts.addEventListener(`click`, () => {
    chrome.tabs.create({
      url: `${chrome.runtime.getURL(`html/options.html`)}#top?t=fonts`,
    })
  })
  // link to the options page and display tab
  const display = document.getElementById(`display`)
  display.title = `Open the RetroTxt display options`
  display.addEventListener(`click`, () => {
    chrome.tabs.create({
      url: `${chrome.runtime.getURL(`html/options.html`)}#top?t=display`,
    })
  })
  // link to the options page and settings tab
  const settings = document.getElementById(`settings`)
  settings.title = `Open the RetroTxt settings`
  settings.addEventListener(`click`, () => {
    chrome.tabs.create({
      url: `${chrome.runtime.getURL(`html/options.html`)}#top?t=settings`,
    })
  })
  // link to the options page to add new urls
  const access = document.getElementById(`allowAccess`)
  access.addEventListener(`click`, () => {
    chrome.tabs.create({
      url: `${chrome.runtime.getURL(`html/options.html`)}#top?t=settings`,
    })
  })
})
