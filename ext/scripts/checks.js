// filename: checks.js
//
/*global BrowserOS Chrome DOM Firefox MacOS WebBrowser */
/*exported CheckArguments CheckError CheckRange DisplayAlert DisplayEncodingAlert */

/**
 * Argument checker for functions and classes.
 * @param {string} [name=``] The argument name that failed
 * @param {string} [expecteparam {*} actual The actual argument used
 */
function CheckArguments(name = ``, expected = ``, actual) {
  let msg = ``
  switch (expected) {
    case `boolean`:
      msg = `argument '${name}' should be a 'boolean' (true|false) instead of a '${typeof actual}'`
      break
    case `number`:
      msg = `argument '${name}' should be a 'number' (unsigned) instead of a '${typeof actual}'`
      break
    case `string`:
      msg = `argument '${name}' should be a 'string' of text instead of a '${typeof actual}'`
      break
    default:
      msg = `argument '${name}' needs to be a '${expected}' instead of a '${typeof actual}'`
      break
  }
  if (typeof qunit !== `undefined`) return msg
  CheckError(msg)
}

/**
 * Error handler for functions and classes.
 * @param {*} errorMessage Description of the error
 * @param {boolean} [log=false] Should the error be logged to the browser
 * console otherwise an exception is thrown
 */
function CheckError(errorMessage, log = false) {
  if (errorMessage !== undefined) {
    BusySpinner(false)
    if (globalThis.checkedErr !== undefined) globalThis.checkedErr = true
    if (typeof qunit === `undefined`) DisplayAlert()
    else throw new Error(errorMessage)
    if (log === true) return console.warn(errorMessage)
    try {
      throw new Error(errorMessage)
    } catch (e) {
      console.error(e)
    }
  }
}

/**
 * Out of range handler for functions and classes.
 * @param {string} [name=``] The argument name that failed
 * @param {string} [issue=``] The type of error
 * @param {*} expected The expected value
 * @param {*} actual The actual value
 */
function CheckRange(name = ``, issue = ``, expected, actual) {
  let msg = ``
  switch (issue) {
    case `length`:
      msg = `the number of characters '${actual}' used for the argument '${name}' is too short, it needs to be at least '${expected}' character`
      if (expected !== `1` && expected !== 1) msg += `s`
      break
    case `range`:
      msg = `the value '${actual}' for the argument '${name}' is out of range, it needs to be either '${expected.join(
        `, `
      )}'`
      break
    case `small`:
      msg = `the value '${actual}' for the argument '${name}' is too small, it needs to be at least '${expected}' or greater`
      break
    case `large`:
      msg = `the value '${actual}' for the argument '${name}' is too large, it needs to be at most '${expected}' or less`
      break
    default:
  }
  if (typeof qunit !== `undefined`) return msg
  CheckError(msg)
}

/**
 * Creates a red coloured alert message box at the top of the active browser page.
 * @param {boolean} [show=true] Reveal or hide the box
 */
function DisplayAlert(show = true) {
  // div element containing the error alert
  let div = globalThis.document.getElementById(`displayAlert`)
  const link = globalThis.document.getElementById(`retrotxt-styles`)
  if (div === null) {
    let ext = `reloading RetroTxt on the `
    switch (WebBrowser()) {
      case Engine.chrome:
        ext += ` Extensions page (chrome://extensions)`
        break
      case Engine.firefox:
        ext += ` Add-ons manager page (about:addons)`
        break
    }
    const keyboard = new Map()
      .set(`console`, `J`)
      .set(`reload`, `F5`)
      .set(`ctrl`, `Control`)
      .set(`shift`, `Shift`)
    if (BrowserOS() === Os.macOS)
      keyboard.set(`reload`, `R`).set(`ctrl`, `⌘`).set(`shift`, `⌥`)
    if (WebBrowser() == Engine.firefox) keyboard.set(`console`, `I`)
    // build error as a html node
    const alert = {
      div: document.createElement(`div`),
      f5: document.createElement(`kbd`),
      ctrl: document.createElement(`kbd`),
      shift: document.createElement(`kbd`),
      ikey: document.createElement(`kbd`),
      cons: document.createElement(`strong`),
      br1: document.createElement(`br`),
      br2: document.createElement(`br`),
      issue: document.createElement(`a`),
      p1: document.createElement(`p`),
      p2: document.createElement(`p`),
    }
    alert.f5.append(`${keyboard.get(`reload`)}`)
    alert.ctrl.append(keyboard.get(`ctrl`))
    alert.shift.append(keyboard.get(`shift`))
    alert.ikey.append(keyboard.get(`console`))
    alert.cons.append(`Console`)
    alert.issue.href = chrome.i18n.getMessage(`url_issues`)
    alert.issue.title = `On the RetroTxt GitHub repository`
    alert.issue.append(`see if it has an issue report`)
    alert.div.append(`Sorry, RetroTxt has run into a problem.`, alert.p1)
    alert.p1.append(`Please reload `)
    if (BrowserOS() !== MacOS) alert.p1.append(alert.f5)
    alert.p1.append(` this tab to attempt to fix the problem.`)
    alert.div.append(alert.p2)
    alert.p2.append(
      `For more information press `,
      alert.ctrl,
      alert.shift,
      alert.ikey,
      ` to open the `,
      alert.cons,
      `.`
    )
    alert.div.append(
      `If the problem continues, try ${ext}`,
      alert.br2,
      `or `,
      alert.issue,
      `.`
    )
    div = alert.div
    alert.div = null
    div.id = `displayAlert`
    const dom = new DOM()
    // add CSS link elements into the page
    if (link === null) {
      dom.head.append(CreateLink(`../css/retrotxt.css`, `retrotxt-styles`))
      dom.head.append(CreateLink(`../css/layout.css`, `retrotxt-layout`))
    }
    // inject div
    dom.body.insertBefore(div, dom.pre0)
  }
  // display error alert
  if (show === false) return div.classList.add(`is-hidden`)
  div.classList.remove(`is-hidden`)
}
/**
 * Creates an alert for unsupported page character sets.
 */
function DisplayEncodingAlert() {
  let div = globalThis.document.getElementById(`CheckEncoding`)
  if (div !== null) return (div.style.display = `block`)
  const alert = {
    br1: document.createElement(`br`),
    br2: document.createElement(`br`),
    div: document.createElement(`div`),
    code: document.createElement(`strong`),
    fix1: document.createElement(`code`),
    fix2: document.createElement(`code`),
    p1: document.createElement(`p`),
    p2: document.createElement(`p`),
  }
  const endian = () => {
    switch (document.characterSet) {
      case `UTF-16LE`:
        return `LE`
      default:
        return `BE`
    }
  }
  alert.div.append(`RetroTxt: The page encoding of this document `)
  alert.code.append(`${document.characterSet}`)
  alert.div.append(alert.code, ` is not supported by the browser.`)
  alert.code.style.color = `red`
  alert.p1.append(`To convert the document to UTF-8 in Linux or macOS: `)
  // for examples: https://www.gnu.org/software/libiconv
  alert.fix1.append(
    `iconv file.txt --from-code=UTF-16${endian()} --to-code=UTF-8 > file-fixed.txt`
  )
  alert.p2.append(`In PowerShell or Windows: `)
  alert.fix2.append(
    `Get-Content file.txt -raw | Set-Content file-fixed.txt -Encoding UTF8`
  )
  alert.p1.insertAdjacentElement(`beforeend`, alert.br1)
  alert.p1.insertAdjacentElement(`beforeend`, alert.fix1)
  alert.div.insertAdjacentElement(`beforeend`, alert.p1)
  alert.p2.insertAdjacentElement(`beforeend`, alert.br2)
  alert.p2.insertAdjacentElement(`beforeend`, alert.fix2)
  alert.div.insertAdjacentElement(`beforeend`, alert.p2)
  div = alert.div
  alert.div = null
  div.id = `CheckEncoding`
  const dom = new DOM()
  dom.body.insertBefore(div, dom.pre0)
}
