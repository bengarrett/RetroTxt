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
  let err = ``
  switch (e) {
    case `boolean`:
      err = `argument '${name}' should be a 'boolean' (true|false) instead of a '${typeof a}'`
      break
    case `number`:
      err = `argument '${name}' should be a 'number' (unsigned) instead of a '${typeof a}'`
      break
    case `string`:
      err = `argument '${name}' should be a 'string' of text instead of a '${typeof a}'`
      break
    default:
      err = `argument '${name}' needs to be a '${e}' instead of a '${typeof a}'`
      break
  }
  checkErr(err)
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
      if (e !== `1` && e !== 1) err = `${err}s`
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
      break
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
      case `blink`:
        ext = `${ext} Extensions page (chrome://extensions)`
        break
      case `gecko`:
        ext = `${ext} Add-ons manager page (about:addons)`
        break
      default:
        break
    }
    // build error alert
    let dom = new FindDOM()
    div = document.createElement(`div`)
    div.innerHTML = `Sorry, RetroTxt has run into a problem. \
Please refresh <kbd>F5</kbd> this tab to attempt to fix the problem. \
For more information press <kbd>Control</kbd>+<kbd>Shift</kbd>+<kbd>i</kbd> to open the <strong>Console</strong>.<br>\
If the problem continues, try ${ext} or <a href="${chrome.i18n.getMessage(`url_issues`)}" title="On the RetroTxt GitHub repository">see if it has an issue report</a>.`
    div.id = `checkErr`
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
  this.sets = [`US_ASCII`, `CP437`, `8859_5`, `CP1252`, `8859_1`, `8859_15`, `UTF8`, `UTF_ERR`]
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
  this.avoidFileExtensions = html.concat(images, other)
  // Text options
  this.columns = 80
  this.width = `640px`
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
  this.colors = [`gray`, `vga`, `xterm`]
  this.color = 1 // default coloured theme 0 = grey-scale, 1 = IBM-PC VGA, 2 = xterm
}

function BuildFontStyles(ff = `vga8`)
// Return CSS3 styles to use with the font
// @ ff  CSS font family class name
{
  if (typeof ff !== `string`) checkArg(`ff`, `string`, ff)
  if (ff.length < 1) checkRange(`ff`, `length`, `1`, ff.length)

  // most of the styling is located in /css/retotxt.css
  // Humanise font family name
  let str = ff.toUpperCase()
  str = str.replace(`-2X`, ` (wide)`)
  str = str.replace(`-2Y`, ` (narrow)`)
  str = str.replace(`CGATHIN`, `CGA Thin`)
  str = str.replace(`TANDYNEW`, `Tandy`)
  // properties
  this.family = ff
  this.string = str
}

function buildLinksToCSS(f = ``, i = ``)
// Creates a LINK tag used to load a style sheet
// @f   CSS file name
// @i   ID name to apply to link tag
{
  if (typeof f !== `string`) checkArg(`f`, `string`, f)

  let l = document.createElement(`link`)
  if (i.length > 0) l.id = i
  l.href = chrome.extension.getURL(f)
  l.type = `text/css`
  l.rel = `stylesheet`
  return l
}

function changeTextScanlines(s = true, elm, color)
// Applies CSS3 mock scan line effects to an element
// @s     required boolean to enable or disable text show
// @elm   required HTML DOM element object to apply shadow effect to
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
      chrome.storage.local.get([`retroColor`], function (r) {
        if (r.retroColor === undefined) checkErr(`Could not obtain the required retroColor setting to apply the scanlines effect`, true)
        else applyStyle(r.retroColor)
      })
    } else applyStyle(r)
  }
}

function changeTextShadow(s = true, elm, color)
// Applies CSS3 text shadowing effects to an element
// @s     required boolean to enable or disable text show
// @elm   required HTML DOM element object to apply shadow effect to
// @color required CSS colour class when we already know the new colour values
{
  if (typeof s !== `boolean`) checkArg(`s`, `boolean`, s)
  if (typeof elm !== `object`) checkArg(`elm`, `object`, elm)
  if (elm.classList === null) return // error

  // This removes any class names that use '-shadow' as their suffix
  for (const item of elm.classList) {
    if (item.endsWith(`-shadowed`) === true) elm.classList.remove(item)
  }
  // do nothing as all shadow classes have already been removed
  if (s === false) return
  // use colours provided by the colour parameter
  else if (typeof color === `string`) {
    // apply shadow class
    elm.classList.add(`${color}-shadowed`)
  }
  // use colours fetched from chrome's storage (default)
  else {
    const r = localStorage.getItem(`retroColor`)
    if (typeof r !== `string`) {
      chrome.storage.local.get([`retroColor`], function (r) {
        if (r.retroColor === undefined) checkErr(`Could not obtain the required retroColor setting to apply the text shadow effect`, true)
        else elm.classList.add(`${r.retroColor}-shadowed`)
      })
    } else elm.classList.add(`${r}-shadowed`)
  }
}

function findControlSequences(s = ``)
// Scans a text for supported legacy BBS colour codes
// @s   String of text to scan
{
  if (typeof s !== `string`) checkArg(`s`, `string`, s)

  const t = s.slice(0, 5).toUpperCase() // only need the first 5 characters
  let a, b, c
  // ECMA-48 control sequences (4/Feb/2017: despite the performance hit, need to run this first to avoid false detections)
  if (t.trim().charCodeAt(0) === 27 && t.trim().charCodeAt(1) === 91) return `ecma48` // (16/Feb/2017: trim is needed for some ANSIs)
  c = s.indexOf(`${String.fromCharCode(27)} ${String.fromCharCode(91)} `) // indexOf is the fastest form of string search
  if (c > 0) return `ecma48`
  // make sure first char is an @-code
  else if (t.charAt(0) === `@`) {
    // match pcboard `@Xxx` codes
    if (t.charAt(1) === `X`) {
      a = t.charCodeAt(2) // get Unicode indexes of 2nd + 3rd chars
      b = t.charCodeAt(3)
      // index range 48-70 eq 0-9 A-F
      if (a >= 48 && b >= 48 && a <= 70 && b <= 70) return `pcboard`
    } else if (s.startsWith(`@CLS@`)) {
      return `pcboard`
    }
    // match wildcat `@xx @` codes
    else if (t.charAt(3) === `@`) {
      a = t.charCodeAt(1) // get Unicode indexes of 1st + 2nd chars
      b = t.charCodeAt(2)
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
    let browser = `blink` // Chrome compatible
    if (gecko === true) browser = `gecko` // Firefox compatible
    return browser
  }
}

function HumaniseCP(code = ``)
// Humanises transcode ids into a short and longer title
// @code Key name for text transcode
{
  let text = ``, title = ``
  switch (code) {
    case `CP437`:
    case `8859_5`:
      text = `CP-437`
      title = `IBM/MS-DOS Code Page 437`
      break
    case `CP1252`:
      text = `Windows-1252`
      title = `Code Page 1252 commonly used in legacy Microsoft Windows systems`
      break
    case `8859_1`:
      text = `ISO-8859-1`
      title = `ISO-8859 Part 1: Latin alphabet No. 1 alternatively known as ECMA-94`
      break
    case `8859_15`:
      text = `ISO-8859-15`
      title = `ISO-8859 Part 15: Latin alphabet No. 9`
      break
    case `UTF_ERR`:
      text = `Unsupported UTF-8 4-bit encoding`
      title = `Currently RetroTxt only supports Unicode characters between 0-65535(0000-FFFF) `
      break
    case `UTF8`:
      text = `UTF-8`
      title = `Universal Coded Character Set 8-bit`
      break
    case `US_ASCII`:
      text = `US-ASCII`
      title = `Plain text, alternatively known as ASA X3.4, ANSI X3.4, ECMA-6, ISO/IEC 646`
      break
    default:
      checkErr(`'${code}' is not a valid transcode identifier`, true)
      return
  }
  this.text = text
  this.title = title
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
  const units = si
    ? [`kB`, `MB`]
    : [`KiB`, `MiB`]
  if (Math.abs(bytes) < thresh) return `${bytes}B`
  let u = -1
  do {
    bytes /= thresh
    ++u
  } while (Math.abs(bytes) >= thresh && u < units.length - 1)
  return `${Math.round(bytes * 10) / 10}${units[u]}`
}

function runSpinLoader(s = true)
// Injects a loading spinner to the tab
// It's not really useful due to the way browsers handle the DOM rendering,
// but may pop-up if the browser temporarily freezes
// @s state, `true` to enable, `false` to disable
{
  if (typeof s !== `boolean`) checkArg(`s`, `boolean`, s)

  let spinner = window.document.getElementById(`spin-loader`)
  switch (s) {
    case true:
      if (spinner === null) {
        let headTag = document.querySelector(`head`)
        spinner = document.createElement(`div`)
        spinner.setAttribute(`id`, `spin-loader`)
        spinner.setAttribute(`class`, `loader`)
        spinner.setAttribute(`style`, `border:100px solid red`)
        spinner.setAttribute(`style`, `display:block`)
        document.body.appendChild(spinner)
        let stylesheet = buildLinksToCSS(`css/retrotxt_loader.css`, `retrotxt-loader`)
        headTag.appendChild(stylesheet)
      } else {
        spinner.setAttribute(`style`, `display:block`)
      }
      break
    case false:
      if (spinner !== null) {
        spinner.setAttribute(`style`, `display:none`)
      }
      break
  }
}
