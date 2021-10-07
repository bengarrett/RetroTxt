// filename: sw/storage.js
//
/*global CheckLastError ConsoleLoad Developer Extension */
/*exported openOptions */

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`storage.js`)
})

// monitor saved changes to Options so the context menu can be updated
chrome.storage.onChanged.addListener((changes, areaName) => {
  new LocalStore().event(changes, areaName)
})

// TODO: remove localStorage and move it too chrome.local.store()
/**
 * Extension local storage interface.
 * @class LocalStore
 */
class LocalStore {
  /**
   * There are 4 types of browser storage that is accessible to RetroTxt.
   * `sessionStorage` is temporary & is cleared whenever the browser is closed.
   * `localStorage` is persistent & offers immediate access but is not able to
   * be accessed by all parts of RetroTxt.
   * `chrome.Storage.local` is persistent and much slower than localStorage, but
   * can be accessed by all parts of RetroTxt.
   * `chrome.Storage.sync` allows cloud saving & syncing storage but is
   * currently not implemented by RetroTxt and support varies by browser.
   */
  constructor() {
    this.defaults = new Extension().defaults
    this.redundant = new Set().add(`runFileDownloads`).add(`runFileUrls`)
    // NOTE: The following MUST be disabled in production as it erases all the
    // storage objects whenever the Extension is reloaded
    this.storageReset = false
    this.redundantTest = false
    const v3Imports = new Map()
      // display tab
      .set(`lineHeight`, `normal`)
      .set(`textSmearBlocks`, `true`)
      .set(`textBgScanlines`, `true`)
      .set(`textBlinkAnimation`, `false`)
      .set(`textCenterAlignment`, `false`)
      .set(`textDosCtrlCodes`, `true`)
      .set(`textEffect`, `shadowed`)
      .set(`textAnsiWrap80c`, `false`)
      .set(`textAnsiIceColors`, `false`)
      .set(`retroColor`, `theme-c64`)
      .set(`customForeground`, `#ff0000`)
      .set(`customBackground`, `blue`)
      .set(`colorPalette`, `gray`)
      // settings tab
      //.set(`runWebUrls`, `true`)
      .set(`runWebUrlsPermitted`, `example.com;example.org;example.net`)
      .set(`textFontInformation`, `false`)
      .set(`updatedNotice`, `false`)
    this.v3Imports = v3Imports
  }
  /**
   * Cleans up and validates RetroTxt storage requirements.
   * Intended for use when RetroTxt is loaded.
   */
  initialize() {
    if (this.storageReset) {
      this.wipe()
      this.clean()
    } else if (this.redundantTest)
      chrome.storage.local.set({ runFileDownloads: true })
    //this.scan()
  }
  /**
   * Removes legacy storage local items that may have been configured by
   * earlier editions of RetroTxt.
   */
  clean() {
    this.redundant.forEach((key) => {
      chrome.storage.local.remove(`${key}`)
    })
  }
  /**
   * Outputs any chrome.storage changes to the background page console.
   * @param changes Object describing the change
   * @param areaName Name of the storage area where changes were made
   */
  event(changes, areaName) {
    for (const item of Object.keys(changes)) {
      // newValue must be a string otherwise context menu errors will occur
      const oldValue = changes[item].oldValue,
        newValue = `${changes[item].newValue}`
      chrome.storage.local.get(Developer, (store) => {
        if (Developer in store) {
          console.log(
            `🖫 RetroTxt %sStorage %s change: %s 🡒 %s (%s).`,
            areaName,
            item,
            oldValue,
            newValue,
            typeof newValue
          )
        }
      })
      if (`${oldValue}` === `undefined`) return
    }
  }
  /**
   * Iterates through the `this.defaults` Map and looks for matching keys in
   * `chrome.Storage.local`. If a matching key in Storage is found then the
   * `pass()` function is called otherwise `fail()` is used.
   */
  // scan() {
  //   this.defaults.forEach((value, key) => {
  //     chrome.storage.local.get(`${key}`, (data) => {
  //       key in data ? this._pass(key, Object.values(data)[0]) : this._fail(key)
  //     })
  //   })
  // }
  /**
   * Erases local, session & Extension storage items that were created by RetroTxt.
   */
  wipe() {
    chrome.storage.local.clear(() => {
      console.log(`🖫 Deleted all RetroTxt chrome.storage.local items.`)
    })
  }
  /**
   * Scan success callback that looks for an identical localStorage pair.
   * If a matching localStorage item is not found then it is set here.
   * @param [key=``] storage.local key
   * @param [value=``] storage.local value
   */
  _pass(key = ``, value = ``) {
    const local = localStorage.getItem(`${key}`)
    if (local === null) localStorage.setItem(`${key}`, `${value}`)
  }
  /**
   * A scan failed callback that saves the `this.defaults` value to the storage
   * area and then updates the context menus.
   * @param [key=``] storage.local key
   */
  _fail(key = ``) {
    const value = this.defaults.get(`${key}`)
    // convert the array object to a ; separated string
    if (key === `settingsWebsiteDomains`) {
      const valuesJoined = value.join(`;`)
      return chrome.storage.local.set({ [key]: valuesJoined })
    }
    // colorsTextPairs `this.defaults` are missing an expected `theme-` prefix
    if (key === `colorsTextPairs` && !value.startsWith(`theme-`)) {
      const newValue = `theme-${value}`
      return chrome.storage.local.set({ [key]: newValue })
    }
    // otherwise save the value as a string
    chrome.storage.local.set({ [key]: value })
  }
}

function openOptions(page = ``) {
  const key = `optionTab`
  switch (page) {
    case `v`:
    case `ver`:
    case `version`:
      chrome.storage.local.set({ [key]: `0` })
      break
    case `c`:
    case `credits`:
      chrome.storage.local.set({ [key]: `1` })
      break
    case `samp`:
    case `samples`:
      chrome.storage.local.set({ [key]: `2` })
      break
    case `u`:
    case `useful`:
      chrome.storage.local.set({ [key]: `3` })
      break
    case `f`:
    case `fonts`:
      chrome.storage.local.set({ [key]: `4` })
      break
    case `d`:
    case `display`:
      chrome.storage.local.set({ [key]: `5` })
      break
    case `s`:
    case `settings`:
      chrome.storage.local.set({ [key]: `6` })
      break
    case `doc`:
    case `help`:
    case `documentation`:
      chrome.storage.local.set({ [key]: `7` })
      break
    case `reload`:
      chrome.management.getSelf((info) => {
        if (info.installType !== `development`) return
        return chrome.runtime.reload()
      })
      return chrome.runtime.reload()
    case `tests`:
    case `unit`:
    case `unittests`:
      chrome.management.getSelf((info) => {
        if (info.installType !== `development`) return
        chrome.storage.local.set({ [`optionTab`]: `99` })
      })
      break
    case `wipe`:
      new LocalStore().wipe()
      return chrome.runtime.reload()
    default:
      return
  }
  return chrome.runtime.openOptionsPage(() => {
    if (CheckLastError(`open options page "${page}"`)) return
  })
}
