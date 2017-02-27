// filename: text_ecma48.js
//
// These functions are to handle ECMA-48 control functions embedded into the text.
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
// ISO/IEC 6429 http://www.iso.org/iso/home/store/catalogue_tc/catalogue_detail.htm?csnumber=12781 (paid)
// ECMA-48 http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-048.pdf (free)
// ANSI X3.64 (withdrawn in 1997) (https://www.nist.gov/sites/default/files/documents/itl/Withdrawn-FIPS-by-Numerical-Order-Index.pdf)
// Microsoft ANSI.SYS (MS-DOS implementation with selective compliance) https://msdn.microsoft.com/en-us/library/cc722862.aspx
//
// To avoid ambiguous terminology of names, text in this programming always refers
// to "ANSI" X3.64 as ECMA 48.

/*
JavaScript Performance Notes:
+ prefer Switch() over if-then-else statements as they can be optimised during compile time.
+ don't initialise ES6 `let` and `const` within loops, see https://github.com/vhf/v8-bailout-reasons/pull/10
+ To permit compile-time optimisation `const` declarations need to be at the top of the function.
+ use x = `${x}newtext` instead of x.concat(`newtext`), see http://jsperf.com/concat-vs-plus-vs-join
+ use reference types (arrays, objects) instead of 'primitive' strings, bool, integers variable for
  large values. As it can save on browser RAM usage, the use of ecma48DOM{html:``} instead of
  ecma48HTML = `` saw a 5-20%(!) reduction for the BuildEcma48() memory footprint.
  https://www.linkedin.com/pulse/25-techniques-javascript-performance-optimization-steven-de-salas
*/
'use strict'

/*global chrome checkArg checkErr checkRange */

var cursor = new ResetCursor() // Initialise cursor position
var ecma48 = new ResetEcma48() // Initialise ECMA48 configurations
var ecma48DOM = { html: `` } // DOM innerHTML text container (see JavaScript Performance Notes)
var toggleSGR = new ResetSGR()  // SGR toggles

function ResetSGR()
// ECMA48 Select Graphic Rendition toggles
{
  this.bold = false // value 1
  this.faint = false // value 2
  this.italic = false // value 3
  this.underline = false // value 4
  this.blinkSlow = false // value 5
  this.blinkFast = false // value 6
  this.inverse = false // value 7
  this.conceal = false // value 8
  this.crossedOut = false // value 9
  this.underlineX2 = false // value 21
  this.framed = false // value 51
  this.encircled = false // value 52
  this.overLined = false // value 53
  // colours
  this.colorF = 37 // foreground (text colour)
  this.colorB = 40 // background
}

function ResetEcma48() {
  this.other = 0 // number of unsupported ANSI.SYS control sequences found
  this.unknown = 0 // number of unsupported ECMA-48 control sequences found
  this.colorDepth = 4 // Colour depth override if a set/reset mode CSI has requested it.
  this.font = 10 // CSS class values SGR10…20, see text_ecma_48.css for the different font-family values
  this.iceColors = false // iCE color mode which replaces SGR5/6 blink CSS classes with SGR140…SGR147 backgrounds
}

function ResetCursor()
// Creates a object that is used for tracking the active cursor position
{
  this.column = 1 // track x axis
  this.row = 1 // track y axis
  this.maxColumns = 80 // maximum columns per line, set to 0 to disable
  this.previousRow = 0 // previous column, used to decide when to inject line breaks
  this.eraseLines = []  // used by the Erase in page and Erase in line
  // to apply CSS `display: none` to functions to track which lines
}

function BuildEcma48(text = ``, sauce = { version: null }, verbose = false, ruler = false)
// Parses a string of Unicode text for control functions that are used for
// cursor positioning and colouring. The controls are converted into HTML5
// syntax with CSS dependencies for display in a web browser.
//
// The number of supported ECMA-48 control functions are based off Microsoft's
// limited implementation in their ANSI.SYS driver for MS-DOS. There are also a
// number of proprietary functions specific to ANSI.SYS.
//
// @text        String of Unicode text to parse.
// @verbose     Spam the console on information about each discovered control function.
// @ruler       Includes numbers in the render to show row and column positions.
{
  if (typeof text !== `string`) checkArg(`text`, `string`, text)
  if (typeof verbose !== `boolean`) checkArg(`verbose`, `boolean`, verbose)
  if (typeof ruler !== `boolean`) checkArg(`ruler`, `boolean`, ruler)
  if (typeof qunit !== `undefined`) { // for qunit test/tests.js
    console.info(`New QUnit test, cursor, ecma48DOM and toggleSGR have been reset`)
    if (typeof cursor === `undefined`) cursor = new ResetCursor()
    if (typeof ecma48DOM === `undefined`) ecma48DOM = { html: `` }
    if (typeof toggleSGR === `undefined`) toggleSGR = new ResetSGR()
  }

  ecma48 = new ResetEcma48()

  // Priority of configurations
  // 1. SAUCE
  // 2. ANSI SGR
  // 3. hard-coded defaults
  this.colorDepth = ecma48.colorDepth
  this.columns = cursor.maxColumns
  this.font = ``
  this.iceColors = null
  this.rows = 0
  this.lineWrap = toggleSGR.lineWrap
  this.innerHTML = ``
  this.otherCodesCount = 0
  this.unknownCount = 0

  // SAUCE configurations
  switch (sauce.version) {
    case `00`:
      this.font = confFont(sauce)
      if (sauce.config.width > 80) cursor.maxColumns = sauce.config.width
      if (sauce.config.iceColors === `1`) {
        ecma48.iceColors = true
      }
      else ecma48.iceColors = false
      break
  }

  // ruler display
  const rph = `_` // place holder
  const phl = cursor.row.toString().length
  const phs = `0`.repeat(phl - 1)
  // regex for HTML modifications
  const emptyTags = new RegExp(/<i class="SGR37 SGR40"><\/i><i id=/ig)
  const insSpace = new RegExp(/<div id="row-(\d+)"><i class="SGR37 SGR40"><\/i><\/div>/ig)
  let edLine = {}
  let S = text
  // Clean up string before converting it to decimal values
  // 4/Feb/17 - Hack to deal with HTML entities that mess up the ANSI layout
  //            This hack-fix probably comes with a performance cost.
  S = hideEntities(S)
  // Strip @CLS@ PCBoard code occasionally found in ANSI documents
  if (S.startsWith(`@CLS@`)) {
    S = S.slice(5, S.length)
  }

  // Convert text into Unicode decimal encoded numbers
  let characters = loopBackward(S)

  // remove empty items in the array and unused control sequences
  if (this.lineWrap === false) {
    // also remove newline characters
    characters = characters.filter(function (item) {
      return (item !== `\n` && (item !== (undefined || null) && item.length !== 0))
    })
  } else {
    characters = characters.filter(function (item) {
      return (item !== (undefined || null) && item.length !== 0)
    })
  }

  // Parse special characters
  // note: This function may apply toggleSGR = new ResetSGR() // reset to defaults
  loopForward(characters)
  // close any opened tags
  if (ecma48DOM.html.endsWith(`\u241B\u005B\uFFFD\uFFFD`) === true) { // hack fix for tail `␛[��`
    if (ecma48.unknown > 0) ecma48.unknown--
    ecma48DOM.html = `${ecma48DOM.html.slice(0, -27)}</i><span class="dos-cursor">_</span></div>`

  } else if (ecma48DOM.html.endsWith(`</i></div>`) === false) {
    ecma48DOM.html = `${ecma48DOM.html}</i><span class="dos-cursor">_</span></div>`
  } else if (ecma48DOM.html.endsWith(`</div>`) === true) {
    ecma48DOM.html = `${ecma48DOM.html.slice(0, -6)}</i><span class="dos-cursor">_</span></div>`
  }
  // clean any empty tags
  ecma48DOM.html = ecma48DOM.html.replace(emptyTags, `<i id=`)
  // force the browsers to show the empty rows by injecting a single space character
  ecma48DOM.html = ecma48DOM.html.replace(insSpace, `<div id="row-$1"><i class="SGR37 SGR40"> </i></div>`) // intentional empty space
  // apply erase lines
  for (let line of cursor.eraseLines) {
    line++ // account for arrays starting at 0 but lines starting at 1
    edLine = new RegExp(`<div id="row-${line}">`, `i`)
    ecma48DOM.html = ecma48DOM.html.replace(edLine, `<div id="row-${line}" class="ED">`)
  }
  // Inject the ruler
  if (ruler === true) {
    // Regex learnt from: http://stackoverflow.com/questions/7192436/javascript-passing-a-function-with-matches-to-replace-regex-funcarg-doesn
    // http://stackoverflow.com/questions/9812610/javascript-regex-add-leading-zero-to-all-number-contained-in-string
    ecma48DOM.html = ecma48DOM.html.replace(/<div id="row-(\d+)">/g, function (match, capture) { return `<div id="row-${capture}"><span class="SGR130">${phs.substr(capture.length - 1) + capture}</span>` })
    ecma48DOM.html = `<div class="SGR130"><code>RULER <span class="SGR137">@</span> marks 40 columns,<span class="SGR137">#</span> marks 80 columns, <span class="SGR137">$</span> marks 100 columns<br>\
${rph.repeat(phl)}123456789_123456789_123456789_123456789<span class="SGR137">@</span>123456789_123456789_123456789_123456789<span class="SGR137">#</span>123456789_123456789<span class="SGR137">$</span></code></div>${ecma48DOM.html}`
  }
  // Return HTML5 & unknown control functions count
  this.colorDepth = ecma48.colorDepth
  this.columns = cursor.maxColumns
  if (this.font.length === 0) this.font = parseFont(ecma48.font)
  this.iceColors = ecma48.iceColors
  this.innerHTML = ecma48DOM.html
  this.otherCodesCount = ecma48.other
  this.rows = cursor.row
  this.unknownCount = ecma48.unknown

  // free up memory
  cursor = undefined
  ecma48 = undefined
  ecma48DOM = undefined
  toggleSGR = undefined
}

function confFont(sauce = {}) {
  if (typeof sauce !== `object`) checkArg(`sauce`, `object`, sauce)

  const fn = sauce.config.fontName.split(` `)
  switch (sauce.version) {
    case `00`:
      // only compare first two words of the font name
      switch (fn.slice(0, 2).join(` `)) {
        case `IBM VGA`:
          if (sauce.config.letterSpacing === `10`) return `vga9` // 9 pixel font
          return `vga8` // 8 pixel font
        case `IBM VGA50`: return `vgalcd`
        case `IBM EGA`: return `ega8`
        case `Amiga Topaz`: return `amiga`
        case `C64 PETSCII`: return `c64`
        default: return ``
      }
  }
}

function loopBackward(text = ``, verbose = false) {
  // Convert the @text string into Unicode decimal encoded numbers and store those
  // values in an array. JavaScript's performance for comparison and manipulation
  // is faster using arrays and numeric values than it is using String functions.
  // While loops are generally the faster than other loop types but only work in
  // reverse.
  if (typeof text !== `string`) checkArg(`text`, `string`, text)
  if (typeof verbose !== `boolean`) checkArg(`verbose`, `boolean`, verbose)

  // Convert string to decimal characters
  const decimals = buildDecimalArray(text, verbose)
  const decimalsLen = decimals.length
  const counts = {
    loop: 0, // number of loops passed, used in console.log()
    control: 0, // number of control functions passed so far
    other: 0, // number of unsupported ANSI.SYS control sequences found
    unknown: 0 // number of unsupported ECMA-48 control sequences found
  }
  const ctrl = {
    code: ``,
    delLen: 0,
    element: ``,
    sequence: ``
  }
  let ctrlCodes = []
  let texts = [] // array container to return

  let decimalChar = 0 // current character as a Unicode decimal value
  let i = decimalsLen
  while (i--) {
    decimalChar = decimals[i]
    counts.loop++
    switch (decimalChar) {
      case null: continue
      case 26: // if the last character is `→` then assume this is a MS-DOS 'end of file' mark
        if (i === decimalsLen - 1) continue  // to display the EOF mark, comment this
      // break omitted
      case 155: // handle character value 155 which is our place holder for the Control Sequence Introducer `←[`
        counts.control++
        // discover if the control sequence is supported
        ctrl.sequence = findControlCode(decimals, i, verbose)
        if (ctrl.sequence === null) {
          // handle unknown sequences
          if (verbose) console.info(`Unsupported control function for array item ${i}, character #${counts.control}`)
          // we display all unknown controls sequences in the text
          texts[i] = `\u241b` // `esc` control picture
          texts[i + 1] = `[`
          counts.unknown++
          continue
        }
        ctrlCodes = ctrl.sequence.split(`,`)
        ctrl.code = ctrlCodes[0]
        ctrl.delLen = parseInt(ctrlCodes[1], 10) // number of characters to delete when erasing control sequences from the text
        // strip out known control sequences from the text including those that will be converted into HTML
        switch (ctrl.code) {
          case `ICE`: texts.fill(null, i + 2, ctrl.delLen + i + 6) // value, start, end
            break
          case `CUB`: case `CUD`: case `CUF`: case `CUP`: case `CUU`:
          case `ED`: case `EL`: case `HVP`: case `NULL`: case `RCP`:
          case `RM`: case `SCP`: case `SGR`: case `SM`: case `/x`:
            //verbose = true
            if (ctrl.delLen > 0) texts.fill(null, i + 2, ctrl.delLen + i + 2) // value, start, end
            if ([`CUU`, `CUB`, `/x`].includes(ctrl.code)) counts.unknown++ // ignored sequences
            else if (ctrl.code === `EL` && ctrlCodes[2] === `1`) counts.other++ // other sequences
            else if (ctrl.code === `SM` && verbose === true) {
              // debug output
              console.groupCollapsed(`Control function '${ctrl.sequence}'`)
              console.log(`At position ${i}, item #${counts.control}, length ${ctrlCodes[1]}\nNullify item ${counts.loop} fill ${i + 2} to ${ctrl.delLen + i + 1}`)
              console.groupEnd()
            }
        }
        // humanise control sequence introducer
        ctrl.element = buildCSI(ctrlCodes, verbose)
        // merge results into the array
        texts[i] = ctrl.element
        // handle any formatting triggers
        switch (ctrl.element) {
          case `ICE+0`: ecma48.iceColors = false
            break
          case `ICE+1`: ecma48.iceColors = true
            break
          case `LW+0`: toggleSGR.lineWrap = false
            break
          case `LW+1`: toggleSGR.lineWrap = true
            break
        }
        break
      default: // parse characters for display
        texts[i] = `${String.fromCharCode(decimalChar)}` // convert the Unicode decimal character value into a UTF-16 text string
    }
    // end of while-loop
  }
  ecma48.other = counts.other
  ecma48.unknown = counts.unknown
  return texts
}

function loopForward(items = [])
// Inject presentation classes into small <i> containers. In HTML4 <i> were
// simply italic styles but in HTML5 they "represent a range of text that is
// set off from the normal text for some reason"
// @items  An array containing Unicode decimal text
{
  if (typeof items !== `object`) checkArg(`items`, `array`, items)

  // determine the first row
  const findRow1 = ecma48DOM.html.slice(0, 100)
  const startRow1 = findRow1.startsWith(`<div id="row-1"`)
  const indexRow1 = findRow1.indexOf(`<div id="row-1"`, 0)
  const item = {
    classes: ``,
    row1: false,
    value: `` // a control code, character or null
  }
  let i = 0
  for (item.value of items) {
    i += 1
    // Handle items
    switch (item.value.length) {
      case 0: continue // 0 length is skipped
      case 1: // 1 length is a single character to display
        if (item.value !== undefined) {
          parseCharacter(item.value)
          break
        }
      // break omitted
      default: // greater than 1 length is a control function
        parseCtrlName(i, item.value)
    }

    // recalculate monospace screen-width, number of characters per row
    //configMaxColumns() // [intentionally not in use]

    // handle first row HTML
    if (item.row1 === false && startRow1 === false && indexRow1 === -1) {
      switch (item.value.split(`+`)[0]) { // get CSI name
        case `SGR`: item.classes = renditionParse(item.value)
          break
        default: item.classes = renditionParse()
          break
      }
      if ([`ICE+1`, `ICE+0`].includes(items[0])) {
        ecma48DOM.html = `<div id="row-1">`
      } else ecma48DOM.html = `<div id="row-1"><i class="${item.classes}">${ecma48DOM.html}`
      item.row1 = true
    } else if (i <= 2 && ecma48DOM.html.startsWith(`<div id=\"row-1\"></i>`)) {
      ecma48DOM.html = ecma48DOM.html.replace(`<div id="row-1"></i>`, `<div id="row-1">`)// handle malformed tags due to iCE color triggers
    }
  }
}

// the following functions listed in named, alphabetical order

function buildCSI(a = [])
// Takes control sequences and returns either their humanised acronyms or
// HTML tags and entities.
// @a       Array of text characters represented in Unicode decimal values
{
  if (typeof a !== `object`) checkArg(`a`, `array`, a)

  if (a.length === 0) return ``
  const cs = {
    next1: 0,
    next2: 0,
    str: ``,
    value1: 0,
    value2: 0
  }
  const element = a[0]
  const values = a.slice(1)
  const valuesLen = values.length

  if (valuesLen > 1) cs.value1 = parseInt(values[1], 10)
  if (valuesLen > 2) cs.value2 = parseInt(values[2], 10)

  let value = 0
  switch (element) {
    case `ICE`: cs.str = `${element}+${cs.value1}` // ICE colors
      break
    case `CUD`: // cursor move down
    case `CUF`: // forward
    case `ED`:  // erase in page
    case `EL`:  // erase in line
      cs.str = `${element}+${cs.value1}`
      break
    case `CUP`: // cursor position
    case `HVP`: // horizontal vertical positioning
      // these moves the cursor to a set of row x column coordinates
      // the cs.value1 is row, cs.value2 is column
      cs.str = `HVP+${cs.value1}+${cs.value2}`
      break
    case `SGR`: // set graphic rendition
      cs.str = `SGR`
      // loop over array, i should start from 1 not 0
      for (let i = 1; i < valuesLen; i++) {
        value = parseInt(values[i], 10)
        // handle 256 colour codes
        if ([38, 48].includes(value) && (valuesLen - i) > 1) {
          cs.next1 = parseInt(values[i + 1], 10)
          cs.next2 = parseInt(values[i + 2], 10)
          if (cs.next1 === 5 && cs.next2 >= 0 && cs.next2 <= 255) {
            cs.str = `${cs.str}+${value}${cs.next2}`
            i = i + 2
            continue
          }
        }
        cs.str = `${cs.str}+${value}`
      }
      break
    case `SM`: // set and reset screen mode
    case `RM`:
      if (cs.value1 === 7) {
        // line wrapping
        if (element === `RM`) cs.str = `LW+0` // disable
        else if (element === `SM`) cs.str = `LW+1` // enable
      } else {
        // all other modes
        cs.str = `SM+${cs.value1}`
      }
      break
    default:
      console.warn(`Unsupported element '${element}' passed through to buildCSI()`)
  }
  // all other controls are ignored
  return cs.str
}

function buildCU(c = 0, v = [0], verbose = false)
// Stringify Unicode decimal values into a cursor position function
// @c   mode encoded as Unicode decimal
// @v   Array of text characters represented in Unicode decimal values
{
  if (typeof c !== `number`) checkArg(`c`, `number`, c)
  if (typeof v !== `object`) checkArg(`v`, `array`, v)

  let code = ``
  let value = ``
  switch (c) {
    case 65: code = `CUU`
      break
    case 66: code = `CUD`
      break
    case 67: code = `CUF`
      break
    case 68: code = `CUB`
      break
  }
  for (let chr of v) {
    if (chr === 0) chr = 49 // default value of 1 if no value is given
    value = `${value}${String.fromCharCode(chr)}`
  }
  let length = v.length + 1
  if (v.length === 1 && v[0] === 0) length = 1 // if no parameters are given
  if (verbose) console.log(`Cursor move ${value} positions ${humanizeCursor(c)}`)
  return `${code},${length},${value}`
}

function buildDecimalArray(s = ``, verbose = false)
// Converts a string of text into Unicode decimal values and splits them into an
// array which are processed faster.
// @s       String of text
{
  if (typeof s !== `string`) checkArg(`s`, `string`, s)
  if (typeof verbose !== `boolean`) checkArg(`verbose`, `boolean`, verbose)

  const d0 = new Date().getTime()
  let d1
  let i = s.length
  let cca = 0
  let ua = new Array(i)
  // while loops are faster
  while (i--) {
    cca = s.charCodeAt(i)
    if (cca === 8592 && s.charCodeAt(i + 1) === 91) {
      // When the characters ←[ are found in sequence
      // ←[ = CSI Control Sequence Introducer
      ua[i] = 155 // we will use this value as an identifier to mark ←[ introducer
      continue
    } else if (cca === 91 && s.charCodeAt(i - 1) === 8592) {
      // if [ is found and the previous character is ← (escape) then we nullify it
      // as iterating and skipping over null values is much faster than modifying the array
      ua[i] = null
      continue
    } else ua[i] = cca
  }
  d1 = new Date().getTime()
  if (verbose) console.log(`Time taken to process buildDecimalArray: ${(d1 - d0)} milliseconds`)
  return ua
}

function buildNewColumns(count = 1)
// Creates white space to simulate a cursor position forward request
// As such the white space should not have any presentation controls applied
// to it such as background colours.
// @count   The number of places to move, if 0 then build to the end of the line
{
  if (typeof count !== `number`) checkArg(`count`, `number`, count)
  else if (count < 0) checkRange(`count`, `small`, `0`, count)

  let places = count
  if (count === 0) {
    if (cursor.column === 1) places = cursor.maxColumns
    else if (cursor.maxColumns > 0) places = cursor.maxColumns - cursor.column
  }
  const classes = renditionParse()
  const endPosition = cursor.column + places - 1
  if (cursor.column === endPosition) ecma48DOM.html = `${ecma48DOM.html}</i><i id="column-${cursor.column}" class="SGR0">${` `.repeat(places)}</i><i class="${classes}">`
  else ecma48DOM.html = `${ecma48DOM.html}</i><i id="column-${cursor.column}-to-${endPosition}" class="SGR0">${` `.repeat(places)}</i><i class="${classes}">`
  handleColumn(places)
}

function buildHVP(v = [], verbose = false)
// Stringify Unicode decimal values into a character and line position function
// @v   Array of text characters represented in Unicode decimal values
{
  if (typeof v !== `object`) checkArg(`v`, `array`, v)
  if (typeof verbose !== `boolean`) checkArg(`prefix`, `boolean`, verbose)

  const length = v.length + 1
  let row = ``
  let column = ``
  let mode = `m` // row
  if (v.length === 0) v = [49, 59, 49]
  for (const chr of v) {
    // if character is a semicolon ; then switch modes
    if (chr === 59) {
      mode = `n`
      continue
    }
    if (mode === `n`) column = column.concat(String.fromCharCode(chr)) // keep concat to avoid \n injection
    else if (mode === `m`) row = `${row}${String.fromCharCode(chr)}`
  }
  // if no values were provided then use defaults of 1
  if (row === `` || row === `0`) row = `1`
  if (column === `` || column === `0`) column = `1`
  if (verbose) console.log(`Cursor repositioned to row ${row} and column ${column}`)
  return `HVP,${length},${row},${column}`
}

function buildNewRows(count = 1, columns = 0)
// Create line break tag to simulate a cursor position down request
// @count   The number of places to move
// @columns If set to 1 or greater then also position the cursor forward by
//          this many places.
{
  if (typeof count !== `number`) checkErr(`'count' argument must be an unsigned number, not a ${typeof count}`, true)
  else if (count < 1) checkRange(`count`, `small`, `1`, count)
  if (typeof columns !== `number`) checkErr(`'columns' argument must be an unsigned number, not a ${typeof columns}`, true)
  else if (columns < 0) checkRange(`columns`, `small`, `0`, columns)

  const empty = `"><i class="SGR37 SGR40">`
  const classes = renditionParse()
  for (let i = 0; i < count; i++) {
    cursor.row++
    handleColumn(0) // reset columns
    if (ecma48DOM.html.length < 1) ecma48DOM.html = ` ` // intentional space
    if (ecma48DOM.html.slice(-Math.abs(empty)) === empty) ecma48DOM.html = ` ` // intentional space TODO: ???? working
    if (cursor.row < 2) ecma48DOM.html = `${ecma48DOM.html}</i><i class="${classes}">`
    if (cursor.row > 1) ecma48DOM.html = `${ecma48DOM.html}</i></div><div id="row-${cursor.row}"><i class="${classes}">` // PASS
  }
  cursor.previousRow = cursor.row
  // always build columns AFTER rows and outside of the loop
  if (columns > 0) buildNewColumns(columns)
}

function buildSM(c = 0, v = [0, 0], prefix = true)
// Stringify Unicode decimal values into the set mode function.
// This is not compatible with the ECMA-48 set mode function as it is based
// on Microsoft's ANSI.SYS driver.
// @c       mode encoded as Unicode decimal
// @v       Array of text characters represented in Unicode decimal values
// @prefix  Was the value in the ANSI element prefixed with a symbol?
//          ANSI.SYS permits '=' '?' '>' ie ←[=13h and ←[?13h
{
  if (typeof c !== `number`) checkArg(`c`, `number`, c)
  if (typeof v !== `object` && v !== `undefined`) checkArg(`v`, `array`, v)
  if (v.length < 1) checkRange(`v.length`, `small`, v.length) // set to 1?
  if (typeof prefix !== `boolean`) checkArg(`prefix`, `boolean`, prefix)

  let code = `SM`
  let length = v.length + 1
  let value = ``
  if (v.length > 1 && v[1] > 0) value = `${String.fromCharCode(v[0])}${String.fromCharCode(v[1])}`
  else value = `${String.fromCharCode(v[0])}`
  if (prefix === true) length++
  if (c === 108) code = `RM`
  return `${code},${length},${value}`
}

function buildTextChars(a = [], verbose = false)
// Converts arrays containing Unicode decimal values back into plain text strings.
// @a       Array containing Unicode decimals
{
  if (typeof a !== `object`) checkArg(`a`, `array`, a)
  if (typeof verbose !== `boolean`) checkArg(`verbose`, `boolean`, verbose)

  const d0 = new Date().getTime()
  let i = a.length
  // while loops are faster
  while (i--) {
    switch (a[i]) {
      case null: continue
      case 155: a[i] = `\e[`
        break
      default:
        a[i] = String.fromCharCode(a[i])
    }
  }
  const str = a.join(``) // convert array to string with no separator
  const d1 = new Date().getTime()
  if (verbose) console.log(`Time taken to process buildTextChars: ${(d1 - d0)} milliseconds`)
  return str
}

function configMaxColumns()
// Determine the width of the document to apply line-wrapping when
// newline characters or CSI are missing.
// TODO: This hack is far from full-proof in its current state
{
  let cols = 0 // columns
  let mcp = 0 // max. column position before starting a newline
  // handle rows that need text wrapping
  if (cursor.column - 1 > mcp) {
    mcp = cursor.column - 1
    cols = mcp // return value
    if (mcp >= 80 && mcp <= 210) {
      // update header metadata
      if (cursor.row === 1) {
        if (cursor.column > mcp) buildNewRows()
      }
      console.log(`Maximum columns set to ${mcp} matched to row ${cursor.row}`)
      cursor.maxColumns = mcp
    }
  }
  return cols
}

function findBackground(v)
// Used by renditionParse() to see if `v` matches a valid Select Graphic Rendition, background color
// @v   Decimal value of a CSI
{
  let valid = false
  if (v >= 40 && v <= 49 || v >= 480 && v <= 489 || v >= 4810 && v <= 4899 || v >= 48100 && v <= 48255) valid = true
  return valid
}

function findControlCode(a = [], pos = 0, verbose = false)
// Scans a slice of text that has previously been converted into Unicode
// decimals to find any ECMA-48 control sequences.
// @a       Array of text characters represented in Unicode decimal values.
//          Usually it will contain a complete text document.
// @pos     The position within the array to start the search for a control sequence.
// @verbose Spam the console with information about each discovered control sequence.
{
  if (typeof a !== `object`) checkArg(`a`, `array`, a)
  if (typeof pos !== `number`) checkArg(`pos`, `number`, pos)
  else if (pos < 0) checkRange(`pos`, `small`, `0`, pos)
  if (typeof verbose !== `boolean`) checkArg(`verbose`, `boolean`, verbose)

  const i = pos + 2 // skip saved escape and null values
  // look-ahead character containers as control sequences use multiple characters
  // of varying length.
  const char0 = a[i]
  const char1 = a[i + 1]
  const char2 = a[i + 2]
  const char3 = a[i + 3]
  const char4 = a[i + 4]
  // look-ahead containers that will be used with deeper scan while-loops
  const chars = a.slice(i, i + 8) // for performance, set a 9 character cap for most scans
  const charsSGR = a.slice(i, i + 18) // cap SGR scans to 19 characters [can be adjusted if needed]
  // discover digits
  const chr0D = findDigit(char0)
  const chr1D = findDigit(char1)
  const chr2D = findDigit(char2)
  const chr3D = findDigit(char3)
  // look for SGR & HVP
  const find_H = chars.indexOf(72) // find upper H
  const find_f = chars.indexOf(102) // find lower f
  const find_M = charsSGR.indexOf(109) // find upper M
  let sgrLoop = find_M
  let sgrCode = ``
  let sgrCtrl = true
  let sgrStr = ``
  let hvpFlag = 0
  let hvpScan = -1
  let hvpCode = ``
  let hvpCtrl = true
  let hvpLoop = -1
  // handle control functions with either no or fixed numeric parameters first
  // SGR - Select Graphic Rendition
  if (char0 === 109) return `SGR,1,0` // ←[m reset to defaults
  else if (char1 === 109 && chr0D) return `SGR,2,${String.fromCharCode(char0)}` // ←[1m
  else if (char2 === 109 && chr0D && chr1D) return `SGR,3,${String.fromCharCode(char0)}${String.fromCharCode(char1)}` // ←[31m
  // HVP, CUP - Horizontal and vertical position and Cursor Position reset, match ←[H ←[f
  if (char0 === 72 || char0 === 102) return buildHVP()
  // CUU, CUD, CUF, CUB - Cursor up, down, forward, back
  if (findCursor(char0)) return buildCU(char0) // ←[A move 1 place
  if (chr0D && findCursor(char1)) return buildCU(char1, [char0]) // ←[5A move multiple places
  if (chr0D && chr1D && findCursor(char2)) return buildCU(char2, [char0, char1]) // ←[60A move tens of places
  if (chr0D && chr1D && chr2D && findCursor(char3)) return buildCU(char3, [char0, char1, char2]) // ←[555A move hundreds of places
  if (chr0D && chr1D && chr2D && chr3D && findCursor(char4)) return buildCU(char4, [char0, char1, char2, char3]) // ←[1523A move thousands of places
  // SM, RM - Set screen mode and Reset screen mode
  if ((char3 === 104 || char3 === 108) && char0 >= 61 && char0 <= 63 && char1 === 49 && char2 >= 51 && char2 <= 56) return buildSM(char3, [char1, char2]) // ←[=13h 2 digit mode with a character prefix
  if ((char2 === 104 || char2 === 108) && char0 >= 61 && char0 <= 63 && chr1D) return buildSM(char2, [char1]) // ←[?0h 1 digit mode with a character prefix
  if ((char2 === 104 || char2 === 108) && char0 === 49 && char1 >= 51 && char1 <= 56) return buildSM(char2, [char0, char1], false) // ←[13h 2 digit mode
  if ((char1 === 104 || char1 === 108) && chr0D) return buildSM(char1, [char0], false) // ←[13h 1 digit mode
  // ED - Erase in page, match ←[J, ←[0J, ←[1J, ←[2J
  if (char0 === 74) return `ED,1,0`
  else if (char1 === 74 && char0 >= 48 && char0 <= 50) return `ED,2,${String.fromCharCode(char0)}`
  // EL - Erase in line, match ←[K, ←[0K, ←[1K, ←[2K
  if (char0 === 75) return `EL,1,0`
  else if (char1 === 75 && char0 >= 48 && char0 <= 50) return `EL,2,${String.fromCharCode(char0)}`
  // SCP - Save Cursor Position, match ←[s
  // it is commonly used for handling newline breaks
  if (char0 === 115 && char1 === 10) return `NULL,5`
  else if (char0 === 115) return `SCP,1`
  // RCP - restore Cursor Position, match ←[u
  if (char0 === 117) return `RCP,1`
  // ANSI.SYS extended keyboard support (non-standard), match ←[0q, ←[1q
  if (char1 === 113 && (char0 === 48 || char0 === 49)) return `/x,2,${String.fromCharCode(char0)}`
  // Non-standard code used by PabloDraw and
  if (char0 === 63) {
    // ←[?33h and ←[?33l, ICE colors
    if (char1 === 51 && char2 === 51) {
      // see comments http://picoe.ca/forums/topic/need-pablodraw-ansi-escape-codes-descriptionsourcelist/
      if (char3 === 108) return `ICE,0,0` // l, disable
      else if (char3 === 104) return `ICE,0,1` // h, enable
    }
  }

  // handle control functions with variable parameters
  // SGR - Select Graphic Rendition
  // look for SGR
  // if scan found an SGR then process its values
  if (find_M > -1) {
    while (sgrLoop--) {
      sgrCode = a[i + sgrLoop]
      // confirm scanned character (character 59 is a semicolon `;`)
      if (sgrCode !== 109) {
        if (findDigit(sgrCode) === false && sgrCode !== 59) {
          sgrCtrl = false
          break
        } else if (sgrCode === 59) sgrStr = `,${sgrStr}`
        else sgrStr = `${String.fromCharCode(sgrCode)}${sgrStr}`
      }
    }
    if (sgrCtrl === true) {
      if (verbose) console.log(`Text rendition attributes found, 'SGR,${sgrStr.length + 1},${sgrStr}'`)
      return `SGR,${sgrStr.length + 1},${sgrStr}`
    }
  }
  // HVP, CUP - Horizontal & vertical position and Cursor Position
  if (find_H >= 0 && (find_f === -1 || find_H < find_f)) {
    // Scan for the letter `H` in chars, identifies CUP
    hvpFlag = 72
    hvpScan = find_H
  }
  else if (find_f >= 0 && (find_H === -1 || find_f < find_H)) {
    // Scan for the letter `f` in chars, identifies HVP
    hvpFlag = 102
    hvpScan = find_f
  }
  // if one of the scans found an hvpFlag, then process its values
  if (hvpScan > -1) {
    hvpLoop = hvpScan
    while (hvpLoop--) {
      hvpCode = a[i + hvpLoop]
      // confirm scanned character is H or ; or 0-9
      if (hvpCode !== hvpFlag && hvpCode !== 59 && findDigit(hvpCode) === false) {
        hvpCtrl = false
        break
      }
    }
    if (hvpCtrl === true) {
      if (verbose) console.log(`Cursor position change command found, '${buildTextChars(chars.slice(0, hvpScan))}'`)
      return buildHVP(chars.slice(0, hvpScan))
    }
  }
  // if no known control sequences are found then return null
  return null
  // end of findControlCode() function
}

function findCursor(c = 0)
// Is the character a Final Byte used for cursor positioning?
// CCU, CUD, CUF, CUB
// @c   character encoded as Unicode decimal
{
  if (typeof c !== `number`) checkArg(`c`, `number`, c)

  let result = false
  if (c >= 65 && c <= 68) result = true
  return result
}

function findDigit(c = 0)
// Is the character a digit (0...9)?
// @c   character encoded as Unicode decimal
{
  if (typeof c !== `number` && c !== null) checkArg(`c`, `number`, c)

  let result = false
  if (c >= 48 && c <= 57) result = true
  return result
}

function findForeground(v)
// Used by renditionParse() to see if `v` matches a valid Select Graphic Rendition, foreground color
// @v   Decimal value of a CSI
{
  let valid = false
  if (v >= 30 && v <= 39 || v >= 380 && v <= 389 || v >= 3810 && v <= 3899 || v >= 38100 && v <= 38255) valid = true
  return valid
}

function handleColumn(count = 1)
// Automatically resets the column forward position to the beginning of the line
// after @count has reached 80 columns.
// @count The number of characters or places that have been displayed.
//        If @count is set to 0 then a forced reset will be applied to cursor.column.
{
  if (typeof count !== `number`) checkArg(`count`, `number`, count)
  else if (count < 0) checkRange(`count`, `small`, `0`, count)

  if (count === 0) cursor.column = 1
  else if (count > 0) {
    cursor.column = cursor.column + count
    if (cursor.maxColumns !== 0 && cursor.column > cursor.maxColumns) {
      // end of line reached so begin a new line
      //console.info(`EOL for ${cursor.row} @ ${cursor.column}/${cursor.maxColumns}`)
      cursor.previousRow++
      buildNewRows(1)
    }
  }
}

function hideEntities(s = ``)
// Hide HTML entities that break the formatting of ANSI documents
// @s String of text
{
  if (typeof s !== `string`) checkArg(`s`, `string`, s)

  // cache expressions, for slight speed improvement
  const rGT = new RegExp(`&gt;`, `gi`)
  const rLT = new RegExp(`&lt;`, `gi`)
  const rAmp = new RegExp(`&amp;`, `gi`)
  // replace matches
  let r = s
  r = r.replace(rGT, `⮚`)
  r = r.replace(rLT, `⮘`)
  r = r.replace(rAmp, `⮙`)
  return r
}

function humanizeCursor(c = 0)
// Decode Unicode decimal values into readable strings
// @c   character encoded as Unicode decimal
{
  return function () {
    switch (c) {
      case 65: return `up`
      case 66: return `down`
      case 67: return `right`
      case 68: return `left`
      default: return null
    }
  }
}

function parseCharacter(c = ``)
// Parse markers and special characters in ecma48DOM.html
// @c Character as string
{
  if (typeof c !== `string`) checkArg(`c`, `string`, c)

  switch (c) {
    case `\n`: buildNewRows() // we replace newline controls with <br> tags
      break
    case `⮚`: ecma48DOM.html = `${ecma48DOM.html}&gt;`
      break
    case `⮘`: ecma48DOM.html = `${ecma48DOM.html}&lt;`
      break
    case `⮙`: ecma48DOM.html = `${ecma48DOM.html}&amp;`
      break
    default:
      ecma48DOM.html = `${ecma48DOM.html}${c}` // append character to HTML
      handleColumn()
  }
}

function parseCtrlName(i = 0, item = ``) {
  // Parse control sequences
  // @i     Current forwardLoop() count
  // @item  A control code, character or null
  if (typeof i !== `number`) checkArg(`i`, `number`, i)
  if (typeof item !== `string`) checkArg(`item`, `string`, item)
  if (item.length < 1) checkRange(`item`, `length`, `1`, item)

  const control = item.slice(0, 3) // obtain control name
  const items = item.split(`+`)
  const item1 = parseInt(items[1], 10)
  let item2 = 0
  if (typeof items[2] !== `undefined`) item2 = parseInt(items[2], 10)
  let psm
  switch (control) {
    case `CUD`: // cursor down
      if (item1 > 0) {
        cursor.previousRow = cursor.row
        buildNewRows(item1)
      }
      break
    case `CUF`: // cursor forward
      if (item1 > 0) {
        if (cursor.maxColumns === 0) buildNewColumns(item1)
        else if (cursor.maxColumns !== 0 && item1 + cursor.column <= cursor.maxColumns) buildNewColumns(item1)
      }
      break
    case `HVP`: // horizontal vertical position (HVP) & cursor position (CUP)
      //console.log(`HVP is in use @ ${cursor.row}x${cursor.column} to move to ${item1}x${item2}.`);
      //cursor.maxColumns = 0 // disable maxColumns because HVP is in use.
      cursor.previousRow = cursor.row
      if (item1 < cursor.row || (item1 === cursor.row && item2 < cursor.column)) {
        // RetroTxt doesn't support the backwards movement of the cursor
        ecma48.other++
      } else if (item1 > cursor.row) {
        if (item2 === 1) buildNewRows(item1 - cursor.row, 0) // reset columns
        else buildNewRows(item1 - cursor.row, item2)
      } else if (item2 > cursor.column) {
        buildNewColumns(item2)
      }
      break
    case `ICE`: // iCE colors
      switch (item1) {
        case 0: ecma48.iceColors = false
          break
        case 1: ecma48.iceColors = true
          break
      }
      if (i > 1) ecma48DOM.html = `${ecma48DOM.html}</i><i class="${renditionParse()}">`
      break
    case `SGR`: // select graphic rendition
      if (i > 1) ecma48DOM.html = `${ecma48DOM.html}</i><i class="${renditionParse(item)}">`
      break
    case `ED+`: // erase in page
      switch (item1) {
        case 0: buildNewColumns(0) // [incomplete, currently just goes to the end of the line] erase from cursor to end of the screen (-ANSI.SYS)
          break
        case 1:
        case 2:
          // 3/Feb/17: fix for issue https://github.com/bengarrett/RetroTxt/issues/25
          if (cursor.row >= 1 && cursor.column > 1) {
            cursor.eraseLines.push(...Array(cursor.row).keys()) // erase all lines to current row using ES6 range 1...current row
          }
          break
      }
      break
    case `EL+`: // erase in line
      switch (item1) {
        case 0: buildNewColumns(0) // go to end of the line
          break
        case 1: // [not supported] clear from cursor to the beginning of the line (-ANSI.SYS)
          break
        case 2: cursor.eraseLines.push(cursor.row - 1) // erase line (-ANSI.SYS)
          break
      }
      break
    case `SM+`: // set modes (non-standard MS-DOS ANSI.SYS)
      psm = new ParseSetMode(parseInt(item1))
      ecma48.colorDepth = psm.colorDepth
      ecma48.font = psm.font
      ecma48.maxColumns = psm.maxColumns
      break
    default:
      console.warn(`parseCtrlName() attempted to parse this unknown control '${item}'`)
  }
}

function parseFont(f = 10)
// Translates the SGR numeric ranges (10...20) into CSS font-family values
{
  if (typeof f !== `number`) checkArg(`f`, `number`, f)

  switch (f) {
    case 10: // use Option selection
    case 20: return null // gothic font (not implemented due to a lack of a suitable font)
    case 11: return `bios`
    case 12: return `cga`
    case 13: return `cgathin`
    case 14: return `amiga`
    case 15: return `ega9`
    case 16: return `ega8`
    case 17: return `vga8`
    case 18: return `vga9`
    case 19: return `mda`
  }
}

function ParseSetMode(sm = -1) {
  if (typeof sm !== `number`) checkArg(`sm`, `number`, sm)
  else if (sm < 0) checkRange(`sm`, `small`, `0`, sm)
  else if (sm > 19) checkRange(`sm`, `large`, `19`, sm)

  let cd = -1 // invalid values
  let f = -1
  let mc = -1
  let v = [`4-bit`, `VGA`, `80`]
  // set colour depth
  if ([0, 2, 5, 6, 15, 17].includes(sm)) { cd = 1; v[0] = `1-bit` } // monochrome 1-bit colour
  else if ([5, 6].includes(sm)) { cd = 0; v[0] = `4-bit monochrome` } // grey scale 4-bit colour
  else if ([1, 3, 4].includes(sm)) { cd = 2; v[0] = `2-bit [unsupported]` } // [not supported] 2-bit colours
  else if ([13, 14, 16, 18].includes(sm)) { cd = 4; v[0] = `4-bit` } // 4-bit colours
  else if (sm === 19) { cd = 8; v[0] = `8-bit [unsupported]` } // [not supported] 8-bit colours
  // set resolution (but in our HTML/CSS output we only switch the font)
  if (sm === 2) f = 19 // MDA font 80×25
  else if ([0, 1, 4, 5, 13, 19].includes(sm)) f = 12 // CGA font
  else if ([6, 14].includes(sm)) f = 13 //  CGA higher resolution
  else if ([3, 15, 16].includes(sm)) f = 15 // EGA font
  else if ([17, 18].includes(sm)) f = 17 // VGA font
  // number of columns
  if (sm === 0 || sm === 1) mc = 40
  else mc = 80

  console.info(`Set mode applied, ${v[0]} ${v[1]} in ${v[2]} columns mode`)
  this.colorDepth = cd
  this.font = f
  this.maxColumns = mc
}

function renditionParse(vals = ``)
// Creates CSS classes to apply presentation changes to text
// These are based on ECMA-48 which are backwards compatible with Microsoft's
// MS-DOS ANSI.SYS implementation.
// see 8.3.117 SGR - SELECT GRAPHIC RENDITION
// http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-048.pdf
// @vals          SGR parameter values or ANSI.SYS text attributes
{
  const values = vals.split(`+`)
  let classes = ``
  let val = 0
  // forward loop as multiple codes together have compound effects
  for (const v of values) {
    val = parseInt(v, 10)
    if (isNaN(val) === true) continue // error
    if (val === 0) toggleSGR = new ResetSGR() // reset to defaults
    // handle colour values
    switch (ecma48.colorDepth) {
      case 1: break // if color depth = 1 bit, then ignore SGR color values
      default:
        if (findForeground(val) === true) toggleSGR.colorF = val
        else if (findBackground(val) === true) toggleSGR.colorB = val
    }
    // handle presentation options
    switch (val) {
      case 1: toggleSGR.bold = !toggleSGR.bold // '!' switches the existing boolean value
        break
      case 2: toggleSGR.faint = !toggleSGR.faint
        break
      case 3: toggleSGR.italic = !toggleSGR.italic
        break
      case 4: toggleSGR.underline = !toggleSGR.underline
        break
      case 5: toggleSGR.blinkSlow = !toggleSGR.blinkSlow
        break
      case 6: toggleSGR.blinkFast = !toggleSGR.blinkFast
        break
      case 7: toggleSGR.inverse = !toggleSGR.inverse
        break
      case 8: toggleSGR.conceal = !toggleSGR.conceal
        break
      case 9: toggleSGR.crossedOut = !toggleSGR.crossedOut
        break
      case 21: toggleSGR.underlineX2 = !toggleSGR.underlineX2
        break
      case 22:
        toggleSGR.bold = false
        toggleSGR.faint = false
        break
      case 23:
        toggleSGR.italic = false
        if (ecma48.font === 20) ecma48.font = 10 // = font not Gothic
        break
      case 24:
        toggleSGR.underline = false
        toggleSGR.underlineX2 = false
        break
      case 25:
        toggleSGR.blinkSlow = false
        toggleSGR.blinkFast = false
        break
      // case 26 is reserved
      case 27:
        toggleSGR.inverse = false
        break
      case 28:
        toggleSGR.conceal = false
        break
      case 29:
        toggleSGR.crossedOut = false
        break
      case 51:
        toggleSGR.framed = !toggleSGR.framed
        break
      case 52:
        toggleSGR.encircled = !toggleSGR.encircled
        break
      case 53:
        toggleSGR.overLined = !toggleSGR.overLined
        break
      case 54:
        toggleSGR.framed = false
        toggleSGR.encircled = false
        break
      case 55:
        toggleSGR.overLined = false
        break
      default:
        if (val >= 10 && val <= 20) ecma48.font = val
    }
    // end of loop
  }
  // handle colours
  // bold/intense foreground
  if (toggleSGR.bold === true && toggleSGR.colorF !== 38 && toggleSGR.colorF >= 30 && toggleSGR.colorF <= 39) classes = `${classes} SGR1${toggleSGR.colorF}`
  else classes = `${classes} SGR${toggleSGR.colorF}` // normal
  // iCE color backgrounds when blink is enabled
  if (ecma48.iceColors === true && (toggleSGR.blinkSlow === true || toggleSGR.blinkFast === true) && toggleSGR.colorB !== 48 && toggleSGR.colorB >= 40 && toggleSGR.colorB <= 49) classes = `${classes} SGR1${toggleSGR.colorB}`
  else classes = `${classes} SGR${toggleSGR.colorB}` // normal
  // presentation options classes
  if (toggleSGR.faint === true) classes = `${classes} SGR2`
  if (toggleSGR.italic === true) classes = `${classes} SGR3`
  if (toggleSGR.underline === true) classes = `${classes} SGR4`
  if (ecma48.iceColors !== true) {
    // disable blinking when iCE colors are in use
    if (toggleSGR.blinkSlow === true) classes = `${classes} SGR5`
    if (toggleSGR.blinkFast === true) classes = `${classes} SGR6`
  }
  if (toggleSGR.inverse === true) classes = `${classes} SGR7`
  if (toggleSGR.conceal === true) classes = `${classes} SGR8`
  if (toggleSGR.crossedOut === true) classes = `${classes} SGR9`
  if (toggleSGR.underlineX2 === true) classes = `${classes} SGR21`
  if (toggleSGR.framed === true) classes = `${classes} SGR51`
  if (toggleSGR.encircled === true) classes = `${classes} SGR52`
  if (toggleSGR.overLined === true) classes = `${classes} SGR53`
  // alternative fonts, values 11…19, 20 is reserved for a Gothic font
  // value 10 is the primary (default) font
  if (ecma48.font > 10 && ecma48.font <= 20) classes = `${classes} SGR${ecma48.font}` // see `text_ecma_48.css` for fonts
  //console.log(`>input '${values}' output> classes: ${classes} bold: ${toggleSGR.bold}`) // uncomment to debug SGR
  return classes.trim()
}
