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

"use strict";

function SgrDefaults()
// Default SGR parameters
{
  this.bold = false; // value 1
  this.faint = false; // value 2
  this.italic = false; // value 3
  this.underline = false; // value 4
  this.blinkSlow = false; // value 5
  this.blinkFast = false; // value 6
  this.inverse = false; // value 7
  this.conceal = false; // value 8
  this.crossedOut = false; // value 9
  this.font = 10; // values 10…20
  this.underlineX2 = false; // value 21
  this.framed = false; // value 51
  this.encircled = false; // value 52
  this.overLined = false; // value 53
  // colours
  this.colorF = 37; // foreground (text colour)
  this.colorB = 40; // background
}

function ListCursorDefaults()
// Creates a object that is used for tracking the active cursor position
{
  this.column = 1; // track x axis
  this.row = 1; // track y axis
  this.maxColumns = 80; // maximum columns per line, set to 0 to disable
  this.previousRow = 0; // previous column, used to decide when to inject line breaks
  // used by the Erase in page and Erase in line functions to track which lines
  // to apply CSS display: none to
  this.eraseLines = [];
}

function BuildEcma48(s = ``, verbose = false)
// Parses a string of Unicode text for control functions that are used for
// cursor positioning and colouring. The controls are converted into HTML5
// syntax with CSS dependencies for display in a web browser.
//
// The number of supported ECMA-48 control functions are based off Microsoft's
// limited implementation in their ANSI.SYS driver for MS-DOS. There are also a
// number of proprietary functions specific to ANSI.SYS.
//
// @s           String of Unicode text to parse.
// @verbose     Spam the console on information about each discovered control function.
{
  if (typeof s !== "string") throw `'s' argument must be a string of text`;
  // Convert the @s string into Unicode decimal encoded numbers and store those
  // values in an array. JavaScript's performance for comparison and manipulation
  // is faster using arrays and numeric values than it is using String functions.
  const textAsDecimal = buildDecimalChars(s, verbose);

  let textAsArray = [],
    textAsHTML = ``;

  let count = 0, // number of loops passed, only used for console.log
    ctrlCodeCount = 0, // number of control functions passed so far
    decimalChar = 0, // current character in a Unicode decimal value
    i = textAsDecimal.length, // used by the while-loop countdown
    lenOfNullify = 0, // number of characters to delete when erasing control sequences from the text
    otherCodesCount = 0, // number of unsupported ANSI.SYS control sequences found
    unknownCount = 0; // number of unsupported ECMA-48 control sequences found

  // Initialise cursor position
  let cursor = new ListCursorDefaults();

  this.colorDepth = null;
  this.columns = cursor.maxColumns;
  this.font = null;
  this.rows = 0;
  this.lineWrap = null;
  this.textAsHTML = ``;
  this.otherCodesCount = 0;
  this.unknownCount = 0;

  // Loop through the array containing Unicode decimal text.
  // While loops are generally the faster than other loop types but only work in
  // reverse.
  while (i--) {
    decimalChar = textAsDecimal[i];
    count++;
    if (decimalChar === null) continue;
    // handle characters for display
    else if (decimalChar !== 155) {
      // convert the Unicode decimal character value into a UTF-16 text string
      textAsArray[i] = `${String.fromCharCode(decimalChar)}`;
    }
    // handle character value 155 which is our place holder for the Control Sequence Introducer `←[`
    else if (decimalChar === 155) {
      ctrlCodeCount++;
      // discover if the control sequence is supported
      const ctrlCode = findControlCode(textAsDecimal, i, verbose);
      // handle unknown sequences
      if (ctrlCode === null) {
        if (verbose) console.info(`Unsupported control function for array item ${i}, character #${ctrlCodeCount}`);
        // we display all unknown controls sequences in the text
        textAsArray[i] = `\u241b`; // `esc` control picture
        textAsArray[i + 1] = `[`;
        unknownCount++;
        continue;
      }
      // strip out known control sequences from the text including those that will be converted into HTML
      const ctrlCodeLen = ctrlCode.split(`,`);
      lenOfNullify = parseInt(ctrlCodeLen[1], 10);
      if (lenOfNullify > 0 && ["CUB", "CUD", "CUF", "CUP", "CUU", "ED", "EL", "HVP", "NULL", "RCP", "RM", "SCP", "SGR", "SM", "/x"].includes(ctrlCodeLen[0])) {
        textAsArray.fill(null, i + 2, lenOfNullify + i + 2);
      }
      // count ignored control sequences
      if (["CUU", "CUB", "/x"].includes(ctrlCodeLen[0])) {
        otherCodesCount++;
        if (verbose) console.log(`Control sequence '${ctrlCode}' #${ctrlCodeCount} will be ignored`);
      } else if (ctrlCodeLen[0] === "EL" && ctrlCodeLen[2] === "1") otherCodesCount++;

      // debug output
      if (verbose && ctrlCodeLen[0] !== "SCP") {
        console.groupCollapsed(`Control function '${ctrlCode}'`);
        console.log(`At position ${i}, item #${ctrlCodeCount}, length ${ctrlCodeLen[1]}\nNullify item ${count} fill ${i+2} to ${lenOfNullify+i+1}`);
        console.groupEnd();
      }
      // humanise control sequence introducer
      const element = buildCSI(ctrlCodeLen, verbose);
      // merge results into the array
      textAsArray[i] = element;
      // handle any line wrapping requests
      if (element === "LW+0") this.lineWrap = false; // RM=7
      else if (element === "LW+1") this.lineWrap = true; // SM=7
      //else if (this.lineWrap === null && element.startsWith(`HVP`)) this.lineWrap = false;
    }
    // end of while-loop
  }

  // remove empty items in the array and unused control sequences
  if (this.lineWrap === false) {
    // also remove newline characters
    textAsArray = textAsArray.filter(function(item) {
      return (item !== `\n` && (item !== (undefined || null) && item.length !== 0));
    });
  } else {
    textAsArray = textAsArray.filter(function(item) {
      return (item !== (undefined || null) && item.length !== 0);
    });
  }

  // This variable is needed by SGR to save any presentation changes within
  // the text.
  let sgrSave = new SgrDefaults();

  // Forward loop to handle cursor and presentation functions
  let itemLen = 0,
    itemText = ``,
    itemValues = [],
    item1 = null,
    item2 = null;

  // we inject presentation classes into small <i> containers. in HTML4 <i> were
  // simply italic styles but in HTML5 they "represent a range of text that is
  // set off from the normal text for some reason"
  for (let i = 0, len = textAsArray.length; i < len; i++) {
    itemText = textAsArray[i];
    itemLen = itemText.length;
    itemValues = itemText.split("+");
    item1 = parseInt(itemValues[1], 10);
    item2 = parseInt(itemValues[2], 10);
    // Handle items
    if (itemLen === 0) {
      continue; // skip empty items
    }
    // characters to display
    else if (itemLen === 1 && itemText !== undefined) {
      if (itemText === "\n") {
        buildNewRows(); // we replace newline controls with <br> tags
      } else {
        textAsHTML = textAsHTML.concat(`${itemText}`); // append character to HTML
        handleColumn();
      }
    }
    // control functions
    else {
      // obtain control function name from itemText
      const control = itemText.slice(0, 3);
      // handle control functions
      if (control === "CUD" && item1 > 0) {
        // cursor down
        cursor.previousRow = cursor.row;
        buildNewRows(item1);
      } else if (control === "CUF" && item1 > 0) {
        // cursor forward
        buildNewColumns(item1);
      } else if (control === "HVP") {
        // horizontal vertical position
        let hvpRow = item1,
          hvpCol = item2;
        cursor.previousRow = cursor.row;
        if (hvpRow <= 1 && hvpCol <= 1) {
          // do nothing as position is starting 1 row, 1 col
        } else if (hvpRow <= 1 && hvpCol > 1) {
          buildNewColumns(hvpCol);
        } else {
          buildNewRows(hvpRow - cursor.row, hvpCol);
        }
      } else if (control === "SGR") {
        // select graphic rendition
        const classes = buildSGRClasses(itemText, this.colorDepth);
        if (i > 0) textAsHTML = textAsHTML.concat(`</i><i class="${classes}">`);
        //textAsHTML = textAsHTML.concat(`</i><!-- ${cursor.row}x${cursor.column} --><i class="${classes}">`); // for debugging cursor positions
      } else if (control === "ED+") {
        // erase in page
        if (item1 === 0) buildNewColumns(0); // [incomplete, currently just goes to the end of the line] erase from cursor to end of the screen (-ANSI.SYS)
        else if ([1, 2].includes(item1)) { // erase from cursor to beginning of the screen (-ANSI.SYS) and erase entire screen
          cursor.eraseLines.push(...Array(cursor.row).keys()); // erase all lines to current row using ES6 range 1...current row
        }
      } else if (control === "EL+") {
        // erase in line
        if (item1 === 0) buildNewColumns(0); // go to end of the line
        else if (item1 === 1); // [not supported] clear from cursor to the beginning of the line (-ANSI.SYS)
        else if (item1 === 2) cursor.eraseLines.push(cursor.row - 1); // erase line (-ANSI.SYS)
      } else if (control === "SM+") {
        // set modes (non-standard MS-DOS ANSI.SYS)
        // set colour depth
        if ([0, 2, 5, 6, 15, 17].includes(item1)) this.colorDepth = 1; // monochrome 1-bit colour
        else if ([5, 6].includes(item1)) this.colorDepth = 0; // grey scale 4-bit colour
        else if ([1, 3, 4].includes(item1)) this.colorDepth = 2; // [not supported] 2-bit colours
        else if ([13, 14, 16, 18].includes(item1)) this.colorDepth = 4; // 4-bit colours
        else if (item1 === 19) this.colorDepth = 8; // [not supported] 8-bit colours
        // set resolution (but in our HTML/CSS output we only switch the font)
        if (item1 === 2) this.font = `mda`; // MDA font 80×25
        else if ([0, 1, 4, 5, 13, 19].includes(item1)) this.font = `cga`; // CGA font
        else if ([6, 14].includes(item1)) this.font = `cgathin`; //  CGA higher resolution
        else if ([3, 15, 16].includes(item1)) this.font = `ega8`; // EGA font
        else if ([17, 18].includes(item1)) this.font = `vga8`; // VGA font
        // number of columns
        if (item1 === 0 || item1 === 1) cursor.maxColumns = 40;
        else cursor.maxColumns = 80;
      }
    }
    const findRow1 = textAsHTML.slice(0, 100);
    if (textAsHTML.startsWith(`<div id="row-1"`) === false && findRow1.indexOf(`<div id="row-1"`, 0) === -1) {
      const classes = buildSGRClasses();
      textAsHTML = `<div id="row-1"><i class="${classes}">${textAsHTML}`;
    }
    // end of loop
  }
  // close any opened tags
  if (textAsHTML.endsWith(`</div>`) === true && textAsHTML.endsWith(`</i></div>`) === false) {
    textAsHTML = `${textAsHTML.slice(0, -6)}</i></div>`;
  } else if (textAsHTML.endsWith(`</i></div>`) === false) {
    textAsHTML = `${textAsHTML}</i></div>`;
  }
  // clean any empty tags
  textAsHTML = textAsHTML.replace(/<i class="SGR37 SGR40"><\/i><i id=/g, "<i id=");
  // force the browsers to show the empty rows by injecting a single space character
  textAsHTML = textAsHTML.replace(/<div id="row-(\d+)"><i class="SGR37 SGR40"><\/i><\/div>/g, `<div id="row-$1"><i class="SGR37 SGR40"> </i></div>`);
  // apply erase lines
  for (let line of cursor.eraseLines) {
    line++; // account for arrays starting at 0 but lines starting at 1
    textAsHTML = textAsHTML.replace(`<div id="row-${line}">`, `<div id="row-${line}" class="ED">`);
  }

  // Return HTML5 & unknown control functions count
  this.textAsHTML = textAsHTML;
  this.rows = cursor.row;
  this.otherCodesCount = otherCodesCount;
  this.unknownCount = unknownCount;

  function handleColumn(count = 1)
  // Automatically resets the column forward position to the beginning of the line
  // after @count has reached 80 columns.
  // @count The number of characters or places that have been displayed.
  //        If @count is set to 0 then a forced reset will be applied to cursor.column.
  {
    if (count === 0) {
      cursor.column = 1;
    } else if (count > 0) {
      cursor.column = cursor.column + count;
      if (cursor.maxColumns !== 0 && cursor.column > cursor.maxColumns) {
        // end of line reached so begin a new line
        cursor.previousRow++;
        buildNewRows(1);
      }
    }
  }

  function buildNewRows(count = 1, columns = 0)
  // Create line break tag to simulate a cursor position down request
  // @count   The number of places to move
  // @columns If set to 1 or greater then also position the cursor forward by
  //          this many places.
  {
    const classes = buildSGRClasses();
    for (let i = 0; i < count; i++) {
      cursor.row++;
      handleColumn(0); // reset columns
      if (cursor.row <= 1) textAsHTML = textAsHTML.concat(`</i><i class="${classes}">`);
      else textAsHTML = textAsHTML.concat(`</i></div><div id="row-${cursor.row}"><i class="${classes}">`);
    }
    cursor.previousRow = cursor.row;
    // always build columns AFTER rows and outside of the loop
    if (columns > 0) buildNewColumns(columns);
  }

  function buildNewColumns(count = 1)
  // Creates white space to simulate a cursor position forward request
  // As such the white space should not have any presentation controls applied
  // to it such as background colours.
  // @count   The number of places to move, if 0 then build to the end of the line
  {
    let places = count;
    if (count === 0) {
      if (cursor.column === 1) places = cursor.maxColumns;
      else places = cursor.maxColumns - cursor.column;
    }
    const classes = buildSGRClasses(),
      endPosition = cursor.column + places - 1;
    if (cursor.column === endPosition) textAsHTML = `${textAsHTML}</i><i id="column-${cursor.column}" class="SGR0">${' '.repeat(places)}</i><i class="${classes}">`;
    else textAsHTML = `${textAsHTML}</i><i id="column-${cursor.column}-to-${endPosition}" class="SGR0">${' '.repeat(places)}</i><i class="${classes}">`;
    handleColumn(places);
  }

  function buildSGRClasses(vals = ``, colorDepth = 4)
  // Creates CSS classes to apply presentation changes to text
  // These are based on ECMA-48 which are backwards compatible with Microsoft's
  // MS-DOS ANSI.SYS implementation.
  // see 8.3.117 SGR - SELECT GRAPHIC RENDITION
  // http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-048.pdf
  // @vals          SGR parameter values or ANSI.SYS text attributes
  // @colorDepth    Colour depth override if the set/reset mode control function has
  //                requested it. If set to 1 (1-bit colour) parameters 30…49 are ignored.
  {
    const values = vals.split("+");
    let classes = ``,
      val = 0;
    // forward loop as multiple codes together have compound effects
    for (let i = 0; i < values.length; i++) {
      val = parseInt(values[i], 10);
      if (isNaN(val) === true) continue; // error
      if (val === 0) sgrSave = new SgrDefaults(); // reset to defaults
      // handle colour values
      if (colorDepth !== 1) {
        if (findForeground(val) === true) sgrSave.colorF = val;
        else if (findBackground(val) === true) sgrSave.colorB = val;
      }
      // handle presentation options
      if (val === 1) sgrSave.bold = !sgrSave.bold; // '!' switches the existing boolean value
      else if (val === 2) sgrSave.faint = !sgrSave.faint;
      else if (val === 3) sgrSave.italic = !sgrSave.italic;
      else if (val === 4) sgrSave.underline = !sgrSave.underline;
      else if (val === 5) sgrSave.blinkSlow = !sgrSave.blinkSlow;
      else if (val === 6) sgrSave.blinkFast = !sgrSave.blinkFast;
      else if (val === 7) sgrSave.inverse = !sgrSave.inverse;
      else if (val === 8) sgrSave.conceal = !sgrSave.conceal;
      else if (val === 9) sgrSave.crossedOut = !sgrSave.crossedOut;
      else if (val >= 10 && val <= 20) sgrSave.font = val;
      else if (val === 21) sgrSave.underlineX2 = !sgrSave.underlineX2;
      else if (val === 22) {
        sgrSave.bold = false;
        sgrSave.faint = false;
      } else if (val === 23) {
        sgrSave.italic = false;
        if (sgrSave.font === 20) sgrSave.font = 10; // = font not Gothic
      } else if (val === 24) {
        sgrSave.underline = false;
        sgrSave.underlineX2 = false;
      } else if (val === 25) {
        sgrSave.blinkSlow = false;
        sgrSave.blinkFast = false;
      } else if (val === 27) sgrSave.inverse = false;
      else if (val === 28) sgrSave.conceal = false;
      else if (val === 29) sgrSave.crossedOut = false;
      else if (val === 51) sgrSave.framed = !sgrSave.framed;
      else if (val === 52) sgrSave.encircled = !sgrSave.encircled;
      else if (val === 53) sgrSave.overLined = !sgrSave.overLined;
      else if (val === 54) {
        sgrSave.framed = false;
        sgrSave.encircled = false;
      } else if (val === 55) sgrSave.overLined = false;
      // end of loop
    }
    // handle colours
    if (sgrSave.bold === true && sgrSave.colorF !== 38 && sgrSave.colorF >= 30 && sgrSave.colorF <= 39) classes = `${classes} SGR1${sgrSave.colorF}`;
    else classes = `${classes} SGR${sgrSave.colorF}`;
    classes = `${classes} SGR${sgrSave.colorB}`;
    // presentation options classes
    if (sgrSave.faint === true) classes = `${classes} SGR2`;
    if (sgrSave.italic === true) classes = `${classes} SGR3`;
    if (sgrSave.underline === true) classes = `${classes} SGR4`;
    if (sgrSave.blinkSlow === true) classes = `${classes} SGR5`;
    if (sgrSave.blinkFast === true) classes = `${classes} SGR6`;
    if (sgrSave.inverse === true) classes = `${classes} SGR7`;
    if (sgrSave.conceal === true) classes = `${classes} SGR8`;
    if (sgrSave.crossedOut === true) classes = `${classes} SGR9`;
    if (sgrSave.underlineX2 === true) classes = `${classes} SGR21`;
    if (sgrSave.framed === true) classes = `${classes} SGR51`;
    if (sgrSave.encircled === true) classes = `${classes} SGR52`;
    if (sgrSave.overLined === true) classes = `${classes} SGR53`;
    // alternative fonts, values 11…19, 20 is reserved for a Gothic font
    // value 10 is the primary (default) font
    if (sgrSave.font > 10 && sgrSave.font <= 20) classes = `${classes} SGR${sgrSave.font}`; // currently no alternative font classes have been implemented
    return classes.trim();

    function findForeground(val) {
      let valid = false;
      if (val >= 30 && val <= 39) valid = true;
      else if (val >= 380 && val <= 389 || val >= 3810 && val <= 3899 || val >= 38100 && val <= 38255) valid = true;
      return valid;
    }

    function findBackground(val) {
      let valid = false;
      if (val >= 40 && val <= 49) valid = true;
      else if (val >= 480 && val <= 489 || val >= 4810 && val <= 4899 || val >= 48100 && val <= 48255) valid = true;
      return valid;
    }
  }
}

function findControlCode(a = [], pos = 0, verbose = false)
// Scans a slice of text that has previously been converted into Unicode
// decimals to find any ECMA-48 control sequences.
// @values  Array of text characters represented in Unicode decimal values.
//          Usually it will contain a complete text document.
// @pos     The position within the array to start the search for a control sequence.
// @verbose Spam the console with information about each discovered control sequence.
{
  const i = pos + 2, // skip saved escape and null values
    // look-ahead character containers as control sequences use multiple characters
    // of varying length.
    char0 = a[i],
    char1 = a[i + 1],
    char2 = a[i + 2],
    char3 = a[i + 3],
    char4 = a[i + 4],
    // look-ahead containers that will be used with deeper scan while-loops
    chars = a.slice(i, i + 8), // for performance, set a 9 character cap for most scans
    sgrchars = a.slice(i, i + 18); // cap SGR scans to 19 characters [can be adjusted if needed]
  // loop place holders
  let item = 0,
    scan = -1;
  // Handle control functions with either no or fixed numeric parameters first
  //
  // SGR - Select Graphic Rendition
  if (char0 === 109) return `SGR,1,0`; // ←[m reset to defaults
  else if (char1 === 109 && findDigit(char0)) return `SGR,2,${String.fromCharCode(char0)}`; // ←[1m
  else if (char2 === 109 && findDigit(char0) && findDigit(char1)) return `SGR,3,${String.fromCharCode(char0)}${String.fromCharCode(char1)}`; // ←[31m
  // HVP, CUP - Horizontal and vertical position and Cursor Position reset, match ←[H ←[f
  if (char0 === 72 || char0 === 102) return buildHVP();
  // CUU, CUD, CUF, CUB - Cursor up, down, forward, back
  if (findCursor(char0)) return buildCU(char0); // ←[A move 1 place
  if (findDigit(char0) && findCursor(char1)) return buildCU(char1, [char0]); // ←[5A move multple places
  if (findDigit(char0) && findDigit(char1) && findCursor(char2)) return buildCU(char2, [char0, char1]); // ←[60A move tens of places
  if (findDigit(char0) && findDigit(char1) && findDigit(char2) && findCursor(char3)) return buildCU(char3, [char0, char1, char2]); // ←[555A move hundreds of places
  if (findDigit(char0) && findDigit(char1) && findDigit(char2) && findDigit(char3) && findCursor(char4)) return buildCU(char4, [char0, char1, char2, char3]); // ←[1523A move thousands of places
  // SM, RM - Set screen mode and Reset screen mode
  if ((char3 === 104 || char3 === 108) && char0 >= 61 && char0 <= 63 && char1 === 49 && char2 >= 51 && char2 <= 56) return buildSM(char3, [char1, char2]); // ←[=13h 2 digit mode with a character prefix
  if ((char2 === 104 || char2 === 108) && char0 >= 61 && char0 <= 63 && findDigit(char1)) return buildSM(char2, [char1]); // ←[?0h 1 digit mode with a character prefix
  if ((char2 === 104 || char2 === 108) && char0 === 49 && char1 >= 51 && char1 <= 56) return buildSM(char2, [char0, char1], false); // ←[13h 2 digit mode
  if ((char1 === 104 || char1 === 108) && findDigit(char0)) return buildSM(char1, [char0], false); // ←[13h 1 digit mode
  // ED - Erase in page, match ←[J, ←[0J, ←[1J, ←[2J
  if (char0 === 74) return `ED,1,0`;
  else if (char1 === 74 && char0 >= 48 && char0 <= 50) return `ED,2,${String.fromCharCode(char0)}`;
  // EL - Erase in line, match ←[K, ←[0K, ←[1K, ←[2K
  if (char0 === 75) return `EL,1,0`;
  else if (char1 === 75 && char0 >= 48 && char0 <= 50) return `EL,2,${String.fromCharCode(char0)}`;
  // SCP - Save Cursor Position, match ←[s
  // it is commonly used for handling newline breaks
  if (char0 === 115 && char1 === 10) return `NULL,5`;
  else if (char0 === 115) return `SCP,1`;
  // RCP - restore Cursor Position, match ←[u
  if (char0 === 117) return `RCP,1`;
  // ANSI.SYS extended keyboard support (non-standard), match ←[0q, ←[1q
  if (char1 === 113 && (char0 === 48 || char0 === 49)) return `/x,2,${String.fromCharCode(char0)}`;
  // Handle control functions with variable parameters
  //
  // SGR - Select Graphic Rendition
  {
    // look for SGR
    scan = sgrchars.indexOf(109);
    // if scan found an SGR then process its values
    if (scan > -1) {
      let iSgr, iW = scan,
        sgrCtrl = true,
        sgrStr = ``;
      while (iW--) {
        iSgr = a[i + iW];
        // confirm scanned character
        if (iSgr !== 109) {
          if (findDigit(iSgr) === false && iSgr !== 59) {
            sgrCtrl = false;
            break;
          } else if (iSgr === 59) sgrStr = `,${sgrStr}`;
          else sgrStr = `${String.fromCharCode(iSgr)}${sgrStr}`;
        }
      }
      if (sgrCtrl === true) {
        if (verbose) console.log(`Text rendition attributes found, '${buildTextChars(sgrchars.slice(0,scan))}'`);
        return `SGR,${sgrStr.length+1},${sgrStr}`;
      }
    }
  }
  // HVP, CUP - Horizontal & vertical position and Cursor Position
  {
    const scan1 = chars.indexOf(72),
      scan2 = chars.indexOf(102);
    // Scan for H
    if (scan1 >= 0 && (scan2 === -1 || scan1 < scan2)) {
      item = 72;
      scan = scan1;
    }
    // Scan for f
    else if (scan2 >= 0 && (scan1 === -1 || scan2 < scan1)) {
      item = 102;
      scan = scan2;
    }
    // if one of the scans found an item, then process its values
    if (scan > -1) {
      let iH, iW = scan,
        hvpCtrl = true;
      while (iW--) {
        iH = a[i + iW];
        // confirm scanned character is H or ; or 0-9
        if (iH !== item && iH !== 59 && findDigit(iH) === false) {
          hvpCtrl = false;
          break;
        }
      }
      if (hvpCtrl === true) {
        if (verbose) console.log(`Cursor position change command found, '${buildTextChars(chars.slice(0,scan))}'`);
        return buildHVP(chars.slice(0, scan));
      }
    }
  }
  // if no known control sequences are found then return null
  return null;

  function buildCU(c = 0, v = [0])
  // Stringify Unicode decimal values into a cursor position function
  // @c   mode encoded as Unicode decimal
  // @v   Array of text characters represented in Unicode decimal values
  {
    let chr = ``,
      code = ``,
      i = 0,
      length = v.length + 1,
      value = ``;
    if (c === 65) code = `CUU`;
    else if (c === 66) code = `CUD`;
    else if (c === 67) code = `CUF`;
    else if (c === 68) code = `CUB`;
    for (i in v) {
      chr = v[i];
      if (chr === 0) chr = 49; // default value of 1 if no value is given
      value = value.concat(String.fromCharCode(chr));
    }
    if (v.length === 1 && v[0] === 0) length = 1; // if no parameters are given
    if (verbose) console.log(`Cursor move ${value} positions ${humanizeCursor(c)}`);
    return `${code},${length},${value}`;

    function humanizeCursor(c = 0)
    // Decode Unicode decimal values into readable strings
    // @c   character encoded as Unicode decimal
    {
      let result = null;
      if (c === 65) result = `up`;
      else if (c === 66) result = `down`;
      else if (c === 67) result = `right`;
      else if (c === 68) result = `left`;
      return result;
    }
  }

  function buildHVP(v = [], verbose = false)
  // Stringify Unicode decimal values into a character and line position function
  // @v   Array of text characters represented in Unicode decimal values
  {
    const length = v.length + 1;
    let chr = ``,
      i = 0,
      row = ``,
      column = ``,
      mode = `m`; // row
    if (v.length === 0) v = [49, 59, 49];
    for (i in v) {
      chr = v[i];
      // if character is a semicolon ; then switch modes
      if (chr === 59) {
        mode = `n`;
        continue;
      }
      if (mode === "m") row = row.concat(String.fromCharCode(chr));
      else if (mode === "n") column = column.concat(String.fromCharCode(chr));
    }
    // if no values were provided then use defaults of 1
    if (row === "" || row === "0") row = `1`;
    if (column === "" || column === "0") column = `1`;
    if (verbose) console.log(`Cursor repositioned to row ${row} and column ${column}`);
    return `HVP,${length},${row},${column}`;
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
    let code = `SM`,
      length = v.length + 1,
      pre = ``,
      value = ``;
    if (v[1] > 0) value = `${String.fromCharCode(v[0])}${String.fromCharCode(v[1])}`;
    else value = `${String.fromCharCode(v[0])}`;
    if (prefix === true) length++;
    if (c === 108) {
      code = `RM`;
      pre = `re`;
    }
    if (verbose) console.log(`Screen mode ${pre}set to '${value}'`);
    return `${code},${length},${value}`;
  }

  function buildTextChars(a = [], verbose = false)
  // Converts arrays containing Unicode decimal values back into plain text strings.
  // @a       Array containing Unicode decimals
  {
    const d0 = new Date().getTime();
    let i = a.length,
      dec = 0;
    // while loops are faster
    while (i--) {
      //str = str.concat(String.fromCharCode(a[i])); // this method is slower in Blink
      dec = a[i];
      if (dec === null) continue;
      else if (dec === 155) {
        a[i] = `\e[`;
      } else a[i] = String.fromCharCode(a[i]);
    }
    const str = a.join(""); // convert array to string with no separator
    const d1 = new Date().getTime();
    if (verbose) console.log(`Time taken to process buildTextChars: ${(d1 - d0)} milliseconds`);
    return str;
  }

  function findCursor(c = 0)
  // Is the character a Final Byte used for cursor positioning?
  // CCU, CUD, CUF, CUB
  // @c   character encoded as Unicode decimal
  {
    let result = false;
    if (c >= 65 && c <= 68) result = true;
    return result;
  }

  function findDigit(c = 0)
  // Is the character a digit (0...9)?
  // @c   character encoded as Unicode decimal
  {
    let result = false;
    if (c >= 48 && c <= 57) result = true;
    return result;
  }
  // end of findControlCode() function
}

function buildCSI(a = [])
// Takes control sequences and returns either their humanised acronyms or
// HTML tags and entities.
// @a       Array of text characters represented in Unicode decimal values
{
  if (a.length === 0) return ``;
  const
    element = a[0],
    values = a.slice(1),
    vLength = values.length;
  let csi = ``,
    val1 = 0,
    val2 = 0;
  if (vLength > 0) val1 = parseInt(values[1], 10);
  if (vLength > 1) val2 = parseInt(values[2], 10);

  // cursor move down, cursor forward (right), erase in page, erase in line
  if (["CUD", "CUF", "ED", "EL"].includes(element)) {
    csi = `${element}+${val1}`;
  }
  // cursor position & horizontal vertical positioning
  else if (["CUP", "HVP"].includes(element)) {
    // these moves the cursor to a set of row x column coordinates
    // the val1 is row, val2 is column
    csi = `HVP+${val1}+${val2}`;
  }
  // set graphic rendition
  else if (element === "SGR") {
    csi = `SGR`;
    // loop over array, i should start from 1 not 0
    let next1 = 0,
      next2 = 0,
      value = 0;
    for (let i = 1; i < vLength; i++) {
      value = parseInt(values[i], 10);
      // handle 256 colour codes
      if ([38, 48].includes(value) && (vLength - i) > 1) {
        next1 = parseInt(values[i + 1], 10);
        next2 = parseInt(values[i + 2], 10);
        if (next1 === 5 && next2 >= 0 && next2 <= 255) {
          csi = `${csi}+${value}${next2}`;
          i = i + 2;
          continue;
        }
      }
      csi = `${csi}+${value}`;
    }
  }
  // set and reset screen mode
  else if (["SM", "RM"].includes(element)) {
    if (val1 === 7) {
      // line wrapping
      if (element === "RM") csi = `LW+0`; // disable
      else if (element === "SM") csi = `LW+1`; // enable
    } else {
      // all other modes
      csi = `SM+${val1}`;
    }
  }
  // all other controls are ignored
  return csi;
}

function buildDecimalChars(s = ``, verbose = false)
// Converts a string of text into Unicode decimal values and splits them into an
// array which are processed faster.
// @s       String of text
{
  const d0 = new Date().getTime();
  let i = s.length,
    cca = 0,
    ua = new Array(i);
  // while loops are faster
  while (i--) {
    cca = s.charCodeAt(i);
    if (cca === 8592 && s.charCodeAt(i + 1) === 91) {
      // When the characters ←[ are found in sequence
      // ←[ = CSI Control Sequence Introducer
      ua[i] = 155; // we will use this value as an identifier to mark ←[ introducer
      continue;
    } else if (cca === 91 && s.charCodeAt(i - 1) === 8592) {
      // if [ is found and the previous character is ← (escape) then we nullify it
      // as iterating and skipping over null values is much faster than modifying the array
      ua[i] = null;
      continue;
    } else ua[i] = cca;
  }
  const d1 = new Date().getTime();
  if (verbose) console.log(`Time taken to process buildDecimalChars: ${(d1 - d0)} milliseconds`);
  return ua;
}