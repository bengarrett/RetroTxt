// File: scripts/popup.js
//
// Functions exclusive to the RetroTxt popup.html.
// These run in isolation to the other context-scripts.

/**
 * Create a link to the extension Details tab.
 * This is a clone of the same function found in helpers.
 */
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

/**
 * LinkTos handles the behavior of the popup buttons.
 * It retrieves website domains from local storage, displays the extension version,
 * checks if file scheme access is allowed, and provides links to various options pages.
 * @returns {void}
 */
async function LinkTos() {
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
      div2.addEventListener(`click`, () => {
        chrome.tabs.create({
          url: LinkDetails(),
        })
      })
    }
  })

  // link to the options page and fonts tab
  const fonts = document.getElementById(`fonts`)
  fonts.title = `Open the RetroTxt fonts options`
  fonts.addEventListener(`click`, () => TabTo(`fonts`))
  // link to the options page and display tab
  const display = document.getElementById(`display`)
  display.title = `Open the RetroTxt display options`
  display.addEventListener(`click`, () => TabTo(`display`))
  // link to the RetroTxt Extension Details tab
  const extension = document.getElementById(`extension`)
  extension.title = `Open the RetroTxt Extension Details`
  extension.addEventListener(`click`, () => {
    chrome.tabs.create({
      url: `${LinkDetails()}`,
    })
  })
  // link to the options page and settings tab
  const settings = document.getElementById(`settings`)
  settings.title = `Open the RetroTxt settings`
  settings.addEventListener(`click`, () => TabTo(`settings`))
  // link to the options page to add new urls
  const access = document.getElementById(`allowAccess`)
  access.addEventListener(`click`, () => TabTo(`settings`))
}

/**
 * Opens a new tab or updates an existing tab with the specified tab button.
 * @param {string} value - The value to be passed as the `t` query parameter in the URL.
 */
function TabTo(value) {
  const path = `${chrome.runtime.getURL(`html/options.html`)}`
  chrome.tabs.query({ url: path }, (tabs) => {
    for (let i = 0; i < tabs.length; i++) {
      chrome.tabs.update(tabs[i].id, {
        active: true,
        url: `${path}#top?t=${value}`,
      })
      return
    }
    chrome.tabs.create({
      active: true,
      url: `${path}#top?t=${value}`,
    })
  })
}

chrome.tabs.query({ currentWindow: true, active: true }, LinkTos)
