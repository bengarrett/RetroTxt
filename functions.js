// filename: functions.js
//
// These functions are shared between all pages including
// eventpage.js options.js and text*.js
'use strict'

/*global chrome FindDOM*/

// error flag used by checkErr()
window.checkedErr = false // we need to prefix `window.` to the var name when in strict mode

function checkArg(name = ``, e = ``, a)
// Function argument checker for function.js, retrotxt.js and text_*.js
// @name  The argument name that failed
// @e     The expected argument type or value
// @a     The actually argument used
{
  switch (e) {
    case `boolean`: return checkErr(`argument '${name}' should be a 'boolean' (true|false) instead of a '${typeof a}'`)
    case `number`: return checkErr(`argument '${name}' should be a 'number' (unsigned) instead of a '${typeof a}'`)
    case `string`: return checkErr(`argument '${name}' should be a 'string' of text instead of a '${typeof a}'`)
    default: return checkErr(`argument '${name}' needs to be a '${e}' instead of a '${typeof a}'`)
  }
}

function checkRange(name = ``, issue = ``, e, a)
// Error handler for function.js, retrotxt.js and text_*.js
// @name  The argument name that failed
// @e     The expected argument type or value
{
  let err = ``
  switch (issue) {
    case `length`:
      err = `the number of characters '${a}' used for the argument '${name}' is too short, it needs to be at least '${e}' character`
      if (e !== `1` && e !== 1) err += `s`
      break
    case `range`:
      err = `the value '${a}' for the argument '${name}' is out of range, it needs to be either '${e.join(`, `)}'`
      break
    case `small`:
      err = `the value '${a}' for the argument '${name}' is too small, it needs to be at least '${e}' or greater`
      break
    case `large`:
      err = `the value '${a}' for the argument '${name}' is too large, it needs to be at most '${e}' or less`
      break
    default:
  }
  checkErr(err)
}

function checkErr(err, log = false)
// Error handler for function.js, retrotxt.js and text_*.js
// @err   String containing the error
// @log   When true, err are logged to the browser Console
//        Otherwise checkErr throws a JS exception and aborts
{
  if (err !== undefined) {
    runSpinLoader(false)
    if (window.checkedErr !== undefined) window.checkedErr = true // If the window.document is not yet built, tell RetroTxt to set display='block' on the red alert message
    if (typeof qunit === `undefined`) displayErr()
    if (log === false) {
      try { throw new Error(err) }
      catch (e) { console.error(e) }
    }
    else console.warn(err)
  }
}

function displayErr(s = true)
// Creates a red alert message at the top of the user's active browser page
// @s   State, true or false to reveal or hide
{
  let div = window.document.getElementById(`checkErr`) // div element containing error alert
  const link = window.document.getElementById(`retrotxt-styles`)
  if (div === null) {
    let ext = `reloading the RetroTxt extension on the `
    // build URI to browser's extensions
    switch (findEngine()) {
      case `blink`: ext += ` Extensions page (chrome://extensions)`; break
      case `gecko`: ext += ` Add-ons manager page (about:addons)`; break
    }
    // build error as a html node
    const err = document.createElement(`div`)
    const f5 = document.createElement(`kbd`)
    f5.appendChild(document.createTextNode(`F5`))
    const ctrl = document.createElement(`kbd`)
    ctrl.appendChild(document.createTextNode(`Control`))
    const shift = document.createElement(`kbd`)
    shift.appendChild(document.createTextNode(`Shift`))
    const ikey = document.createElement(`kbd`)
    ikey.appendChild(document.createTextNode(`i`))
    const cons = document.createElement(`strong`)
    cons.appendChild(document.createTextNode(`Console`))
    const br = document.createElement(`br`)
    const issue = document.createElement(`a`)
    issue.href = chrome.i18n.getMessage(`url_issues`)
    issue.title = `On the RetroTxt GitHub repository`
    issue.appendChild(document.createTextNode(`see if it has an issue report`))
    err.appendChild(document.createTextNode(`Sorry, RetroTxt has run into a problem. Please refresh `))
    err.appendChild(f5)
    err.appendChild(document.createTextNode(` this tab to attempt to fix the problem. For more information press `))
    err.appendChild(ctrl)
    err.appendChild(shift)
    err.appendChild(ikey)
    err.appendChild(document.createTextNode(` to open the `))
    err.appendChild(cons)
    err.appendChild(document.createTextNode(`.`))
    err.appendChild(br)
    err.appendChild(document.createTextNode(`If the problem continues, try ${ext} or `))
    err.appendChild(issue)
    err.appendChild(document.createTextNode(`.`))
    div = err
    div.id = `checkErr`
    const dom = new FindDOM()
    // inject CSS link into the page
    if (link === null) dom.head.appendChild(buildLinksToCSS(`css/retrotxt.css`, `retrotxt-styles`))
    // inject div
    dom.body.insertBefore(div, dom.pre0)
  }
  // display error alert
  if (s === false) div.style.display = `none`
  else div.style.display = `block`
}

function ListCharacterSets()
// List common ASCII C0 decimal character values
// Default list of key names for text transcoding
{
  // C0 common characters
  // 8 Backspace, 9 Horizontal tab, 10 Line feed (line break), 12 Form feed (page break)
  // 13 Carriage return, 26 End of file (not a C0 standard but used in MS-DOS)
  this.C0common = [8, 9, 10, 12, 13, 26]
  this.sets = [`out_8859_1`, `out_8859_15`, `out_CP1252`, `out_US_ASCII`, `out_UTF8`, `src_8859_5`, `src_CP1252`, `out_CP437`]
}

function ListDefaults()
// Default lists of data used by the Options and also parsing online resources
{
  // A list of domains that RetroTxt will run on in the background.
  // These can be modified by the user in the Options.
  this.autoDomains = [`defacto2.net`, `gutenberg.org`, `scene.org`, `textfiles.com`, `uncreativelabs.net`]
  // These domains will always be ignored, as RetroTxt breaks their functionality
  this.avoidDomains = [`feedly.com`, `github.com`]
  // File extensions that RetroTxt will run on in the background when using file://
  this.autoFileExtensions = [`asc`, `ascii`, `ans`, `ansi`, `diz`, `faq`, `nfo`, `pcb`, `text`, `txt`]
  // File extensions of files to ignore when using file:///
  const html = [`css`, `htm`, `html`, `js`, `json`, `md`, `xml`, `yml`],
    images = [`apng`, `bmp`, `dib`, `gif`, `jpeg`, `jpg`, `ico`, `svg`, `svgz`, `png`, `tiff`, `webp`, `xbm`],
    other = [`ini`, `pdf`]
  this.avoidFileExtensions = [...html, ...images, ...other] // join arrays
  // Text options
  this.columns = 80
  this.width = `100%` //this.width = `640px`
}

function ListRGBThemes()
// CSS classes that point to RGB based themes in css/text_colors.css
{
  // 1-bit themes
  this.msdos = `theme-msdos`
  this.web = `theme-web`
  this.amiga = `theme-amiga`
  this.appleii = `theme-appleii`
  this.atarist = `theme-atarist`
  this.c64 = `theme-c64`
  // list of 4-bit themes (ECMA-48, PCBoard, WildCat!)
  this.colors = [`gray`, `vga`, `xterm`, `cga_0`, `cga_1`] // dynamic partial filenames used by iceColorsOn() `textContent`
  this.color = 1 // default coloured theme 0 = grey-scale, 1 = IBM-PC VGA, 2 = xterm, 3 = IBM-PC CGA high (yellow), 4 = IBM-PC CGA low (magenta)
}

function BuildFontStyles(ff = `vga8`)
// Return CSS3 styles to use with the font
// @ ff  CSS font family class name
{
  if (typeof ff !== `string`) checkArg(`ff`, `string`, ff)
  if (ff.length < 1) checkRange(`ff`, `length`, `1`, ff.length)

  // most of the styling is located in /css/retotxt.css
  // properties
  this.family = ff
  this.string = handleFontName(ff)
}

function handleFontName(font)
// Humanise font family name
{
  const f = font.toUpperCase()
  switch (f) {
    case `APPLEII`: return `Apple II`
    case `ATARIST`: return `Atari ST`
    case `C64`: return `PETSCII`
    case `TOPAZA500`: return `Topaz`
    case `TOPAZPLUSA500`: return `Topaz+`
    case `TOPAZA1200`: return `Topaz 2`
    case `TOPAZPLUSA1200`: return `Topaz+ 2`
    case `MICROKNIGHT`: return `MicroKnight`
    case `MICROKNIGHTPLUS`: return `MicroKnight+`
    case `P0TNOODLE`: return `P0T-NOoDLE`
    case `PS24`: return `PS/2 (thin 4)`
    case `MONA`: return `Mona`
    case `MOSOUL`: return `mOsOul`
    case `MONOSPACE`: {
      if (findEngine() === `blink`) return `Fixed-width`
      else return `Monospace`
    }
    default: {
      let s = f
      s = s.replace(`-2X`, ` (wide)`)
      s = s.replace(`-2Y`, ` (narrow)`)
      s = s.replace(`CGATHIN`, `CGA Thin`)
      s = s.replace(`TANDYNEW`, `Tandy `)
      return s
    }
  }
}

function handleFontSauce(sauce = {}) {
  if (typeof sauce !== `object`) checkArg(`sauce`, `object`, sauce)
  const cfn = sauce.config.fontName.replace(/[^A-Za-z0-9 +/-]/g, ``) // clean-up malformed data
  const fn = cfn.split(` `)
  switch (sauce.version) {
    case `00`:
      switch (fn[0]) {
        case `IBM`:
          switch (fn[1]) {
            case `VGA`:
              if (sauce.config.letterSpacing === `10`) return `vga9` // 9 pixel font
              return `vga8` // 8 pixel font
            case `VGA50`: return `vgal50` // 8x8 (as no 9×8 font found)
            case `VGA25G`: return `vgalcd` // 8x19
            case `EGA`: return `ega8` // 8×14
            case `EGA43`: return `bios` // 'For the 8x8 font present in EGA/MCGA/VGA hardware, see the IBM PC BIOS'
          }
          break
        case `Amiga`:
          switch (fn[1]) {
            case `Topaz`: {
              switch (fn[2]) {
                case `1`: return `topazA500`
                case `1+`: return `topazplusA500`
                case `2`: return `topazA1200`
                case `2+`: return `topazplusA1200`
              }
              break
            }
            case `PoT-NOoDLE`:
            case `P0T-NOoDLE`: return `p0tnoodle`
            case `MicroKnight`: return `microknight`
            case `MicroKnight+`: return `microknightplus`
            case `mOsOul`: return `mosoul`
          }
          break
        case `C64`:
          switch (fn[2]) {
            case `unshifted`: case `shifted`:
              return `c64`
          }
          break
        case `Atari`: return `atascii` // Original ATASCII font (Atari 400, 800, XL, XE)
      }
  }
  return ``
}

function buildLinksToCSS(f = ``, i = ``)
// Creates a LINK tag used to load a style sheet
// @f   CSS file name
// @i   ID name to apply to link tag
{
  if (typeof f !== `string`) checkArg(`f`, `string`, f)
  if (typeof chrome.extension === `undefined`) {
    return console.error(`RetroTxt cannot continue as the WebExtension API is inaccessible.`)
  }

  const l = document.createElement(`link`)
  if (i.length > 0) l.id = i
  l.href = chrome.extension.getURL(f)
  l.type = `text/css`
  l.rel = `stylesheet`
  return l
}

async function changeTextScanlines(s = true, elm, color)
// Applies CSS3 mock scan line effects to an element
// @s     required boolean to enable or disable text show
// @elm   required HTML DOM element object to apply the scanline effect
// @color optional CSS colour class when we already know the new colour values
{
  if (typeof s !== `boolean`) checkArg(`s`, `boolean`, s)
  if (typeof elm !== `object`) checkArg(`elm`, `object`, elm)
  if (elm.classList === null) return // error

  function applyStyle(c) {
    if (typeof c === `string`) {
      // remove any existing scan lines
      elm.classList.remove(`scanlines-light`, `scanlines-dark`)
      if (c.endsWith(`-on-white`) || [`theme-windows`, `theme-appleii`].includes(c)) {
        elm.classList.add(`scanlines-light`)
      } else {
        elm.classList.add(`scanlines-dark`)
      }
    }
  }

  // if s is false then disable the style
  if (s === false) {
    // removing class that do not exist doesn't throw errors
    elm.classList.remove(`scanlines-light`, `scanlines-dark`)
  }
  // use colours provided by the colour parameter
  else if (typeof color === `string`) {
    applyStyle(color)
  }
  // use colours fetched from the browser's storage (default)
  else {
    const r = localStorage.getItem(`retroColor`)
    if (typeof r !== `string`) {
      chrome.storage.local.get([`retroColor`], r => {
        if (r.retroColor === undefined) checkErr(`Could not obtain the required retroColor setting to apply the scanlines effect`, true)
        else applyStyle(r.retroColor)
      })
    } else applyStyle(r)
  }
}

async function changeTextEffect(s = `normal`, elm, color)
// Applies CSS3 text effects to an element
// @s     required string used to switch and disable effects
// @elm   required HTML DOM element object to apply shadow effect to
// @color optional CSS colour class when we already know the new colour values
{
  if (typeof s !== `string`) checkArg(`s`, `string`, s)
  if (typeof elm !== `object`) checkArg(`elm`, `object`, elm)
  if (elm.classList === null) return // error

  // This removes any preexisting text effect class names from the element
  for (const item of elm.classList) {
    if (item.endsWith(`-shadowed`) === true) elm.classList.remove(item)
    if (item === `text-smeared`) elm.classList.remove(item)
  }
  switch (s) {
    case `shadowed`:
      // use colours provided by the colour parameter
      if (typeof color === `string`) {
        // apply shadow class
        elm.classList.add(`${color}-shadowed`)
      }
      // use colours fetched from chrome's storage (default)
      else {
        const r = localStorage.getItem(`retroColor`)
        if (typeof r !== `string`) {
          chrome.storage.local.get([`retroColor`], r => {
            if (r.retroColor === undefined) checkErr(`Could not obtain the required retroColor setting to apply the text shadow effect`, true)
            else elm.classList.add(`${r.retroColor}-shadowed`)
          })
        } else elm.classList.add(`${r}-shadowed`)
      }
      break
    case `smeared`:
      elm.classList.add(`text-smeared`)
      break
    default: // 'normal' do nothing as the text effects have already been removed
  }
  const textRender = document.getElementById(`h-text-rend`)
  if (textRender !== null) {
    textRender.textContent = `${s.charAt(0).toUpperCase()}${s.slice(1)}`
  }
}

function findControlSequences(s = ``)
// Scans a text for supported legacy BBS colour codes
// @s   String of text to scan
{
  if (typeof s !== `string`) checkArg(`s`, `string`, s)
  const t = s.trim().slice(0, 5).toUpperCase() // only need the first 5 characters
  // ECMA-48 control sequences (4/Feb/2017: despite the performance hit, need to run this first to avoid false detections)
  if (s.trim().charCodeAt(0) === 27 && s.trim().charCodeAt(1) === 91) return `ecma48` // (16/Feb/2017: trim is needed for some ANSIs)
  const c = s.indexOf(`${String.fromCharCode(27)}${String.fromCharCode(91)}`) // indexOf is the fastest form of string search
  if (c > 0) {
    return `ecma48`
  }
  // make sure first char is an @-code
  else if (t.charAt(0) === `@`) {
    // match pcboard `@Xxx` codes
    if (t.charAt(1) === `X`) {
      const a = t.charCodeAt(2) // get Unicode indexes of 2nd + 3rd chars
      const b = t.charCodeAt(3)
      // index range 48-70 eq 0-9 A-F
      if (a >= 48 && b >= 48 && a <= 70 && b <= 70) return `pcboard`
    } else if (t.startsWith(`@CLS@`)) {
      return `pcboard`
    } else if (t.charAt(3) === `@`) {
      // match wildcat `@xx @` codes
      const a = t.charCodeAt(1) // get Unicode indexes of 1st + 2nd chars
      const b = t.charCodeAt(2)
      if (a >= 48 && b >= 48 && a <= 70 && b <= 70) return `wildcat`
    }
  }
  // plain text (no codes detected)
  else return `plain`
}

function findEngine()
// Determine the user's browser engine
{
  if (chrome.runtime.getManifest().options_ui !== undefined && chrome.runtime.getManifest().options_ui.page !== undefined) {
    const manifest = chrome.runtime.getManifest().options_ui.page,
      gecko = manifest.startsWith(`moz-extension`, 0)
    if (gecko === true) return `gecko` // Firefox compatible
    return `blink` // Chrome compatible
  }
}

function HumaniseCP(code = ``)
// Humanises codepage ids into a short and longer title
// @code Key name for text codepage
{
  switch (code) {
    // text = `Windows-1251`
    // title = `Code Page 1252, Cyrillic script in legacy Microsoft Windows systems`
    // break
    case `src_CP1250`:
    case `src_CP1251`:
    case `src_CP1252`:
    case `src_8859_5`:
    case `out_CP437`:
      this.text = `CP-437`
      this.title = `IBM/MS-DOS Code Page 437`
      break
    case `out_CP1252`:
      this.text = `Windows-1252`
      this.title = `Code Page 1252 commonly used in legacy Microsoft Windows systems`
      break
    case `out_8859_1`:
      this.text = `ISO-8859-1`
      this.title = `ISO-8859 Part 1: Latin alphabet No. 1 alternatively known as ECMA-94`
      break
    case `out_8859_15`:
      this.text = `ISO-8859-15`
      this.title = `ISO-8859 Part 15: Latin alphabet No. 9`
      break
    case `out_UTF8`:
      this.text = `UTF-8`
      this.title = `Universal Coded Character Set 8-bit`
      break
    case `out_US_ASCII`:
      this.text = `US-ASCII`
      this.title = `Plain text, alternatively known as ASA X3.4, ANSI X3.4, ECMA-6, ISO/IEC 646`
      break
    default:
      checkErr(`'${code}' is not a valid transcode identifier`, true)
      return
  }
}

function humaniseFS(bytes = 0, si = 1024)
// Humanises numeric values of bytes into a useful string
// @bytes A numeric value of bytes
// @si    Binary (1000) [HD] or decimal (1024) [RAM] conversion
// Based on http://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable
{
  if (typeof bytes !== `number`) checkArg(`bytes`, `number`, bytes)
  if (typeof si !== `number`) checkArg(`si`, `number`, si)

  const thresh = si ? 1000 : 1024
  const units = si ? [`kB`, `MB`] : [`KiB`, `MiB`]
  if (Math.abs(bytes) < thresh) return `${bytes}B`
  let u = -1
  do {
    bytes /= thresh
    ++u
  } while (Math.abs(bytes) >= thresh && u < units.length - 1)
  return `${Math.round(bytes * 10) / 10}${units[u]}`
}

function ParseToChildren(s = ``)
// Parses a string to a DOM node object that can be used with the appendChild() method.
// This function is to avoid `UNSAFE_VAR_ASSIGNMENT` "Unsafe assignment to innerHTML" lint errors
{
  if (typeof s !== `string`) checkArg(`s`, `string`, s)
  // As parseFromString() creates a <body> element which we don't need.
  // We create a <div> container and as a work-around return its content
  s = `<div>${s}</div>`
  const parser = new DOMParser()
  const parsed = parser.parseFromString(s, `text/html`)
  const tag = parsed.getElementsByTagName(`div`)
  if (tag.length === 0) return checkErr(`DOMParser.parseFromString('${s}','text/html') did not build a HTML object containing a <div> tag`)
  return tag[0]
}

async function runSpinLoader(s = true)
// Injects a loading spinner to the tab
// It's not really useful due to the way browsers handle the DOM rendering,
// but may pop-up if the browser temporarily freezes
// @s state, `true` to enable, `false` to disable
{
  if (typeof s !== `boolean`) checkArg(`s`, `boolean`, s)

  const spinner = window.document.getElementById(`spin-loader`)
  switch (s) {
    case true:
      if (spinner === null) {
        const headTag = document.querySelector(`head`)
        const spinner = document.createElement(`div`)
        spinner.setAttribute(`id`, `spin-loader`)
        spinner.setAttribute(`class`, `loader`)
        spinner.setAttribute(`style`, `border: 100px solid red;`)
        spinner.setAttribute(`style`, `display: block;`)
        document.body.appendChild(spinner)
        const stylesheet = buildLinksToCSS(`css/retrotxt_loader.css`, `retrotxt-loader`)
        headTag.appendChild(stylesheet)
      } else {
        spinner.setAttribute(`style`, `display: block;`)
      }
      break
    case false:
      if (spinner !== null) {
        spinner.setAttribute(`style`, `display: none;`)
      }
      break
  }
}
