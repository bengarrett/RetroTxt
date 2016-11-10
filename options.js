 // filename: options.js
 //
 // These functions are used exclusively by the Options dialogue.

 "use strict";

 // This runs whenever the Options dialogue is opened or in Firefox when the
 // options tab is refreshed.
 (function() {
   // exit if running qunit tests
   if (typeof qunit !== "undefined") return;

   // defaults and font, colour combinations
   const radios = document.forms.fonts.getElementsByTagName("label"),
     webExtensionEngine = findEngine();

   // restore any saved options
   document.addEventListener("DOMContentLoaded", changeOnOptions);
   changeOnColors();
   changeOnFont();
   changeOnEffects();

   // apply regional English modifications
   changeI18nWord("color", "msg-color"); // color vs colour
   changeI18nWord("center", "msg-center"); // center vs centre
   document.getElementById("gray-white-option").innerHTML = chrome.i18n.getMessage("gray_white_option"); // gray vs grey

   function listenForFonts()
   // font selection listeners for the radio buttons
   {
     let status = document.getElementById("status");
     for (let i = 0, len = radios.length; i < len; i++) {
       buildRadioListeners(i);
     }

     function buildRadioListeners(i) {
       // radio click listener
       radios[i].onclick = function() {
         const fface = this.getElementsByTagName("input")[0].value;
         status.textContent = `Saved font selection ${fface}`;
         changeStorageFont();
       };
       // radio mouseover listener
       radios[i].onmouseover = function() {
         const fface = this.getElementsByTagName("input")[0].value;
         status.textContent = `Font ${fface}`;
         changeFont(fface);
       };
       // reset sample text when user's mouse leaves the font selection form
       const radioInput = document.getElementById(radios[i].htmlFor);
       document.getElementById("font-form").addEventListener("mouseleave", function() {
         if (radioInput.checked === true) {
           status.textContent = `Font ${radioInput.value}`;
           changeFont(radioInput.value);
         }
       });
     }
   }
   listenForFonts();

   // colour selection listeners
   document.getElementById("font-color").addEventListener("change", function() {
     let status = document.getElementById("status");

     function findColorName(c) {
       let s = ``;
       switch (c) {
         case "theme-appleii":
           s = `Apple II`;
           break;
         case "theme-amiga":
           s = `Amiga`;
           break;
         case "themec64":
           s = `Commodore 64`;
           break;
         case "theme-msdos":
           s = `MS-DOS`;
           break;
         default:
           s = c.replace(/-/g, ` `);
           break;
       }
       return s;
     }
     status.textContent = `Saved ${findColorName(this.value)} ${chrome.i18n.getMessage("color")} pair`;
     buildColors(this.value);
     changeOnFont();
     changeStorageColors();
     changeOnEffects();
   });

   // line height selection events
   document.getElementById("line-height").addEventListener("change", function() {
     let status = document.getElementById("status");
     status.textContent = `Saved ${this.value} line height selection`;
     changeStorageLineHeight();
   });

   // websites list
   document.getElementById("run-web-urls-permitted").addEventListener("input", function() {
     let status = document.getElementById("status");
     if (this.value.length === 0) {
       status.textContent = `Reset websites to defaults`;
       const defaults = new ListDefaults();
       this.value = defaults.autoDomains.join(";");
     } else status.textContent = `Updated websites`;
     changeStorageURLs();
   });

   // check-boxes
   document.getElementById("text-font-information").addEventListener("change", function() {
     chrome.storage.local.set({
       "textFontInformation": this.checked
     });
   });
   document.getElementById("center-alignment").addEventListener("change", function() {
     chrome.storage.local.set({
       "textCenterAlignment": this.checked
     });
   });
   document.getElementById("font-shadows").addEventListener("change", function() {
     chrome.storage.local.set({
       "textFontShadows": this.checked
     });
     changeOnEffects();
   });
   document.getElementById("dos-ctrl-codes").addEventListener("change", function() {
     chrome.storage.local.set({
       "textDosCtrlCodes": this.checked
     });
     localStorage.setItem("textDosCtrlCodes", this.checked);
     let text = document.getElementById("sample-dos-ctrls");
     if (this.checked === true) text.style.display = `inline`;
     else text.style.display = `none`;
   });
   document.getElementById("background-scanlines").addEventListener("change", function() {
     chrome.storage.local.set({
       "textBgScanlines": this.checked
     });
     changeOnEffects();
   });
   document.getElementById("run-web-urls").addEventListener("change", function() {
     chrome.storage.local.set({
       "runWebUrls": this.checked
     });
     localStorage.setItem("runWebUrls", this.checked); // set localStorage for active browser tabs
     const urlList = document.getElementById("run-web-urls-permitted");
     if (this.checked !== true) urlList.disabled = true;
     else urlList.disabled = false;
   });
   // local file access (file:/// scheme) and downloads file access
   if (typeof chrome.extension.isAllowedFileSchemeAccess !== undefined) {
     chrome.extension.isAllowedFileSchemeAccess(function(result) {
       // local file access
       if (result === true || webExtensionEngine === "gecko") {
         document.getElementById("run-file-urls").addEventListener("change", function() {
           chrome.storage.local.set({
             "runFileUrls": this.checked
           });
           localStorage.setItem("runFileUrls", this.checked); // set localStorage for active browser tabs
         });
       }
       // downloads file access [blink engine]
       if (result === true && webExtensionEngine === "blink") {
         document.getElementById("run-file-downloads").addEventListener("change", function() {
           chrome.storage.local.set({
             "runFileDownloads": this.checked
           });
           localStorage.setItem("runFileDownloads", this.checked); // set localStorage for active browser tabs
         });
       }
     });
   }

   // filter available extension options and styling by browser engine and
   // WebExtension API support

   let localFileAccess = document.getElementById("run-file-urls-link");

   // filter by extension installation type
   if (typeof chrome.management !== "undefined") {
     chrome.management.getSelf(function(info) {
       switch (info.installType) {
         case "development":
           // reveal developer links
           let testLink = document.getElementById("unittest");
           testLink.style.display = `inline`;
           break;
       }
     });
   }

   // filter by support for isAllowedFileSchemeAccess
   // chrome.extension has no Edge, limited Firefox support
   chrome.extension.isAllowedFileSchemeAccess(function(result) {
     function disableOption(checkbox = ``)
     // disable Options where the extension has not be granted permission
     {
       const reason = `RetroTxt requires 'Allow access to file URLs' to be rechecked`;
       let cb = document.getElementById(`${checkbox}`),
         i = document.getElementById(`${checkbox}-icon`);
       cb.checked = false;
       cb.disabled = true;
       cb.title = reason;
       i.style = `color: rgba(0, 0, 0, 0.26);`; // the `md-inactive` class doesn't seem to work here
       i.title = reason;
       localFileAccess.style = `pointer-events: none;  cursor: default; text-decoration: none;`;
     }

     function hideOption(checkbox = ``)
     // hide UI from the Options dialogue
     {
       let d = document.getElementById(`${checkbox}-div`);
       d.style = `display: none;`;
     }
     if (result === false && webExtensionEngine !== "gecko") {
       disableOption(`run-file-urls`);
     }
     if (result === false) {
       disableOption(`run-file-downloads`);
     }
     if (webExtensionEngine !== "blink") {
       hideOption(`run-file-downloads`);
     }
   });

   // filter by the web browser's render engine
   switch (webExtensionEngine) {
     case "gecko":
       // file:///c: href doesn't work in Firefox
       localFileAccess.removeAttribute("href");
       localFileAccess.removeAttribute("target");
       // Firefox 48 doesn't support options_ui.chrome_style so load options_firefox.css
       let link = document.createElement("link");
       link.rel = `stylesheet`;
       link.href = `css/options_firefox.css`;
       document.head.appendChild(link);
       // add new tab targets for all links
       document.addEventListener("click", function(e) {
         if (e.target.href !== undefined && !e.target.hasAttribute("target")) {
           e.target.setAttribute("target", "_blank");
         }
       });
       break;
   }
   // filter by web browser's host operating system
   chrome.runtime.getPlatformInfo(function(info) {
     switch (info.os) {
       case "win":
         // Windows requires a drive letter for file links
         localFileAccess.setAttribute("href", "file:///C:/");
         break;
     }
   });
 })();

 function buildColors(className = ``)
 // Generates CSS for font colours.
 // @className   Font colours selection value
 {
   let sample = document.getElementById("sample-dos-text"),
     i = 0;
   const classAsArray = sample.className.split(" ");
   // loop through and remove any *-bg and *-fg classes
   i = classAsArray.length;
   while (i--) {
     if (classAsArray[i].endsWith("-bg")) sample.classList.remove(classAsArray[i]);
     if (classAsArray[i].endsWith("-fg")) sample.classList.remove(classAsArray[i]);
   }
   sample.classList.add(`${className}-bg`);
   sample.classList.add(`${className}-fg`);
 }

 function changeFont(ff)
 // Adjusts the font family and font height styles
 // @ff  Font family to apply
 // @elm HTML element to apply the font styles too
 {
   if (typeof ff === "undefined") return;
   let sample = document.getElementById("sample-dos-text"),
     i = 0;
   const classAsArray = sample.className.split(" ");
   // loop through and remove any font-* classes
   i = classAsArray.length;
   while (i--) {
     if (classAsArray[i].startsWith("font-")) sample.classList.remove(classAsArray[i]);
   }
   sample.classList.add(`font-${ff}`);
 }

 function changeI18nWord(name = ``, cls = ``)
 // Annoying word-around to add i18n support to .html files
 // @name i18n message name
 // @cls  span class name to inject translation into
 {
   if (name.length === 0 || cls.length === 0) return;
   // word capitalization
   function capitalize(s) {
     return s[0].toUpperCase() + s.slice(1);
   }
   let newword = chrome.i18n.getMessage(name),
     words = document.getElementsByClassName(cls);
   const wordCnt = words.length;
   for (let i = 0, len = wordCnt; i < len; i++) {
     let word = words[i].innerHTML;
     if (word.slice(0, 1).toUpperCase()) {
       newword = capitalize(newword);
     }
     words[i].innerHTML = newword;
   }
 }

 function changeOnColors()
 // Gets and applies user's saved font colours to sample text.
 {
   chrome.storage.local.get("retroColor", function(result) {
     const r = result.retroColor;
     if (typeof r !== "string") return;
     buildColors(r);
   });
 }

 function changeOnEffects()
 // Gets and applies user's saved font family to sample text.
 {
   chrome.storage.local.get(["textFontShadows", "textBgScanlines"], function(result) {
     const sample = document.getElementById("sample-dos-text"),
       r1 = result.textFontShadows,
       r2 = result.textBgScanlines;
     if (typeof r1 !== "boolean" || typeof r2 !== "boolean") return;
     changeTextShadow(r1, sample);
     changeTextScanlines(r2, sample);
   });
 }

 function changeOnFont()
 // Gets and applies user's saved font family to sample text.
 {
   chrome.storage.local.get("retroFont", function(result) {
     const r = result.retroFont;
     if (typeof r !== "string") return;
     changeFont(r);
   });
 }

 function changeOnOptions()
 // Sets the options form to match the user's saved options
 {
   let colorSel = document.getElementById("font-color"), // form theme selector
     fontSel = document.getElementsByName("font"), // form font selector
     configurations = {}, // this will be requested from eventpage.js
     lhSel = document.getElementById("line-height"); // form line-height selector
   const defaults = new ListDefaults(),
     webExtensionEngine = findEngine();

   // Send a request to the eventpage.js to request its ListSettings() object
   // This function also triggers changeStorageOn() after the response has been
   // received.
   notifyEventpage();

   function notifyEventpage() {
     chrome.runtime.sendMessage({
         askForSettings: true
       },
       handleResponse
     );
   }

   function handleResponse(response)
   // handles the response sent by eventpage.js after a notifyEventpage() request
   // @response   Object containing ListSettings() data
   {
     configurations = response;
     // Fetch and apply stored settings
     // We run the Options configurations after our response has been received
     // so we can use the data replied by the eventpage.js message listener.
     chrome.storage.local.get(null, changeStorageOn);
     if (typeof chrome.extension.isAllowedFileSchemeAccess !== "undefined") {
       chrome.extension.isAllowedFileSchemeAccess(changeDownloadOn);
     }
   }

   function changeStorageOn(result) {
     let i = 0,
       len = 0,
       text = ``;
     if (typeof configurations === "undefined") {
       try {
         throw `There was a message failure when attempting to fetch the configuration defaults from the eventpage.js`;
       } catch (e) {
         console.error("changeStorageOn()", e);
       }
     }
     // Colour setting
     let r1 = result.retroColor;
     if (typeof r1 !== "string") r1 = configurations.retroColor;
     for (i = 0, len = colorSel.length; i < len; i++) {
       if (colorSel[i].value === r1) {
         colorSel[i].selected = true;
         break;
       }
     }
     // Font
     let r2 = result.retroFont;
     if (typeof r2 !== "string") r2 = configurations.retroFont;
     for (i = 0, len = fontSel.length; i < len; i++) {
       if (fontSel[i].value === r2) {
         fontSel[i].checked = true;
         break;
       }
     }
     // Line Height
     let r3 = result.lineHeight;
     if (typeof r3 !== "string") r3 = configurations.lineHeight;
     for (i = 0, len = lhSel.length; i < len; i++) {
       if (lhSel[i].value === r3) {
         lhSel[i].selected = true;
         break;
       }
     }
     // Text information
     let input4 = document.getElementById("text-font-information"),
       r4 = result.textFontInformation;
     if (typeof r4 !== "boolean") r4 = configurations.textFontInformation;
     input4.checked = r4;
     // Centre alignment
     let input5 = document.getElementById("center-alignment"),
       r5 = result.textCenterAlignment;
     if (typeof r5 !== "boolean") r5 = configurations.textCenterAlignment;
     input5.checked = r5;
     // Font Shadows
     let input6 = document.getElementById("font-shadows"),
       r6 = result.textFontShadows;
     if (typeof r6 !== "boolean") r6 = configurations.textFontShadows;
     input6.checked = r6;
     // Scan lines
     let input7 = document.getElementById("background-scanlines"),
       r7 = result.textBgScanlines;
     if (typeof r7 !== "boolean") r7 = configurations.textBgScanlines;
     input7.checked = r7;
     // Display DOS Control codes
     let input8 = document.getElementById("dos-ctrl-codes"),
       r8 = result.textDosCtrlCodes;
     text = document.getElementById("sample-dos-ctrls");
     if (typeof r8 !== "boolean") r8 = configurations.textDosCtrlCodes;
     input8.checked = r8;
     if (r8 === true) text.style.display = `inline`;
     else text.style.display = `none`;
     // URLs for auto-run
     let input9 = document.getElementById("run-web-urls"),
       r9 = result.runWebUrls;
     text = document.getElementById("run-web-urls-permitted");
     if (typeof r9 !== "boolean") r9 = configurations.runWebUrls;
     input9.checked = r9;
     if (r9 !== true) text.disabled = true;
     else text.disabled = false;
     // list of URls
     let rA = result.runWebUrlsPermitted;
     if (typeof rA === "undefined" || rA.length === 0) {
       rA = defaults.autoDomains.join(";");
     }
     localStorage.setItem("runWebUrlsPermitted", rA);
     text.value = rA;
   }

   function changeDownloadOn(access)
   // local file access (`file:///` scheme) and downloads file access
   // Can't be run from within changeStorageOn()
   {
     // local file access
     if (access === true || webExtensionEngine === "gecko") {
       chrome.storage.local.get("runFileUrls", function(result) {
         let input = document.getElementById("run-file-urls"),
           r = result.runFileUrls;
         if (typeof r !== "boolean") r = configurations.runFileUrls;
         input.checked = r;
       });
     }
     // downloads file access
     if (access === true && webExtensionEngine === "blink") {
       chrome.storage.local.get("runFileDownloads", function(result) {
         let input = document.getElementById("run-file-downloads"),
           r = result.runFileDownloads;
         if (typeof r !== "boolean") r = configurations.runFileDownloads;
         input.checked = r;
       });
     }
   }
 }

 function changeStorageColors()
 // Saves the user font and background colour selection to local browser storage.
 {
   const select = document.getElementById("font-color"),
     colors = select.options[select.selectedIndex].value;
   chrome.storage.local.set({
     "retroColor": colors
   });
 }

 function changeStorageFont()
 // Saves the user font selection to local browser storage.
 {
   const font = document.fonts.font.value;
   chrome.storage.local.set({
     "retroFont": font
   });
 }

 function changeStorageLineHeight()
 // Saves the user line height adjustments to local browser storage.
 {
   const select = document.getElementById("line-height"),
     heights = select.options[select.selectedIndex].value;
   chrome.storage.local.set({
     "lineHeight": heights
   });
 }

 function changeStorageURLs()
 // Saves the user website selection to local browser storage.
 {
   let urlList = document.getElementById("run-web-urls-permitted").value;
   if (urlList.length === 0) {
     // if input is empty then delete the storage to revert it back to defaults
     const defaults = new ListDefaults();
     urlList = defaults.autoDomains.join(";");
   }
   chrome.storage.local.set({
     "runWebUrlsPermitted": urlList
   });
   localStorage.setItem("runWebUrlsPermitted", urlList);
 }
