// filename: eventpage.js
//
// The WebExtension background page run by the browser on load or by RetroTxt on load or refresh.
'use strict'

/*global chrome findEngine checkArg checkRange ListDefaults*/

function checkErr(err, log = false)
// Error handler for eventpage.js
// @err   String containing the error
// @log   When true, err are logged to the browser Console
//        Otherwise checkErr throws a JS exception and aborts
{
  const debug = false
  if (err !== undefined) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0] !== undefined) {
        chrome.tabs.sendMessage(tabs[0].id, { error: err, id: `checkErr` }, r => {
          if (debug && r !== undefined) console.log(r) // debug message passing
        })
      }
    })
    if (log === false) {
      try { throw new Error(err) }
      catch (e) { console.error(e) }
    }
    else console.warn(err)
  }
}

// Constructors containing reusable defaults

function ListMenuTitles()
// context menu item titles
{
  this.amiga = `Amiga`
  this.appleii = `Apple II`
  this.atarist = `Atari ST`
  this.c64 = `Commodore 64`
  this.ibmps2 = `IBM PS/2`
  this.linux = `Terminal black`
  this.msdos = `IBM PC`
  this.windows = `Terminal white`
  this.textOrder = [`textFontInformation`, `textCenterAlignment`, `textBgScanlines`]
  this.textBgScanlines = `Scanlines`
  this.textCenterAlignment = `Text alignment`
  this.textFontInformation = `Text and font information`
  this.codeOrder = [`codeAutomatic`, `codeMsDos0`, `codeWindows`, `codeMsDos1`, `codeLatin9`, `codeNone`]
  this.codeAutomatic = `System guess`
  this.codeMsDos0 = `↺ CP-1252`
  this.codeWindows = `↻ CP-1252`
  this.codeMsDos1 = `↺ ISO 8859-5`
  this.codeLatin9 = `↻ ISO 8859-15`
  this.codeNone = `↻ US-ASCII`
  this.codeUnicode = `↻ UTF-8`
}

function ListSettings()
// Options settings
{
  // boolean
  this.textBgScanlines = false
  this.textDosCtrlCodes = false
  this.textAnsiIceColors = true
  this.textEffect = `normal`
  this.textCenterAlignment = true
  this.textFontInformation = true
  this.runFileDownloads = true
  this.runFileUrls = true
  this.runWebUrls = true
  // 1-bit colour, font & line height
  this.retroColor = `msdos`
  this.retroFont = `vga8`
  this.lineHeight = `100%`
  // other
  this.updatedNotice = true
  this.runWebUrlsPermitted = [`defacto2.net`, `gutenberg.org`, `scene.org`, `textfiles.com`, `uncreativelabs.net`]
  this.schemesPermitted = [`file`, `http`, `https`]
}

function ListThemes()
// font and colour themes to use with the context menus
{
  this.order = [`linux`, `windows`, `-`, `ibmps2`, `msdos`, `amiga`, `appleii`, `atarist`, `c64`] // order of display
  this.amiga = { retroFont: `topazA500`, retroColor: `theme-amiga` }
  this.appleii = { retroFont: `appleii`, retroColor: `theme-appleii` }
  this.atarist = { retroFont: `atarist`, retroColor: `theme-atarist` }
  this.c64 = { retroFont: `c64`, retroColor: `theme-c64` }
  this.ibmps2 = { retroFont: `iso8`, retroColor: `theme-msdos` }
  this.linux = { retroFont: `monospace`, retroColor: `theme-msdos` }
  this.msdos = { retroFont: `vga8`, retroColor: `theme-msdos` }
  this.windows = { retroFont: `monospace`, retroColor: `theme-windows` }
}

// This runs when eventpage.js is loaded by the browser
(function () {
  // exit if running a qunit test
  if (typeof qunit !== `undefined`) return
  // browser failure
  if (chrome === undefined) {
    checkErr(`RetroTxt failed to run because the browser's WebExtension API did not load! Please close this browser and try again.`)
  }
  // Un-comment this to clear all stored items when testing
  // wipeStorage();

  const browserEngine = findEngine()
  const configurations = new ListSettings()
  // Contexts types for RetroTxt's context menus
  // browser_action, tool bar button
  // page, right click on the body of the web page / text file
  const contexts = [`browser_action`, `page`] // add any context types here

  // Set default options for first-time users
  // see options.js for other similar listeners
  const menuSupport = (chrome.contextMenus.onClicked !== undefined)
  if (menuSupport === true) buildMenus(contexts)
  // on installed behaviour
  chrome.runtime.onInstalled.addListener((details) => {
    initStorage()
    switch (details.reason) {
      case `install`:
        chrome.tabs.create({ url: chrome.extension.getURL(`welcome.html`) })
        break
      case `update`:
        chrome.storage.local.get(`updatedNotice`, result => {
          const r = result.updatedNotice
          if (r === false) return // do not show updated notice
          else chrome.tabs.create({ url: chrome.extension.getURL(`welcome.html#update`) })
        })
        break
      default:
      // browser_update
      // shared_module_update
    }
  })

  // remove comments to debug each function
  //checkErr(`Testing 1, 2, 3`)
  //buildMenus(contexts)
  //initStorage()

  // Listen and handle messages from content scripts
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // receive messages from runRetroTxt() that a tabs content has changed
    if (typeof request.retroTxtified === `boolean`) {
      // update the toolbar button
      const tabId = sender.tab.id
      changeToolbar(tabId, request.retroTxtified)
    } else if (typeof request.askForSettings !== `undefined`) {
      // request for ListSettings()
      const listSettings = new ListSettings()
      sendResponse({ response: listSettings })
    } else {
      // unknown
      console.warn(`This unexpected message was received by handleMessage().`)
      console.warn(request)
    }
  })

  // Browser tab activated listener
  chrome.tabs.onActivated.addListener(info => {
    // this refreshes the context menu for the active tab
    //console.log(`Activated tab id ${activeInfo.tabId}.`)
    const tabId = info.tabId
    const text = sessionStorage.getItem(`tab${tabId}textfile`)
    if (typeof tabText === `string` && text.length > 0) {
      switch (text) {
        case `true`:
          changeToolbar(tabId, false)
          return changeMenuStates(true)
        case `false`:
          changeToolbar(tabId)
          return changeMenuStates(false)
        default:
          checkErr(`Could not run changeToolbar() as the sessionStorage tab${tabId}textfile value was not "true" or "false".`)
          return changeMenuStates(false)
      }
    }
  })

  // Implement event listeners for browser tabs
  listenForTabs()

  // Implement event listeners for file downloads
  listenForDownloads()

  // Browser action (tool bar button) onClick event
  chrome.browserAction.onClicked.addListener(tab => {
    const scheme = tab.url.split(`:`)[0].toLowerCase()
    const valid = configurations.schemesPermitted.includes(scheme)
    if (valid === true) {
      eventClick(tab)
    } else {
      // disable button if it hasn't been already
      chrome.browserAction.disable(tab.id)
      changeToolbar(tab.id)
    }
  })

  // Monitor saved changes to Options, so the context menu can be updated
  chrome.storage.onChanged.addListener(changes => {
    for (const item of Object.keys(changes)) {
      const newValue = changes[item].newValue
      switch (item) {
        case `textFontInformation`:
        case `textCenterAlignment`:
        case `textBgScanlines`: changeMenuState(item, newValue); break
        default:
      }
    }
  })

  // Context menus on-clicked events
  if (chrome.contextMenus.onClicked !== undefined) {
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      const autorun = localStorage.getItem(`runWebUrls`)
      switch (info.menuItemId) {
        case `options`: chrome.runtime.openOptionsPage(); break
        case `textFontInformation`:
        case `textCenterAlignment`:
        case `textBgScanlines`: {
          changeMenuCheckmark(info.menuItemId); break
        }
        case `amiga`:
        case `appleii`:
        case `atarist`:
        case `c64`:
        case `ibmps2`:
        case `linux`:
        case `msdos`:
        case `windows`: {
          changeTheme(info.menuItemId); break
        }
        case `codeAutomatic`:
        case `codeMsDos0`:
        case `codeMsDos1`:
        case `codeLatin9`:
        case `codeNone`:
        case `codeUnicode`:
        case `codeWindows`: {
          // see handleMessages() in retrotxt.js for the event handler
          chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: info.menuItemId,
              id: `transcode`
            }, () => {
              // save a session item to tell RetroTxt how to render the text on
              // this tab. session storage is isolated to the one active tab.
              sessionStorage.setItem(`transcode`, info.menuItemId)
            })
          })
          break
        }
        case `helpbrowser`:
        case `helppage`: {
          chrome.tabs.create({ 'url': chrome.i18n.getMessage(`url_help`) }); break
        }
      }
      // If a theme option is clicked while viewing the browser default text
      // then we should also apply the new theme.
      if (typeof autorun !== `string` || autorun === `false`) {
        switch (info.menuItemId) {
          case `msdos`:
          case `windows`:
          case `amiga`:
          case `appleii`:
          case `atarist`:
          case `c64`:
          case `ibmps2`:
          case `linux`: callbackExe(null, tab); break
        }
      }
    })
  }

  // Initialisation of storage and generate context menu on browser launch and extension load
  console.info(`RetroTxt is being initialised for the ${browserEngine.charAt(0).toUpperCase()}${browserEngine.slice(1)} engine.`)


  window.addEventListener(`loadend`, function () {
    console.log(`Hi?`)
  })
})()

async function buildMenus(contexts)
// Creates the context menus used on pages and on the task bar button
// @contexts  An object containing a collection of contextMenus context values
{
  if (typeof contexts !== `object`) checkArg(`contexts`, `object`, contexts)
  const docMatches = [`http://*/*`, `https://*/*`, `file:///*`]
  const styles = new ListThemes()
  const titles = new ListMenuTitles()
  // Remove any existing menus to avoid, undetected errors within callbacks
  chrome.contextMenus.removeAll()
  // Only show the context menu with page schemes that match docMatches
  chrome.contextMenus.create({
    'title': `Options`,
    'contexts': [`page`],
    'documentUrlPatterns': docMatches,
    'id': `options`
  })
  chrome.contextMenus.create({
    'title': `Help`,
    'contexts': [`browser_action`],
    'documentUrlPatterns': docMatches,
    'id': `helpbrowser`
  })
  chrome.contextMenus.create({
    'title': `Display`,
    'contexts': contexts,
    'documentUrlPatterns': docMatches,
    'id': `displaysub`
  })
  // generate `Display` child items
  for (const id of titles.textOrder) {
    chrome.contextMenus.create({
      'type': `checkbox`,
      'checked': false,
      'title': titles[id],
      'contexts': contexts,
      'id': id,
      'parentId': `displaysub`,
      'documentUrlPatterns': docMatches
    })
  }
  chrome.contextMenus.create({
    'type': `separator`,
    'contexts': [`page`],
    'id': `sep1`,
    'documentUrlPatterns': docMatches
  })
  chrome.contextMenus.create({
    'title': `Transcode text`,
    'contexts': contexts,
    'documentUrlPatterns': docMatches,
    'id': `transcode`
  })
  // generate `Transcode text` child items
  for (const id of titles.codeOrder) {
    chrome.contextMenus.create({
      'type': `normal`,
      'title': titles[id],
      'contexts': contexts,
      'id': id,
      'parentId': `transcode`,
      'documentUrlPatterns': docMatches
    })
  }
  chrome.contextMenus.create({
    'type': `separator`,
    'contexts': contexts,
    'documentUrlPatterns': docMatches,
    'id': `sep2`
  })
  // generate Theme items
  for (const id of styles.order) {
    if (id === `-`) {
      chrome.contextMenus.create({
        'type': `separator`,
        'contexts': [`page`],
        'id': `sepT`,
        'documentUrlPatterns': docMatches
      })
    } else {
      chrome.contextMenus.create({
        'type': `checkbox`,
        'contexts': [`page`],
        'checked': false,
        'title': titles[id],
        'id': id,
        'documentUrlPatterns': docMatches
      })
    }
  }
  chrome.contextMenus.create({
    'type': `separator`,
    'contexts': [`page`],
    'documentUrlPatterns': docMatches,
    'id': `sep3`
  })
  chrome.contextMenus.create({
    'title': `Help`,
    'contexts': [`page`],
    'documentUrlPatterns': docMatches,
    'id': `helppage`
  })
}

function callbackExe(tabid = 0, type = ``)
// Browser tab callback to execute RetroText
// @tabid     Required id of the tab
// @encoding  Optional string to state the text's encoding
{
  //console.log(`callbackExe(${tabid},${type})`)
  chrome.tabs.executeScript(tabid, {
    file: `functions.js`, runAt: `document_start`
  }, () => {
    // automatic execute, to be run after this js is loaded and at the start of the document
    chrome.tabs.executeScript(tabid, {
      code: `runSpinLoader()`, runAt: `document_start`
    })
  })
  chrome.tabs.executeScript(tabid, {
    file: `text_ecma48.js`, runAt: `document_start`
  })
  chrome.tabs.executeScript(tabid, {
    file: `text_ecma94.js`, runAt: `document_start`
  })
  chrome.tabs.executeScript(tabid, {
    file: `text_cp_dos.js`, runAt: `document_start`
  })
  chrome.tabs.executeScript(tabid, {
    file: `retrotxt.js`, runAt: `document_start`
  }, () => {
    // automatic execute, has to be run after retrotxt.js is loaded
    chrome.tabs.executeScript(tabid, {
      code: `runRetroTxt(${tabid},"${type.toUpperCase()}")`, runAt: `document_end`
    })
  })
}

function callbackTab(data, tab)
// Applies RetroTxt to an active HTTP browser tab.
{
  if (data === null || data.type === undefined) {
    data = { type: `US-ASCII` }
  }
  // Is the tab hosting a text file and what is the page encoding?
  sessionStorage.setItem(`tab${tab.tabid}textfile`, true)
  sessionStorage.setItem(`tab${tab.tabid}encoding`, data.type)
  changeToolbar(tab.tabid, false)
  // if tab has previously been flagged as 'do not autorun' then finish up
  if (sessionStorage.getItem(`tab${tab.tabid}execute`) === `false`) return
  // otherwise execute RetroTxt on the tab
  const execute = localStorage.getItem(`runWebUrls`)
  if (typeof execute !== `string` || execute === `false`) return // if unchecked
  callbackExe(tab.tabid, data.type)
}

function changeMenuCheckmark(key = ``)
// This function is used by the context menus to switch and save Options settings.
// @key       Name of storage item to switch (must hold a boolean value)
{
  if (typeof key !== `string`) checkArg(`key`, `string`, key)
  else if (key.length < 1) checkRange(`key`, `length`, `1`, key.length)
  const def = new ListSettings()
  const nv = () => {
    switch (localStorage.getItem(key)) {
      case `true`: return false
      case `false`: return true
      default: return def[key] // no existing local storage for setting
    }
  }
  const newValue = nv()
  // create and save setting object to local storage
  const setting = { [key]: newValue }
  localStorage.setItem(key, newValue)
  chrome.storage.local.set(setting, checkErr)
  // update any context menus to apply
  changeMenuState(key, newValue)
}

function changeMenuState(menuid = ``, state = true)
// Applies and removes check-marks for context menu, check-box type items
{
  if (typeof menuid !== `string`) checkArg(`menuid`, `string`, menuid)
  else if (menuid.length < 1) checkRange(`menuid`, `length`, `1`, menuid.length)
  if (typeof state !== `boolean`) checkArg(`state`, `boolean`, state)

  chrome.contextMenus.update(menuid, { 'checked': state })
}

function changeMenuStates(state)
// Because you can apply unique context menus to individual tabs, we refresh
// the RetroTxt menus whenever the active tab is switched.
// @state  Required boolean to enable or disable the context menu
{
  if (typeof state !== `boolean`) checkArg(`state`, `boolean`, state)
  const ids = [`transcode`] // leave all menus items except ...
  for (const id in ids) {
    chrome.contextMenus.update(ids[id], { 'enabled': state })
  }
}

function changeTheme(theme = ``)
// Used by the context menus this switches the active RetroTxt font and colour
// combinations to a predefined theme.
// @theme Name of the theme to apply [see themes()]
{
  if (typeof theme !== `string`) checkArg(`theme`, `string`, theme)
  else if (theme.length < 1) checkRange(`theme`, `length`, `1`, theme.length)
  const collection = new ListThemes()
  const style = collection[theme]
  if (typeof style !== `object`) checkErr(`theme name "${theme}" could not be found in themes()`)
  else {
    localStorage.setItem(`retroFont`, style.retroFont)
    localStorage.setItem(`retroColor`, style.retroColor)
    chrome.storage.local.set({ 'retroFont': `${style.retroFont}` })
    chrome.storage.local.set({ 'retroColor': `${style.retroColor}` })
    // remove any existing theme menu check-marks
    for (const id of collection.order) {
      if (id === `-`) continue
      if (theme !== id) changeMenuState(id, false)
    }
    // add new check-mark
    changeMenuState(theme, true)
  }
}

async function changeToolbar(tabId = 0, state = null)
// Modifies the RetroTxt button located on the browser's tool bar
{
  function action(title) {
    chrome.browserAction.enable(tabId)
    chrome.browserAction.setTitle({ title: title, tabId: tabId })
  }
  // button config for when the tab is not containing a text file
  if (state === null) return chrome.browserAction.disable(tabId)
  // tab contains a text file
  if (state === false) action(`RetroTxtify text`)
  else if (state === true) action(`Revert to the original text`)
  else {
    action(`RetroTxt only works on text files`)
    checkErr(`A non-boolean type was passed into the state argument in changeToolbar()`)
  }
}

function eventClick(tab, verbose = false)
// Tool bar button click callback to execute RetroText
// @tab  Required tab information object otherwise the function will do nothing
{
  if (typeof tab !== `object` || typeof tab.url !== `string` || tab.url.length === 0) {
    return console.warn(`RetroTxt could not determine the browser's active tab.`)
  }
  if (typeof tab.id === `number` && tab.id > 0) {
    // sessionStorage only saves strings
    const page = { 'state': null, 'type': null, }
    // determine if active tab is a text file and save the results to a sessionStore
    // this is to reduce any future, expensive HTTP HEAD requests
    page.state = sessionStorage.getItem(`tab${tab.id}textfile`)
    if (typeof page.state !== `string`) {
      if (tab.url.split(`:`)[0] === `file`) sessionStorage.setItem(`tab${tab.id}execute`, `false`)
      // check the tab & then refetch session storage
      urlCheck(0, tab.url, tab.id)
      page.state = sessionStorage.getItem(`tab${tab.id}textfile`)
      page.type = sessionStorage.getItem(`tab${tab.id}encoding`)
    } else {
      // use existing sessionStore results
      page.type = sessionStorage.getItem(`tab${tab.id}encoding`)
    }
    if (page.state === `true`) {
      if (verbose) console.log(`RetroTxt has detected the active tab ${tab.id} displaying ${tab.url} is a text file encoded as ${page.type}.`)
      callbackExe(tab.id, page.type)
    }
  }
}

function eventUrl(menuId = ``, url = ``, tabId = 0)
// Used with events listeners, this decides whether to create context menus
// and whether to run RetroTxt, as determined by the URL of the active tab.
// @url     URL to check
// @menuId  The name of the initial event that created the context menu
// @tabId   Optional tab ID used for ticking off tabs that have been processed
{
  if (typeof menuId !== `string`) checkArg(`menuId`, `string`, menuId)
  else if (menuId.length < 1) checkRange(`menuId`, `length`, `1`, menuId.length)
  if (typeof url !== `string`) checkArg(`url`, `string`, url)
  else if (url.length < 1) checkRange(`url`, `length`, `1`, url.length)

  // make sure that we don't attempt to process browser tabs with ftp or about/config pages
  if (url !== chrome.extension.getURL(`welcome.ans`)) {
    if (url.startsWith(`ftp://`) === true || url.startsWith(`chrome`) === true || url.includes(`://`) === false) {
      return console.info(`Aborted RetroTxt as the URI scheme of the active tab \n${url} is not based on HTTP.`)
    }
  }
  // get and parse the tab's url
  const cfg = new ListDefaults()
  const uri = { domain: removeSubDomains(url), scheme: url.split(`:`)[0], }
  // Option `Apply RetroTxt to any text files hosted on these websites`
  let domains = localStorage.getItem(`runWebUrlsPermitted`)
  let approved = false
  if (typeof domains !== `string` || domains.length === 0) {
    chrome.storage.local.get(`runWebUrlsPermitted`, result => {
      const r = result.runWebUrlsPermitted
      if (r === undefined || r.length < 1) checkErr(`Could not obtain the required runWebUrlsPermitted setting requested by eventUrl().`, true)
      else localStorage.setItem(`runWebUrlsPermitted`, r)
    })
    domains = localStorage.getItem(`runWebUrlsPermitted`)
    if (typeof domains !== `string` || domains.length === 0) {
      // redundancy in case localStorage doesn't work
      domains = cfg.autoDomains
    }
  }
  // insert the RetroTxt URL into the approved list
  // see _locales/en_US/messages.json url for the http address
  if (typeof domains === `string`) domains = `${chrome.i18n.getMessage(`url`)};${domains}`
  // list of approved website domains
  if (typeof approved === `string`) approved = approved.split(`;`)
  approved = domains.includes(uri.domain)
  // As the urlCheck() function silently breaks functionality with some
  // secured website logins such as online banks. It must NEVER be run passively
  // in the eventpage.js except for preselected web domains.
  if (url === chrome.extension.getURL(`welcome.ans`)) urlCheck(menuId, url, tabId)
  else if (uri.scheme !== `file` && approved !== true) return
  urlCheck(menuId, url, tabId)
}

function initStorage()
// Sets RetroTxt default Options for the user if they are missing
{
  localStorage.clear()
  sessionStorage.clear()

  const init = new ListSettings()
  const titles = new ListMenuTitles()
  // Get all of RetroTxt stored items
  chrome.storage.local.get(null, result => {
    let saved = ``
    // Set defaults for the text theme
    const themes = [`lineHeight`, `retroColor`, `retroFont`]
    for (const item of themes) {
      const val = result[item]
      if (typeof val !== `string`) {
        saved = init[item]
        if (item === `retroColor` && saved.startsWith(`theme-`) === false) {
          saved = `theme-${saved}`
        }
        chrome.storage.local.set({ [item]: saved }) // dynamic key-name
      } else saved = val
      localStorage.setItem(item, saved)
      console.log(`Configured ${item} to '${saved}'.`)
    }
    // update context menus
    const themeObj = new ListThemes()
    const defTheme = themeObj[init.retroColor]
    if (defTheme.retroColor === result.retroColor && defTheme.retroFont === result.retroFont) {
      changeMenuState(init.retroColor, true)
    }

    // Default white list of permitted domains to auto-run RetroTxt
    let r = result.runWebUrlsPermitted
    if (typeof r === `undefined` || r.length === 0) {
      r = init.runWebUrlsPermitted.join(`;`)
      localStorage.setItem(`runWebUrlsPermitted`, r)
      chrome.storage.local.set({ 'runWebUrlsPermitted': r })
    }
    saved = r
    localStorage.setItem(`runWebUrlsPermitted`, saved)
    console.log(`Configured runWebUrlsPermitted to '${saved}'.`)

    // Apply defaults to any other missing options
    for (const name in init) {
      // skip these items as they have been configured in the code above
      if ([`lineHeight`, `retroColor`, `retroFont`, `runWebUrlsPermitted`].indexOf(name) > -1) continue
      saved = result[name]
      if (typeof saved === `undefined`) {
        // use default settings
        const item = { [name]: init[name] }
        localStorage.setItem(name, init[name])
        chrome.storage.local.set(item)
        saved = init[name]
      } else {
        // use user's stored settings
        localStorage.setItem(name, saved)
      }
      console.log(`Configured ${name} to '${saved}'.`)
      // apply any needed check marks on context menus
      if (titles.textOrder.includes(name) === true) {
        changeMenuState(name, saved)
      }
    }
    console.info(`RetroTxt configuration complete.`)
  })
}

async function listenForDownloads(state = true)
// Creates event listeners to monitor user file downloads
// NOTE this feature does not work with Firefox/Gecko as the
// chrome.downloads.onChanged event does not seem to trigger in the browser
{
  if (typeof state !== `boolean`) checkArg(`state`, `boolean`, state)
  if (findEngine() === `gecko`) return

  function create(dl)
  // Listen for new file downloads
  {
    checkErr(chrome.runtime.lastError, true)
    const cfg = new ListDefaults()
    const run = localStorage.getItem(`runFileDownloads`)
    if (typeof run !== `string` || run !== `true`) return // if Option is disabled, exit
    // we only want to monitor web downloads aka HTTP://, HTTPS://
    if (dl.url !== undefined && dl.url.length > 0) {
      const schemes = [`http`, `https`]
      const scheme = dl.url.split(`:`)[0]
      if (schemes.includes(scheme) === false) return
    }
    // The supplied meta-data varies between host web servers and user browsers
    // So assume every download is a text file until the evidence says otherwise
    if (dl.filename !== undefined && dl.filename.length > 0) {
      // check file name extension isn't an obvious non-text file
      if (matchExts(dl.filename, cfg.avoidFileExtensions) === true) return
    }
    if (dl.mime !== undefined && dl.mime.length > 0) {
      // check mime-type isn't an obvious web text file (html, js, css, xml...)
      const mimes = [`text/plain`, `application/octet-stream`]
      if (mimes.includes(dl.mime) === false) return
    }
    if (dl.id === undefined) return
    // otherwise assume download is a possible text file & save its id for monitoring
    // console.log("RetroTxt detected a possible text file download")
    sessionStorage.setItem(`download${dl.id}`, dl.id)
  }

  function change(delta)
  // Listen for file downloads state-change
  {
    checkErr(chrome.runtime.lastError, true)
    if (delta.id === undefined) return
    const cfg = new ListDefaults()
    const item = sessionStorage.getItem(`download${delta.id}`)
    // only handle downloads with ids that we have saved for monitoring
    if (item === null || `${delta.id}` !== item) return
    // handle different changed states
    // all errors including cancelled downloads
    if (`error` in delta && `current` in delta.error) {
      sessionStorage.removeItem(`download${delta.id}`)
      return
    }
    // location of saved local file
    if (`filename` in delta && `current` in delta.filename) {
      const file = delta.filename.current
      if (file.length > 0) {
        // check the file name of the saved file to double check it's not an
        // obvious non-text file
        if (matchExts(file, cfg.avoidFileExtensions) === true) {
          sessionStorage.removeItem(`download${delta.id}`)
          return
        }
        sessionStorage.setItem(`download${delta.id}localpath`, delta.filename.current)
      }
    }
    // completed downloads
    if (`state` in delta && `current` in delta.state) {
      if (delta.state.current === `complete`) {
        // Open a new tab with the loaded text file
        // Chrome will force-close the tab if it believes the file is binary or dangerous
        const store = sessionStorage.getItem(`download${delta.id}localpath`)
        const path = store.replace(/\\/g, `/`) // Windows friendly path conversion
        chrome.tabs.create({ active: false, url: `file:///${path}`, })
      }
    }
  }

  // No support for Gecko 47 and Edge
  if (chrome.downloads.onChanged !== undefined && chrome.downloads.onCreated !== undefined) {
    switch (state) {
      case true:
        chrome.downloads.onCreated.addListener(create)
        chrome.downloads.onChanged.addListener(change)
        break
      case false:
        chrome.downloads.onCreated.removeListener(create)
        chrome.downloads.onChanged.removeListener(change)
        break
    }
  }
  return
}

async function listenForTabs(state = true, test = false)
// Creates event listeners to monitor changes with a browser's tabs
{
  if (typeof state !== `boolean`) checkArg(`state`, `boolean`, state)
  if (typeof test !== `boolean`) checkArg(`test`, `boolean`, test)

  function create(tab)
  // Listen for created browser tabs
  {
    changeToolbar(tab.id)
    chrome.tabs.query({ 'status': `complete` }, () => {
      if (typeof tab.status === `string`) {
        const url = tab.url
        if (url.length === 0) { /* do nothing */ }
        else if (tab.active === false && tab.status === `loading` && url.startsWith(`file:///`) === true) {
          // when tab is not active, tab.status "complete" is not returned by Chrome
          eventUrl(`onCreated`, url, tab.id)
        } else if (tab.status === `complete`) {
          console.log(`Help ${url}`)
          console.log(tab)
          eventUrl(`onCreated`, url, tab.id)
        }
      }
    })
  }

  function update(tabId, changeInfo, tab)
  // Listen for refreshed tabs
  {
    changeToolbar(tabId)
    // here we parse the tab's URL to refresh the RetroTxt tool bar button
    if (typeof tab === `object`) {
      if (typeof changeInfo.status !== `undefined` && changeInfo.status === `complete` || tab.status === `complete`) {
        const configurations = new ListSettings(),
          scheme = tab.url.split(`:`)[0].toLowerCase(),
          valid = configurations.schemesPermitted.includes(scheme)
        if (valid === true) changeToolbar(tabId, false)
      }
    }
    // many web apps also trigger this listener so we make sure the browser tab
    // is activate and not running in the background
    if (typeof tab !== `object` || tab.active !== true) return // abort
    // a work around for when new `file:///` tabs trigger both create() and handleUpdated()
    // if (changeInfo.status === "loading" && tab.url.startsWith(`file:///`) === true) return;
    chrome.tabs.query({
      'active': true,
      'lastFocusedWindow': true,
      'status': `complete`
    }, () => {
      // console.log(tab);
      // Firefox/Gecko browsers
      if (findEngine() === `gecko`) {
        if (changeInfo.status === `loading`) {
          if (changeInfo.url !== undefined) {
            eventUrl(`onUpdated`, changeInfo.url, tabId)
          }
        }
        return
      }
      // Blink and Chrome browsers
      if (changeInfo.status !== undefined && changeInfo.status === `complete`) {
        if (tab.url.length > 0) eventUrl(`onUpdated`, tab.url, tabId)
      }
    })
  }

  function close(tabId)
  // Listen for closed tabs
  {
    if (test === true) console.log(`Closed tab id ${tabId}`)
    // Clean up sessionStorage used by tab
    sessionStorage.clear()
  }

  // Add and remove listeners associated with the Options
  // `Apply RetroTxt to any text files hosted on these websites`
  // `Apply RetroTxt to any local text files file:///`
  switch (state) {
    case true:
      chrome.tabs.onCreated.addListener(create)
      chrome.tabs.onUpdated.addListener(update)
      chrome.tabs.onRemoved.addListener(close)
      break
    case false:
      chrome.tabs.onCreated.removeListener(create)
      chrome.tabs.onUpdated.removeListener(update)
      chrome.tabs.onRemoved.removeListener(close)
      break
  }
  if (test === true) {
    const testCreated = chrome.tabs.onCreated.hasListener(create)
    const testUpdated = chrome.tabs.onUpdated.hasListener(update)
    const testRemoved = chrome.tabs.onRemoved.hasListener(close)
    console.log(`listenForTabs() created? ${testCreated} updated? ${testUpdated} removed? ${testRemoved}.`)
  }
  return
}

function matchExts(uri = ``, exts = [])
// Returns a boolean on whether the file name extension matches the supplied array
// @uri  URI containing the file name
// @exts Array of file name extensions to compare
{
  if (typeof uri !== `string`) checkArg(`uri`, `string`, uri)
  else if (uri.length < 1) checkRange(`uri`, `length`, `1`, uri.length)
  if (typeof exts !== `object`) checkArg(`exts`, `array`, exts)
  else if (exts.length === 0) checkErr(`'ext' containing a collection of file name extensions is required.`)

  const split = uri.split(`.`), ext = split[split.length - 1]
  if (exts.indexOf(ext.toLowerCase()) >= 0) return true
  return false
}

function removeSubDomains(url = ``)
// Parses a URL and returns a domain without any sub-domains
// url=https://www.example.com will return example.com
// @url Full or incomplete URL to parse
{
  if (typeof url !== `string`) checkArg(`url`, `string`, url)
  if (url.length < 1) checkRange(`url`, `length`, `1`, url.length)

  const host = url.split(`/`)[2], parts = host.split(`.`) // convert hostname into an array
  if (parts.length > 2) {
    parts.shift() // drop the sub-domain
    return parts.join(`.`) // convert the array back to a string
  }
  return host
}

function urlBlob(data, tab, verbose = true)
// Determines if the data is a text file.
// @data Blob object
// @tab  Tab object
{
  const ts = data.type.split(`/`, 2) // mime type split (text/plain)
  const st = ts[1].split(`;`, 1) // sub-type split (plain;charset=iso-8859-1)
  const ds = data.slice(0, 2)
  const reader = new FileReader()

  switch (ts[0]) {
    case `text`: {
      switch (st[0]) {
        //case `html`, `xml`, `json`: return false
        case `x-nfo`, `plain`: {
          // check to makesure text/plain is not mark-up
          reader.onload = function (loadedEvent) {
            const r = loadedEvent.target.result
            // if the body starts with <! or <? then it is most likely mark-up
            const mkChk = ([`<!`, `<?`].includes(r))
            if (mkChk === false) {
              if (verbose) console.log(`Run Retrotxt on tab ${tab.tabid}, ${tab.url}.`)
              callbackTab(data, tab)
            }
          }
          reader.readAsText(ds)
          return
        }
      }
    }
  }
  if (verbose) console.log(`Skipped Retrotxt execution on tab ${tab.tabid}, ${tab.url}.`)
  // if tab is not holding a text file, disable RetroTxt on the tab and finish up
  changeToolbar(tab.tabid)
  return
}

function urlCheck(menuId = 0, url = ``, tabid = 0, verbose = false)
// This function determines if a URL is pointing to a file that is suitable
// for viewing in RetroTxt.
// @menuId Optional menuId index
// @url    URL or URI (https://example.com/text.txt or file:///c:/text.txt)
// @tabId  Optional tabid index
{
  if (typeof url !== `string`) checkArg(`url`, `string`, url)
  else if (url.length < 1) checkRange(`url`, `length`, `1`, url.length)
  if (url.includes(`://`) === false) checkErr(`url argument '${url}' is invalid as it requires a scheme, ie https://example.com.`)

  const cfg = new ListDefaults
  const fileRun = localStorage.getItem(`runFileUrls`)
  const init = { method: `GET`, cache: `default`, }
  const tab = { menuId: menuId, tabid: tabid, url: url, }
  const uri = {
    domain: removeSubDomains(url),
    ignore: matchExts(url, cfg.avoidFileExtensions),
    scheme: url.split(`:`)[0],
  }

  // Check against the hard coded black list of domains & schemes to skip any false positives or conflicts
  if (cfg.avoidDomains.includes(uri.domain) === true) {
    return console.info(`RetroTxt conflicts with the domain ${uri.domain} and so ${url} is ignored.`)
  }

  changeToolbar(tabid, false)
  switch (uri.scheme) {
    case `file`:
      // handle possible directories
      if (url.charAt(url.length - 1) === `/`) return
      if (findEngine() === `gecko`) {
        const path = url.split(`/`).slice(-1) // look for file names with extensions
        if (path.toString().indexOf(`.`) < 0) return // otherwise, assume it's a dir
      }
      // compare local file name extension to the file name ignore list
      if (uri.ignore === true) return
      // handle file:// web-extension permissions
      console.info(`Loading local file ${url}.`)
      if (typeof fileRun !== `string` || fileRun === `false`) return // if unchecked
      if (chrome.permissions !== undefined) {
        chrome.permissions.contains({ permissions: [`tabs`], origins: [`file:///*`] }, result => {
          if (result) callbackTab(null, tab)
          else { /* denied permission by user settings */ }
        })
      } else { callbackTab(null, tab) /* Gecko 54 & earlier support */ }
      return
    case `http`: case `https`:
      // Using Fetch API instead of legacy XMLHttpRequest, requires FF 52+ or Chrome 49+
      fetch(url, init).then(response => {
        if (response.ok) return response.blob()
        // body mixins .. arrayBuffer, blob, json, text, formData
        //return response.arrayBuffer() // TODO: use for SAUCE?
        throw new Error()
      }).then(data => {
        if (verbose) console.log(data)
        urlBlob(data, tab)
      }).catch(error => {
        console.error(`urlCheck(${menuId}, ${url}, ${tabid}) failed: ${error}.`)
      })
  }
}

function wipeStorage()
// Erases all local, session and WebExtension storage generated by RetroTxt
{
  localStorage.clear()
  sessionStorage.clear()
  chrome.storage.local.clear(() => {
    console.log(`Deleting RetroTxt saved settings.`)
    checkErr(chrome.runtime.lastError)
  })
}
