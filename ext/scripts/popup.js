// File: scripts/popup.js
//
// Functions exclusive to the RetroTxt popup.html.
// These run in isolation to the other context-scripts.

/**
 * Create a link to the extension Details tab.
 * This is a clone of the same function found in helpers. */
function LinkDetails() {
  const extensionId = chrome.runtime.id,
    ua = navigator.userAgent
  if (extensionId.length === 0) return ``
  if (ua.includes(`Firefox/`)) return ``
  const url = `://extensions?id=${extensionId}`
  if (ua.includes(`Edg/`)) return `edge${url}`
  if (ua.includes(`OPR/`)) return `opera${url}`
  // brave, vivaldi do not modify the user agent and cannot be detected
  return `chrome${url}`
}

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
      const div1 = document.getElementById(`localfiles`)
      div1.classList.add(`is-hidden`)
      const div2 = document.getElementById(`unlockLocalfiles`)
      div2.classList.remove(`is-hidden`)
      const a = document.getElementById(`linkUnlock`)
      a.addEventListener(`click`, () => {
        chrome.tabs.create({
          url: LinkDetails(),
        })
      })
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
