// filename: retrotxt.js
//
// These functions are used to apply and remove RetroTxt from browser tabs.
'use strict'

/*
global BuildBBS BuildCP1252 BuildCPDos BuildCP88591 BuildCP885915 BuildCPUtf8 BuildCPUtf16
HumaniseCP BuildEcma48 BuildFontStyles ListCharacterSets ListDefaults ListRGBThemes ParseToChildren
buildLinksToCSS checkArg checkErr changeTextScanlines changeTextEffect handleFontName
chrome findControlSequences displayErr runSpinLoader humaniseFS findEngine handleFontSauce
*/

function BuildCharSet(s = ``)
// Using pattern matching attempts to guess at the MS-DOS era code page used
// by the supplied UTF-16 encoded text
// @s       String of Unicode UTF-16 text
{
  if (typeof s !== `string`) checkArg(`s`, `string`, s)

  const limit = 10000
  const cp1252Set = new BuildCP1252().characterSet
  const cp1252Decimals = buildDecimalSet(cp1252Set)
  const charInfo = new ListCharacterSets()
  const c0Controls = charInfo.C0common
  const sets = charInfo.sets
  const sLen = s.length
  const finds = { char: ``, cp: 0, cp437: 0, hex: ``, iso8859: 0, page: 0, position: 0, usAscii: 0, unsure: 0 }

  let i = s.length
  while (i--) {
    if (i < sLen - limit) break
    finds.position = sLen - i
    finds.char = s[finds.position]
    finds.cp = s.codePointAt(finds.position)
    if (finds.cp !== undefined) finds.hex = finds.cp.toString(16) // not used
    // Unsupported Unicode code point?
    if (finds.cp >= 65535) finds.page = 7
    // distinctive CP-1252 chars 128,142,158,159,130…140,145…156
    // these also double-up as C1 controls in UTF-8
    else if (cp1252Decimals.includes(finds.cp)) finds.page = 3
    // hack to deal with characters decimals 993…1248 found in some ANSI art
    else if (finds.cp > 992 && finds.cp < 1249) finds.page = 2
    // UTF-8 catch-all
    else if (finds.cp > 255) finds.page = 6
    // count the guesses of other characters
    else {
      // potential block and line characters found in ANSI/ASCII art
      // if (finds.cp >= 176 && finds.cp <= 223 || [254, 249, 250].includes(finds.cp)) finds.cp437++; // broader catch
      if (finds.cp >= 176 && finds.cp <= 181 || finds.cp >= 185 && finds.cp <= 188 || finds.cp >= 190 && finds.cp <= 197 || finds.cp >= 200 && finds.cp <= 206 || finds.cp >= 217 && finds.cp <= 223 || [254, 249, 250].includes(finds.cp)) finds.cp437++ // only catches single and double lines but not single/double combination characters
      // other than common C0 controls like newline if characters 1…31 are found
      // then assume it is a CP-437 document
      else if (finds.cp !== 10 && finds.cp !== 27 && finds.cp > 0 && finds.cp < 32 && c0Controls.includes(finds.cp) === false) finds.cp437++
      // if the character is between these ranges that was not caught by CP-437 then it's assumed ISO-8859-1 or 15
      else if (finds.cp >= 160 && finds.cp <= 255) finds.iso8859++
      // anything else below 128 is certainly US-ASCII
      else if (finds.cp <= 127) finds.usAscii++
      // otherwise, not sure
      else finds.unsure++
    }
    if (finds.page > 0) break // exit scan after the encoding has been guessed
  }
  // console.log(`guessCodePage() counts: finds.iso8859 ${finds.iso8859} finds.cp437 ${finds.cp437} finds.usAscii ${finds.usAscii}, total characters ${t.length}`);
  if (finds.iso8859 > 0) finds.page = 4
  if (finds.cp437 > finds.iso8859) finds.page = 1

  this.guess = sets[finds.page]
  this.setPage = finds.page
  this.countCP437 = finds.cp437
  this.countIso8859 = finds.iso8859
  this.countUnknown = finds.unsure
  this.countUsAscii = finds.usAscii
}

function FindDOM()
// Document Object Model (DOM) programming interface for HTML
{
  this.body = document.body
  this.cssLink = document.getElementById(`retrotxt-styles`)
  this.head = document.querySelector(`head`)
  this.headers = document.getElementsByTagName(`header`)
  this.main = document.querySelector(`main`)
  this.pre0 = document.getElementsByTagName(`pre`)[0]
  this.pre1 = document.getElementsByTagName(`pre`)[1]
  this.preCount = document.getElementsByTagName(`pre`).length
}

function FindSauce00(t = ``)
// Extracts SAUCE record metadata attached to a text document
// http://www.acid.org/info/sauce/sauce.htm
// @t   A slice of text containing the SAUCE metadata
{
  if (typeof t !== `string`) checkArg(`t`, `string`, t)

  // file:///C:/Users/Ben/Desktop/ansilove.js/example/index.html
  // https://github.com/ansilove/ansilove.js/blob/7658a48f5febc73e89b2d110d0cc34800a9e7c54/ansilove.js

  this.id = t.slice(0, 7)
  this.version = ``
  this.title = ``
  this.author = ``
  this.group = ``
  this.date = ``
  this.fileSize = ``
  this.dataType = ``
  this.fileType = ``
  this.TInfo1 = ``
  this.TInfo2 = ``
  this.TInfo3 = ``
  this.TInfo4 = ``
  this.comments = ``
  this.TFlags = ``
  this.TInfoS = ``
  if (this.id === `SAUCE00`) {
    // string values
    this.version = t.slice(5, 7) // 2 bytes
    this.title = t.slice(7, 42).trim() // 35 bytes
    this.author = t.slice(42, 62).trim() // 20 bytes
    this.group = t.slice(62, 82).trim() // 20 bytes
    this.date = t.slice(82, 90).trim() // 8 bytes
    this.TInfoS = t.slice(106, 128) // 22 bytes
    this.cType = t.slice(90, 106) // 16 bytes
    // binary values (NOTE: these values are not always accurate due to files being loaded as text)
    this.fileSize = t.slice(90, 94)
    this.dataType = t.slice(94, 95)
    this.fileType = t.slice(95, 96)
    this.TInfo1 = t.slice(96, 98)
    this.TInfo2 = t.slice(98, 100)
    this.TInfo3 = t.slice(100, 102)
    this.TInfo4 = t.slice(102, 104)
    this.comments = t.slice(104, 105)
    this.TFlags = t.slice(105, 106)
  }
}

function buildDecimalSet(set = [])
// Converts an array of character strings into an array of Unicode decimal values
{
  if (typeof set !== `object`) checkArg(`set`, `array`, set)

  const decimals = set
  for (const d in set) {
    decimals[d] = set[d].codePointAt(0)
  }
  return decimals.filter(decimals => typeof decimals !== `undefined`) // filter out undefined decimals values
}

async function buildStyles(dom = new FindDOM())
// Constructs the Document Object Model (DOM) needed to display RetroTxt
// @dom A DOM Object that will be modified
{
  if (typeof dom !== `object`) checkArg(`dom`, `object`, dom)

  function html() {
    if (typeof dom.pre1 === `undefined`) return dom.pre0.innerHTML
    dom.pre1.innerHTML
  }

  // Build link tags
  const theme = new ListRGBThemes()
  // make a <link> to point to the CSS for use with 1-bit colour themes (ASCII, NFO)
  dom.head.appendChild(buildLinksToCSS(`css/retrotxt.css`, `retrotxt-styles`)) // child 0
  // make a <link> to point to the CSS for use with 1-bit colour themes (ASCII, NFO)
  dom.head.appendChild(buildLinksToCSS(`css/text_colors.css`, `retrotxt-theme`)) // child 1
  // load any CSS that are used to mimic colours by the text file
  const format = findControlSequences(html())
  // make <link> tags to point to CSS files for use with 4-bit colour text
  switch (format) {
    case `ecma48`:
      dom.head.appendChild(buildLinksToCSS(`css/text_colors_${theme.colors[theme.color]}.css`, `retrotxt-4bit`)) // child 2
      dom.head.appendChild(buildLinksToCSS(`css/text_colors_8bit.css`, `retrotxt-8bit`)) // child 3
      dom.head.appendChild(buildLinksToCSS(`css/text_ecma_48.css`, `ecma-48`)) // child 4
      break
    case `pcboard`:
    case `wildcat`:
      dom.head.appendChild(buildLinksToCSS(`css/text_colors_pcboard.css`, `retrotxt-4bit`)) // child 2
      break
    default:
  }
  // disable links
  let i = dom.head.children.length
  while (i--) {
    dom.head.children[i].disabled = false
  }
}

async function changeColors(colorName = ``, dom = new FindDOM())
// Applies background colour to the DOM <body> and colour to the <PRE> tag containing
// the stylised text document.
// @colorName   Colour name
// @dom         A HTML DOM Object that will be modified
{
  if (typeof colorName !== `string`) checkArg(`colorName`, `string`, colorName)
  if (typeof dom !== `object`) checkArg(`dom`, `object`, dom)

  function filter() {
    if (engine !== `blink`) return `invert(100%)`
    else { // work around for Chrome
      switch (color) {
        case `theme-windows`:
        case `theme-atarist`: return `invert(0%)`
        default:
          if (color.includes(`-on-white`)) return `invert(0%)`
          return `invert(100%)`
      }
    }
  }

  function theme() {
    if (colorName.startsWith(`theme-`) === false) return `theme-${color}`
    return colorName
  }

  const engine = findEngine()
  try {
    dom.body.className = ``
    dom.main.className = ``
  } catch (err) { /* Some Firefox/Gecko versions throw a security error when handling file:/// */ }
  // refresh scan lines and font shadows as they are effected by colour changes
  chrome.storage.local.get([`textBgScanlines`, `textEffect`], function (r) {
    if (r.textBgScanlines === undefined) checkErr(`Could not obtain the required textBgScanlines setting to apply the scanlines effect`, true)
    if (r.textEffect === undefined) checkErr(`Could not obtain the required textEffect setting to apply text effects`, true)
    const tsl = r.textBgScanlines
    const tfs = r.textEffect
    // scan lines on the page body
    if (typeof tsl === `boolean` && tsl === true) changeTextScanlines(true, dom.body)
    // font shadowing applied to text in the page main tag
    if (typeof tfs === `string` && tfs === `shadowed`) changeTextEffect(`shadowed`, dom.main)
  })
  // apply new colours
  const color = theme()
  if (dom.body.classList !== null) dom.body.classList.add(`${color}-bg`)
  else return // error
  if (dom.main.classList !== null) dom.main.classList.add(`${color}-fg`)
  else return // error
  // invert headers
  // white backgrounds need to be handled separately
  for (let h of dom.headers) {
    // deal with varying browser support (http://caniuse.com/#feat=css-filters)
    if (h === null) continue
    if (h.style.filter !== undefined) { // Modern browsers
      h.style.filter = filter()
    } else if (h.style.webkitFilter !== undefined) { // Chrome <=57
      h.style.webkitFilter = filter()
    }
  }
}

async function changeFont(ff = ``, dom = new FindDOM())
// Applies the font family to the <PRE> tag containing the stylised text document.
// @ff  Font family to apply
// @dom A HTML DOM Object that will be modified
{
  if (typeof ff !== `string`) checkArg(`ff`, `string`, ff)
  if (typeof dom !== `object`) checkArg(`dom`, `object`, dom)

  // Ignore changeFont request if sessionStorage fontOverride is true
  const fO = sessionStorage.getItem(`fontOverride`, `true`)
  if (typeof fO === `string` && fO === `true`) return
  // Change the font
  const element = dom
  if (element.className === null) return // error
  if (element.classList === null) return // error
  const classAsArray = element.className.split(` `)
  const font = new BuildFontStyles(ff)
  console.info(`Using font ${font.string}.`)
  // loop through and remove any font-* classes
  let i = classAsArray.length
  while (i--) {
    if (classAsArray[i].startsWith(`font-`)) element.classList.remove(classAsArray[i])
  }
  // inject replacement font
  element.classList.add(`font-${ff}`)
  // Update the header with new font information
  const headerItem = window.document.getElementById(`h-doc-font-family`)
  if (headerItem !== null) headerItem.textContent = handleFontName(ff)
}

async function changeHeader(show = true, dom = new FindDOM())
// Toggles between the information header and the hidden header.
// @show  Display the information header
// @dom A HTML DOM Object that will be modified
{
  if (typeof show !== `boolean`) checkArg(`show`, `boolean`, show)
  if (typeof dom !== `object`) checkArg(`dom`, `object`, dom)
  const h = dom.headers
  if (typeof h[0] === `object`) {
    switch (show) {
      case false:
        h[0].style.display = `none` // header-show
        h[1].style.display = `block` // header-hide
        break
      case true:
        h[0].style.display = `block`
        h[1].style.display = `none`
        break
    }
  }
  return
}

async function changeLineHeight(lh = `normal`, dom = new FindDOM())
// Applies line height modifications to the DOM <PRE> tag containing the stylised
// text document.
// @lh  Number that will be multiplied with the font size to set the line height
// @dom A HTML DOM Object that will be modified
{
  if (typeof lh !== `string`) checkArg(`lh`, `string`, lh)
  if (typeof dom !== `object`) checkArg(`dom`, `object`, dom)

  dom.pre0.style.lineHeight = lh
}

function charSetFind(c = ``, sauce = {}, dom = {})
// Return the source text character set
// @c   Code page cases used by the context menus
// @dom A HTML DOM Object that will be modified
{
  if (typeof c !== `string` && c !== null) checkArg(`c`, `string`, c)
  if (typeof dom !== `object`) checkArg(`dom`, `object`, dom)

  if (sauce.version === `00`) {
    const cfn = sauce.config.fontName.replace(/[^A-Za-z0-9 ]/g, ``) // clean-up malformed data
    const fn = cfn.split(` `)
    switch (fn[0]) {
      case `Amiga`: return `out_8859_1`
      case `Atari`: return `src_CP1252`
      case `IBM`: {
        // Chrome/Blink special case when it confuses CP437 ANSI as ISO-8859-5
        if (findEngine() === `blink` && document.characterSet === `ISO-8859-5`) return `src_8859_5`
        // standard cases
        switch (fn[2]) {
          case `819`: return `out_8859_1` // Latin-1 Supplemental. Also known as ‘Windows-28591’ and ‘ISO/IEC 8859-1’
          default: return `out_CP437`
        }
      }
    }
  }
  switch (c) { // user overrides
    case `codeMsDos0`: return `src_CP1252`
    case `codeMsDos1`: return `src_8859_5`
    case `codeWindows`: return `out_CP1252`
    case `codeLatin9`: return `out_8859_15`
    case `codeNone`: return `out_US_ASCII`
    default: { // force returns based on browser tab character set
      //console.log(`document.characterSet ${document.characterSet.toUpperCase()}`)
      switch (document.characterSet.toUpperCase()) {
        case `ISO-8859-5`: return `src_8859_5`
        case `WINDOWS-1250`: return `src_CP1250`
        case `WINDOWS-1251`: return `src_CP1251`
        case `WINDOWS-1252`:
        case `UTF-8`: return `src_CP1252`
        default:  // unknown/unsupported encodings, we so guess but the output is most-likely to be incorrect
          return new BuildCharSet(dom.slice).guess
      }
    }
  }
}

function charSetRebuild(c = ``, dom = {})
// rebuild text with new character encoding
// @c   Code page case names
// @dom A HTML DOM Object that will be modified
{
  if (typeof c !== `string`) checkArg(`c`, `string`, c)
  if (typeof dom !== `object`) checkArg(`dom`, `object`, dom)

  switch (c) {
    case `out_CP437`:
    case `src_CP1250`:
    case `src_CP1251`:
    case `src_CP1252`:
    case `src_8859_5`: return new BuildCPDos(dom.slice, c).text
    case `out_CP1252`: return new BuildCP1252(dom.slice).text
    case `out_8859_1`: return new BuildCP88591(dom.slice).text
    case `out_8859_15`: return new BuildCP885915(dom.slice).text
    case `out_UTF8`: return new BuildCPUtf8(dom.slice).text
    case `out_US_ASCII`: return new BuildCPUtf16(dom.slice).text
    default:
      checkErr(`'${c}' is not a valid charSetRebuild() identifier`, true)
  }
}

function findSAUCE(src = { text: ``, length: 0 })
// Looks for and parses a SAUCE (metadata) record from the text
// more information, http://www.acid.org/info/sauce/sauce.htm
{
  if (typeof src !== `object`) checkArg(`text`, `object`, src)
  if (typeof src.text !== `string`) checkArg(`text.original`, `string`, src.original)
  if (typeof src.length !== `number`) checkArg(`length`, `number`, src.length)

  // To reduce the memory footprint when handling large text files, we pass an object to `text`
  // pointing to the original text instead of duplicating the text using a (primitive) string.

  // scan the last 500 characters of the text for a SAUCE identifier
  const search = src.text.slice(src.length - 500, src.length)
  const start = search.indexOf(`SAUCE00`) - 500
  const comntStart = search.lastIndexOf(`COMNT`)
  // data containers
  const texts = { sauce: src.text.slice(start, src.length) }
  const configs = { flags: `00000000`, iceColors: `0`, letterSpacing: `00`, aspectRatio: `00`, fontName: ``, length: 0, width: 0 }
  const dates = { ccyymmdd: `00000000`, year: 0, month: 0, day: 0 }
  const positions = {
    length: src.length,
    sauceIndex: src.length + start,
    comntIndex: src.length - comntStart,
  }
  // binary zero is represented as unicode code point 65533 (�), named as 'replacement character'
  const rBin0 = new RegExp(String.fromCharCode(65533), `g`) // a pattern to find all binary zeros
  // parse the 500 characters for a SAUCE record
  const data = new FindSauce00(texts.sauce)
  const results = {
    version: data.version,
    title: data.title,
    author: data.author,
    group: data.group,
    date: dates,
    comment: ``,
    config: configs,
    position: positions,
  }
  // when no SAUCE identifier is found
  if (data.id !== `SAUCE00`) {
    positions.length = 0
    positions.sauceIndex = 0
    positions.comntIndex = 0
    return results
  }
  // handle the date
  dates.ccyymmdd = data.date
  dates.year = parseInt(data.date.slice(0, 4))
  dates.month = parseInt(data.date.slice(4, 6))
  dates.day = parseInt(data.date.slice(6, 8))
  // handle ANSiFlags
  // see http://www.acid.org/info/sauce/sauce.htm#ANSiFlags
  configs.flags = data.TFlags.charCodeAt(0).toString(2) // get binary representation of character
  const len = configs.flags.length
  if (len < 8) { // pad with leading 0s to make an 8-bit binary string
    configs.flags = `0`.repeat(8 - len) + configs.flags
  }
  configs.iceColors = configs.flags.slice(-1)
  configs.letterSpacing = configs.flags.slice(-3, -1)
  configs.aspectRatio = configs.flags.slice(-5, -3)
  // handle font name
  configs.fontName = data.TInfoS.replace(rBin0, ``)
  // document length (ignored) & width
  if (typeof TextEncoder === `function`) {
    // see http://ourcodeworld.com/articles/read/164/how-to-convert-an-uint8array-to-string-in-javascript
    const uea = new TextEncoder(`ascii`).encode(data.TInfo1.replace(rBin0, ``)[0])
    configs.width = parseInt(uea, 10)
  }
  // comments
  if (comntStart > -1 && (comntStart - start) < (255 * 64)) {
    results.comment = search.slice(comntStart + `COMNT`.length, start)
  }
  return results
}

function formatSAUCE(s = {})
// Humanises and converts the SAUCE record into HTML
{
  if (typeof s !== `object`) checkArg(`s`, `object`, s)

  const now = new Date()
  const d = {
    months: [`January`, `February`, `March`, `April`, `May`, `June`, `July`, `August`, `September`, `October`, `November`, `December`],
    curYear: now.getFullYear(),
    year: s.date.year,
    month: s.date.month,
    day: s.date.day,
    string: ``,
    joiner: `by `,
  }
  let str = ``
  // parse data
  if (s.version !== `00`) return ``
  if (s.title.trim() !== ``) str = `${str} '${s.title}' `
  if (s.author.trim() !== ``) {
    str = `${str} by '${s.author}' `
    d.joiner = `of `
  }
  if (s.group.trim() !== ``) str = `${str} ${d.joiner} ${s.group} `
  if (s.date.ccyymmdd.trim() !== ``) {
    if (d.year > 1980 && d.year <= d.curYear) {
      if (d.day > 0 && d.day <= 31 && d.month > 0 && d.month <= 12) {
        d.string = ` ${d.months[d.month - 1]} ${d.day} `
      }
      if (str.length > 0) str = `${str} dated ${d.year} ${d.string} `
      else str = `Dated ${d.year} ${d.string} `
    }
  }
  // create elements
  const div = document.createElement(`div`)
  const sauce = document.createElement(`span`)
  sauce.id = `SAUCE00-metadata`
  sauce.textContent = str.trim()
  const commt = document.createElement(`span`)
  commt.id = `SAUCE00-comment`
  const em = document.createElement(`em`)
  em.textContent = s.comment.trim()
  commt.appendChild(em)
  if (str.length <= 0) return null
  div.appendChild(sauce)
  if (s.comment.trim() !== ``) {
    commt.style = `display:block;`
    div.appendChild(commt)
  }
  return div
}

function findUnicode(s = ``)
// Look for any Unicode Byte Order Marks (identifiers) prefixing the string, though
// this is not reliable as the browser can strip them out.
// Using Byte Order Marks https://msdn.microsoft.com/en-us/library/windows/desktop/dd374101%28v=vs.85%29.aspx?f=255&MSPPError=-2147217396
// @s String of text
{
  if (typeof s !== `string`) checkArg(`s`, `string`, s)

  // get the first 4 characters of the string and convert them into hexadecimal values
  const mark = s.slice(0, 4),
    chr1 = mark.charCodeAt(0).toString(16).toLowerCase(),
    chr2 = mark.charCodeAt(1).toString(16).toLowerCase(),
    chr3 = mark.charCodeAt(2).toString(16).toLowerCase(),
    chr4 = mark.charCodeAt(3).toString(16).toLowerCase()
  if (chr1 === `ef` && chr2 === `bb` && chr3 === `bf`) return `UTF-8`
  else if (chr1 === `ff` && chr2 === `fe`) return `UTF-16, little endian`
  else if (chr1 === `fe` && chr2 === `ff`) return `UTF-16, big endian`
  else if (chr1 === `ff` && chr2 === `fe` && chr3 === `00` && chr4 === `00`) return `UTF-32, little endian`
  else if (chr1 === `00` && chr2 === `00` && chr3 === `fe` && chr4 === `ff`) return `UTF-32, little endian`
  return ``
}

function handleChanges(change)
// This is triggered by an event handler when changes are made to the
// chrome.storage, such as a different selection in the Options menu
// @change An object to parse that is created by chrome.storage.onChanged
{
  if (typeof change !== `object`) checkArg(`change`, `array`, change)
  const changes = {
    alignment: change.textCenterAlignment,
    color: change.retroColor,
    effect: change.textEffect,
    font: change.retroFont,
    info: change.textFontInformation,
    lineHeight: change.lineHeight,
    scanlines: change.textBgScanlines,
    dosCtrls: change.textDosCtrlCodes,
    iceColors: change.textAnsiIceColors,
  }
  const dom = new FindDOM()

  // handle objects that only need to set local storage
  if (changes.iceColors) {
    localStorage.setItem(`textAnsiIceColors`, changes.iceColors.newValue)
  }
  if (changes.dosCtrls) {
    localStorage.setItem(`textDosCtrlCodes`, changes.dosCtrls.newValue)
  }
  // font
  if (changes.font) {
    changeFont(changes.font.newValue, dom.pre0)
    chrome.storage.local.get(`lineHeight`, r => {
      if (r.lineHeight === undefined) checkErr(`Could not obtain the required lineHeight setting to adjust the layout`, true)
      else { changeLineHeight(r.lineHeight, dom) }
    })
    return
  }
  // colors
  if (changes.color) {
    const c = changes.color.newValue
    changeColors(c, dom)
    // update font shadow and scan lines
    chrome.storage.local.get([`textBgScanlines`, `textEffect`], r => {
      const body = document.body
      const main = document.getElementsByTagName(`main`)[0]
      // need to update scan lines if background colour changes
      if (typeof r.textBgScanlines !== `boolean`) checkErr(`Could not obtain the required textBgScanlines setting to handle changes`, true)
      else if (r.textBgScanlines === true && typeof body === `object`) { changeTextScanlines(true, body, c) }
      // need to update text effect colours
      if (typeof r.textEffect !== `string`) checkErr(`Could not obtain the required textEffect setting to handle changes`, true)
      else if (typeof main === `object`) { changeTextEffect(r.textEffect, main, c) }
    })
    return
  }
  // text effect
  if (changes.effect && typeof dom.main === `object`) {
    return changeTextEffect(changes.effect.newValue, dom.main)
  }
  // line height
  if (changes.lineHeight) {
    return changeLineHeight(changes.lineHeight.newValue, dom)
  }
  // information text
  if (changes.info) {
    return changeHeader(changes.info.newValue, dom)
  }
  // centre, vertical & horizontal alignment
  if (changes.alignment) {
    if (typeof dom.main === `object` && changes.alignment.newValue) {
      dom.main.style.margin = `auto`
    } else {
      dom.main.style.margin = `initial`
    }
    return
  }
  // scan lines
  if (changes.scanlines) {
    const body = document.getElementsByTagName(`body`)[0]
    if (typeof body === `object`) {
      changeTextScanlines(changes.scanlines.newValue, body)
    }
    return
  }
}

function handleMessages(message)
// Handle messages passed on by functions in eventpage.js
// @message An object created by chrome.runtime.onMessage
{
  function other() {
    console.warn(`This unexpected message was received by handleMessages()`)
    console.warn(message)
  }
  if (message.id === undefined) {
    other()
    return
  }
  switch (message.id) {
    case `transcode`:
      sessionStorage.setItem(`transcode`, message.action)
      window.location.reload() // reload the active tab
      break
    case `checkErr`: displayErr(); break // display error alert box on active tab
    default: other(); break
  }
}

function humaniseTC(code = ``)
// Humanise transcode values for display with the <header>
// @code Session storage `transcode` value
{
  switch (code) {
    // src
    case `codeMsDos0`: return `CP1252`
    case `codeMsDos1`: return `ISO8859-5`
    // out
    case `codeLatin9`: return `ISO8859-15`
    case `codeNone`: return `US-ASCII`
    case `codeWindows`: return `CP1252`
    case `codeAutomatic`:
    default: return ``
  }
}

function switch2HTML(dom = new FindDOM())
// Display the RetroTxt processed and themed text document
// @dom A HTML DOM Object that will be modified
{
  if (typeof dom !== `object`) checkArg(`dom`, `object`, dom)
  chrome.storage.local.get(`textFontInformation`, result => {
    const r = result.textFontInformation
    if (r === undefined) checkErr(`Could not obtain the required textFontInformation setting to apply text font information feature`, true)
    else if (typeof r === `boolean`) changeHeader(r, dom)
  })
  dom.pre1.style.display = `none`
  dom.pre0.style.display = `block`
  const links = Array.from(dom.head.childNodes)
  links.forEach(link => link.disabled = false)
  // hide spin loader
  runSpinLoader(false)
}

function switch2PlainText(dom = new FindDOM())
// Display the original, unmodified text document
// @dom A HTML DOM Object that will be modified
{
  if (typeof dom !== `object`) checkArg(`dom`, `object`, dom)

  const ignored = [`chrome-extension`, `moz-extension`]
  const urlScheme = window.location.protocol.split(`:`)[0]
  // skip URL schemes that match `ignored`
  for (const i of ignored) {
    if (urlScheme.includes(i)) return
  }
  // hide classes
  changeTextScanlines(false, dom.body)
  // hide page style customisations
  if (dom.preCount >= 2) {
    if (dom.headers !== null) {
      for (const h of dom.headers) {
        h.style.display = `none`
      }
    }
    dom.pre0.style.display = `none`
    dom.pre1.style.display = `block`
  } else if (typeof dom.pre0 !== `undefined`) {
    dom.pre0.style.display = `block`
  }
  // hide links
  const links = Array.from(dom.head.childNodes)
  links.forEach(link => link.disabled = true)
  // hide red alert messages
  displayErr(false)
}

function runRetroTxt(tabId = 0, pageEncoding = `unknown`)
// Execute RetroTxt, this is the main function of retrotxt.js.
// @tabId         Browser tab ID to apply RetroTxt too
// @pageEncoding  Page encoding used by the tab
{
  if (typeof tabId !== `number`) checkArg(`tabId`, `number`, tabId)
  if (typeof pageEncoding !== `string`) checkArg(`pageEncoding`, `string`, pageEncoding)

  //console.log(`runRetroTxt(${tabId}, ${pageEncoding})`)
  const dom = new FindDOM()
  // context menu onclick listener
  chrome.runtime.onMessage.addListener(handleMessages)
  // monitor for any changed Options set by the user
  chrome.storage.onChanged.addListener(handleChanges)

  /* If the tab has already been RetroTxt-fied, switch between the original plain text and the HTML conversion */
  if (dom.cssLink !== null) {
    if (dom.cssLink.disabled === true) switch2HTML(dom)
    else if (dom.cssLink.disabled === false) switch2PlainText(dom)
    // tell a listener in eventpage.js that this tab's body has been modified
    chrome.runtime.sendMessage({ retroTxtified: false })
    return // end runRetroTxt() function
  }

  /* Build HTML */
  // get and apply saved Options
  chrome.storage.local.get([`lineHeight`, `retroColor`, `retroFont`, `textBgScanlines`, `textCenterAlignment`, `textEffect`], result => {
    function err(id) {
      checkErr(`Could not obtain the required ${id} setting to apply execute RetroTxt`, true)
    }
    const dom = new FindDOM()
    const r = result
    // line height choice
    if (typeof r.lineHeight === `string`) changeLineHeight(r.lineHeight, dom)
    else err(`lineHeight`)
    // colour choices
    if (typeof r.retroColor === `string`) changeColors(r.retroColor, dom)
    else err(`retroColor`)
    // font selection
    if (typeof r.retroFont === `string`) changeFont(r.retroFont, dom.pre0)
    else err(`retroFont`)
    // scan lines
    if (typeof r.textBgScanlines === `boolean` && r.textBgScanlines === true) changeTextScanlines(r.textBgScanlines, dom.body)
    else if (typeof r.textBgScanlines !== `boolean`) err(`textBgScanlines`)
    // centre alignment of text
    if (typeof r.textCenterAlignment === `boolean` && r.textCenterAlignment === true) {
      dom.main.style.margin = `auto` // vertical & horizontal alignment
    } else if (typeof r.textCenterAlignment !== `boolean`) err(`textCenterAlignment`)
    // text effect
    if (typeof r.textEffect === `string`) changeTextEffect(r.textEffect, dom.main)
    else if (typeof r.textEffect !== `string`) err(`textEffect`)
  })

  // Stylise text document
  buildStyles(dom)

  // tell a listener in eventpage.js that the body of this tab has been modified
  chrome.runtime.sendMessage({ retroTxtified: true })

  // Default configurations
  const reset = new ListDefaults()
  // Data object
  const dataObj = { cs: ``, cp: {}, errs: null, html: ``, oths: null, sauce: null }
  dataObj.errs = 0 // ecma48 unknown csi count
  dataObj.oths = 0 // ecma48 other and ignored csi count
  // ECMA48 (ansi) data object
  let ecma48Data = {}
  // Input source text
  const inputSrc = { BOM: ``, chrSet: ``, encoding: ``, format: null, length: null, text: ``, }
  inputSrc.chrSet = document.characterSet
  inputSrc.encoding = pageEncoding
  inputSrc.text = dom.pre0.innerHTML
  inputSrc.BOM = findUnicode(inputSrc.text)
  inputSrc.format = findControlSequences(inputSrc.text)
  inputSrc.length = inputSrc.text.length
  // Browser elements
  const outputDOM = { header: null, main: null, pre: null, slice: ``, innerHTML: ``, columns: null, rows: null, }
  outputDOM.headerShow = document.createElement(`header`)
  outputDOM.headerShow.id = `header-show`
  outputDOM.headerHide = document.createElement(`header`)
  outputDOM.headerHide.id = `header-hide`
  outputDOM.main = document.createElement(`main`)
  outputDOM.pre = document.createElement(`pre`)
  outputDOM.slice = inputSrc.text
  outputDOM.columns = 80 // assume 80 for all text formats
  outputDOM.rows = 0
  // <header> element object
  const hd = {
    sep: ` - `, pad: ` `, // separator, padding
    area: document.createElement(`span`),
    cursor: document.createElement(`span`),
    encode: document.createElement(`span`),
    errors: document.createElement(`div`),
    font: document.createElement(`span`),
    ice: document.createElement(`span`),
    ice_btn: document.createElement(`strong`),
    palette: document.createElement(`strong`),
    render: document.createElement(`strong`),
    size: document.createElement(`span`),
    txt_adj: document.createElement(`strong`),
    ui: document.createElement(`strong`),
  }
  // hidden <header> element object
  const hdh = {
    ui: document.createElement(`strong`),
  }

  // options and store them as synchronous sessionStorage
  chrome.storage.local.get([`textDosCtrlCodes`], result => {
    // display DOS CP-437 characters that normally function as C0 control functions
    const r = result.textDosCtrlCodes
    if (typeof r !== `boolean`) {
      checkErr(`Could not obtain the required textDosCtrlCodes setting to apply the display of DOS control code symbols`, true)
    } else localStorage.setItem(`textDosCtrlCodes`, r)
  })
  chrome.storage.local.get([`textAnsiIceColors`], result => {
    const r = result.textAnsiIceColors
    if (typeof r !== `boolean`) {
      checkErr(`Could not obtain the required textAnsiIceColors setting to apply ANSI iCE colors`, true)
    } else localStorage.setItem(`textAnsiIceColors`, r)
  })

  /* SAUCE - Standard Architecture for Universal Comment Extensions */
  // http://www.acid.org/info/sauce/sauce.htm

  const sauce00 = findSAUCE(inputSrc)
  switch (sauce00.version) {
    case `00`:
      dataObj.sauce = formatSAUCE(sauce00) // creates HTML
      // remove sauce record from text
      if (sauce00.position.comntIndex > 0 && sauce00.position.comntIndex < sauce00.position.sauceIndex) {
        // re-evaluate location of COMNT and remove it from text
        const cmnt = inputSrc.text.lastIndexOf(`COMNT`)
        outputDOM.slice = inputSrc.text.slice(0, cmnt)
      }
      else {
        // re-evaluate location of SAUCE and remove it from text
        const sauce = inputSrc.text.lastIndexOf(`SAUCE00`)
        outputDOM.slice = inputSrc.text.slice(0, sauce)
      }
      break
    default:
      outputDOM.slice = inputSrc.text
  }

  // document and page encoding
  if (inputSrc.BOM.length > 0) inputSrc.encoding = inputSrc.BOM
  // determine character set
  dataObj.cs = charSetFind(sessionStorage.getItem(`transcode`), sauce00, outputDOM)
  dataObj.cp = new HumaniseCP(dataObj.cs)
  // rebuild text with new character encoding
  dataObj.html = charSetRebuild(dataObj.cs, outputDOM)
  // count number of rows (lines)
  outputDOM.rows = dataObj.html.trim().split(/\r\n|\r|\n/).length

  // handle non-ASCII text formatting
  const theme = new ListRGBThemes()
  const rgt = new RegExp(`&gt;`, `gi`)
  const rlt = new RegExp(`&lt;`, `gi`)
  const ramp = new RegExp(`&amp;`, `gi`)
  switch (inputSrc.format) {
    case `ecma48`: // ECMA-48 aka ANSI encoded text
      console.info(`%c%cECMA-48%ccontrol sequences in use.`, `font-weight: bold`, `font-weight: bold; color: green`, `font-weight: bold; color: initial`)
      //console.time(`BuildEcma48()`)
      // These objects are isolated to the RetroTxt content scripts
      ecma48Data = new BuildEcma48(dataObj.html, sauce00, false, false)
      //console.timeEnd(`BuildEcma48()`)
      if (ecma48Data.columns === 999 && sauce00.config.width >= 180) outputDOM.columns = null
      else outputDOM.columns = ecma48Data.columns
      outputDOM.rows = ecma48Data.rows
      dataObj.html = ecma48Data.htmlString
      dataObj.oths = ecma48Data.otherCodesCount
      dataObj.errs = ecma48Data.unknownCount
      // handle Set/Restore Mode functionality
      // font override
      sessionStorage.removeItem(`fontOverride`)
      if (ecma48Data.font === undefined) {
        checkErr(`'ecma48Data.font' should have returned a font value or 'null' but instead returned ${ecma48Data.font}`)
      } else if (ecma48Data.font !== null) {
        //console.log(`Set mode font override to ${ecma48Data.font.toUpperCase()}`)
        changeFont(ecma48Data.font, outputDOM.pre) // this needs to run before setting the sessionStorage
        sessionStorage.setItem(`fontOverride`, `true`)
      }
      // color depth
      //ecma48Data.colorDepth = 8 // uncomment to test
      // handle 4-bit stylesheet
      switch (ecma48Data.colorDepth) {
        case 24: case 8:
          theme.color = 2 // enforce the use of the xterm palette instead of ibm vga
          document.getElementById(`retrotxt-4bit`).href = chrome.extension.getURL(`css/text_colors_${theme.colors[theme.color]}.css`)
          break
        case 1: document.getElementById(`retrotxt-4bit`).remove(); break
        case 2: document.getElementById(`retrotxt-4bit`).href = chrome.extension.getURL(`css/text_colors_cga.css`); break
        case 0: document.getElementById(`retrotxt-4bit`).href = chrome.extension.getURL(`css/text_colors_gray.css`); break
      }
      // handle 8-bit stylesheet
      switch (ecma48Data.colorDepth) {
        case 24: case 8: break
        default: document.getElementById(`retrotxt-8bit`).remove()
      }
      // build palette html element
      hd.palette.id = `h-palette`
      if (ecma48Data.colorDepth !== 4) hd.palette.style = `font-weight:normal;`
      switch (ecma48Data.colorDepth) {
        case 24: case 8:
          if (ecma48Data.colorDepth === 8) {
            hd.palette.title = `A range of 256 ${chrome.i18n.getMessage(`color`)}s using the xterm palette`
            hd.palette.textContent = `xterm 8-bit`
          } else {
            hd.palette.title = `A range of 16.7 million ${chrome.i18n.getMessage(`color`)}s using the RGB true ${chrome.i18n.getMessage(`color`)} palette`
            hd.palette.textContent = `RGB`
          }
          break
        case 4:
          hd.palette.title = `Switch ANSI ${chrome.i18n.getMessage(`color`)} palettes`
          hd.palette.textContent = `IBM`
          break
        case 2: hd.palette.textContent = `4 ${chrome.i18n.getMessage(`color`)} magenta`; break
        case 1: hd.palette.textContent = `2 ${chrome.i18n.getMessage(`color`)} ASCII`; break
        case 0: hd.palette.textContent = `monochrome`; break
      }
      // iCE colors
      hd.ice_btn.textContent = `??`
      hd.ice.id = `ice-colors-toggle`
      hd.ice.title = `Toggle between blinking mode or static background ${chrome.i18n.getMessage(`color`)}`
      hd.ice.textContent = `iCE colors `
      hd.ice.appendChild(hd.ice_btn)
      if (ecma48Data.iceColors === true) {
        dom.head.appendChild(buildLinksToCSS(`css/text_colors_${theme.colors[theme.color]}-ice.css`, `retrotxt-4bit-ice`)) // child 4
      }
      // parse text to a DOM object and insert it into the browser tab
      if (typeof dataObj.html === `string`) {
        const html = ParseToChildren(dataObj.html)
        outputDOM.pre.appendChild(html)
      } else checkErr(`Expecting a string type for dataObj.html but instead it is ${typeof dataObj.html}`)
      break
    case `pcboard`: // converts PCBoard and WildCat! BBS colour codes into HTML and CSS
    case `wildcat`:
      console.info(`%c%c${chrome.i18n.getMessage(inputSrc.format)} %c${chrome.i18n.getMessage(`color`)} codes.`, `font-weight: bold`, `font-weight: bold; color: green`, `font-weight: bold; color: initial`)
      outputDOM.pre = BuildBBS(dataObj.html, inputSrc.format, false)
      break
    default:
      // replace escaped chars because we're using <pre>
      dataObj.html = dataObj.html.replace(rgt, `>`)
      dataObj.html = dataObj.html.replace(rlt, `<`)
      dataObj.html = dataObj.html.replace(ramp, `&`)
      outputDOM.pre.textContent = dataObj.html
  }
  // apply a blinking cursor
  hd.cursor.classList.add(`dos-cursor`)
  hd.cursor.textContent = `_`
  outputDOM.pre.appendChild(hd.cursor)
  // reveal the text font information header
  chrome.storage.local.get(`textFontInformation`, result => {
    // ice color toggle functions
    function iceToggle() {
      ecma48Data.iceColors = !ecma48Data.iceColors
      switch (ecma48Data.iceColors) {
        case true: iceColorsOn(); break
        default: iceColorsOff()
      }
    }
    function iceColorsOn() {
      const iceCSS = document.getElementById(`retrotxt-4bit-ice`)
      const palette = document.getElementById(`h-palette`)
      if (iceCSS !== null) return
      const theme = new ListRGBThemes()
      if (palette !== null) {
        switch (palette.innerHTML) {
          case `IBM`: theme.color = 1; break
          case `xterm`: theme.color = 2; break
          case `IBM CGA`: theme.color = 3; break
          default: theme.color = 0
        }
      }
      dom.head.appendChild(buildLinksToCSS(`css/text_colors_${theme.colors[theme.color]}-ice.css`, `retrotxt-4bit-ice`)) // child 4
      iceColors.childNodes[1].innerHTML = `On`
    }
    function iceColorsOff() {
      const iceCSS = document.getElementById(`retrotxt-4bit-ice`)
      if (iceCSS !== null) iceCSS.remove()
      iceColors.childNodes[1].innerHTML = `Off`
    }
    // reveal or hide header
    const tHide = document.getElementById(`h-ui-toggle-hide`)
    const tShow = document.getElementById(`h-ui-toggle-show`)
    if (tHide !== null) {
      tHide.onclick = () => changeHeader(true, dom)
    }
    if (tShow !== null) {
      tShow.onclick = () => changeHeader(false, dom)
    }
    switch (result.textFontInformation) {
      case false:
      case true: {
        changeHeader(result.textFontInformation); break
      }
      default: checkErr(`Could not obtain the required textFontInformation setting to reveal text font information`, true)
    }
    // text render
    const textRender = document.getElementById(`h-text-rend`)
    if (textRender !== null) {
      textRender.onclick = function () {
        switch (this.innerHTML) {
          case `Normal`: changeTextEffect(`smeared`, dom.body.childNodes[3]); break
          case `Smeared`: changeTextEffect(`shadowed`, dom.body.childNodes[3]); break
          default: changeTextEffect(`normal`, dom.body.childNodes[3])
        }
      }
    }
    // palette
    const palette = document.getElementById(`h-palette`)
    if (palette !== null && ecma48Data.colorDepth === 4) {
      palette.onclick = function () {
        const iceCSS = document.getElementById(`retrotxt-4bit-ice`)
        const theme = new ListRGBThemes()
        switch (this.innerHTML) {
          case `IBM`: // 1
            palette.textContent = `xterm`
            theme.color = 2
            break
          case `xterm`: // 2
            palette.textContent = `IBM CGA`
            theme.color = 3
            break
          case `IBM CGA`: // 3
            palette.textContent = `${chrome.i18n.getMessage(`Gray`)}`
            theme.color = 0
            break
          default: // 0
            palette.textContent = `IBM`
            theme.color = 1
        }
        // update palette link
        const link = chrome.extension.getURL(`css/text_colors_${theme.colors[theme.color]}.css`)
        document.getElementById(`retrotxt-4bit`).href = link
        // update ice colors link
        if (iceCSS !== null) {
          iceCSS.href = chrome.extension.getURL(`css/text_colors_${theme.colors[theme.color]}-ice.css`)
        }
      }
    }
    // ice colors toggle in the information header (only shows with EMCA48/ANSI documents)
    const iceColors = document.getElementById(`ice-colors-toggle`)
    if (iceColors !== null) {
      switch (ecma48Data.iceColors) {
        case true:
          iceColors.childNodes[1].innerHTML = `On`
          iceColors.onclick = iceToggle
          break
        default:
          iceColors.childNodes[1].innerHTML = `Off`
          iceColors.onclick = iceToggle
      }
    }
  })
  // code page details for text font info.
  hd.encode.id = `h-doc-fmt`
  switch (inputSrc.format) {
    case `pcboard`:
    case `wildcat`:
      hd.encode.title = `Special bulletin board system, text formatting`
      hd.encode.textContent = `${chrome.i18n.getMessage(inputSrc.format)}`
      break
    case `ecma48`:
      // ecma48 errors
      if (dataObj.oths > 0 || dataObj.errs > 0) {
        const cnt = dataObj.oths + dataObj.errs
        let ic = ``
        if (dataObj.oths > 0) {
          ic += `${dataObj.oths} unsupported function`
          if (dataObj.oths > 1) ic += `s`
        }
        if (dataObj.oths > 0 && dataObj.errs > 0) ic += ` and `
        if (dataObj.errs > 0) {
          ic += `${dataObj.errs} unknown control`
          if (dataObj.errs > 1) ic += `s`
        }
        ic += ` found`
        if (cnt > 4) {
          ic += `, this display is inaccurate`
          const u = document.createElement(`u`)
          u.textContent = ic
          hd.errors.appendChild(u)
        } else {
          hd.errors.textContent = ic
        }
      }
    // break omitted
    default:
      outputDOM.pre.style.width = reset.width // lock centring alignment to 640px columns
      outputDOM.pre.classList.add(`text-1x`)
      if (inputSrc.chrSet !== null) {
        const vs = document.createTextNode(` → `)
        const input = document.createElement(`span`)
        const output = document.createElement(`span`)
        const ansi = document.createElement(`span`)
        const inp = { text: ``, }
        const out = { text: ``, }
        const stored = { item: null, text: `` }
        // obtain transcode setting
        stored.item = sessionStorage.getItem(`transcode`)
        stored.text = humaniseTC(stored.item)
        // serialise the result from document.characterSet
        inp.text = inputSrc.chrSet.replace(`-`, ``).toUpperCase()
        inp.text = inp.text.replace(`WINDOWS`, `CP`)
        // check that document.characterSet is usable by RetroTxt
        if ([`CP437`, `CP1250`, `CP1251`, `CP1252`, `ISO8859-5`, `UTF8`, `UTF16LE`, `UTF16BE`].includes(inp.text) === false) {
          input.classList.add(`unknown`) // this class hightlights the characterSet string
        }
        // serialise the result of sessionStorage.getItem(`transcode`)
        out.text = dataObj.cp.text
        out.text = out.text.replace(`-`, ``).toUpperCase()
        out.text = out.text.replace(`WINDOWS`, `CP`)
        // create html elements
        input.textContent = inp.text
        output.textContent = out.text
        input.title = `Document encoding set by the browser`
        output.title = `Unicode ≈ `
        switch (stored.item) {
          case `codeMsDos0`: case `codeMsDos1`:
            if (inp.text === stored.text) {
              input.style = `text-decoration: underline`
              input.textContent = inp.text
            } else {
              const old = document.createElement(`span`)
              old.style = `text-decoration: line-through`
              old.textContent = inp.text
              input.appendChild(old)
              input.textContent = stored.text
            }
            break
          default:
            if (stored.text === out.text) {
              output.style = `text-decoration: underline`
              output.textContent = out.text
            } else if (stored.text !== ``) {
              const old = document.createElement(`span`)
              old.style = `text-decoration: line-through`
              old.textContent = out.text
              output.appendChild(old)
              output.textContent = stored.text
            }
        }
        output.title += dataObj.cp.title
        hd.encode.appendChild(input)
        hd.encode.appendChild(vs)
        hd.encode.appendChild(output)
        if (inputSrc.format === `ecma48`) {
          ansi.title = `ECMA-48/ANSI X3.64 presentation control and cursor functions`
          ansi.textContent = `ANSI`
          hd.encode.appendChild(document.createTextNode(` `))
          hd.encode.appendChild(ansi)
        }
      }
  }
  {
    // show and hide header toggles
    hd.ui.id = `h-ui-toggle-show`
    hd.ui.title = `Hide this information header`
    hd.ui.textContent = `▲`
    hdh.ui.id = `h-ui-toggle-hide`
    hdh.ui.title = `Reveal the information header`
    hdh.ui.textContent = `▼`
    outputDOM.headerHide.appendChild(hdh.ui)
  }
  {
    // document measurements
    const vs = document.createTextNode(`x`)
    const columns = document.createElement(`span`)
    const lines = document.createElement(`span`)
    columns.title = `Pixel width of text`
    columns.id = `width-of-text`
    lines.title = `Pixel length of text`
    lines.id = `length-of-text`
    columns.textContent = `?`
    lines.textContent = `?`
    hd.area.appendChild(columns)
    hd.area.appendChild(vs)
    hd.area.appendChild(lines)
  }
  {
    // document size
    hd.size.title = `Number of characters contained in the text`
    hd.size.textContent = humaniseFS(inputSrc.length)
  }
  {
    // font size adjustment
    hd.txt_adj.id = `h-doc-text-adjust`
    hd.txt_adj.title = `Font size adjustment`
    hd.txt_adj.textContent = `1x`
    hd.txt_adj.onclick = function () {
      switch (this.textContent) {
        case `1x`:
          hd.txt_adj.textContent = `2x`
          outputDOM.pre.classList.add(`text-2x`)
          outputDOM.pre.classList.remove(`text-1x`)
          break
        case `2x`:
          hd.txt_adj.textContent = `1x`
          outputDOM.pre.classList.add(`text-1x`)
          outputDOM.pre.classList.remove(`text-2x`)
          break
      }
    }
  }
  {
    // page font family
    hd.font.id = `h-doc-font-family`
    hd.font.title = `Font family used for display`
    if (typeof ecma48Data.font !== `undefined` && ecma48Data.font !== null) {
      // ecma48 encode text
      hd.font.textContent = handleFontName(ecma48Data.font)
    } else {
      // ascii encoded text
      let sfn = ``
      switch (sauce00.version) {
        case `00`: // use font name contained in SAUCE metadata
          sessionStorage.removeItem(`fontOverride`)
          sfn = handleFontSauce(sauce00)
          if (sfn === ``) console.warn(`Could not obtain a font name from the SAUCE metadata`)
          else {
            changeFont(sfn, outputDOM.pre)
            sessionStorage.setItem(`fontOverride`, `true`)
            hd.font.textContent = handleFontName(sfn)
          }
          break
        default: // use the font selected in Options
          chrome.storage.local.get([`retroFont`], r => {
            if (r.retroFont === undefined) checkErr(`Could not obtain the required retroFont setting to apply the header`, true)
            else {
              const elm = window.document.getElementById(`h-doc-font-family`)
              elm.textContent = handleFontName(r.retroFont)
            }
          })
      }
    }
  }
  {
    // page render method
    hd.render.id = `h-text-rend`
    hd.render.title = `Switch between text render methods`
  }
  // build header
  outputDOM.headerShow.appendChild(hd.ui)
  outputDOM.headerShow.appendChild(document.createTextNode(hd.pad))
  outputDOM.headerShow.appendChild(hd.area)
  outputDOM.headerShow.appendChild(document.createTextNode(hd.pad))
  outputDOM.headerShow.appendChild(hd.size)
  outputDOM.headerShow.appendChild(document.createTextNode(hd.sep))
  outputDOM.headerShow.appendChild(hd.encode)
  outputDOM.headerShow.appendChild(document.createTextNode(hd.sep))
  outputDOM.headerShow.appendChild(hd.render)
  outputDOM.headerShow.appendChild(document.createTextNode(hd.pad))
  outputDOM.headerShow.appendChild(hd.txt_adj)
  outputDOM.headerShow.appendChild(document.createTextNode(hd.pad))
  outputDOM.headerShow.appendChild(hd.font)
  if (inputSrc.format === `ecma48`) {
    outputDOM.headerShow.appendChild(document.createTextNode(hd.sep))
    outputDOM.headerShow.appendChild(hd.palette)
    switch (ecma48Data.colorDepth) {
      case 8: break//case 24:
      default: outputDOM.headerShow.appendChild(document.createTextNode(` palette`))
    }
    if (ecma48Data.iceColors === true) {
      outputDOM.headerShow.appendChild(document.createTextNode(`, `))
      outputDOM.headerShow.appendChild(hd.ice)
    }
    // append any ecma-48 errors
    if (dataObj.oths > 0 || dataObj.errs > 0) {
      outputDOM.headerShow.appendChild(hd.errors)
    }
  }
  // SAUCE records for text font info
  if (dataObj.sauce !== null) outputDOM.headerShow.appendChild(dataObj.sauce)

  // create red alert message at the top of the page
  if (window.checkedErr !== undefined && window.checkedErr === true) displayErr(true)
  else displayErr(false) // hide from view

  // hide original source text
  dom.pre0.style.display = `none`

  // mark tab's title with the RetroTxt ascii logo
  const title = document.createElement(`title`)
  if (window.location.protocol === `file:`) {
    title.textContent = `[··] ` + window.location.pathname.split(`/`).filter(function (el) { return !!el }).pop()
  } else { title.textContent = `[··] ${window.location.host}${window.location.pathname}` }

  // set document language
  document.documentElement.lang = `en`

  // insert new tags into HTML DOM
  dom.head.appendChild(title)
  outputDOM.main.appendChild(outputDOM.pre)
  dom.body.insertBefore(outputDOM.headerShow, dom.pre0)
  dom.body.insertBefore(outputDOM.headerHide, dom.pre0)
  dom.body.insertBefore(outputDOM.main, dom.pre0)

  // hide spin loader
  runSpinLoader(false)

  // need to delay getting calculated element size, otherwise the received client values are incorrect
  setTimeout(() => {
    const m = document.getElementsByTagName(`main`)[0]
    const w = document.getElementById(`width-of-text`)
    const h = document.getElementById(`length-of-text`)
    h.textContent = m.clientHeight
    w.textContent = m.clientWidth
  }, 500)
}