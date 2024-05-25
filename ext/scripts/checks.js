// filename: scripts/checks.js
//
// Error, argument checkers and alerts for the container-scripts.

/**
 * Argument checker for functions and classes.
 * @param {string} [name=``] The argument name that failed
 * @param {string} [expecteparam {*} actual The actual argument used
 */
// eslint-disable-next-line no-unused-vars
function CheckArguments(name = ``, expected = ``, actual) {
  let err
  switch (expected) {
    case `boolean`:
      err = `argument '${name}' should be a 'boolean' (true|false) instead of a '${typeof actual}'`
      break
    case `number`:
      err = `argument '${name}' should be a 'number' (unsigned) instead of a '${typeof actual}'`
      break
    case `string`:
      err = `argument '${name}' should be a 'string' of text instead of a '${typeof actual}'`
      break
    default:
      err = `argument '${name}' needs to be a '${expected}' instead of a '${typeof actual}'`
      break
  }
  if (typeof qunit !== `undefined`) return err
  CheckError(err)
}

/**
 * Error handler for functions and classes.
 * @param {*} errorMessage Description of the error
 * @param {boolean} [log=false] Should the error be logged to the browser
 * console otherwise an exception is thrown
 */
function CheckError(errorMessage, log = false) {
  if (typeof errorMessage !== `undefined`) {
    BusySpinner(false)
    if (typeof globalThis.checkedErr !== `undefined`)
      globalThis.checkedErr = true
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
// eslint-disable-next-line no-unused-vars
function CheckRange(name = ``, issue = ``, expected, actual) {
  let err = ``
  switch (issue) {
    case `length`:
      err = `the number of characters '${actual}' used for the argument '${name}' is too short, it needs to be at least '${expected}' character`
      if (expected !== `1` && expected !== 1) err += `s`
      break
    case `range`:
      err = `the value '${actual}' for the argument '${name}' is out of range, it needs to be either '${expected.join(
        `, `,
      )}'`
      break
    case `small`:
      err = `the value '${actual}' for the argument '${name}' is too small, it needs to be at least '${expected}' or greater`
      break
    case `large`:
      err = `the value '${actual}' for the argument '${name}' is too large, it needs to be at most '${expected}' or less`
      break
    default:
  }
  if (typeof qunit !== `undefined`) return err
  CheckError(err)
}

/**
 * Creates a red coloured alert message box at the top of the active browser page.
 * @param {boolean} [show=true] Reveal or hide the box
 */
function DisplayAlert(show = true, message = ``) {
  // div element containing the error alert
  let div = globalThis.document.getElementById(`displayAlert`)
  const link = globalThis.document.getElementById(`retrotxt-styles`)
  // the navigator.platform property is deprecated but it is the only way to
  // detect macOS as the chrome.runtime.getPlatformInfo() is not available here
  const macOS = navigator.platform.toUpperCase().indexOf("MAC") >= 0
  if (div === null) {
    let ext = `reloading RetroTxt with the `
    switch (WebBrowser()) {
      case Engine.chrome:
        ext += ` Extensions page, (chrome://extensions).`
        break
      case Engine.firefox:
        ext += ` Add-ons manager page, (about:addons).`
        break
    }
    const keyboard = new Map()
      .set(`console`, `J`)
      .set(`reload`, `F5`)
      .set(`ctrl`, `Control`)
      .set(`shift`, `Shift`)
    if (macOS)
      keyboard
        .set(`reload`, `R`)
        .set(`ctrl`, `⌘ Command`)
        .set(`shift`, `⌥ Option`)
    if (WebBrowser() === Engine.firefox) keyboard.set(`console`, `I`)
    // build error as a html node
    const alert = {
      div: document.createElement(`div`),
      relCmd: document.createElement(`kbd`),
      rel: document.createElement(`kbd`),
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
    alert.relCmd.append(`${keyboard.get(`ctrl`)}`)
    alert.rel.append(`${keyboard.get(`reload`)}`)
    alert.ctrl.append(keyboard.get(`ctrl`))
    alert.shift.append(keyboard.get(`shift`))
    alert.ikey.append(keyboard.get(`console`))
    alert.cons.append(`Console`)
    alert.issue.href = chrome.i18n.getMessage(`url_issues`)
    alert.issue.title = `On the RetroTxt GitHub repository`
    alert.issue.append(`see if it is a known issue`)
    alert.div.append(`😔 Sorry, RetroTxt has run into a problem.`, alert.p1)
    alert.div.append(alert.p2)
    alert.p2.append(
      `For additional information, press `,
      alert.ctrl,
      alert.shift,
      alert.ikey,
      ` to open the `,
      alert.cons,
      `.`,
    )
    if (message === ``) {
      alert.p1.append(`Please reload `)
      if (macOS) alert.p1.append(alert.relCmd)
      alert.p1.append(alert.rel)
      alert.p1.append(` this tab to attempt to fix the problem.`)
      alert.div.append(
        `If the problem continues, try ${ext}`,
        alert.br2,
        `Or `,
        alert.issue,
        `.`,
      )
    } else {
      alert.div.append(message)
    }
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
// eslint-disable-next-line no-unused-vars
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
    `iconv file.txt --from-code=UTF-16${endian()} --to-code=UTF-8 > file-fixed.txt`,
  )
  alert.p2.append(`In PowerShell or Windows: `)
  alert.fix2.append(
    `Get-Content file.txt -raw | Set-Content file-fixed.txt -Encoding UTF8`,
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

/* global BusySpinner CreateLink DOM Engine WebBrowser */
