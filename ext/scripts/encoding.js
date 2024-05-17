// File: scripts/encoding.js
//
// Character sets, browser encodings, code page handlers.
// Also font selection and palette colour hardware emulation.

/**
 * Capitalizes the first letter of a word while applying lowercasing to the others.
 * @param [word=``] Word to capitalize
 */
function Capitalize(word = ``) {
  const words = word.replaceAll(`_`, ` `).toLowerCase()
  return `${words.charAt(0).toUpperCase()}${words.slice(1)}`
}

/**
 * Capitalizes the first letter of each word in a sentence.
 * It applies all-caps to known acronyms and also removes hyphens.
 * @param [word=``] Word to capitalize
 */
function Titleize(sentences = ``) {
  if (sentences === ``) return ``
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
  Object.freeze(acronyms)
  const sentence = sentences.replaceAll(`_`, ` `)
  const words = sentence.split(/[` `/-]/), // split both spaces and hyphens
    nonAlphabet = new RegExp(/[^A-Z]+/g)
  words.forEach((w, i) => {
    const word = w.toUpperCase()
    words[i] = acronyms.includes(word.replace(nonAlphabet, ``))
      ? word.toUpperCase()
      : Capitalize(word)
  })
  return words.join(` `)
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
    Object.freeze(this.specials)
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
      .set(`CP-437`, Cs.DOS_437_English)
      .set(`IBM437`, Cs.DOS_437_English)
      .set(`IBM865`, Cs.DOS_865)
      .set(`ISO-8859-1`, Cs.ISO8859_1)
      .set(`ISO-8859-5`, Cs.ISO8859_5)
      .set(`ISO-8859-10`, Cs.ISO8859_10)
      .set(`ISO-8859-15`, Cs.ISO8859_15)
      .set(`MACINTOSH`, Cs.Macintosh)
      .set(`SHIFT_JIS`, Cs.Shift_JIS)
      .set(`WINDOWS-1250`, Cs.Windows_1250)
      .set(`WINDOWS-1251`, Cs.Windows_1251)
      .set(`WINDOWS-1252`, Cs.Windows_1252_English)
      .set(`US-ASCII`, Cs.US_ASCII)
      .set(`UTF-8`, Cs.UnicodeStandard)
    Object.freeze(this.encodings)
  }
  /**
   * Does the browser character encoding support RetroTxt?
   * @returns boolean
   */
  support() {
    const result = this.encodings.has(this.encoding)
    Console(`Check browser encoding support: ${this.encoding}, ${result}.`)
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
// eslint-disable-next-line no-unused-vars
class Characters extends BrowserEncodings {
  /**
   * Creates an instance of Characters.
   * @param [key=``] Either a character set label (labels) or a browser document
   * set (documentSets)
   */
  constructor(key = ``) {
    super()
    this.labels = new Map()
      // key, [formal, informal names]
      .set(Cs.DOS_437_English, [`Code Page 437`, `MS-DOS Latin`])
      .set(Cs.DOS_865, [`Code Page 865`, `MS-DOS Nordic`])
      .set(Cs.ISO8859_1, [
        `ISO-8859 Part 1`,
        `Latin alphabet No. 1 alternatively referenced as ECMA-94`,
      ])
      .set(Cs.ISO8859_5, [`ISO-8859 Part 5`, `Latin/Cyrillic alphabet`])
      .set(Cs.ISO8859_10, [`ISO-8859 Part 10`, `Latin alphabet No. 6`])
      .set(Cs.ISO8859_15, [`ISO-8859 Part 15`, `Latin alphabet No. 9`])
      .set(Cs.Macintosh, [`Mac OS Roman`, `Macintosh (OS 9 and prior)`])
      .set(Cs.Shift_JIS, [`Shift JIS`, `Japanese text art`])
      .set(Cs.Windows_1250, [
        `Code Page 1250`,
        `Windows Latin 2 (Central Europe)`,
      ])
      .set(Cs.Windows_1251, [`Code Page 1251`, `Windows Cyrillic (Slavic)`])
      .set(Cs.Windows_1252_English, [
        `Code Page 1252`,
        `Windows Latin 1 (incorrectly called ANSI)`,
      ])
      .set(Cs.US_ASCII, [`US-ASCII`, `Alternatively referenced as ECMA-6`])
      .set(Cs.UnicodeStandard, [`UTF 8-bit`, `Unicode Transformation Format`])
    Object.freeze(this.labels)
    // key, `BrowserEncodings.encoding`
    this.outputs = new Map()
      .set(Cs.OutputCP1252, `CP-1252`)
      .set(Cs.OutputISO8859_1, `ISO-8859-1`)
      .set(Cs.OutputISO8859_15, `ISO-8859-15`)
      .set(Cs.OutputUS_ASCII, `US-ASCII`)
    Object.freeze(this.outputs)
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
        this.key = Cs.Macintosh
        this._setLabel()
        return this.label[0]
      }
      case `SHIFT_JIS`: {
        this.key = Cs.Shift_JIS
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
    let newKey
    if (this.support() === false) return `error1`
    if (this.outputs.has(this.key)) newKey = this.outputs.get(this.key)
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
      // drop the Cs.TranscodeToggle `➡` from this.key
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
// eslint-disable-next-line no-unused-vars
class Guess extends BrowserEncodings {
  constructor(text = ``) {
    super()
    // note: All these character sets need _characterSet().
    this.characterSets = [
      Cs.OutputISO8859_1,
      Cs.OutputISO8859_15,
      Cs.OutputCP1252,
      Cs.OutputUS_ASCII,
      Cs.OutputUFT8,
      Cs.ISO8859_5,
      Cs.Windows_1252_English,
      Cs.DOS_437_English,
    ]
    Object.freeze(this.characterSets)
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
    const notFound = ``,
      mark = this.text.slice(0, 4),
      radix = 16,
      byte1 = mark.charCodeAt(0).toString(radix).toLowerCase(),
      byte2 = mark.charCodeAt(1).toString(radix).toLowerCase(),
      byte3 = mark.charCodeAt(2).toString(radix).toLowerCase()
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
  codePage(charSet = ``, dom = {}) {
    if (typeof charSet !== `string` && charSet !== null)
      CheckArguments(`charSet`, `string`, charSet)
    if (typeof dom !== `object`) CheckArguments(`dom`, `object`, dom)
    // if there was no useful SAUCE data then use the transcode setting
    let sauceSet = charSet
    if (charSet === ``) {
      sauceSet = sessionStorage.getItem(`lockTranscode`)
      if (sauceSet !== null)
        console.log(`Using saved lock-transcode setting: "${sauceSet}"`)
    }
    // user override set by the transcode context menu
    // match sauceSet arrow values such as Cs.OutputCP1252, Cs.OutputUS_ASCII
    const override = () => {
      if (typeof sauceSet !== `string`) return false
      if (sauceSet.length < 2) return false
      if (sauceSet.slice(-1) !== Cs.TranscodeToggle) return false
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
        (x) => start + x,
      )
    }
    const findArt = (codePoint = -1) => {
      for (let i = 0; i < artChars.length; i++) {
        if (artChars[i] === codePoint) return true
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
    Object.freeze(artChars)
    const radix = 16
    let i = length
    while (i--) {
      if (i < length - limit) break
      const position = length - i || 0,
        codePoint = this.text.codePointAt(position)
      if (typeof codePoint !== `undefined`)
        finds.hex = codePoint.toString(radix) // not used
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
 * Hardware palette colour emulation.
 * @class HardwarePalette
 */
// eslint-disable-next-line no-unused-vars
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
    Object.freeze(this.palettes)
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
    Object.freeze(this.filenames)
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
// eslint-disable-next-line no-unused-vars
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
      WebBrowser() === Engine.chrome ? `Fixed-width` : `Monospace`,
    )
    Object.freeze(this.fonts)
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
    const lockFont = `${sessionStorage.getItem(`lockFont`)}`
    if (lockFont === `true`)
      return console.log(
        `Cannot refresh font as lock-font is set to true.`,
        `\nThis is either because the text is ANSI encoded or contains SAUCE metadata with font family information.`,
      )
    this._swap(dom)
  }
  _swap(dom = {}) {
    const replaceFont = (fontClass = ``, elm = HTMLElement) => {
      const classes = elm.className.split(` `)
      // loop through and remove any `font-*` classes
      let i = classes.length
      while (i--) {
        if (classes[i].startsWith(`font-`)) elm.classList.remove(classes[i])
      }
      return elm.classList.add(fontClass)
    }
    // change the font
    if (typeof dom.className === `undefined`)
      return console.error(
        `could not change the font, dom className is undefined`,
      )
    if (typeof dom.classList === `undefined`)
      return console.error(
        `could not change the font, dom classList is undefined`,
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
        case `acornbbc`:
          return `Acorn BBC`
        case `amstradcpc`:
          return `Amstrad CPC`
        case `amstradpcw`:
          return `Amstrad PCW`
        case `msxscreen0`:
        case `msxscreen1`:
          return `MSX`
        case `ti994a`:
          return `Texas Instruments`
        case `sinclairql`:
          return `Sinclair QL`
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
      let fixed = name.replaceAll(`_`, ` `)
      fixed = fixed.replaceAll(`1k`, ` 1000`)
      fixed = fixed.replaceAll(`2k`, ` 2000`)
      fixed = fixed.replaceAll(`-ii`, `-II`)
      fixed = fixed.replaceAll(`-i`, `-I`)
      return `${Titleize(fixed)}`
    }
    if (print) return font(name).trim()
    let title = `Font family used for display\n`
    title += `${font(name).trim()} font`
    return title
  }
}

/* global CheckArguments Console Cs Engine WebBrowser */
