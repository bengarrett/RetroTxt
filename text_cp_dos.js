// filename: text_cp_dos.js
//
// JavaScript converts all the text it handles from the original encoding into UTF-16.
// The functions in this page converts legacy text encodings commonly used on
// legacy IBM-PC/MS-DOS systems to be JavaScript UTF-16 friendly.
//
// See text_ecma48.js for ANSI art conversion functions.
//     text_ecma94.js for the legacy online encoding functions.
//
// Characters 32…126 are skipped as they are based on the US-ASCII/ECMA-43
// near-universal character set, "8-Bit Coded Character Set Structure and Rules".
// Characters 0…31 commonly are bits for C0 control functions, but in PC-DOS
// and MS-DOS they were also used for the display of characters.
// ECMA-43 (US-ASCII) www.ecma-international.org/publications/standards/Ecma-043.htm
// ECMA-48 (contains C0) www.ecma-international.org/publications/standards/Ecma-048.htm
'use strict'

/*global chrome checkArg findControlSequences ListCharacterSets*/

function ListCP437()
// Code Page 437 IBM ftp.software.ibm.com/software/globalization/gcoc/attachments/CP00437.pdf
//               Microsoft msdn.microsoft.com/en-us/library/cc195060.aspx?f=255&MSPPError=-2147217396
// Code Page comparisons www.aivosto.com/vbtips/charsets-codepages-dos.html
// NOTE the chess pieces are place holders ♔ ♕
{
  this.set_0 = [`␀`, `☺`, `☻`, `♥`, `♦`, `♣`, `♠`, `•`, `◘`, `○`, `◙`, `♂`, `♀`, `♪`, `♫`, `☼`]
  this.set_1 = [`►`, `◄`, `↕`, `‼`, `¶`, `§`, `▬`, `↨`, `↑`, `↓`, `→`, `←`, `∟`, `↔`, `▲`, `▼`]
  this.set_8 = [`Ç`, `ü`, `é`, `â`, `ä`, `à`, `å`, `ç`, `ê`, `ë`, `è`, `ï`, `î`, `ì`, `Ä`, `Å`]
  this.set_9 = [`É`, `æ`, `Æ`, `ô`, `ö`, `ò`, `û`, `ù`, `ÿ`, `Ö`, `Ü`, `¢`, `£`, `¥`, `₧`, `ƒ`]
  this.set_a = [`á`, `í`, `ó`, `ú`, `ñ`, `Ñ`, `ª`, `º`, `¿`, `⌐`, `¬`, `½`, `¼`, `¡`, `«`, `»`]
  this.set_b = [`░`, `▒`, `▓`, `│`, `┤`, `╡`, `╢`, `♔`, `╕`, `╣`, `║`, `╗`, `╝`, `╜`, `╛`, `┐`]
  this.set_c = [`└`, `┴`, `┬`, `├`, `─`, `┼`, `╞`, `╟`, `╚`, `╔`, `╩`, `╦`, `╠`, `═`, `╬`, `╧`]
  this.set_d = [`╨`, `╤`, `╥`, `╙`, `╘`, `╒`, `╓`, `╫`, `╪`, `┘`, `┌`, `█`, `▄`, `▌`, `▐`, `▀`]
  this.set_e = [`α`, `ß`, `Γ`, `π`, `Σ`, `σ`, `µ`, `τ`, `Φ`, `Θ`, `Ω`, `δ`, `∞`, `\u03C6`, `ε`, `∩`]
  this.set_f = [`≡`, `±`, `≥`, `≤`, `⌠`, `⌡`, `÷`, `≈`, `°`, `\u2219`, `♕`, `√`, `ⁿ`, `²`, `\u25A0`, `\u00A0`]
}

function ListCP1250()
// Code Page 1250 is sometimes used by Chrome 56+ when it encouters CP437 text.
// Originally designed for Central European languages that use Latin script in legacy Microsoft Windows.
// CP-1250 is very similar to CP-1252 and so we can
{
  let i = 0
  this.set_8 = [`€`, ``, `‚`, ``, `„`, `…`, `†`, `‡`, ``, `‰`, `Š`, `‹`, `\u015A`, `\u0164`, `Ž`, `\u0179`]
  this.set_9 = [``, `‘`, `’`, `“`, `”`, `•`, `–`, `—`, ``, `™`, `š`, `›`, `\u015B`, `\u0165`, `ž`, `\u017A`]
  this.set_a = []; this.set_b = []; this.set_c = []; this.set_d = []; this.set_e = []; this.set_f = []
  // dynamically build rows A-F
  while (i < 16) {
    // here we convert 'i' a decimal, to a hex value and use it as Unicode code points.
    this.set_a[i] = String.fromCodePoint(`0x0A${(i).toString(16)}`)
    this.set_b[i] = String.fromCodePoint(`0x0B${(i).toString(16)}`)
    this.set_c[i] = String.fromCodePoint(`0x0C${(i).toString(16)}`)
    this.set_d[i] = String.fromCodePoint(`0x0D${(i).toString(16)}`)
    this.set_e[i] = String.fromCodePoint(`0x0E${(i).toString(16)}`)
    this.set_f[i] = String.fromCodePoint(`0x0F${(i).toString(16)}`)
    i++
  }
  // manual adjustments, see https://en.wikipedia.org/wiki/Windows-1250
  // parseInt(x, 16) converts hex values into decimals that we can use for an array index
  this.set_a[parseInt(`1`, 16)] = `\u02C7`
  this.set_a[parseInt(`2`, 16)] = `\u02D8`
  this.set_a[parseInt(`3`, 16)] = `\u0141`
  this.set_a[parseInt(`5`, 16)] = `\u0104`
  this.set_a[parseInt(`A`, 16)] = `\u015E`
  this.set_a[parseInt(`F`, 16)] = `\u017B`
  this.set_b[parseInt(`2`, 16)] = `\u02DB`
  this.set_b[parseInt(`3`, 16)] = `\u0142`
  this.set_b[parseInt(`9`, 16)] = `\u0105`
  this.set_b[parseInt(`A`, 16)] = `\u015F`
  this.set_b[parseInt(`C`, 16)] = `\u013D`
  this.set_b[parseInt(`D`, 16)] = `\u02DD`
  this.set_b[parseInt(`E`, 16)] = `\u013E`
  this.set_b[parseInt(`F`, 16)] = `\u017C`
  this.set_c[parseInt(`0`, 16)] = `\u0154`
  this.set_c[parseInt(`3`, 16)] = `\u0102`
  this.set_c[parseInt(`5`, 16)] = `\u00C4`
  this.set_c[parseInt(`6`, 16)] = `\u0106`
  this.set_c[parseInt(`8`, 16)] = `\u010C`
  this.set_c[parseInt(`A`, 16)] = `\u0118`
  this.set_c[parseInt(`C`, 16)] = `\u011A`
  this.set_c[parseInt(`F`, 16)] = `\u010E`
  this.set_d[parseInt(`0`, 16)] = `\u0110`
  this.set_d[parseInt(`1`, 16)] = `\u0143`
  this.set_d[parseInt(`2`, 16)] = `\u0147`
  this.set_d[parseInt(`5`, 16)] = `\u0150`
  this.set_d[parseInt(`8`, 16)] = `\u0158`
  this.set_d[parseInt(`9`, 16)] = `\u016E`
  this.set_d[parseInt(`B`, 16)] = `\u0170`
  this.set_d[parseInt(`E`, 16)] = `\u0162`
  this.set_e[parseInt(`0`, 16)] = `\u0155`
  this.set_e[parseInt(`3`, 16)] = `\u0103`
  this.set_e[parseInt(`5`, 16)] = `\u013A`
  this.set_e[parseInt(`6`, 16)] = `\u0107`
  this.set_e[parseInt(`8`, 16)] = `\u010D`
  this.set_e[parseInt(`A`, 16)] = `\u0119`
  this.set_e[parseInt(`C`, 16)] = `\u011B`
  this.set_e[parseInt(`F`, 16)] = `\u010F`
  this.set_f[parseInt(`0`, 16)] = `\u0111`
  this.set_f[parseInt(`1`, 16)] = `\u0144`
  this.set_f[parseInt(`2`, 16)] = `\u0148`
  this.set_f[parseInt(`5`, 16)] = `\u0151`
  this.set_f[parseInt(`8`, 16)] = `\u0159`
  this.set_f[parseInt(`9`, 16)] = `\u016F`
  this.set_f[parseInt(`B`, 16)] = `\u0171`
  this.set_f[parseInt(`E`, 16)] = `\u0163`
  this.set_f[parseInt(`F`, 16)] = `\u02D9`
}

function ListCP1251()
// Code Page 1251 is frequently used by Chrome 56+ when it encouters CP437 text.
// Originally designed for displaying Cyrillic script in legacy Microsoft Windows.
// We can handle character blocks C_0 to F_F using a while loop as all their Unicode values are in a sequential order.
// Below, the characters 8_0 to B_F need this input character map, as their Unicode values are random.
{
  this.set_8 = [`\u0402`, `\u0403`, `\u201a`, `\u0453`, `\u201e`, `\u2026`, `\u2020`, `\u2021`, `\u20ac`, `\u2030`, `\u0409`, `\u2039`, `\u040a`, `\u040c`, `\u040b`, `\u040f`] // Ђ - Џ
  this.set_9 = [`\u0452`, `\u2018`, `\u2019`, `\u201c`, `\u201d`, `\u2022`, `\u2013`, `\u2014`, `\u0000`, `\u2122`, `\u0459`, `\u203a`, `\u045a`, `\u045c`, `\u045b`, `\u045f`] // ђ - џ
  this.set_a = [`\u00a0`, `\u040e`, `\u045e`, `\u0408`, `\u00a4`, `\u0490`, `\u00a6`, `\u00a7`, `\u0401`, `\u00a9`, `\u0404`, `\u00ab`, `\u00ac`, `\u00ad`, `\u00ae`, `\u0407`] // NBSP - Ї
  this.set_b = [`\u00B0`, `\u00B1`, `\u0406`, `\u0456`, `\u0491`, `\u00b5`, `\u00b6`, `\u00b7`, `\u0451`, `\u2116`, `\u0454`, `\u00bb`, `\u0458`, `\u0405`, `\u0455`, `\u0457`] // ° - ї
}

function List8859_5()
// Code Page ISO-8859-5
// It is identical to CP-437 except for 3 character differences
{
  const cp437 = new ListCP437()
  this.set_9 = cp437.set_9
  this.set_a = cp437.set_a
  // we use hex positions and Unicode
  this.set_9[parseInt(`B`, 16)] = `\u00F8`
  this.set_9[parseInt(`D`, 16)] = `\u00D8`
  this.set_a[parseInt(`F`, 16)] = `\u00A4`
}

function BuildCPDos(s = ``, mapTo = `src_CP1252`, verbose = false)
// Converts a string of text to emulate a MS-DOS Code Page using UTF-16 encoded
// characters.
// @s       String of Unicode UTF-16 text
// @mapTo   The character encoding map to use, either src_CP1252, src_8859_5 or out_US_ASCII
// @verbose Display to the console each character that is handled
{
  if (typeof s !== `string`) checkArg(`s`, `string`, s)
  if (typeof s !== `string`) checkArg(`mapTo`, `string`, mapTo)
  if (typeof verbose !== `boolean`) checkArg(`verbose`, `boolean`, verbose)

  const charSets = new ListCharacterSets()
  const c0Controls = charSets.C0common
  const mapCP437 = new ListCP437()
  const mapCP1250 = new ListCP1250()
  const mapCP1251 = new ListCP1251()
  const map8859_5 = new List8859_5()
  const showCtrlCodes = localStorage.getItem(`textDosCtrlCodes`)
  let t = s
  let i = t.length

  // build character maps
  let map0_127, map128_255, map_src
  // map0_127 and map128_255
  switch (mapTo) {
    case `src_CP1250`:
    case `src_CP1251`:
    case `src_CP1252`:
    case `out_US_ASCII`:
      map0_127 = mapCP437.set_0.concat(mapCP437.set_1)
      map128_255 = mapCP437.set_8.concat(mapCP437.set_9, mapCP437.set_a, mapCP437.set_b, mapCP437.set_c, mapCP437.set_d, mapCP437.set_e, mapCP437.set_f)
      break
    case `src_8859_5`:
      map0_127 = mapCP437.set_0.concat(mapCP437.set_1)
      map128_255 = mapCP437.set_8.concat(map8859_5.set_9, map8859_5.set_a, mapCP437.set_b, mapCP437.set_c, mapCP437.set_d, mapCP437.set_e, mapCP437.set_f)
  }
  // map_src
  switch (mapTo) {
    case `src_CP1250`:
      map_src = mapCP1250.set_8.concat(mapCP1250.set_9, mapCP1250.set_a, mapCP1250.set_b, mapCP1250.set_c, mapCP1250.set_d, mapCP1250.set_e, mapCP1250.set_f)
      break
    case `src_CP1251`:
      map_src = mapCP1251.set_8.concat(mapCP1251.set_9, mapCP1251.set_a, mapCP1251.set_b)
  }

  // handle characters 0…128 [00…F1]
  i = map0_127.length
  while (i--) {
    // character 10 is nearly always a line feed (to begin a new line)
    if (i === 10) continue
    // ignore common C0 control characters that are normally used for page formatting
    if (typeof showCtrlCodes !== `string` || showCtrlCodes !== `true`) {
      if (c0Controls.includes(i) === true) {
        if (verbose) console.log(`${i} ${String.fromCharCode(i)} ≠> ${map0_127[i]} `)
        continue
      }
    }
    if (verbose) console.log(`${i} ${String.fromCharCode(i)} => ${map0_127[i]} `)
    t = t.replace(RegExp(String.fromCharCode(i), `g`), map0_127[i])
  }

  // handle characters 129…255 [80…FF]
  let cpa = 128 // character position adjustment
  switch (mapTo) {
    case `src_8859_5`: cpa = 992 // ISO-8859-5
      break
    case `src_CP1251`: cpa = 976 // CP-1251
      break
  }

  i = map128_255.length
  switch (mapTo) {
    case `src_CP1250`:
      mapChars(i)
      i = map_src.length
      while (i--) {
        if (map_src[i] === ``) continue
        t = t.replace(RegExp(map_src[i], `g`), map128_255[i])
      }
      break
    case `src_CP1251`:
      mapChars(i, 64)
      i = map_src.length
      while (i--) {
        t = t.replace(RegExp(map_src[i], `g`), map128_255[i])
      }
      break
    default: mapChars(i)
  }

  // handle character exceptions
  // 127 [7F]
  if (typeof showCtrlCodes === `string` && showCtrlCodes === `true`) {
    t = t.replace(RegExp(String.fromCharCode(127), `g`), `⌂`)
  }
  // replace place holders with the actual characters
  // these otherwise can conflict if both are in the same document
  t = t.replace(RegExp(`♔`, `g`), `╖`) // ╖ CP437 00B7, Unicode 2556
  t = t.replace(RegExp(`♕`, `g`), `\u00B7`) // · CP436 00FA, Unicode 00B7
  // return as object
  this.text = t

  function mapChars(i = 0, e = 0)
  // Parses over a group of sequential Unicode characters and replaces any matches found in
  // text (t), with a corresponding mapped (map128_255) replacement.
  // Ie:  Any matches of Windows-1252 characters within the text are replaced by CP-437 equivalents.
  //      Windows-1252, C_0 == Unicode decimal 192 (/u00C0 `À`) is replaced by CP-437 C_0 /u2514 `└`
  //      Windows-1252, C_1 == Unicode decimal 193 (/u00C1 `Á`) is replaced by CP-437 C_1 /u2534 `┴`
  //      Windows-1252, C_2 == Unicode decimal 194 (/u00C2 `Â`) is replaced by CP-437 C_2 /u252C `┬`
  // https://en.wikipedia.org/wiki/Windows-1252#Character_set
  // https://en.wikipedia.org/wiki/Code_page_437#Character_set
  // @i   number of characters to iterate over
  // @e   while loop count to exit
  {
    while (i--) {
      if (verbose) console.log(`${i} ${String.fromCharCode(i + cpa)} => ${map128_255[i]} `)
      t = t.replace(RegExp(String.fromCharCode(i + cpa), `g`), map128_255[i])
      if (i <= e) break
    }
  }
}

function BuildBBS(s = ``, format = ``, monochrome = false)
// Converts plain text documents embedded with legacy BBS colour codes and
// converts it into a HTML5 document with CSS colour styles
// @s           String of text to convert
// @monochrome  If true this will strip out the BBS colour codes but not
//              apply any replacement CSS colour styles
{
  if (typeof s !== `string`) checkArg(`s`, `string`, s)
  if (typeof format !== `string`) checkArg(`format`, `string`, format)
  if (typeof monochrome !== `boolean`) checkArg(`monochrome`, `boolean`, monochrome)

  let rCodes = ``
  let t = s
  // confirm if text is formatted with either PCBoard or Wildcat colour codes
  if (format.length === 0) {
    format = findControlSequences(s.trim().slice(0, 5))
  }
  switch (format) {
    case `pcboard`:
      rCodes = new RegExp(/@X([0-9|A-F])([0-9|A-F])/ig)
      t = t.replace(RegExp(`@CLS@`, `ig`), ``) // ignored control code used to clear screen
      break
    case `wildcat`:
      rCodes = new RegExp(/@([0-9|A-F])([0-9|A-F])@/ig)
      break
    default:
      console.warn(`The format value '${format}' given to BuildBBS() is not supported`)
      return s
  }

  // Escape any less-than signs that could be mistaken for a HTML tag
  t = t.replace(RegExp(String.fromCharCode(60), `g`), `&lt;`)
  if (monochrome === true) {
    // monochrome only, strip out the BBS colour codes
    t = `${t.replace(rCodes, ``)}</i>`
    return t
  }
  t = t.replace(RegExp(rCodes, `ig`), `</i><i class="PB$1 PF$2">`)
  return `${t}</i>`
}
