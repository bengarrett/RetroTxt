// File: scripts/sw/toolbar.js
//
// Toolbar button icon and badge.
//
// For packed extensions images can be in most formats that the Blink rendering engine can display,
// including PNG, JPEG, BMP, ICO, and others (SVG is not supported).
// Unpacked extensions must use images in the PNG format.

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`toolbar.js`)
})

chrome.storage.onChanged.addListener((changes) => {
  const icon = changes.settingsToolbarIcon
  if (!icon) return
  switch (`${icon.newValue}`) {
    case `auto`:
      return // do nothing
    case `dark`:
      return SetToolbarIcon(true)
    case `light`:
      return SetToolbarIcon(false)
  }
})

/**
 * Changes the Extension icon in the toolbar of Chrome.
 * @param {*} darkMode Use the icon set intended for dark system themes
 */
function SetToolbarIcon(darkMode = false) {
  switch (darkMode) {
    case true:
      console.log(`Set the toolbar icon to match the dark mode system theme.`)
      chrome.action.setIcon({
        path: {
          16: "/assets/retrotxt_16-light.png",
          19: "/assets/retrotxt_19-light.png",
          32: "/assets/retrotxt_32-light.png",
          48: "/assets/retrotxt_48-light.png",
          128: "/assets/retrotxt_128-light.png",
        },
      })
      return
    default:
      console.log(`Set the toolbar icon to match the light mode system theme.`)
      chrome.action.setIcon({
        path: {
          16: "/assets/retrotxt_16.png",
          19: "/assets/retrotxt_19.png",
          32: "/assets/retrotxt_32.png",
          48: "/assets/retrotxt_48.png",
          128: "/assets/retrotxt_128.png",
        },
      })
  }
}

/*global ConsoleLoad */
