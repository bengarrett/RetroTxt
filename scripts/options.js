// filename: options.js
//
// These functions are used exclusively by the
// Options dialogue `html/options.html`.
"use strict"

/**
 * Argument checker used exclusively by `scripts/options.js`.
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
    console.trace(`Failed to obtain the '${e}' setting`)
  }
  if (typeof qunit === `undefined`) {
    document.getElementById(`error`).style.display = `block`
    document.getElementById(`status`).style.display = `none`
  }
}

/**
 * Workaround to add localization support to HTML files.
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
  const message = chrome.i18n.getMessage(word)
  const elements = document.getElementsByClassName(className)
  for (const element of elements) {
    const text = element.textContent
    // if the original word is capitalised then apply it to the new word
    if (text.slice(0, 1).toUpperCase())
      element.textContent = `${message[0].toUpperCase()}${message.slice(1)}`
    else element.textContent = message
  }
}

/**
 * Update a `localStorage` item with a new value.
 * When the value is left empty the local storage item is instead deleted.
 * @param {string} [key=``] Id of the storage item
 * @param {string} [value=``] Value to store
 */
function localStore(key = ``, value = ``) {
  switch (value) {
    case ``:
      localStorage.removeItem(`${key}`)
      chrome.storage.local.remove(`${key}`)
      if (RetroTxt.developer) console.log(`localStore('${key}', removed)`)
      break
    default:
      localStorage.setItem(`${key}`, `${value}`)
      // webExtension storage requires a key/value pair object
      chrome.storage.local.set({ [key]: `${value}` })
      if (RetroTxt.developer) console.log(`localStore('${key}', '${value}')`)
  }
}

/**
 * Grants and removes WebExtension access permissions.
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
    // these `Map` values must sync to those in the `Security` class in
    // `scripts/eventpage.js`
    const permissions = new Map()
      .set(`downloads`, [`downloads`, `downloads.open`, `tabs`])
      .set(`files`, [`tabs`])
      .set(`http`, [`tabs`])
    const origins = new Map()
      .set(`downloads`, [`file:///*`])
      .set(`files`, [`file:///*`])
      .set(`http`, this.httpOrigins())
    const elements = new Map()
      .set(`downloads`, `run-file-downloads`)
      .set(`files`, `run-file-urls`)
      .set(`http`, `run-web-urls`)
    this.customHttp = origins.get(`http`)
    this.permissions = permissions.get(`${type}`)
    this.origins = origins.get(`${type}`)
    this.elementId = elements.get(`${type}`)
    this.type = type
    // special case for user edited text area
    const askAllWeb =
      this.domains !== localStorage.getItem(`runWebUrlsPermitted`) // Bool value
    if (type === `http` && askAllWeb) {
      if (!origins.get(`http`).includes(`*://*/*`))
        origins.get(`http`).push(`*://*/*`)
    }
    // permissions needed for user supplied websites, edited in the text area
    this.allWebPermissions = {
      origins: [`*://*/*`],
      permissions: [`tabs`]
    }
  }
  /**
   * Creates a collection of origins from a predetermined list of domains.
   * @returns origins collection
   */
  httpOrigins() {
    const domains = chrome.runtime.getManifest().optional_permissions
    const origins = domains.filter(domain => domain.slice(0, 6) === `*://*.`)
    return origins
  }
  collection(url = ``) {
    if (url.length < 1) return ``
    // parse URL to valid host
    let noScheme = url
    if (url.includes(`://`)) noScheme = url.slice(url.indexOf(`://`) + 3)
    const hostname = noScheme.split(`/`, 1)[0]
    return [`*://${hostname}/*`]
  }
  /**
   * Textarea onChanged event that updates the `this.allWebPermissions`
   * permission.
   * @param [request=true] Request `true` or remove `false` permission
   */
  allWeb(request = false) {
    if (this.type !== `http`) return
    switch (request) {
      case true:
        // do nothing
        break
      case false:
        chrome.permissions.contains(this.allWebPermissions, result => {
          if (result === true) {
            chrome.permissions.remove(this.allWebPermissions, result => {
              if (result === false)
                console.warn(
                  `Could not remove the permissions %s %s`,
                  this.allWebPermissions.origins,
                  this.allWebPermissions.permissions
                )
              this.permissionsCallback()
            })
          }
        })
        break
    }
  }
  /**
   * Display a notification "Please " when the textarea onChanged is triggered.
   * @param [display=false] Show `true` or remove `false` the notification
   */
  allWebNotice(display = false) {
    const div = document.getElementById(`please-apply`)
    if (display) {
      document.getElementById(`run-web-urls`).checked = false
      div.style.display = `block`
    } else div.style.display = `none`
    this.permissionsCallback()
  }
  /**
   * Initialise onChange event listeners for checkboxes and the `<textarea>`.
   */
  listen() {
    // this is only run once when the `Security.listen()` is initialised.
    // we cannot ask for `permissions.request()` here as the API requires
    // a user interaction beforehand such as a checkbox toggle.
    chrome.permissions.contains(this.test(), result => {
      // `this.checkedInitialise()` cannot request permissions
      this.checkedInitialise(result)
      toggles()
      this.permissionsCallback()
    })
    // checkbox event listeners
    const checkbox = document.getElementById(`${this.elementId}`)
    checkbox.addEventListener(`change`, () => {
      const value = document.getElementById(`${this.elementId}`).checked
      this.allWeb(false)
      this.checkedEvent(value)
      toggles()
    })
    // text area event listeners
    const textarea = document.getElementById(`run-web-urls-permitted`)
    textarea.addEventListener(`change`, () => {
      if (this.type !== `http`) return
      const askAllWeb = this.domains === textarea.value
      if (RetroTxt.developer) console.log(`Textarea has been updated`)
      if (askAllWeb) {
        // text area has been reset
        this.origins.pop()
        this.allWeb(false)
        this.allWebNotice(true)
      } else {
        // text area has been modified
        chrome.permissions.contains(this.allWebPermissions, result => {
          if (result === false) {
            // `*://*/*` permission has not been granted
            if (!this.origins.includes(`*://*/*`)) {
              // append `*://*/*` to the permissions origins and then ask the
              // user to toggle the checkbox input to apply the new permission.
              // web extensions can only ask for new permissions using user
              // toggles.
              this.origins.push(`*://*/*`)
              this.allWebNotice(true)
            } else {
              // do nothing
            }
          } else {
            // `*://*/*` permission has been granted
            this.allWebNotice(false)
          }
        })
      }
    })
    // checkbox toggles
    const toggles = () => {
      const files = document.getElementById(`run-file-urls`)
      const value = document.getElementById(`${this.elementId}`).checked
      let monitor = false // for run-file-downloads
      // special cases that have permission dependencies
      switch (this.elementId) {
        case `run-file-downloads`:
          if (value === true) monitor = true
          // send message to `scripts/eventpage.js` listener
          chrome.runtime.sendMessage({ monitorDownloads: monitor })
          // disable `run-file-urls` checkboxes with duplicate functionality
          if (value === true) {
            files.disabled = true
            files.checked = false
          } else files.disabled = false
          break
        case `run-web-urls`:
          this.allWebNotice(false)
          // disable text area if value is false
          textarea.disabled = !value
          break
      }
    }
  }
  /**
   * Checkbox onChanged event that updates a permission.
   * @param [request=true] Request `true` or remove `false` permission
   * @param testResult A collection of permissions
   */
  checkedEvent(request = true, testResult = this.test()) {
    switch (this.type) {
      case `downloads`:
      case `http`:
        this.permissionSet(request, testResult)
        break
      case `files`:
        if (request === false) testResult.permissions = []
        this.permissionSet(request, testResult)
        break
    }
  }
  /**
   * Requests or removes a checked permission.
   * @param [request=true] Request `true` or remove `false` permission
   * @param testResult A collection of permissions
   */
  permissionSet(request = true, testResult) {
    const items = testResult.permissions.concat(testResult.origins).join(`, `)
    const workaround = { permissions: [`tabs`] }
    switch (request) {
      case true:
        chrome.permissions.request(testResult, result => {
          if (RetroTxt.developer)
            console.log(`%s: request to set permissions [%s]`, result, items)
          if (result !== true) this.checkedInitialise(false)
          this.permissionsCallback()
        })
        break
      default:
        this.allWeb(false)
        chrome.permissions.remove(testResult, result => {
          if (RetroTxt.developer)
            console.log(`%s: request to remove permissions [%s]`, result, items)
        })
        // `Tabs` should normally be listed under `permission` key in the
        // manifest.json but instead it is placed under `optional_permission`.
        // This is a workaround as host permissions (origins) cannot be
        // requested without a corresponding named permission. So Tabs acts as a
        // named permission placeholder for whenever the host permissions are
        // removed.
        chrome.permissions.request(workaround, result => {
          if (RetroTxt.developer)
            console.log(`%s: workaround set permission [tabs]`, result)
          this.permissionsCallback()
        })
    }
  }
  /**
   * Updates the Options dialogue after a permission has been changed.
   * This needs to be an event callback otherwise the dialogue won't accurately
   * reflect the changed permission.
   */
  permissionsCallback() {
    chrome.permissions.getAll(result => {
      // iterate through `result.permissions` and humanise camelCase text
      const formattedPermissions = []
      result.permissions.filter(permission => {
        formattedPermissions.push(HumaniseCamelCase(permission, true))
      })
      document.getElementById(
        `requestedPermissions`
      ).textContent = formattedPermissions.join(`, `)
      // iterate through `result.origins` and apply link anchors to URLs
      const formattedOrigins = []
      let count = 0
      result.origins.sort()
      result.origins.filter(origin => {
        count++
        const prefix = origin.slice(0, 6)
        if (prefix === `*://*.`) {
          const a = document.createElement(`a`)
          const domain = origin.slice(6, -2)
          if (domain === `textfiles.com`) a.href = `http://${domain}`
          else a.href = `https://${domain}`
          a.textContent = `${origin}`
          formattedOrigins.push(a)
        } else {
          const span = document.createElement(`span`)
          span.textContent = `${origin}`
          formattedOrigins.push(span)
        }
        if (count < result.origins.length) {
          if (FindEngine() !== `gecko`)
            formattedOrigins.push(document.createTextNode(`, `))
          else formattedOrigins.push(document.createElement(`br`))
        }
      })
      // erase all `requestedOrigins` children elements if
      // `permissionsCallback()` has previously been called
      const element = document.getElementById(`requestedOrigins`)
      if (element.hasChildNodes()) {
        while (element.firstChild) {
          element.removeChild(element.firstChild)
        }
      }
      // append <a> and <span> elements to the `requestedOrigins` HTML element
      formattedOrigins.filter(child => {
        element.appendChild(child)
      })
    })
  }
  /**
   * Set the checkbox checked state.
   * @param [granted=false] Checked `true` or `false` unchecked
   */
  checkedInitialise(granted = false) {
    const checkbox = document.getElementById(`${this.elementId}`)
    if (!(`checked` in checkbox))
      return console.warn(
        `Checkbox element <input id="%s" type="checkbox"> is missing.`,
        this.elementId
      )
    checkbox.checked = granted
    if (this.elementId === `run-web-urls`) this.textareaInitialise(granted)
  }
  /**
   * Set the textarea checked state.
   * @param [granted=false] Checked `true` or `false` unchecked
   */
  textareaInitialise(granted = false) {
    if (this.type !== `http`) return
    const textarea = document.getElementById(`run-web-urls-permitted`)
    if (!(`disabled` in textarea)) return
    textarea.disabled = !granted
  }
  /**
   * Reveals the checkbox <div> block element on the Options dialogue.
   */
  show() {
    const div = document.getElementById(`${this.elementId}-div`)
    if (div !== null && `style` in div) div.style.display = `block`
    else console.warn(`<div> element '${this.elementId}-div' is missing.`)
  }
  /**
   * Creates a collection of permissions.
   * @returns `permissions.Permissions` object
   */
  test() {
    if (RetroTxt.developer)
      console.log(`Security test request for '${this.type}'.`)
    const permissionsToRequest = {
      permissions: this.permissions,
      origins: this.origins
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
      .set(`ansi-wrap-80c`, `textAnsiWrap80c`)
      .set(`ansi-ice-colors`, `textAnsiIceColors`)
      .set(`background-scanlines`, `textBgScanlines`)
      .set(`blink-animation`, `textBlinkAnimation`)
      .set(`center-alignment`, `textCenterAlignment`)
      .set(`dos-ctrl-codes`, `textDosCtrlCodes`)
      .set(`smear-blocks`, `textSmearBlocks`)
      .set(`text-font-information`, `textFontInformation`)
      .set(`updated-notice`, `updatedNotice`)
  }
  /**
   * Checkbox event listeners.
   */
  async listen() {
    this.boxes.forEach((item, id) => {
      if (RetroTxt.developer) console.log(`forEach id: ${id}`)
      document.getElementById(id).addEventListener(`change`, () => {
        if (RetroTxt.developer) console.log(`change id: ${id}`)
        const value = document.getElementById(id).checked
        localStorage.setItem(item, value)
        chrome.storage.local.set({ [item]: `${value}` })
        this.id = `${id}`
        this.value = `${value}`
        // special cases that have permission dependencies
        switch (id) {
          case `run-file-downloads`:
            if (value === true)
              document.getElementById(`run-file-urls`).checked = true
            break
          case `run-file-urls`:
            if (value === false)
              document.getElementById(`run-file-downloads`).checked = false
            break
        }
        this.preview()
      })
    })
    new Security(`http`).listen()
    this.isAllowedFileAccess()
  }
  /**
   * Code to run after a checkbox has been clicked.
   */
  preview() {
    switch (this.id) {
      case `background-scanlines`: {
        const element = document.getElementById(`sample-dos-text`)
        if (`${this.value}` === `true`) return ToggleScanlines(true, element)
        return ToggleScanlines(false, element)
      }
      case `center-alignment`: {
        const element = document.getElementById(`sample-dos-text`)
        if (`${this.value}` === `true`)
          return (element.style.justifyContent = `center`)
        return (element.style.justifyContent = `left`)
      }
      case `dos-ctrl-codes`: {
        const element = document.getElementById(`sample-dos-ctrls`)
        if (`${this.value}` === `true`)
          return (element.style.display = `inline`)
        return (element.style.display = `none`)
      }
      case `run-web-urls`: {
        const element = document.getElementById(`run-web-urls-permitted`)
        if (`${this.value}` !== `true`) return (element.disabled = true)
        return (element.disabled = false)
      }
      case `blink-animation`: {
        const element = document.getElementById(`sample-cursor`)
        if (`${this.value}` === `true`)
          return (element.style.animation = `300ms blink step-end infinite`)
        return (element.style.animation = `none`)
      }
    }
  }
  /**
   * Disable a checkbox.
   * Intended for use when a WebExtension feature lacks access permission.
   */
  async disable() {
    const reason = `RetroTxt requires 'Allow access to file URLs' to be toggled`
    const checkBox = document.getElementById(`${this.id}`)
    if (checkBox === null) return
    checkBox.disabled = true
    checkBox.title = reason
    const div = document.getElementById(`${this.id}-div`)
    div.style = `color: rgba(0, 0, 0, 0.26); cursor: not-allowed`
    div.title = reason
  }
  /**
   * Hide a checkbox.
   */
  async hide() {
    const checkBox = document.getElementById(`${this.id}-div`)
    checkBox.style.display = `none`
  }
  /**
   * Event listeners for options.
   * These require `extension.isAllowedFileSchemeAccess`.
   */
  isAllowedFileAccess() {
    chrome.extension.isAllowedFileSchemeAccess(result => {
      // show checkbox state
      const files = new Security(`files`)
      files.show()
      const downloads = new Security(`downloads`)
      downloads.show()
      // in Firefox `isAllowedFileSchemeAccess()` always returns false
      if (FindEngine() !== `gecko` && result !== true) {
        this.id = `run-file-urls`
        this.disable()
        // as `isAllowedFileSchemeAccess()` is false
        // `downloads.test()` will also return false
        this.id = `run-file-downloads`
        this.disable()
        const div = document.getElementById(`allow-access-file-urls-div`)
        if (div !== null) div.style.display = `block`
      } else {
        files.listen()
        downloads.listen()
      }
    })
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
      `smearBlocks`,
      `retroColor`,
      `retroFont`,
      `textEffect`
    ])
    this.id = ``
    this.key = ``
    this.value = ``
  }
  /**
   * Query the render engine to adjust browser specific Options.
   */
  async browser() {
    const ctrl = document.getElementById(`keyboardCtrl`)
    switch (FindEngine()) {
      // Firefox
      case `gecko`:
        if (FindOS() === `mac`) ctrl.textContent = `⌘`
        return
      // Chrome, Chromium, Brave, Vivaldi, Edge
      default:
        return
    }
  }
  /**
   * Checks for and executes run-once Options.
   */
  checks() {
    // check #1 - html radio and select groups
    for (const key1 of this.lengths) {
      this.key = `${key1}`
      this.checkLength()
    }
    // check #2 - html checkboxes
    this.boxes.forEach((key2, id) => {
      this.id = `${id}`
      this.key = `${key2}`
      this.value = localStorage.getItem(`${this.key}`)
      this.checkBoolean()
      switch (this.key) {
        case `runWebUrls`:
        case `textDosCtrlCodes`:
        case `textBlinkAnimation`:
          return this.preview()
      }
    })
    // check #3 - options tab
    const key3 = `optionTab`
    const value3 = parseInt(localStorage.getItem(key3), 10)
    if (isNaN(value3) || value3 < 1 || value3 > 4) {
      const fix = this.defaults.get(key3)
      if (fix === ``) handleError(`Initialise.checks() ${key3} = "${value3}"`)
      localStore(`${key3}`, `${fix}`)
    }
    // check #4 - text area
    const key4 = `runWebUrlsPermitted`
    const value4 = localStorage.getItem(key4)
    if (typeof value4 !== `string` || value4.length < 1) {
      const fix = this.defaults.get(key4)
      if (fix === ``) handleError(`Initialise.checks() ${key4} = "${value4}"`)
      localStore(`${key4}`, `${fix}`)
    }
  }
  /**
   * Finds and toggles checkbox boolean values.
   */
  checkBoolean() {
    const input = document.getElementById(`${this.id}`)
    const fix = this.defaults.get(`${this.key}`)
    switch (`${this.value}`) {
      case `true`:
        return (input.checked = true)
      case `false`:
        return (input.checked = false)
      default:
        if (fix === ``)
          handleError(`Initialise.checkBoolean(${this.id}) = "${this.value}"`)
        localStorage.setItem(this.key, `${fix}`)
        input.checked = fix === true ? true : false
    }
  }
  /**
   * Checks for saved radio and select group values
   * and applies them to the Options form.
   * @param {number} [minLength=1] Minimum value length required before the
   * value is stored
   */
  checkLength(minLength = 1) {
    this.value = localStorage.getItem(`${this.key}`)
    if (this.value === null || this.value.length < minLength) {
      const fix = this.defaults.get(`${this.key}`)
      if (fix === ``)
        return handleError(`Initialise.checkLen(${this.key}) = '${this.value}'`)
      localStorage.setItem(this.key, `${fix}`)
      this.value = `${fix}`
    }
    switch (this.key) {
      case `retroColor`:
        return this.selectColor()
      case `retroFont`:
        return this.selectFont()
      case `textEffect`:
        return this.selectEffect()
    }
  }
  /**
   * Selects a colour from the Colour Pair menu.
   */
  async selectColor() {
    const colors = document.getElementById(`font-color`)
    for (const color of colors) {
      if (color.value === this.value) return (color.selected = true)
    }
  }
  /**
   * Selects a text render radio button.
   */
  async selectEffect() {
    const effects = document.getElementsByName(`effect`)
    for (const effect of effects) {
      if (effect.value === this.value) return (effect.checked = true)
    }
  }
  /**
   * Selects a font radio button from the fonts tab.
   */
  async selectFont() {
    const fonts = document.getElementsByName(`font`)
    for (const font of fonts) {
      if (font.value === this.value) return (font.checked = true)
    }
  }
  /**
   * Parse the `ExtensionInfo.installType` property to adjust Options.
   */
  async management() {
    if (typeof chrome.management !== `undefined`) {
      chrome.management.getSelf(info => {
        switch (info.installType) {
          // the add-on was installed unpacked from disk
          case `development`:
            // reveal developer links
            document.getElementById(`unittest`).style.display = `inline`
            break
          case `admin`: // the add-on was installed because of an administrative policy
          case `normal`: // the add-on was installed normally from an install package
          case `sideload`: // the add-on was installed by some other software on the user's computer
          case `other`: // the add-on was installed in some other way
            /* listed for reference */
            break
        }
      })
    }
  }
  /**
   * Parse the `runtime.getPlatformInfo` object to adjust Options.
   */
  async platform() {
    chrome.runtime.getPlatformInfo(info => {
      const localFileAccess = document.getElementById(`run-file-urls-link`)
      if (localFileAccess === null) return
      switch (info.os) {
        case `win`:
          // Windows uses drive letters for local file links
          localFileAccess.setAttribute(`href`, `file:///C:/`)
          if (FindEngine() === `blink`)
            document.getElementById(
              `smear-blocks-container`
            ).style.display = `flex`
          break
        case `mac`:
        case `android`:
        case `cros`:
        case `linux`:
        case `openbsd`:
          // cros = ChromeOS, openbsd = Open BSD (Unix)
          // reference placeholder
          if (FindEngine() === `gecko`)
            document.getElementById(
              `smear-blocks-container`
            ).style.display = `none`
          break
      }
    })
  }
  /**
   * Applies a group of Options modifiers and adjustments.
   */
  async updates() {
    this.browser()
    this.management()
    this.platform()
    this.version()
  }
  /**
   * Returns the RetroTxt version for the Options About tab.
   */
  async version() {
    const data = chrome.runtime.getManifest()
    const technobabble = document.getElementById(`manifest`)
    technobabble.textContent = `${data.version}`
  }
}
/**
 * Combinations of paired themed colours for text.
 * @class ColorPair
 */
class ColorPair {
  constructor() {
    this.pairSelect = document.getElementById(`font-color`)
    this.sampleText = document.getElementById(`sample-dos-text`)
    // selected option value of the color pair select list
    this.value = `${this.pairSelect.value}`
    // colour pair ids and names
    // the full id prefixes `theme-`, i.e `theme-amiga`
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
    this.pairSelect.addEventListener(
      `change`,
      () => {
        this.value = `${this.pairSelect.value}`
        this.select()
        this.storageSave()
        new Effects().storageLoad()
      },
      {
        passive: true
      }
    )
  }
  /**
   * Get the colour pair name from an id value.
   * @returns string
   */
  name() {
    const pair = this.value.replace(/theme-/g, ``)
    if (this.pairs.has(pair) === false) return pair.replace(/-/g, ` `)
    return this.pairs.get(pair)
  }
  /**
   * Applies the CSS class of a colour pair to the sample text.
   */
  async sample() {
    const classAsArray = this.sampleText.className.split(` `)
    // loop through and remove any *-bg and *-fg classes
    let i = classAsArray.length
    while (i--) {
      if (classAsArray[i].endsWith(`-bg`))
        this.sampleText.classList.remove(classAsArray[i])
      if (classAsArray[i].endsWith(`-fg`))
        this.sampleText.classList.remove(classAsArray[i])
    }
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
  async select() {
    const status = document.getElementById(`status`)
    status.textContent = `Saved ${this.name(
      this.value
    )} ${chrome.i18n.getMessage(`color`)} pair`
    this.sample(this.value)
  }
  /**
   * Choose a theme from the menu of the Colour Pair options
   * saved in the browser `localStorage`.
   */
  async storageLoad() {
    const selected = localStorage.getItem(`retroColor`)
    if (typeof selected !== `string`)
      return console.error(`Failed to obtain the 'retroColor' setting.`)
    this.value = `${selected}`
    this.sample()
  }
  /**
   * Save the id of a Colour Pair theme to the browser `localStorage`.
   * If an id is not provided the `localStorage` item will be deleted.
   */
  storageSave() {
    localStore(`retroColor`, `${this.value}`)
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
        this.id = `background`
        this.mapId = `customBackground`
        this.property = `backgroundColor`
        this.title = `Background`
        break
      case `foreground`:
        this.id = `foreground`
        this.mapId = `customForeground`
        this.property = `color`
        this.title = `Foreground`
        break
      default:
        return handleError(`ColorCustomPair.constructor(id) = "${id}"`)
    }
    this.input = document.getElementById(`custom-${id}`)
    this.pairSelect = document.getElementById(`font-color`)
    this.sampleText = document.getElementById(`sample-dos-text`)
    this.valid = false
    this.defaults = new OptionsReset()
  }
  /**
   * Event listeners for `<input>` and `<select>` elements.
   */
  async listen() {
    this.input.addEventListener(`input`, () => this.lengthCheck())
    // updates the sample whenever 'Custom' is selected in the Color pair menu
    this.pairSelect.addEventListener(
      `change`,
      () => {
        if (this.pairSelect.value === `theme-custom`) this.update(false)
      },
      {
        passive: true
      }
    )
  }
  /**
   * Validates the length of the `<input>` element value.
   * Resets the value to a default when the length is `0`.
   */
  lengthCheck() {
    if (this.input.value.length === 0)
      this.input.value = this.defaults.get(this.mapId)
    this.update()
    if (this.pairSelect.value !== `theme-custom`)
      this.pairSelect.value = `theme-custom`
  }
  /**
   * Previews and saves a custom colour pair change.
   * @param [save=true] Save `input.value` to `localStorage`?
   */
  update(save = true) {
    const colorTest = (value = ``) => {
      // if you try and apply an invalid `style.color` or
      // `style.backgroundColor` to an element it will return an empty value.
      if (value === ``) {
        status.textContent += `value is invalid. `
        // red colourisation
        this.input.style.color = `#d9534f`
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
    else if (save === true) {
      localStore(`${this.mapId}`, `${this.input.value}`)
      localStore(`retroColor`, `theme-custom`)
    }
  }
  /**
   * Read the browser `localStorage` and apply text effects on the sample text.
   */
  async storageLoad() {
    const value = localStorage.getItem(`${this.mapId}`)
    if (typeof value === `string`) this.input.value = `${value}`
    else this.input.value = this.defaults.get(`${this.mapId}`)
    if (this.pairSelect.value === `theme-custom`) this.update(false)
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
   * either `retroFont` or `textEffect`
   */
  constructor(storageId = ``) {
    this.sample = document.getElementById(`sample-dos-text`)
    this.feedback = ``
    this.formId = ``
    this.formName = ``
    this.storageId = `${storageId}`
    this.value = ``
    switch (storageId) {
      case `retroFont`:
        this.feedback = `font selection`
        this.formId = `font-form`
        this.formName = `fonts`
        break
      case `textEffect`:
        this.feedback = `text effect`
        this.formId = `effects-form`
        this.formName = `texteffects`
        break
      default:
        return handleError(`Radios.constructor '${storageId}'`)
    }
  }
  /**
   * Apply onClick and mouseOver event listeners to radio buttons.
   */
  async listen() {
    const labels = document.forms[this.formName].getElementsByTagName(`label`)
    const status = document.getElementById(`status`)
    for (const label of labels) {
      const input = label.getElementsByTagName(`input`)[0]
      // skip labels with no radio inputs
      if (typeof input === `undefined`) continue
      // radio event listeners
      label.onclick = () => {
        this.value = `${input.value}`
        const font = new FontFamily(this.value)
        font.set()
        status.textContent = `Saved ${this.feedback} ${font.family}`
        this.storageSave()
      }
      label.onmouseover = () => {
        this.value = `${input.value}`
        const font = new FontFamily(this.value)
        font.set()
        status.textContent = `Preview of ${this.feedback} ${font.family}`
        this.preview()
      }
      // reset sample text when the mouse is out
      if (label.htmlFor.length < 1) continue
      const radio = document.getElementById(label.htmlFor)
      document
        .getElementById(`${this.formId}`)
        .addEventListener(`mouseleave`, () => {
          if (radio.checked === true) {
            const font = new FontFamily(radio.value)
            font.set()
            status.textContent = `Using ${this.feedback} ${font.family}`
            switch (this.storageId) {
              case `retroFont`:
                this.value = `${radio.value}`
                return this.preview()
              case `textEffect`:
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
 * Text render effect.
 * @class Effects
 */
class Effects extends Radios {
  constructor() {
    super(`textEffect`)
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
    super(`retroFont`)
  }
  /**
   * Swaps out the font family on the sample preview.
   */
  async preview() {
    if (this.sample.classList === null) return // error
    const classes = this.sample.className.split(` `)
    // loop through and remove any font-* classes
    for (const name of classes) {
      if (name.startsWith(`font-`)) this.sample.classList.remove(name)
    }
    this.sample.classList.add(`font-${this.value}`)
  }
}
/**
 * Line height selection.
 * @class LineHeight
 */
class LineHeight {
  constructor() {
    this.lineHeight = document.getElementById(`line-height`)
    this.status = document.getElementById(`status`)
    this.value = this.lineHeight.value
  }
  /**
   * Event listener for the `<select>` element.
   */
  async listen() {
    this.lineHeight.addEventListener(
      `change`,
      () => {
        this.value = this.lineHeight.value
        switch (`${this.value}`) {
          case `100%`:
          case `normal`:
            this.status.textContent = `Saved ${this.value}`
            break
          default:
            this.status.textContent = `Saved ${this.value}x`
        }
        this.status.textContent += ` line height selection`
        this.storageSave()
      },
      { passive: true }
    )
  }
  /**
   * Loads and selects the saved line height setting.
   */
  async storageLoad() {
    this.value = localStorage.getItem(`lineHeight`)
    for (const height of this.lineHeight) {
      if (height.value === this.value) return (height.selected = true)
    }
  }
  /**
   * Save line height selection to `localStorage`.
   */
  storageSave() {
    localStore(`lineHeight`, `${this.value}`)
  }
}
/**
 * Options dialogue tab selection.
 * @class Tabs
 */
class Tabs {
  constructor() {
    this.content = document.getElementsByClassName(`tabcontent`)
    this.tabs = document.getElementsByClassName(`tablinks`)
  }
  /**
   * Event listeners.
   */
  async listen() {
    Array.prototype.filter.call(this.tabs, page => {
      if (typeof page === `undefined`) return
      page.addEventListener(`click`, () => {
        const id = `${page.id.charAt(6)}`
        this.reveal(id)
        this.storageSave(id)
        // clear all then apply active class to the button element
        const buttons = document.getElementsByClassName(`tablinks`)
        for (const button of buttons) {
          button.classList.remove(`activeButton`)
        }
        const button = document.getElementById(`btnTab${id}`)
        button.classList.add(`activeButton`)
      })
    })
  }
  /**
   * Refreshes the Options dialogue after a tab is selected.
   * @param {number} [selected=1] Numeric tab id
   */
  async reveal(selected = 1) {
    const value = parseInt(selected, 10)
    if (isNaN(value) || value < 1 || value > 4) selected = `1`
    // iterate over each <section> element
    Array.prototype.filter.call(this.content, page => {
      if (typeof page !== `undefined`) page.style.display = `none`
    })
    // iterate over each `<button class="tablinks">` element
    const buttons = document.getElementsByClassName(`tablinks`)
    Array.prototype.filter.call(buttons, button => {
      return (button.style.backgroundColor = `initial`)
    })
    // Reveal the current tab
    const page = document.getElementById(`tab${selected}`)
    const button = document.getElementById(`btnTab${selected}`)
    if (typeof page.style.display !== `undefined`) {
      page.style.display = `block`
      button.style.backgroundColor = `var(--chrome-focus)`
    }
    // Set the sample-container
    const sample = document.getElementById(`sample-container`)
    const status = document.getElementById(`status`)
    if (sample === null || status === null) return
    switch (value) {
      case 1:
        sample.style.display = `flex`
        status.textContent = `Fonts tab selected`
        break
      case 2:
        sample.style.display = `flex`
        status.textContent = `Display tab selected`
        break
      case 3:
        sample.style.display = `none`
        status.textContent = `Config tab selected`
        break
      case 4:
        sample.style.display = `none`
        status.textContent = `About tab selected`
        break
    }
  }
  /**
   * Load and apply the active tab selection.
   */
  async storageLoad() {
    const tab = localStorage.getItem(`optionTab`)
    if (typeof tab === `string`) this.reveal(tab)
    else this.reveal()
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
 * Apply RetroTxt to any files hosted on URLs.
 * @class URLs
 * @extends {Configuration}
 */
class URLs {
  constructor() {
    this.status = document.getElementById(`status`)
    this.textArea = document.getElementById(`run-web-urls-permitted`)
    this.value = this.textArea.value
  }
  /**
   * Event listener for the `<textarea>` element.
   */
  async listen() {
    this.textArea.addEventListener(`input`, () => {
      this.value = this.textArea.value
      if (this.value.length < 1) {
        this.status.textContent = `Reset websites to defaults`
        this.value = new Configuration().domainsString()
        this.textArea.value = this.value
      } else this.status.textContent = `Updated websites`
      this.storageSave()
    })
  }
  /**
   * Load and display URLs in the `<textarea>` element.
   */
  async storageLoad() {
    chrome.storage.local.get(`runWebUrlsPermitted`, result => {
      this.value = `${result.runWebUrlsPermitted}`
      this.textArea.value = this.value
    })
  }
  /**
   * Save the URLs to `localStorage`.
   */
  storageSave() {
    localStore(`runWebUrlsPermitted`, `${this.value}`)
  }
}
// Self-invoking expression that runs whenever the Options dialogue is opened.
// And also with Firefox when the options tab is refreshed.
(() => {
  // Self-invoking expressions
  //
  // exit when running qunit tests
  if (typeof qunit !== `undefined`) return
  // initialise classes
  const initialise = new Initialise()
  // lookup and applies checked, selections, active, once the HTML is loaded and
  // parsed
  document.addEventListener(`DOMContentLoaded`, initialise.checks())
  // modifies `html/options.html`
  initialise.updates()
  // restore any saved options and apply event listeners
  const checkboxes = new CheckBox()
  checkboxes.storageLoad()
  checkboxes.listen()
  const setColourPairs = new ColorPair()
  setColourPairs.storageLoad()
  setColourPairs.listen()
  const customBackground = new ColorCustomPair(`background`)
  const customForeground = new ColorCustomPair(`foreground`)
  customBackground.storageLoad()
  customForeground.storageLoad()
  customBackground.listen()
  customForeground.listen()
  const font = new Fonts()
  font.storageLoad()
  font.listen()
  const textEffect = new Effects()
  textEffect.storageLoad()
  textEffect.listen()
  const lineHeight = new LineHeight()
  lineHeight.storageLoad()
  lineHeight.listen()
  const tab = new Tabs()
  tab.storageLoad()
  tab.listen()
  const urls = new URLs()
  urls.storageLoad()
  urls.listen()

  // apply regional English edits
  // color vs colour
  localizeWord(`color`, `msg-color`)
  // center vs centre
  localizeWord(`center`, `msg-center`)
  // gray vs grey
  document.getElementById(
    `gray-white-option`
  ).textContent = chrome.i18n.getMessage(`gray_white_option`)
  // capitalize the first letter
  const customColorText = document
    .getElementById(`font-styles-custom-colors`)
    .getElementsByClassName(`msg-color`)[0]
  customColorText.textContent = customColorText.textContent.toLowerCase()
})()
