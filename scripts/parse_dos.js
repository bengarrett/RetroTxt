// filename: parse_dos.js
//
// JavaScript converts all the text it handles from the original encoding into UTF-16.
// The functions in this page attempts to convert text encodings commonly used on
// legacy IBM-PC/MS-DOS systems to be JavaScript UTF-16 friendly.
//
// See parse_ansi.js for ANSI art conversion functions.
//
// Characters 0…31 commonly are bits for C0 control functions, but in PC-DOS
// and MS-DOS they were also used for the display of characters.
// Characters 32…126 are skipped as they are based on the US-ASCII/ECMA-43
// near-universal character set, "8-Bit Coded Character Set Structure and Rules".
// ECMA-43 (US-ASCII) www.ecma-international.org/publications/standards/Ecma-043.htm
// ECMA-48 (contains C0) www.ecma-international.org/publications/standards/Ecma-048.htm
//
// JavaScript performance notes:
// Normal objects use less memory than typed arrays (Uint8Array())
// Normal objects are much faster than Maps
"use strict"

/**
 * Simulate legacy text character sets (also called code pages) using Unicode symbols.
 * @class CharacterSet
 */
class CharacterSet {
  /**
   * Creates an instance of CharacterSet.
   * @param [set=``] character set name
   */
  constructor(set = ``) {
    this.set = set
    this.empty = `\u0020` // used as a placeholder for an empty cell
    this.nbsp = `\u00A0` // no-break space
    this.shy = `\u00AD` // soft hyphen
  }
  /**
   * Unicode characters that emulate a code page set.
   * @returns {Array} collection of matching characters
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
   * Internal table of Unicode characters that emulate Code Page 437.
   * ASCII C0 controls are replaced with characters.
   * Sets 2-7 are standard characters that are identical in ASCII and Unicode.
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
   * @returns {Array} extended characters
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
   * Is identical to Windows CP-1252 except it leaves rows 8 and 9 empty.
   * @returns {Array} extended characters
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
  //cSpell:disable
  /**
   * Internal table of Unicode characters that emulate Code Page 1250.
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
   * @returns {Array} extended characters
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
   * Internal table of Unicode characters that emulate Code Page 1251.
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
   * @returns {Array} extended characters
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
   * Internal table of Unicode characters that emulate ISO 8859-5.
   * Note there are some incosistencies that get manually corrected.
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
   * @returns {Array} extended characters
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
   * Internal table of Unicode characters that emulate ISO 8859-10.
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
   * @returns {Array} extended characters
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
   * Internal table of Unicode characters that emulate the Macintosh Roman character set.
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
   * Unicode characters that emulatethe Macintosh Roman character set,
   * also known as Macintosh, Mac OS Roman and MacRoman or in Windows
   * as Code Page 10000. This is the default legacy character encoding
   * for Mac OS 9 and earlier.
   * @returns {Array} extended characters
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
  //cSpell:enable
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
   * Rebuilds string using a code page supplied by the user via the transcode context menus.
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
          `Transcode.rebuild() doesn't know sessionStorage.transcode item '${
            this.session
          }'`
        )
    }
    // handle character 1B to inject EMCA-48/ANSI control function support
    // in ASCII Character 1B (code 27) is the Escape control while with the
    // MS-DOS code page (CP-437) it also is used as a left arrow symbol
    const reg = new RegExp(`\u001B`, `g`)
    this.text = this.text.replace(reg, `←`)
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
    s = s.replace(RegExp(String.fromCharCode(164), `g`), `€`)
    s = s.replace(RegExp(String.fromCharCode(166), `g`), `Š`)
    s = s.replace(RegExp(String.fromCharCode(168), `g`), `š`)
    s = s.replace(RegExp(String.fromCharCode(180), `g`), `Ž`)
    s = s.replace(RegExp(String.fromCharCode(184), `g`), `ž`)
    s = s.replace(RegExp(String.fromCharCode(188), `g`), `Œ`)
    s = s.replace(RegExp(String.fromCharCode(189), `g`), `œ`)
    s = s.replace(RegExp(String.fromCharCode(190), `g`), `Ÿ`)
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
   * @param [text=``] text to parse
   * @param [codepage=`input_UTF16`] character table key
   * @param [displayControls=false] display dos control characters (used by unit tests)
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
    this.displayControls = `${options.displayControls}` || `false` // Boolean needs to be string
    // use localStorage displayControls setting if options.displayControls is not provided
    if (
      options.displayControls === null &&
      typeof localStorage !== `undefined`
    ) {
      this.displayControls = localStorage.getItem(`textDosCtrlCodes`) || `false`
    }
    this.asciiTable = []
    this.extendedTable = []
  }
  /**
   * Build a character table.
   * @returns {(Array|void)} characters
   */
  characterTable() {
    if (RetroTxt.developer)
      console.log(`DOSText(codepage=%s).characterTable()`, this.codepage)
    // ascii C0 controls are generally either ignored or
    // are common between all tables
    const c0 = new CharacterSet(`cp437_C0`)
    this.asciiTable = c0.get()
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
   * @param {*} number hex or decimal character code
   * @returns {string} unicode symbol
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
    //  asciiTable = %s this.asciiTable[number]
    // break out to func?
    switch (this.codepage) {
      case `cp_1251`: {
        if (number === 0xad) return `\u00A1`
      }
    }
    // handle oddball NULL characters that some docs use as a placeholder
    // 65533 is used by the browser as an invalid or unknown character code
    if (number === 0 || number === 65533) return ` `
    // ASCII was originally 7-bits so could support a maximum of 128 characters
    // Interperate ASCII C0 controls as CP-437 symbols characters 0-31
    if (number >= 0x00 && number <= 0x1f) {
      // 0x1B is the escape character that is also used as a trigger for ansi escape codes
      if (number === 0x1b) return this.asciiTable[number]
      // displayControls enabled will force the display of most CP-437 glyphs
      if (this.displayControls === `true`) {
        switch (number) {
          // return as an ASCII C0 control
          case 9: // HT - horizontal tab
            return `\t`
          case 10: // LF - linefeed
          case 13: // CR - carriage return
            return `\n`
          default:
            // javascript also supports the following escape codes but they have no effect in HTML
            // 08 BS \b - backspace
            // 11 VT \v - vertical tab
            // 12 FF \f - form feed
            // return all other ASCII C0 controls as CP437 glyphs
            return this.asciiTable[number]
        }
      }
      // RetroTxt option displayControls=disabled will return all C0 controls
      else {
        // return as an ASCII C0 control
        return `${String.fromCharCode(number)}`
      }
    }
    // characters 0x20 (32) through to 0x7E (126) are universal between
    // most code pages and so they are left as-is
    if (number >= 0x20 && number <= 0x7e) {
      return `${String.fromCharCode(number)}`
    }
    // normally ASCII 0x7F (127) is the delete control
    // but in CP437 it can also represent a house character
    if (number === 0x7f && `${this.displayControls}` === `true`) {
      return `⌂`
    }
    // ASCII extended are additional supported characters when ASCII is used in an
    // 8-bit set. All MS-DOS code pages are 8-bit and support the additional
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
   * @param {*} number hex or decimal character code
   * @param {number} [offsetInput=0] array index offset for this.extendedTable
   * @param {number} [offsetOutput=0] array index offset for the CP437 table
   * @returns {string} unicode symbol
   */
  lookupCp437(number, offsetInput = 0, offsetOutput = 0) {
    // This function takes a Unicode decimal character number, finds its matching character in a legacy ISO codepage table to
    // return the MS-DOS CP-437 character that occupies the same table cell position.
    // The following examples take Unicode Latin/Cyrillic characters in an ISO 8859-5 table and replaces them with MS-DOS CP-437
    // characters.
    // Latin/Cyrillic (legacy ISO) https://en.wikipedia.org/wiki/ISO/IEC_8859-5
    // Cyrillic (Unicode block) https://en.wikipedia.org/wiki/Cyrillic_(Unicode_block)
    // OEM-US (legacy MS-DOS, CP-437) https://en.wikipedia.org/wiki/Code_page_437
    // An ISO 8859-5 encoded tab may return Cyrillic А (1040, \u0401) which is located at B_0 in the codepage table.
    // In the CP-437 table, cell B_0 is the character ░ (\u2591) so Cyrillic А gets swapped with ░
    // The next 8859-5 character Б (1041, \u0411) is in cell B_1, CP-437 B_1 is ▒ (\u2592)
    // The next 8859-5 character В (1042, \u0412) is in cell B_2, CP-437 B_2 is ▓ (\u2593)
    // The next 8859-5 character Г (1043, \u0413) is in cell B_3, CP-437 B_3 is │ (\u2502)
    // here the value is out of sequence, so lookup character tables are always used -⤴
    if (this.codepage === `iso_8859_5`) {
      // handle inconsistencies where Unicode Cyrillic characters are not found in ISO 8859-5
      switch (number) {
        case 8470:
          return `\u2116`
        case 167:
          return `\u00B2`
      }
      // Unicode Cyrillic decimals between 1088 - 1120 are out of range of our lookup sequence
      // such as р с т у ф ... so the unicode decimal value offsets get adjusted
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
    const characterset = new CharacterSet(`cp437`)
    const table = characterset.get()
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
    // swap the character from Macintosh with the matching decimal from table CP437
    return table[index + offsetOutput]
  }
  /**
   * CP-865 (DOS Nordic) specific input.
   * @param {*} number hex or decimal character code
   * @returns {string} unicode symbol
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
   * @param {*} number hex or decimal character code
   * @returns {string} unicode symbol
   */
  lookupCp1252(number) {
    if (number >= 0xa0 && number <= 0xff) {
      return this.extendedTable[number - 128]
    }
    // assume any values higher than 0xFF (255) are Unicode values and return as-is
    return `${String.fromCharCode(number)}`
  }
  /**
   * ISO-8859-1 (Latin 1) specific input.
   * @param {*} number hex or decimal character code
   * @returns {string} unicode symbol
   */
  lookupIso8859_1(number) {
    if (number >= 0xa0 && number <= 0xff) {
      return this.extendedTable[number - 160]
    }
    // assume any values higher than 0xFF (255) are Unicode values and return as-is
    return `${String.fromCharCode(number)}`
  }
  /**
   * ISO-8859-15 (Latin 9) specific input.
   * @param {*} number hex or decimal character code
   * @returns {string} unicode symbol
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
   * @param {*} number hex or decimal character code
   * @returns {string} unicode symbol
   */
  lookupUtf16(number) {
    if (number >= 0xa0 && number <= 0xff) {
      // handle empty Windows 1252 values that would otherwise return incorrect characters
      switch (number) {
        case 0xfc: // ü 0x81 (129)
        case 0xec: // ì 0x8D (141)
        case 0xc5: // Å 0x8F (143)
        case 0xc9: // É 0x90 (144)
        case 0xa5: // ¥ 0x9D (157)
          return `${String.fromCharCode(number)}`
      }
      // find character in CP437 and return its glyph
      const ext = this.extendedTable.indexOf(String.fromCharCode(number))
      // console.log(`number: ${number}\tstr: ${String.fromCharCode(number)}\text: ${ext}`)
      if (ext <= -1) return `${this.errorCharacter}` // error, unknown character
      return this.extendedTable[ext]
    }
    // assume any values higher than 0xFF (255) are Unicode values and return as-is
    return `${String.fromCharCode(number)}`
  }

  /**
   * Transcode text derived from a character set into Unicode characters that emulate IBM PC era CP-437 set.
   * @returns {string} unicode text
   */
  normalize() {
    // create the character table to fetch glyphs from
    this.characterTable()
    // text container
    let normalized = ``
    // loop through text and use the values to propagate the container
    for (let i = 0; i < this.text.length; i++) {
      const characterCode = this.text.charCodeAt(i)
      normalized += this.fromCharCode(characterCode)
    }
    return normalized
  }
}
/**
 * Converts plain text documents embedded with legacy BBS colour codes to a HTML5 document with matching CSS colour styles.
 * @class BBS
 */
class BBS {
  /**
   * Creates an instance of BBS.
   * @param [text=``] ascii text encoded with at-symbol codes
   * @param [formatOverride=``] provide a at-symbol format to parse, either `pcboard`, `wildcat` or leave blank to auto-detect
   * @param [monochrome=false] strip out all colour and return an ASCII document?
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
    const format = FindControlSequences(this.text.trim().slice(0, 5))
    switch (format) {
      case `pcboard`:
      case `wildcat`:
        return format
      default:
        console.warn(
          `The format value '%s' for BBS.detect() is not supported, valid choices: pcboard, wildcat`,
          format
        )
        return ``
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
      case `pcboard`:
        return this.normalizePCBoard()
      case `wildcat`:
        return this.normalizeWildcat()
      default:
        // unsupported or undetected format so return the text unmodified
        return this.text
    }
  }
  /**
   * Takes text encoded for PCBoard and returns HTML.
   */
  normalizePCBoard() {
    // drop the clear screen control code
    this.sanitizedText = this.text.replace(RegExp(`@CLS@`, `ig`), ``)
    return this.normalizeCodes()
  }
  /**
   * Takes text encoded for WildCat! and returns HTML.
   */
  normalizeWildcat() {
    // WildCat to PCBoard @ codes regular-expression
    const wildCatExpression = new RegExp(/@([0-9|A-F])([0-9|A-F])@/gi)
    // convert Wildcat to PCBoard @ codes as they're easier to split
    this.sanitizedText = this.text.replace(
      RegExp(wildCatExpression, `ig`),
      `@X$1$2`
    )
    return this.normalizeCodes()
  }
  /**
   * Takes text encoded with PCBoard @ Codes and returns HTML.
   */
  normalizeCodes() {
    // validate the values of @X codes
    // see NaN issues, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/isNaN
    const validate = value => {
      if (value === ` `) return false
      // convert from hexadecimal to decimal
      const hex = parseInt(value, 16)
      if (isNaN(hex) || hex < 0 || hex > 16) return false
      return true
    }
    // <pre></pre> DOM object
    let pre
    if (typeof module === `undefined`) {
      // webextension DOM
      pre = document.createElement(`pre`)
    } else {
      // nodejs DOM
      const jsdom = module.require(`jsdom`)
      const { JSDOM } = jsdom
      const dom = new JSDOM(``)
      pre = dom.window.document.createElement(`pre`)
    }
    // replace escaped characters because text will be encoded by <pre>
    const expGT = new RegExp(`&gt;`, `gi`)
    const textGT = this.sanitizedText.replace(expGT, `>`)
    const expLT = new RegExp(`&lt;`, `gi`)
    const textLT = textGT.replace(expLT, `<`)
    const expAmpersand = new RegExp(`&amp;`, `gi`)
    const textAmpersand = textLT.replace(expAmpersand, `&`)
    // drop other @ codes
    // trim in needed for \n@CLS@ etc.
    let preText = textAmpersand
    if (textAmpersand.trim().substr(0, 5) === `@CLS @`)
      preText = preText.trim().substr(5)
    // monochrome mode strips out all @X codes and returns an ASCII-text page
    if (this.monochrome === true) {
      const pcBoardExpression = new RegExp(/@X([0-9|A-F])([0-9|A-F])/gi)
      this.sanitizedText = preText.replace(RegExp(pcBoardExpression, `ig`), ``)
      let element = document.createElement(`i`)
      element.textContent = this.sanitizedText
      pre.appendChild(element)
      return pre
    }
    // to handle colour, split @X (referred to as 'at codes')
    const atCodes = preText.split(`@X`)
    for (const code of atCodes) {
      if (code.length === 0) continue
      // check values to match expected @X
      // otherwise .. treat as text
      const backgroundCode = `${code.substring(0, 1)}`
      const foregroundCode = `${code.substring(1, 2)}`
      let appendText = code.substring(2)
      if (!validate(foregroundCode) || !validate(backgroundCode)) {
        // handle false-positive @X codes
        appendText = `@X${code}`
        const element = pre.lastChild
        if (element !== null) {
          // inject text into the previous <i> node
          element.textContent = `${element.textContent} ${appendText}`
          continue
        }
        // if childNodes = 0, then use the code below to create a new element
      }
      let element
      if (typeof module === `undefined`) element = document.createElement(`i`)
      else {
        const jsdom = module.require(`jsdom`)
        const { JSDOM } = jsdom
        const dom = new JSDOM(``)
        element = dom.window.document.createElement(`i`)
      }
      element.classList.add(`PB${backgroundCode}`)
      element.classList.add(`PF${foregroundCode}`)
      element.textContent = appendText
      pre.appendChild(element)
    }
    return pre
  }
}
// eslint no-undef/no-unused-vars work around
if (typeof Transcode === `undefined`) eslintUndef
function eslintUndef() {
  return
}
// NodeJS exports (must be placed after the Classes)
if (typeof module === `object`) {
  module.exports = { BBS, DOSText }
}
