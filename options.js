// filename: options.js
//
// These functions are used exclusively by the Options dialogue.
'use strict'

/*global chrome checkRange changeTextEffect changeTextScanlines findEngine ListDefaults */

function checkArg(name = ``, e = ``, a)
// Function argument checker for options.js
// @name  The argument name that failed
// @e     The expected argument type or value
// @a     The actually argument used
{
  switch (e) {
    case `boolean`:
      checkErr(`argument '${name}' should be a 'boolean' (true|false) instead of '${typeof a}'`); break
    case `number`:
      checkErr(`argument '${name}' should be a 'number' (unsigned) '${typeof a}'`); break
    case `string`:
      checkErr(`argument '${name}' should be a 'string' of text instead of '${typeof a}'`); break
    default:
      checkErr(`argument '${name}' needs to be a '${e}' instead of '${typeof a}'`); break
  }
}

function checkErr(err)
// Error handler for options.js
// @err   String containing the error
{
  try { throw new Error(err) }
  catch (e) { console.error(`Failed to obtain the '${e}' setting`) }
  if (typeof qunit === `undefined`) {
    document.getElementById(`error`).style.display = `block`
    document.getElementById(`status`).style.display = `none`
  }
}

function switchTab(num) {
  // Get all elements with class="tabcontent" and hide them
  const tc = document.getElementsByClassName(`tabcontent`)
  for (let i = 0; i < tc.length; i++) {
    if (typeof tc[i].style.display !== `undefined`) {
      tc[i].style.display = `none`
    }
  }
  // Show the current tab, and add an "active" class to the button that opened the tab
  const btn = document.getElementById(`tab${num}`)
  if (typeof btn.style.display !== `undefined`) {
    btn.style.display = `block`
  }
}

// This runs whenever the Options dialogue is opened,
// or in Firefox/Gecko when the options tab is refreshed.
(function () {

  async function listenForFonts()
  // font selection listeners for the radio buttons
  {
    const status = document.getElementById(`status`)

    for (const radio of radios) {
      // radio click listener
      radio.onclick = function () { /* Arrow functions do not work with `this` vars */
        const fface = this.getElementsByTagName(`input`)[0]
        if (fface !== undefined) {
          status.textContent = `Saved font selection ${fface.value}`
          changeStorageFont()
        }
      }
      // radio mouseover listener
      radio.onmouseover = function () {
        const fface = this.getElementsByTagName(`input`)[0]
        if (fface !== undefined) {
          status.textContent = `Font ${fface.value}`
          changeFont(fface.value)
        }
      }
      // reset sample text when user's mouse leaves the font selection form
      const radioInput = document.getElementById(radio.htmlFor)
      document.getElementById(`font-form`).addEventListener(`mouseleave`, function () {
        if (radioInput !== null && radioInput.checked === true) {
          status.textContent = `Font ${radioInput.value}`
          changeFont(radioInput.value)
        }
      })
    }
  }

  async function listenForEffects()
  // text effect listeners for the radio buttons
  {
    const effects = document.forms.texteffects.getElementsByTagName(`label`)
    const status = document.getElementById(`status`)
    for (const effect of effects) {
      // radio click listener
      effect.onclick = function () {
        const texteffect = this.getElementsByTagName(`input`)[0].value
        status.textContent = `Saved ${texteffect} text effect`
        changeStorageEffect()
      }
      // radio mouseover listener
      effect.onmouseover = function () {
        if (this.getElementsByTagName(`input`).length <= 0) return // ignore labels with no radio inputs
        const effect = this.getElementsByTagName(`input`)[0].value
        const sample = document.getElementById(`sample-dos-text`)
        status.textContent = `Preview ${effect} text effect`
        switch (effect) {
          case `normal`: changeTextEffect(`normal`, sample); break
          case `shadowed`: changeTextEffect(`shadowed`, sample); break
          case `smeared`: changeTextEffect(`smeared`, sample); break
          default: checkErr(`textEffect`)
        }
      }
      // reset sample text when user's mouse leaves the effect selection form
      const radioInput = document.getElementById(effect.htmlFor)
      if (radioInput === null) continue
      document.getElementById(`effects-form`).addEventListener(`mouseleave`, () => {
        if (radioInput.checked === true) {
          const sample = document.getElementById(`sample-dos-text`)
          status.textContent = `Using ${radioInput.value} text effect`
          changeTextEffect(radioInput.value, sample)
        }
      })
    }
  }

  //checkErr(`Testing 1, 2, 3.`)

  // exit if running qunit tests
  if (typeof qunit !== `undefined`) return

  const engine = findEngine()

  runtimeInfo()

  // defaults and font, colour combinations
  const radios = document.forms.fonts.getElementsByTagName(`label`)

  // restore any saved options
  document.addEventListener(`DOMContentLoaded`, changeOnOptions)
  changeOnColors()
  changeOnFont()
  changeOnEffects()

  // apply regional English modifications
  changeI18nWord(`color`, `msg-color`) // color vs colour
  changeI18nWord(`center`, `msg-center`) // center vs centre
  document.getElementById(`gray-white-option`).textContent = chrome.i18n.getMessage(`gray_white_option`) // gray vs grey

  // font tabs
  document.getElementById(`btnTab1`).addEventListener(`click`, () => { switchTab(`1`) })
  document.getElementById(`btnTab2`).addEventListener(`click`, () => { switchTab(`2`) })
  document.getElementById(`btnTab3`).addEventListener(`click`, () => { switchTab(`3`) })
  document.getElementById(`btnTab4`).addEventListener(`click`, () => { switchTab(`4`) })
  switchTab(`1`) // default

  listenForFonts()
  listenForEffects()

  // colour selection listeners
  document.getElementById(`font-color`).addEventListener(`change`, function () {
    function findColorName(c) {
      if (typeof c !== `string`) checkArg(`c`, `string`, c)
      switch (c) {
        case `theme-amiga`: return `Amiga`
        case `theme-appleii`: return `Apple II`
        case `theme-atarist`: return `Atari ST`
        case `theme-c64`: return `Commodore 64`
        case `theme-msdos`: return `MS-DOS`
        default: return c.replace(/-/g, ` `)
      }
    }
    const status = document.getElementById(`status`)
    status.textContent = `Saved ${findColorName(this.value)} ${chrome.i18n.getMessage(`color`)} pair`
    buildColors(this.value)
    changeOnFont()
    changeStorageColors()
    changeOnEffects()
  })

  // line height selection events
  document.getElementById(`line-height`).addEventListener(`change`, function () {
    const status = document.getElementById(`status`)
    status.textContent = `Saved ${this.value} line height selection`
    changeStorageLineHeight()
  })

  // websites list
  document.getElementById(`run-web-urls-permitted`).addEventListener(`input`, function () {
    const status = document.getElementById(`status`)
    if (this.value.length === 0) {
      status.textContent = `Reset websites to defaults`
      const defaults = new ListDefaults()
      this.value = defaults.autoDomains.join(`;`)
    } else status.textContent = `Updated websites`
    changeStorageURLs()
  })

  // check-boxes
  document.getElementById(`text-font-information`).addEventListener(`change`, function () {
    localStorage.setItem(`textFontInformation`, this.checked)
    chrome.storage.local.set({ 'textFontInformation': this.checked })
  })
  document.getElementById(`center-alignment`).addEventListener(`change`, function () {
    localStorage.setItem(`textCenterAlignment`, this.checked)
    chrome.storage.local.set({ 'textCenterAlignment': this.checked })
  })
  document.getElementById(`dos-ctrl-codes`).addEventListener(`change`, function () {
    localStorage.setItem(`textDosCtrlCodes`, this.checked)
    chrome.storage.local.set({ 'textDosCtrlCodes': this.checked })
    const text = document.getElementById(`sample-dos-ctrls`)
    if (this.checked === true) text.style.display = `inline`
    else text.style.display = `none`
  })
  document.getElementById(`background-scanlines`).addEventListener(`change`, function () {
    localStorage.setItem(`textBgScanlines`, this.checked)
    chrome.storage.local.set({ 'textBgScanlines': this.checked })
    changeOnEffects()
  })
  document.getElementById(`ansi-ice-colors`).addEventListener(`change`, function () {
    localStorage.setItem(`textAnsiIceColors`, this.checked)
    chrome.storage.local.set({ 'textAnsiIceColors': this.checked })
  })
  document.getElementById(`run-web-urls`).addEventListener(`change`, function () {
    localStorage.setItem(`runWebUrls`, this.checked)
    chrome.storage.local.set({ 'runWebUrls': this.checked })
    const urlList = document.getElementById(`run-web-urls-permitted`)
    if (this.checked !== true) urlList.disabled = true
    else urlList.disabled = false
  })
  document.getElementById(`updated-notice`).addEventListener(`change`, function () {
    localStorage.setItem(`updatedNotice`, this.checked)
    chrome.storage.local.set({ 'updatedNotice': this.checked })
  })
  // local file access (file:/// scheme) and downloads file access
  if (typeof chrome.extension.isAllowedFileSchemeAccess !== undefined) {
    chrome.extension.isAllowedFileSchemeAccess(function (result) {
      // local file access
      if (result === true || engine === `gecko`) {
        document.getElementById(`run-file-urls`).addEventListener(`change`, function () {
          localStorage.setItem(`runFileUrls`, this.checked)
          chrome.storage.local.set({ 'runFileUrls': this.checked })
        })
      }
      // downloads file access [blink engine]
      if (result === true && engine === `blink`) {
        document.getElementById(`run-file-downloads`).addEventListener(`change`, function () {
          localStorage.setItem(`runFileDownloads`, this.checked)
          chrome.storage.local.set({ 'runFileDownloads': this.checked })
        })
      }
    })
  }

  // filter by extension installation type
  if (typeof chrome.management !== `undefined`) {
    chrome.management.getSelf(info => {
      const testLink = document.getElementById(`unittest`)
      switch (info.installType) {
        case `development`: testLink.style.display = `inline`; break // reveal developer links
      }
    })
  }

  // filter by support for isAllowedFileSchemeAccess
  // chrome.extension has no Edge, limited Firefox/Gecko support
  chrome.extension.isAllowedFileSchemeAccess(result => {
    function disableOption(checkbox = ``)
    // disable Options where the extension has not be granted permission
    // @checkbox Id of the checkbox to disable
    {
      const reason = `RetroTxt requires 'Allow access to file URLs' to be rechecked`
      const cb = document.getElementById(`${checkbox}`)
      const i = document.getElementById(`${checkbox}-icon`)
      cb.checked = false
      cb.disabled = true
      cb.title = reason
      i.style = `color: rgba(0, 0, 0, 0.26);` // the `md-inactive` class doesn't seem to work here
      i.title = reason
      localFileAccess.style = `pointer-events: none; cursor: default; text-decoration: none;`
    }

    function hideOption(checkbox = ``)
    // hide UI from the Options dialogue
    // @checkbox Id of the checkbox to hide
    {
      if (typeof checkbox !== `string`) checkArg(`checkbox`, `string`, checkbox)
      const d = document.getElementById(`${checkbox}-div`)
      d.style = `display: none;`
    }
    if (result === false && engine !== `gecko`) {
      disableOption(`run-file-urls`)
    }
    if (result === false) {
      disableOption(`run-file-downloads`)
    }
    if (engine !== `blink`) {
      hideOption(`run-file-downloads`)
    }
  })

  // filter available extension options and styling by browser engine and
  // WebExtension API support
  const localFileAccess = document.getElementById(`run-file-urls-link`)

  // filter by the web browser's render engine
  const link = document.createElement(`link`)
  switch (engine) {
    case `gecko`:
      // file:///c: href doesn't work in Firefox/Gecko
      localFileAccess.removeAttribute(`href`)
      localFileAccess.removeAttribute(`target`)
      // Firefox/Gecko doesn't support options_ui.chrome_style so load options_firefox.css
      link.rel = `stylesheet`
      link.href = `css/options_firefox.css`
      document.head.appendChild(link)
      // add new tab targets for all links
      document.addEventListener(`click`, e => {
        if (e.target.href !== undefined && !e.target.hasAttribute(`target`)) {
          e.target.setAttribute(`target`, `_blank`)
        }
      })
      break
  }
  // filter by web browser's host operating system
  chrome.runtime.getPlatformInfo(info => {
    switch (info.os) {
      // Windows requires a drive letter for file links
      case `win`: localFileAccess.setAttribute(`href`, `file:///C:/`); break
    }
  })
})()

async function buildColors(className = ``)
// Generates CSS for font colours.
// @className   Font colours selection value
{
  if (typeof className !== `string`) checkArg(`className`, `string`, className)

  const sample = document.getElementById(`sample-dos-text`)
  if (sample.classList === null) return // error
  const classAsArray = sample.className.split(` `)
  // loop through and remove any *-bg and *-fg classes
  let i = classAsArray.length
  while (i--) {
    if (classAsArray[i].endsWith(`-bg`)) sample.classList.remove(classAsArray[i])
    if (classAsArray[i].endsWith(`-fg`)) sample.classList.remove(classAsArray[i])
  }
  sample.classList.add(`${className}-bg`)
  sample.classList.add(`${className}-fg`)
}

async function changeFont(ff)
// Adjusts the font family and font height styles
// @ff  Font family to apply
{
  if (typeof ff !== `string`) checkArg(`ff`, `string`, ff)

  const sample = document.getElementById(`sample-dos-text`)
  if (sample.classList === null) return // error
  const classAsArray = sample.className.split(` `)
  // loop through and remove any font-* classes
  let i = classAsArray.length
  while (i--) {
    if (classAsArray[i].startsWith(`font-`)) sample.classList.remove(classAsArray[i])
  }
  sample.classList.add(`font-${ff}`)
}

async function changeI18nWord(name = ``, cls = ``)
// Annoying word-around to add i18n support to .html files
// @name i18n message name
// @cls  span class name to inject translation into
{
  if (typeof name !== `string`) checkArg(`name`, `string`, name)
  if (name.length < 1) checkRange(`name`, `length`, `1`, name.length)
  if (typeof cls !== `string`) checkArg(`cls`, `string`, cls)
  if (cls.length < 1) checkRange(`cls`, `length`, `1`, cls.length)

  const msg = chrome.i18n.getMessage(name)
  const words = document.getElementsByClassName(cls)
  for (const w of words) {
    const word = w.innerHTML
    if (word.slice(0, 1).toUpperCase()) {
      // if original word is capitalised, apply to new word
      w.textContent = `${msg[0].toUpperCase()}${msg.slice(1)}`
    } else {
      w.textContent = msg
    }
  }
}

async function changeOnColors()
// Gets and applies user's saved font colours to sample text.
{
  const r = localStorage.getItem(`retroColor`)
  if (typeof r !== `string`) {
    console.error(`Failed to obtain the 'retroColor' setting`)
  } else buildColors(r)
}

async function changeOnEffects()
// Gets and applies user's saved font family to sample text.
{
  const r2 = localStorage.getItem(`textBgScanlines`)
  const r3 = localStorage.getItem(`textEffect`)
  const sample = document.getElementById(`sample-dos-text`)

  switch (r2) {
    case `true`: changeTextScanlines(true, sample); break
    case `false`: changeTextScanlines(false, sample); break
    default: checkErr(`textBgScanlines`)
  }
  switch (r3) {
    case `normal`: changeTextEffect(`normal`, sample); break
    case `shadowed`: changeTextEffect(`shadowed`, sample); break
    case `smeared`: changeTextEffect(`smeared`, sample); break
    default: checkErr(`textEffect`)
  }
}

async function changeOnFont()
// Gets and applies user's saved font family to sample text.
{
  const r = localStorage.getItem(`retroFont`)
  if (typeof r !== `string`) checkErr(`retroFont`)
  else changeFont(r)
}

async function changeOnOptions()
// Sets the options form to match the user's saved options
{
  function selector(s, r)
  // Selector checks buttons and selects items in the Options form
  // @s `color` Font color select list
  //    `font`  Font selection radio buttons
  //    `lh`    Line height select list
  // @r Item number to select or check
  {
    function select(s, r, n) {
      for (const opt of n) {
        if (opt.value === r) {
          switch (s) {
            case `color`:
            case `lh`: opt.selected = true; break
            case `effect`:
            case `font`: opt.checked = true; break
          }
          opt.selected = true
          break
        }
      }
    }
    switch (s) {
      case `color`: select(s, r, document.getElementById(`font-color`)); break
      case `effect`: select(s, r, document.getElementsByName(`effect`)); break
      case `font`: select(s, r, document.getElementsByName(`font`)); break
      case `lh`: select(s, r, document.getElementById(`line-height`)); break
    }
  }

  function checker(id, r)
  // Checker checks checkboxes in the Options form
  // @id  Element ID of the checkbox
  // @r   String of either `true` to check or `false` to un-check
  {
    if (typeof id !== `string`) checkArg(`id`, `string`, id)
    if (typeof r !== `string`) checkArg(`r`, `string`, r)

    const input = document.getElementById(id)
    if (r === `true`) input.checked = true
    else if (r === `false`) input.checked = false
    else checkErr(id)
  }

  // Colour setting
  const r1 = localStorage.getItem(`retroColor`)
  if (typeof r1 !== `string` || r1.length < 1) checkErr(`retroColor`)
  else selector(`color`, r1)
  // Font
  const r2 = localStorage.getItem(`retroFont`)
  if (typeof r2 !== `string` || r2.length < 1) checkErr(`retroFont`)
  else selector(`font`, r2)
  // Line Height
  const r3 = localStorage.getItem(`lineHeight`)
  if (typeof r3 !== `string` || r3.length < 1) checkErr(`lineHeight`)
  else selector(`lh`, r3)
  // Text information
  const r4 = localStorage.getItem(`textFontInformation`)
  checker(`text-font-information`, r4)
  // Centre alignment
  const r5 = localStorage.getItem(`textCenterAlignment`)
  checker(`center-alignment`, r5)
  // Scan lines
  const r7 = localStorage.getItem(`textBgScanlines`)
  checker(`background-scanlines`, r7)
  // Display DOS Control codes
  const r8 = localStorage.getItem(`textDosCtrlCodes`)
  const r8text = document.getElementById(`sample-dos-ctrls`)
  checker(`dos-ctrl-codes`, r8)
  if (r8 !== `true`) r8text.style.display = `none`
  else r8text.style.display = `inline`
  // ANSI iCE Colors
  const r14 = localStorage.getItem(`textAnsiIceColors`)
  checker(`ansi-ice-colors`, r14)
  // URLs for auto-run
  const r9 = localStorage.getItem(`runWebUrls`)
  const r9text = document.getElementById(`run-web-urls-permitted`)
  checker(`run-web-urls`, r9)
  if (r9 !== `true`) r9text.disabled = true
  else r9text.disabled = false
  // Fill-in the list of auto-run URls
  const r10 = localStorage.getItem(`runWebUrlsPermitted`)
  if (typeof r10 !== `string` || r10.length < r10) checkErr(`runWebUrlsPermitted`)
  else r9text.value = r10
  // Local text file access
  const r11 = localStorage.getItem(`runWebUrls`)
  checker(`run-file-urls`, r11)
  // Downloads of text files access
  const engine = findEngine()
  if (engine === `blink`) {
    const r12 = localStorage.getItem(`runFileDownloads`)
    checker(`run-file-downloads`, r12)
  }
  // Text effects
  const r13 = localStorage.getItem(`textEffect`)
  if (typeof r13 !== `string` || r13.length < 1) checkErr(`textEffect`)
  else selector(`effect`, r13)
  // ANSI iCE Colors
  const r15 = localStorage.getItem(`updatedNotice`)
  checker(`updated-notice`, r15)
}

async function changeStorageColors()
// Saves the user font and background colour selection to local browser storage.
{
  const s = document.getElementById(`font-color`)
  const c = s.options[s.selectedIndex].value
  localStorage.setItem(`retroColor`, c)
  chrome.storage.local.set({ 'retroColor': c })
}

async function changeStorageEffect()
// Saves the user text effect selection to local browser storage.
{
  const f = document.texteffects.effect.value
  localStorage.setItem(`textEffect`, f)
  chrome.storage.local.set({ 'textEffect': f })
}

async function changeStorageFont()
// Saves the user font selection to local browser storage.
{
  const f = document.fonts.font.value
  localStorage.setItem(`retroFont`, f)
  chrome.storage.local.set({ 'retroFont': f })
}

async function changeStorageLineHeight()
// Saves the user line height adjustments to local browser storage.
{
  const s = document.getElementById(`line-height`)
  const h = s.options[s.selectedIndex].value
  localStorage.setItem(`lineHeight`, h)
  chrome.storage.local.set({ 'lineHeight': h })
}

async function changeStorageURLs()
// Saves the user website selection to local browser storage.
{
  const ul = document.getElementById(`run-web-urls-permitted`).value
  if (ul.length > 0) {
    localStorage.setItem(`runWebUrlsPermitted`, ul)
    chrome.storage.local.set({ 'runWebUrlsPermitted': ul })
  } else {
    // if input is empty then delete the storage to revert it back to defaults
    const d = new ListDefaults()
    const j = d.autoDomains.join(`;`)
    localStorage.setItem(`runWebUrlsPermitted`, j)
    chrome.storage.local.set({ 'runWebUrlsPermitted': j })
  }
}

async function runtimeInfo() {
  const m = chrome.runtime.getManifest()
  const str = document.getElementById(`manifest`)
  str.textContent = `RetroTxt v${m.version}`
}