// File: scripts/parse_dos.js
//
// Content-script to handle legacy text codepages and character sets.
//
// JavaScript parses all text as UTF-16.
// The functions on this page attempt to convert the text encodings
// commonly used by legacy microcomputer, PC and MS-DOS systems to
// be JavaScript UTF-16 friendly.
//
// For ANSI controls conversion functions see `parse_ansi.js`.
//
// ASCII text notes:
// Characters 0…31 are commonly bits for ASCII C0 control functions.
// But for the IBM PC and MS-DOS they were also used for the display of characters.
// Characters 32…126 are skipped as they are based on the US-ASCII/ECMA-43
// near-universal character set.

const empty = `\u0020`,
  nbsp = `\u00A0`,
  softHyphen = `\u00AD`,
  radix = 16,
  linefeed = 10

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
  }
  /**
   * Unicode characters that emulate a code page set.
   * @returns {Array} Collection of matching characters
   */
  get() {
    switch (this.set) {
      case `cp437_C0`:
        return this._cp437_C0()
      case Cs.DOS_437_English:
      case Cs.DOS_865:
        return this._cp437()
      case Cs.Windows_1250:
        return this._cp1250()
      case Cs.Windows_1251:
        return this._cp1251()
      case Cs.Windows_1252_English:
        return this._cp437()
      case Cs.ISO8859_1:
      case Cs.ISO8859_15:
        return this._iso8859_1()
      case Cs.ISO8859_5:
        return this._iso8859_5()
      case Cs.ISO8859_10:
        return this._iso8859_10()
      case Cs.Macintosh:
        return this._macRoman()
      default:
        return this._cp437()
    }
  }
  /**
   * An internal table of Unicode characters that emulate Code Page 437.
   * ASCII C0 controls are replaced with characters.
   * Sets 2 through 7 are standard characters that are identical in both
   * ASCII and Unicode.
   */
  _cp437Table() {
    this.set_0 = Array.from(`␀☺☻♥♦♣♠•◘○◙♂♀♪♫☼`)
    this.set_1 = Array.from(`►◄↕‼¶§▬↨↑↓→←∟↔▲▼`)
    this.set_8 = Array.from(`ÇüéâäàåçêëèïîìÄÅ`)
    this.set_9 = Array.from(`ÉæÆôöòûùÿÖÜ¢£¥₧ƒ`)
    this.set_a = Array.from(`áíóúñÑªº¿⌐¬½¼¡«»`)
    this.set_b = Array.from(`░▒▓│┤╡╢╖╕╣║╗╝╜╛┐`)
    this.set_c = Array.from(`└┴┬├─┼╞╟╚╔╩╦╠═╬╧`)
    this.set_d = Array.from(`╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀`)
    this.set_e = Array.from(`αßΓπΣσµτΦΘΩδ∞φε∩`)
    this.set_f = Array.from(`≡±≥≤⌠⌡÷≈°∙·√ⁿ²■${nbsp}`)
  }
  /**
   * Unicode characters that emulate Code Page 437.
   * @returns {Array} C0 control codes
   */
  _cp437_C0() {
    this._cp437Table()
    return [...this.set_0, ...this.set_1]
  }
  /**
   * Unicode characters that emulate Code Page 437.
   * @returns {Array} Extended characters
   */
  _cp437() {
    this._cp437Table()
    return this.set_8.concat(
      this.set_9,
      this.set_a,
      this.set_b,
      this.set_c,
      this.set_d,
      this.set_e,
      this.set_f,
    )
  }
  /**
   * Unicode characters that emulate ISO 8859-1.
   * It is identical to Windows CP-1252 except it leaves rows 8 and 9 empty.
   * @returns {Array} Extended characters
   */
  _iso8859_1() {
    this._cp437Table()
    return this.set_a.concat(
      this.set_b,
      this.set_c,
      this.set_d,
      this.set_e,
      this.set_f,
    )
  }
  /**
   * An internal table of Unicode characters that emulate Code Page 1250.
   */
  _cp1250Table() {
    this.set_8 = Array.from(`€${empty}‚${empty}„…†‡${empty}‰Š‹ŚŤŽŹ`)
    this.set_9 = Array.from(`${empty}‘’“”•–—${empty}™š›śťžź`)
    this.set_a = Array.from(`${nbsp}ˇ˘Ł¤Ą¦§¨©Ş«¬${softHyphen}®Ż`)
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
  _cp1250() {
    this._cp1250Table()
    return this.set_8.concat(
      this.set_9,
      this.set_a,
      this.set_b,
      this.set_c,
      this.set_d,
      this.set_e,
      this.set_f,
    )
  }
  /**
   * An internal table of Unicode characters that emulate Code Page 1251.
   */
  _cp1251Table() {
    this.set_8 = Array.from(`ЂЃ‚ѓ„…†‡€‰Љ‹ЊЌЋЏ`)
    this.set_9 = Array.from(`ђ‘’“”•–—${empty}™љ›њќћџ`)
    this.set_a = Array.from(`${nbsp}ЎўЈ¤Ґ¦§Ё©Є«¬${softHyphen}®Ї`)
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
  _cp1251() {
    this._cp1251Table()
    return this.set_8.concat(
      this.set_9,
      this.set_a,
      this.set_b,
      this.set_c,
      this.set_d,
      this.set_e,
      this.set_f,
    )
  }
  /**
   * An internal table of Unicode characters that emulate ISO 8859-5.
   * Note there are some inconsistencies that get manually corrected.
   * A_0, A_D, F_0, F_D
   */
  _iso8859_5Table() {
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
  _iso8859_5() {
    this._iso8859_5Table()
    return this.set_a.concat(
      this.set_b,
      this.set_c,
      this.set_d,
      this.set_e,
      this.set_f,
    )
  }
  /**
   * An internal table of Unicode characters that emulate ISO 8859-10.
   */
  _iso8859_10Table() {
    this.set_a = Array.from(`${nbsp}ĄĒĢĪĨĶ§ĻĐŠŦŽ${softHyphen}ŪŊ`)
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
  _iso8859_10() {
    this._iso8859_10Table()
    return this.set_a.concat(
      this.set_b,
      this.set_c,
      this.set_d,
      this.set_e,
      this.set_f,
    )
  }
  /**
   * Internal table of Unicode characters that emulate the
   * Macintosh Roman character set.
   */
  _macRomanTable() {
    this.set_8 = Array.from(`ÄÅÇÉÑÖÜáàâäãåçéè`)
    this.set_9 = Array.from(`êëíìîïñóòôöõúùûü`)
    this.set_a = Array.from(`†°¢£§•¶ß®©™´¨≠ÆØ`)
    this.set_b = Array.from(`∞±≤≥¥µ∂∑∏π∫ªºΩæø`)
    this.set_c = Array.from(`¿¡¬√ƒ≈∆«»…${nbsp}ÀÃÕŒœ`)
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
  _macRoman() {
    this._macRomanTable()
    return this.set_8.concat(
      this.set_9,
      this.set_a,
      this.set_b,
      this.set_c,
      this.set_d,
      this.set_e,
      this.set_f,
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
    this.session = sessionStorage.getItem(`lockTranscode`)
    super.set = set
    this.text = text
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
  rebuild(codepage = ``) {
    Console(`rebuild() = ${codepage}`)
    switch (codepage) {
      case Cs.OutputCP1252:
        this._input_cp1252()
        break
      case Cs.OutputISO8859_15:
        this._input_iso8859_15()
        break
      case Cs.OutputISO8859_1:
        // supplied by SAUCE metadata
        break
      case Cs.OutputUS_ASCII:
      case Cs.ISO8859_5:
      case Cs.Windows_1252_English:
        // nothing needs to be done
        break
      default:
        console.log(
          `Transcode.rebuild() doesn't know lock-transcode item '${codepage}'`,
        )
    }
    // Handle character 1B to inject EMCA-48/ANSI control function support.
    // In ASCII, Character 1B (code 27) is the Escape control, while with the
    // MS-DOS code page 437, it also is used as a left arrow symbol.
    this.text = this.text.replace(RegExp(`\u001B`, `g`), `←`)
  }
  /**
   * Rebuilds text to emulate the CP-1252 (Windows Latin 1) character set.
   */
  _input_cp1252() {
    const table = this._table_cp1252()
    // handle characters 80…FF
    let i = table.length,
      encodedText = this.text
    while (i--) {
      const code = i + 128
      Console(`${i} ${String.fromCharCode(code)} ↣ ${table[i]}`)
      encodedText = encodedText.replace(
        RegExp(String.fromCharCode(code), `g`),
        table[i],
      )
    }
    encodedText = encodedText.replace(
      RegExp(String.fromCharCode(127), `g`),
      ` `,
    ) // some Amiga ANSI use the Delete Control as a space
    this.text = encodedText
  }
  /**
   * Rebuilds text to emulate the ISO 8859-15 (Latin 9) character set.
   */
  _input_iso8859_15() {
    const s = this.text
      // some Amiga ANSI use the Delete Control 127 as a space
      .replace(RegExp(String.fromCharCode(127), `g`), ` `)
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
  _table_cp1252() {
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
// eslint-disable-next-line no-unused-vars
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
    options = { codepage: `input_UTF16`, displayControls: null },
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
      this.displayControls =
        localStorage.getItem(`textDOSControlGlyphs`) || `false`
    this.asciiTable = []
    this.extendedTable = []
  }
  /**
   * Transcode text derived from a character set into Unicode characters that
   * emulate the IBM PC era CP-437 set.
   * @returns {string} Unicode text
   */
  normalize() {
    this._characterTable()
    let normalized = ``
    // loop through text and use the values to propagate the container
    for (let i = 0; i < this.text.length; i++) {
      normalized += this._fromCharCode(this.text.charCodeAt(i))
    }
    return normalized
  }
  /**
   * Build a character table.
   * @returns {(Array|void)} Characters
   */
  _characterTable() {
    Console(`DOS text character table codepage: ${this.codepage}.`)
    // ascii C0 controls are either ignored or are common between all tables
    this.asciiTable = new CharacterSet(`cp437_C0`).get()
    // extended character tables
    const table = new CharacterSet(`${this.codepage}`)
    this.extendedTable = table.get()
    switch (this.codepage) {
      case `moduleExport`:
      case Cs.DOS_437_English:
      case Cs.OutputUS_ASCII:
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
  _fromCharCode(number) {
    if (DeveloperModeDebug && number > 127)
      Console(
        `DOSText()._fromCharCode(${number}) String.fromCharCode = ${String.fromCharCode(
          number,
        )} \\u${String.fromCharCode(number).codePointAt(0).toString(radix)}`,
      )
    switch (this.codepage) {
      case Cs.Windows_1251: {
        if (number === 0xad) return `\u00A1`
      }
    }
    const NUL = 0,
      horizontalTab = 9,
      carriageReturn = 13,
      escape = 27,
      US = 31,
      invalid = 65533
    // handle oddball `NUL` characters that some docs use as a placeholder.
    // 65533 is used by the browser as an invalid or unknown character code.
    // the ␀ glyph used to be return but doesn't work well in monospace fonts
    if (number === NUL) return ` `
    if (number === invalid) return ` `
    // ASCII was originally 7-bits so could support a maximum of 128 characters.
    // interpret ASCII C0 controls as CP-437 symbols characters 0-31
    if (number >= NUL && number <= US) {
      // 0x1B is the escape character that is also used as a trigger for
      // ANSI escape codes
      if (number === escape) return this.asciiTable[number]
      // `displayControls` enabled will force the display of most CP-437 glyphs
      if (this.displayControls === `true`) {
        switch (number) {
          // return as an ASCII C0 control
          case horizontalTab:
            // some ANSI/DOS art expect the ○ character
            if (this.codepage === Cs.Windows_1252_English)
              return this.asciiTable[9]
            return `\t`
          case linefeed:
          case carriageReturn:
            return `\n`
          default:
            // JavaScript also supports these escape codes, but in HTML they
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
      return `${String.fromCharCode(number)}`
    }
    const space = 32,
      tilde = 126,
      deleted = 127
    // characters 0x20 (32) through to 0x7E (126) are universal between
    // most code pages and so they are left as-is
    if (number >= space && number <= tilde)
      return `${String.fromCharCode(number)}`
    // normally ASCII 0x7F (127) is the delete control
    // but in CP437 it can also represent a house character
    if (number === deleted && `${this.displayControls}` === `true`) return `⌂`
    // ASCII extended are additional supported characters when ASCII is used in
    // an 8-bit set. All MS-DOS code pages are 8-bit and support the additional
    // 128 characters, between 8_0 (128)...F_F (255)
    switch (this.codepage) {
      case Cs.DOS_865:
        return this._lookupCp865(number)
      case Cs.Windows_1250:
      case Cs.Windows_1251:
        return this._lookupCp437(number)
      case Cs.DOS_437_English:
      case Cs.Windows_1252_English:
        return this._lookupCp1252(number)
      case Cs.ISO8859_1:
        return this._lookupIso8859_1(number)
      case Cs.ISO8859_5:
        return this._lookupCp437(number, space)
      case Cs.ISO8859_10:
        return this._lookupCp437(number, 0, space)
      case Cs.ISO8859_15:
        return this._lookupIso8859_15(number)
      case Cs.Macintosh:
        return this._lookupCp437(number)
      default:
        return this._lookupUtf16(number)
    }
  }
  /**
   * A lookup for extended characters using Code Page 437 as the base table.
   * @param {*} Numeric hex or decimal character code
   * @param {number} [offsetInput=0] Array index offset for this.extendedTable
   * @param {number} [offsetOutput=0] Array index offset for the CP437 table
   * @returns {string} Unicode symbol
   */
  _lookupCp437(number, osInput = 0, osOutput = 0) {
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
    let offsetInput = osInput,
      offsetOutput = osOutput
    if (this.codepage === Cs.ISO8859_5) {
      // handle inconsistencies where Unicode Cyrillic characters
      // are not found in ISO 8859-5
      const numeroSign = 8470, // №
        w = 167,
        р = 1088 // cyrillic Small Letter Er
      switch (number) {
        case numeroSign:
          return `\u2116`
        case w:
          return `\u00B2`
      }
      // The Unicode Cyrillic decimals between 1088 - 1120 are out of range
      // for our lookup sequence, i.e characters such as `р с т у ф`.
      // so the Unicode decimal value offsets are adjusted
      if (number >= р) {
        offsetInput = 0
        offsetOutput = 32
      }
    }
    // find character in the character table
    const index = this.extendedTable.indexOf(
      `${String.fromCharCode(number + offsetInput)}`,
    )
    const deleted = 127
    if (number >= deleted)
      Console(
        `DOSText()._lookupCp437(${number}) number: %s character: %s @index: %s`,
        number + offsetInput,
        String.fromCharCode(number + offsetInput),
        index,
      )
    if (index <= -1) {
      console.log(
        `${this.errorCharacter} ${
          this.codepage
        } extendedTable.indexOf(%s) character failed: \\u%s '%s' [${number} \\u${String.fromCharCode(
          number,
        )
          .codePointAt(0)
          .toString(radix)}]`,
        number + offsetInput,
        String.fromCharCode(number + offsetInput)
          .codePointAt(0)
          .toString(radix),
        String.fromCharCode(number + offsetInput),
      )
      return `${this.errorCharacter}` // error, unknown character
    }
    // fetch the CP-437 table
    const table = new CharacterSet(`cp437`).get()
    Console(
      `extendedTable.indexOf(%s) character success: \\u%s '%s' %s`,
      number + offsetInput,
      String.fromCharCode(number + offsetInput)
        .codePointAt(0)
        .toString(radix),
      String.fromCharCode(number + offsetInput),
      table[index + offsetOutput],
    )
    // swap out the character from Macintosh with a matching decimal from the CP437 table
    return table[index + offsetOutput]
  }
  /**
   * CP-865 (DOS Nordic) specific input.
   * @param {*} number Hex or decimal character code
   * @returns {string} Unicode symbol
   */
  _lookupCp865(number) {
    const ø = 0xf8,
      Ø = 0xd8,
      currencySign = 0xa4,
      offset = 128
    switch (number) {
      case ø:
        return this.extendedTable[0x9b - offset]
      case Ø:
        return this.extendedTable[0x9d - offset]
      case currencySign:
        return this.extendedTable[0xaf - offset]
    }
    return this._lookupUtf16(number)
  }
  /**
   * Windows-1252 specific input.
   * Often but incorrectly called Windows ANSI.
   * @param {*} number Hex or decimal character code
   * @returns {string} Unicode symbol
   */
  _lookupCp1252(number) {
    const nbsp = 0xa0,
      ÿ = 0xff,
      offset = 128
    if (number >= nbsp && number <= ÿ)
      return this.extendedTable[number - offset]
    // assume any values higher than 0xFF (255)
    // are Unicode values and return as-is
    return `${String.fromCharCode(number)}`
  }
  /**
   * ISO-8859-1 (Latin 1) specific input.
   * @param {*} number Hex or decimal character code
   * @returns {string} Unicode symbol
   */
  _lookupIso8859_1(number) {
    const nbsp = 0xa0,
      ÿ = 0xff,
      offset = 160
    if (number >= nbsp && number <= ÿ)
      return this.extendedTable[number - offset]
    // assume any values higher than 0xFF (255)
    // are Unicode values and return as-is
    return `${String.fromCharCode(number)}`
  }
  /**
   * ISO-8859-15 (Latin 9) specific input.
   * @param {*} number Hex or decimal character code
   * @returns {string} Unicode symbol
   */
  _lookupIso8859_15(number) {
    // ISO 8859-15 is identical to ISO 8859-1 except for these 8 changes
    const euro = 0x20ac,
      Š = 0x160,
      š = 0x161,
      Ž = 0x017d,
      ž = 0x017e,
      Œ = 0x0152,
      œ = 0x153,
      Ÿ = 0x178,
      offset = 160
    switch (number) {
      case euro:
        return this.extendedTable[0xa4 - offset]
      case Š:
        return this.extendedTable[0xa6 - offset]
      case š:
        return this.extendedTable[0xa8 - offset]
      case Ž:
        return this.extendedTable[0xb4 - offset]
      case ž:
        return this.extendedTable[0xb8 - offset]
      case Œ:
        return this.extendedTable[0xbc - offset]
      case œ:
        return this.extendedTable[0xbd - offset]
      case Ÿ:
        return this.extendedTable[0xbe - offset]
    }
    return this._lookupIso8859_1(number)
  }
  /**
   * UTF-16 (JavaScript default) specific input.
   * @param {*} number Hex or decimal character code
   * @returns {string} Unicode symbol
   */
  _lookupUtf16(number) {
    const nbsp = 0xa0,
      ÿ = 0xff,
      ü = 0xfc,
      ì = 0xec,
      Å = 0xc5,
      É = 0xc9,
      yen = 0xa5
    if (number >= nbsp && number <= ÿ) {
      // handle empty Windows 1252 values that would otherwise return incorrect characters
      switch (number) {
        case ü: // 0x81 (129)
        case ì: // 0x8D (141)
        case Å: // 0x8F (143)
        case É: // 0x90 (144)
        case yen: // 0x9D (157)
          return `${String.fromCharCode(number)}`
      }
      // find a character in CP437 and return its glyph
      const ext = this.extendedTable.indexOf(String.fromCharCode(number))
      // error, unknown character
      if (ext <= -1) return `${this.errorCharacter}`
      return this.extendedTable[ext]
    }
    // assume any values higher than 0xFF (255) are Unicode values and return as-is
    return `${String.fromCharCode(number)}`
  }
}
/**
 * Converts plain text documents embedded with legacy BBS colour codes to a
 * HTML5 document with matching CSS colour styles.
 * @class BBS
 */
// eslint-disable-next-line no-unused-vars
class BBS {
  /**
   * Creates an instance of BBS.
   * @param [text=``] Ascii text encoded with at-symbol codes
   * @param [formatOverride=``] Provide a at-symbol format to parse,
   * such as `celerity`, `pcboard` or leave blank to auto-detect
   * @param [monochrome=false] Strip out all colour & return an ASCII document?
   */
  constructor(text = ``, formatOverride = UnknownText, monochrome = false) {
    if (typeof text !== `string`) CheckArguments(`text`, `string`, text)
    this.override = formatOverride
    this.monochrome = monochrome
    this.sanitizedText = ``
    this.text = text
  }
  /**
   * Detects the BBS encoding format type in the text and converts it to HTML.
   */
  normalize() {
    // auto-detect text encode
    const format =
      this.override === UnknownText ? this._detect() : this.override
    switch (format) {
      case PlainText:
        return this._normalizePlainText()
      case CelerityText:
        return this._normalizeCelerity()
      case PCBoardText:
        return this._normalizePCBoard()
      case RenegadeText:
        return this._normalizeRenegade()
      case TelegardText:
        return this._normalizeTelegard()
      case WildcatText:
        return this._normalizeWildcat()
      case WWIVHashText:
        return this._normalizeWWIVHash()
      case WWIVHeartText:
        return this._normalizeWWIVHeart()
      default:
        // return the text unmodified
        return this.text
    }
  }
  print(format = UnknownText) {
    switch (format) {
      case CelerityText:
        return `Celerity |`
      case PCBoardText:
        return `PCBoard @`
      case RenegadeText:
        return `Renegade |`
      case TelegardText:
        return `Telegard \``
      case WildcatText:
        return `Wildcat! @X`
      case WWIVHashText:
        return `WWIV |#`
      case WWIVHeartText:
        return `WWIV ♥`
    }
  }
  /**
   * Looks for and returns the BBS encoding format type.
   */
  _detect() {
    const format = FindControlSequences(
      this.text.trim().slice(0, 10).replace(`@CLS@`, ``),
    )
    switch (format) {
      case CelerityText:
      case PCBoardText:
      case RenegadeText:
      case TelegardText:
      case WildcatText:
      case WWIVHashText:
      case WWIVHeartText:
        // note: any new formats will also need to be added to
        // _locales/en_US/messages.json
        return format
      default:
        console.log(
          `The format value '%s' for BBS._detect() is not supported`,
          format,
        )
        return ``
    }
  }
  /**
   * "Bring Attention To" all CP-437 block characters within the supplied text
   * that will be contained within <b></b> elements to apply a CSS style fix.
   * @param [text=``] String of text
   * @returns HTMLDivElement
   */
  _BBlocks(text = ``) {
    const div = document.createElement(`div`),
      bringAttentionOpen = `⮚`,
      bringAttentionClose = `⮘`
    // handle empty rows by inserting a space character between the
    // <div></div> elements, this must keep appendChild() and createTextNode()
    if (text === ``) return div.appendChild(document.createTextNode(` `))
    // RegExp to markout block characters
    const row = text.replace(
      RegExp(/([◘░▒▓█▄▐▌▀■]+)/, `ig`),
      `${bringAttentionOpen}$1${bringAttentionClose}`,
    )
    let textNode = ``,
      b
    for (const character of row) {
      switch (character) {
        case bringAttentionOpen:
          // creates an open b element
          if (textNode.length > 0) {
            div.append(`${textNode}`)
            textNode = ``
          }
          b = document.createElement(`b`)
          break
        case bringAttentionClose:
          // closes an opened b element
          if (textNode.length > 0) {
            b.append(`${textNode}`)
            div.append(b)
            textNode = ``
          }
          break
        default:
          textNode += `${character}`
      }
    }
    if (textNode.length > 0) div.append(`${textNode}`)
    return div
  }
  /**
   * Creates new `<i></i>` or `<pre></pre>` elements
   * @param [name=``] Element tag name, either `i` or `pre`
   */
  _newElement(name = ``) {
    if (![`i`, `pre`].includes(name)) return null
    return document.createElement(`${name}`)
  }
  /**
   * Parse plain text and ASCII.
   */
  _normalizePlainText() {
    const pre = this._newElement(`pre`)
    // replace escaped characters because text will be encoded by <pre>
    this.sanitizedText = this.text
    const replaced = this._replaceEscapedChars(),
      smear = localStorage.getItem(`textSmearBlockCharacters`) || `false`
    // To avoid line artefacts in Windows, surround all block characters
    // with <b></b> elements and apply a CSS style fix.
    if (smear === `true`) {
      const rows = replaced.split(`\n`)
      for (const row of rows) {
        const div = this._BBlocks(row)
        pre.append(div)
      }
      return pre
    }
    // All other operating systems are able to display the text within
    // a <pre></pre> element
    pre.append(`${replaced}`)
    return pre
  }
  /**
   * Takes text encoded for PCBoard BBS @-codes and returns HTML.
   */
  _normalizePCBoard() {
    this.sanitizedText = this.text.replace(
      RegExp(`@(CLS|CLS |PAUSE)@`, `ig`),
      ``,
    )
    return this._normalizeAtCodes()
  }
  /**
   * Takes text encoded for Renegade BBS pipe colors and returns HTML.
   */
  _normalizeRenegade() {
    this.sanitizedText = this.text.replace(
      RegExp(`@(CLS|CLS |PAUSE)@`, `ig`),
      ``,
    )
    return this._normalizePipes()
  }
  /**
   * Takes text encoded for Telegard BBS grave accent colors and returns HTML.
   */
  _normalizeTelegard() {
    // as Telegard and PCBoard colour values are the same,
    // convert Telegard `-grave codes into PCBoard @-codes
    this.sanitizedText = this.text.replace(
      RegExp(/`([0-9|A-F])([0-9|A-F])/gi, `ig`),
      `@X$1$2`,
    )
    return this._normalizeAtCodes()
  }
  /**
   * Takes text encoded for WildCat! BBS @-codes and returns HTML.
   */
  _normalizeWildcat() {
    // convert Wildcat to PCBoard @-codes as they're easier to `String.split()`
    this.sanitizedText = this.text
      .replace(RegExp(/@([0-9|A-F])([0-9|A-F])@/gi, `ig`), `@X$1$2`)
      .replace(RegExp(`@(CLS|CLS |PAUSE)@`, `ig`), ``)
    return this._normalizeAtCodes()
  }
  /**
   * Takes text encoded for WVIV BBS pipe codes and returns HTML.
   */
  _normalizeWWIVHash() {
    this.sanitizedText = this.text.replace(RegExp(/\|#([0-9])/gi, `ig`), `|0$1`)
    return this._normalizePipes()
  }
  /**
   * Takes text encoded for WVIV BBS heart ♥ codes and returns HTML.
   */
  _normalizeWWIVHeart() {
    this.sanitizedText = this.text.replace(
      // eslint-disable-next-line no-control-regex
      RegExp(/\x03([0-9])/gi, `ig`),
      `|0$1`,
    )
    return this._normalizePipes()
  }
  /**
   * Parse text encoded with PCBoard @-codes.
   */
  _normalizeAtCodes() {
    // validate the values of @X codes
    // see NaN issues, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/isNaN
    const validate = (value) => {
      if (value === ` `) return false
      // convert from hexadecimal to decimal
      const hex = parseInt(value, radix),
        min = 0
      if (Number.isNaN(hex) || hex < min || hex > radix) return false
      return true
    }
    const pre = this._newElement(`pre`),
      replaced = this._replaceEscapedChars()
    // smear block characters
    const smear = localStorage.getItem(`textSmearBlockCharacters`) || `false`
    // to handle colour, split @X characters
    const colours = replaced.split(`@X`)
    colour: for (const code of colours) {
      if (code.length === 0 || code.charCodeAt(0) === linefeed) continue colour
      // check values to match expected prefix, otherwise treat as text
      const backgroundCode = `${code.substring(0, 1)}`,
        foregroundCode = `${code.substring(1, 2)}`
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
      const element = this._newElement(`i`)
      element.classList.add(`PB${backgroundCode}`, `PF${foregroundCode}`)
      if (smear === `true`) {
        const clean = DOMPurify.sanitize(appendText, {
          USE_PROFILES: { html: true },
        })
        const bold = clean.replace(RegExp(/([◘░▒▓█▄▐▌▀■]+)/, `g`), `<b>$1</b>`)
        element.innerHTML = bold
      } else element.textContent = appendText
      pre.append(element)
    }

    return pre
  }
  /**
   * Takes text encoded for Celerity BBS pipe codes and returns HTML.
   */
  _normalizeCelerity() {
    this.sanitizedText = this.text.replace(
      RegExp(`@(CLS|CLS |PAUSE)@`, `ig`),
      ``,
    )
    const pre = this._newElement(`pre`)
    // replace escaped characters because text will be encoded by <pre>
    const replaced = this._replaceEscapedChars()
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
    // smear block characters
    const smear = localStorage.getItem(`textSmearBlockCharacters`) || `false`
    let background = `00`,
      foreground = `00`,
      swap = false
    colour: for (const code of colours) {
      if (code.length === 0) continue colour
      // check values to match expected prefix, otherwise treat as text
      const pipe = `${celerityCodes.get(code.substring(0, 1))}`,
        appendText = code.substring(1),
        element = this._newElement(`i`)
      if (pipe === `undefined`) {
        element.textContent = `|${code}`
        pre.append(element)
        continue colour
      }
      const x = parseInt(pipe, 10),
        min = 0,
        max = 15,
        swapToggle = 16
      if (x === swapToggle) {
        swap = !swap
      } else if (x >= min && x <= max) {
        if (swap === true) background = swapToggle + x
        else foreground = pipe
      }
      element.classList.add(`P${background}`, `P${foreground}`)
      if (smear === `true`) {
        const clean = DOMPurify.sanitize(appendText, {
          USE_PROFILES: { html: true },
        })
        const bold = clean.replace(RegExp(/([◘░▒▓█▄▐▌▀■]+)/, `g`), `<b>$1</b>`)
        element.innerHTML = bold
      } else element.textContent = appendText
      pre.append(element)
    }
    return pre
  }
  /**
   * Parse text encoded with Renegade pipe color codes.
   */
  _normalizePipes() {
    const pre = this._newElement(`pre`)
    // replace escaped characters because text will be encoded by <pre>
    const replaced = this._replaceEscapedChars()
    let background = -1,
      foreground = -1
    // to handle colour, split | characters
    const colours = replaced.split(`|`)
    // smear block characters
    const smear = localStorage.getItem(`textSmearBlockCharacters`) || `false`
    for (const code of colours) {
      if (code.length === 0 || code.charCodeAt(0) === linefeed) continue
      // check values to match expected prefix, otherwise treat as text
      const pipe = `${code.substring(0, 2)}`,
        appendText = code.substring(2),
        element = this._newElement(`i`),
        x = parseInt(pipe, 10),
        backgroundMin = 0,
        backgroundMax = 15,
        foregroundMin = 16,
        foregroundMax = 23
      if (x >= backgroundMin && x <= backgroundMax) background = pipe
      else if (x >= foregroundMin && x <= foregroundMax) foreground = pipe
      element.classList.add(`P${background}`, `P${foreground}`)
      if (smear === `true`) {
        const clean = DOMPurify.sanitize(appendText, {
          USE_PROFILES: { html: true },
        })
        const bold = clean.replace(RegExp(/([◘░▒▓█▄▐▌▀■]+)/, `g`), `<b>$1</b>`)
        element.innerHTML = bold
      } else element.textContent = appendText
      pre.append(element)
    }
    return pre
  }
  /**
   * Replace any escaped characters in the text, as it will be preformatted in
   * a <pre> element.
   * @returns string
   */
  _replaceEscapedChars() {
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

/*global CheckArguments Console Cs DeveloperModeDebug DOMPurify FindControlSequences
CelerityText PlainText PCBoardText RenegadeText TelegardText WildcatText WWIVHashText
WWIVHeartText UnknownText */
