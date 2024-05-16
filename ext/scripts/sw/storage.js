// File: script/sw/storage.js
//
// RetroTxt settings and configurations store.
//
// When using the local storage API.
// Primitive values will serialize as expected:
//   string, number, bigint, boolean, undefined, symbol and null.
// Some complex values will also serialize as expected such as:
//   array, date and regex.
// But values with a typeof:
//   object or function will typically serialize to `{}`.

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`storage.js`)
})

// Monitor saved changes to Options so the context menu can be updated.
chrome.storage.onChanged.addListener((changes, areaName) => {
  new LocalStore().onChanged(changes, areaName)
})

// RemoveSearch removes all the stores that use a key containing searchKey.
// eslint-disable-next-line no-unused-vars
function RemoveSearch(searchKey = ``) {
  if (searchKey === ``) return
  chrome.storage.local.get(null, (store) => {
    const keys = Object.keys(store)
    for (const key of keys) {
      if (key.includes(`${searchKey}`)) chrome.storage.local.remove(key)
    }
  })
}

/**
 * Extension local storage interface.
 * @class LocalStore
 */
class LocalStore {
  constructor() {
    this.defaults = new Extension().defaults
    this.redundant = new Set().add(`runFileDownloads`).add(`runFileUrls`)

    // NOTE: The following MUST be disabled in production as it erases all the
    // storage objects whenever the Extension is reloaded.
    this.storageReset = false
    this.redundantTest = false
  }
  /**
   * Cleans up and validates RetroTxt storage requirements.
   * Intended for use when RetroTxt is loaded.
   */
  startup() {
    if (this.storageReset) {
      this.wipe()
      this.clean()
      return
    }
    if (this.redundantTest) chrome.storage.local.set({ runFileDownloads: true })
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
  onChanged(changes, areaName) {
    for (const item of Object.keys(changes)) {
      // newValue must be a string otherwise context menu errors will occur
      const oldValue = changes[item].oldValue,
        newValue = changes[item].newValue
      chrome.storage.local.get(Developer, (store) => {
        if (Developer in store) {
          if (typeof newValue === `undefined`)
            return console.log(
              `Storage.%s change 🡲 %c${item}%c.`,
              areaName,
              "text-decoration:line-through",
              "text-decoration:none",
            )
          if (typeof newValue === `object`) {
            console.log(
              `Storage.%s change 🡲 %s %c${oldValue}%c `,
              areaName,
              item,
              "text-decoration:line-through",
              "text-decoration:none",
            )
            if (newValue.length) console.log(newValue)
          } else
            console.log(
              `Storage.%s change 🡲 %s %c${oldValue}%c ${newValue}`,
              areaName,
              item,
              "text-decoration:line-through",
              "text-decoration:none",
            )
        }
      })
      if (`${oldValue}` === `undefined`) return
    }
  }
  /**
   * Erases local, session & Extension storage items that were created by RetroTxt.
   */
  wipe() {
    chrome.storage.local.clear(() => {
      console.log(`🖫 Deleted all RetroTxt chrome.storage.local items.`)
    })
  }
}

// eslint-disable-next-line no-unused-vars
function OpenOptions(page = ``) {
  const key = `optionTab`
  // the page aliases used by the omnibox input
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

/* global CheckLastError ConsoleLoad Developer Extension */
