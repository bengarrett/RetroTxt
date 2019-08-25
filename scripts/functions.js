// filename: functions.js
//
// These functions are shared between all scripts including
// `scripts/eventpage.js`, `scripts/options.js` and `scripts/parse_*.js`.
// To make the code in those pages easier to read, functions listed here use the
// Global naming convention.

/*global DOM */
"use strict"

if (typeof module === `undefined`) {
  // error flag used by `CheckError()`
  // we need to prefix `window.` to the variable name when in strict mode
  window.checkedErr = false
  // detect developer mode
  if (typeof RetroTxt === `undefined`) {
    window.RetroTxt = {}
    window.RetroTxt.developer = false
    if (typeof chrome.management !== `undefined`) {
      chrome.management.getSelf(info => {
        switch (info.installType) {
          case `development`:
            window.RetroTxt.developer = true
            break
        }
      })
    }
  }
} else {
  module.exports.FindControlSequences = s => {
    return FindControlSequences(s)
  }
}

/**
 * Argument checker for functions in
 * `scripts/eventpage.js`, `scripts/options.js` and `scripts/parse_*.js`.
 * @param {string} [name=``] The argument name that failed
 * @param {string} [expected=``] The expected argument type or value
 * @param {*} actual The actual argument used
 */
function CheckArguments(name = ``, expected = ``, actual) {
  let errorMessage = ``
  switch (expected) {
    case `boolean`:
      errorMessage = `argument '${name}' should be a 'boolean' (true|false) instead of a '${typeof actual}'`
      break
    case `number`:
      errorMessage = `argument '${name}' should be a 'number' (unsigned) instead of a '${typeof actual}'`
      break
    case `string`:
      errorMessage = `argument '${name}' should be a 'string' of text instead of a '${typeof actual}'`
      break
    default:
      errorMessage = `argument '${name}' needs to be a '${expected}' instead of a '${typeof actual}'`
      break
  }
  if (typeof qunit !== `undefined`) return errorMessage
  else return CheckError(errorMessage)
}

/**
 * Out of range handler for
 * `scripts/eventpage.js`, `scripts/options.js` and `scripts/parse_*.js`.
 * @param {string} [name=``] The argument name that failed
 * @param {string} [issue=``] The type of error
 * @param {*} expected The expected value
 * @param {*} actual The actual value
 */
function CheckRange(name = ``, issue = ``, expected, actual) {
  let errorMessage = ``
  switch (issue) {
    case `length`:
      errorMessage = `the number of characters '${actual}' used for the argument '${name}' is too short, it needs to be at least '${expected}' character`
      if (expected !== `1` && expected !== 1) errorMessage += `s`
      break
    case `range`:
      errorMessage = `the value '${actual}' for the argument '${name}' is out of range, it needs to be either '${expected.join(
        `, `
      )}'`
      break
    case `small`:
      errorMessage = `the value '${actual}' for the argument '${name}' is too small, it needs to be at least '${expected}' or greater`
      break
    case `large`:
      errorMessage = `the value '${actual}' for the argument '${name}' is too large, it needs to be at most '${expected}' or less`
      break
    default:
  }
  if (typeof qunit !== `undefined`) return errorMessage
  else CheckError(errorMessage)
}

/**
 * Error handler for
 * `scripts/eventpage.js`, `scripts/options.js` and `scripts/parse_*.js`.
 * @param {*} errorMessage Description of the error
 * @param {boolean} [log=false] Should the error be logged to the browser
 * console otherwise an exception is thrown
 */
function CheckError(errorMessage, log = false) {
  if (errorMessage !== undefined) {
    BusySpinner(false)
    // if the `window.document` is not yet built, tell RetroTxt to apply
    // display='block' on the red alert message
    if (window.checkedErr !== undefined) window.checkedErr = true
    if (typeof qunit === `undefined`) DisplayAlert()
    else throw new Error(errorMessage)
    if (log === true) console.warn(errorMessage)
    else {
      try {
        throw new Error(errorMessage)
      } catch (e) {
        console.error(e)
      }
    }
  }
}

/**
 * Creates a red alert message box at the top of the active browser page.
 * @param {boolean} [show=true] Reveal or hide the box
 */
function DisplayAlert(show = true) {
  // div element containing the error alert
  let div = window.document.getElementById(`CheckError`)
  const link = window.document.getElementById(`retrotxt-styles`)
  if (div === null) {
    let ext = `reloading the RetroTxt extension on the `
    // build an URI to point to the browser extensions page
    switch (FindEngine()) {
      case `blink`:
        ext += ` Extensions page (chrome://extensions)`
        break
      case `gecko`:
        ext += ` Add-ons manager page (about:addons)`
        break
    }
    const keyboard = new Map()
      .set(`console`, `I`)
      .set(`reload`, `F5`)
      .set(`ctrl`, `Control`)
      .set(`shift`, `Shift`)
    if (FindOS() === `mac`)
      keyboard
        .set(`console`, `J`)
        .set(`reload`, `R`)
        .set(`ctrl`, `⌘`)
        .set(`shift`, `⌥`)
    // build error as a html node
    const alert = {
      div: document.createElement(`div`),
      f5: document.createElement(`kbd`),
      ctrl: document.createElement(`kbd`),
      shift: document.createElement(`kbd`),
      ikey: document.createElement(`kbd`),
      cons: document.createElement(`strong`),
      br: document.createElement(`br`),
      issue: document.createElement(`a`)
    }
    alert.f5.appendChild(document.createTextNode(`${keyboard.get(`reload`)}`))
    alert.ctrl.appendChild(document.createTextNode(keyboard.get(`ctrl`)))
    alert.shift.appendChild(document.createTextNode(keyboard.get(`shift`)))
    alert.ikey.appendChild(document.createTextNode(keyboard.get(`console`)))
    alert.cons.appendChild(document.createTextNode(`Console`))
    alert.issue.href = chrome.i18n.getMessage(`url_issues`)
    alert.issue.title = `On the RetroTxt GitHub repository`
    alert.issue.appendChild(
      document.createTextNode(`see if it has an issue report`)
    )
    alert.div.appendChild(
      document.createTextNode(
        `Sorry, RetroTxt has run into a problem. Please reload `
      )
    )
    if (FindOS() !== `mac`) alert.div.appendChild(alert.f5)
    alert.div.appendChild(
      document.createTextNode(
        ` this tab to attempt to fix the problem. For more information press `
      )
    )
    alert.div.appendChild(alert.ctrl)
    alert.div.appendChild(alert.shift)
    alert.div.appendChild(alert.ikey)
    alert.div.appendChild(document.createTextNode(` to open the `))
    alert.div.appendChild(alert.cons)
    alert.div.appendChild(document.createTextNode(`.`))
    alert.div.appendChild(alert.br)
    alert.div.appendChild(
      document.createTextNode(`If the problem continues, try ${ext} or `)
    )
    alert.div.appendChild(alert.issue)
    alert.div.appendChild(document.createTextNode(`.`))
    div = alert.div
    alert.div = null
    div.id = `CheckError`
    const dom = new DOM()
    // add CSS link elements into the page
    if (link === null) {
      dom.head.appendChild(CreateLink(`../css/retrotxt.css`, `retrotxt-styles`))
      dom.head.appendChild(CreateLink(`../css/layout.css`, `retrotxt-layout`))
    }
    // inject div
    dom.body.insertBefore(div, dom.pre0)
  }
  // display error alert
  if (show === false) div.style.display = `none`
  else div.style.display = `block`
}
/**
 * Creates an alert for unsupported page character sets.
 */
function DisplayEncodingAlert() {
  let div = window.document.getElementById(`CheckEncoding`)
  if (div === null) {
    const alert = {
      br1: document.createElement(`br`),
      br2: document.createElement(`br`),
      div: document.createElement(`div`),
      code: document.createElement(`strong`),
      fix1: document.createElement(`code`),
      fix2: document.createElement(`code`),
      p1: document.createElement(`p`),
      p2: document.createElement(`p`)
    }
    const endian = () => {
      switch (document.characterSet) {
        case `UTF-16LE`:
          return `LE`
        default:
          return `BE`
      }
    }
    alert.div.appendChild(
      document.createTextNode(`RetroTxt: The page encoding of this document `)
    )
    alert.code.appendChild(document.createTextNode(`${document.characterSet}`))
    alert.div.appendChild(alert.code)
    alert.div.appendChild(
      document.createTextNode(` is not supported by the browser.`)
    )
    alert.code.style.color = `red`
    alert.p1.appendChild(
      document.createTextNode(
        `To convert the document to UTF-8 in Linux or macOS: `
      )
    )
    // for examples:
    // https://www.gnu.org/software/libiconv/
    alert.fix1.appendChild(
      document.createTextNode(
        `iconv file.txt --from-code=UTF-16${endian()} --to-code=UTF-8 > file-fixed.txt`
      )
    )
    alert.p2.appendChild(document.createTextNode(`In PowerShell or Windows: `))
    alert.fix2.appendChild(
      document.createTextNode(
        `Get-Content file.txt -raw | Set-Content file-fixed.txt -Encoding UTF8`
      )
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
  } else div.style.display = `block`
}

/**
 * Determines a font colour to contrast against a user chosen background.
 * @class Contrast
 */
class Contrast {
  /**
   * Creates an instance of Contrast.
   * @param [color=``] CSS colour value
   * either #hex, `RGB()`, `HSL()` or a keyword value
   * @param [backgroundColor=``] Used by `brighterTest()` and is a
   * CSS colour value either #hex, `RGB()`, `HSL()` or a keyword value
   */
  constructor(color = ``, backgroundColor = ``) {
    this.color = color.toLowerCase().trim()
    this.compare = backgroundColor.toLowerCase().trim()
    this.red = -1
    this.green = -1
    this.blue = -1
  }
  /**
   * Compares color brightness and determines whether `color`
   * is brighter than `backgroundColor`.
   * @returns Boolean result of the comparison,
   * `true` means `color` is brighter,
   * `false` means `backgroundColor` is brighter
   */
  brighterTest() {
    const oldColor = this.color
    // parse `backgroundColor` to a brightness value
    this.color = this.compare
    this.compare = this.brightness()
    // parse color to a brightness value
    // and compare against `backgroundColor` brightness
    this.color = oldColor
    return this.brightness() > this.compare
  }
  /**
   * Returns the brightness value of `color`.
   * @returns A number between 0 and 255
   */
  brightness() {
    this.rgb()
    // taken from Trendy.js by Jake Kara
    // https://trendct.org/2016/01/22/how-to-choose-a-label-color-to-contrast-with-background/
    // https://github.com/trendct/Trendy.js/blob/master/Trendy.js
    return (this.red * 299 + this.green * 587 + this.blue * 114) / 1000
  }
  /**
   * Parses the `color` value and returns a 3 item array containing
   * RGB brightness values.
   * @returns Array containing RGB brightness values
   * or -1 values if `color` is invalid
   */
  rgb() {
    if (this.color.slice(0, 1) === `#`) return this.parseHex()
    if (this.color.slice(0, 4) === `rgb(`) return this.parseRGB()
    if (this.color.slice(0, 4) === `hsl(`) return this.parseHSL()
    // assume it's a keyword
    else return this.parseKeyword()
  }
  /**
   * Parses a #hex color value and returns a 3 item array containing
   * RGB brightness values.
   * @returns array containing RGB brightness values or -1 values if `color`
   * is invalid
   */
  parseHex() {
    const hex = this.color.substring(1)
    if (hex.length === 3) {
      // handle shorthand hex values i.e `#f4f` ≍ `#ff44ff`
      this.red = parseInt(`${hex.slice(0, 1)}${hex.slice(0, 1)}`, 16)
      this.green = parseInt(`${hex.slice(1, 2)}${hex.slice(1, 2)}`, 16)
      this.blue = parseInt(`${hex.slice(2, 3)}${hex.slice(2, 3)}`, 16)
    } else if (hex.length === 6) {
      // handle standard hex values
      this.red = parseInt(`${hex.slice(0, 2)}`, 16)
      this.green = parseInt(`${hex.slice(2, 4)}`, 16)
      this.blue = parseInt(`${hex.slice(4, 6)}`, 16)
    }
    return [this.red, this.green, this.blue]
  }
  /**
   * Parses a `HSL()` color value and returns a 3 item array containing
   * RGB brightness values.
   * HSL = Hue, Saturation, and Lightness.
   * There is an inconsequential inaccuracy of 1 RGB decimal value (0.39%).
   * @returns Array containing RGB brightness values
   * or -1 values if `color` is invalid
   */
  parseHSL() {
    const notations = this.color.slice(4, -1)
    const symbols = notations.split(`,`)
    const hsl = []
    // HSL color conversion algorithm from
    // https://gist.github.com/mjackson/5311256
    const hue2rgb = (h, s, l) => {
      if (l < 0) l += 1
      if (l > 1) l -= 1
      if (l < 1 / 6) return h + (s - h) * 6 * l
      if (l < 1 / 2) return s
      if (l < 2 / 3) return h + (s - h) * (2 / 3 - l) * 6
      return h
    }
    // iterate through the HSL results and replace their string values with
    // numbers the hue value supports symbols such as °, deg, rad, turn
    for (const [i, value] of symbols.entries()) {
      // handle hue and convert it to a float range between 0 -> 1
      if (i === 0) {
        // handle a hue value given as a radian
        if (value.includes(`rad`))
          // convert the radian value to degrees and then a turn
          hsl[0] = parseFloat(value, 10) * (180 / Math.PI) * 0.00278
        // handle a hue value given as a turn (1 turn = 360°)
        else if (value.includes(`turn`)) hsl[0] = parseFloat(value, 10)
        // otherwise hue is a degree value (1 degree = 0.00278 of a turn)
        else hsl[0] = parseFloat(value, 10) * 0.00278
        continue
      }
      // saturation and lightness are percentage % values
      hsl[i] = parseFloat(value, 10) / 100
    }
    const h = hsl[0]
    const s = hsl[1]
    const l = hsl[2]
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    this.red = Math.round(hue2rgb(p, q, h + 1 / 3) * 255)
    this.green = Math.round(hue2rgb(p, q, h) * 255)
    this.blue = Math.round(hue2rgb(p, q, h - 1 / 3) * 255)
    return [this.red, this.green, this.blue]
  }
  /**
   * Parses a keyword color value and returns a 3 item array containing
   * RGB brightness values.
   * @returns array containing RGB brightness values
   * or -1 values if `color` is invalid
   */
  parseKeyword() {
    // create a mock element to test that the keyword is a valid colour value
    const p = document.createElement(`p`)
    p.style.display = `none`
    p.style.color = `${this.color}`
    document.body.appendChild(p)
    const computed = window.getComputedStyle(p, null).getPropertyValue(`color`)
    // when the colour is invalid it returns black as `rgb(0, 0, 0)`
    if (computed === `rgb(0, 0, 0)`) {
      if (this.color === `black`) {
        this.color = computed
        return this.parseRGB()
      } else return this.error()
    }
    this.color = computed
    return this.parseRGB()
  }
  /**
   * Parses a `RGB()` color value and returns a 3 item array containing RGB
   * brightness values.
   * RGB = Red, Green, Blue values that when combined represent over
   * 16.7 million colours.
   * @returns Array containing RGB brightness values
   * or -1 values if `color` is invalid
   */
  parseRGB() {
    const valid = number => {
      if (number >= 0 && number <= 255) return true
      return false
    }
    // get characters from position 4 through to the second last character
    const colors = this.color.slice(4, -1)
    const rgb = colors.split(`,`)
    // sanity check
    if (rgb.length < 3 || rgb.length > 4) return this.error()
    // parse values
    this.red = parseInt(rgb[0], 10)
    this.green = parseInt(rgb[1], 10)
    this.blue = parseInt(rgb[2], 10)
    // validate values
    if (!valid(this.red)) return this.error()
    if (!valid(this.green)) return this.error()
    if (!valid(this.blue)) return this.error()
    return [this.red, this.green, this.blue]
  }
  /**
   * Used to signify a color is invalid.
   * @returns Array of three -1 values
   */
  error() {
    return [-1, -1, -1]
  }
}

/**
 * C0 control codes found in most character encodings for text formatting.
 * @class C0Controls
 */
class C0Controls {
  /**
   * Creates an instance of C0Controls.
   * @param [character] UTF-16 character i.e `A` or code unit value i.e `65`
   */
  constructor(character) {
    this.character = null
    if (typeof character === `string`)
      // convert the first character to a UTF-16 code unit
      this.character = character.codePointAt(0)
    else if (typeof character === `number`) this.character = character
    // 8 Backspace, 9 Horizontal tab, 10 Line feed (line break),
    // 12 Form feed (page break)
    // 13 Carriage return
    // 26 End of file (not a C0 control but is commonly used by MS-DOS)
    this.specials = new Set([8, 9, 10, 12, 13, 26])
  }
  /**
   * Does the character match any C0 control codes that do text formatting in
   * HTML?
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
      .set(`CP-437`, `cp_437`)
      .set(`IBM437`, `cp_437`)
      .set(`IBM865`, `cp_865`)
      .set(`ISO-8859-1`, `iso_8859_1`)
      .set(`ISO-8859-5`, `iso_8859_5`)
      .set(`ISO-8859-10`, `iso_8859_10`)
      .set(`ISO-8859-15`, `iso_8859_15`)
      .set(`MACINTOSH`, `mac_roman`)
      .set(`SHIFT_JIS`, `shift_jis`)
      .set(`WINDOWS-1250`, `cp_1250`)
      .set(`WINDOWS-1251`, `cp_1251`)
      .set(`WINDOWS-1252`, `cp_1252`)
      .set(`US-ASCII`, `us_ascii`)
      .set(`UTF-8`, `utf_8`)
  }
  /**
   * Is the browser character encoding supported by RetroTxt?
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
      .set(`cp_437`, [`Code Page 437`, `MS-DOS Latin`])
      .set(`cp_865`, [`Code Page 865`, `MS-DOS Nordic`])
      .set(`iso_8859_1`, [
        `ISO-8859 Part 1`,
        `Latin alphabet No. 1 alternatively referenced as ECMA-94`
      ])
      .set(`iso_8859_5`, [`ISO-8859 Part 5`, `Latin/Cyrillic alphabet`])
      .set(`iso_8859_10`, [`ISO-8859 Part 10`, `Latin alphabet No. 6`])
      .set(`iso_8859_15`, [`ISO-8859 Part 15`, `Latin alphabet No. 9`])
      .set(`mac_roman`, [`Mac OS Roman`, `Macintosh (OS 9 and prior)`])
      .set(`shift_jis`, [`Shift JIS`, `Japanese text art`])
      .set(`cp_1250`, [`Code Page 1250`, `Windows Latin 2 (Central Europe)`])
      .set(`cp_1251`, [`Code Page 1251`, `Windows Cyrillic (Slavic)`])
      .set(`cp_1252`, [
        `Code Page 1252`,
        `Windows Latin 1 (incorrectly called ANSI)`
      ])
      .set(`us_ascii`, [`US-ASCII`, `Alternatively referenced as ECMA-6`])
      .set(`utf_8`, [`UTF 8-bit`, `Unicode Transformation Format`])
      .set(`UTF16LE`, [``, ``])
      .set(`UTF16BE`, [``, ``])
    // key, `BrowserEncodings.encoding`
    this.outputs = new Map()
      .set(`cp_1252➡`, `CP-1252`)
      .set(`iso_8859_1➡`, `ISO-8859-1`)
      .set(`iso_8859_15➡`, `ISO-8859-15`)
      .set(`us_ascii➡`, `US-ASCII`)
    this.key = key
    this.encoding = this.getEncoding()
    this.label = [``, ``]
    this.setLabel()
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
   * Get the formal and informal names of `this.key`
   * and save them to `this.label`.
   */
  setLabel() {
    if (this.outputs.has(this.key)) {
      // drop the `➡` from this.key
      const newKey = this.key.slice(0, -1)
      this.label = this.labels.get(newKey)
    } else if (this.labels.has(this.key)) this.label = this.labels.get(this.key)
  }
  /**
   * Checks `this.key` to see if it is valid.
   * @returns boolean
   */
  support() {
    this.setLabel()
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
        this.key = `mac_roman`
        this.setLabel()
        return this.label[0]
      }
      case `SHIFT_JIS`: {
        this.key = `shift_jis`
        this.setLabel()
        return this.label[0]
      }
    }
    const encoding = new BrowserEncodings(this.key)
    if (encoding.support() === false) {
      const newEncoding = new BrowserEncodings(encoding.findLabel())
      return newEncoding.compactEncoding()
    }
    // return a shortened name
    return encoding.compactEncoding()
  }
  /**
   * Returns a shortened formal name for transcode labels.
   * @returns string
   */
  compactOut() {
    if (this.support() === false) return `unknown`
    else if (this.outputs.has(this.key)) {
      const newTranscode = this.outputs.get(this.key)
      if (typeof newTranscode === `undefined`) return `unknown`
      super.encoding = newTranscode
    } else {
      super.encoding = this.key
      const newKey = super.findLabel()
      super.encoding = newKey
    }
    return super.compactEncoding()
  }
  /**
   * Returns a document character set for use with a mouse-over, element title.
   * @returns string
   */
  titleIn() {
    let title = `Document encoding determined by this browser`
    title += `\n${this.getLabel()}`
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
  getLabel() {
    if (this.support() === false) return `?`
    const formal = this.label[0]
    const informal = this.label[1]
    if (informal.length > 0) return `${formal}: ${informal}`
    return `${formal}`
  }
}
if (typeof module !== `undefined`) module.exports.Characters = new Characters()

/**
 * Inaccurately attempt to guess the text character encoding.
 * @class Guess
 */
class Guess extends BrowserEncodings {
  constructor(text = ``) {
    super()
    this.characterSets = [
      `iso_8859_1➡`,
      `iso_8859_15➡`,
      `cp_1252➡`,
      `us_ascii➡`,
      `utf_8➡`,
      `iso_8859_5`,
      `cp_1252`,
      `cp_437`
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
   * Guess the MS-DOS era text encoding code page used by `this.text`.
   * @returns string Sourced from `this.characterSets`
   */
  characterSet() {
    // maximum loop count
    const limit = 10000
    const finds = {
      character: ``,
      codePoint: 0,
      cp437: 0,
      hex: ``,
      iso8859: 0,
      page: 0,
      position: 0,
      us_ascii: 0,
      unsure: 0
    }
    const decimals = this.decimalSet(this.table_cp1252())
    const length = this.text.length
    let i = length
    while (i--) {
      if (i < length - limit) break
      finds.position = length - i
      finds.character = this.text[finds.position]
      finds.codePoint = this.text.codePointAt(finds.position)
      if (finds.codePoint !== undefined)
        finds.hex = finds.codePoint.toString(16) // not used
      // unsupported Unicode code point?
      if (finds.codePoint >= 65535) {
        finds.page = 7
        break
      }
      // distinctive CP-1252 chars 128,142,158,159,130…140,145…156
      // these also double-up as C1 controls in UTF-8
      if (decimals.includes(finds.codePoint)) {
        finds.page = 3
        break
      }
      // a hack to deal with characters decimals 993…1248 found in some ANSI art
      if (finds.codePoint > 992 && finds.codePoint < 1249) {
        finds.page = 2
        break
      }
      // UTF-8 catch-all
      if (finds.codePoint > 255) {
        finds.page = 6
        break
      }
      // count the guesses of other characters
      // only catches single and double lines
      // but not single/double combination characters
      if (
        (finds.codePoint >= 176 && finds.codePoint <= 181) ||
        (finds.codePoint >= 185 && finds.codePoint <= 188) ||
        (finds.codePoint >= 190 && finds.codePoint <= 197) ||
        (finds.codePoint >= 200 && finds.codePoint <= 206) ||
        (finds.codePoint >= 217 && finds.codePoint <= 223) ||
        [254, 249, 250].includes(finds.codePoint)
      ) {
        finds.cp437++
        continue
      }
      // other than common C0 controls like newline if characters 1…31 are found
      // then assume it is a CP-437 document
      const special = new C0Controls(finds.codePoint).special()
      if (
        finds.codePoint !== 10 &&
        finds.codePoint !== 27 &&
        finds.codePoint > 0 &&
        finds.codePoint < 32 &&
        special === false
      ) {
        finds.cp437++
        continue
      }
      // if the character is between these ranges that was not matched as CP-437
      // then it is assumed to be either ISO-8859-1 or 15
      if (finds.codePoint >= 160 && finds.codePoint <= 255) {
        finds.iso8859++
        continue
      }
      // anything else below 128 is certainly US-ASCII
      if (finds.codePoint <= 127) {
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
  /**
   * Discovers Unicode Byte Order Marks identifiers prefixing `this.text`.
   * This is not reliable as the browser can strip out markings.
   * Using Byte Order Marks https://msdn.microsoft.com/en-us/library/windows/desktop/dd374101%28v=vs.85%29.aspx?f=255&MSPPError=-2147217396
   * @returns string
   */
  byteOrderMark() {
    // find the first 4 characters of the string
    // and convert them into hexadecimal values
    const mark = this.text.slice(0, 4)
    const byte1 = mark
      .charCodeAt(0)
      .toString(16)
      .toLowerCase()
    const byte2 = mark
      .charCodeAt(1)
      .toString(16)
      .toLowerCase()
    const byte3 = mark
      .charCodeAt(2)
      .toString(16)
      .toLowerCase()
    if (byte1 === `ef` && byte2 === `bb` && byte3 === `bf`) return `UTF-8`
    if (byte1 === `ff` && byte2 === `fe`) return `UTF-16, little endian`
    if (byte1 === `fe` && byte2 === `ff`) return `UTF-16, big endian`
    // UTF-32 BOM cannot be detected as the 32 bit placeholders get ignored
    return ``
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
    // match sauceSet arrow values such as `cp_1252➡` `us_ascii➡`
    if (
      typeof sauceSet === `string` &&
      sauceSet.length > 1 &&
      sauceSet.slice(-1) === `➡`
    ) {
      console.log(`Transcode = ${sauceSet}`)
      return sauceSet
    }
    // use the character set determined by the browser
    const documentSet = `${document.characterSet.toUpperCase()}`
    // force returns based on browser tab character set
    super.encoding = documentSet
    if (super.support() === false) {
      // unknown/unsupported encodings
      // so take a guess but the result will probably be inaccurate
      this.text = `${dom.slice}`
      return this.characterSet()
    }
    return documentSet
  }
  // turns an array of character strings into an array of Unicode decimal values
  decimalSet(set = []) {
    if (typeof set !== `object`) CheckArguments(`set`, `array`, set)
    const decimals = set
    for (const i in set) {
      decimals[i] = set[i].codePointAt(0)
    }
    // filter out undefined decimals values
    return decimals.filter(decimals => typeof decimals !== `undefined`)
  }
}

/**
 * Options values when first initialised or reset.
 * This needs to be in `scripts/functions.js` so it can be shared
 * with `scripts/eventpage.js` and content pages.
 * @class OptionsReset
 */
class OptionsReset {
  constructor() {
    let lineHeight = `normal`,
      smearBlocks = false
    if (FindEngine() === `gecko`) lineHeight = `100%`
    if (FindOS() === `win`) smearBlocks = true
    this.options = new Map()
      // boolean options for checkboxes
      .set(`textSmearBlocks`, smearBlocks)
      .set(`textBgScanlines`, false)
      .set(`textDosCtrlCodes`, false)
      .set(`textAnsiWrap80c`, true)
      .set(`textAnsiIceColors`, true)
      .set(`textBlinkAnimation`, true)
      .set(`textEffect`, `normal`)
      .set(`textCenterAlignment`, true)
      .set(`textFontInformation`, true)
      .set(`runWebUrls`, true)
      .set(`updatedNotice`, true)
      // 1-bit colour, font & line height
      .set(`retroColor`, `msdos`)
      .set(`retroFont`, `vga8`)
      .set(`lineHeight`, `${lineHeight}`)
      // custom colours
      .set(`customForeground`, `#dcdccc`)
      .set(`customBackground`, `#3f3f3f`)
      // options tab selection
      .set(`optionTab`, `1`)
      // permitted domains, these must also be listed as `hosts` in the
      // `manifest.json` under the `optional_permissions` key.
      .set(`runWebUrlsPermitted`, [
        `16colo.rs`,
        `defacto2.net`,
        `gutenberg.org`,
        `scene.org`,
        `textfiles.com`,
        `uncreativelabs.net`
      ])
      // permitted URI schemes, these must also be listed as `hosts` in the
      // `manifest.json` under the `optional_permissions` key.
      .set(`schemesPermitted`, [`file`, `http`, `https`])
  }
  /**
   * Get an option's reset value.
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
      // file extensions that trigger RetroTxt when a `file:///` URI is used
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
        `txt`
      ])
      // list of domains that RetroTxt will run in the background
      .set(`domains`, super.get(`runWebUrlsPermitted`))
    this.errors = new Map()
      // file extensions to always ignore when a `file:///` URI is used
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
        `xbm`
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
        `wave`
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
   * CSS page width.
   * @returns string
   */
  columns() {
    return this.textRender.get(`columns`)
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
   * An array of domains that RetroTxt can monitor.
   * @returns array
   */
  domainsArray() {
    return this.triggers.get(`domains`)
  }
  /**
   * An array of filename extensions that RetroTxt always ignores.
   * @returns array
   */
  fileExtsError() {
    return [
      ...this.errors.get(`code`),
      ...this.errors.get(`fonts`),
      ...this.errors.get(`images`),
      ...this.errors.get(`media`),
      ...this.errors.get(`others`)
    ]
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
    return this.triggers.get(`extensions`).includes(ext)
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
    return !this.fileExtsError().includes(ext)
  }
  /**
   * Copies a `chrome.storage.local` item to the browser `localStorage` item
   * @param [key=``] Storage item name
   */
  setLocalStorage(key = ``) {
    if (this.options.has(key) === false) {
      return CheckError(
        `The storage key ${key} is not a known chrome.storage.local item`
      )
    }
    // get saved item from browser storage
    chrome.storage.local.get([`${key}`], result => {
      const value = result[`${key}`]
      if (StringToBool(value) === null) {
        return CheckError(
          `Could not obtain the requested chrome.storage ${key} setting`
        )
      }
      localStorage.setItem(`${key}`, value)
    })
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
      this.gray
    ]
    this.filenames = [`vga`, `xterm`, `iigs`, `c64`, `cga_0`, `cga_1`, `gray`]
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
    const i = this.palettes.indexOf(this.key)
    if (i <= -1) return `` // error
    this.filename = this.filenames[i]
  }
  /**
   * Returns the next sequential palette name.
   * If the last name is supplied i.e `Gray`,
   * then the first name will be returned i.e `IBM`.
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
      .set(`TOPAZA500`, `Topaz`)
      .set(`TOPAZA1200`, `Topaz 2`)
      .set(`TOPAZPLUSA500`, `Topaz+`)
      .set(`TOPAZPLUSA1200`, `Topaz+ 2`)
      .set(`UNSCII16`, `Unscii 16`)
      .set(`UNSCII8`, `Unscii 8`)
    if (FindEngine() === `blink`) this.fonts.set(`MONOSPACE`, `Fixed-width`)
    else this.fonts.set(`MONOSPACE`, `Monospace`)
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
    if (typeof dom !== `object`) CheckArguments(`dom`, `object`, dom)
    // ignore swap request if `sessionStorage` `fontOverride` is true
    const override = `${sessionStorage.getItem(`fontOverride`)}`
    if (override === `true`)
      return console.log(
        `Cannot refresh font as sessionStorage.fontOverride is set to true.`,
        `\nThis is either because the text is ANSI encoded or contains SAUCE metadata with font family information.`
      )
    // change the font
    if (typeof dom.className === `undefined`) return // error
    if (typeof dom.classList === `undefined`) return // error
    this.set()
    const classes = dom.className.split(` `)
    console.info(`Using font ${this.family}.`)
    // loop through and remove any `font-*` classes
    let i = classes.length
    while (i--) {
      if (classes[i].startsWith(`font-`)) dom.classList.remove(classes[i])
    }
    // inject a replacement font
    dom.classList.add(`font-${this.key.toLowerCase()}`)
    // update the header with new font information
    const header = window.document.getElementById(`h-doc-font-family`)
    if (header !== null) header.textContent = this.set()
  }
}

/**
 * Creates a `<link>` element for use in the `<head>` to load a CSS stylesheet.
 * @param [path=``] File path to the CSS stylesheet
 * @param [id=``] Id name to apply to the `<link>` element
 * @returns html element
 */
function CreateLink(path = ``, id = ``) {
  if (typeof path !== `string`) CheckArguments(`path`, `string`, path)
  if (typeof chrome.extension === `undefined`)
    return console.error(
      `RetroTxt cannot continue as the WebExtension API is inaccessible.`
    )
  const link = document.createElement(`link`)
  if (id.length > 0) link.id = id
  link.href = chrome.extension.getURL(path)
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
  const applyNewClass = newClass => {
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
  const result = localStorage.getItem(`retroColor`)
  if (typeof result !== `string`) {
    chrome.storage.local.get([`retroColor`], result => {
      if (result.retroColor === undefined)
        return CheckError(
          `Could not obtain the required retroColor setting to apply the scanlines effect`,
          true
        )
      else return applyNewClass(result.retroColor)
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
    // TODO: Jul-2019: This can be removed in a future update
    if (item === `text-smeared`) dom.classList.remove(item)
  }
  switch (effect) {
    case `shadowed`:
      // use colours provided by the colour parameter
      if (typeof color === `string`) dom.classList.add(`${colorClass}-shadowed`)
      // use colours fetched from chrome storage (default)
      else {
        const result = localStorage.getItem(`retroColor`)
        if (typeof result !== `string`) {
          chrome.storage.local.get([`retroColor`], result => {
            if (result.retroColor === undefined)
              CheckError(
                `Could not obtain the required retroColor setting to apply the text shadow effect`,
                true
              )
            else dom.classList.add(`${result.retroColor}-shadowed`)
          })
        } else dom.classList.add(`${result}-shadowed`)
      }
      break
    default:
      // 'normal, auto' do nothing as the text effects have been removed
      break
  }
  const textRender = document.getElementById(`h-text-rend`)
  if (textRender !== null)
    textRender.textContent = `${effect.charAt(0).toUpperCase()}${effect.slice(
      1
    )}`
}
/**
 * Scans a body of text for special control codes.
 * Returns either `ecma48`, `pcboard`, `plain` or `wildcat`.
 * @param [text=``] Text to scan
 * @returns string
 */
function FindControlSequences(text = ``) {
  if (typeof text !== `string`) CheckArguments(`text`, `string`, text)
  // remove `@CLS@` BBS control that was sometimes inserted by TheDraw
  // only need the first 5 characters for testing
  let cleaned = ``
  if (text.startsWith(`@CLS@`)) cleaned = text.trim().slice(5, 10)
  else cleaned = text.trim().slice(0, 5)
  const slice = cleaned.toUpperCase()
  // ECMA-48 control sequences
  // Despite the performance hit trim is needed for some ANSI art to avoid false
  // detections
  if (text.trim().charCodeAt(0) === 27 && text.trim().charCodeAt(1) === 91)
    return `ecma48`
  // `indexOf` is the fastest form of string search
  const sequence = text.indexOf(
    `${String.fromCharCode(27)}${String.fromCharCode(91)}`
  )
  if (sequence > 0) return `ecma48`
  // detect pipe codes for WWIV
  // needs to be checked before other forms of pipe-codes
  else if (slice.charAt(0) === `|` && slice.charAt(1) === `#`) {
    const a = parseInt(`${slice.charAt(2)}`)
    if (a >= 0 && a <= 9) return `wwivhash`
  }
  // detect pipe-codes for Renegade, Telegard and Celerity
  else if (slice.charAt(0) === `|`) {
    // renegade and telegard
    const a = parseInt(`${slice.charAt(1)}${slice.charAt(2)}`, 10)
    if (a >= 0 && a <= 23) return `renegade`
    // celerity
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
      `W`
    ])
    if (celerityCodes.has(slice.charAt(1))) return `celerity`
  }
  // detect Telegard grave accent codes
  else if (slice.charAt(0) === `\``) {
    const a = parseInt(`${slice.charAt(1)}${slice.charAt(2)}`, 10)
    if (a >= 0 && a <= 23) return `telegard`
  }
  // detect @-codes for Wildcat & PCBoard
  else if (slice.charAt(0) === `@`) {
    // match PCBoard `@Xxx` codes
    if (slice.charAt(1) === `X`) {
      // get Unicode indexes of 2nd + 3rd chars
      const a = slice.charCodeAt(2)
      const b = slice.charCodeAt(3)
      // index range 48-70 equals 0-9 A-F
      if (a >= 48 && b >= 48 && a <= 70 && b <= 70) return `pcboard`
    } else if (slice.charAt(3) === `@`) {
      // match wildcat `@xx@` codes
      // get Unicode indexes of 1st + 2nd chars
      const a = slice.charCodeAt(1)
      const b = slice.charCodeAt(2)
      if (a >= 48 && b >= 48 && a <= 70 && b <= 70) return `wildcat`
    }
  }
  // detect heart codes for WVIV
  else if (slice.charCodeAt(0) === 3) {
    const a = parseInt(`${slice.charAt(1)}`)
    if (a >= 0 && a <= 9) return `wwivheart`
  }
  // plain or unsupported text
  return `plain`
}
/**
 * Determines if Chrome/Chromium is running in dark mode.
 * @returns boolean
 */
function FindDarkScheme() {
  if (FindEngine() !== `blink`) return false
  const match = window.matchMedia(`(prefers-color-scheme: dark)`).matches
  switch (match) {
    case true:
      return true
    default:
      return false
  }
}
/**
 * Determines the browser render engine.
 * Returns either `blink` for Chrome, Chromium, Brave and Microsoft Edge
 * or `gecko` for Firefox.
 * @returns string
 */
function FindEngine() {
  if (
    chrome.runtime.getManifest().options_ui !== undefined &&
    chrome.runtime.getManifest().options_ui.page !== undefined
  ) {
    const manifest = chrome.runtime.getManifest().options_ui.page
    const gecko = manifest.startsWith(`moz-extension`, 0)
    if (gecko === true) return `gecko`
    return `blink`
  }
}
/**
 * Determines the browser host operating system.
 * Returns either `win` for Windows, `mac` for macOS or `linux` for other
 * systems.
 * @returns string
 */
function FindOS() {
  const os = window.navigator.platform.slice(0, 3).toLowerCase()
  switch (os) {
    case `win`:
    case `mac`:
      return `${os}`
    default:
      return `linux`
  }
}
/**
 * Takes a camelCaseString and returns a normalised string.
 *
 * @param [string=``] Camel case string
 * @param [capitalise=false] Capitalise the first letter?
 * @returns string
 */
function HumaniseCamelCase(string = ``, capitalise = false) {
  const humanise = string
    .split(/(?=[A-Z])/)
    .join(` `)
    .toLowerCase()
  if (capitalise)
    return `${humanise.charAt(0).toUpperCase()}${humanise.slice(1)}`
  return humanise
}
/**
 * Humanises numeric values of bytes into a useful string.
 * Based on http://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable
 * @param [bytes=0] A numeric value of bytes
 * @param [si=1024] Decimal (filesize) `1000` or `1024` binary (RAM) conversion
 * @returns string
 */
function HumaniseFS(bytes = 0, si = 1024) {
  if (typeof bytes !== `number`) CheckArguments(`bytes`, `number`, bytes)
  if (typeof si !== `number`) CheckArguments(`si`, `number`, si)
  // conditional (ternary) operators
  // [statement] ? true : false
  const thresh = si === 1000 ? 1000 : 1024
  const units = si === 1000 ? [`kB`, `MB`] : [`KiB`, `MiB`]
  if (Math.abs(bytes) < thresh) return `${bytes}B`
  let u = -1
  do {
    bytes /= thresh
    ++u
  } while (Math.abs(bytes) >= thresh && u < units.length - 1)
  return `${Math.round(bytes * 10) / 10}${units[u]}`
}
/**
 * Injects text into a DOM node object to be used with `appendChild()`.
 * This is to avoid lint errors `UNSAFE_VAR_ASSIGNMENT`
 * "Unsafe assignment to innerHTML".
 * @param [text=``] Text to scan
 * @returns element
 */
function ParseToChildren(text = ``) {
  if (typeof text !== `string`) CheckArguments(`text`, `string`, text)
  // `parseFromString()` creates a `<body>` element which we don't need,
  // so create a `<div>` container and as a work-around return its content
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
 * Takes a string and converts it to a primitive boolean value,
 * or returns null if string is not a boolean representation.
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
  const spinner = window.document.getElementById(`spin-loader`)
  switch (display) {
    case true:
      if (spinner === null) {
        const spinner = document.createElement(`div`)
        spinner.setAttribute(`id`, `spin-loader`)
        spinner.setAttribute(`class`, `loader`)
        spinner.setAttribute(`style`, `border: 100px solid red`)
        spinner.setAttribute(`style`, `display: block`)
        document.body.appendChild(spinner)
        const stylesheet = CreateLink(
          `../css/retrotxt_loader.css`,
          `retrotxt-loader`
        )
        document.querySelector(`head`).appendChild(stylesheet)
      } else spinner.setAttribute(`style`, `display: block`)
      break
    case false:
      if (spinner !== null) spinner.setAttribute(`style`, `display: none`)
      break
  }
}

// eslint no-undef/no-unused-vars work around
if (typeof TagBlockCharacters === `undefined`) eslintUndef
if (typeof ToggleTextEffect === `undefined`) eslintUndef
if (typeof ToggleScanlines === `undefined`) eslintUndef
if (typeof CheckArguments === `undefined`) eslintUndef
if (typeof CheckRange === `undefined`) eslintUndef
if (typeof HumaniseCamelCase === `undefined`) eslintUndef
if (typeof HumaniseFS === `undefined`) eslintUndef
if (typeof Configuration === `undefined`) eslintUndef
if (typeof Contrast === `undefined`) eslintUndef
if (typeof FontFamily === `undefined`) eslintUndef
if (typeof Guess === `undefined`) eslintUndef
if (typeof HardwarePalette === `undefined`) eslintUndef
if (typeof ParseToChildren === `undefined`) eslintUndef
if (typeof DisplayEncodingAlert === `undefined`) eslintUndef
if (typeof FindDarkScheme === `undefined`) eslintUndef
function eslintUndef() {}
