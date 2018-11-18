// filename: parse_ansi.js
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
  large values. As it can save on browser RAM usage, the use of domObject{html:``} instead of
  ecma48HTML = `` saw a 5-20%(!) reduction for the BuildEcma48() memory footprint.
  https://www.linkedin.com/pulse/25-techniques-javascript-performance-optimization-steven-de-salas
*/
/*eslint no-useless-escape: "warn"*/

// =============================================================
// Sep 2018: This file is due for a rewrite to ES6 class syntax
// =============================================================

"use strict"

if (typeof module === `object`) {
  module.exports.BuildEcma48 = (s, verbose) => {
    const sauce = { version: null }
    return new BuildEcma48(s, sauce, verbose)
  }
}

const cursor = new CursorInit()
const ecma48 = new Ecma48Init()
const domObject = { html: `` }
const sgrObject = new SGRInit()

// ECMA48 Select Graphic Rendition toggles
function SGRInit() {
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
  this.rgbF = `` // rgb foreground css value
  this.rgbB = `` // rgb background css value
}

// Resets const objects created with SGRInit()
async function sgrClear() {
  const v = new SGRInit()
  for (const key in v) {
    sgrObject[key] = v[key]
  }
}

function Ecma48Init() {
  this.other = 0 // number of unsupported ANSI.SYS control sequences found
  this.unknown = 0 // number of unsupported ECMA-48 control sequences found
  this.colorDepth = 4 // Colour depth override if a set/reset mode CSI has requested it.
  this.font = 10 // CSS class values SGR10…20, see text_ecma_48.css for the different font-family values
  this.iceColors = false // iCE color mode which replaces SGR5/6 CSS blink methods with alt. background colours
}

// Resets const objects created with Ecma48Init()
async function ecma48Clear() {
  const v = new Ecma48Init()
  for (const key in v) {
    ecma48[key] = v[key]
  }
}

// Creates a object that is used for tracking the active cursor position
function CursorInit() {
  this.column = 1 // track x axis
  this.row = 1 // track y axis
  this.maxColumns = 80 // maximum columns per line
  this.previousRow = 0 // previous column, used to decide when to inject line breaks
  this.eraseLines = [] // used by the Erase in page and Erase in line
  try {
    if (
      typeof localStorage !== `undefined` &&
      localStorage.getItem(`textAnsiWrap80c`) === `false`
    )
      this.maxColumns = 0 // set to 0 to disable
  } catch (e) {
    /* if localStorage fails the maxColumns has already been set to 80 */
  }
}

// Resets const objects created with CursorInit()
async function cursorClear() {
  const v = new CursorInit()
  for (const key in v) {
    cursor[key] = v[key]
  }
}

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
function BuildEcma48(text = ``, sauce = { version: null }, verbose = false) {
  if (typeof text !== `string`) CheckArguments(`text`, `string`, text)
  if (typeof verbose !== `boolean`)
    CheckArguments(`verbose`, `boolean`, verbose)
  if (typeof qunit !== `undefined`) {
    // for qunit test/tests_browser.js
    console.info(
      `New QUnit test, cursor, domObject and sgrObject have been reset`
    )
    cursorClear()
    domObject.html = ``
    sgrClear()
  }
  ecma48Clear()

  // Priority of configurations
  // 1. SAUCE
  // 2. ANSI SGR
  // 3. hard-coded defaults
  this.colorDepth = ecma48.colorDepth
  this.columns = cursor.maxColumns
  this.font = ``
  this.iceColors = null
  this.rows = 0
  this.lineWrap = sgrObject.lineWrap
  this.htmlString = ``
  this.otherCodesCount = 0
  this.unknownCount = 0
  // SAUCE configurations
  let info = ``
  switch (sauce.version) {
    case `00`:
      this.font = `${sauce.configs.fontFamily}`
      if (sauce.configs.width > 80) {
        // TODO: SAUCE TInfo binary gets corrupted by the browser
        // as a temporary fix un-cap the maxColumns
        if (sauce.configs.width <= 180) cursor.maxColumns = sauce.configs.width
        else {
          cursor.maxColumns = 999
          console.info(`Estimated text columns: ${cursor.maxColumns}`)
        }
      }
      if (sauce.configs.iceColors === `1`) ecma48.iceColors = true
      else ecma48.iceColors = false
      info += `\nWidth: ${sauce.configs.width} columns`
      info += `\nFont: ${sauce.configs.fontName}`
      info += `\niCE Colors: ${Boolean(parseInt(sauce.configs.iceColors, 10))}`
      info += `\nAspect Ratio: ${sauce.configs.aspectRatio}`
      info += `\nLetter Spacing: ${sauce.configs.letterSpacing}`
      info += `\nANSI Flags: ${sauce.configs.flags}`
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
  // regex for HTML modifications
  const emptyTags = new RegExp(/<i class="SGR37 SGR40"><\/i><i id=/gi)
  const insSpace = new RegExp(
    /<div id="row-(\d+)"><i class="SGR(\d+) SGR(\d+)"><\/i><\/div>/gi
  )
  // Clean up string before converting it to decimal values
  // 4/Feb/17 - Hack to deal with HTML entities that mess up the ANSI layout
  //            This hack-fix probably comes with a performance cost.
  text = hideEntities(text)
  // Strip @CLS@ PCBoard code occasionally found in ANSI documents
  if (text.startsWith(`@CLS@`)) {
    text = text.slice(5, text.length)
  }

  // Convert text into Unicode decimal encoded numbers
  const characters = loopBackward(text)

  // Parse special characters
  // note: This function may apply sgrObject = new SGRInit() // reset to defaults
  loopForward(characters, this.lineWrap)
  // close any opened tags
  if (domObject.html.endsWith(`\u241B\u005B\uFFFD\uFFFD`) === true) {
    // hack fix for tail `␛[��`
    if (ecma48.unknown > 0) ecma48.unknown--
    domObject.html = `${domObject.html.slice(0, -27)}</i></div>`
  } else if (domObject.html.endsWith(`</i></div>`) === false) {
    domObject.html = `${domObject.html}</i></div>`
  } else if (domObject.html.endsWith(`</div>`) === true) {
    domObject.html = `${domObject.html.slice(0, -6)}</i></div>`
  }
  // clean any empty tags
  domObject.html = domObject.html.replace(emptyTags, `<i id=`)
  // force the browsers to show the empty rows by injecting a single space character
  domObject.html = domObject.html.replace(
    insSpace,
    `<div id="row-$1"><i class="SGR$2 SGR$3"> </i></div>`
  ) // intentional empty space
  // apply erase lines
  for (let line of cursor.eraseLines) {
    line++ // account for arrays starting at 0 but lines starting at 1
    const exp = new RegExp(`<div id="row-${line}">`, `i`)
    domObject.html = domObject.html.replace(
      exp,
      `<div id="row-${line}" class="ED">`
    )
  }
  // Return HTML5 & unknown control functions count
  this.colorDepth = ecma48.colorDepth
  this.columns = cursor.maxColumns
  if (this.font.length === 0) this.font = parseFont(ecma48.font)
  this.iceColors = ecma48.iceColors
  this.htmlString = domObject.html
  this.otherCodesCount = ecma48.other
  this.rows = cursor.row
  this.unknownCount = ecma48.unknown

  // free up memory
  cursorClear()
  domObject.html = ``
  ecma48Clear()
  sgrClear()
}

// Convert the @text string into Unicode decimal encoded numbers and store those
// values in an array. JavaScript's performance for comparison and manipulation
// is faster using arrays and numeric values than it is using String functions.
// While loops are generally the faster than other loop types but only work in
// reverse.
function loopBackward(text = ``, verbose = false) {
  if (typeof text !== `string`) CheckArguments(`text`, `string`, text)
  if (typeof verbose !== `boolean`)
    CheckArguments(`verbose`, `boolean`, verbose)

  // Convert string to decimal characters
  const decimals = buildDecimalArray(text, verbose)
  const counts = {
    loop: 0, // number of loops passed, used in console.log()
    control: 0, // number of control functions passed so far
    other: 0, // number of unsupported ANSI.SYS control sequences found
    unknown: 0 // number of unsupported ECMA-48 control sequences found
  }
  const ctrl = { code: ``, codes: [], delLen: 0, element: ``, sequence: `` }
  const texts = [] // array container to return
  let i = decimals.length
  console.groupCollapsed(`EMCA-48 parse feedback`)
  while (i--) {
    const decimalChar = decimals[i] // current character as a Unicode decimal value
    counts.loop++
    switch (decimalChar) {
      case null:
        continue
      case 8594:
      case 26:
        // if the last character is `→` then assume this is a MS-DOS 'end of file' mark
        // SGR should be reset otherwise leftover background colours might get displayed
        texts[i] = `SGR+0`
        break
      // fallthrough
      case 155: // handle character value 155 which is our place holder for the Control Sequence Introducer `←[`
        counts.control++
        // *********************************************
        // discover if the control sequence is supported
        // *********************************************
        ctrl.sequence = findControlCode(decimals, i, verbose)
        if (ctrl.sequence === null) {
          // handle unknown sequences
          console.info(
            `Unsupported control function for array item ${i}, character #${
              counts.control
            }`
          )
          // display all unknown controls sequences in the text that could belong to the much larger ECMA-48 standard
          // or proprietary sequences introduced by terminal or drawing programs
          texts[i] = `\u241b` // `esc` control picture
          texts[i + 1] = `[`
          counts.unknown++
          continue
        }
        ctrl.codes = ctrl.sequence.split(`,`)
        ctrl.code = ctrl.codes[0]
        ctrl.delLen = parseInt(ctrl.codes[1], 10) // number of characters to delete when erasing control sequences from the text
        switch (ctrl.code) {
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
            texts.fill(null, i + 2, ctrl.delLen + i + 2) // value, start, end
            // EL (erase line) is supported except when used as an erase in-line sequence
            if (ctrl.code === `EL` && ctrl.codes[2] === `1`) counts.other++
            break
          case `ICE`:
            // strip out iCE colors control sequences
            texts.fill(null, i + 2, ctrl.delLen + i + 6) // value, start, end
            break
          case `CUB`: // cursor back
          case `CUU`: // cursor up
          case `RM`: // restore cursor position
          case `SM`: // save cursor position
          case `/x`: // ansi.sys device driver to remap extended keys
            // strip out unsupported control sequences from the text
            counts.other++
            if (ctrl.delLen > 0) texts.fill(null, i + 2, ctrl.delLen + i + 2) // value, start, end
            if (verbose === true && ctrl.code === `SM`) {
              console.groupCollapsed(`Control function '${ctrl.sequence}'`)
              console.log(
                `At position ${i}, item #${counts.control}, length ${
                  ctrl.codes[1]
                }\nNullify item ${counts.loop} fill ${i + 2} to ${ctrl.delLen +
                  i +
                  1}`
              )
              console.groupEnd()
            }
            break
          // default should not be needed as all unknown sequences should have previously been handled
        }
        // humanise control sequence introducer
        ctrl.element = buildCSI(ctrl.codes, verbose)
        // merge results into the array
        texts[i] = ctrl.element
        // handle any formatting triggers
        switch (ctrl.element) {
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
        // parse characters for display
        texts[i] = `${String.fromCharCode(decimalChar)}` // convert the Unicode decimal character value into a UTF-16 text string
    }
    // end of while-loop
  }
  console.groupEnd()
  ecma48.other = counts.other
  ecma48.unknown = counts.unknown
  return texts
}

// Inject presentation classes into small <i> containers. In HTML4 <i> were
// simply italic styles but in HTML5 they "represent a range of text that is
// set off from the normal text for some reason"
// @items  An array containing Unicode decimal text
function loopForward(items = [], lineWrap) {
  if (typeof items !== `object`) CheckArguments(`items`, `array`, items)

  function itag() {
    switch (
      item.value.split(`+`)[0] // get CSI name
    ) {
      case `SGR`:
        return renditionItalic(item.value)
      default:
        return renditionItalic()
    }
  }

  // remove empty items in the array and unused control sequences
  if (lineWrap === false) {
    // also remove newline characters
    items = items.filter(item => {
      return (
        item !== `\n` && (item !== (undefined || null) && item.length !== 0)
      )
    })
  } else {
    items = items.filter(item => {
      return item !== (undefined || null) && item.length !== 0
    })
  }

  // determine the first row
  const findRow1 = domObject.html.slice(0, 100)
  const row1 = {
    start: findRow1.startsWith(`<div id="row-1"`),
    index: findRow1.indexOf(`<div id="row-1"`, 0)
  }
  const item = {
    row1: false,
    value: `` /* value = a control code, character or null */
  }
  let i = 0
  for (item.value of items) {
    i += 1
    // Handle items
    switch (item.value.length) {
      case 0:
        continue // 0 length is skipped
      case 1: // 1 length is a single character to display
        if (item.value !== undefined) {
          parseCharacter(item.value)
          break
        }
      // fallthrough
      default:
        // greater than 1 length is a control function
        parseCtrlName(i, item.value)
    }

    // handle first row HTML
    if (item.row1 === false && row1.start === false && row1.index === -1) {
      if ([`ICE+1`, `ICE+0`].includes(items[0])) {
        domObject.html = `<div id="row-1">`
      } else {
        domObject.html = `<div id="row-1">${itag()}${domObject.html}`
      }
      item.row1 = true
    } else if (i <= 2 && domObject.html.startsWith(`<div id="row-1"></i>`)) {
      domObject.html = domObject.html.replace(
        `<div id="row-1"></i>`,
        `<div id="row-1">`
      ) // handle malformed tags due to iCE color triggers
    }
  }
}

// the following functions listed in named, alphabetical order

// Takes control sequences and returns either their humanised acronyms or
// HTML tags and entities.
// @a       Array of text characters represented in Unicode decimal values
function buildCSI(a = []) {
  if (typeof a !== `object`) CheckArguments(`a`, `array`, a)

  if (a.length === 0) return ``
  const cs = { next1: 0, next2: 0, str: ``, value1: 0, value2: 0 }
  const element = a[0],
    values = a.slice(1),
    valuesLen = values.length

  if (valuesLen > 1) cs.value1 = parseInt(values[1], 10)
  if (valuesLen > 2) cs.value2 = parseInt(values[2], 10)

  switch (element) {
    case `RGB`:
      // make 1 = 38 & - = 48, pass on rgb values
      cs.str = `SGR+`
      if (parseInt(cs.value1) === 0) {
        cs.str += `4`
      } else {
        cs.str += `3`
      }
      cs.str += `8+2+${a[3]}+${a[4]}+${a[5]}`
      break
    case `ICE`:
      cs.str = `${element}+${cs.value1}` // ICE colors
      break
    case `CUD`: // cursor move down
    case `CUF`: // forward
    case `ED`: // erase in page
    case `EL`: // erase in line
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
        const value = parseInt(values[i], 10)
        // handle 256 colour codes
        if ([38, 48].includes(value) && valuesLen - i > 1) {
          cs.next1 = parseInt(values[i + 1], 10)
          cs.next2 = parseInt(values[i + 2], 10)
          if (cs.next1 === 5 && cs.next2 >= 0 && cs.next2 <= 255) {
            cs.str += `+${value}${cs.next2}`
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
        if (element === `RM`) cs.str = `LW+0`
        // disable
        else if (element === `SM`) cs.str = `LW+1` // enable
      } else {
        // all other modes
        cs.str = `SM+${cs.value1}`
      }
      break
    default:
      console.warn(
        `Unsupported element '${element}' passed through to buildCSI()`
      )
  }
  // all other controls are ignored
  return cs.str
}

// Stringify Unicode decimal values into a cursor position function
// @c   mode encoded as Unicode decimal
// @v   Array of text characters represented in Unicode decimal values
function buildCU(c = 0, v = [0], verbose = false) {
  if (typeof c !== `number`) CheckArguments(`c`, `number`, c)
  if (typeof v !== `object`) CheckArguments(`v`, `array`, v)

  function codes() {
    switch (c) {
      case 65:
        return `CUU`
      case 66:
        return `CUD`
      case 67:
        return `CUF`
      case 68:
        return `CUB`
    }
    return ``
  }

  const code = codes()
  let value = ``
  for (const chr of v) {
    if (chr === 0) {
      value += `${String.fromCharCode(49)}` // default value of 1 if no value is given
    } else {
      value += `${String.fromCharCode(chr)}`
    }
  }
  if (verbose)
    console.log(`Cursor move ${value} positions ${humanizeCursor(c)}`)
  const length = v.length + 1
  if (v.length === 1 && v[0] === 0) {
    return `${code},1,${value}` // no parameters are given
  }
  return `${code},${length},${value}`
}

// Converts a string of text into Unicode decimal values and splits them into an
// array which are processed faster.
// @s       String of text
function buildDecimalArray(s = ``, verbose = false) {
  if (typeof s !== `string`) CheckArguments(`s`, `string`, s)
  if (typeof verbose !== `boolean`)
    CheckArguments(`verbose`, `boolean`, verbose)

  const d0 = new Date().getTime()
  let i = s.length
  const ua = new Array(i)
  // while loops are faster
  while (i--) {
    const cca = s.charCodeAt(i)
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
  if (verbose) {
    const d1 = new Date().getTime()
    console.log(
      `Time taken to process buildDecimalArray: ${d1 - d0} milliseconds`
    )
  }
  return ua
}

// Creates white space to simulate a cursor position forward request
// As such the white space should not have any presentation controls applied
// to it such as background colours.
// @count   The number of places to move, if 0 then build to the end of the line
async function buildNewColumns(count = 1) {
  if (typeof count !== `number`) CheckArguments(`count`, `number`, count)
  else if (count < 0) CheckRange(`count`, `small`, `0`, count)

  function cp() {
    if (count === 0) {
      if (cursor.column === 1) return cursor.maxColumns
      else if (cursor.maxColumns > 0) return cursor.maxColumns - cursor.column
      return count
    }
    return count
  }

  const places = cp()
  const endPosition = cursor.column + places - 1
  const itag = renditionItalic()
  if (cursor.column === endPosition)
    domObject.html = `${domObject.html}</i><i id="column-${
      cursor.column
    }" class="SGR0">${` `.repeat(places)}</i>${itag}`
  else
    domObject.html = `${domObject.html}</i><i id="column-${
      cursor.column
    }-to-${endPosition}" class="SGR0">${` `.repeat(places)}</i>${itag}`
  handleColumn(places)
}

// Stringify Unicode decimal values into a character and line position function
// @v   Array of text characters represented in Unicode decimal values
function buildHVP(v = [], verbose = false) {
  if (typeof v !== `object`) CheckArguments(`v`, `array`, v)
  if (typeof verbose !== `boolean`) CheckArguments(`prefix`, `boolean`, verbose)

  const length = v.length + 1
  const hvp = { row: ``, column: ``, mode: `m` }
  if (v.length === 0) v = [49, 59, 49]
  for (const chr of v) {
    // if character is a semicolon ; then switch modes
    if (chr === 59) {
      hvp.mode = `n`
      continue
    }
    if (hvp.mode === `n`)
      hvp.column = hvp.column.concat(String.fromCharCode(chr))
    // keep concat to avoid \n injection
    else if (hvp.mode === `m`) hvp.row = `${hvp.row}${String.fromCharCode(chr)}`
  }
  // if no values were provided then use defaults of 1
  if (hvp.row === `` || hvp.row === `0`) hvp.row = `1`
  if (hvp.column === `` || hvp.column === `0`) hvp.column = `1`
  if (verbose)
    console.log(
      `Cursor repositioned to row ${hvp.row} and column ${hvp.column}`
    )
  return `HVP,${length},${hvp.row},${hvp.column}`
}

// Create line break tag to simulate a cursor position down request
// @count   The number of places to move
// @columns If set to 1 or greater then also position the cursor forward by
//          this many places.
async function buildNewRows(count = 1, columns = 0) {
  if (typeof count !== `number`)
    CheckError(
      `'count' argument must be an unsigned number, not a ${typeof count}`,
      true
    )
  else if (count < 1) CheckRange(`count`, `small`, `1`, count)
  if (typeof columns !== `number`)
    CheckError(
      `'columns' argument must be an unsigned number, not a ${typeof columns}`,
      true
    )
  else if (columns < 0) CheckRange(`columns`, `small`, `0`, columns)

  const itag = renditionItalic()
  for (let i = 0; i < count; i++) {
    cursor.row++
    handleColumn(0) // reset columns
    domObject.html += `</i></div><div id="row-${cursor.row}">${itag}`
  }
  //domObject.html += `${itag}`
  cursor.previousRow = cursor.row
  // always build columns AFTER rows and outside of the loop
  if (columns > 0) buildNewColumns(columns)
}

// Stringify Unicode decimal values into the set mode function.
// This is not compatible with the ECMA-48 set mode function as it is based
// on Microsoft's ANSI.SYS driver.
// @c       mode encoded as Unicode decimal
// @v       Array of text characters represented in Unicode decimal values
// @prefix  Was the value in the ANSI element prefixed with a symbol?
//          ANSI.SYS permits '=' '?' '>' ie ←[=13h and ←[?13h
function buildSM(c = 0, v = [0, 0], prefix = true) {
  if (typeof c !== `number`) CheckArguments(`c`, `number`, c)
  if (typeof v !== `object` && v !== `undefined`)
    CheckArguments(`v`, `array`, v)
  if (v.length < 1) CheckRange(`v.length`, `small`, v.length) // set to 1?
  if (typeof prefix !== `boolean`) CheckArguments(`prefix`, `boolean`, prefix)

  const sm = { code: `SM`, length: v.length + 1, value: `` }
  if (v.length > 1 && v[1] > 0)
    sm.value = `${String.fromCharCode(v[0])}${String.fromCharCode(v[1])}`
  else sm.value = `${String.fromCharCode(v[0])}`
  if (prefix === true) sm.length++
  if (c === 108) sm.code = `RM`
  return `${sm.code},${sm.length},${sm.value}`
}

// Converts arrays containing Unicode decimal values back into plain text strings.
// @a       Array containing Unicode decimals
function buildTextChars(a = [], verbose = false) {
  if (typeof a !== `object`) CheckArguments(`a`, `array`, a)
  if (typeof verbose !== `boolean`)
    CheckArguments(`verbose`, `boolean`, verbose)

  const d0 = new Date().getTime()
  let i = a.length
  // while loops are faster
  while (i--) {
    switch (a[i]) {
      case null:
        continue
      case 155:
        a[i] = `\e[`
        break
      default:
        a[i] = String.fromCharCode(a[i])
    }
  }
  const str = a.join(``) // convert array to string with no separator
  if (verbose) {
    const d1 = new Date().getTime()
    console.log(`Time taken to process buildTextChars: ${d1 - d0} milliseconds`)
  }
  return str
}

// Used by RenditionParse() to see if `v` matches a valid Select Graphic Rendition, background color
// @v   Decimal value of a CSI
function findBackground(v) {
  if (
    (v >= 40 && v <= 49) ||
    (v >= 480 && v <= 489) ||
    (v >= 4810 && v <= 4899) ||
    (v >= 48100 && v <= 48255)
  ) {
    if (v >= 480 && typeof ecma48.colorDepth === `number`) ecma48.colorDepth = 8 // x-term 256 color found
    return true
  }
  return false
}

// Scans a slice of text that has previously been converted into Unicode
// decimals to find any ECMA-48 control sequences.
// @a       Array of text characters represented in Unicode decimal values.
//          Usually it will contain a complete text document.
// @pos     The position within the array to start the search for a control sequence.
// @verbose Spam the console with information about each discovered control sequence.
function findControlCode(a = [], pos = 0, verbose = true) {
  if (typeof a !== `object`) CheckArguments(`a`, `array`, a)
  if (typeof pos !== `number`) CheckArguments(`pos`, `number`, pos)
  else if (pos < 0) CheckRange(`pos`, `small`, `0`, pos)
  if (typeof verbose !== `boolean`)
    CheckArguments(`verbose`, `boolean`, verbose)

  const i = pos + 2 // skip saved escape and null values
  // look-ahead character containers as control sequences use multiple characters
  // of varying length.
  const lac = {
    c0: a[i],
    c1: a[i + 1],
    c2: a[i + 2],
    c3: a[i + 3],
    c4: a[i + 4]
  }
  // look-ahead objects that will be used with deeper scan while-loops
  // slices of text for scanning for control codes
  const slices = {
    cap9: a.slice(i, i + 8), // for performance, set a 9 character cap for most scans
    sgr: a.slice(i, i + 47), // cap SGR scans to 48 characters, a lower value improves performance but RGB values are long
    rgb: a.slice(i, i + 14) // PabloDraw RGB 't' values are never longer than 15 characters
  }
  // discover digits
  const num = {
    c0: findDigit(lac.c0),
    c1: findDigit(lac.c1),
    c2: findDigit(lac.c2),
    c3: findDigit(lac.c3)
  }
  // look for SGR & HVP codes
  const find = {
    f: slices.cap9.indexOf(102), // Horizontal and Vertical Position
    H: slices.cap9.indexOf(72), // Cursor Position
    m: slices.sgr.indexOf(109), // Select Graphic Rendition
    t: slices.rgb.indexOf(116) // PabloDraw RGB code
  }
  // Horizontal and vertical position object
  const hvp = { code: ``, ctrl: true, flag: 0, loop: -1, scan: -1 }
  // Select Graphic Rendition object
  const sgr = { loop: -1, code: ``, ctrl: true, str: `` }
  // PabloDraw RGB object
  const rgb = { arr: [], join: ``, slice: [], str: ``, valid: true }
  // handle control functions with either no or fixed numeric parameters first
  // SGR - Select Graphic Rendition
  if (lac.c0 === 109) return `SGR,1,0`
  // ←[m reset to defaults
  else if (lac.c1 === 109 && num.c0)
    return `SGR,2,${String.fromCharCode(lac.c0)}`
  // ←[1m
  else if (lac.c2 === 109 && num.c0 && num.c1)
    return `SGR,3,${String.fromCharCode(lac.c0)}${String.fromCharCode(lac.c1)}` // ←[31m
  // HVP, CUP - Horizontal and vertical position and Cursor Position reset, match ←[H ←[f
  if (lac.c0 === 72 || lac.c0 === 102) return buildHVP()
  // CUU, CUD, CUF, CUB - Cursor up, down, forward, back
  if (findCursor(lac.c0)) return buildCU(lac.c0) // ←[A move 1 place
  if (num.c0 && findCursor(lac.c1)) return buildCU(lac.c1, [lac.c0]) // ←[5A move multiple places
  if (num.c0 && num.c1 && findCursor(lac.c2))
    return buildCU(lac.c2, [lac.c0, lac.c1]) // ←[60A move tens of places
  if (num.c0 && num.c1 && num.c2 && findCursor(lac.c3))
    return buildCU(lac.c3, [lac.c0, lac.c1, lac.c2]) // ←[555A move hundreds of places
  if (num.c0 && num.c1 && num.c2 && num.c3 && findCursor(lac.c4))
    return buildCU(lac.c4, [lac.c0, lac.c1, lac.c2, lac.c3]) // ←[1523A move thousands of places
  // SM, RM - Set screen mode and Reset screen mode
  if (
    (lac.c3 === 104 || lac.c3 === 108) &&
    lac.c0 >= 61 &&
    lac.c0 <= 63 &&
    lac.c1 === 49 &&
    lac.c2 >= 51 &&
    lac.c2 <= 56
  )
    return buildSM(lac.c3, [lac.c1, lac.c2]) // ←[=13h 2 digit mode with a character prefix
  if (
    (lac.c2 === 104 || lac.c2 === 108) &&
    lac.c0 >= 61 &&
    lac.c0 <= 63 &&
    num.c1
  )
    return buildSM(lac.c2, [lac.c1]) // ←[?0h 1 digit mode with a character prefix
  if (
    (lac.c2 === 104 || lac.c2 === 108) &&
    lac.c0 === 49 &&
    lac.c1 >= 51 &&
    lac.c1 <= 56
  )
    return buildSM(lac.c2, [lac.c0, lac.c1], false) // ←[13h 2 digit mode
  if ((lac.c1 === 104 || lac.c1 === 108) && num.c0)
    return buildSM(lac.c1, [lac.c0], false) // ←[13h 1 digit mode
  // ED - Erase in page, match ←[J, ←[0J, ←[1J, ←[2J
  if (lac.c0 === 74) return `ED,1,0`
  else if (lac.c1 === 74 && lac.c0 >= 48 && lac.c0 <= 50)
    return `ED,2,${String.fromCharCode(lac.c0)}`
  // EL - Erase in line, match ←[K, ←[0K, ←[1K, ←[2K
  if (lac.c0 === 75) return `EL,1,0`
  else if (lac.c1 === 75 && lac.c0 >= 48 && lac.c0 <= 50)
    return `EL,2,${String.fromCharCode(lac.c0)}`
  // SCP - Save Cursor Position, match ←[s
  // it is commonly used for handling newline breaks
  if (lac.c0 === 115 && lac.c1 === 10) return `NULL,5`
  else if (lac.c0 === 115) return `SCP,1`
  // RCP - restore Cursor Position, match ←[u
  if (lac.c0 === 117) return `RCP,1`
  // ANSI.SYS extended keyboard support (non-standard), match ←[0q, ←[1q
  if (lac.c1 === 113 && (lac.c0 === 48 || lac.c0 === 49))
    return `/x,2,${String.fromCharCode(lac.c0)}`
  // Non-standard code used by PabloDraw and
  if (lac.c0 === 63) {
    // ←[?33h and ←[?33l, ICE colors
    if (lac.c1 === 51 && lac.c2 === 51) {
      // see comments http://picoe.ca/forums/topic/need-pablodraw-ansi-escape-codes-descriptionsourcelist/
      if (lac.c3 === 108) return `ICE,0,0`
      // l, disable
      else if (lac.c3 === 104) return `ICE,0,1` // h, enable
    }
  }
  // Look for PabloDraw RGB codes http://picoe.ca/2014/03/07/24-bit-ansi/
  if (find.t > -1) {
    rgb.slice = slices.rgb.slice(0, find.t + 1)
    for (const t of rgb.slice) {
      if (t === 116) break
      rgb.join += String.fromCharCode(t)
    }
    rgb.arr = rgb.join.split(`;`)
    if (rgb.arr.length !== 4) rgb.valid = false
    else if ([`0`, `1`].includes(rgb.arr[0]) !== true) rgb.valid = false
    else if (rgb.arr[1] < 0 || rgb.arr[1] > 255) rgb.valid = false
    else if (rgb.arr[2] < 0 || rgb.arr[2] > 255) rgb.valid = false
    else if (rgb.arr[3] < 0 || rgb.arr[3] > 255) rgb.valid = false
    if (rgb.valid === true) {
      rgb.str += rgb.arr.join()
      rgb.str = `RGB,${rgb.str.length + 1},${rgb.str}`
      return rgb.str
    }
  }
  // handle control functions with variable parameters
  // SGR - Select Graphic Rendition
  // look for SGR
  // if scan found an SGR then process its values
  if (find.m > -1) {
    sgr.loop = find.m
    while (sgr.loop--) {
      sgr.code = a[i + sgr.loop]
      // confirm scanned character (character 59 is a semicolon `;`)
      if (sgr.code !== 109) {
        // not m
        if (findDigit(sgr.code) === false && sgr.code !== 59) {
          sgr.ctrl = false
          break
        } else if (sgr.code === 59) sgr.str = `,${sgr.str}`
        else sgr.str = `${String.fromCharCode(sgr.code)}${sgr.str}`
      }
    }
    if (sgr.ctrl === true) {
      if (verbose)
        console.log(
          `Text rendition attributes found, 'SGR,${sgr.str.length + 1},${
            sgr.str
          }'`
        )
      return `SGR,${sgr.str.length + 1},${sgr.str}`
    }
  }
  // HVP, CUP - Horizontal & vertical position and Cursor Position
  if (find.H >= 0 && (find.f === -1 || find.H < find.f)) {
    // Scan for the letter `H` in chars, identifies CUP
    hvp.flag = 72
    hvp.scan = find.H
  } else if (find.f >= 0 && (find.H === -1 || find.f < find.H)) {
    // Scan for the letter `f` in chars, identifies HVP
    hvp.flag = 102
    hvp.scan = find.f
  }
  // if one of the scans found an hvp.flag, then process its values
  if (hvp.scan > -1) {
    hvp.loop = hvp.scan
    while (hvp.loop--) {
      hvp.code = a[i + hvp.loop]
      // confirm scanned character is H or ; or 0-9
      if (
        hvp.code !== hvp.flag &&
        hvp.code !== 59 &&
        findDigit(hvp.code) === false
      ) {
        hvp.ctrl = false
        break
      }
    }
    if (hvp.ctrl === true) {
      if (verbose)
        console.log(
          `Cursor position change command found, '${buildTextChars(
            slices.cap9.slice(0, hvp.scan)
          )}'`
        )
      return buildHVP(slices.cap9.slice(0, hvp.scan))
    }
  }
  // if no known control sequences are found then return null
  return null
  // end of findControlCode() function
}

function findCursor(
  c = 0 // Is the character a Final Byte used for cursor positioning? // CCU, CUD, CUF, CUB // @c   character encoded as Unicode decimal
) {
  if (typeof c !== `number`) CheckArguments(`c`, `number`, c)
  if (c >= 65 && c <= 68) return true
  return false
}

function findDigit(
  c = 0 // Is the character a digit (0...9)? // @c   character encoded as Unicode decimal
) {
  if (typeof c !== `number` && c !== null) CheckArguments(`c`, `number`, c)
  if (c >= 48 && c <= 57) return true
  return false
}

// Used by RenditionParse() to see if `v` matches a valid Select Graphic Rendition, foreground color
// @v   Decimal value of a CSI
function findForeground(v) {
  if (
    (v >= 30 && v <= 39) ||
    (v >= 380 && v <= 389) ||
    (v >= 3810 && v <= 3899) ||
    (v >= 38100 && v <= 38255)
  ) {
    if (v >= 380 && typeof ecma48.colorDepth === `number`) ecma48.colorDepth = 8 // x-term 256 color found
    return true
  }
  return false
}

// Automatically resets the column forward position to the beginning of the line
// after @count has reached 80 columns.
// @count The number of characters or places that have been displayed.
//        If @count is set to 0 then a forced reset will be applied to cursor.column.
function handleColumn(count = 1) {
  if (typeof count !== `number`) CheckArguments(`count`, `number`, count)
  else if (count < 0) CheckRange(`count`, `small`, `0`, count)

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

// Hide HTML entities that break the formatting of ANSI documents
// @s String of text
function hideEntities(s = ``) {
  if (typeof s !== `string`) CheckArguments(`s`, `string`, s)
  const rgt = new RegExp(`&gt;`, `gi`)
  const rlt = new RegExp(`&lt;`, `gi`)
  const ramp = new RegExp(`&amp;`, `gi`)
  // replace matches
  s = s.replace(rgt, `⮚`)
  s = s.replace(rlt, `⮘`)
  s = s.replace(ramp, `⮙`)
  return s
}

// Decode Unicode decimal values into readable strings
// @c   character encoded as Unicode decimal
function humanizeCursor(c = 0) {
  return () => {
    switch (c) {
      case 65:
        return `up`
      case 66:
        return `down`
      case 67:
        return `right`
      case 68:
        return `left`
      default:
        return null
    }
  }
}

// Parse markers and special characters in domObject.html
// @c Character as string
function parseCharacter(c = ``) {
  if (typeof c !== `string`) CheckArguments(`c`, `string`, c)
  switch (c) {
    case `\n`:
      buildNewRows()
      break // we replace newline controls with <br> tags
    case `⮚`:
      domObject.html = `${domObject.html}&gt;`
      break
    case `⮘`:
      domObject.html = `${domObject.html}&lt;`
      break
    case `⮙`:
      domObject.html = `${domObject.html}&amp;`
      break
    default:
      domObject.html = `${domObject.html}${c}` // append character to HTML
      handleColumn()
  }
}

// Parse control sequences
// @i     Current forwardLoop() count
// @item  A control code, character or null
function parseCtrlName(i = 0, item = ``) {
  if (typeof i !== `number`) CheckArguments(`i`, `number`, i)
  if (typeof item !== `string`) CheckArguments(`item`, `string`, item)
  if (item.length < 1) CheckRange(`item`, `length`, `1`, item)

  function parseItem() {
    const i2 = items[2]
    if (typeof i2 !== `undefined`) return parseInt(i2, 10)
    return 0
  }

  const control = item.slice(0, 3) // obtain control name
  const items = item.split(`+`)
  const item1 = parseInt(items[1], 10)
  const item2 = parseItem()

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
        else if (
          cursor.maxColumns !== 0 &&
          item1 + cursor.column <= cursor.maxColumns
        )
          buildNewColumns(item1)
      }
      break
    case `HVP`: // horizontal vertical position (HVP) & cursor position (CUP)
      //console.log(`HVP is in use @ ${cursor.row}x${cursor.column} to move to ${item1}x${item2}.`);
      //cursor.maxColumns = 0 // disable maxColumns because HVP is in use.
      cursor.previousRow = cursor.row
      if (
        item1 < cursor.row ||
        (item1 === cursor.row && item2 < cursor.column)
      ) {
        // RetroTxt doesn't support the backwards movement of the cursor
        ecma48.other++
      } else if (item1 > cursor.row) {
        if (item2 === 1) buildNewRows(item1 - cursor.row, 0)
        // reset columns
        else buildNewRows(item1 - cursor.row, item2)
      } else if (item2 > cursor.column) {
        buildNewColumns(item2)
      }
      break
    case `ICE`: // iCE colors
    case `SGR`: // select graphic
      if (control === `ICE`) {
        switch (item1) {
          case 0:
            ecma48.iceColors = false
            break
          case 1:
            ecma48.iceColors = true
            break
        }
      }
      if (i > 1) {
        const itag = renditionItalic(item)
        domObject.html += `</i>${itag}`
      }
      break
    case `ED+`: // erase in page
      switch (item1) {
        case 0:
          buildNewColumns(0)
          break // [incomplete, currently just goes to the end of the line] erase from cursor to end of the screen (-ANSI.SYS)
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
        case 0:
          buildNewColumns(0)
          break // go to end of the line
        case 1:
          break // [not supported] clear from cursor to the beginning of the line (-ANSI.SYS)
        case 2:
          cursor.eraseLines.push(cursor.row - 1)
          break // erase line (-ANSI.SYS)
      }
      break
    case `SM+`: // set modes (non-standard MS-DOS ANSI.SYS)
      {
        const psm = new ParseSetMode(parseInt(item1))
        ecma48.colorDepth = psm.colorDepth
        ecma48.font = psm.font
        ecma48.maxColumns = psm.maxColumns
      }
      break
    default:
      console.warn(
        `parseCtrlName() tried to parse this unknown control '${item}'`
      )
  }
}

// Translates the SGR numeric ranges (10...20) into CSS font-family values
function parseFont(f = 10) {
  if (typeof f !== `number`) CheckArguments(`f`, `number`, f)

  switch (f) {
    case 10: // use Option selection
    case 20:
      return null // gothic font (not implemented due to a lack of a suitable font)
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

function ParseSetMode(sm = -1) {
  if (typeof sm !== `number`) CheckArguments(`sm`, `number`, sm)
  else if (sm < 0) CheckRange(`sm`, `small`, `0`, sm)
  else if (sm > 19) CheckRange(`sm`, `large`, `19`, sm)

  this.colorDepth = -1
  this.font = -1
  this.maxColumns = 80
  const v = [`4-bit`, `VGA`, `80`] // -1 = invalid
  // set colour depth
  if ([0, 2, 5, 6, 15, 17].includes(sm)) {
    this.colorDepth = 1
    v[0] = `1-bit`
  } // monochrome 1-bit colour
  else if ([5, 6].includes(sm)) {
    this.colorDepth = 0
    v[0] = `4-bit monochrome`
  } // grey scale 4-bit colour
  else if ([1, 3, 4].includes(sm)) {
    this.colorDepth = 2
    v[0] = `2-bit`
  } // magenta 2-bit colours
  else if ([13, 14, 16, 18].includes(sm)) {
    this.colorDepth = 4
    v[0] = `4-bit`
  } // 4-bit colours
  else if (sm === 19) {
    this.colorDepth = 8
    v[0] = `8-bit [unsupported]`
  } // 8-bit colours
  // set resolution (but in our HTML/CSS output we only switch the font)
  if (sm === 2) this.font = 19
  // MDA font 80×25
  else if ([0, 1, 4, 5, 13, 19].includes(sm)) this.font = 12
  // CGA font
  else if ([6, 14].includes(sm)) this.font = 13
  //  CGA higher resolution
  else if ([3, 15, 16].includes(sm)) this.font = 15
  // EGA font
  else if ([17, 18].includes(sm)) this.font = 17 // VGA font
  // number of columns
  if (sm === 0 || sm === 1) this.maxColumns = 40
  console.info(`Set mode applied, ${v[0]} ${v[1]} in ${v[2]} columns mode`)
}

function renditionItalic(
  vals = ``,
  verbose = false // Constructs an <i> tag based on the current styles and classes in use // @vals          SGR parameter values or ANSI.SYS text attributes
) {
  const rp = new RenditionParse(vals)
  if (verbose && vals === `SGR+38+2+0+103+108`) {
    console.group(`renditionItalic(${vals})`)
    console.groupEnd()
  }
  if (rp.style !== `` && rp.class !== ``) {
    return `<i class="${rp.class}" style="${rp.style}">`
  } else if (rp.class !== ``) {
    return `<i class="${rp.class}">`
  } else if (rp.style !== ``) {
    return `<i style="${rp.style}">`
  }
  return ``
}

// Creates CSS classes to apply presentation changes to text
// These are based on ECMA-48 which are backwards compatible with Microsoft's
// MS-DOS ANSI.SYS implementation.
// see 8.3.117 SGR - SELECT GRAPHIC RENDITION
// http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-048.pdf
// @vals          SGR parameter values or ANSI.SYS text attributes
function RenditionParse(vals = ``, verbose = false) {
  const values = vals.split(`+`)
  this.classes = ``
  this.styles = ``
  // forward loop as multiple codes together have compound effects
  for (const v of values) {
    if (v === null) continue
    const val = parseInt(v, 10)
    if (isNaN(val) === true) continue // error
    if (val === 0 && vals !== `ICE+0`) {
      if (verbose) console.info(`SGRInit()`)
      sgrClear()
      //sgrObject = new SGRInit() // reset to defaults
    }
    // handle colour values
    switch (ecma48.colorDepth) {
      case 1:
        break // if color depth = 1 bit, then ignore SGR color values
      default:
        if ([38, 48].includes(val) && values[2] === `2`) {
          const r = parseInt(values[3], 10)
          const g = parseInt(values[4], 10)
          const b = parseInt(values[5], 10)
          if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
            values[2] = values[3] = values[4] = values[5] = null
            ecma48.colorDepth = 24
            if (val === 38) {
              sgrObject.colorF = null
              sgrObject.rgbF = `color:rgb(${r},${g},${b});`
              if (sgrObject.rgbB.length > 0)
                this.styles += sgrObject.rgbF + sgrObject.rgbB
              else this.styles += sgrObject.rgbF
            } else if (val === 48) {
              sgrObject.colorB = null
              sgrObject.rgbB = `background-color:rgb(${r},${g},${b});`
              if (sgrObject.rgbF.length > 0)
                this.styles = sgrObject.rgbF + sgrObject.rgbB
              else this.styles += sgrObject.rgbB
            }
            continue
          }
        } else if (findForeground(val) === true) {
          sgrObject.colorF = val
          sgrObject.rgbF = ``
          if (sgrObject.rgbB.length > 0) this.styles = sgrObject.rgbB
        } else if (findBackground(val) === true) {
          sgrObject.colorB = val
          sgrObject.rgbB = ``
          if (sgrObject.rgbF.length > 0) this.styles = sgrObject.rgbF
        }
    }
    // handle presentation options
    switch (val) {
      case 1:
        sgrObject.bold = !sgrObject.bold
        break // '!' switches the existing boolean value
      case 2:
        sgrObject.faint = !sgrObject.faint
        break
      case 3:
        sgrObject.italic = !sgrObject.italic
        break
      case 4:
        sgrObject.underline = !sgrObject.underline
        break
      case 5:
        sgrObject.blinkSlow = !sgrObject.blinkSlow
        break
      case 6:
        sgrObject.blinkFast = !sgrObject.blinkFast
        break
      case 7:
        sgrObject.inverse = !sgrObject.inverse
        break
      case 8:
        sgrObject.conceal = !sgrObject.conceal
        break
      case 9:
        sgrObject.crossedOut = !sgrObject.crossedOut
        break
      case 21:
        sgrObject.underlineX2 = !sgrObject.underlineX2
        break
      case 22:
        sgrObject.bold = false
        sgrObject.faint = false
        break
      case 23:
        sgrObject.italic = false
        if (ecma48.font === 20) ecma48.font = 10 // = font not Gothic
        break
      case 24:
        sgrObject.underline = false
        sgrObject.underlineX2 = false
        break
      case 25:
        sgrObject.blinkSlow = false
        sgrObject.blinkFast = false
        break
      // case 26 is reserved
      case 27:
        sgrObject.inverse = false
        break
      case 28:
        sgrObject.conceal = false
        break
      case 29:
        sgrObject.crossedOut = false
        break
      case 51:
        sgrObject.framed = !sgrObject.framed
        break
      case 52:
        sgrObject.encircled = !sgrObject.encircled
        break
      case 53:
        sgrObject.overLined = !sgrObject.overLined
        break
      case 54:
        sgrObject.framed = false
        sgrObject.encircled = false
        break
      case 55:
        sgrObject.overLined = false
        break
      default:
        if (val >= 10 && val <= 20) ecma48.font = val
    }
    // end of loop
  }
  // handle colours
  // bold/intense foreground
  if (
    sgrObject.bold === true &&
    sgrObject.colorF !== 38 &&
    sgrObject.colorF >= 30 &&
    sgrObject.colorF <= 39
  )
    this.classes += ` SGR1${sgrObject.colorF}`
  else if (sgrObject.colorF !== null) this.classes += ` SGR${sgrObject.colorF}` // normal
  // backgrounds when blink is enabled
  if (sgrObject.colorB !== null) this.classes += ` SGR${sgrObject.colorB}`
  // presentation options this.classes
  if (sgrObject.faint === true) this.classes += ` SGR2`
  if (sgrObject.italic === true) this.classes += ` SGR3`
  if (sgrObject.underline === true) this.classes += ` SGR4`
  if (sgrObject.blinkSlow === true) this.classes += ` SGR5`
  if (sgrObject.blinkFast === true) this.classes += ` SGR6`
  if (sgrObject.inverse === true) this.classes += ` SGR7`
  if (sgrObject.conceal === true) this.classes += ` SGR8`
  if (sgrObject.crossedOut === true) this.classes += ` SGR9`
  if (sgrObject.underlineX2 === true) this.classes += ` SGR21`
  if (sgrObject.framed === true) this.classes += ` SGR51`
  if (sgrObject.encircled === true) this.classes += ` SGR52`
  if (sgrObject.overLined === true) this.classes += ` SGR53`
  // alternative fonts, values 11…19, 20 is reserved for a Gothic font
  // value 10 is the primary (default) font
  if (ecma48.font > 10 && ecma48.font <= 20)
    this.classes += ` SGR${ecma48.font}` // see `text_ecma_48.css` for fonts
  //console.log(`>input '${values}' output> this.classes: ${this.classes} bold: ${sgrObject.bold}`) // uncomment to debug SGR
  if (verbose && vals === `SGR+38+2+0+103+108`) {
    console.group(`RenditionParse(${vals})`)
    console.info(sgrObject)
    console.groupEnd()
  }
  this.class = this.classes.trim()
  this.style = this.styles.trim()
}
