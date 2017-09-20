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
// NOTE Unicode code points \u26.. are place holders
{
  this.set_0 = [`␀`, `☺`, `☻`, `♥`, `♦`, `♣`, `♠`, `•`, `◘`, `○`, `◙`, `♂`, `♀`, `♪`, `♫`, `☼`]
  this.set_1 = [`►`, `◄`, `↕`, `‼`, `¶`, `§`, `▬`, `↨`, `↑`, `↓`, `→`, `←`, `∟`, `↔`, `▲`, `▼`]
  this.set_8 = [`Ç`, `ü`, `é`, `â`, `ä`, `à`, `å`, `ç`, `ê`, `ë`, `è`, `ï`, `î`, `ì`, `Ä`, `Å`]
  this.set_9 = [`É`, `æ`, `Æ`, `ô`, `ö`, `ò`, `û`, `ù`, `ÿ`, `Ö`, `Ü`, `¢`, `£`, `¥`, `₧`, `ƒ`]
  this.set_a = [`\u260A`, `í`, `ó`, `ú`, `ñ`, `Ñ`, `ª`, `º`, `¿`, `⌐`, `¬`, `½`, `¼`, `\u26DA`, `\u26DB`, `»`]
  this.set_b = [`░`, `▒`, `▓`, `│`, `┤`, `╡`, `╢`, `\u267B`, `╕`, `╣`, `║`, `╗`, `╝`, `╜`, `╛`, `┐`]
  this.set_c = [`└`, `┴`, `┬`, `├`, `─`, `┼`, `╞`, `╟`, `╚`, `╔`, `╩`, `╦`, `╠`, `═`, `╬`, `╧`]
  this.set_d = [`╨`, `╤`, `╥`, `╙`, `╘`, `╒`, `╓`, `╫`, `╪`, `┘`, `┌`, `█`, `▄`, `▌`, `▐`, `▀`]
  this.set_e = [`α`, `\u261E`, `Γ`, `π`, `Σ`, `σ`, `\u266E`, `τ`, `Φ`, `Θ`, `Ω`, `δ`, `∞`, `\u03C6`, `ε`, `∩`]
  this.set_f = [`≡`, `\u1F031`, `≥`, `≤`, `⌠`, `⌡`, `÷`, `≈`, `\u1F030`, `\u2219`, `\u26AF`, `√`, `ⁿ`, `\u1F032`, `\u25A0`, `\u26FF`]
}

function ListCP1250()
// Code Page 1250 is sometimes used by Chrome 56+ when it encouters CP437 text.
// Originally designed for Central European languages that use Latin script in legacy Microsoft Windows.
// CP-1250 is very similar to CP-1252 and so we can
{
  this.set_8 = [`€`, ``, `‚`, ``, `„`, `…`, `†`, `‡`, ``, `‰`, `Š`, `‹`, `\u015A`, `\u0164`, `Ž`, `\u0179`]
  this.set_9 = [``, `‘`, `’`, `“`, `”`, `•`, `–`, `—`, ``, `™`, `š`, `›`, `\u015B`, `\u0165`, `ž`, `\u017A`]
  this.set_a = []; this.set_b = []; this.set_c = []; this.set_d = []; this.set_e = []; this.set_f = []
  // dynamically build rows A-F
  let i = 0
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
  // build character maps
  let map0_127, map128_255, map_src
  // map0_127 and map128_255
  switch (mapTo) {
    case `out_CP437`:
    case `out_US_ASCII`:
    case `src_CP1250`:
    case `src_CP1251`:
    case `src_CP1252`:
      map0_127 = [...mapCP437.set_0, ...mapCP437.set_1]
      map128_255 = mapCP437.set_8.concat(mapCP437.set_9, mapCP437.set_a, mapCP437.set_b, mapCP437.set_c, mapCP437.set_d, mapCP437.set_e, mapCP437.set_f)
      break
    case `src_8859_5`:
      map0_127 = [...mapCP437.set_0, ...mapCP437.set_1]
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
  let i = map0_127.length
  while (i--) {
    // JS treats both characters 10 (CR), 13 (LF) as newlines regardless of placement or order
    if (i === 10 || i === 13) continue
    // ignore common C0 control characters that are normally used for page formatting
    if (typeof showCtrlCodes !== `string` || showCtrlCodes !== `true`) {
      if (c0Controls.includes(i) === true) {
        if (verbose) console.log(`${i} ${String.fromCharCode(i)} ≠> ${map0_127[i]} `)
        continue
      }
    }
    if (verbose) console.log(`${i} ${String.fromCharCode(i)} => ${map0_127[i]} `)
    s = s.replace(RegExp(String.fromCharCode(i), `g`), map0_127[i])
  }

  // handle characters 129…255 [80…FF]
  i = map128_255.length
  switch (mapTo) {
    case `src_CP1250`:
      mapChars(i, 0, mapTo)
      i = map_src.length
      while (i--) {
        if (map_src[i] === ``) continue
        s = s.replace(RegExp(map_src[i], `g`), map128_255[i])
      }
      break
    case `src_CP1251`:
      mapChars(i, 64, mapTo)
      i = map_src.length
      while (i--) {
        s = s.replace(RegExp(map_src[i], `g`), map128_255[i])
      }
      break
    default: mapChars(i, 0, mapTo)
  }

  // handle character exceptions
  // JavaScript or UTF-16 automatically parses the following code points
  /*
  /u0000 -> �
  /u0010 -> /n
  /u0013 -> /n
  /u0026 -> &amp;
  /u003C -> &lt;
  /u003E -> &gt;
  */

  // 127 [7F]
  if (typeof showCtrlCodes === `string` && showCtrlCodes === `true`) {
    s = s.replace(RegExp(String.fromCharCode(127), `g`), `⌂`)
  } else {
    // Some implementations of SAUCE include a start string of
    // \u001A\u0000\u0000\u0000 aka ␚␀␀␀

    // Remove ␚␀␀␀ values as they trigger ANSI escape sequence false positives
    s = s.replace(RegExp(`(\u001A\uFFFD\uFFFD\uFFFD)`, `g`), ``)

    // Browsers often convert ␀ to �, this replaces String.fromCharCode(65533) `�` with a space ` `
    s = s.replace(RegExp(`\uFFFD`, `g`), ` `)
    //console.log(s.substr(-5, 5).charCodeAt(1)) // use this to determine unknown characters
  }
  // replace place holders with the intended characters
  // otherwise these conflict together if in the same document
  s = s.replace(RegExp(`\u267B`, `g`), `╖`) // ╖ CP437 00B7, Unicode 2556
  s = s.replace(RegExp(`\u26AF`, `g`), `\u00B7`) // · CP436 00FA, Unicode 00B7

  s = s.replace(RegExp(`\u26DA`, `g`), `\u00A1`) // -> ¡
  s = s.replace(RegExp(`\u26DB`, `g`), `\u00AB`) // -> «
  s = s.replace(RegExp(`\u261E`, `g`), `\u00DF`) // -> ß
  s = s.replace(RegExp(`\u266E`, `g`), `\u00B5`) // -> µ

  s = s.replace(RegExp(`\u1F030`, `g`), `\u00B0`) // -> °
  s = s.replace(RegExp(`\u1F031`, `g`), `\u00B1`) // -> ±
  s = s.replace(RegExp(`\u1F032`, `g`), `\u00B2`) // -> ²


  s = s.replace(RegExp(`\u26FF`, `g`), `&nbsp;`) // -> XXX

  // Manual CP1252 replacements
  s = s.replace(RegExp(`&nbsp;`, `g`), `\u00E1`) // -> á
  s = s.replace(RegExp(`\u00FF`, `g`), `&nbsp;`) // ÿ ->

  s = s.replace(RegExp(`\u20AC`, `g`), `\u00C7`) // -> Ç
  s = s.replace(RegExp(`\u201A`, `g`), `\u00E9`) // -> é
  s = s.replace(RegExp(`\u0192`, `g`), `\u00E2`) // -> â
  s = s.replace(RegExp(`\u201E`, `g`), `\u00E4`) // -> ä
  s = s.replace(RegExp(`\u2026`, `g`), `\u00E0`) // -> à
  s = s.replace(RegExp(`\u2020`, `g`), `\u00E5`) // -> å
  s = s.replace(RegExp(`\u2021`, `g`), `\u00E7`) // -> ç
  s = s.replace(RegExp(`\u02C6`, `g`), `\u00EA`) // -> ê
  s = s.replace(RegExp(`\u2030`, `g`), `\u00EB`) // -> ë
  s = s.replace(RegExp(`\u0160`, `g`), `\u00E8`) // -> è
  s = s.replace(RegExp(`\u2039`, `g`), `\u00EF`) // -> ï
  s = s.replace(RegExp(`\u0152`, `g`), `\u00EE`) // -> î
  s = s.replace(RegExp(`\u017D`, `g`), `\u00C4`) // -> Ä

  s = s.replace(RegExp(`\u2018`, `g`), `\u00E6`) // -> É
  s = s.replace(RegExp(`\u2019`, `g`), `\u00C6`) // -> æ
  s = s.replace(RegExp(`\u201C`, `g`), `\u00F4`) // -> Æ
  s = s.replace(RegExp(`\u201D`, `g`), `\u00F6`) // -> ô
  s = s.replace(RegExp(`\u2022`, `g`), `\u00F2`) // -> ö
  s = s.replace(RegExp(`\u2013`, `g`), `\u00FB`) // -> ò
  s = s.replace(RegExp(`\u2014`, `g`), `\u00F9`) // -> û
  s = s.replace(RegExp(`\u02DC`, `g`), `\u00FF`) // -> ÿ
  s = s.replace(RegExp(`\u2122`, `g`), `\u00D6`) // -> Ö
  s = s.replace(RegExp(`\u0161`, `g`), `\u00DC`) // -> Ü
  s = s.replace(RegExp(`\u203A`, `g`), `\u00A2`) // -> ¢
  s = s.replace(RegExp(`\u0153`, `g`), `\u00A3`) // -> ¢
  s = s.replace(RegExp(`\u017E`, `g`), `\u20A7`) // -> ₧
  s = s.replace(RegExp(`\u0178`, `g`), `\u0192`) // -> ƒ

  // return as object
  this.text = s

  function mapChars(i = 0, e = 0, mapTo)
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
    function cpa(mapTo)
    // character position adjustment
    {
      switch (mapTo) {
        case `src_8859_5`: return 992 // ISO-8859-5
        case `src_CP1251`: return 976 // CP-1251
        default: return 128
      }
    }
    while (i--) {
      if (verbose) console.log(`${i} ${String.fromCharCode(i + cpa(mapTo))} => ${map128_255[i]} `)
      s = s.replace(RegExp(String.fromCharCode(i + cpa(mapTo)), `g`), map128_255[i])
      //      if (i <= 33) break
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

  function elms(s) {
    function chk(p)
    // validate @X values
    // see NaN issues, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/isNaN
    {
      if (p === ` `) return false
      const h = parseInt(p, 16) // convert from hexadecimal to decimal
      if (isNaN(h) || h < 0 || h > 16) return false
      return true
    }

    const rgt = new RegExp(`&gt;`, `gi`)
    const rlt = new RegExp(`&lt;`, `gi`)
    const ramp = new RegExp(`&amp;`, `gi`)
    const pre = document.createElement(`pre`)
    // replace escaped chars because we're using <pre>
    s = s.replace(rgt, `>`)
    s = s.replace(rlt, `<`)
    s = s.replace(ramp, `&`)
    // drop other @ codes
    if (s.trim().substr(0, 5) === `@CLS@`) s = s.trim().substr(5) // trim in needed for \n@CLS@ etc.
    // split @X codes
    const split = s.split(`@X`)
    for (const c of split) {
      if (c.length === 0) continue
      // check values to match expected @X
      // otherwise .. treat as text
      const pb = `${c.substring(0, 1)}`
      const pf = `${c.substring(1, 2)}`
      let appendStr = c.substring(2)
      if (!chk(pf) || !chk(pb)) {
        // handle false-positive @X codes
        appendStr = `@X${c}`
        const x = pre.lastChild
        if (x !== null) {
          x.textContent = `${x.textContent}${appendStr}` // inject text into the previous <i> node
          continue
        }
        // if childNodes = 0, then use the code below to create a new element
      }
      const x = document.createElement(`i`)
      x.classList.add(`PB${pb}`)
      x.classList.add(`PF${pf}`)
      x.textContent = appendStr
      pre.appendChild(x)
    }
    return pre
  }

  // confirm if text is formatted with either PCBoard or Wildcat colour codes
  if (format.length === 0) {
    format = findControlSequences(s.trim().slice(0, 5))
  }
  const wcExp = new RegExp(/@([0-9|A-F])([0-9|A-F])@/ig)
  switch (format) {
    case `pcboard`:
      // ignore control code used to clear screen
      s = s.replace(RegExp(`@CLS @`, `ig`), ``)
      return elms(s)
    case `wildcat`:
      s = s.replace(RegExp(wcExp, `ig`), `@X$1$2`) // convert Wildcat to PCB as it's easier to split
      return elms(s)
    default:
      console.warn(`The format value '${format}' given to BuildBBS() is not supported`)
      return s
  }
}
