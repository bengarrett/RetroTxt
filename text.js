"use strict";

function calcColumns(text)
// Calculate the number of columns in use by the innerHTML text
// Regular expression sourced from
// http://stackoverflow.com/questions/8802145/replace-html-entities-with-regular-expression
// @text A required string of text
{
  try {
    if (typeof text !== "string") throw "'text' must be a string of text not a " + (typeof text);
  } catch (err) {
    console.error("calcColumns(text) the required parameter " + err);
  }
  var cleanedText, cols, i, splitTxt, len = 0,
    patt = /&(?:[a-z\d]+|#\d+|#x[a-f\d]+);/img; // find HTML entities
  cols = new textDefaults().columns; // default 80 columns
  splitTxt = text.split(/\r\n|\r|\n/); // split original text into lines
  for (i in splitTxt) {
    cleanedText = splitTxt[i].replace(patt, " ").trim(); // replace HTML entities with spaces
    if (len < cleanedText.length) len = cleanedText.length;
  }
  //console.log("Columns actual count: " + len);
  if (len <= 40) cols = 40;
  else if (len <= cols); // do nothing & keep cols as default
  else cols = len;
  return cols;
}

function changeColors(ff)
// Applies background colour to the body and colour to the <PRE> tag containing
// the text document.
// @ff  Font family to apply
{
  // only apply colour changes when viewing the stylised text document
  if (document.getElementById("retrotxt-styles") === null) return;
  var body = document.body,
    pre = document.getElementsByTagName("pre")[0],
    colors = ff.split("-"),
    rgbs = new rgbColors(),
    foreground = rgbs[colors[0]],
    background = rgbs[colors[1]];
  body.style.backgroundColor = background;
  pre.style.color = foreground;
  if (colors[1] === "white") {
    var h = document.getElementsByTagName("header")[0];
    if (h !== null) {
      h.style.color = rgbs.black;
    }
  }
}

function changeLineHeight(lh)
// Applies line height modifications to the <PRE> tag containing the text document.
// @lh Number that will be multiplied with the font size to set the line height.
{
  var pre = document.getElementsByTagName("pre")[0];
  pre.style.lineHeight = lh;
}

function changeFont(ff)
// Applies the font family to the <PRE> tag containing the text document.
// @ff  Font family to apply
{
  var defaults = new textDefaults(),
    font = new fontSettings(ff),
    header = document.getElementById("h-doc-font"),
    pre = document.getElementsByTagName("pre")[0],
    spanCols = document.getElementById("h-doc-width").innerHTML,
    spanPixels = document.getElementById("h-doc-size"),
    textWidthPx = 0;
  // determine width of text and header
  textWidthPx = font.width * spanCols;
  // sometimes text contains no fix lines breaks,
  // so in that case we use CSS to wrap the text.
  if (spanCols > defaults.columns && window.innerWidth <= font.width * spanCols) {
    pre.style.whiteSpace = "pre-line";
    textWidthPx = font.width * defaults.columns; // override columns with default width
  }
  // apply width adjustments
  pre.style.width = `${textWidthPx}px`;
  header.style.width = `${textWidthPx}px`;
  document.getElementById("h-doc-width").title = `Columns of text equalling ${textWidthPx}px`;
  // apply changes to <PRE>
  pre.style.fontFamily = font.family;
  pre.style.lineHeight = font.cssLineHeight;
  pre.style.fontSize = font.cssFontSize;
  // apply to information <HEADER>
  header.innerHTML = font.string;
  spanPixels.innerHTML = `${font.width}x${font.height}`;
}

function changeHeader(colors, elm)
// Depending on the background colour, selects the text colour containing the font/doc information.
// @bgc Background colour name
{
  if (typeof elm !== "object") return;
  if (typeof colors === "undefined") return;
  var bgc = colors.split("-")[1],
    c = "white",
    def = new textDefaults();
  if (bgc === "white") c = "black";
  elm.style.color = c;
  elm.style.fontFamily = def.family;
  elm.style.width = def.width;
}

function dspOriginalText(elm)
// Display the original, unmodified text document
{
  if (typeof elm !== "object" || typeof elm.body !== "object") {
    elm = new pageElements();
  }
  //console.log("Showing original document.");
  // delete link to CSS
  elm.head.removeChild(elm.head.childNodes[0]);
  // delete page customisations
  elm.body.removeAttribute('style');
  if (elm.preCount >= 2) {
    elm.header.style.display = "none";
    elm.pre0.style.display = "none";
    elm.pre1.style.display = null;
  } else {
    elm.pre0.style.display = null;
  }
}

function dspRetroTxt(elm)
// Display the text document processed by RetroTxt
{
  if (typeof elm !== "object" || typeof elm.body !== "object") {
    elm = new pageElements();
  }
  //console.log("Showing stylised document.");
  chrome.storage.local.get("textFontInformation", function(result) {
    var r = result.textFontInformation;
    if (typeof r === "boolean" && r === false) elm.header.style.display = "none";
    else elm.header.style.display = "block";
  });
  elm.pre0.style.display = "block";
  elm.pre1.style.display = "none";
}

function exeRetroTxt(evt)
// Execute RetroTxt
{
  if (typeof evt !== "string") evt = "";
  var elm = new pageElements();

  // end the function if the browser tab already had RetroTxt applied
  if (evt.split("-")[0] === "tab" && elm.cssLink !== null) return;

  // get and apply user's saved color choices
  chrome.storage.local.get("retroColor", function(result) {
    var r = result.retroColor;
    if (typeof r === "string") changeColors(r);
  });
  // get and apply user's saved font selection
  chrome.storage.local.get("retroFont", function(result) {
    var r = result.retroFont;
    if (typeof r === "string") changeFont(r);
  });
  // get and apply user's line height choices
  chrome.storage.local.get("lineHeight", function(result) {
    var r = result.lineHeight;
    if (typeof r === "string") changeLineHeight(r);
  });

  // context menu onclick listener
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "abortEncoding") {
      if (sessionStorage.getItem("abortEncoding") === null) {
        // save a session item to tell RetroTxt not to render the text on this tab
        sessionStorage.setItem("abortEncoding", true);
      } else {
        sessionStorage.removeItem("abortEncoding");
      }
      // reload the active tab
      window.location.reload();
    }
  });

  // monitor for any changed user options to either font or colour selections
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    // font
    if (changes.retroFont) {
      changeFont(changes.retroFont.newValue);
      chrome.storage.local.get("lineHeight", function(result) {
        changeLineHeight(result.lineHeight);
      });
    }
    // colour
    else if (changes.retroColor) {
      var changedC = changes.retroColor.newValue;
      elm.header = document.getElementById("h-doc-container");
      changeColors(changedC);
      changeHeader(changedC, elm.header);
      // need to also update font shadow colour
      chrome.storage.local.get("fontShadows", function(result) {
        var r = result.fontShadows,
          pre = document.getElementsByTagName("pre")[0];
        if (typeof r === "boolean" && r === true && typeof pre === "object") {
          textShadow(true, pre, changedC);
        }
      });
    }
    // line height
    else if (changes.lineHeight) {
      changeLineHeight(changes.lineHeight.newValue);
    }
    // information text
    else if (changes.textFontInformation) {
      var h = document.getElementById("h-doc-container");
      if (typeof h === "object") {
        if (!changes.textFontInformation.newValue) h.style.display = "none";
        else h.style.display = "block";
      }
    }
    // centre alignment
    else if (changes.centerAlignment) {
      var h = document.body;
      if (typeof h === "object" && changes.centerAlignment.newValue) {
        elm.body.style.alignItems = "center";
        elm.body.style.justifyContent = "center";
      } else {
        elm.body.style.alignItems = "initial";
        elm.body.style.justifyContent = "initial";
      }
    }
    // shadows
    else if (changes.fontShadows) {
      var pre = document.getElementsByTagName("pre")[0];
      if (typeof pre === "object") {
        textShadow(changes.fontShadows.newValue, pre);
      }
    }
  });

  /* Switch between the original and our stylised copy of the text document */
  // Original text document
  if (elm.cssLink !== null) {
    dspOriginalText(elm);
  }
  // Stylised text document
  else {
    // make a <link> to point to the custom CSS
    var cssLink = linkCSS("text.css", "retrotxt-styles");
    elm.cssLink = document.getElementsByTagName("head")[0].appendChild(cssLink);
    elm.cssLink.disabled = false;
    elm.body.style.display = "flex"; // use css3 flexbox
    elm.body.style.flexDirection = "column"; // stack items
    // centre alignment of text
    chrome.storage.local.get("centerAlignment", function(result) {
      var r = result.centerAlignment;
      if (typeof r === "boolean" && r === true) {
        elm.body.style.alignItems = "center"; // vertical align
        elm.body.style.justifyContent = "center"; // horizontal align
      }
    });
    // Restore stylised text, hide original unconverted text
    if (elm.preCount >= 2) {
      dspRetroTxt(elm);
    }
    // Create a copy of the text document for applying styles.
    else {
      //console.log("Building stylised document.");
      var d0, d1,
        newPre = document.createElement("pre"),
        newHeader = document.createElement("header"),
        txtCols,
        txtDef = new textDefaults(),
        txtFormat, txtLength,
        txtStr = elm.pre0.innerHTML;

      // count the number of text columns
      txtCols = calcColumns(txtStr);

      // Abort CP437 to Unicode encoding?
      var utf8abort = false,
        utf8patt = /â\S\Sâ\S\S/g; // crude regex for UTF-8 detection

      // User forced abort using the 'Text encoding' context menu item
      utf8abort = sessionStorage.getItem("abortEncoding");

      // Otherwise use this crude regex to detect UTF-8 encoding
      if (utf8abort !== "true" && utf8abort !== true) {
        utf8abort = utf8patt.test(txtStr);
      }

      // if source text is already encoded in UTF-8, skip the conversion
      if (utf8abort !== "true" && utf8abort !== true && (evt.length === 0 || evt.split("-")[1].toLowerCase !== "utf-8")) {
        // chrome storage is asynchronous so fetch the user's saved
        // options and store them as synchronous sessionStorage
        chrome.storage.local.get("cp437CtrlCodes", function(result) {
          var r = result.cp437CtrlCodes;
          if (typeof r === "boolean") {
            sessionStorage.setItem("cp437CtrlCodes", r);
          }
        });
        // converts cp437/iso/windows 1252 code page text into utf-8
        // run this asynchronously using Promise to speed up performance
        var promise = new Promise(function(resolve, reject) {
          var d0 = new Date().getTime(),
            d1;
          //var part1, part2, part3, part4; // sliced text containers
          //var p1eol, p2eol, p3eol, p4eol = 0; // end of processing chr. position
          var tasks = 1,
            txtLen = txtStr.length;
          /*
          // place holder for future async function support
          // http://www.sitepoint.com/javascript-goes-asynchronous-awesome/
          // slice text up into multiple threads if larger than
          if (txtLen > 1024 * 40) tasks = 4; // 40KB
          else if (txtLen > 1024 * 10) tasks = 2; // 10KB
          //tasks = 1;
          // synchronous processing
          if (tasks <= 1) {
            txtFormat = txtConvert(txtStr);
          }
          // asynchronous processing
          else {
            p1eol = (txtLen / tasks).toFixed(0);
            if (tasks === 2) p2eol = txtLen;
            else {
              // 4 tasks
              p2eol = ((txtLen / tasks) * 2).toFixed(0);
              p3eol = ((txtLen / tasks) * 3).toFixed(0);
              p4eol = txtLen;
            }
            part1 = txtStr.slice(0, p1eol);
            part2 = txtStr.slice(p1eol++, p2eol);
            if (tasks === 4) {
              part3 = txtStr.slice(p2eol++, p3eol);
              part4 = txtStr.slice(p3eol++, p4eol);
            }
            part1 = txtConvert(part1);
            part2 = txtConvert(part2);
            if (tasks === 4) {
              part3 = txtConvert(part3);
              part4 = txtConvert(part4);
            }
            if (tasks === 2) {
              txtFormat = part1.concat(part2);
            } else {
              txtFormat = part1.concat(part2, part3, part4);
            }
          }
         */
          txtFormat = txtConvert(txtStr);
          d1 = new Date().getTime();
          // count number of lines
          txtLength = txtFormat.split(/\r\n|\r|\n/).length;
          //console.log("Time taken to convert text: " + (d1 - d0) + " milliseconds");
          if (txtFormat.length < txtLen) {
            // the converted text should be at least the same size as the original
            reject(Error("Text did not convert correctly, original length " + txtLen + " new length " + txtFormat.length));
          } else {
            resolve(txtFormat);
          }
        });
        promise.then(function(data) {
          // inject converted utf-8 encoded text
          newPre.innerHTML = data;
        }, function(error) {
          // if an error occurred then inject the original, unmodified text
          newPre.innerHTML = elm.pre0.innerHTML;
          console.error(error.message);
        });
      } else {
        // if unicode encoding detected then inject and use the original text
        txtFormat = elm.pre0.innerHTML;
        txtLength = txtFormat.split(/\r\n|\r|\n/).length;
        newPre.innerHTML = txtFormat;
        console.log("UTF-8 encoding was detected in this document")
      }

      // lock centring alignment to 640px columns
      newPre.style.width = txtDef.width;

      // create the information header
      newHeader.id = "h-doc-container";
      newHeader.innerHTML = `<span id="h-doc-width" title="Columns of text">${txtCols}</span> x\
                      <span id="h-doc-height" title="Lines of text">${txtLength}</span> \
                      <span id="h-doc-chars" title="Number of characters contained in the text"></span> \
                      <span id="h-doc-font" title="Font family used for display"></span> \
                      <span id="h-doc-size" title="Font size in pixels"></span>`;

      // font shadow
      chrome.storage.local.get("fontShadows", function(result) {
        var r = result.fontShadows;
        if (typeof r === "boolean" && r === true) textShadow(r, newPre);
      });
      // invert header font colour when using a white background
      chrome.storage.local.get("retroColor", function(result) {
        var r = result.retroColor;
        changeHeader(result.retroColor, newHeader);
      });
      // display or hide header
      chrome.storage.local.get("textFontInformation", function(result) {
        var r = result.textFontInformation;
        if (typeof r === "boolean" && r === false) newHeader.style.display = "none";
      });
      // hide original unconverted text
      elm.pre0.style.display = "none";
      // insert new tags into HTML DOM
      elm.body.insertBefore(newHeader, elm.pre0);
      elm.body.insertBefore(newPre, elm.pre0);
    }
  }
}

function pageElements() {
  this.body = document.body;
  this.head = document.getElementsByTagName("head")[0];
  this.header = document.getElementById("h-doc-container");
  this.cssLink = document.getElementById("retrotxt-styles");
  this.preCount = document.getElementsByTagName("pre").length;
  this.pre0 = document.getElementsByTagName("pre")[0];
  this.pre1 = document.getElementsByTagName("pre")[1];
}

function textDefaults()
// Default font for text information header
{
  this.family = "vga9";
  this.columns = 80;
  this.width = "640px";
}
