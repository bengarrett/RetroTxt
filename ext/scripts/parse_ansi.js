// File: scripts/parse_ansi.js
//
// Handle ANSI and ECMA-48 control codes embedded into text.

const resetCursor = Symbol(`reset cursor position`),
  resetECMA = Symbol(`reset ECMA48/ANSI`),
  resetSGR = Symbol(`reset SGR control`)

/**
 * The entry point for ANSI and ECMA-48 control sequence interpretation.
 * This receives control sequence embedded Unicode text and outputs it to HTML5
 * elements.
 * @class ANSI
 */
// eslint-disable-next-line no-unused-vars
class Controls {
  /**
   * Creates an instance of Controls.
   * @param [text=``] String of Unicode text to parse
   * @param [sauce={ version: `` }] SAUCE metadata
   */
  constructor(text = ``, sauce = { version: `` }, verbose = false) {
    this.text = text
    this.sauce = sauce
    this.verbose = verbose
    // The priority of configurations
    // 1. SAUCE, 2. ANSI SGR, 3. hard-coded defaults
    this.colorDepth = ecma48.colorDepth
    this.columns = cursor.maxColumns
    this.font = ``
    this.iceColors = null
    this.rows = 0
    this.lineWrap = sgrObject.lineWrap
    this.htmlString = ``
    this.otherCodesCount = 0
    this.unknownCount = 0
    // reset data containers
    reset(resetECMA)
  }
  /**
   * Parses a string of Unicode text for control functions that are used for
   * cursor positioning and colouring. The controls are converted into HTML5
   * syntax with CSS dependencies for display in a web browser.
   *
   * The number of supported ECMA-48 control functions are based on the
   * limited implementation ANSI.SYS driver for Microsoft MS-DOS. There are also
   * a number of proprietary functions specific to ANSI.SYS.
   */
  parse() {
    if (typeof this.text !== `string`)
      CheckArguments(`Controls.parse(text='')`, `string`, this.text)
    // SAUCE metadata
    const sauce = new Metadata(this.sauce)
    sauce.parse()
    // Clean up string before converting it to decimal values
    this.text = this._hideEntities()
    this.text = this._cleanSequences()
    // Parse sequences and insert the generated HTML into the DOM object
    const markup = new Markup()
    // Convert text into Unicode decimal encoded numbers
    markup.sequences = new Build(`${this.text}`).arrayOfText()
    markup.lineWrap = this.lineWrap
    markup.build()
    // Pass-on these ANSI/ECMA48 statistics and toggles
    this.otherCodesCount = ecma48.other
    this.rows = cursor.row
    this.unknownCount = ecma48.unknown
    // Pass-on these ANSI/ECMA48 toggles
    this.colorDepth = ecma48.colorDepth
    this.columns = cursor.maxColumns
    this.font = sauce.font
    if (this.font.length === 0) this.font = this._parseFont(ecma48.font)
    this.iceColors = ecma48.iceColors
    // Pass-on these HTML elements combined as a string
    this.htmlString = domObject.html
    // empty these containers to reduce browser memory usage
    this.sauce = {}
    this.text = ``
    domObject.html = ``
    reset(resetCursor)
    reset(resetECMA)
    reset(resetSGR)
  }
  /**
   * Hide HTML entities that break the formatting of ANSI documents.
   * @returns String of text with ⮘⮙⮚ placeholders
   */
  _hideEntities() {
    // replace all matches
    // note: the RegExp sequence order must be kept
    const modified = this.text
      // matches &gt;
      .replace(RegExp(`&gt;`, `gi`), `⮚`)
      // matches > except when proceeded by an escape sequence ␛[>
      .replace(RegExp(`([^\x1B[=])>`, `gi`), `$1⮚`)
      // matches &lt; or <
      .replace(RegExp(`&lt;|<`, `gi`), `⮘`)
      // matches &amp;
      .replace(RegExp(`&amp;`, `gi`), `⮙`)
    return modified
  }
  /**
   * Match and remove sequences that are common in late 1990s - mid 2000s
   * ANSI art that break the display in HTML.
   * One main issue is where a newline is activated then cursor up one
   * and cursor forward commands are given.
   * @returns String of text
   */
  _cleanSequences() {
    // RegExp to handle the newline, up, forward sequence
    // \n←[1A←[??C (newline, ANSI cursor up 1 place, move forward ?? positions)
    // \n←[A←[??C (newline, ANSI cursor up, move forward ?? positions)
    const newlineFwd = /\n\u2190\[[1]?A\u2190\[[0-9]?[0-9]?[0-9]?C/g
    // RegExp to remove all other newline and cursor up combination sequences
    const newlineUp = /\n\u2190\[[1]?A/g
    let modified = this.text
    // strip PCBoard @CLS@ MCI that's occasionally found in ANSI documents
    if (modified.startsWith(`@CLS@`)) modified = modified.slice(5)
    return modified.replace(newlineFwd, ``).replace(newlineUp, ``)
  }
  /**
   * Translates the SGR numeric ranges (10...20) into CSS `font-family` values.
   * @param [font=10] SGR numeric font
   * @returns CSS font family string
   */
  _parseFont(font = 10) {
    // Any changes to these fonts need to be reflected in both
    // css/text_ecma_48.css and docs/technical.md.
    switch (parseInt(font, 10)) {
      case 10:
        // primary font, use Option selection
        return null
      case 11:
        return `ibm_bios`
      case 12:
        return `ibm_cga`
      case 13:
        return `ibm_cgathin`
      case 14: // commodore amiga 500
        return `topaza500`
      case 15:
        return `ibm_ega_8x14`
      case 16:
        return `ibm_ega_9x14`
      case 17:
        return `ibm_vga_8x14`
      case 18:
        return `ibm_vga_9x14`
      case 19:
        return `ibm_mda`
      case 20: // gothic font (Eagle Spirit CGA Alt3)
        return `eaglespcga_alt3`
    }
  }
}

/**
 * Creates an object that is used for tracking the active cursor position.
 * @class Cursor
 */
class Cursor {
  /**
   * Creates an instance of Cursor.
   * @column      Track X axis
   * @row         Track Y axis
   * @maxColumns  Maximum columns per line
   * @previousRow Previous column, used to decide when to inject line breaks
   * @eraseLines  Used by the Erase in page and Erase in line
   */
  constructor() {
    this.column = 1
    this.row = 1
    this.maxColumns = 80
    this.previousRow = 0
    this.eraseLines = []
    this._init()
  }

  /**
   * Initialise this class.
   */
  _init() {
    // As the ANSI column wrap is applied using HTML elements instead of a CSS class,
    // the setting must be read from storage and applied to the `maxColumns` property.
    // Otherwise the column wrap will not work and always use the defaultColumns value.
    //
    // To test: https://retrotxt.com/test/long-string.ans
    const key = `ansiColumnWrap`,
      defaultColumns = 80
    chrome.storage.local.get([`${key}`], (result) => {
      const value = result[`${key}`]
      sessionStorage.setItem(key, value)
      localStorage.setItem(key, value)
      try {
        const key = `ansiColumnWrap`,
          setting = sessionStorage.getItem(key) || localStorage.getItem(key)
        if (`${setting}` === `false`)
          // set maxColumns to 0 to disable
          return (this.maxColumns = 0)
      } catch {
        return (this.maxColumns = defaultColumns)
      }
      return (this.maxColumns = defaultColumns)
    })
  }

  /**
   * Resets the cursor data container using the constructor defaults.
   * @param [old={}] Data container object
   */
  async reset(old = {}) {
    for (const key of Object.keys(this)) {
      old[key] = this[key]
    }
  }
  /**
   * Creates white space to simulate a cursor position forward request.
   * The white space should not have any presentation controls applied
   * to it, such as background colours.
   * @param [places=1] The number of places to move, if 0 then build to the end
   * of the line
   */
  async columnElement(places = 1) {
    const move = parseInt(places, 10)
    if (Number.isNaN(move)) return null
    if (move < 0) CheckRange(`places`, `small`, `0`, move)
    const position = () => {
      if (move === 0) {
        if (cursor.column === 1) return cursor.maxColumns
        if (cursor.maxColumns > 0) return cursor.maxColumns - cursor.column
      }
      return move
    }
    const count = position(),
      end = cursor.column + count - 1,
      element = italicElement()
    if (cursor.column === end)
      domObject.html = `${domObject.html}</i><i id="column-${
        cursor.column
      }" class="SGR0">${` `.repeat(count)}</i>${element}`
    else
      domObject.html = `${domObject.html}</i><i id="column-${
        cursor.column
      }-to-${end}" class="SGR0">${` `.repeat(count)}</i>${element}`
    this.columnParse(count)
  }

  /**
   * Automatically resets the column forward position to the beginning of the
   * line after `count` has reached 80 columns.
   * @param [count=1] The number of characters or places that have been
   * displayed. If `count` is set to 0 then a forced reset will be applied to
   * `cursor.column`.
   */
  columnParse(count = 1) {
    const track = parseInt(count, 10)
    if (Number.isNaN(track)) return null
    if (track < 0) CheckRange(`count`, `small`, `0`, track)
    switch (track) {
      case 0:
        return (cursor.column = 1)
      default:
        cursor.column += track
        if (cursor.maxColumns !== 0 && cursor.column > cursor.maxColumns) {
          // reached the end of line so start a new line
          cursor.previousRow++
          this.rowElement(1)
        }
    }
  }
  /**
   * Create a line break tag to simulate a cursor position down request.
   * @param [count=1] The number of places to move
   * @param [columns=0] If set to 1 or greater then also reposition the cursor
   * forward by this many places
   */
  async rowElement(count = 1, columns = 0) {
    const move = parseInt(count, 10),
      cols = parseInt(columns, 10)
    if (Number.isNaN(move)) return null
    if (Number.isNaN(cols)) return null
    if (move < 1) CheckRange(`count`, `small`, `1`, move)
    if (cols < 0) CheckRange(`columns`, `small`, `0`, cols)
    const element = italicElement(),
      resetColumns = 0
    cursor.previousRow = cursor.row
    for (let i = 0; i < move; i++) {
      cursor.row++
      this.columnParse(resetColumns)
      // display a newline symbol at the end of the row
      domObject.html += `</i></div><div id="row-${cursor.row}">${element}`
    }
    // always build columns AFTER rows and outside of the loop
    if (cols > resetColumns) this.columnElement(cols)
  }
}

/**
 * ECMA48/ANSI Select Graphic Rendition toggles.
 * @class SGR
 */
class SGR {
  /**
   * Creates an instance of SGR.
   * @bold        Value 1
   * @faint       Value 2
   * @italic      Value 3
   * @underline   Value 4
   * @blinkSlow   Value 5
   * @blinkFast   Value 6
   * @inverse     Value 7
   * @conceal     Value 8
   * @crossedOut  Value 9
   * @underlineX2 Value 21
   * @framed      Value 51
   * @encircled   Value 52
   * @overLined   Value 53
   * @colorF      Foreground text colour
   * @colorB      Background colour
   * @rgbF        RGB foreground css value
   * @rgbB        RGB background css value
   */
  constructor() {
    const whiteForeground = 37,
      blackBackground = 40
    this.bold = false
    this.faint = false
    this.italic = false
    this.underline = false
    this.blinkSlow = false
    this.blinkFast = false
    this.inverse = false
    this.conceal = false
    this.crossedOut = false
    this.underlineX2 = false
    this.framed = false
    this.encircled = false
    this.overLined = false
    // colours
    this.colorF = whiteForeground
    this.colorB = blackBackground
    this.rgbF = ``
    this.rgbB = ``
  }
  /**
   * Resets the cursor data container using the `constructor()` defaults.
   * @param [old={}] Data container object
   */
  async reset(old = {}) {
    for (const key of Object.keys(old)) {
      old[key] = this[key]
    }
  }
}

/**
 * ECMA48/ANSI Statistics.
 * @class Statistics
 */
class Statistics {
  /**
   * Creates an instance of Statistics.
   * @other       Number of unsupported ANSI.SYS control sequences found
   * @unknown     Number of unsupported ECMA-48 control sequences found
   * @colorDepth  Color depth override if a set/reset mode CSI has requested it
   * @font        CSS class values SGR10…20, see text_ecma_48.css for the
   * different font-family values
   * @iceColors   iCE Color mode which replaces SGR5/6 CSS blink methods with
   * alternative background colours
   */
  constructor() {
    const fourBitColor = 4,
      primaryFont = 10
    this.other = 0
    this.unknown = 0
    this.colorDepth = fourBitColor
    this.font = primaryFont
    this.iceColors = false
  }
  /**
   * Resets the cursor data container using the `constructor()` defaults.
   * @param [old={}] Data container object
   */
  async reset(old = {}) {
    for (const key of Object.keys(this)) {
      old[key] = this[key]
    }
  }
}

/**
 * Container for the Document Object Model (DOM)
 * @class Dom
 */
class Dom {
  constructor() {
    this.html = ``
  }
}

// Shared data containers.
// note: classes are not hoisted
const cursor = new Cursor(),
  ecma48 = new Statistics(),
  sgrObject = new SGR(),
  domObject = new Dom()

/**
 * Constructs an <i> element based on the current styles and classes in use.
 * @param [parameters=``] SGR parameter values or ANSI.SYS text attributes,
 * for example `SGR+31` `SGR+0+1+31`
 * @returns Open italic element as a string
 */
function italicElement(parameters = ``) {
  const sgr = new CharacterAttributes(`${parameters}`),
    style = sgr.createRGBStyle(),
    css = sgr.createSGRClass(parameters)
  if (style !== `` && css !== ``) return `<i class="${css}" style="${style}">`
  if (css !== ``) return `<i class="${css}">`
  if (style !== ``) return `<i style="${style}">`
  return ``
}

/**
 * Reset data container objects.
 * @param [name=``] Container name to reset, either `cursor`, `ecma48` or `sgr`
 * @returns Data container
 */
async function reset(name = -1) {
  let data
  switch (name) {
    case resetCursor:
      data = new Cursor()
      return data.reset(cursor)
    case resetECMA:
      data = new Statistics()
      return data.reset(ecma48)
    case resetSGR:
      data = new SGR()
      return data.reset(sgrObject)
  }
}

/**
 * ECMA-48 and ANSI display attributes that set the display colours and text
 * typography.
 * http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-048.pdf
 *
 * @class CharacterAttributes
 */
class CharacterAttributes {
  /**
   * Creates an instance of CharacterAttributes.
   * @param [parameters=``] ANSI SGR sequences
   * @param [verbose=false] Verbose console output
   */
  constructor(parameters = ``, verbose = false) {
    this.parameters = parameters
    this.verbose = verbose
    this.value = -1
    this.values = []
    this.styles = ``
    this.toggles = sgrObject
  }

  /**
   * Creates CSS selectors based on SGR sequences for use with <i> elements.
   * @returns A collection of CSS selectors
   */
  createSGRClass() {
    let css = ``
    // colours
    const fg = this.toggles.colorF,
      primary = 10,
      fraktur = 20,
      reserved = 38,
      black = 30,
      normal = 39
    // bold/intense foreground
    if (this.toggles.rgbF.length === 0) {
      if (this.toggles.bold && fg !== reserved && fg >= black && fg <= normal)
        css += ` SGR1${fg}`
      else if (fg !== null) css += ` SGR${fg}` // normal
    }
    // background
    if (this.toggles.rgbB.length === 0 && this.toggles.colorB !== null)
      css += ` SGR${this.toggles.colorB}`
    // presentation options css
    if (this.toggles.faint) css += ` SGR2`
    if (this.toggles.italic) css += ` SGR3`
    if (this.toggles.underline) css += ` SGR4`
    if (this.toggles.blinkSlow) css += ` SGR5`
    if (this.toggles.blinkFast) css += ` SGR6`
    if (this.toggles.inverse) css += ` SGR7`
    if (this.toggles.conceal) css += ` SGR8`
    if (this.toggles.crossedOut) css += ` SGR9`
    if (this.toggles.underlineX2) css += ` SGR21`
    if (this.toggles.framed) css += ` SGR51`
    if (this.toggles.encircled) css += ` SGR52`
    if (this.toggles.overLined) css += ` SGR53`
    // alternative fonts, values 11…20
    // value 10 is the primary (default) font
    // see `css/text_ecma_48.css` for the fonts
    if (ecma48.font > primary && ecma48.font <= fraktur)
      css += ` SGR${ecma48.font}`
    return css.trim()
  }
  /**
   * Creates CSS style properties based on SGR sequences for use
   * with <i> elements, which are needed for RGB 24-bit colours.
   * @returns A collection of CSS RGB style properties or an empty string
   */
  createRGBStyle() {
    const parameters = this.parameters,
      values = parameters.split(`+`)
    // forward loop as multiple codes together have compound effects
    let value
    rgbValues: for (const parameter of values) {
      const monochrome = 1,
        trueColor = 24,
        rgbFg = 38,
        rgbBg = 48
      value = parseInt(parameter, 10)
      if (Number.isNaN(value) === true) continue rgbValues // error
      if (value === 0 && parameters !== `ICE+0`) {
        if (this.verbose) console.info(`dataSGR()`)
        reset(resetSGR)
      }
      this.value = value
      this.values = values
      // handle colour values
      switch (ecma48.colorDepth) {
        case monochrome:
          // if color depth is 1-bit then ignore SGR color values
          break
        default:
          // look for and convert aixterm 3-bit colour values to standard 3-bit
          // otherwise sets value to be a standard SGR colour
          value = this._aixterm()
          switch (value) {
            // handle RGB colours
            case rgbFg:
            case rgbBg:
              switch (values[2]) {
                case `2`:
                  ecma48.colorDepth = trueColor
                  this.styles = this._rgb()
                  break
              }
              break
            default:
              // checks for both standard ANSI foreground/background colours
              // as well as xterm 8-bit colours
              this._setForeground()
              this._setBackground()
          }
      }
      // handle presentation options
      this._presentation()
      // end of loop
    }
    return `${this.styles.trim()}`
  }
  /**
   * IBM AIX terminal bright colours (SGR 90-97, SGR 100-107).
   * This is a lazy implementation that first toggles the bold or blink flag
   * and then returns the Aixterm SGR value as an ANSI 3-bit colour value.
   * @returns ANSI 3-bit colour value
   */
  _aixterm() {
    const blackSGR = 30,
      blackF = 90,
      blackB = 100,
      whiteF = 97,
      whiteB = 107,
      difference = blackF - blackSGR // 60
    const value = parseInt(this.value, 10)
    if (Number.isNaN(value)) return null
    if (value >= blackF && value <= whiteF) {
      this.toggles.bold = true
      this.value = value - difference
    } else if (value >= blackB && value <= whiteB) {
      this.toggles.blinkSlow = true
      this.value = value - difference
    }
    return this.value
  }
  /**
   * Sets the background color (SGR 40-49, Xterm 8-bit).
   * @returns Background color detected
   */
  _setBackground() {
    const value = parseInt(this.value, 10),
      xtermValue = this._xtermBG(),
      black = 40,
      normal = 49,
      xterm256 = 8
    if ((value >= black && value <= normal) || xtermValue) {
      this.toggles.rgbB = ``
      // flag Xterm 256 color
      if (xtermValue && typeof ecma48.colorDepth === `number`)
        ecma48.colorDepth = xterm256
      this.toggles.colorB = value
      // permit the use of 24-bit RGB foregrounds with 3
      // or 8-bit background colours
      if (this.toggles.rgbF.length > 0) this.styles = this.toggles.rgbF
      return true
    }
    return false
  }
  /**
   * Sets the foreground color (SGR 30-39, Xterm 8-bit).
   * @returns Foreground color detected
   */
  _setForeground() {
    const value = parseInt(this.value, 10),
      xtermValue = this._xtermFG(),
      black = 30,
      normal = 39,
      xterm256 = 8
    if ((value >= black && value <= normal) || xtermValue) {
      this.toggles.rgbF = ``
      // flag Xterm 256 color
      if (xtermValue && typeof ecma48.colorDepth === `number`)
        ecma48.colorDepth = xterm256
      this.toggles.colorF = value
      // permit the use of 24-bit RGB backgrounds with 3
      // or 8-bit foreground colours
      if (this.toggles.rgbB.length > 0) this.styles = this.toggles.rgbB
      return true
    }
    return false
  }
  /**
   * 24-bit RGB colours toggled by the SGR `2` value.
   * @returns CSS RGB color styles
   */
  _rgb() {
    const isRGB = () => {
      if (isNaN(red) || isNaN(green) || isNaN(blue)) return false
      if (red < min) return false
      if (red > max) return false
      if (green < min) return false
      if (green > max) return false
      if (blue < min) return false
      if (blue > max) return false
      return true
    }
    const values = this.values,
      red = parseInt(values[3], 10),
      green = parseInt(values[4], 10),
      blue = parseInt(values[5], 10),
      min = 0,
      max = 255,
      foreground = 38,
      background = 48
    if (isRGB()) {
      // reset colours
      values[2] = null
      values[3] = null
      values[4] = null
      values[5] = null
      switch (parseInt(this.value, 10)) {
        case foreground:
          this.toggles.rgbF = `color:rgb(${red},${green},${blue});`
          if (this.toggles.rgbB.length > 0)
            this.styles += this.toggles.rgbF + this.toggles.rgbB
          else this.styles += this.toggles.rgbF
          break
        case background:
          this.toggles.rgbB = `background-color:rgb(${red},${green},${blue});`
          if (this.toggles.rgbF.length > 0)
            this.styles = this.toggles.rgbF + this.toggles.rgbB
          else this.styles += this.toggles.rgbB
          break
      }
    }
    // trim the tail semicolon
    return `${this.styles.slice(0, -1)}`
  }
  /**
   * Detect Xterm 256 background code.
   * @returns Result
   */
  _xtermBG() {
    const value = parseInt(this.value, 10),
      black = 480,
      red = 489,
      lime = 4810,
      slateblue1 = 4899,
      yellow4 = 48100,
      grey93 = 48255
    if (value >= black && value <= red) return true
    if (value >= lime && value <= slateblue1) return true
    if (value >= yellow4 && value <= grey93) return true
    return false
  }
  /**
   * Detect Xterm 256 foreground code.
   * @returns Result
   */
  _xtermFG() {
    const value = parseInt(this.value, 10),
      black = 380,
      red = 389,
      lime = 3810,
      slateblue1 = 3899,
      yellow4 = 38100,
      grey93 = 38255
    if (value >= black && value <= red) return true
    if (value >= lime && value <= slateblue1) return true
    if (value >= yellow4 && value <= grey93) return true
    return false
  }
  /**
   * Toggle presentation flags.
   */
  _presentation() {
    const value = parseInt(this.value, 10),
      primaryFont = 10,
      franktur = 20
    switch (value) {
      case 1:
        // `!this.` switches the existing Boolean value
        // DO NOT USE `return (this.toggles.bold = !this.toggles.bold)`
        // as the this.toggles.bold value will not be updated
        this.toggles.bold = !this.toggles.bold
        break
      case 2:
        this.toggles.faint = !this.toggles.faint
        break
      case 3:
        this.toggles.italic = !this.toggles.italic
        break
      case 4:
        this.toggles.underline = !this.toggles.underline
        break
      case 5:
        this.toggles.blinkSlow = !this.toggles.blinkSlow
        break
      case 6:
        this.toggles.blinkFast = !this.toggles.blinkFast
        break
      case 7:
        this.toggles.inverse = !this.toggles.inverse
        break
      case 8:
        this.toggles.conceal = !this.toggles.conceal
        break
      case 9:
        this.toggles.crossedOut = !this.toggles.crossedOut
        break
      case 21:
        this.toggles.underlineX2 = !this.toggles.underlineX2
        break
      case 22:
        this.toggles.bold = false
        this.toggles.faint = false
        break
      case 23:
        this.toggles.italic = false
        if (ecma48.font === franktur) ecma48.font = primaryFont
        break
      case 24:
        this.toggles.underline = false
        this.toggles.underlineX2 = false
        break
      case 25:
        this.toggles.blinkSlow = false
        this.toggles.blinkFast = false
        break
      case 26: // reserved
        break
      case 27:
        this.toggles.inverse = false
        break
      case 28:
        this.toggles.conceal = false
        break
      case 29:
        this.toggles.crossedOut = false
        break
      case 51:
        this.toggles.framed = !this.toggles.framed
        break
      case 52:
        this.toggles.encircled = !this.toggles.encircled
        break
      case 53:
        this.toggles.overLined = !this.toggles.overLined
        break
      case 54:
        this.toggles.framed = false
        this.toggles.encircled = false
        break
      case 55:
        this.toggles.overLined = false
        break
      default:
        if (value >= primaryFont && value <= franktur) ecma48.font = value
    }
  }
}

/**
 * Applies presentation classes into small `<i>` elements. In HTML4 these
 * elements were simply italic styles but in HTML5 they can "represent a range
 * of text that is set off from the normal text for some reason".
 * @class Markup
 */
class Markup {
  /**
   * Creates an instance of Markup.
   * @param [sequences=[]] An array of strings containing text and
   * control sequences, for example `['SGR+1', 'h', 'i']`
   * @param [lineWrap=true] Enforce line wrapping
   * @param [maxLength=100] Number of characters to display before enforcing
   * line wrapping
   */
  constructor(sequences = [], lineWrap = true, maxLength = 100) {
    this.sequences = sequences
    this.lineWrap = lineWrap
    this.maxLength = maxLength
    this.item = {
      row1: false,
      // value will contain either a control code, text character or null
      value: ``,
    }
  }
  /**
   * The entry point to the `HTML` class. It uses `this.sequences` to build and
   * return HTML elements.
   */
  build() {
    const isFirstRow = () => {
      if (item.row1 !== false) return false
      if (row1.start !== false) return false
      if (row1.index !== notFound) return false
      return true
    }
    const nul = 0,
      character = 1,
      notFound = -1
    this._clean()
    // determine the first row by looking ahead 100 characters
    const htmlSlice = domObject.html.slice(0, this.maxLength),
      row1 = {
        start: htmlSlice.startsWith(`<div id="row-1"`),
        index: htmlSlice.indexOf(`<div id="row-1"`, 0),
      },
      item = this.item
    let row = 0
    sequences: for (item.value of this.sequences) {
      row += 1
      // handle items
      switch (item.value.length) {
        case nul:
          continue sequences
        case character:
          // 1 byte values are individual characters to display
          this._specialMarker(item.value)
          break
        default:
          // multi-byte values are control sequences
          this._parseNamedSequence(row, item.value)
      }
      // handle the first row HTML
      if (isFirstRow()) {
        if ([`ICE+1`, `ICE+0`].includes(this.sequences[0]))
          domObject.html = `<div id="row-1">`
        else {
          this.item = item
          domObject.html = `<div id="row-1">${this._element_i()}${
            domObject.html
          }`
        }
        item.row1 = true
        continue sequences
      }
      if (row <= 2 && domObject.html.startsWith(`<div id="row-1"></i>`)) {
        // handle malformed tags due to iCE Color triggers
        domObject.html = domObject.html.replace(
          `<div id="row-1"></i>`,
          `<div id="row-1">`,
        )
        continue sequences
      }
    }
    // Clean up empty elements before the browser render
    const emptySpan = new RegExp(
        /<i class="SGR[1]?3[0-9][0-9]* SGR4[0-9][ SGR\d+\d*]*"><\/i>/g,
      ),
      emptyRow = new RegExp(/<div id="row-(\d+)"><\/div>/g)
    domObject.html = domObject.html
      .replace(emptySpan, ``)
      .replace(emptyRow, `<div id="row-$1"><br></div>`)
    // Smear block characters on Windows platforms
    domObject.html = this._tagBlockCharacters(`${domObject.html}`)
    // close any opened tags
    this._closeElements()
    // apply erase lines
    this._eraseLines()
  }
  /**
   * Filters out newline characters from `this.sequences`.
   */
  _clean() {
    switch (this.lineWrap) {
      case false:
        this.sequences = this.sequences.filter((value) => {
          return value !== `\n`
        })
        break
    }
  }
  /**
   * Parses the DOM and closes any opened elements.
   */
  _closeElements() {
    // regex for HTML modifications
    const nullSpace = new RegExp(
        /<div id="row-(\d+)"><i class="SGR(\d+) SGR(\d+)"><\/i><\/div>/gi,
      ),
      dom = domObject
    switch (dom.html.endsWith(`\u241B\u005B\uFFFD\uFFFD`)) {
      case true:
        // hacked fix for trailing `␛[��` results
        if (ecma48.unknown > 0) ecma48.unknown--
        dom.html = `${dom.html.slice(0, -27)}</i></div>`
        break
      default:
        switch (dom.html.endsWith(`</i></div>`)) {
          case false:
            // close opened elements
            dom.html = `${dom.html}</i></div>`
            break
          default:
            switch (dom.html.endsWith(`</div>`)) {
              case true:
                // close opened <i> elements
                switch (dom.html) {
                  case `<div id="row-1"><i class="SGR37 SGR40"></i></div>`:
                    break
                  default:
                    dom.html = `${dom.html.slice(0, -6)}</i></div>`
                }
            }
        }
    }
    // force browsers to show empty rows by injecting a single space character
    // note: there is an intentional empty space between the italic elements
    dom.html = dom.html.replace(
      nullSpace,
      `<div id="row-$1"><i class="SGR$2 SGR$3"> </i></div>`,
    )
  }
  /**
   * Create and return an `<i>` element.
   * @returns Open italic element
   */
  _element_i() {
    // switch the CSI name
    switch (this.item.value.split(`+`)[0]) {
      case `SGR`:
        return italicElement(this.item.value)
      default:
        return italicElement()
    }
  }
  /**
   * Applies ED classes to `<div>` elements to simulate erased rows.
   */
  _eraseLines() {
    for (let line of cursor.eraseLines) {
      // lines rows start with a value 1 (not 0)
      line++
      const regExp = new RegExp(`<div id="row-${line}">`, `i`)
      domObject.html = domObject.html.replace(
        regExp,
        `<div id="row-${line}" class="ED">`,
      )
    }
  }
  /**
   * Parse horizontal vertical position control named sequence.
   * There is incomplete support for this control as RetroTxt doesn't support
   * the upward movement of the cursor
   */
  _parseCursor(row = -1, column = -1) {
    //
    if (row < cursor.row) return ecma48.other++
    // set the previous row
    cursor.previousRow = cursor.row
    // RetroTxt doesn't support the backward movement of the cursor
    if (row === cursor.row && column < cursor.column) return ecma48.other++
    // downward cursor position
    if (row > cursor.row) {
      // HVP values are cursor coordinates while the `rowElement(columns)`
      // parameter is a forward movement value, so the `item2` value needs
      // to lose 1 position (item2-1).
      // `HVP+1+50` equals go to row 1, start at column 1 and move 49 places
      const moveFwd = column - 1,
        moveDown = row - cursor.row
      return cursor.rowElement(moveDown, moveFwd)
    }
    // forward cursor position when exceeding maximum columns
    // this will create a new row and continue the forward movement
    if (column > cursor.maxColumns) {
      return cursor.rowElement(1, column - cursor.maxColumns - 1)
    }
    // forward cursor position
    if (column > cursor.column) {
      if (cursor.column > 1) return cursor.columnElement(column - cursor.column)
      return cursor.columnElement(column - 1)
    }
  }
  /**
   * Parse forward cursor control named sequence.
   */
  _parseCursorForward(control = ``, move = -1) {
    if (move <= 0) return
    let movement = move
    // each forward tabulation value is set as 4 spaces
    if (control === `CHT`) movement *= 4
    const sum = movement + cursor.column
    switch (cursor.maxColumns) {
      case 0:
        // no hard wrap
        return cursor.columnElement(movement)
      default:
        // when columns is less than or equals to the maximum columns
        if (sum <= cursor.maxColumns) return cursor.columnElement(movement)
        // previously the `CUF` control was ignored if it went over the
        // maximum columns. instead this creates a new row and continues
        // the cursor forward
        return cursor.rowElement(1, sum - cursor.maxColumns - 1)
    }
  }
  /**
   * Parse control named sequences.
   * @param [fwd=0] Current forwardLoop() row count
   * @param [item=``] A control code, character or `null`
   */
  _parseNamedSequence(fwd = 0, item = ``) {
    if (typeof item !== `string`) CheckArguments(`item`, `string`, item)
    if (item.length < 1) CheckRange(`item`, `length`, `1`, item)
    const row = parseInt(fwd, 10)
    function parseItem() {
      const item = items[2]
      if (typeof item !== `undefined`) return parseInt(item, 10)
      return 0
    }
    // obtain control name
    const control = item.slice(0, 3),
      items = item.split(`+`),
      item1 = parseInt(items[1], 10),
      item2 = parseItem()
    // console log styles
    const mark = `text-decoration:underline`,
      unmark = `text-decoration:none;`
    switch (control) {
      case `CUD`: // cursor down
        if (item1 > 0) return cursor.rowElement(item1)
        return console.log(`%cCUD-${item1}%c control is invalid.`, mark, unmark)
      case `CHT`: // horizontal forward tabulation
      case `CUF`: // cursor forward
        return this._parseCursorForward(control, item1)
      case `HVP`: // horizontal vertical position
        return this._parseCursor(item1, item2)
      case `ICE`: // iCE Colors
        switch (item1) {
          case 0:
            return (ecma48.iceColors = false)
          case 1:
            return (ecma48.iceColors = true)
          default:
            return console.log(`ICE ${item1} control is invalid`)
        }
      case `SGR`: // character attributes
        if (row >= 1) return (domObject.html += `</i>${italicElement(item)}`)
        return console.log(`%cSGR-${row}%c value is invalid.`, mark, unmark)
      case `ED+`: // erase in page
        switch (item1) {
          case 0:
            // erase from cursor to end of the screen (-ANSI.SYS)
            // [incomplete, currently just goes to the end of the line]
            return cursor.columnElement(0)
          case 1:
          case 2:
            // fix for issue https://github.com/bengarrett/RetroTxt/issues/25
            if (cursor.row >= 1 && cursor.column > 1) {
              // erase all lines to current row using ES6 range 1...current row
              // the `Set` is used to remove duplicate rows
              cursor.eraseLines = [...new Set(Array(cursor.row).keys())]
            }
        }
        return
      case `EL+`: // erase in line
        switch (item1) {
          case 0: // go to end of the line
            return cursor.columnElement(0)
          case 1: // clear from cursor to the beginning of the line (-ANSI.SYS)
            return console.log(
              `%cEL1%c clear from cursor to the beginning of the line is not supported.`,
              mark,
              unmark,
            )
          case 2: // erase line (-ANSI.SYS)
            if (cursor.row < 1)
              return console.log(
                `%cEL2-${cursor.row}%c is invalid.`,
                mark,
                unmark,
              )
            return cursor.eraseLines.push(cursor.row - 1)
        }
        return
      case `SM+`: // set modes (MS-DOS ANSI.SYS driver)
        this._parseNamedSetMode(parseInt(item1))
        ecma48.colorDepth = this.colorDepth
        ecma48.font = this.font
        ecma48.maxColumns = this.maxColumns
        return
      case `LW+`:
        return console.log(`%cLW-${row}%c control is ignored.`, mark, unmark)
      default:
        console.log(
          `%c%s%c parse-named-sequence tried to parse this unknown control`,
          item,
          mark,
          unmark,
        )
    }
  }
  /**
   * Parse Set Mode sequence.
   * @param [parameter=-1] Set Mode number value between 0-6 and 13-19
   */
  _parseNamedSetMode(parameter = -1) {
    const mode = parseInt(parameter, 10),
      range = [0, 1, 2, 3, 4, 5, 6, 13, 14, 15, 16, 17, 18, 19]
    if (!range.includes(mode)) {
      const msg = `the parameter '${mode}' for parseNamedSetMode is out of range, it needs to be either ${range}`
      CheckError(msg, true)
    }
    this.colorDepth = -1
    this.font = -1
    this.maxColumns = 80
    // default set mode values
    const values = [`4-bit`, `VGA`, `80`]
    values[0] = this._parseColorDepth(mode)
    this.font = this._parseResolution(mode)
    // configure the number of columns
    const lowResolution = 40
    if (mode === 0 || mode === 1) this.maxColumns = lowResolution
    console.info(
      `Set mode applied, ${values[0]} ${values[1]} in ${values[2]} columns mode`,
    )
  }
  /**
   * Parse Set Mode colour depth.
   * @param [mode=-1] Mode value between 0 and 19
   */
  _parseColorDepth(mode = -1) {
    switch (mode) {
      case 0:
      case 2:
      case 15:
      case 17:
        this.colorDepth = 1
        return `1-bit`
      case 5:
      case 6:
        this.colorDepth = 0
        return `4-bit monochrome`
      case 1:
      case 3:
      case 4:
        this.colorDepth = 2
        return `2-bit`
      case 13:
      case 14:
      case 16:
      case 18:
        this.colorDepth = 4
        return `4-bit`
      case 19:
        this.colorDepth = 8
        return `8-bit [unsupported]`
    }
    return `unknown`
  }
  /**
   * Parse Set Mode resolution which effects the font choice.
   * @param [mode=-1] Mode value between 0-6 and 13-19
   */
  _parseResolution(mode = -1) {
    const ibm_cga = 12,
      ibm_cgathin = 13,
      ibm_ega_8x14 = 15,
      ibm_vga_8x14 = 17,
      ibm_mda = 19
    switch (mode) {
      case 2: // 80 x 148 x 25 monochrome (text)
        return ibm_mda
      case 0: // 40 x 148 x 25 monochrome (text)
      case 1: // 40 x 148 x 25 color (text)
      case 4: // 320 x 148 x 200 4-color (graphics)
      case 5: // 320 x 148 x 200 monochrome (graphics)
      case 13: // 320 x 148 x 200 color (graphics)
      case 19: // 320 x 148 x 200 color (256-color graphics)
        return ibm_cga
      case 6: // 640 x 148 x 200 monochrome (graphics)
      case 14: // 640 x 148 x 200 color (16-color graphics)
        return ibm_cgathin
      case 3: // 80 x 148 x 25 color (text)
      case 15: // 640 x 148 x 350 monochrome (2-color graphics)
      case 16: // 640 x 148 x 350 color (16-color graphics)
        return ibm_ega_8x14
      case 17: // 640 x 148 x 480 monochrome (2-color graphics)
      case 18: // 640 x 148 x 480 color (16-color graphics)
        return ibm_vga_8x14
    }
  }
  /**
   * Parse and replace any special markers with HTML entities.
   * Otherwise append the text character to `domObject.html`.
   * @param [mark=``] Character as string
   * @returns String of HTML elements
   */
  _specialMarker(mark = ``) {
    if (typeof mark !== `string`) CheckArguments(`mark`, `string`, mark)
    switch (mark) {
      case `\n`:
        // replace newline controls with line break elements
        cursor.rowElement()
        return `lf`
      case `⮚`:
        domObject.html = `${domObject.html}&gt;`
        cursor.columnParse()
        return `&gt;`
      case `⮘`:
        domObject.html = `${domObject.html}&lt;`
        cursor.columnParse()
        return `&lt;`
      case `⮙`:
        domObject.html = `${domObject.html}&amp;`
        cursor.columnParse()
        return `&amp;`
      default:
        // append the text character to HTML as a string
        domObject.html = `${domObject.html}${mark}`
        cursor.columnParse()
        return domObject.html
    }
  }
  /**
   * Looks for various CP-437 block characters in the text content of any <i></i>
   * elements and encloses them with <b></b> elements for additional CSS styling.
   * This is to prevent the Windows operating system issue where multiple block
   * characters in sequence introduce very noticeable line artefacts that can ruin
   * the display of ANSI art.
   * The CSS modification can be found in ``.
   * @param [html=``] string
   */
  _tagBlockCharacters(html = ``) {
    const config = localStorage.getItem(`textSmearBlockCharacters`) || `false`
    if (config !== `true`) return html
    return html.replace(RegExp(/([◘░▒▓█▄▐▌▀■]+)/, `g`), `<b>$1</b>`)
  }
}

/**
 * SAUCE metadata feedback and ANSI render controls.
 * @class metadata
 */
class Metadata {
  /**
   * Creates an instance of Metadata.
   * @param [data={ version: `` }] SAUCE Metadata object
   */
  constructor(data = { version: `` }) {
    this.data = data
    this.font = ``
  }
  /**
   * Handle SAUCE v00 metadata and output statistics to the console.
   * It may also adjust the page maximum width, font family & iCE Color toggle.
   */
  parse() {
    const humaniseAspectRatio = (flags = ``) => {
      switch (flags) {
        case `00`:
          return `no preference`
        case `01`:
          return `taller font`
        case `10`:
          return `standard height font`
        default:
          return `not valid`
      }
    }
    const humaniseSpacing = (flags = ``) => {
      switch (flags) {
        case `00`:
          return `no preference`
        case `01`:
          return `8 pixel font`
        case `10`:
          return `9 pixel font`
        default:
          return `not valid`
      }
    }
    const cappedWidth = 9999,
      defaultWidth = 80,
      data = this.data
    let info = ``,
      width,
      iceColors
    switch (data.version) {
      case `00`:
        if (data.configs.fontFamily.length > 0) {
          // fontFamily returns a lower case short name
          // this gets parsed by `getECMA48()` in `retrotxt.js`
          // it expects a string
          this.font = `${data.configs.fontFamily}`
        }
        // override column width
        width = parseInt(data.configs.width, 10)
        // handle corrupted or missing width data
        if (Number.isNaN(width)) width = defaultWidth
        console.log(`Determined width, %s columns.`, width)
        cursor.maxColumns = width <= cappedWidth ? width : cappedWidth
        if (cursor.maxColumns === cappedWidth)
          console.info(`Maximum column width capped at ${cappedWidth}`)
        // override iCE Colors
        iceColors = parseInt(data.configs.iceColors, 10)
        ecma48.iceColors = iceColors === 1
        // console feedback
        info += `Font: ${data.configs.fontName}`
        info += `\nAspect Ratio: ${
          data.configs.aspectRatio
        }, ${humaniseAspectRatio(data.configs.aspectRatio)} (not implemented)`
        info += `\nLetter Spacing: ${
          data.configs.letterSpacing
        }, ${humaniseSpacing(data.configs.letterSpacing)}`
        info += `\nNon-blink mode (iCE Colors): ${ecma48.iceColors}`
        info += `\nANSI Flags: 000${data.configs.flags} [000|AR|LS|B]`
        console.groupCollapsed(`SAUCE configurations`)
        console.log(info)
        console.groupEnd()
        return
      default:
        console.log(`No SAUCE detected.`)
        if (
          typeof localStorage !== `undefined` &&
          localStorage.getItem(`ansiUseIceColors`) === `true`
        )
          ecma48.iceColors = true
    }
  }
}

/**
 * An extension for `Scan` that focuses on the discovery of control codes (CSI).
 * @class Scan
 */
class Scan {
  constructor() {
    // A list of issues for later feedback to the console
    this.issues = []
  }
  /**
   * The entry point to look for and return any CSI controls.
   * @param [index=0] Search starting index for `codePoints`
   * @param [codePoints=[]] Array of Unicode decimal values
   * @returns CSI name and values string or `` if none was found
   */
  controlCode(index = 0, codePoints = []) {
    if (typeof codePoints !== `object`)
      CheckArguments(`codePoints`, `array`, codePoints)
    // skip saved escape and null values
    const i = parseInt(index, 10) + 2
    if (i < 2) CheckRange(`index`, `small`, `0`, index)
    // look-ahead objects that will be used with deeper scan while-loops
    // these comprise of text slices that are to be scanned for CSI controls
    const scan = {
      // for performance, set a 9 character cap for most scans
      fast: codePoints.slice(i, i + 8),
      // cap SGR scans to 48 characters, a lower value improves performance but
      // RGB values are long
      sgr: codePoints.slice(i, i + 47),
      // PabloDraw RGB 't' values are never longer than 15 characters
      rgb: codePoints.slice(i, i + 14),
    }
    const horizontalVerticalPosition = 102,
      cursorPosition = 72,
      selectGraphicRendition = 109,
      pabloDrawRGB = 116
    // look for specific CSI controls within text slices
    const find = {
      f: scan.fast.indexOf(horizontalVerticalPosition),
      H: scan.fast.indexOf(cursorPosition),
      m: scan.sgr.indexOf(selectGraphicRendition),
      t: scan.rgb.indexOf(pabloDrawRGB),
    }
    // Scan for CSI controls
    const functions = this._functions(i, codePoints)
    if (functions.length) return functions
    // Scan for PabloDraw RGB codes
    if (find.t >= 0) {
      const rgb = this._pabloDrawRGB(scan.rgb.slice(0, find.t + 1))
      if (rgb.length) return rgb
    }
    // Scan for Character Attributes (SGR) codes
    if (find.m >= 0) {
      const sgr = this._characterAttributes(i, codePoints, find.m)
      if (sgr.length) return sgr
    }
    // Scan for Horizontal & Vertical Position and Cursor Position (HVP, CUP)
    if (find.H < 0 && find.f < 0) return ``
    const notFound = -1,
      hvp = { code: ``, flag: 0, scan: notFound }
    if (find.H >= 0 && (find.f === notFound || find.H < find.f)) {
      // Scan for the letter `H` in chars, identifies CUP
      hvp.flag = cursorPosition
      hvp.scan = find.H
    } else if (find.f >= 0 && (find.H === notFound || find.f < find.H)) {
      // Scan for the letter `f` in chars, identifies HVP
      hvp.flag = horizontalVerticalPosition
      hvp.scan = find.f
    }
    // if one of the scans found an hvp.flag then process its values
    let control = true,
      loop
    if (hvp.scan > notFound) {
      loop = hvp.scan
      const semicolon = 59
      while (loop--) {
        hvp.code = codePoints[i + loop]
        // confirm scanned character is H or ; or 0-9
        switch (hvp.code) {
          case hvp.flag:
          case semicolon:
            // ignore
            break
          default:
            if (!this._digit(hvp.code)) control = false
        }
      }
      if (control) return this._cursorHVP(scan.fast.slice(0, hvp.scan))
    }
    return ``
  }
  /**
   * Look and return any functions using CSI controls.
   * @param [codePoints=[]] Array of Unicode decimal values
   * @param [index=-1] Search starting index for `codePoints`
   * @returns CSI name and values string
   */
  _functions(index = -1, codePoints = []) {
    // look-ahead code point containers
    // control sequences use multiple characters of varying length
    const peak = {
      _0: codePoints[index],
      _1: codePoints[index + 1],
      _2: codePoints[index + 2],
      _3: codePoints[index + 3],
      _4: codePoints[index + 4],
    }
    // look for digits in the code points
    const digit = {
      _0: this._digit(peak._0),
      _1: this._digit(peak._1),
      _2: this._digit(peak._2),
      _3: this._digit(peak._3),
    }
    // handle control functions with either no or fixed numeric parameters first
    // SGR - Select Graphic Rendition
    const sgr = 109 // m
    switch (sgr) {
      case peak._0: // ←[m reset to defaults
        return `SGR,1,0`
      case peak._1: // ←[1m
        if (digit._0) return `SGR,2,${String.fromCharCode(peak._0)}`
        return
      case peak._2: // ←[31m
        if (digit._0 && digit._1)
          return `SGR,3,${String.fromCharCode(peak._0)}${String.fromCharCode(
            peak._1,
          )}`
    }
    // HVP, CUP - Horizontal and vertical position and Cursor Position reset
    // this does not handle other HVP commands such as ←[1;1f
    const hvp = 102, // f
      cup = 72 // H
    switch (peak._0) {
      case hvp:
      case cup:
        return this._cursorHVP()
    }
    // CUU, CUD, CUF, CUB - Cursor up, down, forward, back
    // limited to 9999 movement places
    // uses switch statements as they are optimized by JavaScript
    switch (digit._0) {
      case true:
        switch (digit._1) {
          case true:
            switch (digit._2) {
              case true:
                switch (digit._3) {
                  case true:
                    if (this._cursorCode(peak._4))
                      // ←[1523A move thousands of places
                      return this._cursorMove(peak._4, [
                        peak._0,
                        peak._1,
                        peak._2,
                        peak._3,
                      ])
                    break
                  default:
                    if (this._cursorCode(peak._3))
                      // ←[555A move hundreds of places
                      return this._cursorMove(peak._3, [
                        peak._0,
                        peak._1,
                        peak._2,
                      ])
                }
                break
              default:
                if (this._cursorCode(peak._2))
                  // ←[60A move tens of places
                  return this._cursorMove(peak._2, [peak._0, peak._1])
            }
            break
          default:
            if (this._cursorCode(peak._1))
              // ←[5A move multiple places
              return this._cursorMove(peak._1, [peak._0])
        }
        break
      default:
        if (this._cursorCode(peak._0))
          // ←[A move 1 place
          return this._cursorMove(peak._0)
    }
    // SM, RM - Set screen mode and Reset screen mode
    const setMode = 104, // h
      resetMode = 108 // l
    const zero = 48,
      one = 49,
      two = 50,
      three = 51,
      four = 52,
      five = 53,
      six = 54,
      seven = 55,
      eight = 56,
      equal = 61,
      gt = 62,
      lt = 63
    switch (peak._3) {
      case setMode:
      case resetMode:
        if ([equal, gt, lt].includes(peak._0))
          if (peak._1 === one)
            if ([three, four, five, six, seven, eight].includes(peak._2))
              // ←[=13h 2 digit mode with a character prefix
              return this._setMode(peak._3, [peak._1, peak._2])
    }
    switch (peak._2) {
      case setMode:
      case resetMode:
        if ([equal, gt, lt].includes(peak._0))
          if (digit._1)
            // ←[?0h 1 digit mode with a character prefix
            return this._setMode(peak._2, [peak._1])
    }
    switch (peak._2) {
      case setMode:
      case resetMode:
        if (peak._0 === one)
          if ([three, four, five, six, seven, eight].includes(peak._1))
            // ←[13h 2 digit mode
            return this._setMode(peak._2, [peak._0, peak._1], false)
    }
    switch (peak._1) {
      case setMode:
      case resetMode:
        switch (digit._0) {
          case true:
            // ←[13h 1 digit mode
            return this._setMode(peak._1, [peak._0], false)
        }
    }
    // ED - Erase in page
    const eraseInPage = 74 // J
    switch (peak._0) {
      case eraseInPage:
        return `ED,1,0`
      case zero:
      case one:
      case two:
        if (peak._1 === eraseInPage)
          return `ED,2,${String.fromCharCode(peak._0)}`
    }
    // EL - Erase in line
    const eraseInLine = 75 // K
    switch (peak._0) {
      case eraseInLine:
        return `EL,1,0`
      case zero:
      case one:
      case two:
        if (peak._1 === eraseInLine)
          return `EL,2,${String.fromCharCode(peak._0)}`
    }
    const lineFeed = 10,
      saveCursorPosition = 115, // s
      restoreCursorPosition = 117 // u
    switch (peak._0) {
      case saveCursorPosition:
        // it is commonly used for handling newline breaks
        switch (peak._1) {
          case lineFeed:
            return `NULL,5`
        }
        return `SCP,1`
      case restoreCursorPosition:
        return `RCP,1`
    }
    // non-standard controls
    const questionMark = 63,
      h = 104,
      l = 108,
      q = 113
    switch (peak._0) {
      case zero:
      case one:
        // ANSI.SYS (non-standard) extended keyboard support
        // ←[0q, ←[1q
        switch (peak._1) {
          case q:
            return `/x,2,${String.fromCharCode(peak._0)}`
        }
        break
      case questionMark:
        // PabloDraw non-standard codes
        if (peak._1 === three && peak._2 === three)
          // iCE Colors (http://picoe.ca/forums/topic/need-pablodraw-ansi-escape-codes-descriptionsourcelist/)
          // ←[?33h and ←[?33l
          switch (peak._3) {
            case l: // disable
              return `ICE,0,0`
            case h: // enable
              return `ICE,0,1`
          }
    }
    return ``
  }
  /**
   * Used by `Build.arrayOfText()` to look and return specific functions using
   * CSI controls.
   * @param [sequence=[]] Array of strings containing CSI controls and values,
   * for example [`SGR`, 5, 1, 30] [`CUD`, 1, 1]
   * @returns CSI name and values string
   */
  _functionsForArray(sequence = []) {
    if (typeof sequence !== `object`)
      CheckArguments(`sequence`, `array`, sequence)
    if (sequence.length === 0) return ``
    const isXterm256 = (next1 = -1, next2 = -1) => {
      if (next1 !== xterm8bit) return false
      if (next2 < black) return false
      if (next2 > grey93) return false
      return true
    }
    const element = sequence[0],
      values = sequence.slice(1),
      count = values.length,
      cs = { value1: 0, next1: 0, value2: 0, next2: 0, name: `` },
      foreground = 38,
      background = 48,
      xterm8bit = 5,
      lineWrap = 7,
      black = 0,
      grey93 = 255
    if (count > 1) cs.value1 = parseInt(values[1], 10)
    if (count > 2) cs.value2 = parseInt(values[2], 10)
    switch (element) {
      case `RGB`:
        // make 1 = 38 & - = 48, pass on RGB values
        cs.name = `SGR+`
        if (parseInt(cs.value1) === 0) cs.name += `4`
        else cs.name += `3`
        return (cs.name += `8+2+${sequence[3]}+${sequence[4]}+${sequence[5]}`)
      case `ICE`:
        // iCE Colors
        return `${element}+${cs.value1}`
      case `CHT`: // forward tabulation
      case `CUD`: // cursor move down
      case `CUF`: // cursor move forward
      case `ED`: // erase in page
      case `EL`: // erase in line
        return `${element}+${cs.value1}`
      case `CUP`: // cursor position
      case `HVP`: // horizontal vertical positioning
        // these moves the cursor to a set of row x column coordinates
        // the cs.value1 is row, cs.value2 is column
        return `HVP+${cs.value1}+${cs.value2}`
      case `SGR`: // set graphic rendition
        cs.name = `SGR`
        // loop over array, index should start from 1 not 0
        codes: for (let i = 1; i < count; i++) {
          const value = parseInt(values[i], 10)
          // handle xterm 256 colour codes
          if ([foreground, background].includes(value) && count - i > 1) {
            cs.next1 = parseInt(values[i + 1], 10)
            cs.next2 = parseInt(values[i + 2], 10)
            if (isXterm256(cs.next1, cs.next2)) {
              cs.name += `+${value}${cs.next2}`
              i += 2
              continue codes
            }
          }
          cs.name = `${cs.name}+${value}`
        }
        return cs.name
      case `SM`: // set screen mode
      case `RM`: // reset screen mode
        if (cs.value1 === lineWrap) {
          if (element === `RM`) return `LW+0` // disable
          if (element === `SM`) return `LW+1` // enable
        }
        // all other modes
        return `SM+${cs.value1}`
      default:
        if (!this.issues.includes(`${element}`)) this.issues.push(`${element}`)
    }
    return cs.name
  }
  /**
   * Look and return any Character Attribute (SGR) `m` codes.
   * @param [index=-1] Search starting index for `codePoints`
   * @param [codePoints=[]] Array of Unicode decimal values
   * @param [loop=-1] Number of loop iterations
   * @returns CSI name and values string
   */
  _characterAttributes(index = -1, codePoints = [], loopCount = -1) {
    const m = 109,
      semicolon = 59
    let loops = loopCount,
      value = ``
    while (loops--) {
      const code = codePoints[index + loops]
      switch (code) {
        case m:
          continue
        case semicolon:
          value = `,${value}`
          break
        default:
          if (!this._digit(code)) return ``
          value = `${String.fromCharCode(code)}${value}`
      }
    }
    if (this.verbose)
      console.log(
        `Text rendition attributes found, 'SGR,${value.length + 1},${value}'`,
      )
    return `SGR,${value.length + 1},${value}`
  }
  /**
   * Is the character a Final Byte used for ANSI cursor positioning?
   * @param [codePoint=0] A Unicode decimal value
   * @returns Result
   */
  _cursorCode(codePoint = 0) {
    const ccu = 65,
      cud = 66,
      cuf = 67,
      cub = 68,
      cht = 73
    switch (parseInt(codePoint)) {
      case ccu:
      case cud:
      case cuf:
      case cub:
      case cht:
        return true
      default:
        return false
    }
  }
  /**
   * Return a CU cursor movement string sequence.
   * @param [control=0] A Unicode decimal value,
   * which should be either `65` (A) `66` (B) `67` (C) `68` (D)
   * @param [codePoints=[0]] Array of text characters in Unicode code points
   * @returns CU cursor movement string
   */
  _cursorMove(control = 0, codePoints = [0]) {
    if (typeof codePoints !== `object`)
      CheckArguments(`codePoints`, `array`, codePoints)
    // test for a valid control name
    const ctrl = parseInt(control, 10),
      name = this._cursorName(ctrl)
    if (name === ``) return ``
    let value = ``
    for (const cp of codePoints) {
      switch (cp) {
        case 0:
          // default value of 1 if no value is given
          value += `1`
          break
        default:
          value += `${String.fromCharCode(cp)}`
      }
    }
    if (this.verbose)
      console.log(`Cursor move ${value} positions ${this._cursorHuman(ctrl)}`)
    if (codePoints.length === 1 && codePoints[0] === 0)
      // no parameters are given
      return `${name},1,${value}`
    const length = codePoints.length + 1
    return `${name},${length},${value}`
  }
  /**
   * Decode Unicode code units into cursor movement controls.
   * @param [index=0] Unicode decimal value
   * @returns Cursor movement
   */
  _cursorHuman(index = 0) {
    const A = 65,
      B = 66,
      C = 67,
      D = 68,
      I = 73
    switch (parseInt(index, 10)) {
      case A:
        return `up`
      case B:
        return `down`
      case C:
        return `right`
      case D:
        return `left`
      case I:
        return `tab`
      default:
        return ``
    }
  }
  /**
   * Decode Unicode code units into ANSI cursor movement named controls.
   * @param [index=0] Unicode decimal value
   * @returns Named control sequence
   */
  _cursorName(index = 0) {
    const A = 65,
      B = 66,
      C = 67,
      D = 68,
      I = 73
    switch (parseInt(index, 10)) {
      case A:
        return `CUU`
      case B:
        return `CUD`
      case C:
        return `CUF`
      case D:
        return `CUB`
      case I:
        return `CHT`
      default:
        return ``
    }
  }
  /**
   * Return a HVP horizontal and vertical position.
   * @param [codePoints=[]] Array of text characters in Unicode code points
   * @returns `HVP,row,column` string sequence
   */
  _cursorHVP(codePoints = []) {
    if (typeof codePoints !== `object`)
      CheckArguments(`codePoints`, `array`, codePoints)
    const length = codePoints.length + 1,
      hvp = { row: ``, column: ``, mode: `m` },
      semicolon = 59
    points: for (const cp of codePoints) {
      switch (cp) {
        case semicolon:
          // if character is a semicolon ; then switch modes from
          // horizontal to vertical
          hvp.mode = `n`
          continue points
      }
      switch (hvp.mode) {
        case `n`:
          // keep concat to avoid `\n` injection
          hvp.column = hvp.column.concat(String.fromCharCode(cp))
          break
        case `m`:
          hvp.row = `${hvp.row}${String.fromCharCode(cp)}`
          break
      }
    }
    // if no values were provided then use defaults of 1
    switch (hvp.row) {
      case ``:
      case `0`:
        hvp.row = `1`
    }
    switch (hvp.column) {
      case ``:
      case `0`:
        hvp.column = `1`
    }
    if (this.verbose)
      console.log(
        `Cursor repositioned to row ${hvp.row} and column ${hvp.column}`,
      )
    return `HVP,${length},${hvp.row},${hvp.column}`
  }
  /**
   * Is the Unicode code point an ASCII digit (0...9).
   * @param [codePoint=0] Unicode decimal value
   * @returns Result
   */
  _digit(codePoint = 0) {
    const zero = 48,
      one = 49,
      two = 50,
      three = 51,
      four = 52,
      five = 53,
      six = 54,
      seven = 55,
      eight = 56,
      nine = 57
    switch (parseInt(codePoint)) {
      case zero:
      case one:
      case two:
      case three:
      case four:
      case five:
      case six:
      case seven:
      case eight:
      case nine:
        return true
      default:
        return false
    }
  }
  /**
   * Look and return any PabloDraw RGB CSI `t` codes.
   * 24-bit ANSI: http://picoe.ca/2014/03/07/24-bit-ansi/
   * @param [codePoints=[]] An array of Unicode decimal values
   * @returns CSI name and values string
   */
  _pabloDrawRGB(codePoints = []) {
    // is `value` a valid Red,Green,Blue colour range?
    const min = 0,
      max = 255,
      t = 116,
      notFound = ``
    const valid = (value) => {
      if (value < min) return false
      if (value > max) return false
      return true
    }
    const rgb = { split: [], join: `` }
    let value = ``
    points: for (const code of codePoints) {
      // remove the `t` identifier
      if (code === t) break points
      rgb.join += String.fromCharCode(code)
    }
    rgb.split = rgb.join.split(`;`)
    if (rgb.split.length !== 4) return notFound
    if ([`0`, `1`].includes(rgb.split[0]) !== true) return notFound
    // red
    if (!valid(rgb.split[1])) return notFound
    // green
    if (!valid(rgb.split[2])) return notFound
    // blue
    if (!valid(rgb.split[3])) return notFound
    value += rgb.split.join()
    return `RGB,${value.length + 1},${value}`
  }
  /**
   * Return a Set or Remove Mode string sequence.
   * This is based off the MS-DOS ANSI.SYS driver not the ECMA-48 specification.
   * @param [index=0] Unicode code point that should either be
   * `104` (h = SM) or `108` (l = RM)
   * @param [parameters=[0, 0]] Mode parameters as an array of
   * Unicode decimal values
   * @param [prefix=true] Is the code point prefixed with an ANSI.SYS compatible
   * symbol ANSI.SYS permits `=` `?` `>` i.e `←[=13h` `←[?13h` `←[>13h`
   * @returns A Set or Remove Mode string sequence
   */
  _setMode(index = 0, parameters = [0, 0], prefix = true) {
    if (parameters.length < 1)
      CheckRange(`parameter.length`, `small`, parameters.length)
    if (parameters.length > 2)
      CheckRange(`parameter.length`, `large`, parameters.length)
    if (typeof prefix !== `boolean`) CheckArguments(`prefix`, `boolean`, prefix)
    const h = 104,
      l = 108
    if (![h, l].includes(index)) return ``
    const mode = new Map()
      .set(`code`, `SM`)
      .set(`length`, parameters.length + 1)
      .set(`value`, ``)
    // code
    const codePoint = parseInt(index, 10)
    if (codePoint === l) mode.set(`code`, `RM`)
    // length
    if (prefix === true) {
      let length = mode.get(`length`)
      length++
      mode.set(`length`, length)
    }
    // value
    if (parameters.length > 1 && parameters[1] > 0)
      mode.set(
        `value`,
        `${String.fromCharCode(parameters[0])}${String.fromCharCode(
          parameters[1],
        )}`,
      )
    else mode.set(`value`, `${String.fromCharCode(parameters[0])}`)
    return `${mode.get(`code`)},${mode.get(`length`)},${mode.get(`value`)}`
  }
}

/**
 * Builds array objects containing display text and ANSI commands.
 * @class Build
 */
class Build extends Scan {
  /**
   * Creates an instance of Build.
   * @param [text=``] String of text containing ANSI escape sequences
   * @param [verbose=false] Verbose console output
   */
  constructor(text = ``, verbose = false) {
    super()
    this.text = `${text}`
    this.verbose = verbose
  }
  /**
   * This is the entry point for the Build class.
   * It converts the `this.text` string into and array of strings for further
   * processing.
   * @returns An array of strings with elements comprising of CSI items and
   * Unicode text characters
   */
  arrayOfText() {
    const decimals = this._decimals(),
      elements = [],
      issues = [],
      control = new Map()
        .set(`name`, ``)
        .set(`csi`, ``)
        .set(`joined`, ``)
        .set(`split`, [])
    const counts = {
      // number of characters to delete when cleaning control sequences from the text
      delete: 0,
      // number of loops passed, used in console.log()
      loop: 0,
      // number of control functions passed so far
      control: 0,
      // number of unsupported MS-DOS ANSI.SYS control sequences found
      err_msdos: 0,
      // number of unsupported ECMA-48 control sequences found
      err_ecma48: 0,
    }
    const unicodeArrow = 8594, // →
      msdosArrow = 26,
      placeholder = 155
    let i = decimals.length
    while (i--) {
      // current character as a Unicode decimal value
      const decimal = decimals[i]
      counts.loop++
      switch (decimal) {
        case -1:
          elements[i] = ``
          break
        case unicodeArrow:
        case msdosArrow:
          // if the last character is `→` then assume this is an
          // MS-DOS 'end of file' mark. SGR should be reset otherwise leftover
          // background colours might get displayed
          elements[i] = `SGR+0`
          break
        case placeholder:
          // handle character value 155 which is our place holder for the
          // Control Sequence Introducer `←[`
          counts.control++
          // discover if the control sequence is supported
          control.set(`joined`, this.controlCode(i, decimals))
          if (control.get(`joined`) === ``) {
            // handle unknown sequences
            issues.push(
              `Unsupported control function for array item ${i}, character #${counts.control}`,
            )
            // display all unknown controls sequences in the text that could
            // belong to the much larger ECMA-48 standard or proprietary
            // sequences introduced by terminal or drawing programs
            elements[i] = `\u241b` // `esc` control picture
            elements[i + 1] = `[`
            counts.err_ecma48++
            continue
          }
          control.set(`split`, control.get(`joined`).split(`,`))
          control.set(`name`, control.get(`split`)[0])
          counts.delete = parseInt(control.get(`split`)[1], 10)
          switch (control.get(`name`)) {
            case `CHT`:
            case `CUD`:
            case `CUF`:
            case `CUP`:
            case `ED`:
            case `EL`:
            case `HVP`:
            case `NULL`:
            case `RCP`:
            case `RGB`:
            case `SCP`:
            case `SGR`:
              // strip out supported control sequences from the text
              // value, start, end
              elements.fill(``, i + 2, counts.delete + i + 2)
              // EL (erase line) is supported except when used as an
              // erase in-line sequence
              if (
                control.get(`name`) === `EL` &&
                control.get(`split`)[2] === `1`
              ) {
                counts.err_msdos++
              }
              break
            case `ICE`:
              // strip out iCE colors control sequences
              // value, start, end
              elements.fill(``, i + 2, counts.delete + i + 6)
              break
            case `CUB`: // cursor back
            case `CUU`: // cursor up
            case `RM`: // restore cursor position
            case `/x`: // ansi.sys device driver to remap extended keys
              // flag this as an unsupported control sequence
              counts.err_msdos++
            //fallthrough
            case `SM`:
              // save cursor position
              // don't flag this as an unsupported control sequence as it
              // creates false positives in some art
              // strip out unsupported control sequences from the text
              if (counts.delete > 0)
                // value, start, end
                elements.fill(``, i + 2, counts.delete + i + 2)
              break
            // the default case should not be needed as all unknown sequences
            // should have previously been handled
          }
          // humanise control sequence introducer
          control.set(`csi`, this._functionsForArray(control.get(`split`)))
          // merge results into the array
          elements[i] = control.get(`csi`)
          // handle any formatting triggers
          switch (control.get(`csi`)) {
            case `ICE+0`:
              ecma48.iceColors = false
              break
            case `ICE+1`:
              ecma48.iceColors = true
              break
            case `LW+0`:
              sgrObject.lineWrap = false
              break
            case `LW+1`:
              sgrObject.lineWrap = true
              break
          }
          break
        default:
          // parse characters for display. convert the Unicode decimal character
          // value into a UTF-16 text string
          elements[i] = `${String.fromCharCode(decimal)}`
      }
      // end of while-loop
    }
    // browser console parse error feedback
    if (issues.length > 0) {
      console.groupCollapsed(`EMCA-48/ANSI issues, %s total:`, issues.length)
      for (const issue of issues) {
        console.info(issue)
      }
      console.groupEnd()
    }
    if (this.issues.length) {
      let noun = `type`
      if (this.issues.length > 1) noun += `s`
      console.log(
        `%d unsupported ${noun} of control sequence in use: ${this.issues}.`,
        this.issues.length,
      )
    }
    ecma48.other = counts.err_msdos
    ecma48.unknown = counts.err_ecma48
    return this._clean(elements)
  }
  /**
   * Filters unwanted elements from an array non-string types and empty strings.
   * @param [elements=[]] An array of strings
   * @returns An array of strings
   */
  _clean(elements = []) {
    return elements.filter((value) => {
      return typeof value === `string` && value.length !== 0
    })
  }
  /**
   * This is a function of `arrayOfText()` that takes `this.text` containing
   * plain text with ANSI/ECMA-48 encoding and splits it into an array of
   * Unicode decimal values.
   *
   * Performance for comparison and manipulation is faster using arrays or
   * numeric values than it is using `String` functions. While loops
   * are generally the faster than other loop types but only operate in reverse.
   * @returns An array of Unicode decimal values
   */
  _decimals() {
    const d0 = new Date().getTime(),
      string = this.text,
      leftSquareBracket = 91,
      placeholder = 155,
      unicodeLeftArrow = 8592
    let i = string.length
    // for performance, create a new array with the expected number of elements
    const decimals = new Array(i)
    // iterate through the loop and apply fixes, while loops are performant
    // and JS engines can compile switch/case conditions
    while (i--) {
      const code = string.charCodeAt(i),
        _code = string.charCodeAt(i - 1),
        code_ = string.charCodeAt(i + 1)
      switch (code) {
        case unicodeLeftArrow:
          // when the characters `←[` are found in sequence
          // ←[ is a CSI Control Sequence Introducer
          switch (code_) {
            case leftSquareBracket:
              // we will use this value as an identifier to mark the
              // `←[` introducer
              decimals[i] = placeholder
              continue
          }
          break
        case leftSquareBracket:
          // if `[` is found and the previous character is `←` (escape) then
          // nullify it, as later on iterating and skipping over -1 values are
          // much faster than modifying the array
          switch (_code) {
            case unicodeLeftArrow:
              decimals[i] = -1
              continue
          }
          break
      }
      decimals[i] = code
    }
    if (this.verbose) {
      const d1 = new Date().getTime()
      console.log(
        `Time taken to process Build._decimals(): ${d1 - d0} milliseconds`,
      )
    }
    return decimals
  }
}

/*global CheckArguments CheckError CheckRange */
