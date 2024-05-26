// File: scripts/helpers.js
//
// Content-scripts "helper" shared functions.
// There is an IIFE, self-invoking anonymous function at the end of the document.

// Text type globals, using control codes or sequences.
// eslint-disable-next-line no-unused-vars
const UnknownText = -1,
  PlainText = 0,
  PCBoardText = 1,
  CelerityText = 2,
  RenegadeText = 3,
  TelegardText = 4,
  WildcatText = 5,
  WWIVHashText = 6,
  WWIVHeartText = 7,
  // eslint-disable-next-line no-unused-vars
  BBSText = 98,
  ANSIText = 99

/**
 * Display a large loading spinner on the active tab.
 * @param [display=true] Display spinner
 */
// eslint-disable-next-line no-unused-vars
async function BusySpinner(display = true) {
  if (typeof display !== `boolean`)
    CheckArguments(`display`, `boolean`, display)
  // TODO apply a timeout timer that will look for any uncaught errors and if
  // detected, display them in the tab?
  const spin = globalThis.document.getElementById(`spinLoader`)
  switch (display) {
    case true:
      if (spin === null) {
        const div = document.createElement(`div`)
        div.id = `spinLoader`
        div.classList.add(`loader`)
        document.body.append(div)
        const stylesheet = CreateLink(
          `../css/retrotxt_loader.css`,
          `retrotxt-loader`,
        )
        return document.querySelector(`head`).append(stylesheet)
      }
      return spin.classList.remove(`is-hidden`)
    case false:
      if (spin !== null) spin.classList.add(`is-hidden`)
  }
}

/**
 * Creates a `<link>` element to load a CSS stylesheet.
 * @param [path=``] File path to the CSS stylesheet
 * @param [id=``] Id name to apply to the `<link>` element
 * @returns html element
 */
function CreateLink(path = ``, id = ``) {
  if (typeof path !== `string`) CheckArguments(`path`, `string`, path)
  const manifestKeys = Object.keys(chrome.runtime.getManifest()).length
  if (manifestKeys === 0)
    return console.error(
      `RetroTxt cannot continue as the Extension API is inaccessible.`,
    )
  const link = document.createElement(`link`)
  if (id.length > 0) link.id = id
  link.href = chrome.runtime.getURL(path)
  link.type = `text/css`
  link.rel = `stylesheet`
  link.crossOrigin = ``
  return link
}

/**
 * Uses CSS3 styles to emulate retro CRT monitor scanlines.
 * @param [toggle=true] Show `true` or `false` to remove scanlines
 * @param [dom={}] HTML DOM element to receive the scanline effect
 * @param [colorClass=``] Optional CSS class that overrides light or dark
 * scanlines
 */
// eslint-disable-next-line no-unused-vars
async function ToggleScanlines(toggle = true, dom = {}, colorClass = ``) {
  if (toggle === null) CheckArguments(`toggle`, `boolean`, toggle)
  if (typeof dom !== `object`) CheckArguments(`dom`, `object`, dom)
  if (dom.classList === null) return // error
  // applies scanline classes to the DOM
  const applyNewClass = (newClass) => {
    if (typeof newClass === `string`) {
      // remove existing scan lines classes
      dom.classList.remove(`scanlines-light`, `scanlines-dark`)
      if (
        newClass.endsWith(`-on-white`) ||
        [`theme-windows`, `theme-appleii`].includes(newClass)
      )
        dom.classList.add(`scanlines-light`)
      else dom.classList.add(`scanlines-dark`)
    }
  }
  // disable scanlines
  if (toggle === false)
    return dom.classList.remove(`scanlines-light`, `scanlines-dark`)
  // apply colours provided by the `colorClass` parameter
  if (typeof color === `string`) return applyNewClass(colorClass)
  // apply colours from local storage
  chrome.storage.local.get([`colorsTextPairs`], (result) => {
    if (typeof result.colorsTextPairs === `undefined`)
      return CheckError(
        `Could not obtain the required colorsTextPairs setting to apply the scanlines effect`,
        true,
      )
    return applyNewClass(result.colorsTextPairs)
  })
}

/**
 * Create a link to the extension Details tab.
 * This link is unique for each browser brand, irrespective of the render engine.
 * Brave and Vivaldi report themselves as Chrome and will return the wrong URL.
 * Firefox doesn't use a Details tab and will return an empty string.
 * @returns URL or an empty string.
 */
// eslint-disable-next-line no-unused-vars
function LinkDetails() {
  const extensionId = chrome.runtime.id,
    ua = navigator.userAgent
  if (extensionId.length === 0) return ``
  if (ua.includes(`Firefox/`)) return ``
  const url = `://extensions?id=${extensionId}`
  if (ua.includes(`Edg/`)) return `edge${url}`
  if (ua.includes(`OPR/`)) return `opera${url}`
  // brave, vivaldi do not modify the user agent and cannot be detected
  return `chrome${url}`
}

/**
 * Uses CSS3 styles to manipulate font effects.
 * @param [effect=`normal`] Font effect name to apply
 * @param [dom={}] Required HTML DOM element object to apply shadow effect to
 * @param [colorClass=``] Optional CSS colour class when we already know the new
 * colour values
 */
// eslint-disable-next-line no-unused-vars
async function ToggleTextEffect(effect = `normal`, dom = {}, colorClass = ``) {
  if (typeof effect !== `string`) CheckArguments(`effect`, `string`, effect)
  if (typeof dom !== `object`) CheckArguments(`dom`, `object`, dom)
  if (typeof dom.classList === `undefined`) return // error
  if (dom.classList === null) return // error
  // this removes any pre-existing text effect class names from the element
  for (const item of dom.classList) {
    if (item.endsWith(`-shadowed`) === true) dom.classList.remove(item)
  }

  const apply = (result) => {
    switch (effect) {
      case `shadowed`:
        // use colours provided by the colour parameter
        if (typeof color === `string`)
          return dom.classList.add(`${colorClass}-shadowed`)
        // use colours fetched from chrome storage (default)
        if (typeof result === `string`) dom.classList.add(`${result}-shadowed`)
        else {
          chrome.storage.local.get([`colorsTextPairs`], (result) => {
            if (typeof result.colorsTextPairs === `undefined`)
              CheckError(
                `Could not obtain the required colorsTextPairs setting to apply the text shadow effect`,
                true,
              )
            else dom.classList.add(`${result.colorsTextPairs}-shadowed`)
          })
        }
        break
      default:
        // 'normal, auto' do nothing as the text effects have been removed
        break
    }
    const textRender = document.getElementById(`renderToggle`)
    if (textRender !== null)
      textRender.textContent = `${effect.charAt(0).toUpperCase()}${effect.slice(
        1,
      )}`
  }
  chrome.storage.local.get(`colorsTextPairs`, apply)
}

/**
 * Scans a body of text for special control codes.
 * Returns a numeric text enum-like value.
 * @param [text=``] Text to scan
 * @returns string
 */
// eslint-disable-next-line no-unused-vars
function FindControlSequences(text = ``) {
  if (typeof text !== `string`) CheckArguments(`text`, `string`, text)
  const inRange = (a = -1, b = -1) => {
    if (a >= 48 && b >= 48 && a <= 70 && b <= 70) return true
    return false
  }
  // remove `@CLS@` BBS control that was sometimes inserted by TheDraw
  // only need the first 5 characters for testing
  const clearScreen = `@CLS@`
  let cleaned = text.trim().slice(0, 5)
  if (cleaned.startsWith(clearScreen)) cleaned = text.trim().slice(5, 10)
  const slice = cleaned.toUpperCase()
  // ECMA-48 control sequences
  // Despite the performance hit trim is needed for some ANSI art to avoid false
  // detections
  const escape = 27,
    leftSquareBracket = 91
  if (
    text.trim().charCodeAt(0) === escape &&
    text.trim().charCodeAt(1) === leftSquareBracket
  )
    return ANSIText
  // `indexOf` is the fastest form of string search
  const sequence = text.indexOf(
    `${String.fromCharCode(27)}${String.fromCharCode(91)}`,
  )
  if (sequence > 0) return ANSIText
  // detect pipe codes for WWIV
  // needs to be checked before other forms of pipe-codes
  if (slice.charAt(0) === `|` && slice.charAt(1) === `#`) {
    const a = parseInt(`${slice.charAt(2)}`)
    if (a >= 0 && a <= 9) return WWIVHashText
    return PlainText
  }
  // detect pipe-codes for Renegade, Telegard and Celerity
  if (slice.charAt(0) === `|`) {
    // renegade and telegard
    const a = parseInt(`${slice.charAt(1)}${slice.charAt(2)}`, 10)
    if (a >= 0 && a <= 23) return RenegadeText
    const celerityCodes = new Set([
      `B`,
      `C`,
      `D`,
      `G`,
      `K`,
      `M`,
      `R`,
      `S`,
      `Y`,
      `W`,
    ])
    if (celerityCodes.has(slice.charAt(1))) return CelerityText
    return PlainText
  }
  // detect Telegard grave accent codes
  if (slice.charAt(0) === `\``) {
    const a = parseInt(`${slice.charAt(1)}${slice.charAt(2)}`, 10)
    if (a >= 0 && a <= 23) return TelegardText
    return PlainText
  }
  const atCode = `@`
  // detect @-codes for Wildcat & PCBoard
  if (slice.charAt(0) === atCode) {
    // match PCBoard `@Xxx` codes
    if (slice.charAt(1) === `X`) {
      // get Unicode indexes of 2nd + 3rd chars
      const a = slice.charCodeAt(2),
        b = slice.charCodeAt(3)
      // index range 48-70 equals 0-9 A-F
      if (inRange(a, b)) return PCBoardText
    }
    if (slice.charAt(3) === atCode) {
      // match wildcat `@xx@` codes
      // get Unicode indexes of 1st + 2nd chars
      const a = slice.charCodeAt(1),
        b = slice.charCodeAt(2)
      if (inRange(a, b)) return WildcatText
    }
    return PlainText
  }
  // detect heart codes for WVIV
  if (slice.charCodeAt(0) === 3) {
    const a = parseInt(`${slice.charAt(1)}`)
    if (a >= 0 && a <= 9) return WWIVHeartText
    return PlainText
  }
  // plain or unsupported text
  return PlainText
}

/**
 * Humanises numeric values of bytes into a useful string.
 * @param [bytes=0] A numeric value of bytes
 * @param [si=1024] Decimal (filesize) `1000` or `1024` binary (RAM) conversion
 * @returns string
 */
// eslint-disable-next-line no-unused-vars
function HumaniseFS(bytes = 0, si = 1024) {
  // Based on http://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable
  if (typeof bytes !== `number`) CheckArguments(`bytes`, `number`, bytes)
  if (typeof si !== `number`) CheckArguments(`si`, `number`, si)
  const decimal = 1000,
    binary = 1024,
    thresh = si === decimal ? decimal : binary,
    units = si === decimal ? [`kB`, `MB`] : [`KiB`, `MiB`]
  if (Math.abs(bytes) < thresh) return `${bytes}B`
  let u = -1
  let calc = bytes
  do {
    calc /= thresh
    ++u
  } while (Math.abs(calc) >= thresh && u < units.length - 1)
  // round decimal value when the result is 10 or larger
  const result = Math.round(calc * 10) / 10,
    value = result >= 10 ? Math.round(result) : result
  return `${value}${units[u]}`
}
/**
 * Injects text into a DOM node object to be used with `append()`.
 * This is to avoid lint errors `UNSAFE_VAR_ASSIGNMENT`
 * "Unsafe assignment to innerHTML".
 * @param [text=``] Text to scan
 * @returns element
 */
// eslint-disable-next-line no-unused-vars
function ParseToChildren(text = ``) {
  if (typeof text !== `string`) CheckArguments(`text`, `string`, text)
  // `parseFromString()` creates a `<body>` element which we don't need,
  // so create a `<div>` container, and as a work-around return its content
  const elm = `<div>${text}</div>`
  const tag = new DOMParser()
    .parseFromString(elm, `text/html`)
    .getElementsByTagName(`div`)
  if (tag.length === 0)
    return CheckError(
      `DOMParser.parseFromString('${elm}','text/html') did not build a HTML object containing a <div> tag`,
    )
  return tag[0]
}
/**
 * Removes text pair related CSS class names from the element.
 * @param {*} elm HTML element
 */
// eslint-disable-next-line no-unused-vars
function RemoveTextPairs(elm = HTMLElement) {
  const classes = elm.className.split(` `)
  // loop through and remove any *-bg and *-fg classes
  let i = classes.length
  while (i--) {
    if (classes[i].endsWith(`-bg`)) elm.classList.remove(classes[i])
    if (classes[i].endsWith(`-fg`)) elm.classList.remove(classes[i])
  }
}

function SetIcon() {
  // matchMedia prefers-color-scheme isn't always reliable in Linux
  const preferDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  const key = `settingsToolbarIcon`
  chrome.storage.local.get(key, (store) => {
    if (key in store) {
      switch (store.settingsToolbarIcon) {
        case `dark`:
          chrome.runtime.sendMessage({ setIcon: true }, () => {
            if (CheckLastError(`setIcon dark send message`)) return
          })
          break
        case `light`:
          chrome.runtime.sendMessage({ setIcon: false }, () => {
            if (CheckLastError(`setIcon light send message`)) return
          })
          break
        default:
          chrome.runtime.sendMessage({ setIcon: preferDark }, () => {
            if (CheckLastError(`setIcon preferDark send message`)) return
          })
          break
      }
    }
  })
}

// IIFE, self-invoking anonymous function
;(() => {
  SetIcon()
})()

/*global CheckArguments CheckError CheckLastError */
