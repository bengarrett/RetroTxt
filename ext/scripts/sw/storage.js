// filename: sw/storage.js
//
/*global CheckLastError ConsoleLoad Developer Extension */
/*exported OpenOptions RemoveSearch */

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`storage.js`)
})

// monitor saved changes to Options so the context menu can be updated
chrome.storage.onChanged.addListener((changes, areaName) => {
  new LocalStore().onChanged(changes, areaName)
})

// RemoveSearch removes all the stores that use a key containing searchKey.
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
    // storage objects whenever the Extension is reloaded
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
        newValue = `${changes[item].newValue}`
      chrome.storage.local.get(Developer, (store) => {
        if (Developer in store)
          console.log(
            `🖫 RetroTxt %sStorage %s change: %s 🡒 %s (%s).`,
            areaName,
            item,
            oldValue,
            newValue,
            typeof newValue
          )
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