// filename: parse_ansi.js
//
// These functions are to handle ANSI and ECMA-48 control functions embedded
// into the text.
//
// The common online name is ANSI but it is an ambiguous term.
// ANSI (American National Standards Institute) is just a standards body who
// published numerous computer text standards.
//
// The term 'ANSI art' probably came about thanks to Microsoft misnaming their
// limited MS-DOS driver ANSI.SYS.
//
// ANSI art usually refers to these identical standards.
// ISO 6429 - "Control functions for 7-bit and 8-bit coded character sets"
// ECMA 48 - "Control Functions for Coded Character Sets"
//
// ISO/IEC 6429
// http://www.iso.org/iso/home/store/catalogue_tc/catalogue_detail.htm?csnumber=12781 (paid)
// ECMA-48
// http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-048.pdf (free)
// ANSI X3.64 (withdrawn in 1997)
// https://www.nist.gov/sites/default/files/documents/itl/Withdrawn-FIPS-by-Numerical-Order-Index.pdf
// Microsoft ANSI.SYS (MS-DOS implementation with selective compliance)
// https://msdn.microsoft.com/en-us/library/cc722862.aspx
// XTerm Control Sequences
// https://invisible-island.net/xterm/ctlseqs/ctlseqs.html

/*
  JavaScript Performance Tips:
  + Prefer switch over if-then-else conditionals as they can be optimised during
    compile time.
  + Don't initialise ES6 `let` and `const` within loops, 
    see https://github.com/vhf/v8-bailout-reasons/pull/10
  + To permit compile-time optimisation `const` declarations need to be at the
    top of the function.
  + Use x = `${x}newText` instead of x.concat(`newText`),
    see http://jsperf.com/concat-vs-plus-vs-join
  + Use reference types (arrays, objects) instead of 'primitive' strings, bool,
    integers variable for large values. As it can save on browser RAM usage, the
    use of domObject{html:``} instead of ecma48HTML = `` saw a 5-20%(!)
    reduction for the BuildEcma48() memory footprint.
    https://www.linkedin.com/pulse/25-techniques-javascript-performance-optimization-steven-de-salas
  + Don't combine different datatypes in large sets such as arrays.
    If an array contains number elements do not mix-in null or undefined values,
    instead use -1 or NaN. The same goes for an array of strings, use an empty
    element `` instead of null or undefined values.
    https://ponyfoo.com/articles/javascript-performance-pitfalls-v8
*/
/*eslint no-useless-escape: "warn"*/

"use strict"

if (typeof module === `object`) {
  module.exports.Controls = (text, verbose) => {
    const sauce = { version: `` }
    return new Controls(text, sauce, verbose)
  }
}

/**
 * The entry point for ANSI and ECMA-48 control sequence interpretation.
 * This receives control sequence embedded Unicode text and outputs it to HTML5
 * elements.
 * @class ANSI
 */
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
    reset(`ecma48`)
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
    this.text = this.hideEntities()
    this.text = this.cleanSequences()
    // Parse sequences and insert the generated HTML into the DOM object
    const html = new HTML()
    // Convert text into Unicode decimal encoded numbers
    html.sequences = new Build(`${this.text}`).arrayOfText()
    html.lineWrap = this.lineWrap
    html.build()
    // Pass-on these ANSI/ECMA48 statistics and toggles
    this.otherCodesCount = ecma48.other
    this.rows = cursor.row
    this.unknownCount = ecma48.unknown
    // Pass-on these ANSI/ECMA48 toggles
    this.colorDepth = ecma48.colorDepth
    this.columns = cursor.maxColumns
    this.font = sauce.font
    if (this.font.length === 0) this.font = this.parseFont(ecma48.font)
    this.iceColors = ecma48.iceColors
    // Pass-on these HTML elements combined as a string
    this.htmlString = domObject.html
    // empty these containers to reduce browser memory usage
    this.sauce = {}
    this.text = ``
    domObject.html = ``
    reset(`cursor`)
    reset(`ecma48`)
    reset(`sgr`)
  }

  /**
   * Hide HTML entities that break the formatting of ANSI documents.
   * @returns String of text with ⮘⮙⮚ placeholders
   */
  hideEntities() {
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
  cleanSequences() {
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
  parseFont(font = 10) {
    switch (parseInt(font, 10)) {
      case 10:
        // use Option selection
        return null
      case 20:
        // gothic font (not implemented due to a lack of a suitable font)
        return null
      case 11:
        return `bios`
      case 12:
        return `cga`
      case 13:
        return `cgathin`
      case 14:
        return `amiga`
      case 15:
        return `ega9`
      case 16:
        return `ega8`
      case 17:
        return `vga8`
      case 18:
        return `vga9`
      case 19:
        return `mda`
    }
  }
}

/**
 * Creates a object that is used for tracking the active cursor position.
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
    this.init()
  }

  /**
   * Initialise this class.
   */
  init() {
    try {
      if (
        typeof localStorage !== `undefined` &&
        localStorage.getItem(`textAnsiWrap80c`) === `false`
      )
        // set maxColumns to 0 to disable
        this.maxColumns = 0
    } catch (e) {
      // if localStorage fails then it doesn't matter as `maxColumns` var
      // has previously been set to 80
    }
  }

  /**
   * Resets the cursor data container using the constructor defaults
   * @param [old={}] Data container object
   */
  async reset(old = {}) {
    for (const key in this) {
      old[key] = this[key]
    }
  }

  /**
   * Creates white space to simulate a cursor position forward request.
   * As such the white space should not have any presentation controls applied
   * to it such as background colours.
   * @param [places=1] The number of places to move, if 0 then build to the end
   * of the line
   */
  async columnElement(places = 1) {
    const move = parseInt(places, 10)
    if (isNaN(move)) return null
    if (move < 0) CheckRange(`places`, `small`, `0`, move)
    const position = () => {
      if (move === 0) {
        if (cursor.column === 1) return cursor.maxColumns
        if (cursor.maxColumns > 0) return cursor.maxColumns - cursor.column
      }
      return move
    }
    const count = position()
    const end = cursor.column + count - 1
    const element = italicElement()
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
    if (isNaN(track)) return null
    if (track < 0) CheckRange(`count`, `small`, `0`, track)
    switch (track) {
      case 0:
        cursor.column = 1
        break
      default:
        cursor.column = cursor.column + track
        if (cursor.maxColumns !== 0 && cursor.column > cursor.maxColumns) {
          // reached the end of line so start a new line
          cursor.previousRow++
          this.rowElement(1)
        }
    }
  }

  /**
   * Create line break tag to simulate a cursor position down request.
   * @param [count=1] The number of places to move
   * @param [columns=0] If set to 1 or greater then also reposition the cursor
   * forward by this many places
   */
  async rowElement(count = 1, columns = 0) {
    const move = parseInt(count, 10)
    const cols = parseInt(columns, 10)
    if (isNaN(move)) return null
    if (isNaN(cols)) return null
    if (move < 1) CheckRange(`count`, `small`, `1`, move)
    if (cols < 0) CheckRange(`columns`, `small`, `0`, cols)
    const element = italicElement()
    cursor.previousRow = cursor.row
    for (let i = 0; i < move; i++) {
      cursor.row++
      // reset columns
      this.columnParse(0)
      // display a newline symbol at the end of the row
      //domObject.html += `↵▌`
      domObject.html += `</i></div><div id="row-${cursor.row}">${element}`
    }
    // always build columns AFTER rows and outside of the loop
    if (cols > 0) this.columnElement(cols)
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
    this.colorF = 37
    this.colorB = 40
    this.rgbF = ``
    this.rgbB = ``
  }

  /**
   * Resets the cursor data container using the `constructor()` defaults.
   * @param [old={}] Data container object
   */
  async reset(old = {}) {
    for (const key in this) {
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
   * @colorDepth  Colour depth override if a set/reset mode CSI has requested it
   * @font        CSS class values SGR10…20, see text_ecma_48.css for the
   * different font-family values
   * @iceColors   iCE Color mode which replaces SGR5/6 CSS blink methods with
   * alternative background colours
   */
  constructor() {
    this.other = 0
    this.unknown = 0
    this.colorDepth = 4
    this.font = 10
    this.iceColors = false
  }

  /**
   * Resets the cursor data container using the `constructor()` defaults.
   * @param [old={}] Data container object
   */
  async reset(old = {}) {
    for (const key in this) {
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
const cursor = new Cursor()
const ecma48 = new Statistics()
const sgrObject = new SGR()
const domObject = new Dom()

/**
 * Constructs an <i> element based on the current styles and classes in use.
 * @param [parameters=``] SGR parameter values or ANSI.SYS text attributes,
 * for example `SGR+31` `SGR+0+1+31`
 * @returns Open italic element as a string
 */
function italicElement(parameters = ``) {
  const sgr = new CharacterAttributes(`${parameters}`)
  const style = sgr.createRGBStyle()
  const css = sgr.createSGRClass(parameters)
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
async function reset(name = ``) {
  let data = {}
  switch (name) {
    case `cursor`:
      data = new Cursor()
      return data.reset(cursor)
    case `ecma48`:
      data = new Statistics()
      return data.reset(ecma48)
    case `sgr`:
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
    // bold/intense foreground
    const fg = this.toggles.colorF
    if (this.toggles.rgbF.length === 0) {
      if (this.toggles.bold && fg !== 38 && fg >= 30 && fg <= 39)
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
    // alternative fonts, values 11…19, 20 is reserved for a Gothic font
    // value 10 is the primary (default) font
    // see `css/text_ecma_48.css` for the fonts
    if (ecma48.font > 10 && ecma48.font <= 20) css += ` SGR${ecma48.font}`
    return css.trim()
  }

  /**
   * Creates CSS style properties based on SGR sequences for use
   * with <i> elements, which are needed for RGB 24-bit colours.
   * @returns A collection of CSS RGB style properties or an empty string
   */
  createRGBStyle() {
    const parameters = this.parameters
    const values = parameters.split(`+`)
    // forward loop as multiple codes together have compound effects
    let value = -1
    for (const parameter of values) {
      value = parseInt(parameter, 10)
      if (isNaN(value) === true) continue // error
      if (value === 0 && parameters !== `ICE+0`) {
        if (this.verbose) console.info(`dataSGR()`)
        reset(`sgr`)
      }
      this.value = value
      this.values = values
      // handle colour values
      switch (ecma48.colorDepth) {
        case 1:
          // if color depth is 1-bit then ignore SGR color values
          break
        default:
          // look for and convert aixterm 3-bit colour values to standard 3-bit
          // otherwise sets value to be a standard SGR colour
          value = this.aixterm()
          switch (value) {
            // handle RGB colours
            case 38:
            case 48:
              switch (values[2]) {
                case `2`:
                  ecma48.colorDepth = 24
                  this.styles = this.rgb()
                  break
              }
              break
            default:
              // checks for both standard ANSI foreground/background colours
              // as well as xterm 8-bit colours
              this.setForeground()
              this.setBackground()
          }
      }
      // handle presentation options
      this.presentation()
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
  aixterm() {
    let value = parseInt(this.value, 10)
    if (isNaN(value)) return null
    if (value >= 90 && value <= 97) {
      this.toggles.bold = true
      // change value to a standard SGR value
      this.value = value - 60
    } else if (value >= 100 && value <= 107) {
      this.toggles.blinkSlow = true
      this.value = value - 60
    }
    return this.value
  }

  /**
   * Sets the background color (SGR 40-49, Xterm 8-bit).
   * @returns Background color detected
   */
  setBackground() {
    const value = parseInt(this.value, 10)
    const xtermValue = this.xtermBG()
    if ((value >= 40 && value <= 49) || xtermValue) {
      this.toggles.rgbB = ``
      // flag Xterm 256 color
      if (xtermValue && typeof ecma48.colorDepth === `number`)
        ecma48.colorDepth = 8
      this.toggles.colorB = value
      // permit the use of 24-bit RGB foregrounds with 3
      // or 8-bit background colours
      if (this.toggles.rgbF.length > 0) this.styles = this.toggles.rgbF
      // return positive result
      return true
    }
    return false
  }

  /**
   * Sets the foreground color (SGR 30-39, Xterm 8-bit).
   * @returns Foreground color detected
   */
  setForeground() {
    const value = parseInt(this.value, 10)
    const xtermValue = this.xtermFG()
    if ((value >= 30 && value <= 39) || xtermValue) {
      this.toggles.rgbF = ``
      // flag Xterm 256 color
      if (xtermValue && typeof ecma48.colorDepth === `number`)
        ecma48.colorDepth = 8
      this.toggles.colorF = value
      // permit the use of 24-bit RGB backgrounds with 3
      // or 8-bit foreground colours
      if (this.toggles.rgbB.length > 0) this.styles = this.toggles.rgbB
      // return positive result
      return true
    }
    return false
  }

  /**
   * 24-bit RGB colours toggled by the SGR `2` value.
   * @returns CSS RGB color styles
   */
  rgb() {
    const values = this.values
    const red = parseInt(values[3], 10)
    const green = parseInt(values[4], 10)
    const blue = parseInt(values[5], 10)
    if (
      red >= 0 &&
      red <= 255 &&
      green >= 0 &&
      green <= 255 &&
      blue >= 0 &&
      blue <= 255
    ) {
      // reset colours
      values[2] = values[3] = values[4] = values[5] = null
      switch (parseInt(this.value, 10)) {
        case 38:
          this.toggles.rgbF = `color:rgb(${red},${green},${blue});`
          if (this.toggles.rgbB.length > 0)
            this.styles += this.toggles.rgbF + this.toggles.rgbB
          else this.styles += this.toggles.rgbF
          break
        case 48:
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
  xtermBG() {
    const value = parseInt(this.value, 10)
    if (value >= 480 && value <= 489) return true
    if (value >= 4810 && value <= 4899) return true
    if (value >= 48100 && value <= 48255) return true
    return false
  }

  /**
   * Detect Xterm 256 foreground code.
   * @returns Result
   */
  xtermFG() {
    const value = parseInt(this.value, 10)
    if (value >= 380 && value <= 389) return true
    if (value >= 3810 && value <= 3899) return true
    if (value >= 38100 && value <= 38255) return true
    return false
  }

  /**
   * Toggle presentation flags.
   */
  presentation() {
    const value = parseInt(this.value, 10)
    switch (value) {
      case 1:
        // `!this.` switches the existing Boolean value
        // do not use return (this.toggles.bold = !this.toggles.bold)
        // as the `this.toggles.bold` value will not be updated
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
        // toggle font not Gothic
        if (ecma48.font === 20) ecma48.font = 10
        break
      case 24:
        this.toggles.underline = false
        this.toggles.underlineX2 = false
        break
      case 25:
        this.toggles.blinkSlow = false
        this.toggles.blinkFast = false
        break
      // case 26 is reserved
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
        if (value >= 10 && value <= 20) ecma48.font = value
    }
  }
}

/**
 * Applies presentation classes into small `<i>` elements. In HTML4 these
 * elements were simply italic styles but in HTML5 they can "represent a range
 * of text that is set off from the normal text for some reason".
 * @class HTML
 */
class HTML {
  /**
   * Creates an instance of HTML.
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
      value: ``
    }
  }

  /**
   * The entry point to the `HTML` class. It uses `this.sequences` to build and
   * return HTML elements.
   */
  build() {
    this.clean()
    // determine the first row by looking ahead 100 characters
    const htmlSlice = domObject.html.slice(0, this.maxLength)
    const row1 = {
      start: htmlSlice.startsWith(`<div id="row-1"`),
      index: htmlSlice.indexOf(`<div id="row-1"`, 0)
    }
    const item = this.item
    let row = 0
    for (item.value of this.sequences) {
      row += 1
      // handle items
      switch (item.value.length) {
        case 0:
          continue
        case 1:
          // 1 byte values are individual characters to display
          this.specialMarker(item.value)
          break
        default:
          // multibyte values are control sequences
          this.parseNamedSequence(row, item.value)
      }
      // handle the first row HTML
      if (item.row1 === false && row1.start === false && row1.index === -1) {
        if ([`ICE+1`, `ICE+0`].includes(this.sequences[0]))
          domObject.html = `<div id="row-1">`
        else {
          this.item = item
          domObject.html = `<div id="row-1">${this.element_i()}${
            domObject.html
          }`
        }
        item.row1 = true
        continue
      }
      if (row <= 2 && domObject.html.startsWith(`<div id="row-1"></i>`)) {
        // handle malformed tags due to iCE Color triggers
        domObject.html = domObject.html.replace(
          `<div id="row-1"></i>`,
          `<div id="row-1">`
        )
        continue
      }
    }
    // Clean up empty elements before the browser render
    const emptySpan = new RegExp(
      /<i class="SGR[1]?3[0-9][0-9]* SGR4[0-9][ SGR\d+\d*]*"><\/i>/g
    )
    const emptyRow = new RegExp(/<div id="row-(\d+)"><\/div>/g)
    domObject.html = domObject.html
      .replace(emptySpan, ``)
      .replace(emptyRow, `<div id="row-$1"><br></div>`)
    // Smear block characters on Windows platforms
    domObject.html = this.tagBlockCharacters(`${domObject.html}`)
    // close any opened tags
    this.closeElements()
    // apply erase lines
    this.eraseLines()
  }

  /**
   * Filters out newline characters from `this.sequences`.
   */
  clean() {
    switch (this.lineWrap) {
      case false:
        this.sequences = this.sequences.filter(value => {
          return value !== `\n`
        })
        break
    }
  }

  /**
   * Parses the DOM and closes any opened elements.
   */
  closeElements() {
    // regex for HTML modifications
    //const emptyTags = new RegExp(/<i class="SGR(\d+) SGR(\d+)"><\/i>\n/gi)
    const insSpace = new RegExp(
      /<div id="row-(\d+)"><i class="SGR(\d+) SGR(\d+)"><\/i><\/div>/gi
    )
    const dom = domObject
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
              // NOTE: THIS FAILS with
              // <div id="row-1"><i class="SGR37 SGR40"></i></div>
              case true:
                // close opened <i> elements
                dom.html = `${dom.html.slice(0, -6)}</i></div>`
            }
        }
    }
    // force browsers to show empty rows by injecting a single space character
    // note: there is an intentional empty space between the italic element
    dom.html = dom.html.replace(
      insSpace,
      `<div id="row-$1"><i class="SGR$2 SGR$3"> </i></div>`
    )
  }

  /**
   * Create and return an `<i>` element.
   * @returns Open italic element
   */
  element_i() {
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
  eraseLines() {
    for (let line of cursor.eraseLines) {
      // lines rows start with a value 1 (not 0)
      line++
      const regExp = new RegExp(`<div id="row-${line}">`, `i`)
      domObject.html = domObject.html.replace(
        regExp,
        `<div id="row-${line}" class="ED">`
      )
    }
  }

  /**
   * Parse control named sequences.
   * @param [row=0] Current forwardLoop() row count
   * @param [item=``] A control code, character or `null`
   */
  parseNamedSequence(row = 0, item = ``) {
    if (typeof item !== `string`) CheckArguments(`item`, `string`, item)
    if (item.length < 1) CheckRange(`item`, `length`, `1`, item)
    row = parseInt(row, 10)
    function parseItem() {
      const item = items[2]
      if (typeof item !== `undefined`) return parseInt(item, 10)
      return 0
    }
    // obtain control name
    const control = item.slice(0, 3)
    const items = item.split(`+`)
    const item1 = parseInt(items[1], 10)
    const item2 = parseItem()
    switch (control) {
      case `CUD`:
        // cursor down
        if (item1 > 0) cursor.rowElement(item1)
        break
      case `CHT`:
      case `CUF`:
        // forward tabulation
        // cursor forward
        if (item1 > 0) {
          let movement = item1
          // each forward tabulation value is set as 4 spaces
          if (control === `CHT`) movement = movement * 4
          const sum = movement + cursor.column
          switch (cursor.maxColumns) {
            case 0:
              // no hard wrap
              cursor.columnElement(movement)
              break
            default:
              // when columns is less than or equals to the maximum columns
              if (sum <= cursor.maxColumns) cursor.columnElement(movement)
              // previously the `CUF` control was ignored if it went over the
              // maximum columns. instead this creates a new row and continues
              // the cursor forward
              else cursor.rowElement(1, sum - cursor.maxColumns - 1)
          }
        }
        break
      case `HVP`:
        // horizontal vertical position (HVP)
        // RetroTxt doesn't support the upward movement of the cursor
        if (item1 < cursor.row) {
          ecma48.other++
          break
        }
        // set the previous row
        cursor.previousRow = cursor.row
        // RetroTxt doesn't support the backward movement of the cursor
        if (item1 === cursor.row && item2 < cursor.column) {
          ecma48.other++
          break
        }
        // downward cursor position
        if (item1 > cursor.row) {
          // HVP values are cursor coordinates while the `rowElement(columns)`
          // parameter is a forward movement value, so the `item2` value needs
          // to lose 1 total (item2-1).
          // `HVP+1+50` means go to row 1, start at column 1 and move 49 places
          const moveFwd = item2 - 1
          const moveDown = item1 - cursor.row
          cursor.rowElement(moveDown, moveFwd)
          break
        }
        // forward cursor position when exceeding maximum columns
        // this will create a new row and continue the forward movement
        if (item2 > cursor.maxColumns) {
          const moveFwd = item2 - cursor.maxColumns - 1
          cursor.rowElement(1, moveFwd)
          break
        }
        // forward cursor position
        if (item2 > cursor.column) {
          let moveFwd = null
          if (cursor.column > 1) moveFwd = item2 - cursor.column
          else moveFwd = item2 - 1
          cursor.columnElement(moveFwd)
          break
        }
        break
      case `ICE`:
        // iCE Colors
        switch (item1) {
          case 0:
            ecma48.iceColors = false
            break
          case 1:
            ecma48.iceColors = true
            break
        }
        break
      case `SGR`:
        // character attributes
        if (row >= 1) {
          const itag = italicElement(item)
          domObject.html += `</i>${itag}`
        }
        break
      case `ED+`:
        // erase in page
        switch (item1) {
          case 0:
            // erase from cursor to end of the screen (-ANSI.SYS)
            // [incomplete, currently just goes to the end of the line]
            cursor.columnElement(0)
            break
          case 1:
          case 2:
            // fix for issue https://github.com/bengarrett/RetroTxt/issues/25
            if (cursor.row >= 1 && cursor.column > 1) {
              // erase all lines to current row using ES6 range 1...current row
              // the `Set` is used to remove duplicate rows
              cursor.eraseLines = [...new Set(Array(cursor.row).keys())]
            }
            break
        }
        break
      case `EL+`:
        // erase in line
        switch (item1) {
          case 0:
            // go to end of the line
            cursor.columnElement(0)
            break
          case 1:
            // [not supported]
            // clear from cursor to the beginning of the line (-ANSI.SYS)
            break
          case 2:
            // erase line (-ANSI.SYS)
            if (cursor.row < 1) break
            cursor.eraseLines.push(cursor.row - 1)
            break
        }
        break
      case `SM+`:
        // set modes (non-standard MS-DOS ANSI.SYS)
        this.parseNamedSetMode(parseInt(item1))
        ecma48.colorDepth = this.colorDepth
        ecma48.font = this.font
        ecma48.maxColumns = this.maxColumns
        break
      case `LW+`:
        break
      default:
        console.warn(
          `parseNamedSequence() tried to parse this unknown control '${item}'`
        )
    }
  }

  /**
   * Parse Set Mode sequence.
   * @param [parameter=-1] Set Mode number value between `0` and `19`
   */
  parseNamedSetMode(parameter = -1) {
    const value = parseInt(parameter, 10)
    if (value < 0) CheckRange(`parameter`, `small`, `0`, parameter)
    if (value > 19) CheckRange(`parameter`, `large`, `19`, parameter)
    this.colorDepth = -1
    this.font = -1
    this.maxColumns = 80
    // default set mode values
    const values = [`4-bit`, `VGA`, `80`]
    // set colour depth
    switch (value) {
      case 0:
      case 2:
      case 15:
      case 17:
        // case 5:
        // case 6:
        this.colorDepth = 1
        values[0] = `1-bit`
        break
      case 5:
      case 6:
        this.colorDepth = 0
        values[0] = `4-bit monochrome`
        break
      case 1:
      case 3:
      case 4:
        this.colorDepth = 2
        values[0] = `2-bit`
        break
      case 13:
      case 14:
      case 16:
      case 18:
        this.colorDepth = 4
        values[0] = `4-bit`
        break
      case 19:
        this.colorDepth = 8
        values[0] = `8-bit [unsupported]`
        break
    }
    // set resolution (in our HTML/CSS output we only switch fonts)
    switch (value) {
      case 2:
        this.font = 19
        break
      case 0:
      case 1:
      case 4:
      case 5:
      case 13:
      case 19:
        // MDA font 80×25
        this.font = 12
        break
      case 6:
      case 14:
        // CGA font
        this.font = 13
        break
      case 3:
      case 15:
      case 16:
        // CGA higher resolution
        this.font = 15
        break
      case 17:
      case 18:
        // VGA font
        this.font = 17
        break
    }
    // number of columns
    if (value === 0 || value === 1) this.maxColumns = 40
    console.info(
      `Set mode applied, ${values[0]} ${values[1]} in ${values[2]} columns mode`
    )
  }

  /**
   * Parse and replace any special markers with HTML entities.
   * Otherwise append the text character to `domObject.html`.
   * @param [mark=``] Character as string
   * @returns String of HTML elements
   */
  specialMarker(mark = ``) {
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
   * elements and tags them with <b></b> elements for additional CSS styling.
   * This is to prevent the Windows operating system issue where multiple block
   * characters in sequence introduce very noticeable line artefacts that can ruin
   * the display of ANSI art.
   * The CSS modification can be found in ``.
   * @param [html=``] string
   */
  tagBlockCharacters(html = ``) {
    if (FindOS() !== `win`) return html
    const config = localStorage.getItem(`textSmearBlocks`) || `false`
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
    const cappedWidth = 9999
    const data = this.data
    let info = ``
    let width = -1
    let iceColors = -1
    switch (data.version) {
      case `00`:
        if (data.configs.fontFamily.length > 0) {
          // fontFamily returns a lowercase short name
          // this gets parsed by `getECMA48()` in `retrotxt.js`
          // it expects a string
          this.font = `${data.configs.fontFamily}`
        }
        // override column width
        width = parseInt(data.configs.width, 10)
        // handle corrupted or missing width data
        if (isNaN(width)) width = 80
        console.log(`Determined column width`, width)
        if (width <= cappedWidth) cursor.maxColumns = width
        else {
          cursor.maxColumns = cappedWidth
          console.info(`Maximum column width capped at ${cappedWidth}`)
        }
        // override iCE Colors
        iceColors = parseInt(data.configs.iceColors, 10)
        if (iceColors === 1) ecma48.iceColors = true
        else ecma48.iceColors = false
        // console feedback
        info += `\nFont: ${data.configs.fontName}`
        info += `\niCE Colors: ${ecma48.iceColors}`
        info += `\nLetter Spacing: ${data.configs.letterSpacing}`
        info += `\nANSI Flags: ${data.configs.flags}`
        console.groupCollapsed(`SAUCE Configuration`)
        console.log(info)
        console.groupEnd()
        break
      default:
        if (
          typeof localStorage !== `undefined` &&
          localStorage.getItem(`textAnsiIceColors`) === `true`
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
      rgb: codePoints.slice(i, i + 14)
    }

    // look for specific CSI controls within text slices
    const find = {
      // Horizontal and Vertical Position
      f: scan.fast.indexOf(102),
      // Cursor Position
      H: scan.fast.indexOf(72),
      // Select Graphic Rendition
      m: scan.sgr.indexOf(109),
      // PabloDraw RGB code
      t: scan.rgb.indexOf(116)
    }

    // Scan for CSI controls
    const functions = this.functions(i, codePoints)
    if (functions.length) return functions
    // Scan for PabloDraw RGB codes
    if (find.t >= 0) {
      const rgb = this.pabloDrawRGB(scan.rgb.slice(0, find.t + 1))
      if (rgb.length) return rgb
    }
    // Scan for Character Attributes (SGR) codes
    if (find.m >= 0) {
      const sgr = this.characterAttributes(i, codePoints, find.m)
      if (sgr.length) return sgr
    }
    // Scan for Horizontal & Vertical Position and Cursor Position (HVP, CUP)
    if (find.H >= 0 || find.f >= 0) {
      const hvp = { code: ``, flag: 0, scan: -1 }
      if (find.H >= 0 && (find.f === -1 || find.H < find.f)) {
        // Scan for the letter `H` in chars, identifies CUP
        hvp.flag = 72
        hvp.scan = find.H
      } else if (find.f >= 0 && (find.H === -1 || find.f < find.H)) {
        // Scan for the letter `f` in chars, identifies HVP
        hvp.flag = 102
        hvp.scan = find.f
      }
      // if one of the scans found an hvp.flag then process its values
      let control = true
      let loop = -1
      if (hvp.scan > -1) {
        loop = hvp.scan
        while (loop--) {
          hvp.code = codePoints[i + loop]
          // confirm scanned character is H or ; or 0-9
          switch (hvp.code) {
            case hvp.flag:
            case 59:
              // don't match these two cases
              break
            default:
              if (!this.digit(hvp.code)) control = false
          }
        }
        if (control) return this.cursorHVP(scan.fast.slice(0, hvp.scan))
      }
    }
    return ``
  }

  /**
   * Look and return any functions using CSI controls.
   * @param [codePoints=[]] Array of Unicode decimal values
   * @param [index=-1] Search starting index for `codePoints`
   * @returns CSI name and values string
   */
  functions(index = -1, codePoints = []) {
    // look-ahead code point containers
    // control sequences use multiple characters of varying length
    const peak = {
      _0: codePoints[index],
      _1: codePoints[index + 1],
      _2: codePoints[index + 2],
      _3: codePoints[index + 3],
      _4: codePoints[index + 4]
    }
    // look for digits in the code points
    const digit = {
      _0: this.digit(peak._0),
      _1: this.digit(peak._1),
      _2: this.digit(peak._2),
      _3: this.digit(peak._3)
    }
    // handle control functions with either no or fixed numeric parameters first
    // SGR - Select Graphic Rendition
    switch (109) {
      case peak._0:
        // ←[m reset to defaults
        return `SGR,1,0`
      case peak._1:
        // ←[1m
        if (digit._0) return `SGR,2,${String.fromCharCode(peak._0)}`
        break
      case peak._2:
        // ←[31m
        if (digit._0 && digit._1)
          return `SGR,3,${String.fromCharCode(peak._0)}${String.fromCharCode(
            peak._1
          )}`
    }
    // HVP, CUP - Horizontal and vertical position and Cursor Position reset
    // this does not handle other HVP commands such as ←[1;1f
    switch (peak._0) {
      case 72:
      case 102:
        // match ←[H and ←[f
        return this.cursorHVP()
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
                    if (this.cursorCode(peak._4))
                      // ←[1523A move thousands of places
                      return this.cursorMove(peak._4, [
                        peak._0,
                        peak._1,
                        peak._2,
                        peak._3
                      ])
                    break
                  default:
                    if (this.cursorCode(peak._3))
                      // ←[555A move hundreds of places
                      return this.cursorMove(peak._3, [
                        peak._0,
                        peak._1,
                        peak._2
                      ])
                }
                break
              default:
                if (this.cursorCode(peak._2))
                  // ←[60A move tens of places
                  return this.cursorMove(peak._2, [peak._0, peak._1])
            }
            break
          default:
            if (this.cursorCode(peak._1))
              // ←[5A move multiple places
              return this.cursorMove(peak._1, [peak._0])
        }
        break
      default:
        if (this.cursorCode(peak._0))
          // ←[A move 1 place
          return this.cursorMove(peak._0)
    }
    // SM, RM - Set screen mode and Reset screen mode
    switch (peak._3) {
      case 104:
      case 108:
        if ([61, 62, 63].includes(peak._0))
          if (peak._1 === 49)
            if ([51, 52, 53, 54, 55, 56].includes(peak._2))
              // ←[=13h 2 digit mode with a character prefix
              return this.setMode(peak._3, [peak._1, peak._2])
    }
    switch (peak._2) {
      case 104:
      case 108:
        if ([61, 62, 63].includes(peak._0))
          if (digit._1)
            // ←[?0h 1 digit mode with a character prefix
            return this.setMode(peak._2, [peak._1])
    }
    switch (peak._2) {
      case 104:
      case 108:
        if (peak._0 === 49)
          if ([51, 52, 53, 54, 55, 56].includes(peak._1))
            // ←[13h 2 digit mode
            return this.setMode(peak._2, [peak._0, peak._1], false)
    }
    switch (peak._1) {
      case 104:
      case 108:
        switch (digit._0) {
          case true:
            // ←[13h 1 digit mode
            return this.setMode(peak._1, [peak._0], false)
        }
    }
    // ED - Erase in page
    switch (peak._0) {
      case 74:
        return `ED,1,0`
      case 48:
      case 49:
      case 50:
        if (peak._1 === 74)
          // ←[J, ←[0J, ←[1J, ←[2J
          return `ED,2,${String.fromCharCode(peak._0)}`
    }
    // EL - Erase in line
    switch (peak._0) {
      case 75:
        return `EL,1,0`
      case 48:
      case 49:
      case 50:
        if (peak._1 === 75)
          // ←[K, ←[0K, ←[1K, ←[2K
          return `EL,2,${String.fromCharCode(peak._0)}`
    }
    switch (peak._0) {
      case 115:
        // SCP - Save Cursor Position
        // it is commonly used for handling newline breaks
        switch (peak._1) {
          case 10:
            // ←[s
            return `NULL,5`
        }
        return `SCP,1`
      case 117:
        // RCP - restore Cursor Position
        // ←[u
        return `RCP,1`
    }
    // non-standard controls
    switch (peak._0) {
      case 48:
      case 49:
        // ANSI.SYS (non-standard) extended keyboard support
        switch (peak._1) {
          case 113:
            // ←[0q, ←[1q
            return `/x,2,${String.fromCharCode(peak._0)}`
        }
        break
      case 63:
        // PabloDraw non-standard codes
        if (peak._1 === 51 && peak._2 === 51)
          // iCE Colors (http://picoe.ca/forums/topic/need-pablodraw-ansi-escape-codes-descriptionsourcelist/)
          // ←[?33h and ←[?33l
          switch (peak._3) {
            case 108:
              // `l`, disable
              return `ICE,0,0`
            case 104:
              // `h`, enable
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
  functionsForArray(sequence = []) {
    if (typeof sequence !== `object`)
      CheckArguments(`sequence`, `array`, sequence)
    if (sequence.length === 0) return ``

    const element = sequence[0]
    const values = sequence.slice(1)
    const count = values.length
    const cs = { value1: 0, next1: 0, value2: 0, next2: 0, name: `` }

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
      case `CHT`:
      case `CUD`:
      case `CUF`:
      case `ED`:
      case `EL`:
        // forward tabulation
        // cursor move down, forward
        // erase in page, in line
        return `${element}+${cs.value1}`
      case `CUP`:
      case `HVP`:
        // cursor position
        // horizontal vertical positioning
        // these moves the cursor to a set of row x column coordinates
        // the cs.value1 is row, cs.value2 is column
        return `HVP+${cs.value1}+${cs.value2}`
      case `SGR`:
        // set graphic rendition
        cs.name = `SGR`
        // loop over array, index should start from 1 not 0
        for (let i = 1; i < count; i++) {
          const value = parseInt(values[i], 10)
          // handle xterm 256 colour codes
          if ([38, 48].includes(value) && count - i > 1) {
            cs.next1 = parseInt(values[i + 1], 10)
            cs.next2 = parseInt(values[i + 2], 10)
            if (cs.next1 === 5 && cs.next2 >= 0 && cs.next2 <= 255) {
              cs.name += `+${value}${cs.next2}`
              i = i + 2
              continue
            }
          }
          cs.name = `${cs.name}+${value}`
        }
        return cs.name
      case `SM`:
      case `RM`:
        // set and reset screen mode
        if (cs.value1 === 7) {
          // line wrapping
          // disable
          if (element === `RM`) return `LW+0`
          // enable
          if (element === `SM`) return `LW+1`
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
  characterAttributes(index = -1, codePoints = [], loopCount = -1) {
    let loops = loopCount
    let value = ``
    while (loops--) {
      const code = codePoints[index + loops]
      switch (code) {
        case 109:
          // skip m
          continue
        case 59:
          value = `,${value}`
          break
        default:
          if (!this.digit(code)) return ``
          value = `${String.fromCharCode(code)}${value}`
      }
    }
    if (this.verbose)
      console.log(
        `Text rendition attributes found, 'SGR,${value.length + 1},${value}'`
      )
    return `SGR,${value.length + 1},${value}`
  }

  /**
   * Is the character a Final Byte used for ANSI cursor positioning?
   * @param [codePoint=0] A Unicode decimal value
   * @returns Result
   */
  cursorCode(codePoint = 0) {
    const c = parseInt(codePoint)
    switch (c) {
      case 65:
      case 66:
      case 67:
      case 68:
        // CCU, CUD, CUF, CUB
        return true
      case 73:
        // CHT
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
  cursorMove(control = 0, codePoints = [0]) {
    if (typeof codePoints !== `object`)
      CheckArguments(`codePoints`, `array`, codePoints)
    // test for a valid control name
    const ctrl = parseInt(control, 10)
    const name = this.cursorName(ctrl)
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
      console.log(`Cursor move ${value} positions ${this.cursorHuman(ctrl)}`)
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
  cursorHuman(index = 0) {
    switch (parseInt(index, 10)) {
      case 65:
        return `up`
      case 66:
        return `down`
      case 67:
        return `right`
      case 68:
        return `left`
      case 73:
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
  cursorName(index = 0) {
    switch (parseInt(index, 10)) {
      case 65:
        return `CUU`
      case 66:
        return `CUD`
      case 67:
        return `CUF`
      case 68:
        return `CUB`
      case 73:
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
  cursorHVP(codePoints = []) {
    if (typeof codePoints !== `object`)
      CheckArguments(`codePoints`, `array`, codePoints)
    const length = codePoints.length + 1
    const hvp = { row: ``, column: ``, mode: `m` }
    for (const cp of codePoints) {
      switch (cp) {
        case 59:
          // if character is a semicolon ; then switch modes from
          // horizontal to vertical
          hvp.mode = `n`
          continue
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
        `Cursor repositioned to row ${hvp.row} and column ${hvp.column}`
      )
    return `HVP,${length},${hvp.row},${hvp.column}`
  }

  /**
   * Is the Unicode code point an ASCII digit (0...9).
   * @param [codePoint=0] Unicode decimal value
   * @returns Result
   */
  digit(codePoint = 0) {
    switch (parseInt(codePoint)) {
      case 48:
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
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
  pabloDrawRGB(codePoints = []) {
    // is `value` a valid Red,Green,Blue colour range?
    const valid = value => {
      if (value < 0) return false
      if (value > 255) return false
      return true
    }
    const rgb = { split: [], join: `` }
    let value = ``
    for (const code of codePoints) {
      // remove the `t` identifier
      if (code === 116) break
      rgb.join += String.fromCharCode(code)
    }
    rgb.split = rgb.join.split(`;`)
    if (rgb.split.length !== 4) return ``
    if ([`0`, `1`].includes(rgb.split[0]) !== true) return ``
    // red
    if (!valid(rgb.split[1])) return ``
    // green
    if (!valid(rgb.split[2])) return ``
    // blue
    if (!valid(rgb.split[3])) return ``
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
  setMode(index = 0, parameters = [0, 0], prefix = true) {
    if (parameters.length < 1)
      CheckRange(`parameter.length`, `small`, parameters.length)
    if (parameters.length > 2)
      CheckRange(`parameter.length`, `large`, parameters.length)
    if (typeof prefix !== `boolean`) CheckArguments(`prefix`, `boolean`, prefix)
    if (![108, 104].includes(index)) return ``
    const mode = new Map()
      .set(`code`, `SM`)
      .set(`length`, parameters.length + 1)
      .set(`value`, ``)
    // code
    const codePoint = parseInt(index, 10)
    if (codePoint === 108) mode.set(`code`, `RM`)
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
          parameters[1]
        )}`
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
    const decimals = this.decimals()
    const elements = []
    const issues = []
    const control = new Map()
      .set(`name`, ``)
      .set(`csi`, ``)
      .set(`joined`, ``)
      .set(`split`, [])
    const counts = {
      // number of characters to delete when
      // cleaning control sequences from the text
      delete: 0,
      // number of loops passed, used in console.log()
      loop: 0,
      // number of control functions passed so far
      control: 0,
      // number of unsupported MS-DOS ANSI.SYS control sequences found
      err_msdos: 0,
      // number of unsupported ECMA-48 control sequences found
      err_ecma48: 0
    }

    let i = decimals.length
    while (i--) {
      // current character as a Unicode decimal value
      const decimal = decimals[i]
      counts.loop++
      switch (decimal) {
        case -1:
          elements[i] = ``
          break
        case 8594:
        case 26:
          // if the last character is `→` then assume this is an
          // MS-DOS 'end of file' mark. SGR should be reset otherwise leftover
          // background colours might get displayed
          elements[i] = `SGR+0`
          break
        case 155:
          // handle character value 155 which is our place holder for the
          // Control Sequence Introducer `←[`
          counts.control++
          // discover if the control sequence is supported
          control.set(`joined`, this.controlCode(i, decimals))
          if (control.get(`joined`) === ``) {
            // handle unknown sequences
            issues.push(
              `Unsupported control function for array item ${i}, character #${counts.control}`
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
          control.set(`csi`, this.functionsForArray(control.get(`split`)))
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
      console.groupCollapsed(
        `EMCA-48/ANSI issues detected: `,
        issues.length,
        ` total`
      )
      for (const issue of issues) {
        console.info(issue)
      }
      console.groupEnd()
    }
    if (this.issues.length) {
      let noun = `type`
      if (this.issues.length > 1) noun += `s`
      console.warn(
        `${this.issues.length} unsupported ${noun} of control sequence in use: ${this.issues}`
      )
    }
    ecma48.other = counts.err_msdos
    ecma48.unknown = counts.err_ecma48
    return this.clean(elements)
  }

  /**
   * Filters unwanted elements from an array non-string types and empty strings.
   * @param [elements=[]] An array of strings
   * @returns An array of strings
   */
  clean(elements = []) {
    return elements.filter(value => {
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
  decimals() {
    const d0 = new Date().getTime()
    const string = this.text
    let i = string.length
    // for performance, create a new array with the expected number of elements
    const decimals = new Array(i)
    // iterate through the loop and apply fixes, while loops are performant
    // and JS engines can compile switch/case conditions
    while (i--) {
      const code = string.charCodeAt(i)
      const _code = string.charCodeAt(i - 1)
      const code_ = string.charCodeAt(i + 1)
      switch (code) {
        case 8592:
          // when the characters `←[` are found in sequence
          // ←[ is a CSI Control Sequence Introducer
          switch (code_) {
            case 91:
              // we will use this value as an identifier to mark the
              // `←[` introducer
              decimals[i] = 155
              continue
          }
          break
        case 91:
          // if `[` is found and the previous character is `←` (escape) then
          // nullify it, as later on iterating and skipping over -1 values are
          // much faster than modifying the array
          switch (_code) {
            case 8592:
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
        `Time taken to process Build.decimals(): ${d1 - d0} milliseconds`
      )
    }
    return decimals
  }
}
