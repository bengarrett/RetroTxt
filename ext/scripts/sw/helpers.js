// Replacement for function.js with no DOM or Chrome API access.

/*global CheckError */
/*exported ConsoleLoad WebBrowser Configuration Characters CheckLastError FindControlSequences RemoveTextPairs BBSText PlainText UnknownText
UseCharSet DOS_437_English DOS_865 ISO8859_5 ISO8859_10 Macintosh Shift_JIS Windows_1250 Windows_1251
UnicodeStandard OutputCP1252 OutputISO8859_1 OutputISO8859_15 OutputUS_ASCII OutputUFT8 Console
*/

/*
Content scripts can access Chrome APIs used by their parent extension by exchanging messages with the extension. They can also access the URL of an extension's file with chrome.runtime.getURL() and use the result the same as other URLs.

// Code for displaying <extensionDir>/images/myimage.png:
var imgURL = chrome.runtime.getURL("images/myimage.png");
document.getElementById("someImage").src = imgURL;
Additionally, content scripts can access the following chrome APIs directly:

i18n
storage
runtime:
  connect
  getManifest
  getURL
  id
  onConnect
  onMessage
  sendMessage

https://developer.chrome.com/docs/extensions/mv3/content_scripts/
*/

// IIFE
;(() => {
  ConsoleLoad(`helpers`)
})()

// RetroTxt developer verbose feedback store name
const Developer = `developer`

// enums like consts
// these cannot use ES6 Symbols as their unique values are not shared between scripts
const // browsers
  Chrome = 0,
  Firefox = 1

const // operating systems
  Linux = 0,
  MacOS = 1,
  Windows = 2

const // Character set key values
  // The keys and their values should be distinct from any IANA character set names
  DOS_437_English = `cp_437`, // IBM PC English legacy text
  DOS_865 = `cp_865`, // IBM PC Nordic legacy text
  ISO8859_1 = `iso_8859_1`, // Unix English legacy text
  ISO8859_5 = `iso_8859_5`, // Cyrillic legacy text
  ISO8859_10 = `iso_8859_10`, // Nordic legacy text
  ISO8859_15 = `iso_8859_15`, // ISO-8859-1 update to include € and 7 other character swaps
  Macintosh = `mac_roman`, // Apple Macintosh legacy text
  Shift_JIS = `shift_jis`, // Japanese legacy text that requires speciality decoding and fonts
  Windows_1250 = `cp_1250`, // Microsoft Windows Central/Eastern European legacy text
  Windows_1251 = `cp_1251`, // Microsoft Windows Cyrillic legacy text
  Windows_1252_English = `cp_1252`, // Microsoft Windows English legacy text
  UnicodeStandard = `utf_8`, // Unicode, 8-bit multi-byte text
  US_ASCII = `us_ascii`, // 7-bit, ARPANET/Internet legacy text
  // changing the values of these consts can break application functionality
  TranscodeArrow = `➡`,
  // use the browser choosen document character set
  UseCharSet = `useCharSet${TranscodeArrow}`,
  // transcode text into Windows legacy CP-1252 before Unicode
  OutputCP1252 = `${Windows_1252_English}${TranscodeArrow}`,
  // transcode text into Unix legacy ISO-8859-1 before Unicode
  // this is required and used by SAUCE metadata
  OutputISO8859_1 = `${ISO8859_1}${TranscodeArrow}`,
  // transcode text into Internet legacy ISO-8859-15 before Unicode
  OutputISO8859_15 = `${ISO8859_15}${TranscodeArrow}`,
  // transcode text into legacy 7-bit US-ASCII before Unicode
  OutputUS_ASCII = `${US_ASCII}${TranscodeArrow}`,
  // transcode text into Unicode, 23-Oct-20, not sure if this gets used, see unit test.
  OutputUFT8 = `utf_8${TranscodeArrow}`

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
const Web = {
  // Google Chrome, Microsoft Edge, Brave browser
  Chrome: 0,
  // Mozilla Firefox
  Firefox: 1,
}
const OS = {
  Linux: 0,
  MacOS: 1,
  Windows: 2,
}
Object.freeze([Web, OS])

const persistent = chrome.runtime.getManifest().background.persistent || false

/**
 * Handle `chrome.runtime.lastError` callback errors.
 * @param {string} [errorFor=``] Source description of the error
 */
function CheckLastError(errorFor = ``) {
  /* Some methods that set chrome.runtime.lastError:
   * - chrome.runtime.openOptionsPage+
   * - chrome.runtime.setUninstallURL+
   * - chrome.runtime.sendMessage+
   * - chrome.runtime.sendNativeMessage+
   * - chrome.permissions.request+
   * - chrome.permissions.remove+
   * - chrome.storage.onChanged.get
   * - chrome.storage.onChanged.getBytesInUse
   * - chrome.storage.onChanged.set
   * - chrome.storage.onChanged.remove
   * - chrome.storage.onChanged.clear
   * - chrome.contextMenus.create+
   * - chrome.downloads+
   * - chrome.fileSystem
   * - chrome.tabs.sendMessage+
   */
  // Firefox does not support `background.persistent`
  // runtime.lastError checks are only needed when the `background.persistent` value is true.
  // Otherwise checking this value will cause false positive errors.
  // Example: Unchecked lastError value: Error: Script '<anonymous code>' result is non-structured-clonable data
  //
  // Chrome lastError callback
  if (persistent) return lastError(errorFor)
  // Firefox specific lastError callback
  if (typeof chrome.runtime.lastError === `undefined`) return false
  if (chrome.runtime.lastError === null) return false
  if (typeof chrome.runtime.lastError.mess === `undefined`) return false
  console.warn(
    `Last error warning for %s\nReason: %s`,
    errorFor,
    chrome.runtime.lastError.mess
  )
  return false
}
function lastError(errorFor = ``) {
  if (chrome.runtime.lastError === `undefined`) return false
  console.error(
    `Last error for %s\nReason: %s`,
    errorFor,
    chrome.runtime.lastError.mess
  )
  return true
}

// TODO: NOTE localstorage does not work with service workers
/**
 * Options values for when RetroTxt is first initialised or reset.
 * @class OptionsReset
 */
class OptionsReset {
  constructor() {
    this.options = new Map()
      .set(`ansiColumnWrap`, true)
      .set(`ansiPageWrap`, false) // new in v4
      .set(`ansiUseIceColors`, true)
      .set(`colorsAnsiColorPalette`, `vga`)
      .set(`colorsCustomBackground`, `#3f3f3f`)
      .set(`colorsCustomForeground`, `#dcdccc`)
      .set(`colorsTextPairs`, `msdos`)
      .set(`fontFamilyName`, `ibm_vga_8x16`) // new in v4, formerly retroFont
      .set(`optionTab`, `0`) // new in v4
      .set(`optionClass`, `is-primary`) // new in v4.2
      .set(`settingsInformationHeader`, `on`) // formerly textFontInformation
      .set(`settingsNewUpdateNotice`, true)
      .set(`settingsWebsiteViewer`, true)
      .set(`textAccurate9pxFonts`, false)
      .set(`textBackgroundScanlines`, false)
      .set(`textBlinkingCursor`, true)
      .set(`textCenterAlign`, true)
      .set(`textDOSControlGlyphs`, false)
      .set(`textLineHeight`, `1`)
      .set(`textRenderEffect`, `normal`)
      .set(`textSmearBlockCharacters`, BrowserOS() === Windows ? true : false)
      // permitted domains, these MUST also be listed as `hosts` in the
      // `manifest.json` under the `optional_permissions` key.
      .set(`settingsWebsiteDomains`, [
        `16colo.rs`,
        `defacto2.net`,
        `gutenberg.org`,
        `scene.org`,
        `textfiles.com`,
        `uncreativelabs.net`,
      ])
      // permitted url schemes, these MUST also be listed as `hosts` in the
      // `manifest.json` under the `optional_permissions` key.
      .set(`schemesPermitted`, [`file`, `http`, `https`])
  }
  /**
   * Get the reset value of the option key.
   * @param [item=``] Options `Map` key
   * @returns any
   */
  get(item = ``) {
    if (this.options.has(item)) return this.options.get(item)
    return `error: not found`
  }
}
/**
 * Configurations used by Options and the extension manifest.
 * @class Configuration
 */
class Configuration extends OptionsReset {
  constructor() {
    super()
    // RetroTxt background triggers
    this.triggers = new Map()
      // file extensions that trigger RetroTxt when a `file:///` url is in use
      .set(`extensions`, [
        `asc`,
        `ascii`,
        `ans`,
        `ansi`,
        `diz`,
        `faq`,
        `nfo`,
        `pcb`,
        `text`,
        `txt`,
      ])
      // list of domains that RetroTxt will run in the background
      .set(`domains`, super.get(`settingsWebsiteDomains`))
    this.errors = new Map()
      // file extensions to ignore when a `file:///` url is in use
      .set(`code`, [`css`, `htm`, `html`, `js`, `json`, `md`, `xml`, `yml`])
      .set(`fonts`, [`otc`, `otf`, `svg`, `ttc`, `ttf`, `woff`, `woff2`])
      .set(`images`, [
        `apng`,
        `bmp`,
        `dib`,
        `gif`,
        `jpeg`,
        `jpg`,
        `ico`,
        `svg`,
        `svgz`,
        `png`,
        `tiff`,
        `webp`,
        `xbm`,
      ])
      .set(`others`, [`ini`, `pdf`])
      // Chrome data sourced from https://sites.google.com/a/chromium.org/dev/audio-video
      // Firefox https://support.mozilla.org/en-US/kb/html5-audio-and-video-firefox?redirectlocale=en-US&redirectslug=Viewing+video+in+Firefox+without+a+plugin
      .set(`media`, [
        `flac`,
        `mp3`,
        `mp4`,
        `m4a`,
        `m4b`,
        `m4p`,
        `m4r`,
        `m4v`,
        `mp3`,
        `ogv`,
        `ogm`,
        `ogg`,
        `oga`,
        `ogx`,
        `opus`,
        `spx`,
        `webm`,
        `wav`,
        `wave`,
      ])
      // list of domains that RetroTxt will always ignore because of rendering
      // conflicts
      .set(`domains`, [`feedly.com`, `github.com`, `webhooks.retrotxt.com`])
    // RetroTxt render options
    this.textRender = new Map()
      // default number of characters of text per line
      .set(`columns`, 80)
      // default CSS page width value
      .set(`cssWidth`, `100%`) // = 640px
  }
  /**
   * Number of characters of text per line.
   * @returns number
   */
  cssWidth() {
    return this.textRender.get(`cssWidth`)
  }
  /**
   * A list of domains that RetroTxt can monitor.
   * @param [separator=`;`] Character to use as a separator
   * @returns string
   */
  domainsString(separator = `;`) {
    return this.triggers.get(`domains`).join(`${separator}`)
  }
  /**
   * Copies a `chrome.storage.local` item to the browser's localStorage.
   * @param [key=``] Storage item name
   */
  setLocalStorage(key = ``) {
    if (this.options.has(key) === false)
      return CheckError(
        `The storage key ${key} is not a known chrome.storage.local item`
      )
    // get saved item from browser storage
    chrome.storage.local.get([`${key}`], (result) => {
      const value = result[`${key}`]
      if (StringToBool(value) === null) {
        return CheckError(
          `Could not obtain the requested chrome.storage ${key} setting`
        )
      }
      localStorage.setItem(`${key}`, value)
    })
  }
  /**
   * Check the `uri` to see if RetroTxt is permitted to monitor.
   * @param [uri=``] Domain to check
   * @returns boolean
   */
  validateDomain(uri = ``) {
    const domains = this.errors.get(`domains`)
    return domains.includes(uri)
  }
  /**
   * Check the `filename` to see if RetroTxt download event handler should
   * trigger.
   * @param [filename=``] Filename to check
   * @returns boolean
   */
  validateFileExtension(filename = ``) {
    const arr = filename.split(`.`)
    if (arr.length < 2) return false
    const ext = arr[arr.length - 1]
    return this.triggers.get(`extensions`).includes(ext.toLowerCase())
  }
  /**
   * Check the `filename` to see if RetroTxt will trigger.
   * @param [filename=``] Filename to check
   * @returns boolean
   */
  validateFilename(filename = ``) {
    const arr = filename.split(`.`)
    if (arr.length < 2) return false
    const ext = arr[arr.length - 1]
    return !this._fileExtsError().includes(ext.toLowerCase())
  }
  /**
   * An array of filename extensions that RetroTxt always ignores.
   * @returns array
   */
  _fileExtsError() {
    return [
      ...this.errors.get(`code`),
      ...this.errors.get(`fonts`),
      ...this.errors.get(`images`),
      ...this.errors.get(`media`),
      ...this.errors.get(`others`),
    ]
  }
}

/**
 * Determines the browser host operating system.
 * Returns either `2` for Windows, `1 for macOS or `0` for Linux and other systems.
 * @returns string
 */
function BrowserOS() {
  // navigator.platform is a deprecatedacy value, in the future it may need to be replaced
  // with chrome.runtime.getPlatformInfo((info) => {}
  const os = globalThis.navigator.platform.slice(0, 3).toLowerCase()
  switch (os) {
    case `win`: // Win32, Win64
      return Windows
    case `mac`: // MacIntel, MacArm
      return MacOS
    default:
      // Android, Linux, FreeBSD
      return Linux
  }
}

/**
 * Determines the browser render engine.
 * Returns either `0` for Chrome, Chromium, Brave and Microsoft Edge or `1` for Firefox.
 * @returns string
 */
function WebBrowser() {
  const ui = chrome.runtime.getManifest().options_ui
  if (ui !== undefined && ui.page !== undefined) {
    const manifest = ui.page,
      firefoxID = manifest.startsWith(`moz-extension`, 0)
    return firefoxID ? Firefox : Chrome
  }
}

/**
 * Takes a string and converts it to a primitive boolean value,
 * or return null if the string is not a boolean representation.
 * @param [string=``] Boolean represented as a string
 * @returns boolean
 */
function StringToBool(string = ``) {
  switch (`${string}`.trim()) {
    case `true`:
    case `yes`:
    case `on`:
    case `1`:
      return true
    case `false`:
    case `no`:
    case `off`:
    case `0`:
      return false
    default:
      return null
  }
}

function Console(string = ``) {
  chrome.storage.local.get(Developer, (store) => {
    if (Developer in store) console.log(`${string}`)
  })
}

function ConsoleLoad(page = ``) {
  if (page === ``) return
  console.info(`🖫 ${page} service worker installed.`)
}
