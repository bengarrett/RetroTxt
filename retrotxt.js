// filename: retrotxt.js
//
// These functions are used to apply and remove RetroTxt from browser tabs.
'use strict'

/*
global BuildBBS BuildCP1252 BuildCPDos BuildCP88591 BuildCP885915 BuildCPUtf8 BuildCPUtf16
HumaniseCP BuildEcma48 BuildFontStyles ListCharacterSets ListDefaults ListRGBThemes
buildLinksToCSS checkArg checkErr changeTextScanlines changeTextEffect
chrome findControlSequences displayErr runSpinLoader humaniseFS
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
  const finds = {
    char: ``,
    cp: 0,
    cp437: 0,
    hex: ``, // not used
    iso8859: 0,
    page: 0,
    position: 0,
    usAscii: 0,
    unsure: 0
  }

  let i = s.length
  while (i--) {
    if (i < sLen - limit) break
    finds.position = sLen - i
    finds.char = s[finds.position]
    finds.cp = s.codePointAt(finds.position)
    if (finds.cp !== undefined) finds.hex = finds.cp.toString(16)
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
  this.header = document.querySelector(`header`)
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
    // binary values
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

  let decimals = set
  for (const d in set) {
    decimals[d] = set[d].codePointAt(0)
  }
  decimals = decimals.filter(decimals => typeof decimals !== `undefined`) // filter out undefined decimals values
  return decimals
}

function buildStyles(dom = new FindDOM())
// Constructs the Document Object Model (DOM) needed to display RetroTxt
// @dom A DOM Object that will be modified
{
  if (typeof dom !== `object`) checkArg(`dom`, `object`, dom)

  // Build link tags
  const theme = new ListRGBThemes()

  // make a <link> to point to the CSS for use with 1-bit colour themes (ASCII, NFO)
  dom.head.appendChild(buildLinksToCSS(`css/retrotxt.css`, `retrotxt-styles`)) // child 0
  // make a <link> to point to the CSS for use with 1-bit colour themes (ASCII, NFO)
  dom.head.appendChild(buildLinksToCSS(`css/text_colors.css`, `retrotxt-theme`)) // child 1

  // load any CSS that are used to mimic colours by the text file
  let innerHTML = ``
  if (typeof dom.pre1 === `undefined`) {
    innerHTML = dom.pre0.innerHTML
  } else {
    innerHTML = dom.pre1.innerHTML
  }
  const format = findControlSequences(innerHTML)
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

function changeColors(colorName = ``, dom = new FindDOM())
// Applies background colour to the DOM <body> and colour to the <PRE> tag containing
// the stylised text document.
// @colorName   Colour name
// @dom         A HTML DOM Object that will be modified
{
  if (typeof colorName !== `string`) checkArg(`colorName`, `string`, colorName)
  if (typeof dom !== `object`) checkArg(`dom`, `object`, dom)

  const h = document.getElementsByTagName(`header`)
  const engine = findEngine()
  let color = colorName, filterVal = ``

  try {
    dom.body.className = ``
    dom.main.className = ``
  } catch (err) { /* Some Firefox versions throw a security error when handling file:/// */ }
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
  if (color.startsWith(`theme-`) === false) color = `theme-${color}`
  if (dom.body.classList !== null) dom.body.classList.add(`${color}-bg`)
  else return // error
  if (dom.main.classList !== null) dom.main.classList.add(`${color}-fg`)
  else return // error
  // invert header
  // white backgrounds need to be handled separately
  if (h[0] !== null) {
    filterVal = `invert(100%)`
    if (engine === `blink`) { // work around for Chrome
      switch (color) {
        case `theme-windows`:
        case `theme-atarist`: filterVal = `invert(0%)`; break
        default:
          if (color.includes(`-on-white`)) filterVal = `invert(0%)`
      }
    }
    // deal with varying browser support (http://caniuse.com/#feat=css-filters)
    if (h[0].style.filter !== undefined) { // Modern browsers
      h[0].style.filter = filterVal
    } else if (h[0].style.webkitFilter !== undefined) { // Chrome 49-55
      h[0].style.webkitFilter = filterVal
    } else { // Firefox 50, 51
      h[0].style.backgroundColor = `black`
      h[0].style.color = `white`
    }
  }
}

function changeFont(ff = ``, dom = new FindDOM())
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
  let element = dom
  if (element.className === null) return // error
  if (element.classList === null) return // error
  const classAsArray = element.className.split(` `)
  const font = new BuildFontStyles(ff)
  console.info(`Using font ${font.string}`)
  // loop through and remove any font-* classes
  let i = classAsArray.length
  while (i--) {
    if (classAsArray[i].startsWith(`font-`)) element.classList.remove(classAsArray[i])
  }
  // inject replacement font
  element.classList.add(`font-${ff}`)
  // Update the header with new font information
  let headerItem = window.document.getElementById(`h-doc-font-family`)
  if (headerItem !== null) headerItem.innerHTML = ff.toUpperCase()
}

function changeLineHeight(lh = `normal`, dom = new FindDOM())
// Applies line height modifications to the DOM <PRE> tag containing the stylised
// text document.
// @lh  Number that will be multiplied with the font size to set the line height
// @dom A HTML DOM Object that will be modified
{
  if (typeof lh !== `string`) checkArg(`lh`, `string`, lh)
  if (typeof dom !== `object`) checkArg(`dom`, `object`, dom)

  dom.pre0.style.lineHeight = lh
}

function charSetFind(c = ``, dom = {})
// Return the source text character set
// @c   Code page cases used by the context menus
// @dom A HTML DOM Object that will be modified
{
  if (typeof c !== `string` && c !== null) checkArg(`c`, `string`, c)
  if (typeof dom !== `object`) checkArg(`dom`, `object`, dom)
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
        default: { // unknown/unsupported encodings, we so guess but the output is most-likely to be incorrect
          return new BuildCharSet(dom.preProcess).guess
        }
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
    case `src_CP1250`:
    case `src_CP1251`:
    case `src_CP1252`:
    case `src_8859_5`: return new BuildCPDos(dom.preProcess, c).text
    case `out_CP1252`: return new BuildCP1252(dom.preProcess).text
    case `out_8859_1`: return new BuildCP88591(dom.preProcess).text
    case `out_8859_15`: return new BuildCP885915(dom.preProcess).text
    case `out_UTF8`: return new BuildCPUtf8(dom.preProcess).text
    case `out_US_ASCII`: return new BuildCPUtf16(dom.preProcess).text
    default:
      checkErr(`'${c}' is not a valid charSetRebuild() identifier`, true)
  }
}

function findPageColumns(text = ``)
// Calculate the number of columns (characters per line) in use by the text
// Regular expression sourced from
// http://stackoverflow.com/questions/8802145/replace-html-entities-with-regular-expression
// @text A required string of text
{
  if (typeof text !== `string`) checkArg(`text`, `string`, text)

  const cols = new ListDefaults().columns // default 80 columns
  const rFindEnt = new RegExp(/&(?:[a-z\d]+|#\d+|#x[a-f\d]+);/igm) // find HTML entities
  const splitTxt = text.split(/\r\n|\r|\n/) // split original text into lines
  let spacedTxt = ``
  let len = 0
  for (let i in splitTxt) {
    spacedTxt = splitTxt[i].replace(rFindEnt, ` `).trim() // replace HTML entities with spaces
    if (len < spacedTxt.length) len = spacedTxt.length
  }
  // console.log("Columns actual count: " + len);
  if (len <= 40) return 40
  else if (len <= cols) return cols // do nothing & keep cols as default
  else return len
}

function findSAUCE(text = { original: `` }, length = 0)
// Looks for and parses a SAUCE (metadata) record from the text
// more information, http://www.acid.org/info/sauce/sauce.htm
{
  if (typeof text !== `object`) checkArg(`text`, `object`, text)
  if (typeof text.original !== `string`) checkArg(`text.original`, `string`, text.original)
  if (typeof length !== `number`) checkArg(`length`, `number`, length)

  // To reduce the memory footprint when handling large text files, we pass an object to `text`
  // pointing to the original text instead of duplicating the text using a (primitive) string.

  // scan the last 500 characters of the text for a SAUCE identifier
  const search = text.original.slice(length - 500, length)
  const start = search.indexOf(`SAUCE00`) - 500
  const comntStart = search.lastIndexOf(`COMNT`)
  // data containers
  const texts = { sauce: text.original.slice(start, length) }
  const configs = {
    flags: `00000000`,
    iceColors: `0`,
    letterSpacing: `00`,
    aspectRatio: `00`,
    fontName: ``,
    length: 0,
    width: 0,
  }
  const dates = {
    ccyymmdd: `00000000`,
    year: 0,
    month: 0,
    day: 0,
  }
  const positions = {
    length: length,
    sauceIndex: length + start,
    comntIndex: length - comntStart,
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
  let len = 0

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
  configs.flags = data.TFlags.charCodeAt(0).toString(2)  // get binary representation of character
  len = configs.flags.length
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
    let uea = new TextEncoder(`ascii`).encode(data.TInfo1.replace(rBin0, ``)[0])
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
  if (str.length > 0) str = `<div id="SAUCE00-metadata"> ${str}</div> `
  if (s.comment.trim() !== ``) str = `${str}\n<div id="SAUCE00-comment"><em>${s.comment.trim()}</em></div> `
  return str
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
  let description = ``
  if (chr1 === `ef` && chr2 === `bb` && chr3 === `bf`) description = `UTF-8`
  else if (chr1 === `ff` && chr2 === `fe`) description = `UTF-16, little endian`
  else if (chr1 === `fe` && chr2 === `ff`) description = `UTF-16, big endian`
  else if (chr1 === `ff` && chr2 === `fe` && chr3 === `00` && chr4 === `00`) description = `UTF-32, little endian`
  else if (chr1 === `00` && chr2 === `00` && chr3 === `fe` && chr4 === `ff`) description = `UTF-32, little endian`
  return description
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
  }

  let dom = new FindDOM()

  // font
  if (changes.font) {
    changeFont(changes.font.newValue, dom.pre0)
    chrome.storage.local.get(`lineHeight`, function (r) {
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
    chrome.storage.local.get([`textBgScanlines`, `textEffect`], function (r) {
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
    changeTextEffect(changes.effect.newValue, dom.main)
    return
  }
  // line height
  if (changes.lineHeight) {
    changeLineHeight(changes.lineHeight.newValue, dom)
    return
  }
  // information text
  if (changes.info) {
    const h = document.getElementsByTagName(`header`)[0]
    if (typeof h === `object`) {
      if (!changes.info.newValue) h.style.display = `none`
      else h.style.display = `block`
    }
    return
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
  if (message.id === undefined) { other(); return }
  switch (message.id) {
    case `transcode`:
      sessionStorage.setItem(`transcode`, message.action)
      window.location.reload() // reload the active tab
      break
    case `checkErr`:
      displayErr() // display error alert box on active tab
      break
    default:
      other()
      break
  }
  function other() {
    console.warn(`This unexpected message was received by handleMessages()`)
    console.warn(message)
  }
}

function switch2HTML(dom = new FindDOM())
// Display the RetroTxt processed and themed text document
// @dom A HTML DOM Object that will be modified
{
  if (typeof dom !== `object`) checkArg(`dom`, `object`, dom)
  chrome.storage.local.get(`textFontInformation`, function (result) {
    const r = result.textFontInformation
    if (r === undefined) checkErr(`Could not obtain the required textFontInformation setting to apply text font information feature`, true)
    else if (typeof r === `boolean`) {
      if (r === false) dom.header.style.display = `none`
      else dom.header.style.display = `block`
    }
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

  const ignoredSchemes = [`chrome-extension`, `moz-extension`]
  const urlScheme = window.location.protocol.split(`:`)[0]
  // skip URLs that match `ignoredSchemes`
  let removeCSSChildren = true
  for (const i of ignoredSchemes) {
    if (urlScheme.includes(i)) removeCSSChildren = false
  }
  if (removeCSSChildren === false) return
  // hide classes
  changeTextScanlines(false, dom.body)
  // hide page style customisations
  if (dom.preCount >= 2) {
    if (dom.header !== null) dom.header.style.display = `none`
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
  chrome.storage.local.get([`lineHeight`, `retroColor`, `retroFont`, `textBgScanlines`, `textCenterAlignment`, `textEffect`], function (result) {
    function err(id) {
      checkErr(`Could not obtain the required ${id} setting to apply execute RetroTxt`, true)
    }
    let dom = new FindDOM(), r
    // line height choice
    r = result.lineHeight
    if (typeof r === `string`) changeLineHeight(r, dom)
    else err(`lineHeight`)
    // colour choices
    r = result.retroColor
    if (typeof r === `string`) changeColors(r, dom)
    else err(`retroColor`)
    // font selection
    r = result.retroFont
    if (typeof r === `string`) changeFont(r, dom.pre0)
    else err(`retroFont`)
    // scan lines
    r = result.textBgScanlines
    if (typeof r === `boolean` && r === true) changeTextScanlines(r, dom.body)
    else if (typeof r !== `boolean`) err(`textBgScanlines`)
    // centre alignment of text
    r = result.textCenterAlignment
    if (typeof r === `boolean` && r === true) {
      dom.main.style.margin = `auto` // vertical & horizontal alignment
    } else if (typeof r !== `boolean`) err(`textCenterAlignment`)
    // text effect
    r = result.textEffect
    if (typeof r === `string`) changeTextEffect(r, dom.main)
    else if (typeof r !== `string`) err(`textEffect`)
  })

  // Stylise text document
  buildStyles(dom)

  // tell a listener in eventpage.js that the body of this tab has been modified
  chrome.runtime.sendMessage({ retroTxtified: true })

  // Create a copy of the text documentfor applying styles.
  const reset = new ListDefaults()
  const srcText = { original: dom.pre0.innerHTML } // use an object instead of a string type to reduce `srcText` memory footprint
  const srcMeta = {
    BOM: findUnicode(srcText.original),
    chrSet: document.characterSet,
    encoding: pageEncoding,
    format: findControlSequences(srcText.original),
    length: srcText.original.length
  }
  const newDOM = {
    header: document.createElement(`header`),
    main: document.createElement(`main`),
    pre: document.createElement(`pre`),
    preProcess: srcText.original,
    innerHTML: ``,
    columns: 80, // assume 80 for all text formats
    rows: 0,
  }
  const rev1Text = {
    charSet: ``,
    codePage: {},
    innerHTML: ``,
    length: 0,
    sessCharSet: ``,
  }
  const tfi = {//${newDOM.columns} ${newDOM.rows} ${humaniseFS(srcMeta.length)}
    template: `<span title="Columns of text">♥</span> x <span title="Lines of text">♦</span> \
<span title="Number of characters contained in the text">♣</span> -`,
    ansi: `<span id="h-doc-fmt" title="ECMA-48/ANSI X3.64 presentation control and cursor functions">ANSI</span>`,
    body: ``,
    colors: ``,
    fontName: `<span title="Font family used for display" id="h-doc-font-family" class="capitalize">♠</span>`,
    palette: `<strong id="h-palette" title="Switch ANSI ${chrome.i18n.getMessage(`color`)} palettes">IBM</strong> palette,`,
    render: `<strong id="h-text-rend" title="Switch between text render methods">??</strong>`,
    sauce: ``,
    tail: ``,
    errs: 0, // unknown csi
    oths: 0, // other, ignored csi
  }
  let colorLink
  let ecma48Data = {}

  // options and store them as synchronous sessionStorage
  chrome.storage.local.get([`textDosCtrlCodes`], function (result) {
    // display DOS CP-437 characters that normally function as C0 control functions
    const r = result.textDosCtrlCodes
    if (typeof r !== `boolean`) {
      checkErr(`Could not obtain the required textDosCtrlCodes setting to apply the display of DOS control code symbols`, true)
    } else localStorage.setItem(`textDosCtrlCodes`, r)
  })

  /* SAUCE - Standard Architecture for Universal Comment Extensions */
  // http://www.acid.org/info/sauce/sauce.htm
  const sauce00 = findSAUCE(srcText, srcMeta.length)
  switch (sauce00.version) {
    case `00`:
      tfi.sauce = formatSAUCE(sauce00) // creates HTML
      // remove sauce record from text
      if (sauce00.position.comntIndex > 0 && sauce00.position.comntIndex < sauce00.position.sauceIndex) {
        newDOM.preProcess = srcText.original.slice(0, sauce00.position.comntIndex)
      }
      else newDOM.preProcess = srcText.original.slice(0, sauce00.position.sauceIndex)
      break
    default:
      newDOM.preProcess = srcText.original
  }
  //console.log(sauce00)

  // document and page encoding
  if (srcMeta.BOM.length > 0) srcMeta.encoding = srcMeta.BOM
  // determine character set
  rev1Text.charSet = charSetFind(sessionStorage.getItem(`transcode`), newDOM)
  rev1Text.codePage = new HumaniseCP(rev1Text.charSet)
  // rebuild text with new character encoding
  rev1Text.innerHTML = charSetRebuild(rev1Text.charSet, newDOM)
  // count number of rows (lines)
  newDOM.rows = rev1Text.innerHTML.trim().split(/\r\n|\r|\n/).length
  if (rev1Text.innerHTML.length < newDOM.preProcess.length) {
    // the converted text should be at least the same size as the original
    checkErr(`Text did not convert correctly, the size of parsed text is ${rev1Text.innerHTML.length} characters, it is smaller than original text of ${newDOM.preProcess.length} characters`, true)
  }

  // handle non-ASCII text formatting
  const theme = new ListRGBThemes()
  switch (srcMeta.format) {
    case `ecma48`: // ECMA-48 aka ANSI encoded text
      console.info(`%c%cECMA-48%c control sequences in use`, `font-weight: bold`, `font-weight: bold; color: green`, `font-weight: bold; color: initial`)
      //console.time(`BuildEcma48()`)
      // These variables are isolated to the RetroTxt content scripts
      ecma48Data = new BuildEcma48(rev1Text.innerHTML, sauce00, false, false)
      //console.timeEnd(`BuildEcma48()`)
      newDOM.columns = ecma48Data.columns
      newDOM.rows = ecma48Data.rows
      rev1Text.innerHTML = ecma48Data.innerHTML
      tfi.oths = ecma48Data.otherCodesCount
      tfi.errs = ecma48Data.unknownCount
      // handle Set/Restore Mode functionality
      // font override
      sessionStorage.removeItem(`fontOverride`)
      if (ecma48Data.font === undefined) {
        checkErr(`'ecma48Data.font' should have returned a font value or 'null' but instead returned ${ecma48Data.font}`)
      } else if (ecma48Data.font !== null) {
        //console.log(`Set mode font override to ${ecma48Data.font.toUpperCase()}`)
        changeFont(ecma48Data.font, newDOM.pre) // this needs to run before setting the sessionStorage
        sessionStorage.setItem(`fontOverride`, `true`)
      }
      // color depth
      //ecma48Data.colorDepth = 8 // uncomment to test
      switch (ecma48Data.colorDepth) {
        case 8: // force the use of the xterm palette
          theme.color = 2
          document.getElementById(`retrotxt-4bit`).href = chrome.extension.getURL(`css/text_colors_${theme.colors[theme.color]}.css`)
          tfi.palette = `<span id="h-palette">xterm</span> 8-bit palette,`
          break
        case 4:
          document.getElementById(`retrotxt-8bit`).remove()
          break
        case 1:
          document.getElementById(`retrotxt-4bit`).remove()
          document.getElementById(`retrotxt-8bit`).remove()
          tfi.colors = `${tfi.colors}in ASCII like, 2 ${chrome.i18n.getMessage(`color`)}s`
          break
        case 0:
          document.getElementById(`retrotxt-8bit`).remove()
          colorLink = document.getElementById(`retrotxt-4bit`)
          colorLink.href = chrome.extension.getURL(`css/text_colors_gray.css`)
          tfi.colors = `${tfi.colors}in monochrome, 16 ${chrome.i18n.getMessage(`color`)}`
          break
        default:
      }
      // iCE colors
      tfi.colors = `- ${tfi.palette} <span id="ice-colors-toggle" title="Toggle">iCE colors <strong>??</strong></span> `
      if (ecma48Data.iceColors === true) {
        dom.head.appendChild(buildLinksToCSS(`css/text_colors_${theme.colors[theme.color]}-ice.css`, `retrotxt-4bit-ice`)) // child 4
      }
      break
    case `pcboard`: // converts PCBoard and WildCat! BBS colour codes into HTML and CSS
    case `wildcat`:
      console.info(`%c%c${chrome.i18n.getMessage(srcMeta.format)}%c ${chrome.i18n.getMessage(`color`)} codes`, `font-weight: bold`, `font-weight: bold; color: green`, `font-weight: bold; color: initial`)
      rev1Text.innerHTML = BuildBBS(rev1Text.innerHTML, srcMeta.format, false)
    // break omitted
    default: // plain and ASCII text
      // append a blinking cursor to the text
      // do not trim text or the layouts of ASCII files may break
      rev1Text.innerHTML = `${rev1Text.innerHTML}<span class="dos-cursor">_</span>`
  }

  // inject text into the browser tab
  newDOM.pre.innerHTML = rev1Text.innerHTML

  // reveal the text font information header
  chrome.storage.local.get(`textFontInformation`, function (result) {
    // reveal or hide header?
    switch (result.textFontInformation) {
      case false: newDOM.header.style.display = `none`; break
      case true: newDOM.header.style.display = `block`; break
      default: checkErr(`Could not obtain the required textFontInformation setting to reveal text font information`, true)
    }
    // text render
    const textRender = document.getElementById(`h-text-rend`)
    if (textRender !== null) {
      textRender.onclick = function () {
        switch (this.innerHTML) {
          case `Normal`: changeTextEffect(`smeared`, dom.body.childNodes[2]); break
          case `Smeared`: changeTextEffect(`shadowed`, dom.body.childNodes[2]); break
          default: changeTextEffect(`normal`, dom.body.childNodes[2])
        }
      }
    }
    // palette
    const palette = document.getElementById(`h-palette`)
    let link = ``
    if (palette !== null && ecma48Data.colorDepth === 4) {
      palette.onclick = function () {
        const iceCSS = document.getElementById(`retrotxt-4bit-ice`)
        let theme = new ListRGBThemes()
        switch (this.innerHTML) {
          case `IBM`:
            palette.innerHTML = `xterm`
            theme.color = 2
            break
          case `xterm`:
            palette.innerHTML = `${chrome.i18n.getMessage(`Gray`)}`
            theme.color = 0
            break
          default:
            palette.innerHTML = `IBM`
            theme.color = 1
        }
        // update palette link
        link = chrome.extension.getURL(`css/text_colors_${theme.colors[theme.color]}.css`)
        document.getElementById(`retrotxt-4bit`).href = link
        // update ice colors link
        if (iceCSS !== null) {
          link = chrome.extension.getURL(`css/text_colors_${theme.colors[theme.color]}-ice.css`)
          iceCSS.href = link
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
      let theme = new ListRGBThemes()
      switch (palette.innerHTML) {
        case `IBM`: theme.color = 1; break
        case `xterm`: theme.color = 2; break
        default: theme.color = 0
      }
      dom.head.appendChild(buildLinksToCSS(`css/text_colors_${theme.colors[theme.color]}-ice.css`, `retrotxt-4bit-ice`)) // child 4
      iceColors.childNodes[1].innerHTML = `On`
    }
    function iceColorsOff() {
      let iceCSS = document.getElementById(`retrotxt-4bit-ice`)
      if (iceCSS !== null) iceCSS.remove()
      iceColors.childNodes[1].innerHTML = `Off`
    }

  })
  // code page details for text font info.
  if (srcMeta.chrSet !== null) {
    let dcp = srcMeta.chrSet.replace(`-`, ``).toUpperCase()
    let dcpAttr = ``
    rev1Text.codePage.text = rev1Text.codePage.text.replace(`CP-`, `CP`)
    dcp = dcp.replace(`WINDOWS`, `CP`) // abbreviate WINDOWS1252 to CP1252 etc.
    if ([`CP1250`, `CP1251`, `CP1252`, `ISO8859-5`, `UTF8`, `UTF16LE`, `UTF16BE`].includes(dcp) === false) dcpAttr = `class="unknown"` // note: header has CSS filter: invert(100%); applied
    tfi.body = `${tfi.body} <span title="Document encoding set by the browser"${dcpAttr}>${dcp}</span> → \
<span title="Unicode ≈ ${rev1Text.codePage.title}">${rev1Text.codePage.text}</span>`
  }
  // text render & font name
  tfi.tail = `- ${tfi.render} ${tfi.fontName}`
  // content format
  switch (srcMeta.format) {
    case `ecma48`:
      tfi.tail = `${tfi.ansi} ${tfi.tail}`
      if (tfi.colors.length > 0) tfi.tail = `${tfi.tail} ${tfi.colors}`
      // ecma48 errors
      if (tfi.oths > 0 || tfi.errs > 0) {
        let cnt = tfi.oths + tfi.errs
        let ic = ``
        if (cnt > 4) ic = `${ic}<u>`
        if (tfi.oths > 0) {
          ic = `${ic}${tfi.oths} unsupported function`
          if (tfi.oths > 1) ic = `${ic}s`
        }
        if (tfi.oths > 0 && tfi.errs > 0) ic = `${ic} and `
        if (tfi.errs > 0) {
          ic = `${ic}${tfi.errs} unknown control`
          if (tfi.errs > 1) ic = `${ic}s`
        }
        ic = `${ic} found`
        if (cnt > 4) ic = `${ic}, this display is inaccurate</u>`
        tfi.tail = `${tfi.tail}</div><div id="h-doc-fmt">${ic}</div><div>`
      }
      break
    case `pcboard`:
    case `wildcat`:
      tfi.tail = `<span id="h-doc-fmt" title="Special bulletin board system, text formatting"> \
          ${chrome.i18n.getMessage(srcMeta.format)}</span> ${tfi.tail}`
      break
    default: // ASCII & NFO
      newDOM.columns = findPageColumns(newDOM.preProcess) // count the number of text columns
      newDOM.pre.style.width = reset.width // lock centring alignment to 640px columns
  }
  // append to for text font info.
  if (tfi.tail.length > 0) tfi.body = `${tfi.body} ${tfi.tail}`
  // append SAUCE records for text font info.
  if (tfi.sauce.length > 0) tfi.body = `${tfi.body}${tfi.sauce} `

  // refresh header data before displaying
  let ti = tfi.template
  ti = ti.replace(`♥`, `${newDOM.columns}`)
  ti = ti.replace(`♦`, `${newDOM.rows}`)
  ti = ti.replace(`♣`, `${humaniseFS(srcMeta.length)}`)
  if (typeof ecma48Data.font !== `undefined` && ecma48Data.font !== null) {
    tfi.body = tfi.body.replace(`♠`, `${ecma48Data.font.toUpperCase()}`)
  } else {
    chrome.storage.local.get([`retroFont`], function (r) {
      if (r.retroFont === undefined) checkErr(`Could not obtain the required retroFont setting to apply the header`, true)
      else {
        let element = window.document.getElementById(`h-doc-font-family`)
        element.innerHTML = r.retroFont.toUpperCase()
      }
    })
  }
  // update text font information header using new HTML
  tfi.body = `${ti}${tfi.body}`
  newDOM.header.innerHTML = tfi.body

  // create red alert message at the top of the page
  if (window.checkedErr !== undefined && window.checkedErr === true) displayErr(true)
  else displayErr(false) // hide from view

  // hide original unconverted text
  dom.pre0.style.display = `none`

  // insert new tags into HTML DOM
  newDOM.main.appendChild(newDOM.pre)
  dom.body.insertBefore(newDOM.header, dom.pre0)
  dom.body.insertBefore(newDOM.main, dom.pre0)

  // hide spin loader
  runSpinLoader(false)
}