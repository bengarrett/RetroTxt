// filename: functions.js
//
// These functions are shared between all scripts
// - scripts/eventpage.js
// - scripts/options.js
// - scripts/parse_ansi.js, scripts/parse_dos.js
// - scripts/retrotxt.js
//
// To make the code in those pages easier to read, functions listed here use the
// Global naming convention.
//
/*eslint no-redeclare: ["error", { "builtinGlobals": false }]*/
/*global DOM RetroTxt*/
/*exported Characters CheckLastError FindControlSequences RemoveTextPairs BBSText PlainText UnknownText
UseCharSet*/
"use strict"

// enums like consts
// these cannot use ES6 Symbols as their unique values are not shared between scripts
const // browsers
  Chrome = 0,
  Firefox = 1,
  // operating systems
  Linux = 0,
  MacOS = 1,
  Windows = 2,
  // text type, using control codes or sequences
  UnknownText = -1,
  PlainText = 0,
  PCBoardText = 1,
  CelerityText = 2,
  RenegadeText = 3,
  TelegardText = 4,
  WildcatText = 5,
  WWIVHashText = 6,
  WWIVHeartText = 7,
  BBSText = 98,
  ANSIText = 99

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

/**
 * Argument checker for functions and classes.
 * @param {string} [name=``] The argument name that failed
 * @param {string} [expecteparam {*} actual The actual argument used
 */
function CheckArguments(name = ``, expected = ``, actual) {
  let msg = ``
  switch (expected) {
    case `boolean`:
      msg = `argument '${name}' should be a 'boolean' (true|false) instead of a '${typeof actual}'`
      break
    case `number`:
      msg = `argument '${name}' should be a 'number' (unsigned) instead of a '${typeof actual}'`
      break
    case `string`:
      msg = `argument '${name}' should be a 'string' of text instead of a '${typeof actual}'`
      break
    default:
      msg = `argument '${name}' needs to be a '${expected}' instead of a '${typeof actual}'`
      break
  }
  if (typeof qunit !== `undefined`) return msg
  CheckError(msg)
}

/**
 * Out of range handler for functions and classes.
 * @param {string} [name=``] The argument name that failed
 * @param {string} [issue=``] The type of error
 * @param {*} expected The expected value
 * @param {*} actual The actual value
 */
function CheckRange(name = ``, issue = ``, expected, actual) {
  let msg = ``
  switch (issue) {
    case `length`:
      msg = `the number of characters '${actual}' used for the argument '${name}' is too short, it needs to be at least '${expected}' character`
      if (expected !== `1` && expected !== 1) msg += `s`
      break
    case `range`:
      msg = `the value '${actual}' for the argument '${name}' is out of range, it needs to be either '${expected.join(
        `, `
      )}'`
      break
    case `small`:
      msg = `the value '${actual}' for the argument '${name}' is too small, it needs to be at least '${expected}' or greater`
      break
    case `large`:
      msg = `the value '${actual}' for the argument '${name}' is too large, it needs to be at most '${expected}' or less`
      break
    default:
  }
  if (typeof qunit !== `undefined`) return msg
  CheckError(msg)
}

/**
 * Error handler for functions and classes.
 * @param {*} errorMessage Description of the error
 * @param {boolean} [log=false] Should the error be logged to the browser
 * console otherwise an exception is thrown
 */
function CheckError(errorMessage, log = false) {
  if (errorMessage !== undefined) {
    BusySpinner(false)
    if (globalThis.checkedErr !== undefined) globalThis.checkedErr = true
    if (typeof qunit === `undefined`) DisplayAlert()
    else throw new Error(errorMessage)
    if (log === true) return console.warn(errorMessage)
    try {
      throw new Error(errorMessage)
    } catch (e) {
      console.error(e)
    }
  }
}

/**
 * Creates a red coloured alert message box at the top of the active browser page.
 * @param {boolean} [show=true] Reveal or hide the box
 */
function DisplayAlert(show = true) {
  // div element containing the error alert
  let div = globalThis.document.getElementById(`displayAlert`)
  const link = globalThis.document.getElementById(`retrotxt-styles`)
  if (div === null) {
    let ext = `reloading RetroTxt on the `
    switch (WebBrowser()) {
      case Chrome:
        ext += ` Extensions page (chrome://extensions)`
        break
      case Firefox:
        ext += ` Add-ons manager page (about:addons)`
        break
    }
    const keyboard = new Map()
      .set(`console`, `J`)
      .set(`reload`, `F5`)
      .set(`ctrl`, `Control`)
      .set(`shift`, `Shift`)
    if (BrowserOS() === MacOS)
      keyboard.set(`reload`, `R`).set(`ctrl`, `⌘`).set(`shift`, `⌥`)
    if (WebBrowser() == Firefox) keyboard.set(`console`, `I`)
    // build error as a html node
    const alert = {
      div: document.createElement(`div`),
      f5: document.createElement(`kbd`),
      ctrl: document.createElement(`kbd`),
      shift: document.createElement(`kbd`),
      ikey: document.createElement(`kbd`),
      cons: document.createElement(`strong`),
      br1: document.createElement(`br`),
      br2: document.createElement(`br`),
      issue: document.createElement(`a`),
      p1: document.createElement(`p`),
      p2: document.createElement(`p`),
    }
    alert.f5.append(`${keyboard.get(`reload`)}`)
    alert.ctrl.append(keyboard.get(`ctrl`))
    alert.shift.append(keyboard.get(`shift`))
    alert.ikey.append(keyboard.get(`console`))
    alert.cons.append(`Console`)
    alert.issue.href = chrome.i18n.getMessage(`url_issues`)
    alert.issue.title = `On the RetroTxt GitHub repository`
    alert.issue.append(`see if it has an issue report`)
    alert.div.append(`Sorry, RetroTxt has run into a problem.`, alert.p1)
    alert.p1.append(`Please reload `)
    if (BrowserOS() !== MacOS) alert.p1.append(alert.f5)
    alert.p1.append(` this tab to attempt to fix the problem.`)
    alert.div.append(alert.p2)
    alert.p2.append(
      `For more information press `,
      alert.ctrl,
      alert.shift,
      alert.ikey,
      ` to open the `,
      alert.cons,
      `.`
    )
    alert.div.append(
      `If the problem continues, try ${ext}`,
      alert.br2,
      `or `,
      alert.issue,
      `.`
    )
    div = alert.div
    alert.div = null
    div.id = `displayAlert`
    const dom = new DOM()
    // add CSS link elements into the page
    if (link === null) {
      dom.head.append(CreateLink(`../css/retrotxt.css`, `retrotxt-styles`))
      dom.head.append(CreateLink(`../css/layout.css`, `retrotxt-layout`))
    }
    // inject div
    dom.body.insertBefore(div, dom.pre0)
  }
  // display error alert
  if (show === false) return div.classList.add(`is-hidden`)
  div.classList.remove(`is-hidden`)
}
/**
 * Creates an alert for unsupported page character sets.
 */
function DisplayEncodingAlert() {
  let div = globalThis.document.getElementById(`CheckEncoding`)
  if (div !== null) return (div.style.display = `block`)
  const alert = {
    br1: document.createElement(`br`),
    br2: document.createElement(`br`),
    div: document.createElement(`div`),
    code: document.createElement(`strong`),
    fix1: document.createElement(`code`),
    fix2: document.createElement(`code`),
    p1: document.createElement(`p`),
    p2: document.createElement(`p`),
  }
  const endian = () => {
    switch (document.characterSet) {
      case `UTF-16LE`:
        return `LE`
      default:
        return `BE`
    }
  }
  alert.div.append(`RetroTxt: The page encoding of this document `)
  alert.code.append(`${document.characterSet}`)
  alert.div.append(alert.code, ` is not supported by the browser.`)
  alert.code.style.color = `red`
  alert.p1.append(`To convert the document to UTF-8 in Linux or macOS: `)
  // for examples: https://www.gnu.org/software/libiconv
  alert.fix1.append(
    `iconv file.txt --from-code=UTF-16${endian()} --to-code=UTF-8 > file-fixed.txt`
  )
  alert.p2.append(`In PowerShell or Windows: `)
  alert.fix2.append(
    `Get-Content file.txt -raw | Set-Content file-fixed.txt -Encoding UTF8`
  )
  alert.p1.insertAdjacentElement(`beforeend`, alert.br1)
  alert.p1.insertAdjacentElement(`beforeend`, alert.fix1)
  alert.div.insertAdjacentElement(`beforeend`, alert.p1)
  alert.p2.insertAdjacentElement(`beforeend`, alert.br2)
  alert.p2.insertAdjacentElement(`beforeend`, alert.fix2)
  alert.div.insertAdjacentElement(`beforeend`, alert.p2)
  div = alert.div
  alert.div = null
  div.id = `CheckEncoding`
  const dom = new DOM()
  dom.body.insertBefore(div, dom.pre0)
}

/**
 * C0 controls are 1-bit, text formatting codes found in most character encodings.
 * @class C0Controls
 */
class C0Controls {
  /**
   * Creates an instance of C0Controls.
   * @param [character] UTF-16 character ie `A` or code unit value ie `65`
   */
  constructor(character) {
    this.character = null
    if (typeof character === `string`)
      // convert the first character to a UTF-16 code unit
      this.character = character.codePointAt(0)
    else if (typeof character === `number`) this.character = character
    const backspace = 8,
      horizontalTab = 9,
      linefeed = 10,
      formfeed = 12, // page break
      carriageReturn = 13,
      endOfFile = 26 // ms-dos specific
    this.specials = new Set([
      backspace,
      horizontalTab,
      linefeed,
      formfeed,
      carriageReturn,
      endOfFile,
    ])
  }
  /**
   * Is the character a C0 control code that matches HTML text formatting functionality?
   * @returns boolean
   */
  special() {
    if (typeof this.character !== `number`) return false
    return this.specials.has(this.character)
  }
}
/**
 * Standard IANA MIME names for browser character encoding.
 * @class BrowserEncodings
 */
class BrowserEncodings {
  constructor(encoding = ``) {
    this.encoding = encoding.toUpperCase()
    this.encodings = new Map()
      .set(`CP-437`, DOS_437_English)
      .set(`IBM437`, DOS_437_English)
      .set(`IBM865`, DOS_865)
      .set(`ISO-8859-1`, ISO8859_1)
      .set(`ISO-8859-5`, ISO8859_5)
      .set(`ISO-8859-10`, ISO8859_10)
      .set(`ISO-8859-15`, ISO8859_15)
      .set(`MACINTOSH`, Macintosh)
      .set(`SHIFT_JIS`, Shift_JIS)
      .set(`WINDOWS-1250`, Windows_1250)
      .set(`WINDOWS-1251`, Windows_1251)
      .set(`WINDOWS-1252`, Windows_1252_English)
      .set(`US-ASCII`, US_ASCII)
      .set(`UTF-8`, UnicodeStandard)
  }
  /**
   * Does the browser character encoding support RetroTxt?
   * @returns boolean
   */
  support() {
    const result = this.encodings.has(this.encoding)
    if (RetroTxt.developer)
      console.log(`BrowserEncodings('${this.encoding}').support() = ${result}`)
    return result
  }
  /**
   * Returns a character encoding label for use with the Characters class.
   * @returns string
   */
  label() {
    return this.encodings.get(this.encoding)
  }
  /**
   * Shortens some formal names.
   * @returns
   */
  compactEncoding() {
    return this.encoding.replace(`-`, ``).replace(`WINDOWS`, `CP`)
  }
  findLabel() {
    let foundKey = ``
    this.encodings.forEach((value, key) => {
      if (value === this.encoding.toLowerCase() && foundKey.length === 0)
        foundKey = key
    })
    return foundKey
  }
}
/**
 * Character set, code page class.
 * @class Characters
 */
class Characters extends BrowserEncodings {
  /**
   * Creates an instance of Characters.
   * @param [key=``] Either a character set label (labels) or a browser document
   * set (documentSets)
   */
  constructor(key = ``) {
    super()
    this.labels = new Map()
      // key, [formal name, informal name]
      .set(DOS_437_English, [`Code Page 437`, `MS-DOS Latin`])
      .set(DOS_865, [`Code Page 865`, `MS-DOS Nordic`])
      .set(ISO8859_1, [
        `ISO-8859 Part 1`,
        `Latin alphabet No. 1 alternatively referenced as ECMA-94`,
      ])
      .set(ISO8859_5, [`ISO-8859 Part 5`, `Latin/Cyrillic alphabet`])
      .set(ISO8859_10, [`ISO-8859 Part 10`, `Latin alphabet No. 6`])
      .set(ISO8859_15, [`ISO-8859 Part 15`, `Latin alphabet No. 9`])
      .set(Macintosh, [`Mac OS Roman`, `Macintosh (OS 9 and prior)`])
      .set(Shift_JIS, [`Shift JIS`, `Japanese text art`])
      .set(Windows_1250, [`Code Page 1250`, `Windows Latin 2 (Central Europe)`])
      .set(Windows_1251, [`Code Page 1251`, `Windows Cyrillic (Slavic)`])
      .set(Windows_1252_English, [
        `Code Page 1252`,
        `Windows Latin 1 (incorrectly called ANSI)`,
      ])
      .set(US_ASCII, [`US-ASCII`, `Alternatively referenced as ECMA-6`])
      .set(UnicodeStandard, [`UTF 8-bit`, `Unicode Transformation Format`])
    // key, `BrowserEncodings.encoding`
    this.outputs = new Map()
      .set(OutputCP1252, `CP-1252`)
      .set(OutputISO8859_1, `ISO-8859-1`)
      .set(OutputISO8859_15, `ISO-8859-15`)
      .set(OutputUS_ASCII, `US-ASCII`)
    this.key = key
    this.encoding = this.getEncoding()
    this.label = [``, ``]
    this._setLabel()
  }
  /**
   * Returns the browser character encoding of `this.key`.
   * @returns string
   */
  getEncoding() {
    super.encoding = this.key
    return super.label()
  }
  /**
   * Checks `this.key` to see if it is valid.
   * @returns boolean
   */
  support() {
    this._setLabel()
    if (this.label[0].length > 0) return true
    return false
  }
  /**
   * Checks `this.key` to see if it is a browser character encoding supported by
   * RetroTxt.
   * @returns boolean
   */
  supportedEncoding() {
    super.encoding = this.key
    return super.support()
  }
  /**
   * Returns a shortened official name of a character label.
   * @returns string
   */
  compactIn() {
    switch (this.key) {
      // display formal names for these sets
      case `MACINTOSH`: {
        this.key = Macintosh
        this._setLabel()
        return this.label[0]
      }
      case `SHIFT_JIS`: {
        this.key = Shift_JIS
        this._setLabel()
        return this.label[0]
      }
    }
    const encoding = new BrowserEncodings(this.key)
    if (encoding.support() === false) {
      const newEncoding = new BrowserEncodings(encoding.findLabel())
      return newEncoding.compactEncoding()
    }
    return encoding.compactEncoding()
  }
  /**
   * Returns a shortened formal name for transcode labels.
   * @returns string
   */
  compactOut() {
    if (this.support() === false) return `unknown`
    if (this.outputs.has(this.key)) {
      const newTranscode = this.outputs.get(this.key)
      if (typeof newTranscode === `undefined`) return `unknown`
      super.encoding = newTranscode
      return super.compactEncoding()
    }
    super.encoding = this.key
    const newKey = super.findLabel()
    super.encoding = newKey
    return super.compactEncoding()
  }
  /**
   * Returns a document character set for use with a mouse-over, element title.
   * @returns string
   */
  titleIn() {
    let title = `Document encoding determined by this browser`
    title += `\n${this._getLabel()}`
    return title
  }
  /**
   * Returns a label set for use with a mouse-over, element title.
   * @returns string
   */
  titleOut() {
    let newKey = ``
    if (this.support() === false) return `error1`
    else if (this.outputs.has(this.key)) newKey = this.outputs.get(this.key)
    else {
      super.encoding = this.key
      newKey = super.findLabel()
    }
    // create text for the title
    let title = `Page encoding output\nUnicode ≈ ${newKey}`
    title += `\n${this.label[0]} characters as Unicode`
    return title
  }
  /**
   * Returns information on the character label.
   * @returns string
   */
  _getLabel() {
    if (this.support() === false) return `?`
    const formal = this.label[0],
      informal = this.label[1]
    if (informal.length > 0) return `${formal}: ${informal}`
    return `${formal}`
  }
  /**
   * Get the formal and informal names of `this.key`
   * and save them to `this.label`.
   */
  _setLabel() {
    if (this.outputs.has(this.key)) {
      // drop the TranscodeArrow `➡` from this.key
      const newKey = this.key.slice(0, -1)
      return (this.label = this.labels.get(newKey))
    }
    if (this.labels.has(this.key)) this.label = this.labels.get(this.key)
  }
}

/**
 * Attempt to mostly inaccurately guess the text character encoding.
 * @class Guess
 */
class Guess extends BrowserEncodings {
  constructor(text = ``) {
    super()
    this.characterSets = [
      OutputISO8859_1,
      OutputISO8859_15,
      OutputCP1252,
      OutputUS_ASCII,
      OutputUFT8,
      ISO8859_5,
      Windows_1252_English,
      DOS_437_English,
    ]
    this.table_cp1252 = () => {
      // prettier-ignore
      this.set_8 = [`€`,``,`‚`,`ƒ`,`„`,`…`,`†`,`‡`,`ˆ`,`‰`,`Š`,`‹`,`Œ`,``,`Ž`,``]
      // prettier-ignore
      this.set_9 = [``,`‘`,`’`,`“`,`”`,`•`,`–`,`—`,`\u02dc`,`™`,`š`,`›`,`œ`,``,`ž`,`Ÿ`]
      return [...this.set_8, ...this.set_9]
    }
    this.text = text
  }
  /**
   * Discovers Unicode Byte Order Marks identifiers prefixing `this.text`.
   * It is not reliable as the browser can strip out markings.
   * UTF-32 BOM is not detected as the 32-bit place holders get ignored.   * @returns string
   */
  byteOrderMark() {
    // Using Byte Order Marks
    // https://msdn.microsoft.com/en-us/library/windows/desktop/dd374101%28v=vs.85%29.aspx?f=255&MSPPError=-2147217396
    const hexadecimal = 16,
      notFound = ``,
      mark = this.text.slice(0, 4),
      byte1 = mark.charCodeAt(0).toString(hexadecimal).toLowerCase(),
      byte2 = mark.charCodeAt(1).toString(hexadecimal).toLowerCase(),
      byte3 = mark.charCodeAt(2).toString(hexadecimal).toLowerCase()
    if (byte1 === `ef` && byte2 === `bb` && byte3 === `bf`) return `UTF-8`
    if (byte1 === `ff` && byte2 === `fe`) return `UTF-16, little endian`
    if (byte1 === `fe` && byte2 === `ff`) return `UTF-16, big endian`
    return notFound
  }
  /**
   * Parse a HTML element and attempt to determine the text encoding.
   * @param [sauceSet=``] Document character set supplied by SAUCE metadata
   * @param [dom={}] HTML element
   * @returns string
   */
  codePage(sauceSet = ``, dom = {}) {
    if (typeof sauceSet !== `string` && sauceSet !== null)
      CheckArguments(`sauceSet`, `string`, sauceSet)
    if (typeof dom !== `object`) CheckArguments(`dom`, `object`, dom)
    // if there was no useful SAUCE data then use the transcode setting
    if (sauceSet === ``) {
      sauceSet = sessionStorage.getItem(`transcode`)
      if (sauceSet !== null)
        console.log(`Using saved transcode setting: "${sauceSet}"`)
    }
    // user override set by the transcode context menu
    // match sauceSet arrow values such as OutputCP1252, OutputUS_ASCII
    const override = () => {
      if (typeof sauceSet !== `string`) return false
      if (sauceSet.length < 2) return false
      if (sauceSet.slice(-1) !== TranscodeArrow) return false
      return true
    }
    if (override()) return sauceSet
    // use the character set determined by the browser
    const documentSet = `${document.characterSet.toUpperCase()}`
    // force returns, based on browser tab character set
    super.encoding = documentSet
    if (super.support() === false) {
      // unknown/unsupported encodings
      // take a guess but the result will probably be inaccurate
      this.text = `${dom.slice}`
      return this._characterSet()
    }
    return documentSet
  }
  /**
   * Guess the MS-DOS era text encoding code page used by `this.text`.
   * @returns string Sourced from `this.characterSets`
   */
  _characterSet() {
    const range = (start, end) => {
      return Array.from(
        Array.from(Array(Math.ceil(end - start + 1)).keys()),
        (x) => start + x
      )
    }
    const findArt = (codePoint = -1) => {
      for (let i = 0; i < artChars.length; i++) {
        if (artChars[i] === codePoint) {
          return true
        }
      }
      return false
    }
    // maximum loop count
    const limit = 10000,
      finds = {
        cp437: 0,
        hex: ``,
        iso8859: 0,
        page: 0,
        us_ascii: 0,
        unsure: 0,
      },
      decimals = this._decimalSet(this.table_cp1252()),
      length = this.text.length
    const lightShadeBlock = 176,
      lightVerticalLeft = 180,
      doubleVerticalLeft = 185,
      doubleUpLeft = 188,
      lightDownLeft = 191,
      lightVerticalHorizontal = 197,
      doubleUpRight = 200,
      doubleVerticalHorizontal = 206,
      lightUpLeft = 217,
      upperHalfBlock = 223,
      blackSquare = 254,
      middleDot = 250,
      bulletOperator = 249
    const artChars = [
      ...range(lightShadeBlock, lightVerticalLeft),
      ...range(doubleVerticalLeft, doubleUpLeft),
      ...range(lightDownLeft, lightVerticalHorizontal),
      ...range(doubleUpRight, doubleVerticalHorizontal),
      ...range(lightUpLeft, upperHalfBlock),
      ...[bulletOperator, middleDot, blackSquare],
    ]
    let i = length
    while (i--) {
      if (i < length - limit) break
      const position = length - i || 0,
        codePoint = this.text.codePointAt(position)
      if (codePoint !== undefined) finds.hex = codePoint.toString(16) // not used
      // unsupported Unicode code point?
      const unsupported = 65535
      if (codePoint >= unsupported) {
        finds.page = 7
        break
      }
      // distinctive CP-1252 chars 128,142,158,159,130…140,145…156
      // these also double-up as C1 controls in UTF-8
      if (decimals.includes(codePoint)) {
        finds.page = 3
        break
      }
      // a hack to deal with characters decimals 993…1248 found in some ANSI art
      const invalidStart = 992,
        invalidEnd = 1249
      if (codePoint > invalidStart && codePoint < invalidEnd) {
        finds.page = 2
        break
      }
      // UTF-8 catch-all
      const utf8Start = 256
      if (codePoint >= utf8Start) {
        finds.page = 6
        break
      }
      // count the guesses of other characters
      // only catches single and double lines
      // but not single/double combination characters
      if (findArt(codePoint)) {
        finds.cp437++
        continue
      }
      // other than common C0 controls like newline if characters 1…31 are found
      // then assume it is a CP-437 document
      const special = new C0Controls(codePoint).special(),
        linefeed = 10,
        escape = 27,
        nul = 0,
        space = 32
      if (
        codePoint !== linefeed &&
        codePoint !== escape &&
        codePoint > nul &&
        codePoint < space &&
        special === false
      ) {
        finds.cp437++
        continue
      }
      // if the character is between these ranges and was not matched to CP-437,
      // then it is assumed to be either ISO-8859-1 or 15
      const iso8859 = 160
      if (codePoint >= iso8859 && codePoint < utf8Start) {
        finds.iso8859++
        continue
      }
      // anything else below 128 is certainly US-ASCII
      const usascii = 127
      if (codePoint <= usascii) {
        finds.us_ascii++
        continue
      }
      // otherwise flag the character as not sure
      finds.unsure++
      // exit scan after the encoding has been guessed
      if (finds.page > 0) break
    }
    if (finds.iso8859 > 0) finds.page = 4
    if (finds.cp437 > finds.iso8859) finds.page = 1
    return this.characterSets[finds.page]
  }
  // turns an array of character strings into an array of Unicode decimal values
  _decimalSet(set = []) {
    if (typeof set !== `object`) CheckArguments(`set`, `array`, set)
    const decimals = set
    for (const i of Object.keys(set)) {
      decimals[i] = set[i].codePointAt(0)
    }
    // filter out undefined decimals values
    return decimals.filter((decimals) => typeof decimals !== `undefined`)
  }
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
 * Hardware palette colour emulation.
 * @class HardwarePalette
 */
class HardwarePalette {
  /**
   * Creates an instance of `HardwarePalette`.
   * @param [key=``] Palette name
   */
  constructor(key = ``) {
    this.gray = `${chrome.i18n.getMessage(`Gray`)}`
    // the sort of these palettes also effect the order of the onClick events
    this.palettes = [
      `IBM`,
      `XTerm`,
      `IIgs`,
      `C-64`,
      `CGA 0`,
      `CGA 1`,
      `Workbench`,
      this.gray,
    ]
    this.filenames = [
      `vga`,
      `xterm`,
      `iigs`,
      `c64`,
      `cga_0`,
      `cga_1`,
      `workbench`,
      `gray`,
    ]
    // set initial palette to IBM VGA
    this.active = 0
    // initialise
    this.key = key
    this.filename = ``
    this.get()
  }
  /**
   * Sets a partial filename to `this.filename`
   * for use with `this.savedFilename()`
   */
  get() {
    const i = this.palettes.indexOf(this.key),
      error = ``
    if (i <= -1) return error
    this.filename = this.filenames[i]
  }
  /**
   * Returns the next sequential palette name or loops back to the first name.
   * @param [palette=``] Initial palette name
   * @returns string
   */
  next(palette = ``) {
    let i = this.palettes.indexOf(palette)
    if (i <= -1) return `` // error
    // go back to first item if title is at the end of the array
    if (i >= this.palettes.length - 1) i = 0
    else i++
    return this.palettes[i]
  }
  /**
   * Returns the palette selection that was saved by `this.set()`
   */
  saved() {
    return this.palettes[this.active]
  }
  /**
   * Returns a local file path that points to a CSS stylesheet for use in
   * a `<link>` element.
   * @param [iceColor=false] Use the iCE Color stylesheet?
   * @returns string
   */
  savedFilename(iceColor = false) {
    this.key = this.saved()
    this.get()
    if (iceColor === true) return `../css/text_colors_4bit-ice.css`
    return `../css/text_colors_${this.filename}.css`
  }
  /**
   * Saves the current palette selection and returns `true` if the save is
   * successful.
   * @returns boolean
   */
  set() {
    const i = this.palettes.indexOf(this.key)
    if (i <= -1) return false // error
    this.active = i
    return true
  }
}

/**
 * Handles the CSS font family in the DOM.
 * @class FontFamily
 */
class FontFamily {
  /**
   * Creates an instance of `FontFamily`.
   * @param [key=``] `this.fonts` key
   */
  constructor(key = ``) {
    this.fonts = new Map()
      .set(`APPLEII`, `Apple II`)
      .set(`ATARIST`, `Atari ST`)
      .set(`C64`, `PETSCII`)
      .set(`MICROKNIGHT`, `MicroKnight`)
      .set(`MICROKNIGHTPLUS`, `MicroKnight+`)
      .set(`MONA`, `Mona`)
      .set(`MOSOUL`, `mOsOul`)
      .set(`IBMPLEX`, `IBM Plex`)
      .set(`P0TNOODLE`, `P0T-NOoDLE`)
      .set(`PS24`, `PS/2 (thin 4)`)
      .set(`SPLEEN`, `Spleen`)
      .set(`TOPAZA500`, `Topaz`)
      .set(`TOPAZA1200`, `Topaz 2`)
      .set(`TOPAZPLUSA500`, `Topaz+`)
      .set(`TOPAZPLUSA1200`, `Topaz+ 2`)
      .set(`UNSCII16`, `Unscii 16`)
      .set(`UNSCII8`, `Unscii 8`)
    this.fonts.set(
      `MONOSPACE`,
      WebBrowser() === Chrome ? `Fixed-width` : `Monospace`
    )
    this.key = key.toUpperCase()
    this.family = ``
    this.set()
  }
  /**
   * Uses `this.key` to set a font family to `this.family`.
   */
  set() {
    if (this.fonts.has(this.key))
      return (this.family = this.fonts.get(this.key))
    // options also passes 'Text render' on mouseOver through here
    if ([`normal`, `shadowed`].includes(this.key.toLowerCase())) {
      this.family = this.key.toLowerCase()
      return `this.key.toLowerCase()`
    }
    // IBM specific batch edits
    const ibm = this.key
      .toUpperCase()
      .replace(`-2X`, ` (wide)`)
      .replace(`-2Y`, ` (narrow)`)
      .replace(`CGATHIN`, `CGA Thin`)
      .replace(`TANDYNEW`, `Tandy `)
    this.family = ibm
    return this.family
  }
  /**
   * Applies `this.family` to a `<pre>` element in the `dom`.
   * @param [dom={}] HTML document object model
   */
  async swap(dom = {}) {
    const replaceFont = (fontClass = ``, elm = HTMLElement) => {
      const classes = elm.className.split(` `)
      // loop through and remove any `font-*` classes
      let i = classes.length
      while (i--) {
        if (classes[i].startsWith(`font-`)) elm.classList.remove(classes[i])
      }
      return elm.classList.add(fontClass)
    }
    if (typeof dom !== `object`) CheckArguments(`dom`, `object`, dom)
    // ignore swap request if `sessionStorage` `fontOverride` is true
    const override = `${sessionStorage.getItem(`fontOverride`)}`
    if (override === `true`)
      return console.log(
        `Cannot refresh font as sessionStorage.fontOverride is set to true.`,
        `\nThis is either because the text is ANSI encoded or contains SAUCE metadata with font family information.`
      )
    // change the font
    if (typeof dom.className === `undefined`)
      return console.error(
        `could not change the font, dom className is undefined`
      )
    if (typeof dom.classList === `undefined`)
      return console.error(
        `could not change the font, dom classList is undefined`
      )
    this.set()
    const fontClass = `font-${this.key.toLowerCase()}`
    console.info(`Using font ${this.title(this.family, true)}.`)
    replaceFont(`${fontClass}`, dom)
    // update the header fontname with the new font
    const header = globalThis.document.getElementById(`fontnameInUse`)
    if (header !== null) {
      header.textContent = this.set().replaceAll(`_`, ` `)
      header.title = this.title(this.family)
      replaceFont(fontClass, header)
    }
  }
  /**
   * Font family title or mini description.
   * @param family Font family
   */
  title(family = ``, print = false) {
    const name = family.toLowerCase(),
      c = `Commodore`,
      coco = `Tandy Color Computer Model`,
      pc = `IBM PC`,
      trs80 = `Tandy TRS-80 Model`
    const font = (name) => {
      switch (name) {
        case `applemac`:
          return `Apple Macintosh`
        case `apricotportable`:
          return `Apricot Portable`
        case `apricotxenc`:
          return `Apricot Xen`
        case `antiquarius`:
          return `Mattel Antiquarius`
        case `atascii`:
        case `candyantics`:
        case `colleenantics`:
          return `Atari 8-bit`
        case `atari st`:
          return `Atari ST, high-resolution mode`
        case `atarist2min`:
          return `Atari ST, low-resolution mode`
        case `att_pc6300`:
          return `AT&T PC 6300`
        case `compaq_port3`:
          return `Compaq Portable III`
        case `compis`:
          return `Telenova Compis`
        case `hotcoco`:
          return `${coco} I`
        case `hotcoco2y`:
          return `${coco} I, double-height mode`
        case `hotcocowitht`:
          return `${coco} III`
        case `hotcocowitht2y`:
          return `${coco} III, double-height mode`
        case `ibm_conv`:
          return `IBM 5410`
        case `ibm_model30r0`:
          return `IBM PS/2 Model 30`
        case `ibm_model3x_alt1`:
        case `ibm_model3x_alt2`:
        case `ibm_model3x_alt3`:
        case `ibm_model3x_alt4`:
          return `IBM PS/2 Model 30/35 Alternative`
        case `ibm_ps-55_re`:
          return `IBM PS/55`
        case `kaypro2k_g`:
          return `Kaypro 2000 G`
        case `mda`:
          return `IBM Monochrome Display Adapter`
        case `miaraw`:
          return `${trs80} I`
        case `miiiraw`:
          return `${trs80} III`
        case `mindset`:
          return `Mindset Computer M1001`
        case `m4araw`:
          return `${trs80} 4`
        case `m4braw`:
          return `${trs80} 4 International`
        case `petme`:
          return `${c} VIC-20`
        case `c64-pro`:
        case `c64-pro-mono`:
        case `petme64`:
          return `${c} 64`
        case `pet128`:
          return `${c} 128`
        case `petme642y`:
          return `${c} 64, 80-column mode`
        case `petme1282y`:
          return `${c} 128, 80-column mode`
        case `sharpmz`:
          return `Sharp MZ`
        case `zxspectrum`:
          return `ZX Spectrum`
      }
      switch (name.slice(0, 12)) {
        case `dos-v_re_ank`:
          return `${pc} DOS/V re. Japan ANK ${Capitalize(name.slice(12))}`
        case `dos-v_re_jpn`:
          return `${pc} DOS/V re. Japan ${Capitalize(name.slice(12))}`
        case `dos-v_re_prc`:
          return `${pc} DOS/V Simplified Chinese ${Capitalize(name.slice(12))}`
      }
      switch (name.slice(0, 11)) {
        case `fixed-width`:
          return `browser monospace`
        case `microknight`:
          return `Amiga MicroKnight`
        case `paradise132`:
          return `Paradise VGA ${Capitalize(name.slice(11))}`
        case `toshibat300`:
          return `Toshiba T-300 ${Capitalize(name.slice(11))}`
      }
      switch (name.slice(0, 10)) {
        case `compaqthin`:
          return `Compaq-DOS thin ${Capitalize(name.slice(11))}`
        case `fmtowns_re`:
          return `Fujitsu FM-Towns ${Capitalize(name.slice(10))}`
        case `le_model_d`:
          return `Leading Edge Model D ${Titleize(name.slice(10))}`
        case `phoenixega`:
          return `Phoenix EGA ${Capitalize(name.slice(10))}`
        case `p0t-noodle`:
          return `Amiga P0T-NOoDLE`
        case `toshibasat`:
          return `Toshiba Satellite ${Capitalize(name.slice(11))}`
        case `toshibatxl`:
          return `Toshiba T-Series ${Capitalize(name.slice(10))}`
      }
      switch (name.slice(0, 9)) {
        case `dos-v_twn`:
          return `${pc} DOS/V Traditional Chinese ${Capitalize(name.slice(9))}`
        case `shastonhi`:
          return `Apple GS/OS, high-resolution ${name.slice(9)}`
      }
      switch (name.slice(0, 8)) {
        case `everexme`:
          return `Everex Micro Enhancer ${Capitalize(name.slice(8))}`
        case `ibmplext`:
          return `IBM Plex ${name.slice(8)}`
      }
      switch (name.slice(0, 7)) {
        case `eaglesp`:
          return `Eagles Spirit PC alternative ${Titleize(name.slice(14))}`
        case `ibm3270`:
          return `IBM 3270 ${Capitalize(name.slice(7))}`
        case `ibmplex`:
          return `IBM Plex ${name.slice(7)}`
        case `mosoul`:
          return `Amiga mOsOul`
        case `shaston`:
          return `Apple GS/OS, low-resolution ${name.slice(7)}`
        case `nix8810`:
          return `Nixforf 8810 ${name.slice(8).toUpperCase()}`
      }
      switch (name.slice(0, 6)) {
        case `dg_one`:
        case `dg_one_alt`:
          return `Data General/One`
        case `spleen`:
        case `unscii`:
          return `${Capitalize(name.slice(0, 6))} ${name.slice(7)}`
      }
      switch (name.slice(0, 5)) {
        case `epson`:
          return `Epson ${Titleize(name.slice(5))}`
        case `topaz`:
          return `Amiga Kickstart ${Capitalize(name)}`
      }
      switch (name.slice(0, 4)) {
        case `alto`:
          return `Xerox Alto ${Capitalize(name.slice(4))}`
        case `lisa`:
          return `Apple Lisa ${Capitalize(name.slice(4))}`
      }
      switch (name.slice(0, 3)) {
        case `ami`:
          return `American Megatrends Inc. ${Titleize(name.slice(4))}`
      }
      name = name.replaceAll(`_`, ` `)
      name = name.replaceAll(`1k`, ` 1000`)
      name = name.replaceAll(`2k`, ` 2000`)
      name = name.replaceAll(`-ii`, `-II`)
      name = name.replaceAll(`-i`, `-I`)
      return `${Titleize(name)}`
    }
    if (print) return font(name).trim()
    let title = `Font family used for display\n`
    title += `${font(name).trim()} font`
    return title
  }
}

/**
 * Capitalizes the first letter of a word while applying lowercasing to the others.
 * @param [word=``] Word to capitalize
 */
function Capitalize(word = ``) {
  word = word.replaceAll(`_`, ` `).toLowerCase()
  return `${word.charAt(0).toUpperCase()}${word.slice(1)}`
}

/**
 * Capitalizes the first letter of each word in a sentence.
 * It applies all-caps to known acronyms and also removes hyphens.
 * @param [word=``] Word to capitalize
 */
function Titleize(sentence = ``) {
  if (sentence === ``) return ``
  const acronyms = [
    `AI`,
    `APC`,
    `AST`,
    `ATI`,
    `BIOS`,
    `CGA`,
    `DOS`,
    `DTK`,
    `EGA`,
    `IBM`,
    `ITT`,
    `ISO`,
    `MDA`,
    `MGA`,
    `NEC`,
    `PC`,
    `PGC`,
    `PPC`,
    `PS`,
    `VGA`,
    `XGA`,
  ]
  sentence = sentence.replaceAll(`_`, ` `)
  const words = sentence.split(/[` `/-]/), // split both spaces and hyphens
    nonAlphabet = new RegExp(/[^A-Z]+/g)
  words.forEach((word, i) => {
    word = word.toUpperCase()
    words[i] = acronyms.includes(word.replace(nonAlphabet, ``))
      ? word.toUpperCase()
      : Capitalize(word)
  })
  return words.join(` `)
}

/**
 * Creates a `<link>` element to load a CSS stylesheet.
 * @param [path=``] File path to the CSS stylesheet
 * @param [id=``] Id name to apply to the `<link>` element
 * @returns html element
 */
function CreateLink(path = ``, id = ``) {
  if (typeof path !== `string`) CheckArguments(`path`, `string`, path)
  if (typeof chrome.extension === `undefined`)
    return console.error(
      `RetroTxt cannot continue as the Extension API is inaccessible.`
    )
  const link = document.createElement(`link`)
  if (id.length > 0) link.id = id
  link.href = chrome.runtime.getURL(path)
  link.type = `text/css`
  link.rel = `stylesheet`
  return link
}
/**
 * Uses CSS3 styles to emulate retro CRT monitor scanlines.
 * @param [toggle=true] Show `true` or `false` to remove scanlines
 * @param [dom={}] HTML DOM element to receive the scanline effect
 * @param [colorClass=``] Optional CSS class that overrides light or dark
 * scanlines
 */
async function ToggleScanlines(toggle = true, dom = {}, colorClass = ``) {
  const effect = StringToBool(toggle)
  if (effect === null) CheckArguments(`toggle`, `boolean`, toggle)
  if (typeof dom !== `object`) CheckArguments(`dom`, `object`, dom)
  if (dom.classList === null) return // error
  // applies scanline classes to the DOM
  const applyNewClass = (newClass) => {
    if (typeof newClass === `string`) {
      // remove existing scan lines classes
      dom.classList.remove(`scanlines-light`, `scanlines-dark`)
      if (
        newClass.endsWith(`-on-white`) ||
        [`theme-windows`, `theme-appleii`].includes(newClass)
      )
        dom.classList.add(`scanlines-light`)
      else dom.classList.add(`scanlines-dark`)
    }
  }
  // disable scanlines
  if (effect === false)
    return dom.classList.remove(`scanlines-light`, `scanlines-dark`)
  // apply colours provided by the `colorClass` parameter
  if (typeof color === `string`) return applyNewClass(colorClass)
  // apply colours fetched from the browser `localStorage` (default)
  const result = localStorage.getItem(`colorsTextPairs`)
  if (typeof result !== `string`) {
    chrome.storage.local.get([`colorsTextPairs`], (result) => {
      if (result.colorsTextPairs === undefined)
        return CheckError(
          `Could not obtain the required colorsTextPairs setting to apply the scanlines effect`,
          true
        )
      return applyNewClass(result.colorsTextPairs)
    })
  }
  return applyNewClass(result)
}
/**
 * Uses CSS3 styles to manipulate font effects.
 * @param [effect=`normal`] Font effect name to apply
 * @param [dom={}] Required HTML DOM element object to apply shadow effect to
 * @param [colorClass=``] Optional CSS colour class when we already know the new
 * colour values
 */
async function ToggleTextEffect(effect = `normal`, dom = {}, colorClass = ``) {
  if (typeof effect !== `string`) CheckArguments(`effect`, `string`, effect)
  if (typeof dom !== `object`) CheckArguments(`dom`, `object`, dom)
  if (dom.classList === null) return // error
  // this removes any pre-existing text effect class names from the element
  for (const item of dom.classList) {
    if (item.endsWith(`-shadowed`) === true) dom.classList.remove(item)
  }
  const result = localStorage.getItem(`colorsTextPairs`)
  switch (effect) {
    case `shadowed`:
      // use colours provided by the colour parameter
      if (typeof color === `string`)
        return dom.classList.add(`${colorClass}-shadowed`)
      // use colours fetched from chrome storage (default)
      if (typeof result !== `string`) {
        chrome.storage.local.get([`colorsTextPairs`], (result) => {
          if (result.colorsTextPairs === undefined)
            CheckError(
              `Could not obtain the required colorsTextPairs setting to apply the text shadow effect`,
              true
            )
          else dom.classList.add(`${result.colorsTextPairs}-shadowed`)
        })
      } else dom.classList.add(`${result}-shadowed`)
      break
    default:
      // 'normal, auto' do nothing as the text effects have been removed
      break
  }
  const textRender = document.getElementById(`renderToggle`)
  if (textRender !== null)
    textRender.textContent = `${effect.charAt(0).toUpperCase()}${effect.slice(
      1
    )}`
}
/**
 * Scans a body of text for special control codes.
 * Returns a numeric text enum-like value.
 * @param [text=``] Text to scan
 * @returns string
 */
function FindControlSequences(text = ``) {
  if (typeof text !== `string`) CheckArguments(`text`, `string`, text)
  const inRange = (a = -1, b = -1) => {
    if (a >= 48 && b >= 48 && a <= 70 && b <= 70) return true
    return false
  }
  // remove `@CLS@` BBS control that was sometimes inserted by TheDraw
  // only need the first 5 characters for testing
  const clearScreen = `@CLS@`
  let cleaned = text.trim().slice(0, 5)
  if (cleaned.startsWith(clearScreen)) cleaned = text.trim().slice(5, 10)
  const slice = cleaned.toUpperCase()
  // ECMA-48 control sequences
  // Despite the performance hit trim is needed for some ANSI art to avoid false
  // detections
  const escape = 27,
    leftSquareBracket = 91
  if (
    text.trim().charCodeAt(0) === escape &&
    text.trim().charCodeAt(1) === leftSquareBracket
  )
    return ANSIText
  // `indexOf` is the fastest form of string search
  const sequence = text.indexOf(
    `${String.fromCharCode(27)}${String.fromCharCode(91)}`
  )
  if (sequence > 0) return ANSIText
  // detect pipe codes for WWIV
  // needs to be checked before other forms of pipe-codes
  if (slice.charAt(0) === `|` && slice.charAt(1) === `#`) {
    const a = parseInt(`${slice.charAt(2)}`)
    if (a >= 0 && a <= 9) return WWIVHashText
    return PlainText
  }
  // detect pipe-codes for Renegade, Telegard and Celerity
  if (slice.charAt(0) === `|`) {
    // renegade and telegard
    const a = parseInt(`${slice.charAt(1)}${slice.charAt(2)}`, 10)
    if (a >= 0 && a <= 23) return RenegadeText
    const celerityCodes = new Set([
      `B`,
      `C`,
      `D`,
      `G`,
      `K`,
      `M`,
      `R`,
      `S`,
      `Y`,
      `W`,
    ])
    if (celerityCodes.has(slice.charAt(1))) return CelerityText
    return PlainText
  }
  // detect Telegard grave accent codes
  if (slice.charAt(0) === `\``) {
    const a = parseInt(`${slice.charAt(1)}${slice.charAt(2)}`, 10)
    if (a >= 0 && a <= 23) return TelegardText
    return PlainText
  }
  const atCode = `@`
  // detect @-codes for Wildcat & PCBoard
  if (slice.charAt(0) === atCode) {
    // match PCBoard `@Xxx` codes
    if (slice.charAt(1) === `X`) {
      // get Unicode indexes of 2nd + 3rd chars
      const a = slice.charCodeAt(2),
        b = slice.charCodeAt(3)
      // index range 48-70 equals 0-9 A-F
      if (inRange(a, b)) return PCBoardText
    }
    if (slice.charAt(3) === atCode) {
      // match wildcat `@xx@` codes
      // get Unicode indexes of 1st + 2nd chars
      const a = slice.charCodeAt(1),
        b = slice.charCodeAt(2)
      if (inRange(a, b)) return WildcatText
    }
    return PlainText
  }
  // detect heart codes for WVIV
  if (slice.charCodeAt(0) === 3) {
    const a = parseInt(`${slice.charAt(1)}`)
    if (a >= 0 && a <= 9) return WWIVHeartText
    return PlainText
  }
  // plain or unsupported text
  return PlainText
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
 * Humanises numeric values of bytes into a useful string.
 * @param [bytes=0] A numeric value of bytes
 * @param [si=1024] Decimal (filesize) `1000` or `1024` binary (RAM) conversion
 * @returns string
 */
function HumaniseFS(bytes = 0, si = 1024) {
  // Based on http://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable
  if (typeof bytes !== `number`) CheckArguments(`bytes`, `number`, bytes)
  if (typeof si !== `number`) CheckArguments(`si`, `number`, si)
  const decimal = 1000,
    binary = 1024,
    thresh = si === decimal ? decimal : binary,
    units = si === decimal ? [`kB`, `MB`] : [`KiB`, `MiB`]
  if (Math.abs(bytes) < thresh) return `${bytes}B`
  let u = -1
  do {
    bytes /= thresh
    ++u
  } while (Math.abs(bytes) >= thresh && u < units.length - 1)
  // round decimal value when the result is 10 or larger
  const result = Math.round(bytes * 10) / 10,
    value = result >= 10 ? Math.round(result) : result
  return `${value}${units[u]}`
}
/**
 * Injects text into a DOM node object to be used with `append()`.
 * This is to avoid lint errors `UNSAFE_VAR_ASSIGNMENT`
 * "Unsafe assignment to innerHTML".
 * @param [text=``] Text to scan
 * @returns element
 */
function ParseToChildren(text = ``) {
  if (typeof text !== `string`) CheckArguments(`text`, `string`, text)
  // `parseFromString()` creates a `<body>` element which we don't need,
  // so create a `<div>` container, and as a work-around return its content
  text = `<div>${text}</div>`
  const tag = new DOMParser()
    .parseFromString(text, `text/html`)
    .getElementsByTagName(`div`)
  if (tag.length === 0)
    return CheckError(
      `DOMParser.parseFromString('${text}','text/html') did not build a HTML object containing a <div> tag`
    )
  return tag[0]
}
/**
 * Removes text pair related CSS class names from the element.
 * @param {*} elm HTML element
 */
function RemoveTextPairs(elm = HTMLElement) {
  const classes = elm.className.split(` `)
  // loop through and remove any *-bg and *-fg classes
  let i = classes.length
  while (i--) {
    if (classes[i].endsWith(`-bg`)) elm.classList.remove(classes[i])
    if (classes[i].endsWith(`-fg`)) elm.classList.remove(classes[i])
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
/**
 * Display a large loading spinner on the active tab.
 * @param [display=true] Display spinner
 */
async function BusySpinner(display = true) {
  if (typeof display !== `boolean`)
    CheckArguments(`display`, `boolean`, display)
  // TODO apply a timeout timer that will look for any uncaught errors and if
  // detected, display them in the tab?
  const spin = globalThis.document.getElementById(`spinLoader`)
  switch (display) {
    case true:
      if (spin === null) {
        const div = document.createElement(`div`)
        div.id = `spinLoader`
        div.classList.add(`loader`)
        document.body.append(div)
        const stylesheet = CreateLink(
          `../css/retrotxt_loader.css`,
          `retrotxt-loader`
        )
        return document.querySelector(`head`).append(stylesheet)
      }
      return spin.classList.remove(`is-hidden`)
    case false:
      if (spin !== null) spin.classList.add(`is-hidden`)
  }
}
// error flag used by `CheckError()`
// we need to prefix `globalThis.` to the variable name when in strict mode
globalThis.checkedErr = false
// detect developer mode
if (typeof RetroTxt === `undefined`) {
  globalThis.RetroTxt = {}
  globalThis.RetroTxt.developer = false
  if (typeof chrome.management !== `undefined`) {
    chrome.management.getSelf((info) => {
      switch (info.installType) {
        case `development`:
          globalThis.RetroTxt.developer = true
          break
      }
    })
  }
}

// eslint no-undef/no-unused-vars work around
if (typeof TagBlockCharacters === `undefined`) eslintUndef
if (typeof ToggleTextEffect === `undefined`) eslintUndef
if (typeof ToggleScanlines === `undefined`) eslintUndef
if (typeof CheckArguments === `undefined`) eslintUndef
if (typeof CheckRange === `undefined`) eslintUndef
if (typeof HumaniseFS === `undefined`) eslintUndef
if (typeof Configuration === `undefined`) eslintUndef
if (typeof Contrast === `undefined`) eslintUndef
if (typeof FontFamily === `undefined`) eslintUndef
if (typeof Guess === `undefined`) eslintUndef
if (typeof HardwarePalette === `undefined`) eslintUndef
if (typeof ParseToChildren === `undefined`) eslintUndef
if (typeof DisplayEncodingAlert === `undefined`) eslintUndef
function eslintUndef() {}
