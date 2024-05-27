// File: scripts/options.js
//
// Functions and classes exclusive to the RetroTxt Options tab.
// These run in isolation to the other context-scripts.

/**
 * Argument checker.
 * @param {string} [name=``] Argument name that failed
 * @param {string} [expected=``] Expected argument type or value
 * @param {*} actual The actual argument used
 */
function checkArgument(name = ``, expected = ``, actual) {
  switch (expected) {
    case `boolean`:
      return handleError(
        `argument '${name}' should be a 'boolean' (true|false) instead of '${typeof actual}'`,
      )
    case `number`:
      return handleError(
        `argument '${name}' should be a 'number' (unsigned) '${typeof actual}'`,
      )
    case `string`:
      return handleError(
        `argument '${name}' should be a 'string' of text instead of '${typeof actual}'`,
      )
    default:
      return handleError(
        `argument '${name}' needs to be a '${expected}' instead of '${typeof actual}'`,
      )
  }
}

/**
 * Returns error feedback.
 * @param {*} error Text about the error
 */
function handleError(error) {
  try {
    throw new Error(error)
  } catch (e) {
    console.error(`Failed to obtain the setting: ${e}`)
  }
  if (typeof qunit === `undefined`) {
    document.getElementById(`error`).style.display = `inherit`
    document.getElementById(`status`).style.display = `none`
    document.getElementById(`errorReload`).addEventListener(`click`, () => {
      const result = confirm("Reload RetroTxt?")
      if (!result) return
      chrome.runtime.reload()
    })
  }
}

/**
 * Workaround to add localization support for HTML files.
 * @param {string} [word=``] i18n message name
 * @param {string} [className=``] Class name to inject translation to
 */
async function localizeWord(word = ``, className = ``) {
  if (typeof word !== `string`) checkArgument(`name`, `string`, word)
  if (typeof className !== `string`)
    checkArgument(`className`, `string`, className)
  if (word.length < 1) CheckRange(`word`, `length`, `1`, word.length)
  if (className.length < 1)
    CheckRange(`className`, `length`, `1`, className.length)
  const message = chrome.i18n.getMessage(word),
    elements = document.getElementsByClassName(className)
  for (const element of elements) {
    const text = element.textContent
    // if the original word is capitalised then apply it to the new word
    if (text.slice(0, 1).toUpperCase() !== text.slice(0, 1)) {
      element.textContent = message
      continue
    }
    element.textContent = `${message[0].toUpperCase()}${message.slice(1)}`
  }
}

/**
 * Returns the value of a chrome.storage.local.get request or a default value if result is undefined.
 * @param {string} key Key name of the local storage item.
 * @param {*} result Result from the chrome.storage.local.get request.
 * @returns A result or default value.
 */
function localGet(key, result) {
  const name = Object.getOwnPropertyNames(result)[0]
  let value = result[name]
  if (typeof name === `undefined`) {
    value = new OptionsReset().get(key)
    localStore(key, value)
    console.info(
      `Failed to obtain the '${key}' setting so using default: "${value}"`,
    )
  }
  return value
}

/**
 * Update the local storage item with a new value.
 * When the value is left empty the local storage item is deleted.
 * @param {string} [key=``] Id of the storage item
 * @param {string} [value=``] Value to store
 */
function localStore(key = ``, value = ``) {
  switch (value) {
    case ``:
      chrome.storage.local.remove(`${key}`)
      Console(`storage.local localStore('${key}', removed)`)
      return
    default:
      // Extension storage requires a key/value pair object
      chrome.storage.local.set({ [key]: value })
      Console(
        `RetroTxt storage.local options localStore('${key}', ${value}) ${typeof value}`,
      )
  }
}

/**
 * User interactions for the options page.
 * @class HTML
 */
class HTML {
  /**
   * Reveal the welcome banner in the Home tab.
   */
  async welcome() {
    if (location.hash.includes(`#update`)) {
      const m = chrome.runtime.getManifest()
      ;`version_name` in m
        ? (document.title = `[··] ${m.version_name} update`)
        : (document.title = `[··] ${m.short_name} update`)
      document.getElementById(`hero0`).click()
      document.getElementById(`updateNotice`).style.display = `inline`
      return
    }
    if (location.hash.includes(`#newinstall`)) {
      document.getElementById(`newInstallNotice`).style.display = `inline`
      const backup = new Backup()
      backup.newInstall()
      // 10 Feb 2024, removed the unused, onclick event listener for
      // the newInstallFonts button.
      return
    }
    if (location.hash.includes(`#display`)) {
      document.getElementById(`hero5`).click()
      // drop the #display in the url which conflict with the option tabs
      location.replace(`${chrome.runtime.getURL(`html/options.html`)}`)
      return
    }
  }
  /**
   * Hide future update notices for RetroTxt.
   */
  async hideNotice() {
    const key = `updateNotice`
    document.getElementById(`updateNoticeBtn`).addEventListener(`click`, () => {
      const result = confirm(
        "Stop this update tab from launching with future RetroTxt upgrades?",
      )
      if (!result) return
      chrome.storage.local.set({ [key]: false })
      globalThis.close()
    })
  }
  /**
   * Manifest version of RetroTxt.
   */
  async showRuntimeInfo() {
    const und = `undefined`
    // only supported by Firefox
    if (typeof browser !== und && typeof browser.runtime !== und) {
      if (typeof browser.runtime.getBrowserInfo !== und) {
        const info = browser.runtime.getBrowserInfo()
        info.then(this._gotBrowserInfo)
      }
      if (typeof browser.runtime.getPlatformInfo !== und) {
        const info = browser.runtime.getPlatformInfo()
        info.then(this._gotPlatformInfo)
      }
      return
    }
    // assume a Chromium based browser
    // Brave does not reveal itself in the UA
    const ua = navigator.userAgent,
      b = {
        vendor: `Google`,
        name: `Chrome`,
        version: ``,
      }
    if (ua.includes(`Edg/`)) {
      // example: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59
      b.vendor = `Microsoft`
      b.name = `Edge`
      const i = ua.indexOf(`Edg/`)
      const x = ua.substring(i + 4).split(".")
      b.version = x[0]
    } else if (ua.includes(`Chrome/`)) {
      // example: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36
      const i = ua.indexOf(`Chrome/`)
      const x = ua.substring(i + 7).split(".")
      b.version = x[0]
    } else {
      b.vendor = ``
      b.name = ``
    }
    console.info(`Browser user-agent: ${ua}.`)
    this._gotBrowserInfo(b)
  }
  /**
   * Uses localisation functionality to apply <link href=""> values.
   * @param {string} [id=``] element id or name
   * @param {string} [message=``] id of the locale that contains the URL
   */
  async setLocalization(id = ``, message = ``) {
    const e = document.getElementById(id)
    if (e !== null)
      return e.setAttribute(`href`, chrome.i18n.getMessage(message))
    for (const link of document.getElementsByName(id)) {
      if (typeof link === `undefined`) return
      link.setAttribute(`href`, chrome.i18n.getMessage(message))
    }
  }
  /**
   * Shows the web browser in use.
   */
  async showBrowser() {
    const m = chrome.runtime.getManifest()
    if (
      typeof m.options_ui !== `undefined` &&
      typeof m.options_ui.page !== `undefined`
    ) {
      const titles = Array.from(document.getElementsByName(`browser-title`)),
        fontScheme = document.getElementById(`settingsFont`)
      let browser, setting
      if (m.options_ui.page.startsWith(`moz-extension`, 0) === true) {
        browser = `Firefox`
        setting = `about:preferences`
        document.getElementById(`5starFirefox`).display = `inline`
      } else if (navigator.userAgent.includes(`Edg/`)) {
        browser = `Edge`
        setting = `edge://settings/fonts`
        document.getElementById(`5starEdge`).display = `inline`
      } else {
        browser = `Chrome`
        setting = `chrome://settings/fonts`
        document.getElementById(`5starChrome`).display = `inline`
      }
      titles.forEach((elm) => {
        if (elm.textContent === null) return
        elm.textContent = `${browser}`
      })
      fontScheme.textContent = `${setting}`
    }
  }
  /**
   * Parse browser metadata into readable text.
   * @param {*} [browser={}] result of the browser.runtime method
   */
  async _gotBrowserInfo(browser = {}) {
    const txt = ` on ${browser.vendor} ${browser.name} ${browser.version}`
    document.getElementById(`program`).textContent = txt
    chrome.runtime.getPlatformInfo((info) => {
      let text
      if (info.os === `mac` && info.arch === `arm`) text = `macOS M series`
      else text = `${PlatformOS[info.os]} with ${PlatformArch[info.arch]}`
      document.getElementById(`os`).textContent = text
    })
  }
}

/**
 * Grants and removes access permissions.
 * @class Permission
 */
class Permission {
  /**
   * Creates an instance of Permission.
   * @param [type=``] Checkbox type, either `downloads`, `files` or `http`
   */
  constructor(type = ``) {
    this.domains = new Configuration().domains()
    Object.freeze(this.domains)
    // IMPORTANT: these Map values must sync to those in the Security class found in `scripts/sw/security.js`
    const permissions = new Map().set(`downloads`, [
      `downloads`,
      `downloads.open`,
    ])
    const elements = new Map().set(`downloads`, `downloadViewer`)
    this.permissions = permissions.get(`${type}`)
    this.elementId = elements.get(`${type}`)
    this.type = type
  }
  /**
   * Initialise onChange event listeners for checkboxes and the `<textarea>`.
   */
  listen() {
    // checkbox toggles
    const toggles = () => {
      const value = document.getElementById(`${this.elementId}`).checked
      let monitor = false // for downloadViewer
      // special cases that have permission dependencies
      switch (this.elementId) {
        case `downloadViewer`:
          Console(`toggled downloadViewer: ${value}`)
          if (value === true) monitor = true
          chrome.runtime.sendMessage({ monitorDownloads: monitor }, () => {
            if (CheckLastError(`monitor downloads send message`)) return
          })
          break
      }
    }
    // checkbox event listeners
    const checkbox = document.getElementById(`${this.elementId}`)
    if (checkbox !== null) {
      checkbox.addEventListener(`change`, () => {
        const value = document.getElementById(`${this.elementId}`).checked
        Console(`checkbox change event: ${value}`)
        this._checkedEvent(value)
        toggles()
      })
      this._check()
    }
    // text area event listeners
    document.getElementById(`submitHost`).addEventListener(`click`, () => {
      if (this.type !== `http`) return
      Console(`Hostnames have been updated`)
      const reset = this.domains === `textarea.value`
      if (reset) return this.origins.pop()
    })
    // options theme buttons listeners
    const themes = document.getElementsByClassName(`option-theme`)
    for (const theme of themes) {
      theme.addEventListener(`click`, () => {
        theme.classList.forEach((value) => {
          const arr = [`button`, `option-theme`, `notification`]
          if (arr.includes(value)) return
          const hero = document.getElementById(`heroSection`),
            src = document.getElementById(`getTheSource`),
            doc = document.getElementById(`getTheDocs`),
            upd = document.getElementById(`enjoyRetroTxt`)
          hero.classList.forEach((heroValue) => {
            if (heroValue === `is-fullheight`) return
            if (!heroValue.startsWith(`is-`)) return
            hero.classList.replace(heroValue, value)
          })
          src.classList.forEach((srcValue) => {
            if (srcValue === `is-inverted`) return
            if (!srcValue.startsWith(`is-`)) return
            src.classList.replace(srcValue, value)
          })
          doc.classList.forEach((docValue) => {
            if (docValue === `is-inverted`) return
            if (!docValue.startsWith(`is-`)) return
            doc.classList.replace(docValue, value)
          })
          upd.classList.forEach((updValue) => {
            upd.classList.replace(updValue, value)
          })
          chrome.storage.local.set({ [`optionClass`]: `${value}` })
        })
      })
    }
    // reset custom color values
    const reset = document.getElementById(`customColorReset`)
    reset.addEventListener(`click`, () => {
      const bg = document.getElementById(`customColorBG`),
        fg = document.getElementById(`customColorFG`)
      bg.value = `#3f3f3f`
      fg.value = `#dcdccc`
      new ColorCustomPair(`background`)._update()
      new ColorCustomPair(`foreground`)._update()
    })
  }
  /**
   * Set the checkbox checked state based on the permission grant.
   */
  _check() {
    const checkbox = document.getElementById(`${this.elementId}`)
    if (!(`checked` in checkbox))
      return console.warn(
        `Checkbox element <input id="${this.elementId}" type="checkbox"> is missing.`,
      )
    chrome.permissions.contains({ permissions: this.permissions }, (result) => {
      if (result) return (checkbox.checked = true)
      return (checkbox.checked = false)
    })
  }
  /**
   * Checkbox onChanged event that updates a permission.
   * @param [request=true] Request `true` or remove `false` permission
   * @param testResult A collection of permissions
   */
  _checkedEvent(
    request = true,
    testResult = { permissions: this.permissions },
  ) {
    switch (this.type) {
      case `downloads`:
        Console(`checked download event: ${request}`)
        if (request === true) {
          return chrome.permissions.request(testResult, (result) => {
            if (CheckLastError(`security permissionSet "${result}"`)) return
            alert(
              `If download monitoring does not work, the browser may require a restart.`,
            )
            this._check()
          })
        }
        return chrome.permissions.remove(testResult, (removed) => {
          if (CheckLastError(`security remove permissionSet "${removed}"`))
            return
          Console(`${removed}: request to remove permissions []`)
          this._check()
        })
    }
  }
}
/**
 * Checkbox interactions.
 * @class CheckBox
 */
class CheckBox {
  /**
   * Creates an instance of CheckBox.
   */
  constructor() {
    // id argument of the checkbox
    this.id = ``
    // value argument of the checkbox
    this.value = ``
    // checkboxes with ids and associated storage key names
    this.boxes = new Map()
      // set the checkbox id, storage key name
      .set(`hyperlinks`, `linkifyHyperlinks`)
      .set(`hyperlinksValidate`, `linkifyValidate`)
      .set(`eightyColumnWrap`, `ansiColumnWrap`)
      .set(`pageWrap`, `ansiPageWrap`)
      .set(`iceColorsMode`, `ansiUseIceColors`)
      .set(`accurate9pxFonts`, `textAccurate9pxFonts`)
      .set(`textRenderShadow`, `textRenderEffect`)
      .set(`backgroundScanlines`, `textBackgroundScanlines`)
      .set(`blinkingCursorText`, `textBlinkingCursor`)
      .set(`centerAlignText`, `textCenterAlign`)
      .set(`dosControlGlyphs`, `textDOSControlGlyphs`)
      .set(`smearBlocks`, `textSmearBlockCharacters`)
      .set(`updatedNotice`, `settingsNewUpdateNotice`)
  }
  /**
   * Checkbox event listeners.
   */
  async listen() {
    this.boxes.forEach((item, id) => {
      Console(`Initialize checkbox listener, ${id}.`)
      document.getElementById(id).addEventListener(`change`, () => {
        Console(`Checkbox listener triggered, ${id}.`)
        const value = document.getElementById(id).checked
        chrome.storage.local.set({ [item]: value })
        this.id = `${id}`
        this.value = value
        this.preview()
      })
    })
    new Permission().listen()
    this._fileSchemeAccess()
  }
  /**
   * Code to run after a checkbox has been clicked.
   */
  preview() {
    switch (this.id) {
      case `backgroundScanlines`: {
        const element = document.getElementById(`sampleTerminal`)
        return ToggleScanlines(this.value, element)
      }
      case `centerAlignText`: {
        const element = document.getElementById(`sampleTerminal`)
        if (`${this.value}` === `true`)
          return (element.style.justifyContent = `center`)
        return (element.style.justifyContent = `left`)
      }
      case `dosControlGlyphs`: {
        const element = document.getElementById(`sampleDOSCtrls`)
        if (`${this.value}` === `true`)
          return (element.style.display = `inline`)
        return (element.style.display = `none`)
      }
      case `blinkingCursorText`: {
        const element = document.getElementById(`sampleCursor`)
        if (`${this.value}` === `true`)
          return (element.style.animation = `300ms blink step-end infinite`)
        return (element.style.animation = `none`)
      }
    }
  }
  /**
   * Read the local storage and apply text effects on the sample text.
   */
  async storageLoad() {
    this.boxes.forEach((key, id) => {
      chrome.storage.local.get(key, (result) => {
        const value = localGet(key, result)
        this.id = `${id}`
        this.value = `${value}`
        this.preview()
      })
    })
  }
  /**
   * Disable a checkbox.
   * Intended for use when a Extension feature lacks access permission.
   */
  async _disable() {
    const reason = `RetroTxt requires 'Allow access to file URLs' to be toggled`,
      checkBox = document.getElementById(`${this.id}`)
    if (checkBox === null) return
    checkBox.disabled = true
    checkBox.parentElement.title = reason
    checkBox.parentElement.style.cursor = `not-allowed`
  }
  /**
   * Event listeners for options.
   * These require `extension.isAllowedFileSchemeAccess`.
   */
  _fileSchemeAccess() {
    chrome.extension.isAllowedFileSchemeAccess((allowed) => {
      const offs = document.getElementsByName(`is-off`),
        ons = document.getElementsByName(`is-on`)
      // link to the extension details tab
      const link = LinkDetails(),
        detailURLs = document.getElementsByClassName(`details-detail-url`)
      for (const elm of detailURLs) {
        if (link.length === 0) break
        if (allowed === true && elm.id === `monitorDownloads`) break
        elm.textContent = `${link}`
        elm.parentElement.classList.remove(`is-hidden`)
      }
      // show feature state
      // allow access to file URLs is active
      if (allowed === true) {
        new Permission(`downloads`).listen()
        for (const element of offs) {
          element.classList.add(`is-hidden`)
        }
        for (const element of ons) {
          element.classList.remove(`is-hidden`)
        }
        return
      }
      // allow access to file URLs is inactive
      this.id = `downloadViewer`
      this._disable()
      for (const element of offs) {
        element.classList.remove(`is-hidden`)
      }
      for (const element of ons) {
        element.classList.add(`is-hidden`)
      }
    })
  }
}
/**
 * Options dialogue initialisation.
 * @class Initialise
 * @extends {CheckBox}
 */
class Initialise extends CheckBox {
  constructor() {
    super()
    this.defaults = new OptionsReset()
    this.lengths = new Set([
      `colorsAnsiColorPalette`,
      `settingsInformationHeader`,
      `settingsToolbarIcon`,
      `colorsTextPairs`,
      `fontFamilyName`,
      `textSmearBlockCharacters`,
    ])
    Object.freeze(this.lengths)
    this.id = ``
    this.key = ``
    this.value = ``
    this.optionMin = 0
    this.optionMax = 7
  }
  /**
   * Checks for and executes run-once Options.
   */
  checks() {
    const validTab = (value = -1) => {
      if (Number.isNaN(value)) return false
      if (value < this.optionMin) return false
      if (value > this.optionMax) return false
      return true
    }
    // check #1 - html radio and select groups
    for (const key of this.lengths) {
      this.key = `${key}`
      this._checkLength()
    }
    // check #2 - html checkboxes
    this.boxes.forEach((key, id) => {
      this.id = `${id}`
      this.key = `${key}`
      chrome.storage.local.get(key, (result) => {
        const value = localGet(key, result)
        this.value = value
        this._checkBoolean(id, key, value)
        switch (this.key) {
          case `settingsWebsiteViewer`:
          case `textDOSControlGlyphs`:
          case `textBlinkingCursor`:
            return this.preview()
        }
      })
    })
    // check #3 - options tab
    let key = `optionTab`
    chrome.storage.local.get(key, (result) => {
      const value = localGet(key, result)
      if (validTab(value) === false) {
        localGet(key, null)
      }
    })
    // check #4 - text area
    key = `settingsWebsiteDomains`
    chrome.storage.local.get(key, (result) => {
      localGet(key, result)
    })
    // check #5 - option theme button
    key = `optionClass`
    chrome.storage.local.get(key, (result) => {
      const classes = [
        `is-primary`,
        `is-link`,
        `is-info`,
        `is-success`,
        `is-warning`,
        `is-danger`,
        `is-white`,
        `is-light`,
        `is-dark`,
        `is-black`,
        `is-text`,
        `is-ghost`,
      ]
      Object.freeze(classes)
      let value = localGet(key, result)
      if (!classes.includes(value)) {
        value = localGet(key, null)
      }
      this._colorTheme(value)
    })
  }
  /**
   * Applies a group of Options modifiers and adjustments.
   */
  async updates() {
    this._browser()
    this._management()
    this._platform()
    this._version()
  }
  /**
   * Finds and toggles checkbox boolean values.
   */
  _checkBoolean(id = ``, key = ``, value) {
    const input = document.getElementById(`${id}`),
      fix = this.defaults.get(`${key}`)
    switch (value) {
      case `false`:
        chrome.storage.local.set({ [key]: false })
        return (input.checked = true)
      case `true`:
        chrome.storage.local.set({ [key]: true })
        return (input.checked = true)
      case true:
        return (input.checked = true)
      case false:
        return (input.checked = false)
      default:
        if (fix === ``)
          handleError(`Initialise._checkBoolean(${id}) = "${value}"`)
        chrome.storage.local.set({ [`${key}`]: `${fix}` })
        input.checked = fix === true
    }
  }
  /**
   * Checks for saved radio and select group values and applies them to the Options form.
   * @param {number} [minLength=1] Minimum value length required before the value is stored
   */
  _checkLength(minLength = 1) {
    const key = `${this.key}`
    chrome.storage.local.get(key, (result) => {
      let value = localGet(key, result)
      if (value === null) value = localGet(key, null)
      else if (`${value}`.length < minLength) value = localGet(key, null)
      this.value = value
      switch (key) {
        case `colorsAnsiColorPalette`:
          return this._colorPalette()
        case `settingsInformationHeader`:
          return this._infoHeader()
        case `settingsToolbarIcon`:
          return this._toolbarIcon()
        case `colorsTextPairs`:
          return this._selectColor()
        case `fontFamilyName`:
          return this._selectFont()
        default:
      }
    })
  }
  /**
   * Select a background and button color for the Options tab.
   */
  async _colorTheme(value = ``) {
    const arr = [`button`, `option-theme`, `notification`]
    if (arr.includes(value)) return
    const hero = document.getElementById(`heroSection`),
      src = document.getElementById(`getTheSource`),
      doc = document.getElementById(`getTheDocs`),
      upd = document.getElementById(`enjoyRetroTxt`)
    hero.classList.forEach((heroValue) => {
      if (heroValue === `is-fullheight`) return
      if (!heroValue.startsWith(`is-`)) return
      hero.classList.replace(heroValue, value)
    })
    src.classList.forEach((srcValue) => {
      if (srcValue === `is-inverted`) return
      if (!srcValue.startsWith(`is-`)) return
      src.classList.replace(srcValue, value)
    })
    doc.classList.forEach((docValue) => {
      if (docValue === `is-inverted`) return
      if (!docValue.startsWith(`is-`)) return
      doc.classList.replace(docValue, value)
    })
    upd.classList.forEach((updValue) => {
      upd.classList.replace(updValue, value)
    })
  }
  /**
   * Selects a colour palette radio option.
   */
  async _colorPalette() {
    const palettes = document.getElementsByName(`palette`)
    for (const palette of palettes) {
      if (palette.value === this.value) return (palette.checked = true)
    }
  }
  /**
   * Selects a toolbar icon radio option.
   */
  async _toolbarIcon() {
    const icons = document.getElementsByName(`toolbaricon`)
    for (const icon of icons) {
      if (icon.value === this.value) return (icon.checked = true)
    }
  }
  /**
   * Selects a information header radio option.
   */
  async _infoHeader() {
    const heads = document.getElementsByName(`infoheader`)
    for (const head of heads) {
      if (head.value === this.value) return (head.checked = true)
    }
  }
  /**
   * Selects a colour from the Colour Pair menu.
   */
  async _selectColor() {
    const colors = document.getElementsByName(`text-pair-form`)
    for (const color of colors) {
      if (color.value === this.value) return (color.checked = true)
    }
  }
  /**
   * Selects a text render radio option.
   */
  async _selectEffect() {
    const effects = document.getElementsByName(`effect`)
    for (const effect of effects) {
      if (effect.value === this.value) return (effect.checked = true)
    }
  }
  /**
   * Selects a font radio button from the fonts tab.
   */
  async _selectFont() {
    const fonts = document.getElementsByName(`font`)
    for (const font of fonts) {
      if (font.value === this.value) return (font.checked = true)
    }
  }
  /**
   * Query the render engine to adjust browser specific Options.
   */
  async _browser() {
    switch (WebBrowser()) {
      case Engine.chrome:
        return
      case Engine.firefox:
        return
      default:
        return
    }
  }
  /**
   * Parse the `ExtensionInfo.installType` property to adjust Options.
   */
  async _management() {
    if (typeof chrome.management !== `undefined`) {
      const unit = document.getElementById(`unittest`),
        reload = document.getElementById(`reload`),
        install = document.getElementById(`newInstall`),
        update = document.getElementById(`newUpdate`),
        serve = document.getElementById(`testServe`)
      chrome.management.getSelf((info) => {
        switch (info.installType) {
          // the add-on was installed unpacked from disk
          case `development`:
            // reveal developer links
            unit.style.display = `inline`
            reload.style.display = `inline`
            install.style.display = `inline`
            update.style.display = `inline`
            serve.style.display = `inline`
            install.addEventListener(`click`, () => {
              window.location.assign(
                `${chrome.runtime.getURL(`html/options.html`)}#newinstall`,
              )
              window.location.reload()
            })
            reload.addEventListener(`click`, () => chrome.runtime.reload())
            update.addEventListener(`click`, () => {
              window.location.assign(
                `${chrome.runtime.getURL(`html/options.html`)}#update`,
              )
              window.location.reload()
            })
            return
          case `admin`: // the add-on was installed because of an administrative policy
          case `normal`: // the add-on was installed normally from an install package
          case `sideload`: // the add-on was installed by some other software on the user's computer
          case `other`: // the add-on was installed in some other way
            return
        }
      })
    }
  }
  /**
   * Parse the `runtime.getPlatformInfo` object to adjust Options.
   */
  async _platform() {
    chrome.runtime.getPlatformInfo((info) => {
      const blocks = document.getElementById(`smearBlocksContainer`),
        hr = document.getElementById(`smearBlocksHR`),
        windows = `win`,
        macOS = `mac`,
        android = `android`,
        chromeOS = `cros`,
        linux = `linux`,
        unix = `openbsd`
      const drive = `C:/`,
        schemes = document.getElementsByClassName(`file-url-scheme`)
      switch (info.os) {
        case android:
        case chromeOS:
        case linux:
        case unix:
        case windows:
          if (WebBrowser() === Engine.chrome) {
            hr.style.display = `block`
            blocks.style.display = `inline`
          }
          if (info.os === windows) {
            for (const scheme of schemes) {
              scheme.textContent = `${scheme.textContent}${drive}`
            }
          }
        // fallthrough
        case macOS:
          if (WebBrowser() === Engine.firefox) {
            hr.style.display = `none`
            blocks.style.display = `none`
          }
          return
      }
    })
  }
  /**
   * Returns the RetroTxt version for the Options About tab.
   */
  async _version() {
    const data = chrome.runtime.getManifest(),
      element = document.getElementById(`manifest`)
    if (`version` in data) return (element.textContent = `${data.version}`)
    element.textContent = `${data.version}`
  }
}
/**
 * Combinations of paired themed colours for text.
 * @class ColorPair
 */
class ColorPair {
  constructor() {
    this.pairForm = document.getElementsByName(`text-pair-form`)
    this.sampleText = document.getElementById(`sampleTerminal`)
    // colour pair ids and names
    // the full id also prefixes `theme-`; i.e `theme-amiga`
    this.pairs = new Map()
      .set(`amiga`, `Amiga`)
      .set(`appleii`, `Apple II`)
      .set(`atarist`, `Atari ST`)
      .set(`c64`, `Commodore 64`)
      .set(`msdos`, `MS-DOS`)
      .set(`windows`, `Windows`)
      .set(`custom`, `customised theme`)
  }
  /**
   *  Event listeners.
   */
  async listen() {
    const labels =
      document.forms[`text-pair-form`].getElementsByTagName(`label`)
    labels: for (const label of labels) {
      const input = document.getElementById(`${label.htmlFor}`)
      // skip labels with no radio inputs
      if (
        input === null ||
        typeof input.name === `undefined` ||
        input.name !== `text-pair-form`
      )
        continue labels
      // label listeners
      label.onmouseup = () => {
        this.value = `${input.value}`
        this._select()
        this._storageSave()
      }
      // input listeners
      // labels in the text-pair-form are standalone and dont contain input elements
      input.onchange = () => {
        this.value = `${input.value}`
        this._select()
        this._storageSave()
      }
    }
  }
  /**
   * Choose a theme from the menu of the Colour Pair options.
   */
  async storageLoad() {
    const key = `colorsTextPairs`
    chrome.storage.local.get(key, (result) => {
      const value = localGet(key, result)
      this.value = value
      this._sample()
    })
  }
  /**
   * Get the colour pair name from an id value.
   * @returns string
   */
  _name() {
    const pair = this.value.replace(/theme-/g, ``)
    if (this.pairs.has(pair) === false) return pair.replace(/-/g, ` `)
    return this.pairs.get(pair)
  }
  /**
   * Applies the CSS class of a colour pair to the sample text.
   */
  async _sample() {
    RemoveTextPairs(this.sampleText)
    if (this.value.length > 0) {
      this.sampleText.style.color = ``
      this.sampleText.style.backgroundColor = ``
      this.sampleText.classList.add(`${this.value}-bg`)
      this.sampleText.classList.add(`${this.value}-fg`)
    }
  }
  /**
   * Choose a theme from the select menu of the Colour Pair options.
   */
  async _select() {
    const status = document.getElementById(`status`)
    status.textContent = `Saved ${this._name(
      this.value,
    )} ${chrome.i18n.getMessage(`color`)} pair`
    this._sample(this.value)
  }
  /**
   * Save the id of a Colour text pair to local storage.
   * If an id is not provided the stored item will be deleted.
   */
  _storageSave() {
    localStore(`colorsTextPairs`, `${this.value}`)
  }
}
/**
 * Combination of user supplied theme colours for text.
 * @class ColorCustomPair
 */
class ColorCustomPair {
  constructor(id = ``) {
    switch (id) {
      case `background`:
        this.id = `customColorBG`
        this.mapId = `colorsCustomBackground`
        this.property = `backgroundColor`
        this.title = `Background`
        break
      case `foreground`:
        this.id = `customColorFG`
        this.mapId = `colorsCustomForeground`
        this.property = `color`
        this.title = `Foreground`
        break
      default:
        return handleError(`ColorCustomPair.constructor(id) = "${this.id}"`)
    }
    this.input = document.getElementById(`${this.id}`)
    this.pairForm = document.getElementById(`textPairForm`)
    this.sampleText = document.getElementById(`sampleTerminal`)
    this.valid = false
    this.defaults = new OptionsReset()
    this.preview = document.getElementById(`textPairCustomContainer`)
    this.previewFont = document.getElementById(`textPairCustomLabel`)
  }
  /**
   * Event listeners for `<input>` and `<select>` elements.
   */
  async listen() {
    if (this.input === null)
      return console.error(
        `custom text pair element "${this.id}" cannot be found`,
      )
    this.input.addEventListener(`input`, () => this._lengthCheck())
    // updates the sample whenever 'Custom' is selected in the Color pair menu
    this.pairForm.addEventListener(
      `change`,
      () => {
        if (this._value() === `theme-custom`) this._update(false)
      },
      {
        passive: true,
      },
    )
  }
  /**
   * Apply text effects on the sample text.
   */
  async storageLoad() {
    const key = `${this.mapId}`
    chrome.storage.local.get(key, (result) => {
      const value = localGet(key, result)
      this.input.value = `${value}`
      const custom = this._value() === `theme-custom`
      this._previewColor(custom)
      if (custom) this._update(false)
    })
  }
  /**
   * Validates the length of the `<input>` element value.
   * Resets the value to a default when the length is `0`.
   */
  _lengthCheck() {
    if (this.input.value.length === 0)
      this.input.value = this.defaults.get(this.mapId)
    this._update()
    this.pairForm.value = `theme-custom`
    this._select(`theme-custom`)
  }
  /**
   * Previews the selected background or foreground colour in the custom value table.
   * @param [color=``] CSS color or background color value.
   */
  async _previewColor(updateSample = false) {
    if (updateSample)
      this.sampleText.style[this.property] = `${this.input.value}`
    if (this.mapId === `colorsCustomForeground`)
      this.previewFont.style.color = `${this.input.value}`
    else if (this.mapId === `colorsCustomBackground`)
      this.preview.style.backgroundColor = `${this.input.value}`
  }
  _select(value = ``) {
    const form = document.getElementsByName("text-pair-form")
    form.forEach((element) => {
      if (element.value === `${value}`) element.checked = true
    })
  }
  /**
   * Previews and saves a custom colour pair change.
   * @param [save=true] Save `input.value` to the local storage?
   */
  _update(save = true) {
    const colorTest = (value = ``) => {
      const status = document.getElementById(`status`),
        red = `#d9534f`
      // if you try and apply an invalid `style.color` or
      // `style.backgroundColor` to an element, it will return an empty value.
      if (value === ``) {
        status.textContent += `value is invalid. `
        this.input.style.color = red
        return false
      }
      status.textContent += `${value} saved. `
      this.input.style.color = `inherit`
      return true
    }
    // reset sample text
    if (`value` in this.input) this.input.value = this.input.value.toLowerCase()
    document.getElementById(`status`).textContent = `${this.title} `
    const previousColor = this.sampleText.style[this.property]
    // check the input colour is valid
    this.sampleText.style[this.property] = `${this.input.value}`
    // if the new colour style is invalid, the browser will instead return the
    // previous colour
    if (this.sampleText.style[this.property] === previousColor) {
      colorTest(``)
      this.valid = false
    } else this.valid = colorTest(this.sampleText.style[this.property])
    if (this.valid === false)
      return (this.sampleText.style[this.property] = previousColor)
    if (save === true) {
      localStore(`${this.mapId}`, `${this.input.value}`)
      localStore(`colorsTextPairs`, `theme-custom`)
    }
    this._previewColor()
  }
  _value() {
    const v = `${Array.from(document.getElementsByName("text-pair-form")).find(
      (r) => r.checked,
    )}`
    return v.value
  }
}
/**
 * Radio `<input>` element groups.
 * @class Radios
 */
class Radios {
  /**
   * Creates an instance of Radios.
   * @param [storageId=``] Local storage item key,
   * either `colorsAnsiColorPalette` or `fontFamilyName`
   */
  constructor(storageId = ``) {
    this.sample = document.getElementById(`sampleTerminal`)
    this.feedback = ``
    this.formId = ``
    this.formName = ``
    this.storageId = `${storageId}`
    this.value = ``
    this.skip = false
    switch (storageId) {
      case `colorsAnsiColorPalette`:
        this.feedback = `palette`
        this.formId = `colorPaletteForm`
        this.formName = `color-palette-form`
        return (this.skip = true)
      case `settingsInformationHeader`:
        this.feedback = `info`
        this.formId = `info-form`
        this.formName = `infoheader`
        return (this.skip = true)
      case `settingsToolbarIcon`:
        this.feedback = `icon`
        this.formId = `toolbarForm`
        this.formName = `toolbaricon`
        return (this.skip = true)
      case `fontFamilyName`:
        this.feedback = `font selection`
        this.formId = `fontSuggestions`
        return (this.formName = `fonts`)
      default:
        return handleError(`Radios.constructor '${storageId}'`)
    }
  }
  /**
   * Apply onClick and mouseOver event listeners to radio buttons.
   */
  async listen() {
    const names = document.forms[this.formName]
    if (typeof names === `undefined`)
      console.error(`form ${this.formName} is undefined`)
    const labels = names.getElementsByTagName(`label`),
      status = document.getElementById(`status`)
    labels: for (const label of labels) {
      const input = label.getElementsByTagName(`input`)[0]
      // skip labels with no radio inputs
      if (typeof input === `undefined`) {
        console.error(`radio input for ${this.formName} is undefined`)
        continue labels
      }
      // radio event listeners
      label.onchange = () => {
        this.value = `${input.value}`
        const font = new FontFamily(this.value)
        font.set()
        status.textContent = `Saved ${this.feedback} ${font.family}!`
        this.storageSave()
      }
      // skip as these do not effect Sample Text
      if (this.skip) continue labels
      label.onmouseover = () => {
        this.value = `${input.value}`
        const font = new FontFamily(this.value)
        font.set()
        status.textContent = `Preview of ${this.feedback} ${font.family}`
        this.preview()
      }
      label.onkeyup = () => {
        this.value = `${input.value}`
        const font = new FontFamily(this.value)
        font.set()
        status.textContent = `Preview of ${this.feedback} ${font.family}`
        this.preview()
      }
      // reset sample text when the mouse is out
      if (label.htmlFor.length < 1) continue labels
      const radio = document.getElementById(label.htmlFor),
        form = document.getElementById(`${this.formId}`)
      if (typeof form === `undefined`) {
        console.error(`form ${this.formId} is undefined`)
        continue labels
      }
      form.addEventListener(`mouseleave`, () => {
        if (radio.checked === true) {
          const font = new FontFamily(radio.value)
          font.set()
          status.textContent = `Using ${this.feedback} ${font.family}`
          switch (this.storageId) {
            case `fontFamilyName`:
              this.value = `${radio.value}`
              return this.preview()
            // case `textRenderEffect`:
            //   return ToggleTextEffect(radio.value, this.sample)
          }
        }
      })
    }
  }
  /**
   * Load and preview the saved radio selection.
   */
  async storageLoad() {
    const key = `${this.storageId}`
    chrome.storage.local.get(key, (result) => {
      const value = localGet(key, result)
      this.value = `${value}`
      this.preview()
    })
  }
  /**
   * Save the id of radio selection to the local storage.
   */
  storageSave() {
    localStore(`${this.storageId}`, `${this.value}`)
  }
}
/**
 * Information header.
 * @class Header
 */
class Header extends Radios {
  constructor() {
    super(`settingsInformationHeader`)
  }
  async preview() {
    // do not remove
  }
}
/**
 * Toolbar icon.
 * @class Header
 */
class Toolbar extends Radios {
  constructor() {
    super(`settingsToolbarIcon`)
  }
  async preview() {
    // do not remove
  }
}
/**
 * Default colour palette.
 * @class Palette
 */
class Palette extends Radios {
  constructor() {
    super(`colorsAnsiColorPalette`)
  }
  async preview() {
    // do not remove
  }
}
/**
 * Font family selection.
 * @class Fonts
 */
class Fonts extends Radios {
  constructor() {
    super(`fontFamilyName`)
    this.spanSamples = document.getElementsByName(`display-sample-text`)
  }
  /**
   * Swaps out the font family on the sample and display text previews.
   */
  async preview() {
    if (this.sample.classList === null)
      return console.error(`font preview could not update the sample element.`)
    this.remove(this.sample)
    this.sample.classList.add(`font-${this.value}`)
    if (this.spanSamples.length <= 0)
      return console.error(
        `font preview could not update the display tab sample text elements.`,
      )
    for (const elm of this.spanSamples) {
      if (elm.classList === null) continue
      this.remove(elm)
      elm.classList.add(`font-${this.value}`)
    }
  }
  /**
   * Removes from the element all class names prefixed with `font-`.
   * @param {*} elm HTML element to apply
   */
  async remove(elm = HTMLElement) {
    if (typeof elm === `undefined`)
      return console.error(`font remove could not find the element.`)
    const keys = elm.className.split(` `)
    // loop through and remove any font- prefixed classes
    for (const name of keys) {
      if (name.startsWith(`font-`)) elm.classList.remove(name)
    }
  }
}
/**
 * Text size selection.
 * @class TextSize
 */
class TextSize {
  constructor() {
    this.textSize = document.getElementById(`textSize`)
    this.status = document.getElementById(`status`)
    this.value = this.textSize.value
    this.m = new Map()
      .set("1", "100%")
      .set("2", "110%")
      .set("3", "125%")
      .set("4", "150%")
      .set("5", "175%")
      .set("6", "200%")
      .set("7", "300%")
      .set("8", "400%")
  }
  /**
   * Event listener for the `<select>` element.
   */
  async listen() {
    this.textSize.addEventListener(
      `change`,
      () => {
        const min = 1,
          max = 8
        this.value = this.textSize.value
        if (this.value < min || this.value > max)
          return console.error(
            `text size select value "${this.value}" must be between ${min} and ${max}`,
          )
        this.status.textContent = `Saved text size selection ${this.value}`
        this.storageSave()
        document.getElementById(`textSizeOutput`).value = this.m.get(this.value)
      },
      { passive: true },
    )
  }
  /**
   * Loads and selects the saved text size setting.
   */
  async storageLoad() {
    const key = `textFontSize`
    chrome.storage.local.get(key, (result) => {
      const value = localGet(key, result)
      this.textSize.value = value
      document.getElementById(`textSizeOutput`).textContent = this.m.get(
        this.textSize.value,
      )
    })
  }
  /**
   * Save text size selection to the local storage.
   */
  storageSave() {
    localStore(`textFontSize`, `${this.value}`)
  }
}
/**
 * Line height selection.
 * @class LineHeight
 */
class LineHeight {
  constructor() {
    this.lineHeight = document.getElementById(`lineHeight`)
    this.status = document.getElementById(`status`)
    this.value = this.lineHeight.value
    this.m = new Map()
      .set("1", "100%")
      .set("2", "110%")
      .set("3", "125%")
      .set("4", "150%")
      .set("5", "175%")
      .set("6", "200%")
      .set("7", "300%")
      .set("8", "400%")
  }
  /**
   * Event listener for the `<select>` element.
   */
  async listen() {
    this.lineHeight.addEventListener(
      `change`,
      () => {
        const min = 1,
          max = 8
        this.value = this.lineHeight.value
        if (this.value < min || this.value > max)
          return console.error(
            `line height select value "${this.value}" must be between ${min} and ${max}`,
          )
        this.status.textContent = `Saved line height selection ${this.value}`
        this.storageSave()
        document.getElementById(`lineHeightOutput`).value = this.m.get(
          this.value,
        )
      },
      { passive: true },
    )
  }
  /**
   * Loads and selects the saved line height setting.
   */
  async storageLoad() {
    const key = `textLineHeight`
    chrome.storage.local.get(key, (result) => {
      const value = localGet(key, result)
      this.lineHeight.value = value
      document.getElementById(`lineHeightOutput`).textContent = this.m.get(
        this.lineHeight.value,
      )
    })
  }
  /**
   * Save line height selection to the local storage.
   */
  storageSave() {
    localStore(`textLineHeight`, `${this.value}`)
  }
}
/**
 * Options dialogue hero tab selection.
 * @class Hero
 */
class Hero {
  constructor() {
    this.active = `is-active`
    this.btn = `hero`
    this.item = `navbar-item`
    this.page = `content`
    this.fonts = 4
    this.display = 5
    this.start = Initialise.optionMin
    this.last = Initialise.optionMax
    this.content = document.getElementsByClassName(`tabcontent`)
    this.tabs = document.getElementsByClassName(this.item)
  }
  /**
   * Event listeners.
   */
  async listen() {
    // Hero buttons
    Array.prototype.filter.call(this.tabs, (page) => {
      if (typeof page === `undefined`) return
      page.addEventListener(`click`, () => {
        const id = `${page.id.charAt(4)}`
        this.reveal(id)
        this.storageSave(id)
        // clear all then apply active class to the button element
        const buttons = document.getElementsByClassName(this.item)
        for (const button of buttons) {
          button.classList.remove(this.active)
        }
        const button = document.getElementById(`hero${id}`)
        button.classList.add(this.active)
      })
    })
    // Hero navigator burger button
    document.addEventListener(`DOMContentLoaded`, () => {
      const burgers = Array.prototype.slice.call(
        document.querySelectorAll(`.navbar-burger`),
        0,
      )
      if (burgers.length > 0) {
        // Add a click event on each of them
        burgers.forEach((el) => {
          el.addEventListener(`click`, () => {
            // Get the target from the "data-target" attribute
            const target = el.dataset.target,
              $target = document.getElementById(target)
            // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
            el.classList.toggle(this.active)
            $target.classList.toggle(this.active)
          })
        })
      }
    })
  }
  /**
   * Refreshes the Options dialogue after a tab is selected.
   * @param {number} [selected=0] Numeric tab id
   */
  async reveal(selected = 0) {
    const value = parseInt(selected, 10)
    if (Number.isNaN(value) || value < this.start || value > this.last)
      return console.error(`Tab value ${value} is invalid`)

    const r = `RetroTxt `
    const o = `options`
    switch (value) {
      case 1:
        document.title = `${r}credits`
        break
      case 2:
        document.title = `${r}samples`
        break
      case 3:
        document.title = `${r}useful links`
        break
      case 4:
        document.title = `${r}fonts`
        break
      case 5:
        document.title = `${r}display ${o}`
        break
      case 6:
        document.title = `${r}settings`
        break
      default:
        document.title = r + o
    }
    // iterate over each <section> element
    Array.prototype.filter.call(this.content, (page) => {
      if (typeof page !== `undefined`) {
        page.style.display = `none`
      }
    })
    // iterate over each `<button class="tablinks">` element
    const buttons = document.getElementsByClassName(this.item)
    Array.prototype.filter.call(buttons, (button) => {
      return button.classList.remove(this.active)
    })
    // special handler for omnibox `rt tests` command
    const unitTests = 99
    if (value === unitTests) {
      chrome.management.getSelf((info) => {
        if (info.installType !== `development`) return
        return location.replace(`/test/index.html?hidepassed`)
      })
    }
    // special hander for the documentation link
    // documentation used to be optionTab value 7
    const docs = 7
    if (value === docs) {
      chrome.management.getSelf((info) => {
        if (info.installType !== `development`) return
        return location.replace(`https://docs.retrotxt.com`)
      })
    }
    // Reveal the current tab
    const page = document.getElementById(`${this.page}${selected}`),
      button = document.getElementById(`${this.btn}${selected}`)
    if (page !== null && typeof page.style.display !== `undefined`) {
      page.style.display = `inline`
      button.classList.add(this.active)
    }
    // Set the sample-container
    const sample = document.getElementById(`sample-container`),
      status = document.getElementById(`status`)
    if (sample === null || status === null) return
    status.textContent = `${button.textContent.trim()} tab selected`
    switch (value) {
      case this.fonts:
      case this.display:
        sample.style.display = `flex`
        break
      default:
        sample.style.display = `none`
    }
  }
  /**
   * Load and apply the active tab selection.
   */
  async storageLoad() {
    const key = `optionTab`
    chrome.storage.local.get(key, (result) => {
      const value = localGet(key, result)
      this.reveal(parseInt(value, 10))
    })
  }
  /**
   * Save the active tab to the local storage.
   * @param {string} [id=``] Tab id
   */
  storageSave(id = ``) {
    localStore(`optionTab`, id)
  }
}

class Backup {
  async newInstall() {
    chrome.storage.sync.get(null, (items) => {
      const count = Object.keys(items).length
      if (!items || count === 0)
        return console.info(`No storage.sync backup found.`)
      const ok = confirm(
        `Use sync storage settings, found ${count} configurations?`,
      )
      // if not okay, continue with the new install page
      if (!ok) return
      // if okay, restore the sync storage settings
      this._restore(false)
      // then redirect to the default options page
      document.getElementById(`hero0`).click()
      // then reload the page with the new settings
      window.location.reload()
    })
  }
  async listen() {
    const backup = document.getElementById(`syncStoreBackup`)
    backup.addEventListener(`click`, () => {
      chrome.storage.sync.get(null, (items) => {
        if (Object.keys(items).length !== 0) {
          const ok = confirm(`Overwrite sync storage?`)
          if (!ok) return
        }
        this._backup()
      })
    })
    const restore = document.getElementById(`syncStoreRestore`)
    restore.addEventListener(`click`, () => {
      chrome.storage.sync.get(null, (items) => {
        if (!items || Object.keys(items).length === 0)
          return console.info(`No storage.sync backup found.`)
        const ok = confirm(`Overwrite local storage?`)
        if (!ok) return
        this._restore()
      })
    })
    const clear = document.getElementById(`syncStoreClear`)
    clear.addEventListener(`click`, () => {
      chrome.storage.sync.get(null, (items) => {
        if (!items || Object.keys(items).length === 0)
          return console.info(`No storage.sync backup found.`)
        const ok = confirm(`Delete sync storage?`)
        if (!ok) return
        chrome.storage.sync.clear()
        this.storageLoad()
      })
    })
    const reset = document.getElementById(`syncStoreReset`)
    reset.addEventListener(`click`, () => {
      const ok = confirm(`Reset all fonts, display, and settings?`)
      if (!ok) return
      this._reset()
    })
  }
  async storageLoad() {
    chrome.storage.sync.getBytesInUse(null, (result) => {
      const info = document.getElementById(`syncStoreSize`)
      if (result === 0) return (info.textContent = `unused`)
      chrome.storage.sync.get(null, (items) => {
        const count = Object.keys(items).length
        info.textContent = `${count} configuration`
        if (count > 1) info.textContent += `s`
        info.textContent += ` (${HumaniseFS(result)})`
      })
    })
  }
  _backup() {
    chrome.storage.local.get(null, (items) => {
      if (Object.keys(items).length === 0)
        return console.info(`No storage.local backup found.`)
      chrome.storage.sync.set(
        {
          ansiColumnWrap: items.ansiColumnWrap,
          ansiPageWrap: items.ansiPageWrap,
          ansiUseIceColors: items.ansiUseIceColors,
          colorsAnsiColorPalette: items.colorsAnsiColorPalette,
          colorsCustomBackground: items.colorsCustomBackground,
          colorsCustomForeground: items.colorsCustomForeground,
          colorsTextPairs: items.colorsTextPairs,
          fontFamilyName: items.fontFamilyName,
          linkifyHyperlinks: items.linkifyHyperlinks,
          linkifyValidate: items.linkifyValidate,
          optionClass: items.optionClass,
          settingsInformationHeader: items.settingsInformationHeader,
          settingsNewUpdateNotice: items.settingsNewUpdateNotice,
          settingsToolbarIcon: items.settingsToolbarIcon,
          settingsWebsiteDomains: items.settingsWebsiteDomains,
          textAccurate9pxFonts: items.textAccurate9pxFonts,
          textBackgroundScanlines: items.textBackgroundScanlines,
          textBlinkingCursor: items.textBlinkingCursor,
          textCenterAlign: items.textCenterAlign,
          textDOSControlGlyphs: items.textDOSControlGlyphs,
          textFontSize: items.textFontSize,
          textLineHeight: items.textLineHeight,
          textRenderEffect: items.textRenderEffect,
          textSmearBlockCharacters: items.textSmearBlockCharacters,
        },
        () => {
          this.storageLoad()
          console.log(`Backup to storage.sync is complete.`)
        },
      )
    })
  }
  _reset(reload = true) {
    const values = new OptionsReset().options
    values.forEach((value, index) => {
      switch (index) {
        case `schemesPermitted`:
          break
        case `ansiColumnWrap`:
        case `ansiPageWrap`:
        case `ansiUseIceColors`:
        case `colorsAnsiColorPalette`:
        case `colorsCustomBackground`:
        case `colorsCustomForeground`:
        case `colorsTextPairs`:
        case `fontFamilyName`:
        case `linkifyHyperlinks`:
        case `linkifyValidate`:
        case `optionClass`:
        case `optionTab`:
        case `settingsInformationHeader`:
        case `settingsNewUpdateNotice`:
        case `settingsToolbarIcon`:
        case `settingsWebsiteDomains`:
        case `settingsWebsiteViewer`:
        case `textAccurate9pxFonts`:
        case `textBackgroundScanlines`:
        case `textBlinkingCursor`:
        case `textCenterAlign`:
        case `textDOSControlGlyphs`:
        case `textLineHeight`:
        case `textFontSize`:
        case `textRenderEffect`:
        case `textSmearBlockCharacters`:
          chrome.storage.local.set({ [index]: value })
          break
        default:
          console.warn(`Unknown option ${index} with value ${value}`)
      }
    })
    if (reload) chrome.tabs.reload()
  }
  _restore(reload = true) {
    chrome.storage.sync.get(null, (items) => {
      if (!items || Object.keys(items).length === 0)
        return console.info(`No storage.sync backup found.`)
      for (const key in items) {
        if (Object.prototype.hasOwnProperty.call(items, key)) {
          chrome.storage.local.set({ [key]: items[key] }, () => {
            console.log(`Restored ${key}.`)
          })
        }
      }
      if (reload) chrome.tabs.reload()
    })
  }
}

/**
 * Run RetroTxt on text files hosted on these websites.
 * @class Hosts
 * @extends {Configuration}
 */
class Hosts {
  constructor() {
    this.minLength = 4
    this.hostnames = []
    this.status = document.getElementById(`status`)
    this.template = document.getElementById(`templateHost`)
    this.submit = document.getElementById(`submitHost`)
    this.input = document.getElementById(`newHost`)
    this.remove = document.getElementById(`removeSuggestedDomains`)
    this.include = document.getElementById(`includeSuggestedDomains`)
    this.suggestions = new Configuration().domains()
    Object.freeze(this.suggestions)
  }
  /**
   * Input and button listeners.
   */
  async listen() {
    // add button
    this.submit.addEventListener(`click`, () => {
      this._add(this.input.value)
      this._storageSave()
    })
    // hostname press enter key
    this.input.addEventListener(`keypress`, (e) => {
      if (e.key !== `Enter`) return
      this.submit.click()
    })
    // hostname input
    this.input.addEventListener(`input`, () => {
      try {
        // when URLs are pasted, attempt to return just the host
        const url = new URL(`${this.input.value}`)
        this.input.value = url.host
        // eslint-disable-next-line no-unused-vars
      } catch (e) {
        // this catch is okay, as a host was probably pasted
      } finally {
        this._check(this.input.value)
      }
    })
    // website suggestions
    this.remove.addEventListener(`click`, () => {
      this.removeSuggestions()
    })
    this.include.addEventListener(`click`, () => {
      this.restoreSuggestions()
    })
  }
  /**
   * Remove all suggested hostnames.
   */
  removeSuggestions() {
    this.status.textContent = `Removed domains suggestions`
    const hosts = new Configuration().domains(),
      key = `settingsWebsiteDomains`
    chrome.storage.local.get(key, (result) => {
      let keep = []
      for (const host of result[key]) {
        if (!hosts.includes(host)) {
          keep = keep.concat(host)
        }
      }
      localStore(`settingsWebsiteDomains`, keep)
      this._clear()
      for (const host of keep) {
        this._add(host, false)
      }
      this.hostnames = keep
    })
  }
  /**
   * Reset and restore all suggested hostnames.
   */
  restoreSuggestions() {
    this.status.textContent = `Reset hostnames to defaults`
    const hosts = new Configuration().domains(),
      key = `settingsWebsiteDomains`
    chrome.storage.local.get(key, (result) => {
      const mergeNoDupes = [...new Set([...result[key], ...hosts])]
      localStore(`settingsWebsiteDomains`, mergeNoDupes)
      this._clear()
      for (const host of mergeNoDupes) {
        this._add(host, false)
        this.hostnames = [...this.hostnames, host]
      }
    })
  }
  /**
   * Load and display host tags.
   */
  async storageLoad() {
    const key = `settingsWebsiteDomains`
    chrome.storage.local.get(key, (result) => {
      const hosts = localGet(key, result)
      for (const host of hosts) {
        this._add(host, true)
      }
    })
  }
  /**
   * Adds a hostname tag with a working link and delete button.
   */

  async _add(name = ``, init = false) {
    if (name.length < this.minLength) return
    const hostname = DOMPurify.sanitize(name, { USE_PROFILES: { html: true } })
    const tags = document.getElementById(`hostTags`),
      tag = this.template.cloneNode(true),
      anchor = tag.childNodes[1].childNodes[1],
      urls = this.hostnames,
      suggestion = this._isSuggestion(hostname)
    anchor.textContent = hostname
    switch (hostname) {
      case `textfiles.com`:
      case `uncreativelabs.net`:
        anchor.href = `http://${hostname}`
        break
      default:
        anchor.href = `https://${hostname}`
    }
    if (!suggestion) anchor.classList.remove(`is-light`)
    this.input.value = ``
    this.submit.disabled = true
    tag.style.display = `inline`
    tag.removeAttribute(`id`)
    tags.append(tag)
    urls.push(hostname)
    if (!init) this.status.textContent = `Added ${hostname}`
    tag.childNodes[1].childNodes[2].nextSibling.addEventListener(
      `click`,
      (e) => {
        this._delete(e)
      },
    )
  }
  /**
   * Checks a hostname to modify the delete button state.
   */
  async _check(hostname = ``) {
    if (hostname.length < this.minLength) return (this.submit.disabled = true)
    const duplicates = [...this.hostnames, `retrotxt.com`]
    for (const dupe of duplicates) {
      if (dupe === hostname) return (this.submit.disabled = true)
    }
    if (hostname.includes(`/`)) return (this.submit.disabled = true)
    try {
      // test that the hostname can be used as a URL
      // eslint-disable-next-line no-new
      new URL(`https://${hostname}`)
      this.submit.disabled = false
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      this.submit.disabled = true
    }
  }
  /**
   * Clear the hostname tags except for the locked retrotxt.com tag.
   */
  _clear() {
    const parent = document.getElementById(`hostTags`)
    Array.from(parent.children).forEach((child, index) => {
      switch (child.id) {
        case `retrotxtCom`:
        case `templateHost`:
          return
      }
      Console(`Remove element child #${index}: ${child.textContent.trim()}`)
      child.remove()
    })
  }
  /**
   * Is the hostname one of the default domains supplied by RetroTxt?
   */
  _isSuggestion(hostname = ``) {
    for (const domain of this.suggestions) {
      // eslint-disable-next-line eqeqeq
      if (hostname == domain) return true
    }
    return false
  }
  /**
   * Deletes a hostname tag and button.
   */
  _delete(e) {
    const v = e.target.previousSibling.previousSibling.textContent
    this.hostnames = this.hostnames.filter((url) => url !== v)
    this._storageSave()
    e.target.parentNode.parentNode.remove()
    this.status.textContent = `Removed ${v}`
  }
  /**
   * Save the hostnames to local storage.
   */
  _storageSave() {
    const uniqueHosts = this.hostnames.filter((data, index) => {
      return this.hostnames.indexOf(data) === index
    })
    localStore(`settingsWebsiteDomains`, uniqueHosts)
  }
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (typeof qunit !== `undefined`) return
  if (namespace !== `local`) return
  const changedItems = Object.keys(changes)
  const hero = new Hero()
  for (const item of changedItems) {
    if (typeof changes[item].newValue === `undefined`) {
      console.log(
        `Local storage item ${item}: is now undefined, assumed the host tab was closed.`,
      )
    }
    if (item === `optionTab`) hero.storageLoad()
  }
})

// IIFE, self-invoking anonymous function that runs whenever the Options dialogue is opened.
;(() => {
  if (typeof qunit !== `undefined`) return
  SetIcon()
  const init = new Initialise()
  // lookup and applies checked, selections, active, once the HTML is loaded and parsed
  document.addEventListener(`DOMContentLoaded`, init.checks())
  // modifies `html/options.html`
  init.updates()
  // restore any saved options and apply event listeners
  const cb = new CheckBox()
  cb.storageLoad()
  cb.listen()
  const cp = new ColorPair()
  cp.storageLoad()
  cp.listen()
  const ccb = new ColorCustomPair(`background`),
    ccf = new ColorCustomPair(`foreground`)
  ccb.storageLoad()
  ccf.storageLoad()
  ccb.listen()
  ccf.listen()
  const font = new Fonts()
  font.storageLoad()
  font.listen()
  const head = new Header()
  head.storageLoad()
  head.listen()
  const tb = new Toolbar()
  tb.storageLoad()
  tb.listen()
  const pal = new Palette()
  pal.storageLoad()
  pal.listen()
  const ts = new TextSize()
  ts.storageLoad()
  ts.listen()
  const lh = new LineHeight()
  lh.storageLoad()
  lh.listen()
  const hero = new Hero()
  hero.storageLoad()
  hero.listen()
  const html = new HTML()
  html.hideNotice()
  html.setLocalization(`changesLink`, `url_new`)
  html.showBrowser()
  html.showRuntimeInfo()
  html.welcome()
  const hosts = new Hosts()
  hosts.storageLoad()
  hosts.listen()
  const backup = new Backup()
  backup.storageLoad()
  backup.listen()
  // apply regional English edits
  localizeWord(`color`, `msg-color`)
  localizeWord(`center`, `msg-center`)
  localizeWord(`artifact`, `msg-artifact`)
  localizeWord(`customize`, `msg-customize`)
  localizeWord(`Minimalize`, `msg-minimalize`)
  // capitalize the first letter
  const customColorText = document
    .getElementById(`customColorValues`)
    .getElementsByClassName(`msg-color`)[0]
  customColorText.textContent = customColorText.textContent.toLowerCase()
  //handleError(`false positive test`)

  // handlers used by the popup.js module
  handlePopup()
  window.onhashchange = () => handlePopup()
})()

/**
 * Handles the popup behavior based on the document location hash.
 */
function handlePopup() {
  switch (document.location.hash) {
    case `#top?t=fonts`:
      document.getElementById(`hero4`).click()
      document.getElementById(`newHost`).focus()
      break
    case `#top?t=display`:
      document.getElementById(`hero5`).click()
      document.getElementById(`newHost`).focus()
      break
    case `#top?t=settings`:
      document.getElementById(`hero6`).click()
      document.getElementById(`newHost`).focus()
      break
  }
}

/* global CheckLastError CheckRange Configuration Console DOMPurify Engine
FontFamily HumaniseFS LinkDetails OptionsReset PlatformArch PlatformOS
RemoveTextPairs SetIcon ToggleScanlines WebBrowser */
