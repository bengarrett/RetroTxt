// filename: welcome.js
// These functions are used exclusively by welcome.html.
/*global tippy*/

/**
 * User interactions for the welcome page.
 * @class HTML
 */
class HTML {
  constructor() {
    this.element = new Map()
      .set(`cards`, document.getElementById(`cards`))
      .set(`fontSize`, document.getElementById(`h-doc-text-adjust`))
      .set(`infoHide`, document.getElementById(`h-ui-toggle-hide`))
      .set(`infoShow`, document.getElementById(`h-ui-toggle-show`))
      .set(`options`, document.getElementsByClassName(`optionsLink`))
      .set(`privacy`, document.getElementsByClassName(`privacyLink`))
      .set(`reload`, document.getElementsByClassName(`reloadLink`))
      .set(`textBlink`, document.getElementById(`ice-colors-toggle`))
      .set(`textRender`, document.getElementById(`h-text-rend`))
      .set(`updateNotice`, document.getElementById(`rtu-ui-a`))
  }
  /**
   * iCE colors.
   * When enabled, extra ANSI background colours are used.
   * Otherwise the same ANSI codes represent legacy blink mode.
   */
  iceColors() {
    switch (this.element.get(`textBlink`).childNodes[1].textContent) {
      case `On`:
        return this.iceColorsOff()
      default:
        return this.iceColorsOn()
    }
  }
  iceColorsOn() {
    const iceCSS = document.getElementById(`retrotxt-4bit-ice`)
    if (iceCSS !== null) return
    const palette = new HardwarePalette()
    document.head.appendChild(
      CreateLink(palette.savedFilename(true), `retrotxt-4bit-ice`)
    ) // child 4
    this.element.get(`textBlink`).childNodes[1].textContent = `On`
  }
  iceColorsOff() {
    const iceCSS = document.getElementById(`retrotxt-4bit-ice`)
    if (iceCSS !== null) iceCSS.remove()
    this.element.get(`textBlink`).childNodes[1].textContent = `Off`
  }
  /**
   * Text render methods.
   */
  textRender() {
    const retroTxtLogo = document.getElementsByTagName(`main`)[0]
    switch (this.element.get(`textRender`).textContent) {
      case `Normal`:
        return ToggleTextEffect(`smeared`, retroTxtLogo)
      case `Smeared`:
        return ToggleTextEffect(`shadowed`, retroTxtLogo)
      default:
        return ToggleTextEffect(`normal`, retroTxtLogo)
    }
  }
  /**
   * Information header.
   * @param {boolean} [show=true] display or hide?
   */
  exampleUI(show = true) {
    const header = document.getElementsByTagName(`header`)
    if (typeof header[0] === `object`) {
      switch (show) {
        case false:
          header[0].style.display = `none` // header-show
          header[1].style.display = `block` // header-hide
          break
        case true:
          header[0].style.display = `block`
          header[1].style.display = `none`
          break
      }
    }
  }
  /**
   * Toggles between normal and 2X font size enlargement.
   * @param {string} size a value of either 1x or 2x
   */
  fontSize(size = ``) {
    const retroTxtLogo = document.getElementsByTagName(`main`)[0]
    switch (size.srcElement.textContent) {
      case `1x`:
        this.element.get(`fontSize`).textContent = `2x`
        retroTxtLogo.classList.add(`text-2x`)
        retroTxtLogo.classList.remove(`text-1x`)
        break
      case `2x`:
        this.element.get(`fontSize`).textContent = `1x`
        retroTxtLogo.classList.add(`text-1x`)
        retroTxtLogo.classList.remove(`text-2x`)
        break
    }
  }
  /**
   * Reveals browser specific preview and help images.
   */
  async browserPreviews() {
    let id = `chromePreview`
    if (FindEngine() === `gecko`) id = `firefoxPreview`
    for (const img of document.getElementsByName(id)) {
      if (typeof img === `undefined`) return
      img.style.display = `block`
      //link.setAttribute(`href`, chrome.i18n.getMessage(message))
    }
  }
  /**
   * Uses localisation functionality to apply <link href=""> values.
   * @param {string} [id=``] element id or name
   * @param {string} [message=``] id of the locale that contains the URL
   */
  async setLocalization(id = ``, message = ``) {
    const element = document.getElementById(id)
    if (element !== null) {
      element.setAttribute(`href`, chrome.i18n.getMessage(message))
    } else {
      for (const link of document.getElementsByName(id)) {
        if (typeof link === `undefined`) return
        link.setAttribute(`href`, chrome.i18n.getMessage(message))
      }
    }
  }
  /**
   * Randomises the order of sample cards.
   */
  async shuffleSamples() {
    // credit: https://stackoverflow.com/questions/7070054
    const element = this.element.get(`cards`)
    for (let i = element.children.length; i >= 0; i--) {
      element.appendChild(element.children[(Math.random() * i) | 0])
    }
  }
  /**
   * Manifest version of RetroTxt.
   */
  async showRuntimeInfo() {
    const manifest = chrome.runtime.getManifest()
    if (typeof browser.runtime !== `undefined`) {
      if (typeof browser.runtime.getBrowserInfo !== `undefined`) {
        const gettingInfo = browser.runtime.getBrowserInfo()
        gettingInfo.then(this.gotBrowserInfo)
      }
      if (typeof browser.runtime.getPlatformInfo !== `undefined`) {
        const gettingInfo = browser.runtime.getPlatformInfo()
        gettingInfo.then(this.gotPlatformInfo)
      }
    }
    document.getElementById(`manifest`).textContent = `RetroTxt v${
      manifest.version
    }`
    if (`version_name` in manifest) {
      document.getElementById(`rt-updated`).textContent = `${
        manifest.version_name
      }`
    } else if (`version` in manifest) {
      document.getElementById(`rt-updated`).textContent = `${manifest.version}`
    }
    if (
      location.hash.includes(`#update`) ||
      location.hash.includes(`#permission`)
    ) {
      document.getElementById(`rtu`).style.display = `block`
      document.getElementById(`rtu-ui`).style.display = `flex`
      if (`version_name` in manifest) {
        document.title = `[··] ${manifest.version_name} update`
      } else {
        document.title = `[··] ${manifest.short_name} update`
      }
    }
    if (location.hash.includes(`#permission`)) {
      document.getElementById(`rt-permission`).classList.add(`orange-border`)
    }
  }
  /**
   * Parse browser metadata into readable text.
   * @param {*} [browser={}] result of the browser.runtime method
   */
  async gotBrowserInfo(browser = {}) {
    const element = document.getElementById(`program`)
    element.textContent = ` on ${browser.vendor} ${browser.name} ${
      browser.version
    }`
  }
  /**
   * Parse operating system metadata into readable text.
   * @param {*} [platform={}] result of the browser.runtime method
   */
  async gotPlatformInfo(platform = {}) {
    const element = document.getElementById(`os`)
    switch (platform.os) {
      case `win`:
        element.textContent = ` (Windows ${platform.arch})`
        break
      case `mac`:
        element.textContent = ` (macOS ${platform.arch})`
        break
      case `linux`:
        element.textContent = ` (Linux ${platform.arch})`
        break
      case `openbsd`:
        element.textContent = ` (BSD ${platform.arch})`
        break
    }
  }
  /**
   * Shows the WebExtension compatible browser in use.
   */
  async showBrowser() {
    const manifest = chrome.runtime.getManifest()
    if (
      manifest.options_ui !== undefined &&
      manifest.options_ui.page !== undefined
    ) {
      const page = manifest.options_ui.page
      const br = document.getElementById(`browser`)
      if (page.startsWith(`moz-extension`, 0) === true)
        br.textContent = `Firefox`
      else br.textContent = `Chrome`
    }
  }
  /**
   * Configuration for tippy tooltips.
   */
  async toolTips() {
    tippy(`.tooltip`, {
      arrow: true,
      duration: [30, 20],
      theme: `light`
    })
  }
}

// self-invoking expression
(() => {
  const html = new HTML()
  // filter by extension installation type
  if (typeof chrome.management !== `undefined`) {
    chrome.management.getSelf(info => {
      const testLink = document.getElementById(`developer`)
      switch (info.installType) {
        // reveal developer links
        case `development`:
          testLink.style.display = `inline`
          break
      }
    })
  }
  for (const link of html.element.get(`options`)) {
    link.addEventListener(`click`, () => {
      chrome.runtime.openOptionsPage()
    })
  }
  for (const link of html.element.get(`reload`)) {
    link.addEventListener(`click`, () => {
      chrome.runtime.reload()
    })
  }
  html.element.get(`textBlink`).addEventListener(`click`, () => {
    html.iceColors()
  })
  html.element.get(`textRender`).addEventListener(`click`, () => {
    html.textRender()
  })
  html.element.get(`updateNotice`).addEventListener(`click`, () => {
    localStorage.setItem(`updatedNotice`, false)
    chrome.storage.local.set({ [`updatedNotice`]: false })
    window.close()
  })
  html.element.get(`infoHide`).addEventListener(`click`, () => {
    html.exampleUI(true)
  })
  html.element.get(`infoShow`).addEventListener(`click`, () => {
    html.exampleUI(false)
  })
  html.element.get(`fontSize`).addEventListener(`click`, result => {
    html.fontSize(result)
  })

  html.setLocalization(`changesLink`, `url_new`)
  html.setLocalization(`docLink`, `url_help`)
  html.setLocalization(`faqLink`, `url_qa`)
  html.setLocalization(`privacyLink`, `url_privacy`)
  html.setLocalization(`webLink`, `url`)

  html.browserPreviews()
  html.shuffleSamples()
  html.showRuntimeInfo()
  html.showBrowser()
  html.toolTips()
})()
