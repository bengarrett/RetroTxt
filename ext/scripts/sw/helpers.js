// File: scripts/sw/helpers.js
//
// Service worker "helper" shared functions.
// These are shared between both service workers and container-scripts.
// This is a replacement for the previous RetroTxt function JS file.
//
// The contained functions and methods cannot access the APIs
// for the browser DOM or web extensions* (there are some exceptions).
// See: https://developer.chrome.com/docs/extensions/mv3/content_scripts

// onInstalled only works with service workers.
if (typeof chrome.runtime.onInstalled !== `undefined`) {
  chrome.runtime.onInstalled.addListener(() => {
    ConsoleLoad(`shared helpers`)
    // Initialize platform detection early
    BrowserOS().catch(error => {
      console.error('Early platform detection failed:', error)
    })
  })
}

// Get the active tab information of the current window.
// eslint-disable-next-line no-unused-vars
async function GetCurrentTab() {
  const queryOptions = { active: true, currentWindow: true }
  const [tab] = await chrome.tabs.query(queryOptions)
  return tab
}

// The IIFE serves as an onStartup method for content-scripts.
;(() => {
  // placeholder
})()

// Developer is the verbose feedback store name.
// DeveloperModeDebug gives additional Console log feedback when running in Developer mode.
const Developer = `developer`
// eslint-disable-next-line no-unused-vars
const DeveloperModeDebug = false

// Cache for BrowserOS result to handle synchronous calls
let browserOSCache = null

// Browser rendering engine.
const Engine = {
  chrome: 0,
  firefox: 1,
}
// Browser host operating system.
const Os = {
  linux: 0,
  macOS: 1,
  windows: 2,
}
// Browser platform operating system.
const PlatformOS = {
  mac: `macOS`,
  win: `Windows`,
  android: `Android`,
  cros: `ChromeOS`,
  linux: `Linux`,
  openbsd: `OpenBSD`,
}
// Browser platform architecture.
const PlatformArch = {
  arm: `ARM`,
  arm64: `ARM64`,
  "x86-32": `Intel x86`,
  "x86-64": `Intel x64`,
  mips: `MIPS`,
  mips64: `MIPS64`,
}
// Character sets keys and values.
// The keys and their values should be distinct from any IANA character set names.
const Cs = {
  DOS_437_English: `cp_437`, // IBM PC English legacy text
  DOS_865: `cp_865`, // IBM PC Nordic legacy text
  ISO8859_1: `iso_8859_1`, // Unix English legacy text
  ISO8859_5: `iso_8859_5`, // Cyrillic legacy text
  ISO8859_10: `iso_8859_10`, // Nordic legacy text
  ISO8859_15: `iso_8859_15`, // ISO-8859-1 update to include € and 7 other character swaps
  Macintosh: `mac_roman`, // Apple Macintosh legacy text
  Shift_JIS: `shift_jis`, // Japanese legacy text that requires speciality decoding and fonts
  Windows_1250: `cp_1250`, // Microsoft Windows Central/Eastern European legacy text
  Windows_1251: `cp_1251`, // Microsoft Windows Cyrillic legacy text
  Windows_1252_English: `cp_1252`, // Microsoft Windows English legacy text
  UnicodeStandard: `utf_8`, // Unicode, 8-bit multi-byte text
  US_ASCII: `us_ascii`, // 7-bit, ARPANET/Internet legacy text
  // Changing the value of TranscodeToggle must be applied to the Menu character sets listed below.
  TranscodeToggle: `➡`,
  // Menu character sets. These must be suffixed with the TranscodeToggle character.
  UseCharSet: `useCharSet➡`, // use the browser choosen document character set
  OutputCP1252: `cp_1252➡`, // transcode text into Windows legacy CP-1252 before Unicode
  OutputISO8859_1: `iso_8859_1➡`, // transcode text into Unix legacy ISO-8859-1 before Unicode (required by SAUCE metadata)
  OutputISO8859_15: `iso_8859_15➡`, // transcode text into Internet legacy ISO-8859-15 before Unicode
  OutputUS_ASCII: `us_ascii➡`, // transcode text into legacy 7-bit US-ASCII before Unicode
  OutputUFT8: `utf_8➡`, // keep as Unicode, this is used by the Guess() class.
}
// Freeze each enumeration object individually to prevent modification
Object.freeze(Engine)
Object.freeze(Os)
Object.freeze(PlatformOS)
Object.freeze(PlatformArch)
Object.freeze(Cs)

/**
 * Prints the string to the console when Developer mode is enabled.
 * @param {*} string
 */
// eslint-disable-next-line no-unused-vars
function Console(string = '') {
  chrome.storage.local.get(Developer, (store) => {
    if (Developer in store) console.log(`${string}`)
  })
}

/**
 * Prints the service worker installed to the console when Developer mode is enabled.
 * @param {*} string
 */
function ConsoleLoad(page = '') {
  if (page === '') return
  console.info(`🖫 ${page} service worker installed.`)
}

/**
 * Handle `chrome.runtime.lastError` callback errors.
 * @param {string} [errorFor=''] Source description of the error
 */
// eslint-disable-next-line no-unused-vars
function CheckLastError(errorFor = '') {
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
  return lastError(errorFor)
}

function lastError(errorFor = '') {
  if (typeof chrome.runtime.lastError === `undefined`) return false
  const message = chrome.runtime.lastError.message
  if (typeof message === `undefined`) return false
  if (message === '') return false
  if (
    message.startsWith(`The message port closed before a response was received`)
  ) {
    console.warn(`Last error for %s\nReason: %s`, errorFor, message)
    return false
  }
  console.error(`Last error for %s\nReason: %s`, errorFor, message)
  return true
}

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
      .set(`colorsTextPairs`, `theme-msdos`)
      .set(`fontFamilyName`, `ibm_vga_8x16`) // new in v4, formerly retroFont
      .set(`linkifyHyperlinks`, false) // new in v5.2
      .set(`linkifyValidate`, false) // new 5.4
      .set(`optionTab`, `0`) // new in v4
      .set(`optionClass`, `is-primary`) // new in v4.2
      .set(`settingsInformationHeader`, `on`) // formerly textFontInformation
      .set(`settingsNewUpdateNotice`, false) // changed default in v5.1
      .set(`settingsToolbarIcon`, `auto`)
      .set(`settingsWebsiteViewer`, true)
      .set(`textAccurate9pxFonts`, false)
      .set(`textBackgroundScanlines`, false)
      .set(`textBlinkingCursor`, true)
      .set(`textCenterAlign`, true)
      .set(`textDOSControlGlyphs`, false)
      .set(`textLineHeight`, `1`)
      .set(`textFontSize`,`1`)
      .set(`textRenderEffect`, `normal`)
      .set(`textSmearBlockCharacters`, getBrowserOS() === Os.windows)
      // permitted domains.
      .set(`settingsWebsiteDomains`, [
        `localhost`,
        `16colo.rs`,
        `defacto2.net`,
        `gutenberg.org`,
        `scene.org`,
        `textfiles.com`,
        `uncreativelabs.net`,
      ])
      // permitted url schemes, these MUST also be listed in the
      // `manifest.json` file under the `host_permissions` key.
      .set(`schemesPermitted`, [`file`, `http`, `https`])
  }
  /**
   * Get the reset value of the option key.
   * @param [item=''] Options `Map` key
   * @returns any
   */
  get(item = '') {
    if (this.options.has(item)) return this.options.get(item)
    return `error: not found`
  }
}

/**
 * Configurations used by Options and the extension manifest.
 * @class Configuration
 */
// eslint-disable-next-line no-unused-vars
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
    const characters = 80
    this.textRender = new Map()
      // default number of characters of text per line
      .set(`columns`, characters)
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
   * @returns array
   */
  domains() {
    return this.triggers.get(`domains`)
  }
  /**
   * Sets the missing `chrome.storage.local` item to the reset value.
   * @param [key=''] Storage item name
   */
  setLocalStorage(key = '') {
    if (this.options.has(key) === false)
      return CheckError(
        `The storage key ${key} is not a known chrome.storage.local item`,
      )
    // get saved item from browser storage
    chrome.storage.local.get([`${key}`], (result) => {
      const value = result[`${key}`]
      if (StringToBool(value) === null) {
        const defValue = this.options.get(key)
        if (defValue === null)
          return CheckError(
            `Could not obtain the requested chrome.storage ${key} setting`,
          )
        chrome.storage.local.set({ [key]: defValue })
        sessionStorage.setItem(key, defValue)
        return localStorage.setItem(key, defValue)
      }
      sessionStorage.setItem(key, value)
      return localStorage.setItem(key, value)
    })
  }
  /**
   * Check the `uri` to see if RetroTxt is permitted to monitor.
   * @param [uri=''] Domain to check
   * @returns boolean
   */
  validateDomain(uri = '') {
    const domains = this.errors.get(`domains`)
    return domains.includes(uri)
  }
  /**
   * Check the `filename` to see if RetroTxt download event handler should
   * trigger.
   * @param [filename=''] Filename to check
   * @returns boolean
   */
  validateFileExtension(filename = '') {
    const arr = filename.split(`.`)
    if (arr.length < 2) return false
    const ext = arr[arr.length - 1]
    return this.triggers.get(`extensions`).includes(ext.toLowerCase())
  }
  /**
   * Check the `filename` to see if RetroTxt will trigger.
   * @param [filename=''] Filename to check
   * @returns boolean
   */
  validateFilename(filename = '') {
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
 * Determines the browser host operating system asynchronously.
 * Returns either `2` for Windows, `1 for macOS or `0` for Linux and other systems.
 * Uses modern async/await with chrome.runtime.getPlatformInfo() API when available.
 * @returns {Promise<number>} Promise that resolves to the OS constant
 */
async function BrowserOS() {
  // Return cached value if available
  if (browserOSCache !== null) {
    return browserOSCache
  }
  
  try {
    // Check if modern Chrome 99+ API is available
    if (typeof chrome.runtime.getPlatformInfo === 'function') {
      const info = await chrome.runtime.getPlatformInfo()
      if (chrome.runtime.lastError) {
        console.error('Platform detection error:', chrome.runtime.lastError)
        // Fall through to user agent detection
      } else if (info?.os) {
        const osResult = (() => {
          switch (info.os) {
            case 'win':
              return Os.windows
            case 'mac':
              return Os.macOS
            case 'linux':
            case 'cros':
            case 'android':
            case 'openbsd':
            default:
              return Os.linux
          }
        })()
        
        browserOSCache = osResult // Cache the result
        return osResult
      }
    }
    
    // Fallback: Use navigator.userAgent for basic detection
    // This works in both service worker and content script contexts
    try {
      const userAgent = navigator.userAgent
      if (userAgent.includes('Windows')) {
        browserOSCache = Os.windows
        return Os.windows
      }
      if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS')) {
        browserOSCache = Os.macOS
        return Os.macOS
      }
      if (userAgent.includes('Linux') || userAgent.includes('Android')) {
        browserOSCache = Os.linux
        return Os.linux
      }
      if (userAgent.includes('CrOS')) { // ChromeOS
        browserOSCache = Os.linux
        return Os.linux
      }
    } catch (fallbackError) {
      console.warn('User agent fallback failed:', fallbackError)
    }
    
    // Ultimate fallback
    browserOSCache = Os.linux
    return Os.linux
  } catch (error) {
    console.error('Platform detection failed, using ultimate fallback:', error)
    browserOSCache = Os.linux
    return Os.linux
  }
}

/**
 * Synchronous wrapper for BrowserOS that returns cached value or initiates detection.
 * For use in synchronous contexts where async/await is not available.
 * @returns {number} The cached OS constant, or attempts synchronous detection if not cached
 */
function getBrowserOS() {
  // If we have a cached value, return it synchronously
  if (browserOSCache !== null) {
    return browserOSCache
  }
  
  // Try synchronous user agent detection immediately
  try {
    const userAgent = navigator.userAgent
    if (userAgent.includes('Windows')) {
      browserOSCache = Os.windows
      return Os.windows
    }
    if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS')) {
      browserOSCache = Os.macOS
      return Os.macOS
    }
    if (userAgent.includes('Linux') || userAgent.includes('Android') || userAgent.includes('CrOS')) {
      browserOSCache = Os.linux
      return Os.linux
    }
  } catch (error) {
    console.warn('Synchronous platform detection failed:', error)
  }
  
  // If still no cached value, initiate async detection in background
  if (browserOSCache === null) {
    BrowserOS().catch(error => {
      console.error('Background platform detection failed:', error)
    })
  }
  
  // Return cached value or default
  return browserOSCache !== null ? browserOSCache : Os.linux
}

/**
 * Determines the browser render engine.
 * Returns either `0` for Chrome, Chromium and Edge or `1` for Firefox.
 * @returns {number} Engine constant (Engine.chrome or Engine.firefox)
 */
// eslint-disable-next-line no-unused-vars
function WebBrowser() {
  try {
    const ui = chrome.runtime.getManifest().options_ui
    if (typeof ui !== `undefined` && typeof ui.page !== `undefined`) {
      const manifest = ui.page,
        firefoxID = manifest.startsWith(`moz-extension`, 0)
      return firefoxID ? Engine.firefox : Engine.chrome
    }
    // Default to Chrome engine if manifest structure is unexpected
    return Engine.chrome
  } catch (error) {
    console.error('Browser engine detection failed:', error)
    // Fallback to Chrome engine on error
    return Engine.chrome
  }
}

/**
 * Takes a string and converts it to a primitive boolean value,
 * or return null if the string is not a boolean representation.
 * @param [string=''] Boolean represented as a string
 * @returns {boolean|null} true, false, or null if not a boolean representation
 */
function StringToBool(string = '') {
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

/*global CheckError*/
