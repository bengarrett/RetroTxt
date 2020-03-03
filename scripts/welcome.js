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
      .set(`options`, document.getElementsByClassName(`options-link`))
      .set(`privacy`, document.getElementsByClassName(`privacyLink`))
      .set(`reload`, document.getElementsByClassName(`reload-link`))
      .set(`textBlink`, document.getElementById(`ice-colors-toggle`))
      .set(`textRender`, document.getElementById(`h-text-rend`))
      .set(`textWrap`, document.getElementById(`line-wrap-toggle`))
      .set(`updateNotice`, document.getElementById(`welcome_banner-ui-a`))
  }
  /**
   * iCE Colors.
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
    if (document.getElementById(`retrotxt-4bit-ice`) !== null) return
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
   * Simulates the line wrap toggles but has no effect on the displayed ANSI.
   * @returns Bool
   */
  wrapText() {
    const content = this.element.get(`textWrap`).childNodes[0]
    switch (content.textContent) {
      case `On`:
        content.textContent = `Off`
        return false
      default:
        content.textContent = `On`
        return true
    }
  }
  /**
   * Reveals browser specific preview and help images.
   */
  async browserPreviews() {
    let id = `chromePreview`
    if (FindEngine() === `gecko`) id = `firefoxPreview`
    for (const image of document.getElementsByName(id)) {
      if (typeof image === `undefined`) return
      image.style.display = `block`
    }
  }
  /**
   * Uses localisation functionality to apply <link href=""> values.
   * @param {string} [id=``] element id or name
   * @param {string} [message=``] id of the locale that contains the URL
   */
  async setLocalization(id = ``, message = ``) {
    const element = document.getElementById(id)
    if (element !== null)
      element.setAttribute(`href`, chrome.i18n.getMessage(message))
    else {
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
    const cards = this.element.get(`cards`)
    for (let i = cards.children.length; i >= 0; i--) {
      cards.appendChild(cards.children[(Math.random() * i) | 0])
    }
  }
  /**
   * Manifest version of RetroTxt.
   */
  async showRuntimeInfo() {
    const manifest = chrome.runtime.getManifest()
    // only supported by Firefox
    if (typeof browser.runtime !== `undefined`) {
      if (typeof browser.runtime.getBrowserInfo !== `undefined`) {
        const gettingInfo = browser.runtime.getBrowserInfo()
        gettingInfo.then(this.gotBrowserInfo)
      }
      if (typeof browser.runtime.getPlatformInfo !== `undefined`) {
        const gettingInfo = browser.runtime.getPlatformInfo()
        gettingInfo.then(this.gotPlatformInfo)
      }
    } else {
      // else assume a Chromium based browser
      // Brave does not reveal itself in the UA
      const ua = navigator.userAgent
      const b = {
        vendor: `Google`,
        name: `Chrome`,
        version: ``
      }
      if (ua.includes(`Edg/`)) {
        b.vendor = `Microsoft`
        b.name = `Edge`
        const i = ua.indexOf(`Edg/`)
        b.version = ua.substring(i + 4, i + 6)
      } else if (ua.includes(`Chrome/`)) {
        const i = ua.indexOf(`Chrome/`)
        b.version = ua.substring(i + 7, i + 9)
      } else {
        b.vendor = ``
        b.name = ``
      }
      console.log(ua)
      this.gotBrowserInfo(b)
    }

    document.getElementById(
      `manifest`
    ).textContent = `RetroTxt v${manifest.version}`
    if (`version_name` in manifest)
      document.getElementById(
        `rt-updated`
      ).textContent = `${manifest.version_name}`
    else if (`version` in manifest)
      document.getElementById(`rt-updated`).textContent = `${manifest.version}`
    if (
      location.hash.includes(`#update`) ||
      location.hash.includes(`#permission`)
    ) {
      document.getElementById(`welcome_banner`).style.display = `block`
      document.getElementById(`welcome_banner-ui`).style.display = `flex`
      if (`version_name` in manifest)
        document.title = `[··] ${manifest.version_name} update`
      else document.title = `[··] ${manifest.short_name} update`
    }
    if (location.hash.includes(`#permission`))
      document.getElementById(`rt-permission`).classList.add(`orange-border`)
    else if (location.hash.includes(`#update`)) {
      document.getElementById(`rt-permission`).classList.add(`hidden`)
    }
  }
  /**
   * Parse browser metadata into readable text.
   * @param {*} [browser={}] result of the browser.runtime method
   */
  async gotBrowserInfo(browser = {}) {
    document.getElementById(
      `program`
    ).textContent = ` on ${browser.vendor} ${browser.name} ${browser.version}`
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
      const br = document.getElementById(`browser`)
      if (manifest.options_ui.page.startsWith(`moz-extension`, 0) === true) {
        br.textContent = `Firefox`
        document.getElementById(`5star-firefox`).classList.toggle(`hidden`)
      } else if (navigator.userAgent.includes(`Edg/`)) {
        // don't show a notice as the Microsoft Addons page doesn't have user reviews
      } else {
        br.textContent = `Chrome`
        document.getElementById(`5star-chrome`).classList.toggle(`hidden`)
      }
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
      switch (info.installType) {
        // reveal developer links
        case `development`:
          document.getElementById(`developer`).style.display = `inline`
          break
      }
    })
  }
  for (const link of html.element.get(`options`)) {
    link.addEventListener(`click`, () => chrome.runtime.openOptionsPage())
  }
  for (const link of html.element.get(`reload`)) {
    link.addEventListener(`click`, () => chrome.runtime.reload())
  }
  html.element
    .get(`textBlink`)
    .addEventListener(`click`, () => html.iceColors())
  html.element
    .get(`textRender`)
    .addEventListener(`click`, () => html.textRender())
  html.element.get(`updateNotice`).addEventListener(`click`, () => {
    localStorage.setItem(`updatedNotice`, false)
    chrome.storage.local.set({ [`updatedNotice`]: false })
    window.close()
  })
  html.element.get(`textWrap`).addEventListener(`click`, () => html.wrapText())
  html.element
    .get(`infoHide`)
    .addEventListener(`click`, () => html.exampleUI(true))
  html.element
    .get(`infoShow`)
    .addEventListener(`click`, () => html.exampleUI(false))
  html.element
    .get(`fontSize`)
    .addEventListener(`click`, result => html.fontSize(result))

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
