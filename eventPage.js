"use strict";

function contextMenuSaveAlignment() {
  chrome.storage.local.get("centerAlignment", function(result) {
    var r = result.centerAlignment;
    if (typeof r !== "boolean") r = true;
    chrome.storage.local.set({
      'centerAlignment': !r
    });
  });
}

function contextMenuSaveAmiga() {
  chrome.storage.local.set({
    'retroFont': "amiga"
  });
  chrome.storage.local.set({
    'retroColor': "amigaWhite-amigaGray"
  });
}

function contextMenuSaveAppleII() {
  chrome.storage.local.set({
    'retroFont': "appleii"
  });
  chrome.storage.local.set({
    'retroColor': "appleiiGreen-appleiiBlack"
  });
}

function contextMenuSaveC64() {
  chrome.storage.local.set({
    'retroFont': "c64"
  });
  chrome.storage.local.set({
    'retroColor': "c64fg-c64bg"
  });
}

function contextMenuSaveInfo() {
  chrome.storage.local.get("textFontInformation", function(result) {
    var r = result.textFontInformation;
    if (typeof r !== "boolean") r = true;
    chrome.storage.local.set({
      'textFontInformation': !r
    });
  });
}

function contextMenuSaveMSDOS() {
  chrome.storage.local.set({
    'retroFont': "vga9"
  });
  chrome.storage.local.set({
    'retroColor': "gray-black"
  });
}

function contextMenuSaveShadows() {
  chrome.storage.local.get("fontShadows", function(result) {
    var r = result.fontShadows;
    if (typeof r !== "boolean") r = true;
    chrome.storage.local.set({
      'fontShadows': !r
    });
  });
}

function contextMenuSaveWeb() {
  chrome.storage.local.set({
    'retroFont': "vga9"
  });
  chrome.storage.local.set({
    'retroColor': "black-white"
  });
}

function createContextMenus(evt, contexts)
// Creates the context menus
// https://developer.chrome.com/extensions/contextMenus
// @evt       Event name used by the context menu's identification
// @contexts  An object containing a collection of contextMenus context values
{
  try {
    if (typeof evt !== "string" || evt.length < 1) throw "'evt' is missing but is a required string"
    if (typeof contexts !== "object" || contexts.length < 1) throw "'contexts' is missing but is a required object containing a collection of Chrome contextMenus, contexts values"
  } catch (err) {
    console.error("createContextMenus(evt, contexts) parameter " + err);
    return;
  }
  if (evt === "Gecko48") {
    // Legacy Gecko 48 context menus as it doesn't support either
    // "contexts": ["browser_action"],
    // "documentUrlPatterns": docMatches,
    chrome.contextMenus.create({
      "title": "Options",
      "contexts": contexts,
      "id": "options"
    });
    chrome.contextMenus.create({
      "title": "Display",
      "contexts": contexts,
      "id": "displaysub"
    });
    chrome.contextMenus.create({
      "type": "separator",
      "id": "sep1"
    });
    chrome.contextMenus.create({
      "title": "Text and font information",
      "contexts": contexts,
      "id": "infotext",
      "parentId": "displaysub"
    });
    chrome.contextMenus.create({
      "title": "Text alignment",
      "contexts": contexts,
      "id": "centertext",
      "parentId": "displaysub"
    });
    chrome.contextMenus.create({
      "title": "Font shadows",
      "contexts": contexts,
      "id": "shadowtext",
      "parentId": "displaysub"
    });
    chrome.contextMenus.create({
      "title": "MS-DOS",
      "contexts": contexts,
      "id": "msdos"
    });
    chrome.contextMenus.create({
      "title": "Web",
      "contexts": contexts,
      "id": "web"
    });
    chrome.contextMenus.create({
      "title": "Amiga",
      "contexts": contexts,
      "id": "amiga"
    });
    chrome.contextMenus.create({
      "title": "Apple II",
      "contexts": contexts,
      "id": "appleii"
    });
    chrome.contextMenus.create({
      "title": "Commodore 64",
      "contexts": contexts,
      "id": "c64"
    });
    chrome.contextMenus.create({
      "type": "separator",
      "contexts": ["page"],
      "id": "sep2"
    });
    chrome.contextMenus.create({
      "title": "Text encoding",
      "contexts": contexts,
      "id": "abortEncoding"
    });
    chrome.contextMenus.create({
      "title": "Help",
      "contexts": ["page"],
      "id": "helppage"
    });
  } else {
    var docMatches = ["*://*/*", "file:///*"]; // matches HTTP, HTTPS, FILE
    chrome.contextMenus.create({
      "title": "Options",
      "contexts": ["page"],
      "documentUrlPatterns": docMatches,
      "id": "options"
    });
    chrome.contextMenus.create({
      "title": "Help",
      "contexts": ["browser_action"],
      "documentUrlPatterns": docMatches,
      "id": "helpbrowser"
    });
    chrome.contextMenus.create({
      "title": "Display",
      "contexts": contexts,
      "documentUrlPatterns": docMatches,
      "id": "displaysub"
    });
    chrome.contextMenus.create({
      "type": "separator",
      "documentUrlPatterns": docMatches,
      "id": "sep1"
    });
    chrome.contextMenus.create({
      "title": "Text and font information",
      "contexts": contexts,
      "id": "infotext",
      "parentId": "displaysub",
      "documentUrlPatterns": docMatches
    });
    chrome.contextMenus.create({
      "title": "Text alignment",
      "contexts": contexts,
      "id": "centertext",
      "parentId": "displaysub",
      "documentUrlPatterns": docMatches
    });
    chrome.contextMenus.create({
      "title": "Font shadows",
      "contexts": contexts,
      "id": "shadowtext",
      "parentId": "displaysub",
      "documentUrlPatterns": docMatches
    });
    chrome.contextMenus.create({
      "title": "MS-DOS",
      "contexts": contexts,
      "id": "msdos",
      "documentUrlPatterns": docMatches
    });
    chrome.contextMenus.create({
      "title": "Web",
      "contexts": contexts,
      "id": "web",
      "documentUrlPatterns": docMatches
    });
    chrome.contextMenus.create({
      "title": "Amiga",
      "contexts": contexts,
      "documentUrlPatterns": docMatches,
      "id": "amiga"
    });
    chrome.contextMenus.create({
      "title": "Apple II",
      "contexts": contexts,
      "documentUrlPatterns": docMatches,
      "id": "appleii"
    });
    chrome.contextMenus.create({
      "title": "Commodore 64",
      "contexts": contexts,
      "documentUrlPatterns": docMatches,
      "id": "c64"
    });
    chrome.contextMenus.create({
      "type": "separator",
      "contexts": ["page"],
      "documentUrlPatterns": docMatches,
      "id": "sep2"
    });
    chrome.contextMenus.create({
      "title": "Text encoding",
      "contexts": contexts,
      "documentUrlPatterns": docMatches,
      "id": "abortEncoding"
    });
    chrome.contextMenus.create({
      "title": "Help",
      "contexts": ["page"],
      "documentUrlPatterns": docMatches,
      "id": "helppage"
    });
  }
}

function executeRetroTxtOnClicked(tab)
// Tool bar button click callback to execute RetroText
// @tab  Required tab information object otherwise the function will do nothing
{
  if (typeof tab === "object" && typeof tab.url === "string" && tab.url.length > -1) {
    if (typeof tab.id === "number" && tab.id > 0) {
      var evalText = sessionStorage.getItem("retroTxt" + tab.id + "isText");
      if (typeof evalText !== "string") {
        // determine if active tab is a text file and save the results to a sessionStore
        // so we do not create unnecessary future HTTP HEAD requests
        var url = new newURLxhttpResponse(tab.url);
        sessionStorage.setItem("retroTxt" + tab.id + "isText", url.isTextFile);
        sessionStorage.setItem("retroTxt" + tab.id + "encoding", url.encoding);
      } else {
        var url = new newURLxhttpResponse();
        url.isTextFile = evalText;
      }
    }
    if (url.isTextFile == "true") {
      chrome.tabs.executeScript(tab.id, {
        file: "functions.js"
      });
      chrome.tabs.executeScript(tab.id, {
          file: "text.js"
        },
        function(results) {
          // has to be run after text.js is loaded
          chrome.tabs.executeScript(tab.id, {
            code: "executeRetroTxt()",
            runAt: "document_end"
          });
        });
    }
  }
}

function executeRetroTxtTabCallback(tabid, encoding)
// Chrome tab callback to execute RetroText
// @encoding  Optional string to state the text's encoding
//chrome.tabs.executeScript(integer tabId, object details, function callback)
{
  if (typeof encoding !== "string") encoding = "";
  chrome.tabs.executeScript(tabid, {
    file: "functions.js"
  });
  chrome.tabs.executeScript(tabid, {
      file: "text.js"
    },
    // automatic execute
    function(results) {
      // has to be run after text.js is loaded
      switch (encoding.toLowerCase) {
        case "utf-8":
          chrome.tabs.executeScript(tabid, {
            code: "executeRetroTxt('tab-UTF8')",
            runAt: "document_end"
          });
          break;
        default:
          chrome.tabs.executeScript(tabid, {
            code: "executeRetroTxt('tab-unknown')",
            runAt: "document_end"
          });
          break;
      };
    });
}

function newURLxhttpResponse(url, tabid)
// Handle the URL depending on its scheme and http data as
// RetroTxt only works with plain text files.
// Chrome event pages cannot read the content of the active tab.
// @url    URL
// @tabId  Optional tabid number
{
  // if no url given then return an empty prototype
  if (typeof url === "undefined" || typeof url !== "string") {
    this.isTextFile = null;
    this.encoding = null;
    return;
  }
  if (typeof tabid !== "number") tabid = 0;

  // A hardcoded black list of domains & schemes to ignore that trigger false positives or conflicts
  const urlDomain = url.split("/")[2],
    badDomains = ["feedly.com", "anz.com", "anz.com.au"];
  let i = 0;
  // Skip URL domains that match `badDomains`
  for (; i < badDomains.length; i++) {
    if (urlDomain.includes(badDomains[i])) {
      //console.log("RetroTxt ignores all matches to the domain " + badDomains[i]);
      this.isTextFile = false;
      this.encoding = null;
      return;
    }
  }

  function URLMatchExtensions(url, exts)
  // Returns a boolean on whether the file name extension matches the supplied array
  // @url  URI containing the file name
  // @exts Array of file name extensions to compare
  {
    const split = url.split("."),
      ext = split[split.length - 1];
    if (exts.indexOf(ext) >= 0) {
      return true;
    } else {
      return false;
    }
  }

  var lastChr, scheme, r,
    ext, ignoreExt = ["css", "htm", "html", "ini", "js", "json", "md", "xml", "yml"],
    textFile = false,
    textEncoding = "other";
  scheme = url.split(":")[0];
  switch (scheme) {
    case "chrome":
    case "chrome-extension":
    case "chrome-extension-resource":
    case "data":
      // these are not text files so do nothing
      break;
    case "file":
      // all local files viewable in Chrome are assumed to be text
      var e = url.length,
        s = (parseInt(e) - 1);
      lastChr = url.slice(s, e);
      // if last character is forward slash / then assume it's a local
      // directory and not a file, so don't run retroTxt().
      if (lastChr !== "/") {
        // detect file extension from ignore list.
        // because we used an ignore list, we store the opposite (! not) result
        textFile = !URLMatchExtensions(url, ignoreExt);
      }
      break;
    case "ftp":
      // not supported
      break;
    case "http":
    case "https":
      // test to see if url points to a text file
      // XMLHttpRequest() to obtain HTTP header info such as file encoding &
      // file type, it unfortunately only works with HTTP/HTTPS
      var xhttp, xstatus;
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        // Request finished
        if (xhttp.readyState == 4) {
          xstatus = xhttp.status.toString();
          // success response
          if (xhttp.status == 200) {
            r = new newXHTTPResults(xhttp);
            //console.log(xhttp.getAllResponseHeaders()) // useful for debugging
            //console.log(r);
            textEncoding = r.encode;
            if (r.isText) {
              textFile = true;
              if (r.encode === null) textEncoding = "US-ASCII";
            } else if (r.isHtml !== true && r.encode === null && r.length > 0) {
              // If no Content-Type returned by server but Content-Length > 0
              // then we request again but download and parse the whole page.
              console.log("Attempting a XHTTP Request with GET")
              let xhr, xxstatus;
              xhr = new XMLHttpRequest();
              xhr.onreadystatechange = function() {
                  if (xhr.readyState == 4) {
                    xxstatus = xhr.status.toString();
                    if (xhr.status == 200) {
                      const xxtext = xhr.responseText.trim(),
                        firstChr = xxtext.split(0, 1);
                      if (firstChr !== "<") {
                        // if no content-type given by server & first character is not the start of a tag <
                        // then assume it's a text file
                        textFile = true;
                        textEncoding = "US-ASCII";
                      }
                    }
                  }
                }
                //xhttp.onabort xhttp.onerror xhttp.ontimeout
              xhr.open("GET", url, false); // false = a synchronous request, it may not work in the future on Chrome
              xhr.send();
            }
          }
          // If response is a client error but not 404 file not found
          else if (xhttp.status != 404 && xstatus.slice(0, 1) == 4) {
            // some servers block http head requests so we fall back
            // and review the file name extension, though this method is unreliable
            var whiteListExt = ["asc", "ascii", "diz", "faq", "nfo", "text", "txt"];
            textFile = URLMatchExtensions(url, whiteListExt);
            console.log("White list extension match? " + textFile);
          }
        }
      };
      //xhttp.onabort xhttp.onerror xhttp.ontimeout
      xhttp.open("HEAD", url, false); // false = a synchronous request, it may not work in the future on Chrome
      xhttp.send();

      function newXHTTPResults(xhttp)
      // Handles the HTTP Request and determines if it is a text file
      // @xhttp  XMLHttpRequest() response
      {
        const content = new newContentTypeHeader(xhttp);
        let r = false,
          html = null;
        if (content.subtype === "html") html = true;
        if (content.type !== null) {
          if (content.type === "text") r = true;
          if (content.subtype !== "plain") r = false;
          if (content.subtype === "x-nfo") r = true; // unofficial mime type for nfos
        }
        this.isHtml = html;
        this.isText = r;
        this.encode = content.encoding;
        this.length = content.length;
      }
      break;
  }
  this.isTextFile = textFile;
  this.encoding = textEncoding;
}

function newContentTypeHeader(xhttp)
// Parse HTTP response header Content-Type
// i.e. Content-Type: text/html; charset=iso-8859-1
{
  const debug = false;
  const headers = xhttp.getAllResponseHeaders(),
    responseLength = xhttp.getResponseHeader("Content-Length"),
    responseType = xhttp.getResponseHeader("Content-Type");
  let contentLength = 0,
    contentType,
    charset = null,
    subtype = null,
    splitType = null,
    type = null;
  if (debug) console.log(responseType);
  if (typeof responseLength === "string" && responseLength.length > 0) {
    contentLength = parseInt(responseLength);
  }
  if (typeof responseType === "string") {
    contentType = responseType;
    try {
      contentType = contentType.split(";");
    } catch (err) {
      return;
    }
    if (debug) console.log(contentType);
    if (contentType.length > 0) {
      splitType = contentType[0].split("/")[0]; //  Content-Type: text OR text
      if (debug) console.log(splitType);
      type = splitType.split(":")[1]; // text OR text
      if (debug) console.log(type);
      if (type === undefined) {
        type = splitType;
      }
      subtype = contentType[0].split("/")[1]; // html
      if (debug) console.log(subtype);
      try {
        charset = contentType[1].split("=")[1]; // iso-8859-1
      } catch (err) {}
      if (debug) console.log(charset);
    }
  }
  if (typeof type === "string" && type.length > 0) type = type.trim();
  if (typeof subtype === "string" && subtype.length > 0) subtype = subtype.trim();
  if (typeof encoding === "string" && encoding.length > 0) encoding = encoding.trim();
  this.type = type;
  this.subtype = subtype;
  this.encoding = charset;
  this.length = contentLength;
  if (debug) console.log(this);
}

function switchContextMenus(evt, state)
// Updates the context menus to either enabled or disabled
// @evt    Required event name used by the context menu's identification
// @state  Required boolean to enable or disable the context menu
{
  try {
    if (typeof evt !== "string" || evt.length < 1) throw "'evt' is missing but is a required string";
    if (typeof state !== "boolean") throw "'state' is a required boolean used to enable or disable the context menus";
  } catch (err) {
    console.error("switchContextMenus(evt, state) parameter " + err);
    return;
  }
  //console.log("Switch menu state? " + state);
  if (state === "true") return;
  var id, menuid,
    ids = ["displaysub", "sep1", "infotext", "centertext", "shadowtext", "msdos", "web", "amiga", "appleii", "c64", "sep2", "abortEncoding"];
  for (id in ids) {
    menuid = ids[id];
    chrome.contextMenus.update(menuid, {
      "enabled": state
    });
  }
}

(function() {
  // exit if running a qunit tests
  if (typeof qunit !== "undefined") return;
  // Contexts types for RetroTxt's context menus
  // browser_action, tool bar button
  // page, right click on the body of the web page / text file
  var contexts = ["browser_action", "page"]; // add more context types here

  function eventHandleUrl(menuId, url, tabid)
  // Used with events listeners, this decides whether to create context menus
  // and whether to run RetroTxt. As determined by the URL of the active Chrome tab.
  // @url     URL to check
  // @menuId  The name of the initial event that created the context menu
  // @tabId   Optional tab ID used for ticking off tabs that have been processed
  {
    try {
      if (typeof menuId !== "string" || menuId.length < 1) throw "`menuId` is missing, it needs to be the context menu ID"
      if (typeof url !== "string" || url.length < 1) throw "`url` is missing, it needs to be a URL of the active Chrome tab"
    } catch (err) {
      console.error("eventHandleUrl(menuId, url, tabid) parameter " + err);
      return;
    }
    if (typeof tabid !== "number") tabid = 0;
    // attempt to work out if URL points to a text file
    const u = new newURLxhttpResponse(url, tabid);
    sessionStorage.setItem("retroTxt" + tabid + "isText", u.isTextFile);
    sessionStorage.setItem("retroTxt" + tabid + "encoding", u.encoding);
    const scheme = url.split(":")[0]; // discover the [scheme]:// of the URL
    if (!u.isTextFile) {
      switchContextMenus(menuId, false);
      chrome.browserAction.disable(tabid);
    } else {
      switchContextMenus(menuId, true);
      chrome.browserAction.enable(tabid);
      // automatically run retroTxt //
      // is automatic execution of RetroTxt disabled?
      var run = localStorage.getItem("autoDetectRun");
      if (typeof run !== "string" || run === "false") return; // abort

      // check optional permissions for access to 'file://*/'
      if (scheme === "file") {
        if (chrome.permissions !== undefined) {
          chrome.permissions.contains({
            permissions: ['tabs'],
            origins: ['file:///*']
          }, function(result) {
            if (result) {
              executeRetroTxtTabCallback(tabid);
            }
          });
        } else {
          // legacy Gecko 48 support
          executeRetroTxtTabCallback(tabid);
        }
      }
      // other schemes do not need permission for access
      else {
        if (u.encoding === "utf-8") executeRetroTxtTabCallback(tabid, u.encoding);
        else executeRetroTxtTabCallback(tabid);
      }
    }
  }

  // Set default options for first-time users
  // see options.js for other similar listeners
  if (chrome.runtime.onInstalled === undefined) {
    // legacy support for Gecko 48
    firstTimeOptions();
  } else {
    chrome.runtime.onInstalled.addListener(function() {
      firstTimeOptions();
    });
  }

  function firstTimeOptions() {
    chrome.storage.local.get("retroColor", function(result) {
      var r = result.retroColor;
      if (typeof r !== "string") {
        chrome.storage.local.set({
          'retroColor': "gray-black"
        });
      }
    });
    chrome.storage.local.get("retroFont", function(result) {
      var r = result.retroFont;
      if (typeof r !== "string") {
        chrome.storage.local.set({
          'retroFont': "vga8"
        });
      }
    });
    chrome.storage.local.get("textFontInformation", function(result) {
      var r = result.textFontInformation;
      if (typeof r !== "boolean") {
        chrome.storage.local.set({
          'textFontInformation': true
        });
      }
    });
    chrome.storage.local.get("centerAlignment", function(result) {
      var r = result.centerAlignment;
      if (typeof r !== "boolean") {
        chrome.storage.local.set({
          'centerAlignment': true
        });
      }
    });
    chrome.storage.local.get("fontShadows", function(result) {
      var r = result.fontShadows;
      if (typeof r !== "boolean") {
        chrome.storage.local.set({
          'fontShadows': false
        });
      }
    });
    chrome.storage.local.get("cp437CtrlCodes", function(result) {
      var r = result.cp437CtrlCodes;
      if (typeof r !== "boolean") {
        chrome.storage.local.set({
          'cp437CtrlCodes': false
        });
      }
    });
    chrome.storage.local.get("autoDetectRun", function(result) {
      var r = result.autoDetectRun;
      if (typeof r !== "boolean") {
        r = true;
        chrome.storage.local.set({
          'autoDetectRun': r
        });
      }
      // Also set session storage
      localStorage.setItem("autoDetectRun", r);
    });
  }

  // on Chrome tab activated listener
  chrome.tabs.onActivated.addListener(function(activeInfo) {
    //console.log("Activated tab id " + activeInfo.tabId);
    let sessIsText = sessionStorage.getItem("retroTxt" + activeInfo.tabId + "isText");
    if (typeof sessIsText === "string") {
      if (sessIsText === "true") {
        sessIsText = true;
        chrome.browserAction.enable(activeInfo.tabId);
      } else if (sessIsText === "false") {
        sessIsText = false;
        chrome.browserAction.disable(activeInfo.tabId);
      }
      switchContextMenus("onActivated", sessIsText);
      return; // abort
    }
  });

  // on Chrome tab created listener
  chrome.tabs.onCreated.addListener(function(tab) {
    //console.log("Created new tab with id " + tab.id);
    chrome.tabs.query({
      'status': 'complete'
    }, function(tabs) {
      if (typeof tabs === "object") {
        const tabid = tab.id,
          url = tab.url;
        // need url length check otherwise this function will accidently be
        // triggered by pop-up pages
        if (url.length) eventHandleUrl("onCreated", url, tabid);
      }
    });
  });

  // on Chrome tab updated listener
  // updated listener is needed for when a tab is refreshed
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // many web apps also trigger this listener so we must make sure the tab
    // is activate and not running in the background
    if (typeof tab !== "object" || tab.active !== true) return; // abort
    chrome.tabs.query({
      'active': true,
      'lastFocusedWindow': true,
      'status': 'complete'
    }, function(tabs) {
      /*
      Object {favIconUrl: "http://example.com/favicon.ico"}
      Object {status: "loading", url: "http://example.com"}
      Object {status: "complete"}
      */
      //console.log(changeInfo);
      if (typeof tabs === "object" && typeof tabs[0] === "object") {
        const tabid = tabs[0].id,
          url = tabs[0].url;
        eventHandleUrl("onUpdated", url, tabid);
      }
    });
  });

  // on Chrome tab close listener
  chrome.tabs.onRemoved.addListener(function(tabId, changeInfo) {
    //console.log("Closed tab with id " + tabId);
    // Clean up loose sesssionStorage
    const sessIsText = sessionStorage.getItem("retroTxt" + tabId + "isText"),
      sessEncoding = sessionStorage.getItem("retroTxt" + tabId + "encoding");
    if (typeof sessIsText === "string") sessionStorage.removeItem("retroTxt" + tabId + "isText");
    if (typeof sessEncoding === "string") sessionStorage.removeItem("retroTxt" + tabId + "encoding");
  });

  // Copy autoDetectRun to localStorage for use with all the Chrome tabs
  chrome.storage.local.get("autoDetectRun", function(result) {
    var r = result.autoDetectRun;
    if (typeof r !== "boolean") r = true;
    localStorage.setItem("autoDetectRun", r);
  });

  // Build context menu on Chrome launch and extension load
  if (chrome.runtime.onInstalled === undefined) {
    // Gecko doesn't support ["browser_action"] nor is there a way to test for support atm
    createContextMenus("Gecko48", ["page"]);

  } else {
    chrome.runtime.onInstalled.addListener(function() {
      createContextMenus("onInstalled", contexts);
    });
  }

  // Browser action (tool bar button) onClick event
  chrome.browserAction.onClicked.addListener(function(tab) {
    var scheme = tab.url.split(":")[0].toLowerCase(),
      okaySchemes = ["http", "https", "ftp", "file"],
      valid = okaySchemes.indexOf(scheme);
    if (valid > -1) {
      //console.log("Toolbar tab " + tab.id + " was clicked. Is scheme valid? " + valid);
      executeRetroTxtOnClicked(tab);
    }
  });

  // Context menus onClick events
  chrome.contextMenus.onClicked.addListener(function(info, tab) {
    var autorun = localStorage.getItem("autoDetectRun");
    switch (info.menuItemId) {
      case "options":
        chrome.runtime.openOptionsPage();
        break;
      case "infotext":
        contextMenuSaveInfo();
        break;
      case "centertext":
        contextMenuSaveAlignment();
        break;
      case "shadowtext":
        contextMenuSaveShadows();
        break;
      case "msdos":
        contextMenuSaveMSDOS();
        break;
      case "web":
        contextMenuSaveWeb();
        break;
      case "amiga":
        contextMenuSaveAmiga();
        break;
      case "appleii":
        contextMenuSaveAppleII();
        break;
      case "c64":
        contextMenuSaveC64();
        break;
      case "abortEncoding":
        // http://stackoverflow.com/questions/14245334/chrome-extension-sendmessage-from-background-to-content-script-doesnt-work
        chrome.tabs.query({
          active: true,
          currentWindow: true
        }, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "abortEncoding",
            id: "abortEncoding"
          }, function() {
            //console.log("Abort text encoding request sent");
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
        case "web":
        case "amiga":
        case "appleii":
        case "c64":
          executeRetroTxtTabCallback(null, tab);
          break;
      }
    }
  });
})();
