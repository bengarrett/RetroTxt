// filename: parse_dos.js
//
// JavaScript converts all the text it handles from the original encoding into
// UTF-16. The functions on this page attempts to convert text encodings
// commonly used on legacy PC/MS-DOS systems to be JavaScript UTF-16 friendly.
//
// See parse_ansi.js for ANSI art conversion functions.
//
// Characters 0…31 commonly are bits for C0 control functions,
// but in PC/MS-DOS they were also used for the display of characters.
// Characters 32…126 are skipped as they are based on the US-ASCII/ECMA-43
// near-universal character set.
//
// "8-Bit Coded Character Set Structure and Rules"
// ECMA-43 (US-ASCII)
// ecma-international.org/publications/standards/Ecma-043.htm
// ECMA-48 (contains C0)
// ecma-international.org/publications/standards/Ecma-048.htm
//
// JavaScript performance notes:
// Normal objects use less memory than typed arrays (Uint8Array())
// Normal objects are much faster than Maps
"use strict"

/**
 * Simulate legacy text character sets (also called code pages) using Unicode
 * symbols.
 * @class CharacterSet
 */
class CharacterSet {
  /**
   * Creates an instance of CharacterSet.
   * @param [set=``] Character set name
   */
  constructor(set = ``) {
    this.set = set
    // used as a placeholder for an empty cell
    this.empty = `\u0020`
    // no-break space
    this.nbsp = `\u00A0`
    // soft hyphen
    this.shy = `\u00AD`
  }
  /**
   * Unicode characters that emulate a code page set.
   * @returns {Array} Collection of matching characters
   */
  get() {
    switch (this.set) {
      case `cp437_C0`:
        return this.cp437_C0()
      case `cp_437`:
      case `cp_865`:
        return this.cp437()
      case `cp_1250`:
        return this.cp1250()
      case `cp_1251`:
        return this.cp1251()
      case `cp_1252`:
        return this.cp437()
      case `iso_8859_1`:
      case `iso_8859_15`:
        return this.iso8859_1()
      case `iso_8859_5`:
        return this.iso8859_5()
      case `iso_8859_10`:
        return this.iso8859_10()
      case `mac_roman`:
        return this.macRoman()
      default:
        return this.cp437()
    }
  }
  /**
   * An internal table of Unicode characters that emulate Code Page 437.
   * ASCII C0 controls are replaced with characters.
   * Sets 2 through 7 are standard characters that are identical in both
   * ASCII and Unicode.
   */
  cp437Table() {
    //prettier-ignore
    this.set_0 = [`␀`,`☺`,`☻`,`♥`,`♦`,`♣`,`♠`,`•`,`◘`,`○`,`◙`,`♂`,`♀`,`♪`,`♫`,`☼`]
    //prettier-ignore
    this.set_1 = [`►`,`◄`,`↕`,`‼`,`¶`,`§`,`▬`,`↨`,`↑`,`↓`,`→`,`←`,`∟`,`↔`,`▲`,`▼`]
    //prettier-ignore
    this.set_8 = [`Ç`,`ü`,`é`,`â`,`ä`,`à`,`å`,`ç`,`ê`,`ë`,`è`,`ï`,`î`,`ì`,`Ä`,`Å`]
    //prettier-ignore
    this.set_9 = [`É`,`æ`,`Æ`,`ô`,`ö`,`ò`,`û`,`ù`,`ÿ`,`Ö`,`Ü`,`¢`,`£`,`¥`,`₧`,`ƒ`]
    //prettier-ignore
    this.set_a = [`á`,`í`,`ó`,`ú`,`ñ`,`Ñ`,`ª`,`º`,`¿`,`⌐`,`¬`,`½`,`¼`,`¡`,`«`,`»`]
    //prettier-ignore
    this.set_b = [`░`,`▒`,`▓`,`│`,`┤`,`╡`,`╢`,`╖`,`╕`,`╣`,`║`,`╗`,`╝`,`╜`,`╛`,`┐`]
    //prettier-ignore
    this.set_c = [`└`,`┴`,`┬`,`├`,`─`,`┼`,`╞`,`╟`,`╚`,`╔`,`╩`,`╦`,`╠`,`═`,`╬`,`╧`]
    //prettier-ignore
    this.set_d = [`╨`,`╤`,`╥`,`╙`,`╘`,`╒`,`╓`,`╫`,`╪`,`┘`,`┌`,`█`,`▄`,`▌`,`▐`,`▀`]
    //prettier-ignore
    this.set_e = [`α`,`ß`,`Γ`,`π`,`Σ`,`σ`,`µ`,`τ`,`Φ`,`Θ`,`Ω`,`δ`,`∞`,`φ`,`ε`,`∩`]
    //prettier-ignore
    this.set_f = [`≡`,`±`,`≥`,`≤`,`⌠`,`⌡`,`÷`,`≈`,`°`,`∙`,`·`,`√`,`ⁿ`,`²`,`■`,this.nbsp]
  }
  /**
   * Unicode characters that emulate Code Page 437.
   * @returns {Array} C0 control codes
   */
  cp437_C0() {
    this.cp437Table()
    return [...this.set_0, ...this.set_1]
  }
  /**
   * Unicode characters that emulate Code Page 437.
   * @returns {Array} Extended characters
   */
  cp437() {
    this.cp437Table()
    return this.set_8.concat(
      this.set_9,
      this.set_a,
      this.set_b,
      this.set_c,
      this.set_d,
      this.set_e,
      this.set_f
    )
  }
  /**
   * Unicode characters that emulate ISO 8859-1.
   * It is identical to Windows CP-1252 except it leaves rows 8 and 9 empty.
   * @returns {Array} Extended characters
   */
  iso8859_1() {
    this.cp437Table()
    return this.set_a.concat(
      this.set_b,
      this.set_c,
      this.set_d,
      this.set_e,
      this.set_f
    )
  }
  /**
   * An internal table of Unicode characters that emulate Code Page 1250.
   */
  cp1250Table() {
    const e = this.empty
    this.set_8 = Array.from(`€${e}‚${e}„…†‡${e}‰Š‹ŚŤŽŹ`)
    this.set_9 = Array.from(`${e}‘’“”•–—${e}™š›śťžź`)
    this.set_a = Array.from(`${this.nbsp}ˇ˘Ł¤Ą¦§¨©Ş«¬${this.shy}®Ż`)
    this.set_b = Array.from(`°±˛ł´µ¶·¸ąş»Ľ˝ľż`)
    this.set_c = Array.from(`ŔÁÂĂÄĹĆÇČÉĘËĚÍÎĎ`)
    this.set_d = Array.from(`ĐŃŇÓÔŐÖ×ŘŮÚŰÜÝŢß`)
    this.set_e = Array.from(`ŕáâăäĺćçčéęëěíîď`)
    this.set_f = Array.from(`đńňóôőö÷řůúűüýţ˙`)
  }
  /**
   * Unicode characters that emulate Code Page 1250.
   * @returns {Array} Extended characters
   */
  cp1250() {
    this.cp1250Table()
    return this.set_8.concat(
      this.set_9,
      this.set_a,
      this.set_b,
      this.set_c,
      this.set_d,
      this.set_e,
      this.set_f
    )
  }
  /**
   * An internal table of Unicode characters that emulate Code Page 1251.
   */
  cp1251Table() {
    this.set_8 = Array.from(`ЂЃ‚ѓ„…†‡€‰Љ‹ЊЌЋЏ`)
    this.set_9 = Array.from(`ђ‘’“”•–—${this.empty}™љ›њќћџ`)
    this.set_a = Array.from(`${this.nbsp}ЎўЈ¤Ґ¦§Ё©Є«¬${this.shy}®Ї`)
    this.set_b = Array.from(`°±Ііґµ¶·ё№є»јЅѕї`)
    this.set_c = Array.from(`АБВГДЕЖЗИЙКЛМНОП`)
    this.set_d = Array.from(`РСТУФХЦЧШЩЪЫЬЭЮЯ`)
    this.set_e = Array.from(`абвгдежзийклмноп`)
    this.set_f = Array.from(`рстуфхцчшщъыьэюя`)
  }
  /**
   * Unicode characters that emulate Code Page 1251.
   * @returns {Array} Extended characters
   */
  cp1251() {
    this.cp1251Table()
    return this.set_8.concat(
      this.set_9,
      this.set_a,
      this.set_b,
      this.set_c,
      this.set_d,
      this.set_e,
      this.set_f
    )
  }
  /**
   * An internal table of Unicode characters that emulate ISO 8859-5.
   * Note there are some inconsistencies that get manually corrected.
   * A_0, A_D, F_0, F_D
   */
  iso8859_5Table() {
    this.set_a = Array.from(`ЀЁЂЃЄЅІЇЈЉЊЋЌЍЎЏ`)
    this.set_b = Array.from(`АБВГДЕЖЗИЙКЛМНОП`)
    this.set_c = Array.from(`РСТУФХЦЧШЩЪЫЬЭЮЯ`)
    this.set_d = Array.from(`абвгдежзийклмноп`)
    this.set_e = Array.from(`рстуфхцчшщъыьэюя`)
    this.set_f = Array.from(`ѐёђѓєѕіїјљњћќѝўџ`)
  }
  /**
   * Unicode characters that emulate ISO 8859-5.
   * @returns {Array} Extended characters
   */
  iso8859_5() {
    this.iso8859_5Table()
    return this.set_a.concat(
      this.set_b,
      this.set_c,
      this.set_d,
      this.set_e,
      this.set_f
    )
  }
  /**
   * An internal table of Unicode characters that emulate ISO 8859-10.
   */
  iso8859_10Table() {
    this.set_a = Array.from(`${this.nbsp}ĄĒĢĪĨĶ§ĻĐŠŦŽ${this.shy}ŪŊ`)
    this.set_b = Array.from(`°ąēģīĩķ·ļđšŧž―ūŋ`)
    this.set_c = Array.from(`ĀÁÂÃÄÅÆĮČÉĘËĖÍÎÏ`)
    this.set_d = Array.from(`ÐŅŌÓÔÕÖŨØŲÚÛÜÝÞß`)
    this.set_e = Array.from(`āáâãäåæįčéęëėíîï`)
    this.set_f = Array.from(`ðņōóôõöũøųúûüýþĸ`)
  }
  /**
   * Unicode characters that emulate ISO 8859-10.
   * @returns {Array} Extended characters
   */
  iso8859_10() {
    this.iso8859_10Table()
    return this.set_a.concat(
      this.set_b,
      this.set_c,
      this.set_d,
      this.set_e,
      this.set_f
    )
  }
  /**
   * Internal table of Unicode characters that emulate the
   * Macintosh Roman character set.
   */
  macRomanTable() {
    this.set_8 = Array.from(`ÄÅÇÉÑÖÜáàâäãåçéè`)
    this.set_9 = Array.from(`êëíìîïñóòôöõúùûü`)
    this.set_a = Array.from(`†°¢£§•¶ß®©™´¨≠ÆØ`)
    this.set_b = Array.from(`∞±≤≥¥µ∂∑∏π∫ªºΩæø`)
    this.set_c = Array.from(`¿¡¬√ƒ≈∆«»…${this.nbsp}ÀÃÕŒœ`)
    this.set_d = Array.from(`–—“”‘’÷◊ÿŸ⁄€‹›ﬁﬂ`)
    this.set_e = Array.from(`‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔ`)
    this.set_f = Array.from(`ÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ`)
  }
  /**
   * Unicode characters that emulate the Macintosh Roman character set,
   * also known as Macintosh, Mac OS Roman and MacRoman or in Windows
   * Code Page 10000. This is the default legacy character encoding
   * for Mac OS 9 and earlier.
   * @returns {Array} Extended characters
   */
  macRoman() {
    this.macRomanTable()
    return this.set_8.concat(
      this.set_9,
      this.set_a,
      this.set_b,
      this.set_c,
      this.set_d,
      this.set_e,
      this.set_f
    )
  }
}

class Transcode extends CharacterSet {
  /**
   * Creates an instance of Transcode.
   * @param [set=``] character encoding set
   */
  constructor(set = ``, text = ``) {
    super()
    this.session = sessionStorage.getItem(`transcode`)
    super.set = set
    this.text = text
    this.verbose = RetroTxt.developer
  }
  /**
   * Discover if the supplied code page supported by RetroTxt.
   * @returns boolean
   */
  hasSupport() {
    return super.get().length > 0
  }
  /**
   * Rebuilds string using a code page supplied by the user via
   * the transcode context menus.
   */
  rebuild() {
    if (this.verbose) console.log(`rebuild() = ${this.session}`)
    switch (this.session) {
      case `cp_1252➡`:
        this._input_cp1252()
        break
      case `iso_8859_15➡`:
        this._input_iso8859_15()
        break
      case `iso_8859_1➡`:
        // supplied by SAUCE metadata
        break
      case `us_ascii➡`:
        // nothing needs to be done
        break
      default:
        console.log(
          `Transcode.rebuild() doesn't know sessionStorage.transcode item '${this.session}'`
        )
    }
    // handle character 1B to inject EMCA-48/ANSI control function support
    // in ASCII Character 1B (code 27) is the Escape control while with the
    // MS-DOS code page (CP-437) it also is used as a left arrow symbol
    this.text = this.text.replace(RegExp(`\u001B`, `g`), `←`)
  }
  /**
   * Rebuilds text to emulate the CP-1252 (Windows Latin 1) character set.
   */
  _input_cp1252() {
    const table = this.table_cp1252()
    // handle characters 80…FF
    let i = table.length
    let encodedText = this.text
    while (i--) {
      const code = i + 128
      if (this.verbose)
        console.log(`${i} ${String.fromCharCode(code)} ↣ ${table[i]}`)
      encodedText = encodedText.replace(
        RegExp(String.fromCharCode(code), `g`),
        table[i]
      )
    }
    this.text = encodedText
  }
  /**
   * Rebuilds text to emulate the ISO 8859-15 (Latin 9) character set.
   */
  _input_iso8859_15() {
    let s = this.text
      .replace(RegExp(String.fromCharCode(164), `g`), `€`)
      .replace(RegExp(String.fromCharCode(166), `g`), `Š`)
      .replace(RegExp(String.fromCharCode(168), `g`), `š`)
      .replace(RegExp(String.fromCharCode(180), `g`), `Ž`)
      .replace(RegExp(String.fromCharCode(184), `g`), `ž`)
      .replace(RegExp(String.fromCharCode(188), `g`), `Œ`)
      .replace(RegExp(String.fromCharCode(189), `g`), `œ`)
      .replace(RegExp(String.fromCharCode(190), `g`), `Ÿ`)
    this.text = s
  }
  /**
   * Returns a partial table of CP 1252 matching characters.
   * Only rows 8 and 9 are returned as all other characters match ISO-8859-1
   * which is natively supported by JavaScript.
   * @returns Array
   */
  table_cp1252() {
    // prettier-ignore
    this.set_8 = [`€`,``,`‚`,`ƒ`,`„`,`…`,`†`,`‡`,`ˆ`,`‰`,`Š`,`‹`,`Œ`,``,`Ž`,``]
    // prettier-ignore
    this.set_9 = [``,`‘`,`’`,`“`,`”`,`•`,`–`,`—`,`\u02dc`,`™`,`š`,`›`,`œ`,``,`ž`,`Ÿ`]
    return [...this.set_8, ...this.set_9]
  }
}

/**
 * Convert (JavaScript) UTF-16 encoded strings to emulate a MS-DOS Code Page.
 * @class DOSText
 */
class DOSText {
  /**
   * Creates an instance of DOSText.
   * @param [text=``] Text to parse
   * @param [codepage=`input_UTF16`] Character table key
   * @param [displayControls=false] Display DOS control characters
   * (used by unit tests)
   */
  constructor(
    text = ``,
    options = { codepage: `input_UTF16`, displayControls: null }
  ) {
    if (typeof text !== `string`) CheckArguments(`text`, `string`, text)
    if (!(`codepage` in options)) options.codepage = `input_UTF16`
    if (!(`displayControls` in options)) options.displayControls = null
    this.text = text
    this.codepage = options.codepage
    this.errorCharacter = `�`
    // this Boolean needs to be a string type
    this.displayControls = `${options.displayControls}` || `false`
    // use the `localStorage` displayControls setting
    // when the `options.displayControls` is not provided
    if (options.displayControls === null && typeof localStorage !== `undefined`)
      this.displayControls = localStorage.getItem(`textDosCtrlCodes`) || `false`
    this.asciiTable = []
    this.extendedTable = []
  }
  /**
   * Build a character table.
   * @returns {(Array|void)} Characters
   */
  characterTable() {
    if (RetroTxt.developer)
      console.log(`DOSText(codepage=%s).characterTable()`, this.codepage)
    // ascii C0 controls are either ignored or are common between all tables
    this.asciiTable = new CharacterSet(`cp437_C0`).get()
    // extended character tables
    const table = new CharacterSet(`${this.codepage}`)
    this.extendedTable = table.get()
    switch (this.codepage) {
      case `moduleExport`:
      case `cp_437`:
      case `us_ascii➡`:
      case `input_UTF16`:
        this.extendedTable = table.get()
        break
    }
  }
  /**
   * Looks up a character code and returns an equivalent Unicode symbol.
   * @param {*} number Hex or decimal character code
   * @returns {string} Unicode symbol
   */
  fromCharCode(number) {
    if (RetroTxt.developer && number > 127)
      console.log(
        `DOSText().fromCharCode(%s) String.fromCharCode = %s \\u%s`,
        number,
        String.fromCharCode(number),
        String.fromCharCode(number)
          .codePointAt(0)
          .toString(16)
      )
    switch (this.codepage) {
      case `cp_1251`: {
        if (number === 0xad) return `\u00A1`
      }
    }
    // handle oddball `NULL` characters that some docs use as a placeholder.
    // 65533 is used by the browser as an invalid or unknown character code.
    // the ␀ glyph used to be return but doesn't work well in monospace fonts
    if (number === 0) return ` `
    if (number === 65533) return ` `
    // ASCII was originally 7-bits so could support a maximum of 128 characters.
    // interpret ASCII C0 controls as CP-437 symbols characters 0-31
    if (number >= 0x00 && number <= 0x1f) {
      // 0x1B is the escape character that is also used as a trigger for
      // ANSI escape codes
      if (number === 0x1b) return this.asciiTable[number]
      // `displayControls` enabled will force the display of most CP-437 glyphs
      if (this.displayControls === `true`) {
        switch (number) {
          // return as an ASCII C0 control
          case 9: // HT - horizontal tab
            // some ANSI/DOS art expect the ○ character
            if (this.codepage === `cp_1252`) return this.asciiTable[9]
            else return `\t`
          case 10: // LF - linefeed
          case 13: // CR - carriage return
            return `\n`
          default:
            // JavaScript also supports these escape codes but in HTML they
            // have no effect
            // 08 BS \b - backspace
            // 11 VT \v - vertical tab
            // 12 FF \f - form feed
            // return all other ASCII C0 controls as CP437 glyphs
            return this.asciiTable[number]
        }
      }
      // RetroTxt option displayControls=disabled will return all C0 controls
      // return as an ASCII C0 control
      else return `${String.fromCharCode(number)}`
    }
    // characters 0x20 (32) through to 0x7E (126) are universal between
    // most code pages and so they are left as-is
    if (number >= 0x20 && number <= 0x7e)
      return `${String.fromCharCode(number)}`
    // normally ASCII 0x7F (127) is the delete control
    // but in CP437 it can also represent a house character
    if (number === 0x7f && `${this.displayControls}` === `true`) return `⌂`
    // ASCII extended are additional supported characters when ASCII is used in
    // an 8-bit set. All MS-DOS code pages are 8-bit and support the additional
    // 128 characters, between 8_0 (128)...F_F (255)
    switch (this.codepage) {
      case `cp_865`:
        return this.lookupCp865(number)
      case `cp_1250`:
      case `cp_1251`:
        return this.lookupCp437(number)
      case `cp_437`:
      case `cp_1252`:
        return this.lookupCp1252(number)
      case `iso_8859_1`:
        return this.lookupIso8859_1(number)
      case `iso_8859_5`:
        return this.lookupCp437(number, 32)
      case `iso_8859_10`:
        return this.lookupCp437(number, 0, 32)
      case `iso_8859_15`:
        return this.lookupIso8859_15(number)
      case `mac_roman`:
        return this.lookupCp437(number)
      default:
        return this.lookupUtf16(number)
    }
  }
  /**
   * A lookup for extended characters using Code Page 437 as the base table.
   * @param {*} Numeric hex or decimal character code
   * @param {number} [offsetInput=0] Array index offset for this.extendedTable
   * @param {number} [offsetOutput=0] Array index offset for the CP437 table
   * @returns {string} Unicode symbol
   */
  lookupCp437(number, offsetInput = 0, offsetOutput = 0) {
    // This function takes a Unicode decimal character number, finds its
    // matching character in a legacy ISO codepage table to return the
    // MS-DOS CP-437 character that occupies the same table cell position.
    //
    // The following examples take Unicode Latin/Cyrillic characters in an
    // ISO 8859-5 table and replaces them with MS-DOS CP-437 characters.
    //
    // An ISO 8859-5 encoded tab may return Cyrillic А (1040, \u0401) which is
    // located at B_0 in the codepage table.
    // In the CP-437 table, cell B_0 is the character ░ (\u2591)
    // so Cyrillic А gets swapped with ░
    // The next 8859-5 character Б (1041, \u0411) is in cell B_1,
    // CP-437 B_1 is ▒ (\u2592)
    // The next 8859-5 character В (1042, \u0412) is in cell B_2,
    // CP-437 B_2 is ▓ (\u2593)
    // The next 8859-5 character Г (1043, \u0413) is in cell B_3,
    // CP-437 B_3 is │ (\u2502)
    // here the value is out of sequence so lookup character tables are used -⤴
    //
    // Latin/Cyrillic (legacy ISO) https://en.wikipedia.org/wiki/ISO/IEC_8859-5
    // Cyrillic (Unicode block) https://en.wikipedia.org/wiki/Cyrillic_(Unicode_block)
    // OEM-US (legacy MS-DOS, CP-437) https://en.wikipedia.org/wiki/Code_page_437
    if (this.codepage === `iso_8859_5`) {
      // handle inconsistencies where Unicode Cyrillic characters
      // are not found in ISO 8859-5
      switch (number) {
        case 8470:
          return `\u2116`
        case 167:
          return `\u00B2`
      }
      // The Unicode Cyrillic decimals between 1088 - 1120 are out of range
      // for our lookup sequence, i.e characters such as `р с т у ф`.
      // so the Unicode decimal value offsets are adjusted
      if (number >= 1088) {
        offsetInput = 0
        offsetOutput = 32
      }
    }
    // find character in the character table
    let index = this.extendedTable.indexOf(
      `${String.fromCharCode(number + offsetInput)}`
    )
    if (RetroTxt.developer && number >= 127)
      console.log(
        `DOSText().lookupCp437(${number}) number: %s character: %s @index: %s`,
        number + offsetInput,
        String.fromCharCode(number + offsetInput),
        index
      )
    if (index <= -1) {
      console.warn(
        `${this.errorCharacter} ${
          this.codepage
        } extendedTable.indexOf(%s) character failed: \\u%s '%s' [${number} \\u${String.fromCharCode(
          number
        )
          .codePointAt(0)
          .toString(16)}]`,
        number + offsetInput,
        String.fromCharCode(number + offsetInput)
          .codePointAt(0)
          .toString(16),
        String.fromCharCode(number + offsetInput)
      )
      return `${this.errorCharacter}` // error, unknown character
    }
    // fetch the CP-437 table
    const table = new CharacterSet(`cp437`).get()
    if (RetroTxt.developer)
      console.log(
        `extendedTable.indexOf(%s) character success: \\u%s '%s' %s`,
        number + offsetInput,
        String.fromCharCode(number + offsetInput)
          .codePointAt(0)
          .toString(16),
        String.fromCharCode(number + offsetInput),
        table[index + offsetOutput]
      )
    // swap the character from Macintosh with the
    // matching decimal from table CP437
    return table[index + offsetOutput]
  }
  /**
   * CP-865 (DOS Nordic) specific input.
   * @param {*} number Hex or decimal character code
   * @returns {string} Unicode symbol
   */
  lookupCp865(number) {
    switch (number) {
      case 0xf8:
        return this.extendedTable[0x9b - 128]
      case 0xd8:
        return this.extendedTable[0x9d - 128]
      case 0xa4:
        return this.extendedTable[0xaf - 128]
    }
    return this.lookupUtf16(number)
  }
  /**
   * Windows-1252 specific input.
   * Often but incorrectly called Windows ANSI.
   * @param {*} number Hex or decimal character code
   * @returns {string} Unicode symbol
   */
  lookupCp1252(number) {
    if (number >= 0xa0 && number <= 0xff)
      return this.extendedTable[number - 128]
    // assume any values higher than 0xFF (255)
    // are Unicode values and return as-is
    return `${String.fromCharCode(number)}`
  }
  /**
   * ISO-8859-1 (Latin 1) specific input.
   * @param {*} number Hex or decimal character code
   * @returns {string} Unicode symbol
   */
  lookupIso8859_1(number) {
    if (number >= 0xa0 && number <= 0xff)
      return this.extendedTable[number - 160]
    // assume any values higher than 0xFF (255)
    // are Unicode values and return as-is
    return `${String.fromCharCode(number)}`
  }
  /**
   * ISO-8859-15 (Latin 9) specific input.
   * @param {*} number Hex or decimal character code
   * @returns {string} Unicode symbol
   */
  lookupIso8859_15(number) {
    // ISO 8859-15 is identical to ISO 8859-1 except for these 8 changes
    switch (number) {
      case 0x20ac:
        return this.extendedTable[0xa4 - 160]
      case 0x160:
        return this.extendedTable[0xa6 - 160]
      case 0x161:
        return this.extendedTable[0xa8 - 160]
      case 0x017d:
        return this.extendedTable[0xb4 - 160]
      case 0x017e:
        return this.extendedTable[0xb8 - 160]
      case 0x0152:
        return this.extendedTable[0xbc - 160]
      case 0x153:
        return this.extendedTable[0xbd - 160]
      case 0x178:
        return this.extendedTable[0xbe - 160]
    }
    return this.lookupIso8859_1(number)
  }
  /**
   * UTF-16 (JavaScript default) specific input.
   * @param {*} number Hex or decimal character code
   * @returns {string} Unicode symbol
   */
  lookupUtf16(number) {
    if (number >= 0xa0 && number <= 0xff) {
      // handle empty Windows 1252 values that would
      // otherwise return incorrect characters
      switch (number) {
        case 0xfc: // ü 0x81 (129)
        case 0xec: // ì 0x8D (141)
        case 0xc5: // Å 0x8F (143)
        case 0xc9: // É 0x90 (144)
        case 0xa5: // ¥ 0x9D (157)
          return `${String.fromCharCode(number)}`
      }
      // find a character in CP437 and return its glyph
      const ext = this.extendedTable.indexOf(String.fromCharCode(number))
      // error, unknown character
      if (ext <= -1) return `${this.errorCharacter}`
      return this.extendedTable[ext]
    }
    // assume any values higher than 0xFF (255)
    // are Unicode values and return as-is
    return `${String.fromCharCode(number)}`
  }

  /**
   * Transcode text derived from a character set into Unicode characters that
   * emulate the IBM PC era CP-437 set.
   * @returns {string} Unicode text
   */
  normalize() {
    // create the character table to fetch glyphs from
    this.characterTable()
    // text container
    let normalized = ``
    // loop through text and use the values to propagate the container
    for (let i = 0; i < this.text.length; i++) {
      normalized += this.fromCharCode(this.text.charCodeAt(i))
    }
    return normalized
  }
}
/**
 * Converts plain text documents embedded with legacy BBS colour codes to a
 * HTML5 document with matching CSS colour styles.
 * @class BBS
 */
class BBS {
  /**
   * Creates an instance of BBS.
   * @param [text=``] Ascii text encoded with at-symbol codes
   * @param [formatOverride=``] Provide a at-symbol format to parse,
   * such as `celerity`, `pcboard` or leave blank to auto-detect
   * @param [monochrome=false] Strip out all colour & return an ASCII document?
   */
  constructor(text = ``, formatOverride = ``, monochrome = false) {
    if (typeof text !== `string`) CheckArguments(`text`, `string`, text)
    this.override = formatOverride
    this.monochrome = monochrome
    this.sanitizedText = ``
    this.text = text
  }
  /**
   * Looks for and returns the BBS encoding format type.
   */
  detect() {
    const format = FindControlSequences(
      this.text
        .trim()
        .slice(0, 10)
        .replace(`@CLS@`, ``)
    )
    switch (format) {
      case `celerity`:
      case `pcboard`:
      case `renegade`:
      case `telegard`:
      case `wildcat`:
      case `wwivhash`:
      case `wwivheart`:
        // note: any new formats will also need to be added to
        // _locales/en_US/messages.json
        return format
      default:
        console.warn(
          `The format value '%s' for BBS.detect() is not supported`,
          format
        )
        return ``
    }
  }
  findPrefix(format = ``) {
    switch (format) {
      case `pcboard`:
      case `wildcat`:
        return `@X`
      case `celerity`:
      case `renegade`:
        return `|`
      case `telegard`:
        return `\``
      case `wwivhash`:
        return `|#`
      case `wwivheart`:
        return `♥`
    }
  }
  /**
   * "Bring Attention To" all CP-437 block characters within the supplied text
   * that will be contained within <b></b> elements to apply a CSS style fix.
   * @param [text=``] String of text
   * @returns HTMLDivElement
   */
  BBlocks(text = ``) {
    const div = document.createElement(`div`)
    // handle empty rows by inserting a space character between the
    // <div></div> elements
    if (text === ``) return div.appendChild(document.createTextNode(` `))
    // RegExp to markout block characters
    const row = text.replace(RegExp(/([◘░▒▓█▄▐▌▀■]+)/, `ig`), `⮚$1⮘`)
    let textNode = ``
    let b
    for (const character of row) {
      switch (character) {
        case `⮚`:
          // creates an open b element
          if (textNode.length > 0) {
            div.appendChild(document.createTextNode(`${textNode}`))
            textNode = ``
          }
          b = document.createElement(`b`)
          break
        case `⮘`:
          // closes an opened b element
          if (textNode.length > 0) {
            b.appendChild(document.createTextNode(`${textNode}`))
            div.appendChild(b)
            textNode = ``
          }
          break
        default:
          textNode += `${character}`
      }
    }
    if (textNode.length > 0)
      div.appendChild(document.createTextNode(`${textNode}`))
    return div
  }
  /**
   * Creates new `<i></i>` or `<pre></pre>` elements
   * @param [name=``] Element tag name, either `i` or `pre`
   */
  newElement(name = ``) {
    if (![`i`, `pre`].includes(name)) return null
    // web extension DOM
    if (typeof module === `undefined`) return document.createElement(`${name}`)
    else {
      // node.js DOM
      const jsdom = module.require(`jsdom`)
      const { JSDOM } = jsdom
      const dom = new JSDOM(``)
      return dom.window.document.createElement(`${name}`)
    }
  }
  /**
   * Detects the BBS encoding format type in the text and converts it to HTML.
   */
  normalize() {
    // auto-detect text encode
    let format = this.override
    if (format === ``) format = this.detect()
    switch (format) {
      case `plaintext`:
        return this.normalizePlainText()
      case `celerity`:
        return this.normalizeCelerity()
      case `pcboard`:
        return this.normalizePCBoard()
      case `renegade`:
        return this.normalizeRenegade()
      case `telegard`:
        return this.normalizeTelegard()
      case `wildcat`:
        return this.normalizeWildcat()
      case `wwivhash`:
        return this.normalizeWWIVHash()
      case `wwivheart`:
        return this.normalizeWWIVHeart()
      default:
        // unsupported or undetected format so return the text unmodified
        return this.text
    }
  }
  /**
   * Parse plain text and ASCII.
   */
  normalizePlainText() {
    const pre = this.newElement(`pre`)
    // replace escaped characters because text will be encoded by <pre>
    this.sanitizedText = this.text
    const replaced = this.replaceEscapedChars()
    const config = localStorage.getItem(`textSmearBlocks`) || `false`
    // To avoid line artefacts in Windows we surround all block characters
    // with <b></b> elements to apply a CSS style fix.
    if (FindOS() === `win` && config === `true`) {
      const rows = replaced.split(`\n`)
      for (const row of rows) {
        const div = this.BBlocks(row)
        pre.appendChild(div)
      }
    }
    // All other operating systems are able to display the text within
    // a <pre></pre> element
    else pre.appendChild(document.createTextNode(`${replaced}`))
    return pre
  }
  /**
   * Takes text encoded for PCBoard BBS @-codes and returns HTML.
   */
  normalizePCBoard() {
    this.sanitizedText = this.text.replace(
      RegExp(`@(CLS|CLS |PAUSE)@`, `ig`),
      ``
    )
    return this.normalizeAtCodes()
  }
  /**
   * Takes text encoded for Renegade BBS pipe colors and returns HTML.
   */
  normalizeRenegade() {
    this.sanitizedText = this.text.replace(
      RegExp(`@(CLS|CLS |PAUSE)@`, `ig`),
      ``
    )
    return this.normalizePipes()
  }
  /**
   * Takes text encoded for Telegard BBS grave accent colors and returns HTML.
   */
  normalizeTelegard() {
    // convert Telegard `-grave codes to PCBoard @-codes
    // as they share the same colour values
    this.sanitizedText = this.text.replace(
      RegExp(/`([0-9|A-F])([0-9|A-F])/gi, `ig`),
      `@X$1$2`
    )
    return this.normalizeAtCodes()
  }
  /**
   * Takes text encoded for WildCat! BBS @-codes and returns HTML.
   */
  normalizeWildcat() {
    // convert Wildcat to PCBoard @-codes as they're easier to `String.split()`
    this.sanitizedText = this.text
      .replace(RegExp(/@([0-9|A-F])([0-9|A-F])@/gi, `ig`), `@X$1$2`)
      .replace(RegExp(`@(CLS|CLS |PAUSE)@`, `ig`), ``)
    return this.normalizeAtCodes()
  }
  /**
   * Takes text encoded for WVIV BBS pipe codes and returns HTML.
   */
  normalizeWWIVHash() {
    this.sanitizedText = this.text.replace(RegExp(/\|#([0-9])/gi, `ig`), `|0$1`)
    return this.normalizePipes()
  }
  /**
   * Takes text encoded for WVIV BBS heart ♥ codes and returns HTML.
   */
  normalizeWWIVHeart() {
    this.sanitizedText = this.text.replace(
      RegExp(/\x03([0-9])/gi, `ig`),
      `|0$1`
    )
    return this.normalizePipes()
  }
  /**
   * Parse text encoded with PCBoard @-codes.
   */
  normalizeAtCodes() {
    // validate the values of @X codes
    // see NaN issues, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/isNaN
    const validate = value => {
      if (value === ` `) return false
      // convert from hexadecimal to decimal
      const hex = parseInt(value, 16)
      if (Number.isNaN(hex) || hex < 0 || hex > 16) return false
      return true
    }
    const pre = this.newElement(`pre`)
    const replaced = this.replaceEscapedChars()
    // to handle colour, split @X characters
    const colours = replaced.split(`@X`)
    colour:
    for (const code of colours) {
      if (code.length === 0 || code.charCodeAt(0) === 10) continue colour
      // check values to match expected prefix
      // otherwise .. treat as text
      const backgroundCode = `${code.substring(0, 1)}`
      const foregroundCode = `${code.substring(1, 2)}`
      let appendText = code.substring(2)
      if (!validate(foregroundCode) || !validate(backgroundCode)) {
        // handle false-positive codes
        appendText = `@X${code}`
        const element = pre.lastChild
        if (element !== null) {
          // inject text into the previous <i> node
          element.textContent = `${element.textContent} ${appendText}`
          continue colour
        }
        // if childNodes = 0, then use the code below to create a new element
      }
      const element = this.newElement(`i`)
      element.classList.add(`PB${backgroundCode}`, `PF${foregroundCode}`)
      element.textContent = appendText
      pre.appendChild(element)
    }
    return pre
  }

  /**
   * Takes text encoded for Celerity BBS pipe codes and returns HTML.
   */
  normalizeCelerity() {
    this.sanitizedText = this.text.replace(
      RegExp(`@(CLS|CLS |PAUSE)@`, `ig`),
      ``
    )
    const pre = this.newElement(`pre`)
    // replace escaped characters because text will be encoded by <pre>
    const replaced = this.replaceEscapedChars()
    // monochrome mode strips out all pipe codes and returns an ASCII-text page
    const celerityCodes = new Map()
      .set(`k`, `00`)
      .set(`b`, `01`)
      .set(`g`, `02`)
      .set(`c`, `03`)
      .set(`r`, `04`)
      .set(`m`, `05`)
      .set(`y`, `06`)
      .set(`w`, `07`)
      .set(`d`, `08`)
      .set(`B`, `09`)
      .set(`G`, `10`)
      .set(`C`, `11`)
      .set(`R`, `12`)
      .set(`M`, `13`)
      .set(`Y`, `14`)
      .set(`W`, `15`)
      .set(`S`, `16`)
    // to handle colour, split | characters
    const colours = replaced.split(`|`)
    let background = `00`
    let foreground = `00`
    let swap = false
    colour:
    for (const code of colours) {
      if (code.length === 0) continue colour
      // check values to match expected prefix
      // otherwise .. treat as text
      const pipe = `${celerityCodes.get(code.substring(0, 1))}`
      const appendText = code.substring(1)
      // undefined
      const element = this.newElement(`i`)
      if (pipe === `undefined`) {
        element.textContent = `|${code}`
        pre.appendChild(element)
        continue colour
      }
      const x = parseInt(pipe, 10)
      if (x === 16) {
        swap = !swap
      } else if (x >= 0 && x <= 15) {
        if (swap === true) background = 16 + x
        else foreground = pipe
      }
      element.classList.add(`P${background}`, `P${foreground}`)
      element.textContent = appendText
      pre.appendChild(element)
    }
    return pre
  }
  /**
   * Parse text encoded with Renegade pipe color codes.
   */
  normalizePipes() {
    const pre = this.newElement(`pre`)
    // replace escaped characters because text will be encoded by <pre>
    let replaced = this.replaceEscapedChars()
    // to handle colour, split | characters
    const colours = replaced.split(`|`)
    let background = -1
    let foreground = -1
    for (const code of colours) {
      if (code.length === 0 || code.charCodeAt(0) === 10) continue
      // check values to match expected prefix
      // otherwise .. treat as text
      const pipe = `${code.substring(0, 2)}`
      const appendText = code.substring(2)
      const element = this.newElement(`i`)
      const x = parseInt(pipe, 10)
      if (x >= 0 && x <= 15) background = pipe
      else if (x >= 16 && x <= 23) foreground = pipe
      element.classList.add(`P${background}`, `P${foreground}`)
      element.textContent = appendText
      pre.appendChild(element)
    }
    return pre
  }
  /**
   * Replace any escaped characters in the text as it will be preformatted in
   * a <pre> element.
   * @returns string
   */
  replaceEscapedChars() {
    return this.sanitizedText
      .replace(RegExp(`&gt;`, `gi`), `>`)
      .replace(RegExp(`&lt;`, `gi`), `<`)
      .replace(RegExp(`&amp;`, `gi`), `&`)
  }
}
// eslint no-undef/no-unused-vars work around
if (typeof Transcode === `undefined`) eslintUndef
function eslintUndef() {
  return
}
// NodeJS exports (must be placed after the Classes)
if (typeof module === `object`) module.exports = { BBS, DOSText }
