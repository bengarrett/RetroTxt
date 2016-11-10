// filename: functions.js
// jshint unused:vars
//
// These functions are shared between all pages including
// eventpage.js options.js and text*.js

"use strict";

function ListCharacterSets()
//
{
  // C0 common characters
  // 8 Backspace, 9 Horizontal tab, 10 Line feed (line break), 12 Form feed (page break)
  // 13 Carriage return, 26 End of file (not a C0 standard but used in MS-DOS)
  this.C0common = [8, 9, 10, 12, 13, 26];
  this.sets = ["USASCII", "CP437", "CP865", "CP1252", "ISO88591", "ISO885915", "UTF8", "UTFERR"];
}

function ListDefaults()
// Default lists of data used by the Options and also parsing online resources
{
  // A list of domains that RetroTxt will run on in the background.
  // These can be modified by the user in the Options.
  this.autoDomains = ["defacto2.net", "gutenberg.org", "scene.org", "textfiles.com", "uncreativelabs.net"];
  // These domains will always be ignored, as RetroTxt breaks their functionality
  this.avoidDomains = ["feedly.com", "github.com"];
  // File extensions that RetroTxt will run on in the background when using file://
  this.autoFileExtensions = ["asc", "ascii", "ans", "ansi", "diz", "faq", "nfo", "pcb", "text", "txt"];
  // File extensions of files to ignore when using file:///
  const html = ["css", "htm", "html", "js", "json", "md", "xml", "yml"],
    images = ["apng", "bmp", "dib", "gif", "jpeg", "jpg", "ico", "svg", "svgz", "png", "tiff", "webp", "xbm"],
    other = ["ini", "pdf"];
  this.avoidFileExtensions = html.concat(images, other);
  // Text options
  this.columns = 80;
  this.width = `640px`;
}

function ListRGBThemes()
// CSS classes that point to RGB based themes in css/text_colors.css
{
  // 1-bit themes
  this.msdos = `theme-msdos`;
  this.web = `theme-web`;
  this.amiga = `theme-amiga`;
  this.appleii = `theme-appleii`;
  this.c64 = `theme-c64`;
  // list of 4-bit themes (ECMA-48, PCBoard, WildCat!)
  this.colors = ["gray", "vga", "xterm"];
  this.color = 1; // default coloured theme 0 = grey-scale, 1 = IBM-PC VGA, 2 = xterm
}

function BuildFontStyles(ff = `vga8`)
// Return CSS3 styles to use with the font
// @ ff  CSS font family class name
{
  // the functionality of this function has been moved to retotxt.css
  // Humanise font family name
  let str = ff.toUpperCase();
  str = str.replace("-2X", " (wide)");
  str = str.replace("-2Y", " (narrow)");
  str = str.replace("CGATHIN", " CGA Thin");
  str = str.replace("TANDYNEW", " Tandy ");
  // properties
  this.family = ff;
  this.string = str;
}

function buildLinksToCSS(f = ``, i = ``)
// Creates a LINK tag used to load a style sheet
// @f   CSS file name
// @i   ID name to apply to link tag
{
  if (f.length === 0) throw `required 'f' parameter pointing to a CSS filename is missing`;
  let l = document.createElement("link");
  if (i.length) l.id = i;
  l.href = chrome.extension.getURL(f);
  l.type = `text/css`;
  l.rel = `stylesheet`;
  return l;
}

function changeTextScanlines(s = true, elm, color)
// Applies CSS3 mock scan line effects to an element
// @s     required boolean to enable or disable text show
// @elm   required HTML DOM element object to apply shadow effect to
// @color optional CSS colour class when we already know the new colour values
{
  if (typeof elm !== "object") throw `required 'elm' object parameter is missing, it needs to contain a HTML DOM element`;

  function applyStyle(c) {
    if (typeof c === "string") {
      // remove any existing scan lines
      elm.classList.remove("scanlines-light", "scanlines-dark");
      if (c.endsWith(`-on-white`) || ["theme-windows", "theme-appleii"].includes(c)) {
        elm.classList.add("scanlines-light");
      } else {
        elm.classList.add("scanlines-dark");
      }
    }
  }
  // if s is false then disable the style
  if (s === false) {
    // removing class that do not exist doesn't throw errors
    elm.classList.remove("scanlines-light", "scanlines-dark");
  }
  // use colours provided by the colour parameter
  else if (typeof color === "string") {
    applyStyle(color);
  }
  // use colours fetched from chrome's storage (default)
  else {
    chrome.storage.local.get("retroColor", function(result) {
      const r = result.retroColor;
      applyStyle(r);
    });
  }
}

function changeTextShadow(s = true, elm, color)
// Applies CSS3 text shadowing effects to an element
// @s     required boolean to enable or disable text show
// @elm   required HTML DOM element object to apply shadow effect to
// @color required CSS colour class when we already know the new colour values
{
  if (typeof elm !== "object") throw `required 'elm' object parameter is missing, it needs to contain a HTML DOM element`;

  const classes = elm.classList;
  let item = ``;
  // This removes any class names that use '-shadow' as their suffex
  for (let i = 0; i < classes.length; i++) {
    item = classes.item(i);
    if (item.endsWith(`-shadowed`) === true) elm.classList.remove(item);
  }

  // do nothing as all shadow classes have already been removed
  if (s === false) return;
  // use colours provided by the colour parameter
  else if (s === true && typeof color === "string") {
    // apply shadow class
    elm.classList.add(`${color}-shadowed`);
  }
  // use colours fetched from chrome's storage (default)
  else {
    chrome.storage.local.get("retroColor", function(result) {
      const r = result.retroColor;
      // apply shadow class
      elm.classList.add(`${r}-shadowed`);
    });
  }
}

function findControlSequences(s = ``)
// Scans a text for supported legacy BBS colour codes
// @s   String of text to scan (only need the first 4 characters)
{
  const t = s.toUpperCase();
  let a, b;
  // make sure first char is an @-code
  if (t.charAt(0) === "@") {
    // match pcboard `@Xxx` codes
    if (t.charAt(1) === "X") {
      a = t.charCodeAt(2); // get Unicode indexes of 2nd + 3rd chars
      b = t.charCodeAt(3);
      // index range 48-70 eq 0-9 A-F
      if (a >= 48 && b >= 48 && a <= 70 && b <= 70) return "pcboard";
    } else if (s.startsWith(`@CLS@`)) return "pcboard";
    // match wildcat `@xx@` codes
    else if (t.charAt(3) === "@") {
      a = t.charCodeAt(1); // get Unicode indexes of 1st + 2nd chars
      b = t.charCodeAt(2);
      if (a >= 48 && b >= 48 && a <= 70 && b <= 70) return "wildcat";
    }
  }
  // ECMA-48 control sequences
  // REVIEW could expand this to check valid numbers in position 2 & 3
  else if (t.charCodeAt(0) === 27 && t.charAt(1) === "[") return "ecma48";
  // plain text (no codes detected)
  else return `plain`;
}

function findEngine()
// Determine the user's browser engine
{
  if (chrome.runtime.getManifest().options_ui !== undefined && chrome.runtime.getManifest().options_ui.page !== undefined) {
    const manifest = chrome.runtime.getManifest().options_ui.page,
      gecko = manifest.startsWith("moz-extension", 0);
    let browser = `blink`; // Chrome compatible
    if (gecko === true) browser = `gecko`; // Firefox compatible
    return browser;
  }
}

function FindTranscode(code = ``)
// Humanises transcode ids into a short and longer title
{
  let text = ``,
    title = ``;
  switch (code) {
    case "CP437":
      text = `CP-437`;
      title = `IBM/MS-DOS Code Page 437`;
      break;
    case "CP865":
      text = `CP-865`;
      title = `IBM/MS-DOS Code Page 865`;
      break;
    case "CP1252":
      text = `Windows-1252`;
      title = `Code Page 1252 commonly used in legacy Microsoft Windows systems`;
      break;
    case "ISO88591":
      text = `ISO-8859-1`;
      title = `ISO-8859 — Part 1: Latin alphabet No. 1 alternatively known as ECMA-94`;
      break;
    case "ISO885915":
      text = `ISO-8859-15`;
      title = `ISO-8859 Part 15: Latin alphabet No. 9`;
      break;
    case "UTFERR":
      text = `Unsupported UTF-8 4-bit encoding`;
      title = `Currently RetroTxt only supports Unicode characters between 0-65535 (0000-FFFF)`;
      break;
    case "UTF8":
      text = `UTF-8`;
      title = `Universal Coded Character Set 8-bit`;
      break;
    case "USASCII":
      text = `US-ASCII`;
      title = `Plain text, alternatively known as ASA X3.4, ANSI X3.4, ECMA-6, ISO/IEC 646`;
      break;
  }
  this.text = text;
  this.title = title;
}


function runSpinLoader()
// Injects a loading spinner to the tab
// It's not really useful due to the way browsers handle the DOM rendering,
// but may pop-up if the browser temporarily freezes
{

  let spinner = window.document.getElementById("spin-loader");
  if (spinner === null) {
    let headTag = document.querySelector("head");
    spinner = document.createElement("div");
    spinner.setAttribute("id", "spin-loader");
    spinner.setAttribute("class", "loader");
    spinner.setAttribute("style", "border:100px solid red");
    spinner.setAttribute("style", "display:block");
    document.body.appendChild(spinner);
    let stylesheet = buildLinksToCSS(`css/retrotxt_loader.css`, `retrotxt-loader`);
    headTag.appendChild(stylesheet);
  } else {
    spinner.setAttribute("style", "display:block");
  }
}
