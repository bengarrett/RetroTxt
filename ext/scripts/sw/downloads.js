// File: scripts/sw/downloads.js
//
// Apply RetroTxt transformations to text file downloads.
//
// Chrome is aggressive with its sanity checks and will refuse to open any file in
// a tab that it deems a binary or a dangerous file. A text file with control codes
// may be forcefully closed by the browser, even if the host server's HTTP information
// declares it's text.
//
// Firefox supports the API functionality needed to implement this feature,
// except it still fails due to a security design choice at Mozilla.
// 1. `file:///` access is a requirement to view any downloads in the browser.
// 2. Firefox refuses to open privileged URLs such as `file:///` without a user
// input handler, such as a button click.
// 3. Such access is initially granted but is lost by the time
// chrome.tabs.create({ active: false, url: url }) is run at the end of this._update().
// 4. Instead, one of the following errors will return:
//     ↳ "Error: downloads.open may only be called from a user input handler"
//     ↳ "Error: Illegal URL"

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`downloads.js`)
})

/**
 * Apply RetroTxt to any downloaded text files.
 * @class Downloads
 */
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
        `Downloads startup error, chrome.downloads API is inaccessible.`
      )
    if (`onCreated` in chrome.downloads === false)
      return CheckError(
        `Downloads startup error, chrome.downloads API onCreated event is inaccessible.`
      )
    const downloads = new Downloads(),
      security = new Security(`downloads`, `downloads`),
      test = security.test()
    switch (this.monitor) {
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
          if (!(`item` in downloads)) return
          if (!(`mime` in downloads.item)) return
          // catch all mime types that use binary types such as
          // `application/octet-stream`, `application/x-font`
          const config = new Configuration(),
            sixColors =
              downloads.item.finalUrl.startsWith(`https://16colo.rs/`),
            textFile = config.validateFileExtension(downloads.item.finalUrl),
            type = downloads.item.mime.split(`/`)
          if (!sixColors && type[0] === `application`) {
            if (
              `state` in downloads.delta &&
              downloads.delta.state.current === `complete`
            ) {
              if (textFile === true)
                console.warn(
                  `Downloaded filename looks to be a text file but the host server says it's a binary file: `,
                  downloads.item.finalUrl
                )
            }
            return
          }
          // check intended for 16colo.rs
          if (!textFile) return
          downloads._update()
        })
        break
      case false:
        chrome.downloads.onCreated.removeListener(this._create)
        chrome.downloads.onChanged.removeListener(this._update)
        break
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
    let subType = ``
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
      if (!(`id` in this.item)) return false
      const error = `Create download #${this.item.id} cannot be monitored as the`
      if (!(`url` in this.item)) return false
      if (!(`filename` in this.item)) {
        console.log(`${error} filename is missing.\n(${this.item.url})`)
        return false
      }
      // note: some browsers and sites leave the filename as an property empty
      // so as an alternative monitor method, the chrome.storage.local might also be set in this.update()
      if (this.item.filename.length < 1) {
        console.log(
          `${error} filename cannot be determined\n(${this.item.url})`
        )
        return false
      }
      if (this.item.url.length < 11) {
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
    if (!(`filename` in this.delta)) return false
    if (!(`current` in this.delta.filename)) return false
    const filename = this.delta.filename.current
    if (filename.length < 1) return false

    const valid = new Configuration().validateFilename(filename)
    console.log(
      `Update download #${this.delta.id} determined the filename of the download.\n"${filename}", and ${valid}, it is a text based file.`
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
      if (!(`id` in this.delta)) return
    }
    if (valid() === false) return
    this._setFilename()
    const itemName = `download${this.delta.id}-localpath`
    chrome.storage.local.get(itemName, (item) => {
      if (item === null) return
      const filepath = item[itemName]
      // handle errors, including cancelled downloads
      if (`error` in this.delta && `current` in this.delta.error)
        return chrome.storage.local.remove(itemName)
      // completed downloads
      if (`state` in this.delta === false) return
      if (`current` in this.delta.state === false) return
      if (this.delta.state.current !== `complete`) return
      chrome.storage.local.remove(itemName)
      // Windows friendly path conversion
      const path = filepath.replace(/\\/g, `/`),
        url = `file:///${path}`
      // note: see notes in class Downloads on why this may fail
      chrome.tabs.create({ active: false, url: url })
    })
  }
}

/*global CheckError CheckLastError Configuration Console ConsoleLoad Developer Extension Os Security WebBrowser */
/*exported Downloads */
