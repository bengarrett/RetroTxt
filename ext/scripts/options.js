// filename: options.js
//
// These functions and classes are exclusively used by the Options tab.
//
/*global CheckLastError CheckRange Configuration Console Engine FontFamily OptionsReset RemoveTextPairs ToggleScanlines ToggleTextEffect WebBrowser */
"use strict"

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
        `argument '${name}' should be a 'boolean' (true|false) instead of '${typeof actual}'`
      )
    case `number`:
      return handleError(
        `argument '${name}' should be a 'number' (unsigned) '${typeof actual}'`
      )
    case `string`:
      return handleError(
        `argument '${name}' should be a 'string' of text instead of '${typeof actual}'`
      )
    default:
      return handleError(
        `argument '${name}' needs to be a '${expected}' instead of '${typeof actual}'`
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
    document.getElementById(`error`).style.display = `inline`
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
 * Update a `localStorage` item with a new value.
 * When the value is left empty the local storage item is deleted.
 * @param {string} [key=``] Id of the storage item
 * @param {string} [value=``] Value to store
 */
function localStore(key = ``, value = ``) {
  switch (value) {
    case ``:
      localStorage.removeItem(`${key}`)
      chrome.storage.local.remove(`${key}`)
      Console(`localStore('${key}', removed)`)
      return
    default:
      localStorage.setItem(`${key}`, `${value}`)
      // Extension storage requires a key/value pair object
      chrome.storage.local.set({ [key]: `${value}` })
      Console(`localStore('${key}', '${value}')`)
  }
}

/**
 * User interactions for the options page.
 * @class HTML
 */
class HTML {
  constructor() {}
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
      document
        .getElementById(`newInstallSamples`)
        .addEventListener(`click`, () => {
          document.getElementById(`hero2`).click()
        })
      document
        .getElementById(`newInstallFonts`)
        .addEventListener(`click`, () => {
          document.getElementById(`hero4`).click()
        })
      document
        .getElementById(`newInstallDisplay`)
        .addEventListener(`click`, () => {
          document.getElementById(`hero5`).click()
        })
      document
        .getElementById(`newInstallSettings`)
        .addEventListener(`click`, () => {
          document.getElementById(`hero6`).click()
        })
      return
    }
    if (location.hash.includes(`#display`)) {
      document.getElementById(`hero5`).click()
      // drop the #display in the url which conflict with the option tabs
      location.replace(`${chrome.runtime.getURL(`html/options.html`)}`)
    }
  }
  /**
   * Hide future update notices for RetroTxt.
   */
  async hideNotice() {
    const k = `updateNotice`
    document.getElementById(`updateNoticeBtn`).addEventListener(`click`, () => {
      const result = confirm(
        "Stop this update tab from launching with future RetroTxt upgrades?"
      )
      if (!result) return
      localStorage.setItem(k, false)
      chrome.storage.local.set({ [k]: false })
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
    if (m.options_ui !== undefined && m.options_ui.page !== undefined) {
      const titles = Array.from(document.getElementsByName(`browser-title`)),
        fontScheme = document.getElementById(`settingsFont`)
      let browser,
        setting = ``
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
  }
}

/**
 * Grants and removes Extension access permissions.
 * see: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/permissions
 * match patterns: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns
 * @class Security
 */
class Security {
  /**
   * Creates an instance of Security.
   * @param [type=``] Checkbox type, either `downloads`, `files` or `http`
   */
  constructor(type = ``) {
    this.domains = new Configuration().domainsString()
    // IMPORTANT
    // these Map values must sync to those in the Security class found in `scripts/eventpage.js`
    const permissions = new Map()
      .set(`downloads`, [`downloads`, `downloads.open`, `tabs`])
      .set(`files`, [`tabs`])
      .set(`http`, [`tabs`])
    const origins = new Map()
      .set(`downloads`, [`file:///*`])
      .set(`files`, [`file:///*`])
      .set(`http`, this._httpOrigins())
    const elements = new Map()
      .set(`downloads`, `downloadViewer`)
      .set(`files`, `textfileViewer`)
      .set(`http`, `websiteViewer`)
    this.customHttp = origins.get(`http`)
    this.permissions = permissions.get(`${type}`)
    this.origins = origins.get(`${type}`)
    this.elementId = elements.get(`${type}`)
    this.type = type
    // special case for user edited text area
    const askAllWeb =
        this.domains !== localStorage.getItem(`settingsWebsiteDomains`), // Bool value
      catchallScheme = `*://*/*`
    if (type === `http` && askAllWeb) {
      if (!origins.get(`http`).includes(catchallScheme))
        origins.get(`http`).push(catchallScheme)
    }
    // permissions needed for user supplied websites
    this.allWebPermissions = {
      origins: [catchallScheme],
      permissions: [`tabs`],
    }
  }
  /**
   * Initialise onChange event listeners for checkboxes and the `<textarea>`.
   */
  listen() {
    // checkbox toggles
    const toggles = () => {
      const files = document.getElementById(`textfileViewer`),
        notice = document.getElementById(`textfileViewerOff`),
        value = document.getElementById(`${this.elementId}`).checked
      let monitor = false // for downloadViewer
      // special cases that have permission dependencies
      switch (this.elementId) {
        case `downloadViewer`:
          if (value === true) monitor = true
          // send message to `scripts/eventpage.js` listener
          chrome.runtime.sendMessage({ monitorDownloads: monitor }, () => {
            if (CheckLastError(`monitor downloads send message`)) return
          })
          // disable `textfileViewer` checkboxes with duplicate functionality
          if (value === true) {
            files.disabled = true
            files.checked = false
            notice.style.display = `inline`
            break
          }
          files.disabled = false
          notice.style.display = `none`
          break
      }
    }
    // this is only run once when the `Security.listen()` is initialised.
    // we cannot ask for `permissions.request()` here as the API requires
    // a user interaction beforehand such as a checkbox toggle.
    chrome.permissions.contains(this._test(), (result) => {
      // `this._checkedInitialise()` cannot request permissions
      this._checkedInitialise(result)
      toggles()
    })
    // checkbox event listeners
    const checkbox = document.getElementById(`${this.elementId}`)
    checkbox.addEventListener(`change`, () => {
      const value = document.getElementById(`${this.elementId}`).checked
      this._allWeb(false)
      this._checkedEvent(value)
      toggles()
    })
    switch (this.elementId) {
      case `downloadViewer`:
      case `textfileViewer`:
        return
    }
    // text area event listeners
    document.getElementById(`submitHost`).addEventListener(`click`, () => {
      if (this.type !== `http`) return
      const askAllWeb = this.domains === `textarea.value`
      Console(`Hostnames have been updated`)
      if (askAllWeb) {
        // text area has been reset
        this.origins.pop()
        return this._allWeb(false)
      }
      // text area has been modified
      chrome.permissions.contains(this.allWebPermissions, (result) => {
        const catchallScheme = `*://*/*`
        if (result === false) {
          Console(`${catchallScheme} permission has not been granted`)
          if (!this.origins.includes(catchallScheme)) {
            // append `*://*/*` to the permissions origins and then ask the
            // user to toggle the checkbox input to apply the new permission.
            // Extensions can only ask for new permissions using user toggles.
            const toggle = document.getElementById(`websiteViewer`)
            if (toggle.checked === true)
              document.getElementById(
                `websiteViewerOff`
              ).style.display = `inline`
            toggle.checked = false
            Console(`pushed permissions to origins`)
            return this.origins.push(catchallScheme)
          }
          Console(`permissions are to be ignored`)
          return
        }
        Console(`${catchallScheme} permission has been granted`)
      })
    })
    // options theme buttons listeners
    const themes = document.getElementsByClassName(`option-theme`)
    for (let theme of themes) {
      theme.addEventListener(`click`, () => {
        theme.classList.forEach(function (value, key) {
          let arr = [`button`, `option-theme`]
          if (arr.includes(value)) return
          const hero = document.getElementById(`heroSection`),
            src = document.getElementById(`getTheSource`)
          hero.classList.forEach(function (heroValue) {
            if (heroValue === `is-fullheight`) return
            if (!heroValue.startsWith(`is-`)) return
            hero.classList.replace(heroValue, value)
          })
          src.classList.forEach(function (heroValue) {
            if (heroValue === `is-inverted`) return
            if (!heroValue.startsWith(`is-`)) return
            src.classList.replace(heroValue, value)
          })
          localStorage.setItem(`optionClass`, `${value}`)
          console.log(theme.textContent, key, value)
        })
      })
    }
  }
  /**
   * Textarea onChanged event that updates the `this.allWebPermissions`
   * permission.
   * @param [request=true] Request `true` or remove `false` permission
   */
  _allWeb(request = false) {
    if (this.type !== `http`) return
    if (request === true) return
    chrome.permissions.contains(this.allWebPermissions, (result) => {
      if (result !== true) return
      chrome.permissions.remove(this.allWebPermissions, (result) => {
        if (CheckLastError(`security allwebpermissions remove "${result}"`))
          return
        if (result === false)
          console.warn(
            `Could not remove the permissions %s %s`,
            this.allWebPermissions.origins,
            this.allWebPermissions.permissions
          )
      })
    })
  }
  /**
   * Checkbox onChanged event that updates a permission.
   * @param [request=true] Request `true` or remove `false` permission
   * @param testResult A collection of permissions
   */
  _checkedEvent(request = true, testResult = this._test()) {
    switch (this.type) {
      case `downloads`:
      case `http`:
        return this._permissionSet(request, testResult)
      case `files`:
        if (request === false) testResult.permissions = []
        return this._permissionSet(request, testResult)
    }
  }
  /**
   * Set the checkbox checked state.
   * @param [granted=false] Checked `true` or `false` unchecked
   */
  _checkedInitialise(granted = false) {
    const checkbox = document.getElementById(`${this.elementId}`)
    if (!(`checked` in checkbox))
      return console.warn(
        `Checkbox element <input id="%s" type="checkbox"> is missing.`,
        this.elementId
      )
    checkbox.checked = granted
  }
  /**
   * Creates a collection of origins from a predetermined list of domains.
   * @returns origins collection
   */
  _httpOrigins() {
    const domains = chrome.runtime.getManifest().optional_permissions
    return domains.filter((domain) => domain.slice(0, 6) === `*://*.`)
  }
  /**
   * Requests or removes a checked permission.
   * @param [request=true] Request `true` or remove `false` permission
   * @param testResult A collection of permissions
   */
  _permissionSet(request = true, testResult) {
    const items = testResult.permissions.concat(testResult.origins).join(`, `),
      workaround = { permissions: [`tabs`] }
    switch (request) {
      case true:
        return chrome.permissions.request(testResult, (result) => {
          if (CheckLastError(`security permissionSet "${result}"`)) return
          Console(`%s: request to set permissions [%s]`, result, items)
          if (result !== true) {
            this._checkedInitialise(false)
            return
          }
          document.getElementById(`websiteViewerOff`).style.display = `none`
        })
      default:
        this._allWeb(false)
        chrome.permissions.remove(testResult, (result) => {
          if (CheckLastError(`security remove permissionSet "${result}"`))
            return
          Console(`%s: request to remove permissions [%s]`, result, items)
        })
        // `Tabs` should normally be listed under the `permission` key in the
        // manifest.json but instead it is placed under `optional_permission`.
        //
        // This is a workaround as host permissions (origins) cannot be
        // requested without a corresponding named permission. So Tabs acts as a
        // named permission placeholder for whenever the host permissions are
        // removed.
        chrome.permissions.request(workaround, (result) => {
          if (CheckLastError(`security wordaround permissionSet "${result}"`))
            return
          Console(`%s: workaround set permission [tabs]`, result)
        })
    }
  }
  /**
   * Creates a collection of permissions.
   * @returns `permissions.Permissions` object
   */
  _test() {
    Console(`Security test request for '${this.type}'.`)
    const permissionsToRequest = {
      permissions: this.permissions,
      origins: this.origins,
    }
    return permissionsToRequest
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
    // checkboxes with ids and associated storage keys
    this.boxes = new Map()
      .set(`eightyColumnWrap`, `ansiColumnWrap`)
      .set(`pageWrap`, `ansiPageWrap`)
      .set(`iceColorsMode`, `ansiUseIceColors`)
      .set(`accurate9pxFonts`, `textAccurate9pxFonts`)
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
      Console(`forEach id: ${id}`)
      document.getElementById(id).addEventListener(`change`, () => {
        Console(`change id: ${id}`)
        const value = document.getElementById(id).checked
        localStorage.setItem(item, value)
        chrome.storage.local.set({ [item]: `${value}` })
        this.id = `${id}`
        this.value = `${value}`
        // special cases that have permission dependencies
        switch (id) {
          case `downloadViewer`:
            if (value === true)
              document.getElementById(`textfileViewer`).checked = true
            break
          case `textfileViewer`:
            if (value === false)
              document.getElementById(`downloadViewer`).checked = false
            break
        }
        this.preview()
      })
    })
    new Security(`http`).listen()
    this._isAllowed()
  }
  /**
   * Code to run after a checkbox has been clicked.
   */
  preview() {
    switch (this.id) {
      case `backgroundScanlines`: {
        const element = document.getElementById(`sampleTerminal`)
        if (`${this.value}` === `true`) return ToggleScanlines(true, element)
        return ToggleScanlines(false, element)
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
   * Read the browser `localStorage` and apply text effects on the sample text.
   */
  async storageLoad() {
    this.boxes.forEach((item, id) => {
      const value = localStorage.getItem(item)
      this.id = `${id}`
      this.value = `${value}`
      this.preview()
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
  _isAllowed() {
    /*
FIREFOX NOTES:
  Firefox does not offer a user Extension setting to toggle Allowed File Scheme Access.
  So the results of chrome.extension.isAllowedFileSchemeAccess is ALWAYS false.
  The `file://` optional permission is the only access requirement.
    */
    if (WebBrowser() === Engine.firefox) {
      const id = `downloadViewer`,
        files = new Security(`files`)
      document.getElementById(id).disabled = true
      document.getElementById(`${id}HR`).style.display = `none`
      document.getElementById(`${id}Container`).style.display = `none`
      document.getElementById(`textfileViewerOff`).style.display = `none`
      return files.listen()
    }
    chrome.extension.isAllowedFileSchemeAccess((allowed) => {
      // show checkbox state
      const files = new Security(`files`),
        downloads = new Security(`downloads`)
      if (allowed !== true) {
        // the textfileViewerOff notice is redundant
        document.getElementById(`textfileViewerOff`).style.display = `none`
        this.id = `textfileViewer`
        this._disable()
        // as isAllowedFileSchemeAccess() is false, downloads.test() will also be false
        this.id = `downloadViewer`
        this._disable()
        const elements = document.getElementsByName(`is-allowed`)
        for (const element of elements) {
          element.style.display = `inline`
        }
        return
      }
      files.listen()
      downloads.listen()
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
    //
    this.lengths = new Set([
      `colorsAnsiColorPalette`,
      `settingsInformationHeader`,
      `colorsTextPairs`,
      `fontFamilyName`,
      `textSmearBlockCharacters`,
      `textRenderEffect`,
    ])
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
    const checkTabs = (value = -1) => {
      if (Number.isNaN(value)) return true
      if (value < this.optionMin) return true
      if (value > this.optionMax) return true
      return false
    }
    // check #1 - html radio and select groups
    for (const key1 of this.lengths) {
      this.key = `${key1}`
      this._checkLength()
    }
    // check #2 - html checkboxes
    this.boxes.forEach((key2, id) => {
      this.id = `${id}`
      this.key = `${key2}`
      this.value = localStorage.getItem(`${this.key}`)
      this._checkBoolean()
      switch (this.key) {
        case `settingsWebsiteViewer`:
        case `textDOSControlGlyphs`:
        case `textBlinkingCursor`:
          return this.preview()
      }
    })
    // check #3 - options tab
    const key3 = `optionTab`,
      value3 = parseInt(localStorage.getItem(key3), 10)
    if (checkTabs(value3)) {
      const fix = this.defaults.get(key3)
      if (fix === ``) handleError(`Initialise.checks() ${key3} = "${value3}"`)
      localStore(`${key3}`, `${fix}`)
    }
    // check #4 - text area
    const key4 = `settingsWebsiteDomains`,
      value4 = localStorage.getItem(key4)
    if (typeof value4 !== `string` || value4.length < 1) {
      const fix = this.defaults.get(key4)
      if (fix === ``) handleError(`Initialise.checks() ${key4} = "${value4}"`)
      localStore(`${key4}`, `${fix.join(";")}`)
    }
    // check #5 - option theme button
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
    const key5 = `optionClass`
    let value5 = localStorage.getItem(key5)
    if (!classes.includes(value5)) {
      const fix = this.defaults.get(key5)
      if (fix === ``) handleError(`Initialise.checks() ${key5} = "${value5}"`)
      localStore(`${key5}`, `${fix}`)
      value5 = fix
    }
    this._colorTheme(value5)
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
  _checkBoolean() {
    const input = document.getElementById(`${this.id}`),
      fix = this.defaults.get(`${this.key}`)
    switch (`${this.value}`) {
      case `true`:
        return (input.checked = true)
      case `false`:
        return (input.checked = false)
      default:
        if (fix === ``)
          handleError(`Initialise._checkBoolean(${this.id}) = "${this.value}"`)
        localStorage.setItem(this.key, `${fix}`)
        input.checked = fix === true ? true : false
    }
  }
  /**
   * Checks for saved radio and select group values and applies them to the Options form.
   * @param {number} [minLength=1] Minimum value length required before the value is stored
   */
  _checkLength(minLength = 1) {
    this.value = localStorage.getItem(`${this.key}`)
    if (this.value === null || this.value.length < minLength) {
      const fix = this.defaults.get(`${this.key}`)
      if (fix === ``)
        return handleError(`Initialise.checkLen(${this.key}) = '${this.value}'`)
      localStorage.setItem(this.key, `${fix}`)
      this.value = `${fix}`
    }
    switch (this.key) {
      case `colorsAnsiColorPalette`:
        return this._colorPalette()
      case `settingsInformationHeader`:
        return this._infoHeader()
      case `colorsTextPairs`:
        return this._selectColor()
      case `fontFamilyName`:
        return this._selectFont()
      case `textRenderEffect`:
        return this._selectEffect()
    }
  }
  /**
   * Select a background and button color for the Options tab.
   */
  async _colorTheme(value = ``) {
    let arr = [`button`, `option-theme`]
    if (arr.includes(value)) return
    const hero = document.getElementById(`heroSection`),
      src = document.getElementById(`getTheSource`)
    hero.classList.forEach(function (heroValue) {
      if (heroValue === `is-fullheight`) return
      if (!heroValue.startsWith(`is-`)) return
      hero.classList.replace(heroValue, value)
    })
    src.classList.forEach(function (heroValue) {
      if (heroValue === `is-inverted`) return
      if (!heroValue.startsWith(`is-`)) return
      src.classList.replace(heroValue, value)
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
        reload = document.getElementById(`reload`)
      chrome.management.getSelf((info) => {
        switch (info.installType) {
          // the add-on was installed unpacked from disk
          case `development`:
            // reveal developer links
            unit.style.display = `inline`
            reload.addEventListener(`click`, () => chrome.runtime.reload())
            reload.style.display = `inline`
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
    if (`version_name` in data)
      return (element.textContent = `${data.version_name}`)
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
      const input = label.previousSibling.previousSibling
      // skip labels with no radio inputs
      if (typeof input.name === `undefined` || input.name !== `text-pair-form`)
        continue labels
      // label listeners
      label.onmouseup = () => {
        this.value = `${input.value}`
        this._select()
        this._storageSave()
        new Effects().storageLoad()
      }
      // input listeners
      // labels in the text-pair-form are standalone and dont contain input elements
      input.onchange = () => {
        this.value = `${input.value}`
        this._select()
        this._storageSave()
        new Effects().storageLoad()
      }
    }
  }
  /**
   * Choose a theme from the menu of the Colour Pair options
   * saved in the browser `localStorage`.
   */
  async storageLoad() {
    const selected = localStorage.getItem(`colorsTextPairs`)
    if (typeof selected !== `string`)
      return console.error(`Failed to obtain the 'colorsTextPairs' setting.`)
    this.value = `${selected}`
    this._sample()
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
      this.value
    )} ${chrome.i18n.getMessage(`color`)} pair`
    this._sample(this.value)
  }
  /**
   * Save the id of a Colour text pair to the browser `localStorage`.
   * If an id is not provided the `localStorage` item will be deleted.
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
        `custom text pair element "${this.id}" cannot be found`
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
      }
    )
  }
  /**
   * Read the browser `localStorage` and apply text effects on the sample text.
   */
  async storageLoad() {
    let value = localStorage.getItem(`${this.mapId}`)
    if (value === null) value = new OptionsReset().get(`${this.mapId}`)
    this.input.value = `${value}`
    const custom = this._value() === `theme-custom`
    this._previewColor(custom)
    if (custom) this._update(false)
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
   * @param [save=true] Save `input.value` to `localStorage`?
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
    let previousColor = ``
    if (`value` in this.input) this.input.value = this.input.value.toLowerCase()
    document.getElementById(`status`).textContent = `${this.title} `
    previousColor = this.sampleText.style[this.property]
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
      (r) => r.checked
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
   * either `colorsAnsiColorPalette`, `fontFamilyName` or `textRenderEffect`
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
      case `fontFamilyName`:
        this.feedback = `font selection`
        this.formId = `fontSuggestions`
        return (this.formName = `fonts`)
      case `textRenderEffect`:
        this.feedback = `text effect`
        this.formId = `textRenderForm`
        return (this.formName = `text-render-form`)
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
            case `textRenderEffect`:
              return ToggleTextEffect(radio.value, this.sample)
          }
        }
      })
    }
  }
  /**
   * Load and preview the saved radio selection.
   */
  async storageLoad() {
    const effect = localStorage.getItem(`${this.storageId}`)
    this.value = `${effect}`
    this.preview()
  }
  /**
   * Save the id of radio selection to the browser `localStorage`.
   */
  storageSave() {
    localStore(`${this.storageId}`, `${this.value}`)
  }
}
/**
 * Information header
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
 * Text render effect.
 * @class Effects
 */
class Effects extends Radios {
  constructor() {
    super(`textRenderEffect`)
  }
  /**
   * Applies the text render effect to the sample preview.
   */
  async preview() {
    switch (this.value) {
      case `normal`:
      case `shadowed`:
        return ToggleTextEffect(this.value, this.sample)
      default:
        return handleError(`Effects.text "${this.value}"`)
    }
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
        `font preview could not update the display tab sample text elements.`
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
 * Line height selection.
 * @class LineHeight
 */
class LineHeight {
  constructor() {
    this.lineHeight = document.getElementById(`lineHeight`)
    this.status = document.getElementById(`status`)
    this.value = this.lineHeight.value
    this.m = new Map()
      .set("1", "1")
      .set("2", "1.1")
      .set("3", "1.25")
      .set("4", "1.5")
      .set("5", "1.75")
      .set("6", "2")
      .set("7", "3")
      .set("8", "4")
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
            `line height select value "${this.value}" must be between ${min} and ${max}`
          )
        this.status.textContent = `Saved line height selection ${this.value}`
        this.storageSave()
        document.getElementById(`lineHeightOutput`).value = this.m.get(
          this.value
        )
      },
      { passive: true }
    )
  }
  /**
   * Loads and selects the saved line height setting.
   */
  async storageLoad() {
    this.lineHeight.value = localStorage.getItem(`textLineHeight`)
    document.getElementById(`lineHeightOutput`).textContent = this.m.get(
      this.lineHeight.value
    )
  }
  /**
   * Save line height selection to `localStorage`.
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
        0
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
    // Reveal the current tab
    const page = document.getElementById(`${this.page}${selected}`),
      button = document.getElementById(`${this.btn}${selected}`)
    if (typeof page.style.display !== `undefined`) {
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
    const tab = localStorage.getItem(`optionTab`)
    typeof tab === `string` ? this.reveal(tab) : this.reveal(`0`)
  }
  /**
   * Save the active tab to `localStorage`.
   * @param {string} [id=``] Tab id
   */
  storageSave(id = ``) {
    localStore(`optionTab`, id)
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
    this.hostnames = ``
    this.status = document.getElementById(`status`)
    this.template = document.getElementById(`templateHost`)
    this.submit = document.getElementById(`submitHost`)
    this.input = document.getElementById(`newHost`)
    this.domains = new Configuration().domainsString()
  }
  /**
   * Input and button listeners.
   */
  async listen() {
    this.submit.addEventListener(`click`, () => {
      this._add(this.input.value)
      this._storageSave()
    })
    this.input.addEventListener(`input`, () => {
      try {
        // when URLs are pasted, attempt to return just the host
        const url = new URL(`${this.input.value}`)
        this.input.value = url.host
      } catch (e) {
        // this catch is okay, as a host was probably pasted
      } finally {
        this._check(this.input.value)
      }
    })
  }
  /**
   * Load and display host tags.
   */
  async storageLoad() {
    chrome.storage.local.get(`settingsWebsiteDomains`, (result) => {
      this.hostnames = `${result.settingsWebsiteDomains}`
      const hosts = this.hostnames.split(`;`)
      for (let host of hosts) {
        this._add(host, true)
      }
    })
  }
  /**
   * Adds a hostname tag with a working link and delete button.
   */
  async _add(hostname = ``, init = false) {
    if (hostname.length < this.minLength) return
    const tags = document.getElementById(`hostTags`),
      tag = this.template.cloneNode(true),
      anchor = tag.childNodes[1].childNodes[1],
      urls = this.hostnames.split(`;`),
      isDomain = this._domainHost(hostname)
    anchor.textContent = hostname
    switch (hostname) {
      case `textfiles.com`:
      case `uncreativelabs.net`:
        anchor.href = `http://${hostname}`
        break
      default:
        anchor.href = `https://${hostname}`
    }
    if (!isDomain) anchor.classList.add(`is-light`)
    this.input.value = ``
    this.submit.disabled = true
    tag.style.display = `inline`
    tag.removeAttribute(`id`)
    tags.append(tag)
    urls.push(hostname)
    if (!init) {
      this.hostnames = urls.join(`;`)
      this.status.textContent = `Added ${hostname}`
    }
    tag.childNodes[1].childNodes[2].nextSibling.addEventListener(
      `click`,
      (e) => {
        this._delete(e)
      }
    )
  }
  /**
   * Checks a hostname to modify the delete button state.
   */
  async _check(hostname = ``) {
    if (hostname.length < this.minLength) return (this.submit.disabled = true)
    let duplicates = this.hostnames.split(`;`)
    duplicates = [...duplicates, `retrotxt.com`]
    for (let dupe of duplicates) {
      if (dupe === hostname) return (this.submit.disabled = true)
    }
    if (hostname.includes(`/`)) return (this.submit.disabled = true)
    try {
      // test that the hostname can be used as a URL
      new URL(`https://${hostname}`)
      this.submit.disabled = false
    } catch (e) {
      this.submit.disabled = true
    }
  }
  /**
   * Is the hostname one of the default domains supplied by RetroTxt?
   */
  _domainHost(hostname = ``) {
    const domains = this.domains.split(`;`)
    for (let domain of domains) {
      if (hostname == domain) return true
    }
    return false
  }
  /**
   * Deletes a hostname tag and button.
   */
  _delete(e) {
    const v = e.target.previousSibling.previousSibling.textContent,
      urls = this.hostnames.split(`;`),
      filtered = urls.filter((url) => url !== v),
      reset = 1
    this.hostnames = filtered.join(`;`)
    if (this.hostnames.length < reset) this._reset()
    this._storageSave()
    e.target.parentNode.parentNode.remove()
    this.status.textContent = `Removed ${v}`
  }
  /**
   * Reset all hostnames.
   */
  _reset() {
    this.status.textContent = `Reset hostnames to defaults`
    this.hostnames = new Configuration().domainsString()
    const domains = this.domains.split(`;`)
    for (let domain of domains) {
      this._add(domain, true)
    }
  }
  /**
   * Save the hostnames to `localStorage`.
   */
  _storageSave() {
    localStore(`settingsWebsiteDomains`, `${this.hostnames}`)
  }
}
/**
 * Import RetroTxt legacy configurations.
 * @class Import
 */
class Import {
  constructor() {
    const keys = new Map()
      // display tab
      .set(`textLineHeight`, `lineHeight`)
      .set(`textSmearBlockCharacters`, `textSmearBlocks`)
      .set(`textBackgroundScanlines`, `textBgScanlines`)
      .set(`textBlinkingCursor`, `textBlinkAnimation`)
      .set(`textCenterAlign`, `textCenterAlignment`)
      .set(`textDOSControlGlyphs`, `textDosCtrlCodes`)
      .set(`textRenderEffect`, `textEffect`)
      .set(`ansiColumnWrap`, `textAnsiWrap80c`)
      .set(`ansiUseIceColors`, `textAnsiIceColors`)
      .set(`colorsTextPairs`, `retroColor`)
      .set(`colorsCustomForeground`, `customForeground`)
      .set(`colorsCustomBackground`, `customBackground`)
      .set(`colorsAnsiColorPalette`, `colorPalette`)
      // settings tab
      .set(`settingsWebsiteViewer`, `runWebUrls`)
      .set(`settingsWebsiteDomains`, `runWebUrlsPermitted`)
      .set(`settingsInformationHeader`, `textFontInformation`)
      .set(`settingsNewUpdateNotice`, `updatedNotice`)
    this.keys = keys
    this.found = 0
    this.modal = document.getElementById(`modalImport`)
    this.counter = document.getElementById(`modalCounter`)
    this.yesImport = document.getElementById(`modalYesImport`)
    this.askAgain = document.getElementsByName(`modalAskAgain`)
  }
  /**
   * Initialize RetroTxt version 3 imports.
   */
  initialize() {
    this.keys.forEach((v3Key) => {
      this._find(v3Key)
    })
    for (const button of document.getElementsByName(`modalAskAgain`)) {
      if (typeof button === `undefined`) return
      button.addEventListener(`click`, () => {
        this._modalAskAgain()
      })
    }
    document.getElementById(`modalDelete`).addEventListener(`click`, () => {
      this._modalNoDelete()
    })
    document.getElementById(`modalYesImport`).addEventListener(`click`, () => {
      this._modalYesImport()
    })
  }
  _find(v3Key = ``) {
    chrome.storage.local.get(`${v3Key}`, (store) => {
      const len = Object.keys(store).length
      if (len > 0) {
        this.found++
        this._modalShow()
      }
    })
  }
  _importHeader(value = ``) {
    const show = `on`,
      hide = `close`
    switch (`${value}`) {
      case `true`:
        return show
      case `false`:
        return hide
      default:
        return show
    }
  }
  _importLineHeight(value = ``) {
    switch (`${value}`) {
      case `normal`:
        return `1`
      case `1.1`:
      case `1.25`:
      case `1.5`:
      case `1.75`:
      case `2`:
      case `3`:
      case `4`:
        return `${value}`
      default:
        return `1`
    }
  }
  _modalAskAgain() {
    sessionStorage.setItem(`pauseV3Import`, `true`)
    document.getElementById(`modalImport`).classList.remove(`is-active`)
  }
  _modalNoDelete() {
    this._modalAskAgain()
    this.keys.forEach((v3Key) => {
      localStorage.removeItem(`${v3Key}`)
      chrome.storage.local.remove(`${v3Key}`)
    })
  }
  _modalShow() {
    if (sessionStorage.getItem(`pauseV3Import`))
      return console.log(`Paused the import of RetroTxt v3 settings.`)
    this.modal.classList.add(`is-active`)
    this.counter.textContent = `${this.found}`
  }
  _modalYesImport() {
    this.keys.forEach((v3Key, v4Key) => {
      chrome.storage.local.get(`${v3Key}`, (store) => {
        const len = Object.keys(store).length
        if (len < 1) return
        let value = store[v3Key]
        if (v3Key === `textFontInformation`) value = this._importHeader(value)
        if (v3Key === `lineHeight`) value = this._importLineHeight(value)
        chrome.storage.local.set({ [v4Key]: value })
        localStorage.setItem(`${v4Key}`, `${value}`)
        localStorage.removeItem(`${v3Key}`)
        chrome.storage.local.remove(`${v3Key}`)
      })
    })
    this._modalAskAgain()
    alert(`Settings import is done.`)
  }
}
// Self-invoking expression that runs whenever the Options dialogue is opened.
;(() => {
  if (typeof qunit !== `undefined`) return
  const init = new Initialise()
  // lookup and applies checked, selections, active, once the HTML is loaded and parsed
  document.addEventListener(`DOMContentLoaded`, init.checks())
  // modifies `html/options.html`
  init.updates()
  // migrate RetroTxt V3 settings
  const im = new Import()
  im.initialize()
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
  const pal = new Palette()
  pal.storageLoad()
  pal.listen()
  const te = new Effects()
  te.storageLoad()
  te.listen()
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
  onstorage = (event) => {
    // The storage event of the Window interface fires when localStorage has
    // been modified in the context of another document.
    if (typeof event.key === undefined || event.newValue === undefined)
      return console.error(
        `triggered window onstorage remote event is missing a storage key`
      )
    switch (event.key) {
      case `optionTab`:
        return hero.reveal(`${event.newValue}`)
    }
  }
  //handleError(`false positive test`)
})()
