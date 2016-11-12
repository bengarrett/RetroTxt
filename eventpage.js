// filename: eventpage.js
//
// This is the WebExtension background page which is run by the web browser
// when it is started or when RetroTxt is first loaded or refreshed.

"use strict";

// Constructors containing reusable defaults

function ListMenuTitles()
// context menu item titles
{
  this.amiga = `Amiga`;
  this.appleii = `Apple II`;
  this.c64 = `Commodore 64`;
  this.msdos = `MS-DOS`;
  this.windows = `Windows`;
  this.textOrder = ["textFontInformation", "textCenterAlignment", "textFontShadows", "textBgScanlines"];
  this.textBgScanlines = `Scanlines`;
  this.textCenterAlignment = `Text alignment`;
  this.textFontInformation = `Text and font information`;
  this.textFontShadows = `Font shadows`;
  this.codeOrder = ["codeAutomatic", "codeMsdos0", "codeMsdos1", "codeWindows", "codeLatin9", "codeNone"];
  this.codeLatin1 = `Linux web & Amiga`;
  this.codeLatin9 = `Linux legacy web`;
  this.codeAutomatic = `Guess (default)`;
  this.codeMsdos0 = `MS-DOS CP-437`;
  this.codeMsdos1 = `MS-DOS CP-865`;
  this.codeNone = `None (UTF-8, Linux early web, Amiga)`;
  this.codeUnicode = `UTF-8, current web`;
  this.codeWindows = `Windows legacy web`;
}

function ListSettings()
// Options settings
{
  // boolean
  this.textBgScanlines = false;
  this.textDosCtrlCodes = false;
  this.textCenterAlignment = true;
  this.textFontInformation = true;
  this.textFontShadows = false;
  this.runFileDownloads = true;
  this.runFileUrls = true;
  this.runWebUrls = true;
  this.runWebUrlsPermitted = true;
  // 1-bit colour, font & line height
  this.retroColor = `msdos`;
  this.retroFont = `vga8`;
  this.lineHeight = `100%`;
  // other
  this.runWebUrlsPermitted = ["defacto2.net", "gutenberg.org", "scene.org", "textfiles.com", "uncreativelabs.net"];
  this.schemesPermitted = ["file", "http", "https"];
}

function ListThemes()
// font and colour themes to use with the context menus
{
  this.order = ["msdos", "windows", "amiga", "appleii", "c64"]; // order of display
  this.amiga = {
    retroFont: `amiga`,
    retroColor: `theme-amiga`
  };
  this.appleii = {
    retroFont: `appleii`,
    retroColor: `theme-appleii`
  };
  this.c64 = {
    retroFont: `c64`,
    retroColor: `theme-c64`
  };
  this.msdos = {
    retroFont: `vga8`,
    retroColor: `theme-msdos`
  };
  this.windows = {
    retroFont: `vga9`,
    retroColor: `theme-windows`
  };
}

// This is always run when the eventpage.js is loaded
(function() {
  // exit if running a qunit test
  if (typeof qunit !== "undefined") return;

  const browserEngine = findEngine(),
    configurations = new ListSettings();

  // Contexts types for RetroTxt's context menus
  // browser_action, tool bar button
  // page, right click on the body of the web page / text file
  // Firefox doesn't support browser_action
  const contexts = ["browser_action", "page"]; // add any context types here

  if (chrome === undefined) {
    console.warn(`RetroTxt failed to run because the browser's WebExtension API did not load! Please close this browser and try again.`);
    return;
  }
  // Initialisation of storage and generate context menu on browser launch and extension load
  console.info(`RetroTxt was initialised for ${browserEngine}.`);

  // Uncomment this for testing, to clear all stored items
  //runStorageClear();

  // Set default options for first-time users
  // see options.js for other similar listeners

  const menuSupport = (chrome.contextMenus.onClicked !== undefined);
  // Firefox 50+ has no support for onInstalled
  if (chrome.runtime.onInstalled === undefined) {
    if (menuSupport === true) buildMenus(contexts);
    runStorageInitialise();
  }
  // standard behaviour
  else {
    chrome.runtime.onInstalled.addListener(function() {
      if (menuSupport === true) buildMenus(contexts);
      runStorageInitialise();
    });
  }

  // Listen for and handle messages from content scripts
  function handleMessage(request, sender, sendResponse) {
    // receive messages from runRetroTxt() that a tabs content has changed
    if (typeof request.retroTxtified === "boolean") {
      // update the toolbar button
      const tabId = sender.tab.id;
      changeToolbar(tabId, request.retroTxtified);
    }
    //
    if (typeof request.askForSettings !== "undefined") {
      const listSettings = new ListSettings();
      sendResponse({
        response: listSettings
      });
    }
  }
  chrome.runtime.onMessage.addListener(handleMessage);

  // this refreshes the context menu for the active tab
  function handleActiveTab(activeInfo) {
    //console.log("Activated tab id " + activeInfo.tabId);
    const tabId = activeInfo.tabId,
      tabText = sessionStorage.getItem(`tab${tabId}textfile`);
    let menuState = false;
    if (typeof tabText === "string" && tabText.length > 0) {
      switch (tabText) {
        case "true":
          menuState = true;
          changeToolbar(tabId, false);
          break;
        case "false":
          menuState = false;
          changeToolbar(tabId, null);
          break;
      }
      changeMenuStates(menuState);
    }
  }
  // on browser tab activated listener
  chrome.tabs.onActivated.addListener(handleActiveTab);

  // Implement event listeners for browser tabs
  listenForTabs();

  // Implement event listeners for file downloads
  listenForDownloads();

  // Browser action (tool bar button) onClick event
  chrome.browserAction.onClicked.addListener(function(tab) {
    const scheme = tab.url.split(":")[0].toLowerCase(),
      valid = configurations.schemesPermitted.includes(scheme);
    if (valid === true) {
      //console.log(`RetroTxt tool bar button was pressed and triggered for browser tab ${tab.id}.`);
      runOnClick(tab);
    } else {
      // disable button if it hasn't been already
      chrome.browserAction.disable(tab.id);
      changeToolbar(tab.id, null);
    }
  });

  // Monitor saved changes to Options, so the context menu can be updated
  chrome.storage.onChanged.addListener(function(changes) {
    const changedItems = Object.keys(changes);
    let newValue = ``;

    for (let item of changedItems) {
      newValue = changes[item].newValue;
      switch (item) {
        case "textFontInformation":
        case "textCenterAlignment":
        case "textFontShadows":
        case "textBgScanlines":
          changeMenuState(item, newValue);
          break;
        default:
          break;
      }
    }
  });

  // Context menus on-clicked events
  if (chrome.contextMenus.onClicked !== undefined) {
    chrome.contextMenus.onClicked.addListener(function(info, tab) {
      const autorun = localStorage.getItem("runWebUrls");
      switch (info.menuItemId) {
        case "options":
          chrome.runtime.openOptionsPage();
          break;
        case "textFontInformation":
        case "textCenterAlignment":
        case "textFontShadows":
        case "textBgScanlines":
          changeMenuCheckmark(info.menuItemId);
          break;
        case "amiga":
        case "appleii":
        case "c64":
        case "msdos":
        case "windows":
          changeTheme(info.menuItemId);
          break;
        case "codeAutomatic":
        case "codeMsdos0":
        case "codeMsdos1":
        case "codeLatin1":
        case "codeLatin9":
        case "codeNone":
        case "codeUnicode":
        case "codeWindows":
          // see handleMessages() in retrotxt.js for the event handler
          chrome.tabs.query({
            active: true,
            currentWindow: true
          }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: info.menuItemId,
              id: "transcode"
            }, function() {
              // save a session item to tell RetroTxt how to render the text on
              // this tab. session storage is isolated to the one active tab.
              sessionStorage.setItem("transcode", info.menuItemId);
            });
          });
          break;
        case "helpbrowser":
        case "helppage":
          chrome.tabs.create({
            "url": chrome.i18n.getMessage("url_help")
          });
          break;
      }
      // If a theme option is clicked while viewing the browser default text
      // then we should also apply the new theme.
      if (typeof autorun !== "string" || autorun === "false") {
        switch (info.menuItemId) {
          case "msdos":
          case "windows":
          case "amiga":
          case "appleii":
          case "c64":
            runCallback(null, tab);
            break;
        }
      }
    });
  }
})();

function buildMenus(contexts)
// Creates the context menus used on pages and on some browser's task bar button
// @contexts  An object containing a collection of contextMenus context values
{
  if (typeof contexts !== "object" || contexts.length < 1) throw `required 'contexts' object parameter is missing, i needs to be a collection contextMenus context-values`;

  const docMatches = ["http://*/*", "https://*/*", "file:///*"],
    styles = new ListThemes(),
    titles = new ListMenuTitles();

  // Only show the context menu with page schemes that match docMatches
  chrome.contextMenus.create({
    "title": `Options`,
    "contexts": ["page"],
    "documentUrlPatterns": docMatches,
    "id": `options`
  });
  chrome.contextMenus.create({
    "title": `Help`,
    "contexts": ["browser_action"],
    "documentUrlPatterns": docMatches,
    "id": `helpbrowser`
  });
  chrome.contextMenus.create({
    "title": `Display`,
    "contexts": contexts,
    "documentUrlPatterns": docMatches,
    "id": `displaysub`
  });
  // generate `Display` child items
  for (let id of titles.textOrder) {
    chrome.contextMenus.create({
      "type": "checkbox",
      "checked": false,
      "title": titles[id],
      "contexts": contexts,
      "id": id,
      "parentId": `displaysub`,
      "documentUrlPatterns": docMatches
    });
  }
  chrome.contextMenus.create({
    "type": `separator`,
    "contexts": ["page"],
    "id": "sep1",
    "documentUrlPatterns": docMatches
  });
  chrome.contextMenus.create({
    "title": `Transcode text`,
    "contexts": contexts,
    "documentUrlPatterns": docMatches,
    "id": `transcode`
  });
  // generate `Transcode text` child items
  for (let id of titles.codeOrder) {
    chrome.contextMenus.create({
      "type": "normal",
      "title": titles[id],
      "contexts": contexts,
      "id": id,
      "parentId": `transcode`,
      "documentUrlPatterns": docMatches
    });
  }
  chrome.contextMenus.create({
    "type": `separator`,
    "contexts": contexts,
    "documentUrlPatterns": docMatches,
    "id": `sep2`
  });
  // generate Theme items
  for (let id of styles.order) {
    chrome.contextMenus.create({
      "type": "checkbox",
      "contexts": ["page"],
      "checked": false,
      "title": titles[id],
      "id": id,
      "documentUrlPatterns": docMatches
    });
  }
  chrome.contextMenus.create({
    "type": `separator`,
    "contexts": ["page"],
    "documentUrlPatterns": docMatches,
    "id": `sep3`
  });
  chrome.contextMenus.create({
    "title": `Help`,
    "contexts": ["page"],
    "documentUrlPatterns": docMatches,
    "id": `helppage`
  });
}

function changeMenuCheckmark(key = ``)
// This function is used by the context menus to switch and save Options settings.
// With the initial=true parameter it can also initialise settings, which will save
// default() settings to the user's browser for any missing items.
// @key       Name of storage item to switch (must hold a boolean value)
// @initial   Uses defaults() to save a missing default storage item
{
  if (key.length === 0) throw (`'key' parameter is required to name the local storage item`);
  chrome.storage.local.get(key, function(result) {
    const r = result[key];
    let newValue = false;
    // no existing local storage for setting
    if (typeof r !== "boolean") {
      const def = new ListSettings();
      newValue = def[key];
    }
    // switch setting between true/false
    else newValue = !r;
    // create and save setting object to local storage
    const setting = {
      [key]: newValue
    };
    chrome.storage.local.set(setting, onStorage(result));
    // update any context menus to apply
    changeMenuState(key, newValue);

    function onStorage()
    // returns local storage errors
    {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError);
      }
    }
  });
}

function changeMenuState(menuid = "", state = true)
// Applies and removes check-marks for context menu, check-box type items
{
  if (menuid.length === 0) throw (`required 'menuid' parameter was is missing to change the context menu checked-state`);
  chrome.contextMenus.update(menuid, {
    "checked": state
  });
}

function changeMenuStates(state)
// Because you can apply unique context menus to individual tabs, we refresh
// the RetroTxt menus whenever the active tab is switched.

// Used by runWebRequestFinalise() and on-updated event to update the context menus state
// to either enabled or disabled.

// @state  Required boolean to enable or disable the context menu
{
  if (typeof state !== "boolean") throw `'state' boolean parameter is required to enable or disable the context menus`;

  const ids = ["transcode"]; // leave all menus items except ...
  for (let id in ids) {
    chrome.contextMenus.update(ids[id], {
      "enabled": state
    });
  }
}

function changeTheme(theme = ``)
// Used by the context menus this switches the active RetroTxt font and colour
// combinations to a predefined theme.
// @theme Name of the theme to apply [see themes()]
{
  if (theme.length === 0) throw (`'theme' parameter is required to name style you wish to apply`);
  const collection = new ListThemes(),
    style = collection[theme];
  if (typeof style !== "object") {
    throw (`theme name "${theme}" could not be found in themes()`);
  } else {
    chrome.storage.local.set({
      "retroFont": `${style.retroFont}`
    });
    chrome.storage.local.set({
      "retroColor": `${style.retroColor}`
    });
    // remove any existing theme menu check-marks
    for (let id in collection.order) {
      changeMenuState(collection.order[id], false);
    }
    // add new check-mark
    changeMenuState(theme, true);
  }
}

function changeToolbar(tabId = 0, isRetroTxtified = null)
// Modifies the RetroTxt button located on the browser's tool bar
{
  // button config for when the tab is not containing a text file
  let title = `RetroTxt only works on text files`;
  if (isRetroTxtified === null) {
    chrome.browserAction.disable(tabId);
    return;
  }
  // tab contains a text file
  else if (isRetroTxtified === false) title = `RetroTxtify text`;
  else if (isRetroTxtified === true) title = `Revert to the original text`;
  chrome.browserAction.enable(tabId);
  chrome.browserAction.setTitle({
    title: title,
    tabId: tabId
  });
}

function listenForDownloads(state = true)
// Creates event listeners to monitor user file downloads
// NOTE this feature does not work with Gecko/Firefox as the
// chrome.downloads.onChanged event does not seem to trigger in the browser
{
  const browserEngine = findEngine();
  if (browserEngine === "gecko") return;

  function handleCreated(downloadItem)
  // New file download listener
  {
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError);
    } else {
      const cfg = new ListDefaults(),
        run = localStorage.getItem(`runFileDownloads`); // if Option is disabled, exit
      if (typeof run !== "string" || run !== "true") return;
      // we only want to monitor web downloads aka HTTP://, HTTPS://
      if (downloadItem.url !== undefined && downloadItem.url.length > 0) {
        const schemes = ["http", "https"],
          urlScheme = downloadItem.url.split(":")[0];
        if (schemes.includes(urlScheme) === false) return;
      }
      // The supplied meta-data varies between host web servers and user browsers
      // So assume every download is a text file until the evidence says otherwise
      if (downloadItem.filename !== undefined && downloadItem.filename.length > 0) {
        // check file name extension isn't an obvious non-text file
        if (runParseUrlExtensions(downloadItem.filename, cfg.avoidFileExtensions) === true) return;
      }
      if (downloadItem.mime !== undefined && downloadItem.mime.length > 0) {
        // check mime-type isn't an obvious web text file (html, js, css, xml...)
        const mimes = ["text/plain", "application/octet-stream"];
        if (mimes.includes(downloadItem.mime) === false) return;
      }
      if (downloadItem.id === undefined) return;
      // otherwise assume download is a possible text file & save its id for monitoring
      //console.log("RetroTxt detected a possible text file download")
      sessionStorage.setItem(`download${downloadItem.id}`, downloadItem.id);
    }
  }

  function handleChanged(downloadDelta)
  // File download-state change listener
  {
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError);
    } else {
      if (downloadDelta.id === undefined) return;
      const cfg = new ListDefaults(),
        downloadItem = sessionStorage.getItem(`download${downloadDelta.id}`);
      // only handle downloads with ids that we have saved for monitoring
      if (downloadItem === null || `${downloadDelta.id}` !== downloadItem) return;
      // handle different changed states
      // all errors including cancelled downloads
      if (`error` in downloadDelta && `current` in downloadDelta.error) {
        sessionStorage.removeItem(`download${downloadDelta.id}`);
        return;
      }
      // location of saved local file
      if (`filename` in downloadDelta && `current` in downloadDelta.filename) {
        const localfile = downloadDelta.filename.current;
        if (localfile.length > 0) {
          // check the file name of the saved file to double check it's not an
          // obvious non-text file
          if (runParseUrlExtensions(localfile, cfg.avoidFileExtensions) === true) {
            sessionStorage.removeItem(`download${downloadDelta.id}`);
            return;
          }
          //console.log(`Saved file! ${localfile}`);
          sessionStorage.setItem(`download${downloadDelta.id}localpath`, downloadDelta.filename.current);
          console.log(sessionStorage.getItem(`download${downloadDelta.id}localpath`));
        }
      }
      // completed downloads
      if (`state` in downloadDelta && `current` in downloadDelta.state) {
        if (downloadDelta.state.current === "complete") {
          // Chrome does not allow an extension to run chrome.downloads.open()
          // It is designed to create a pop-up dialogue to prompt the user to open the file.
          // http://stackoverflow.com/questions/26775564/how-to-open-a-downloaded-file
          //chrome.downloads.open(downloadDelta.id);

          // The .show() function launches the operating system's file explorer
          // with the downloaded file selected.
          //chrome.downloads.show(downloadDelta.id);

          // Open a new tab with the loaded text file
          // Chrome will force-close the tab if it believes the file is binary or dangerous
          const localfileStored = sessionStorage.getItem(`download${downloadDelta.id}localpath`),
            localfilePath = localfileStored.replace(/\\/g, "/"); // Windows friendly path conversion
          chrome.tabs.create({
            active: false,
            url: `file:///${localfilePath}`
          });
        }
      }
    }
  }

  // No support for Gecko 47 and Edge
  if (chrome.downloads.onChanged !== undefined && chrome.downloads.onCreated !== undefined) {
    switch (state) {
      case true:
        chrome.downloads.onCreated.addListener(handleCreated);
        chrome.downloads.onChanged.addListener(handleChanged);
        break;
      case false:
        chrome.downloads.onCreated.removeListener(handleCreated);
        chrome.downloads.onChanged.removeListener(handleChanged);
        break;
    }
  }
}

function listenForTabs(state = true, test = false)
// Creates event listeners to monitor changes with a browser's tabs
{
  function handleCreated(tab)
  // New browser tab (on-created) listener
  {
    chrome.tabs.query({
      "status": `complete`
    }, function() {
      if (typeof tab.status === "string") {
        const url = tab.url;
        //console.log(tab);
        if (url.length === 0) { // do nothing
        } else if (tab.active === false && tab.status === "loading" && url.startsWith(`file:///`) === true) {
          // when tab is not active, tab.status "complete" is not returned by Chrome
          runParseEventUrls(`onCreated`, url, tab.id);
        } else if (tab.status === "complete") {
          runParseEventUrls(`onCreated`, url, tab.id);
        }
      }
    });
  }

  function handleUpdated(tabId, changeInfo, tab)
  // Existing browser tab refreshed (on-updated) listener
  {
    // As default we disable the RetroTxt tool bar button
    changeToolbar(tabId, null);
    // here we parse the tab's URL to refresh the RetroTxt tool bar button
    if (typeof tab === "object") {
      if (typeof changeInfo.status !== "undefined" && changeInfo.status === "complete" || tab.status === "complete") {
        const configurations = new ListSettings(),
          scheme = tab.url.split(":")[0].toLowerCase(),
          valid = configurations.schemesPermitted.includes(scheme);
        if (valid === true) changeToolbar(tabId, false);
      }
    }
    // many web apps also trigger this listener so we make sure the browser tab
    // is activate and not running in the background
    if (typeof tab !== "object" || tab.active !== true) return; // abort
    // a work around for when new `file:///` tabs trigger both handleCreated() and handleUpdated()
    //if (changeInfo.status === "loading" && tab.url.startsWith(`file:///`) === true) return;
    chrome.tabs.query({
      "active": true,
      "lastFocusedWindow": true,
      "status": `complete`
    }, function() {
      //console.log(tab);
      const browserEngine = findEngine();
      // Gecko and Firefox browsers
      if (browserEngine === "gecko") {
        if (changeInfo.status === "loading") {
          if (changeInfo.url !== undefined) runParseEventUrls(`onUpdated`, changeInfo.url, tabId);
        }
        return;
      }
      // Blink and Chrome browsers
      if (changeInfo.status !== undefined && changeInfo.status === "complete") {
        if (tab.url.length > 0) runParseEventUrls(`onUpdated`, tab.url, tabId);
      }
    });
  }

  function handleRemoved(tabId)
  // Existing browser tab close listener
  {
    if (test === true) console.log(`Closed tab id ${tabId}`);
    // Clean up sesssionStorage used by tab
    sessionStorage.clear();
  }
  // Add and remove listeners associated with the Options
  // `Apply RetroTxt to any text files hosted on these websites`
  // `Apply RetroTxt to any local text files file:///`
  switch (state) {
    case true:
      chrome.tabs.onCreated.addListener(handleCreated);
      chrome.tabs.onUpdated.addListener(handleUpdated);
      chrome.tabs.onRemoved.addListener(handleRemoved);
      break;
    case false:
      chrome.tabs.onCreated.removeListener(handleCreated);
      chrome.tabs.onUpdated.removeListener(handleUpdated);
      chrome.tabs.onRemoved.removeListener(handleRemoved);
      break;
  }
  if (test === true) {
    const testCreated = chrome.tabs.onCreated.hasListener(handleCreated),
      testUpdated = chrome.tabs.onUpdated.hasListener(handleUpdated),
      testRemoved = chrome.tabs.onRemoved.hasListener(handleRemoved);
    console.log(`listenForTabs() created? ${testCreated} updated? ${testUpdated} removed? ${testRemoved}`);
  }
}

function runCallback(tabid = 0, pageEncoding = ``)
// Browser tab callback to execute RetroText
// @tabid     Required id of the tab
// @encoding  Optional string to state the text's encoding
{
  chrome.tabs.executeScript(tabid, {
      file: `functions.js`,
      runAt: `document_start`
    },
    // automatic execute
    function() {
      // to be run after this js is loaded and at the start of the document
      chrome.tabs.executeScript(tabid, {
        code: `runSpinLoader()`,
        runAt: `document_start`
      });
    });
  chrome.tabs.executeScript(tabid, {
    file: `text_ecma48.js`,
    runAt: `document_start`
  });
  chrome.tabs.executeScript(tabid, {
    file: `text_ecma94.js`,
    runAt: `document_start`
  });
  chrome.tabs.executeScript(tabid, {
    file: `text_cp_dos.js`,
    runAt: `document_start`
  });
  chrome.tabs.executeScript(tabid, {
      file: `retrotxt.js`,
      runAt: `document_start`
    },
    // automatic execute
    function() {
      // has to be run after retrotxt.js is loaded
      chrome.tabs.executeScript(tabid, {
        code: `runRetroTxt(${tabid},"${pageEncoding.toUpperCase()}")`,
        runAt: `document_end`
      });
    });
}

function runOnClick(tab, verbose = false)
// Tool bar button click callback to execute RetroText
// @tab  Required tab information object otherwise the function will do nothing
{
  const urlScheme = tab.url.split(":")[0];
  if (typeof tab !== "object" || typeof tab.url !== "string" || tab.url.length === 0) {
    console.warn(`RetroTxt could not determine the browser's active tab`);
  } else {
    if (typeof tab.id === "number" && tab.id > 0) {
      // sessionStorage only saves strings
      const evalText = sessionStorage.getItem(`tab${tab.id}textfile`);
      let page = {
        "retroTxtify": null,
        "encoding": null
      };
      // determine if active tab is a text file and save the results to a sessionStore
      // this is to reduce any future, expensive HTTP HEAD requests
      if (typeof evalText !== "string") {
        if (urlScheme === "file") sessionStorage.setItem(`tab${tab.id}execute`, `false`);
        runWebRequest(0, tab.url, tab.id);
        page.retroTxtify = sessionStorage.getItem(`tab${tab.id}textfile`);
        page.encoding = sessionStorage.getItem(`tab${tab.id}encoding`);
      }
      // use existing sessionStore results
      else {
        page = {
          "retroTxtify": evalText,
          "encoding": sessionStorage.getItem(`tab${tab.id}encoding`)
        };
      }
      if (page.retroTxtify === "true") {
        if (verbose) console.log(`RetroTxt has detected the active tab ${tab.id} displaying ${tab.url} is a text file encoded as ${page.encoding}`);
        runCallback(tab.id, page.encoding);
      }
    }
  }
}

function runParseEventUrls(menuId = ``, url = ``, tabid = 0)
// Used with events listeners, this decides whether to create context menus
// and whether to run RetroTxt, as determined by the URL of the active tab.
// @url     URL to check
// @menuId  The name of the initial event that created the context menu
// @tabId   Optional tab ID used for ticking off tabs that have been processed
{
  try {
    if (menuId.length === 0) throw `'menuId' is missing, it needs to be the context menu ID`;
    if (url.length === 0) throw `'url' is missing, it needs to be a URL of the active browser tab`;
  } catch (err) {
    console.error(`runParseEventUrls(menuId, url, tabid) parameter ${err}`);
    return;
  }
  // make sure that we don't attempt to process browser tabs with ftp or about/config pages
  if (url.startsWith("ftp://") === true || url.startsWith("chrome://") || url.includes("://") === false === true) return;
  // get and parse the tab's url
  const cfg = new ListDefaults(),
    urlDomain = runParseUrlDomain(url),
    urlScheme = url.split(":")[0];
  // Option `Apply RetroTxt to any text files hosted on these websites`
  let approvedDomains = localStorage.getItem(`runWebUrlsPermitted`),
    approvedDomain = false;
  if (typeof approvedDomains !== "string" || approvedDomains.length === 0) {
    chrome.storage.local.get(`runWebUrlsPermitted`, function(result) {
      let r = result.runWebUrlsPermitted;
      if (typeof r === "string" && r.length > 0) {
        localStorage.setItem(`runWebUrlsPermitted`, r);
      }
    });
    approvedDomains = localStorage.getItem(`runWebUrlsPermitted`);
    if (typeof approvedDomains !== "string" || approvedDomains.length === 0) {
      // redundancy in case localStorage doesn't work
      approvedDomains = cfg.autoDomains;
    }
  }

  // list of approved website domains
  if (typeof approvedDomain === "string") approvedDomain = approvedDomain.split(";");
  approvedDomain = approvedDomains.includes(urlDomain);

  // As the runWebRequest() function silently breaks functionality with some
  // secured website logins such as online banks. It must NEVER be run passively
  // in the eventpage.js except for preselected web domains.
  if (urlScheme !== "file" && approvedDomain !== true) return;
  else runWebRequest(menuId, url, tabid);
}

function RunParseWebHeader(xhttp, verbose = false)
// Parse HTTP response header Content-Type
// i.e. Content-Type: text/html; charset=iso-8859-1
// @xhttp   Object or string containing header meta data
// @verbose Spam the browser console with feedback from the HTTP request
{
  let contentLength = 0,
    contentType,
    charset = null,
    encoding,
    responseLength,
    responseType,
    subtype = null,
    splitType = null,
    type = null;

  if (xhttp.responseURL !== undefined) {
    responseLength = xhttp.getResponseHeader(`Content-Length`);
    responseType = xhttp.getResponseHeader(`Content-Type`);
  } else {
    // fake responseType used by QUnit tests
    responseLength = xhttp[`Content-Length`];
    responseType = xhttp[`Content-Type`];
  }
  if (verbose) console.log(responseType);
  if (typeof responseLength === "string" && responseLength.length > 0) {
    contentLength = parseInt(responseLength, 10);
  } else if (typeof responseLength === "number") {
    contentLength = responseLength;
  }
  if (typeof responseType === "string") {
    contentType = responseType;
    try {
      contentType = contentType.split(";");
    } catch (err) {
      return;
    }
    if (verbose) console.log(contentType);
    if (contentType.length > 0) {
      splitType = contentType[0].split("/")[0]; //  Content-Type: text OR text
      if (verbose) console.log(splitType);
      type = splitType.split(":")[1]; // text OR text
      if (verbose) console.log(type);
      if (type === undefined) {
        type = splitType;
      }
      subtype = contentType[0].split("/")[1]; // html
      if (verbose) console.log(subtype);
      try {
        charset = contentType[1].split("=")[1]; // ISO-8859-1
      } catch (err) {}
      if (verbose) console.log(charset);
    }
  }
  if (typeof type === "string" && type.length > 0) type = type.trim();
  if (typeof subtype === "string" && subtype.length > 0) subtype = subtype.trim();
  if (typeof encoding === "string" && encoding.length > 0) encoding = encoding.trim();
  this.type = type;
  this.subtype = subtype;
  this.encoding = charset;
  this.length = contentLength;
  if (verbose) console.log(this);
}

function RunParseWebRequest(xhttp)
// Handles the HTTP response & determines if it contains a plain text file
// @xhttp  XMLHttpRequest() response
{
  const content = new RunParseWebHeader(xhttp),
    body = xhttp.responseText.trim(), // body of the web page/document
    firstChars = body.slice(0, 1);
  let dObj = false, // data object saved as plain text
    pTxt = false, // plain text
    mDwn = false; // markdown
  // detect known markdown documents
  if (["html", "xml"].includes(content.subtype) === true) mDwn = true;
  else if (["json"].includes(content.subtype) === true) dObj = true;
  else if (content.encoding === null && content.length > 1) {
    // documents starting with <! or <? are almost certainly HTML, XML, etc.
    if (["<!", "<?"].includes(firstChars === true)) mDwn = true;
  }
  // content types overrides
  if (content.type !== null) {
    if (content.type === "text") pTxt = true;
    if (content.type === "application" || content.subtype !== "plain") {
      pTxt = false;
      dObj = true;
    }
    if (content.subtype === "x-nfo") pTxt = true; // an unofficial mime type for nfos
  } else {
    // if no content type is provided then assume text/plain
    pTxt = true;
  }
  // These values are not parsed and are included for debugging
  this.pageSizeInBytes = content.length;
  this.pageFirst2Chars = firstChars;
  this.likelyDataObj = dObj;
  this.likelyMarkup = mDwn;
  // These values are parsed
  this.retroTxtify = pTxt; // will RetroTxt be applied to the page?
  this.pageEncoding = content.encoding; // pass on content encoding i.e. US-ASCII, UFT-8
}

function runParseUrlDomain(url = ``)
// Parses a URL and returns a domain without any sub-domains
// url=https://www.example.com will return example.com
// @url Full or incomplete URL to parse
{
  if (url.length === 0) throw `'url' is required to extract the domain`;
  const host = url.split("/")[2],
    parts = host.split("."); // convert hostname into an array
  let domain = host;
  if (parts.length > 2) {
    parts.shift(); // drop the sub-domain
    domain = parts.join("."); // convert the array back to a string
  }
  return domain;
}

function runParseUrlExtensions(uri = ``, exts = [])
// Returns a boolean on whether the file name extension matches the supplied array
// @uri  URI containing the file name
// @exts Array of file name extensions to compare
{
  if (uri.length === 0) throw `'uri' is required to match any file extensions`;
  if (exts.length === 0) throw `'ext' containing a collection of file name extensions is required`;
  const split = uri.split("."),
    ext = split[split.length - 1];
  if (exts.indexOf(ext) >= 0) return true;
  else return false;
}

function runStorageClear()
// Erases all local, session and WebExtension storage generated by RetroTxt
{
  localStorage.clear();
  sessionStorage.clear();
  chrome.storage.local.clear(function() {
    console.log(`Deleting RetroTxt's saved settings`);
    const error = chrome.runtime.lastError;
    if (error) {
      console.error(error);
    }
  });
}

function runStorageInitialise()
// Sets RetroTxt default Options for the user if they are missing
{
  localStorage.clear();
  sessionStorage.clear();

  const initialisations = new ListSettings(),
    titles = new ListMenuTitles();

  // Get all of RetroTxt's stored items
  chrome.storage.local.get(null, function(result) {
    // Apply defaults to any missing options with boolean values
    for (let name in initialisations) {
      if (typeof initialisations[name] !== "boolean") continue;
      const value = result[name];
      if (typeof value !== "boolean") {
        const item = {
          [name]: initialisations[name]
        };
        chrome.storage.local.set(item);
        localStorage.setItem(name, initialisations[name]);
      } else {
        localStorage.setItem(name, value);
      }
      // apply any needed check marks on context menus
      if (titles.textOrder.includes(name) === true) {
        changeMenuState(name, value);
      }
    }
    // Apply defaults for theme
    const defaultThemeName = initialisations.retroColor,
      resultLH = result.lineHeight,
      resultRC = result.retroColor,
      resultRF = result.retroFont;
    if (typeof resultLH !== "string") {
      chrome.storage.local.set({
        "lineHeight": `${initialisations.lineHeight}`
      });
    }
    if (typeof resultRC !== "string") {
      chrome.storage.local.set({
        "retroColor": `${initialisations.retroColor}`
      });
    }
    if (typeof resultRF !== "string") {
      chrome.storage.local.set({
        "retroFont": `${initialisations.retroFont}`
      });
    }
    // update context menus
    const themeObject = new ListThemes(),
      defaultTheme = themeObject[defaultThemeName];
    if (defaultTheme.retroColor === resultRC && defaultTheme.retroFont === resultRF) {
      changeMenuState(defaultThemeName, true);
    }
    // Default white list of permitted domains to auto-run RetroTxt
    let r = result.runWebUrlsPermitted;
    if (typeof r === "undefined" || r.length === 0) {
      r = initialisations.runWebUrlsPermitted.join(";");
      chrome.storage.local.set({
        "runWebUrlsPermitted": r
      });
    }
    localStorage.setItem(`runWebUrlsPermitted`, r);
  });
}

function runWebRequest(menuId = 0, url = ``, tabid = 0)
// This function determines if a URL is pointing to a file that is suitable
// for viewing in RetroTxt.
// @menuId Optional menuId index
// @url    URL or URI (https://example.com/text.txt, file:///c:/text.txt)
// @tabId  Optional tabid index
{
  if (url.length === 0 || url.includes("://") === false) throw `url '${url}' is invalid and requires a scheme, ie https://example.com`;

  const cfg = new ListDefaults(),
    lastChr = url.charAt(url.length - 1),
    urlDomain = runParseUrlDomain(url),
    urlScheme = url.split(":")[0];

  // A hard coded black list of domains & schemes to ignore that trigger false positives or conflicts
  if (cfg.avoidDomains.includes(urlDomain) === true) {
    console.log(`RetroTxt conflicts with the domain ${urlDomain} and so ${url} is ignored.`);
    return;
  }
  switch (urlScheme) {
    case "file":
      // all local files viewable in browser are assumed to be text
      // if last character of a URL is `/` assume it's pointing to a directory
      if (lastChr === "/") return;
      // compare local file name extension to the file name ignore list
      const fileRequest = {
        "pageEncoding": null,
        "retroTxtify": !runParseUrlExtensions(url, cfg.avoidFileExtensions)
      };
      if (fileRequest.retroTxtify === true) runWebRequestFinalise(fileRequest, menuId, url, tabid);
      break;
    case "ftp":
      // not supported (maybe Firefox only support in the future?)
      // http://stackoverflow.com/questions/14839838/what-is-the-syntax-to-do-a-cross-domain-xmlhttprequest-to-an-ftp-server
      break;
    case "http":
    case "https":
      // XMLHttpRequest() to obtain web pages including header information such
      // as page encoding and file type
      let xhttp = {};
      const promise = new Promise(function(resolve, reject) {
        // asynchronous handling
        xhttp = new XMLHttpRequest();
        xhttp.open(`GET`, url);
        xhttp.onload = function() {
          // handle server response using HTTP status codes
          if (xhttp.status === 200) resolve(xhttp.response);
          else reject(Error(xhttp.statusText));
        };
        xhttp.onerror = function() {
          reject(Error(`Error fetching ${url}`));
        };
        xhttp.send();
      });
      // Make an asynchronous request
      promise.then(function() {
        // process HTTP 200 codes (success)
        //console.log(data); // dump the website raw text to console, need to add data parameter function(data) {}
        const wrp = new RunParseWebRequest(xhttp);
        runWebRequestFinalise(wrp, menuId, url, tabid);
      }).catch(function(e) {
        // error
        console.warn(e);
      }).then(function() {
        // post catch handling
      }, function(error) {
        // process all other HTTP codes replies
        const xstatus = xhttp.status.toString();
        // URL not found, do nothing
        if (xhttp.status === `404`); // NOTE the toString conversion
        // 4xx client error
        else if (xstatus.startsWith(`4`)) {
          // some servers block HTTP HEAD requests, so attempt this is unreliable fall back.
          // we review the file name extension and determine if it is a text file.
          const wrpErr = new RunParseWebRequest(xhttp);
          // make sure the URL doesn't point to known text and binary files that the
          // browser may display or play in a tab.
          wrpErr.retroTxtify = !runParseUrlExtensions(url, cfg.avoidFileExtensions);
          if (wrpErr.retroTxtify === true) runWebRequestFinalise(wrpErr, menuId, url, tabid);
        }
        // all other HTTP errors including 5xx server errors
        else console.log(`Unexpected server response ${xhttp.status} - ${error.message}`);
      });
      break;
  }
}

function runWebRequestFinalise(r = {
  "retroTxtify": false,
  "pageEncoding": null
}, menuId = 0, url = ``, tabid = 0)
// This decides whether to apply RetroTxt to the active browser tab
// using the data received from the asynchronous runWebRequest().
{
  const retroTxtify = r.retroTxtify,
    urlScheme = url.split(":")[0];
  let pageEncoding = r.pageEncoding;
  // set the default encoding if none is provided
  if (r.pageEncoding === null && retroTxtify === true) pageEncoding = `US-ASCII`;
  //console.log(`runWebRequestFinalise() results ${url}: ${retroTxtify} ${pageEncoding}`);
  // Is the tab hosting a text file and what is the page encoding?
  sessionStorage.setItem(`tab${tabid}textfile`, retroTxtify);
  sessionStorage.setItem(`tab${tabid}encoding`, pageEncoding);
  let execute = sessionStorage.getItem(`tab${tabid}execute`);
  // if tab is not holding a text file, disable RetroTxt on the tab and finish up
  if (retroTxtify === false) {
    changeToolbar(tabid, null);
    return;
  }
  // if tab has previously been flagged as 'do not autorun' then finish up
  else if (execute === "false") {
    changeToolbar(tabid, false);
    return;
  }
  // otherwise RetroTxtify the page
  else {
    // if tab is holding a text file
    changeToolbar(tabid, false);
    switch (urlScheme) {
      // Option `Apply RetroTxt to any local text files file://`
      case "file":
        const fileRun = localStorage.getItem(`runFileUrls`);
        if (typeof fileRun !== "string" || fileRun === "false") return; // if unchecked
        else if (chrome.permissions !== undefined) {
          chrome.permissions.contains({
            permissions: ["tabs"],
            origins: ["file:///*"]
          }, function(result) {
            if (result) runCallback(tabid);
            else {
              // denied permission by user settings
            }
          });
        }
        // Gecko support
        else {
          runCallback(tabid);
        }
        break;
        // Option `Apply RetroTxt to any text files ...`
      default:
        const webRun = localStorage.getItem(`runWebUrls`);
        if (typeof webRun !== "string" || webRun === "false") return; // if unchecked
        runCallback(tabid, pageEncoding);
        break;
    }
  }
}
