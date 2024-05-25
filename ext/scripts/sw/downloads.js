// File: scripts/sw/downloads.js
//
// Apply RetroTxt transformations to text file downloads.
//
// Chrome is aggressive with its sanity checks and will refuse to open any file in
// a tab that it deems a binary or a dangerous file. A text file with control codes
// may be forcefully closed by the browser, even if the host server's HTTP information
// declares it's text.

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`downloads.js`)
})

/**
 * Apply RetroTxt to any downloaded text files.
 * @class Downloads
 */
// eslint-disable-next-line no-unused-vars
class Downloads {
  /**
   * Creates an instance of Downloads.
   * @param [monitor=true] Monitor downloads `true` or `false` to ignore
   */
  constructor(monitor = true) {
    this.delta
    this.item
    this.monitor = monitor
  }
  /**
   * Monitor file downloads.
   */
  async startup() {
    if (WebBrowser() === Os.firefox) return
    // exit when chrome.downloads is inaccessible due Extensions configurations
    if (`downloads` in chrome === false)
      return CheckError(
        `Downloads startup error, chrome.downloads API is inaccessible.`,
      )
    if (
      typeof chrome.downloads === `undefined` ||
      `onCreated` in chrome.downloads === false
    )
      return CheckError(
        `Downloads startup error, chrome.downloads API onCreated event is inaccessible.`,
      )
    const downloads = new Downloads(),
      security = new Security(`downloads`, `downloads`),
      test = security.test()
    switch (this.monitor) {
      case false:
        chrome.downloads.onCreated.removeListener(this._create)
        chrome.downloads.onChanged.removeListener(this._update)
        return
      case true:
        chrome.downloads.onCreated.addListener((item) => {
          if (CheckLastError(`on created downloads`)) return
          downloads.item = item
          // security check blocks `downloads.create()`
          // otherwise any Options changes will require an Extension reload
          chrome.permissions.contains(test, (result) => {
            if (result !== true) {
              chrome.storage.local.get(Developer, (store) => {
                if (Developer in store) security.fail()
              })
              return // abort
            }
            downloads._create()
          })
        })
        chrome.downloads.onChanged.addListener((delta) => {
          if (CheckLastError(`on changed downloads`)) return
          downloads.delta = delta
          // a fix for the endless loop issue, where Chrome incorrectly
          // identifies a text file as a binary (application/octet-stream)
          // and forces the file to download instead of render in a tab
          if (!Object.hasOwn(downloads, `item`)) return
          if (!Object.hasOwn(downloads.item, `mime`)) return
          // required by defacto2.net
          if (
            Object.hasOwn(delta, `filename`) &&
            Object.hasOwn(delta.filename, `current`)
          ) {
            if (downloads.item.filename === ``) {
              downloads.item.filename = delta.filename.current
            }
          }
          // catch all mime types that use binary types such as
          // `application/octet-stream`, `application/x-font`
          const config = new Configuration(),
            textFile = config.validateFileExtension(downloads.item.filename),
            type = downloads.item.mime.split(`/`)

          const url = new URL(downloads.item.finalUrl)
          const allowedHosts = ["16colo.rs", "defacto2.net", "www.defacto2.net"]
          if (
            !allowedHosts.includes(url.hostname) &&
            type[0] === `application`
          ) {
            if (
              Object.hasOwn(downloads.delta, `state`) &&
              downloads.delta.state.current === `complete`
            ) {
              if (textFile === true)
                console.warn(
                  `Downloaded filename looks to be a text file but the host server says it's a binary file: `,
                  downloads.item.finalUrl,
                )
            }
            return
          }
          // check intended for 16colo.rs & defacto2
          if (type[0] !== `text` && !textFile) return
          if (
            Object.hasOwn(delta, `filename`) &&
            Object.hasOwn(delta.filename, `current`)
          ) {
            downloads._update()
          }
        })
        return
    }
  }
  /**
   * Determines if the data blob is a text file.
   * @param [data] Fetch API data blob
   * @param [tab={}] Tab object
   */
  parseBlob(data, tab = {}, test = false) {
    // Blob object API: https://developer.mozilla.org/en-US/docs/Web/API/Blob
    // mime type split (text/plain)
    const split = data.type.split(`/`, 2)
    // if `data.type.split` is empty, then the browser couldn't work out the MIME
    // type. it is assumed to be a text file, as the browser didn't attempt to
    // download or render
    const format = split[0] || `text`
    let subType
    if (split[0] === ``) {
      console.log(`Tab #%s Blob MIME type is unknown.`, tab.tabid)
      subType = `unknown`
    }
    // sub-type split, ie `plain;charset=iso-8859-1`
    else subType = split[1].split(`;`, 1)[0]
    // data
    const reader = new FileReader()
    switch (format) {
      case `text`: {
        switch (subType) {
          case `plain`:
          case `x-nfo`:
          case `unknown`: {
            // check to make sure `text/plain` is not HTML, XML or other markup
            reader.onload = (loadedEvent) => {
              const text = loadedEvent.target.result.trim()
              // if the body starts with <! or <? then it is most likely markup
              const markUpCheck = [`<!`, `<?`].includes(text.substring(0, 2))
              if (test === true) return markUpCheck
              if (markUpCheck === false) {
                Console(`Retrotxt activated on tab #${tab.tabid}.\n${tab.url}`)
                new Extension().activateTab(tab, data)
              }
            }
            if (test === false) return reader.readAsText(data.slice(0, 2))
          }
        }
      }
    }
    if (test === true) return false
    // if tab is not holding a text file
    Console(`Skipped Retrotxt execution on tab #${tab.tabid}.\n${tab.url}`)
    return
  }
  /**
   * Initialise the new file download so RetroTxt can monitor the download state.
   */
  _create() {
    // sanity checks
    const valid = () => {
      if (!Object.hasOwn(this.item, `id`)) return false
      const error = `Create download #${this.item.id} cannot be monitored as the`
      if (!Object.hasOwn(this.item, `url`)) return false
      if (!Object.hasOwn(this.item, `filename`)) {
        console.log(`${error} filename is missing.\n(${this.item.url})`)
        return false
      }
      // defacto2.net special case
      const url = new URL(this.item.url)
      const allowedHosts = ["defacto2.net", "www.defacto2.net"]
      if (allowedHosts.includes(url.hostname)) {
        return true
      }
      // note: some browsers and sites leave the filename as an property empty
      // so as an alternative monitor method, the chrome.storage.local might also be set in this.update()
      if (this.item.filename.length < 1) {
        // attempt to determine the filename from the URL
        const url = new URL(this.item.url)
        const filename = url.pathname.split("/").pop()
        this.item.filename = filename
        if (new Configuration().validateFilename(filename) === true) {
          return true
        }
        console.log(
          `${error} filename cannot be determined\n"${this.item.filename}" for (${this.item.url})`,
        )
        return false
      }
      const minimum = 11
      if (this.item.url.length < minimum) {
        console.log(`${error} URL is invalid\n(${this.item.url})`)
        return false
      }
      return true
    }
    if (valid() === false) return
    // only monitor HTTP downloads
    const config = new Configuration(),
      schemes = [`http`, `https`],
      scheme = this.item.url.split(`:`)[0]
    if (schemes.includes(scheme) === false) return
    // check filename extension isn't an obvious non-text file
    if (!config.validateFilename(this.item.filename)) return
    // location of saved local file
    chrome.storage.local.set({
      [`download${this.item.id}-localpath`]: `${this.item.filename}`,
    })
  }
  _setFilename() {
    if (!Object.hasOwn(this.delta, `filename`)) return false
    if (!Object.hasOwn(this.delta.filename, `current`)) return false
    const filename = encodeURI(this.delta.filename.current)
    if (filename.length < 1) return false
    const valid = new Configuration().validateFilename(filename)
    console.log(
      `Update download #${this.delta.id} determined the filename of the download.\n"${filename}", and ${valid}, it is a text based file.`,
    )
    if (!valid) return false
    chrome.storage.local.set({
      [`download${this.delta.id}-localpath`]: `${filename}`,
    })
    return true
  }
  /**
   * Handle changes to the download state including aborts and completed downloads.
   * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/onChanged
   * @param [data={}] Download item properties and status of changes
   */
  _update() {
    // sanity checks
    const valid = () => {
      return Object.hasOwn(this.delta, `id`)
    }
    if (valid() === false) return
    this._setFilename()
    const itemName = `download${this.delta.id}-localpath`
    chrome.storage.local.get(itemName, (item) => {
      if (item === null) return
      const filepath = item[itemName]
      // handle errors, including cancelled downloads
      if (
        Object.hasOwn(this.delta, `error`) &&
        Object.hasOwn(this.delta.error, `current`)
      )
        return chrome.storage.local.remove(itemName)
      // 10-Feb-2024
      // This is a need to handle two situations:
      // 1) with this.delta.state.current
      // 2) another with this.delta.current but no state
      switch (typeof this.delta.state) {
        case `undefined`: {
          if (!Object.hasOwn(this.delta, `filename`)) return
          if (!Object.hasOwn(this.delta.filename, `current`)) return
          if (this.delta.filename.current === ``) return
          break
        }
        default: {
          if (!Object.hasOwn(this.delta, `state`)) return
          if (!Object.hasOwn(this.delta.state, `current`)) return
          if (this.delta.state.current !== `complete`) return
        }
      }
      chrome.storage.local.remove(itemName)
      // Windows friendly path conversion
      const path = filepath.replace(/\\/g, `/`),
        url = `file:///${path}`
      console.log(`Download should open in tab: ${url}`)
      // note: see notes in class Downloads on why this may fail
      chrome.tabs.create({ active: false, url: url })
    })
  }
}

/*global CheckError CheckLastError Configuration Console ConsoleLoad Developer Extension Os Security WebBrowser */
