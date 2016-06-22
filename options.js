"use strict";

function fontAdjust(ff, elm)
// Adjusts the font family and font height styles
// @ff  Font family to apply
// @elm HTML element to apply the font styles too
{
  if (typeof ff === "undefined" || typeof elm === "undefined") return;
  var font = new fontSettings(ff);
  elm.fontFamily = ff;
  elm.fontSize = font.cssFontSize;
  elm.lineHeight = font.cssLineHeight;
}

function getColorsRGB(v)
// Generates CSS for font colours.
// @v   Font colours selection value
{
  if (typeof v === "undefined") v = "";
  var colors = v.split("-"),
    style,
    fg = colors[0],
    bg = colors[1],
    rgbs = new rgbColors();
  style = "background-color: " + rgbs[bg] + "; color: " + rgbs[fg] + ";";
  return style;
}

function isGecko()
// Gecko 48 doesn't support options_ui.chrome_style in the manifest so use this
// to decide if to apply additional CSS declarations to options.html.
{
  if (chrome.runtime.getManifest().options_ui !== undefined && chrome.runtime.getManifest().options_ui.page !== undefined) {
    var gecko,
      page = chrome.runtime.getManifest().options_ui.page;
    gecko = page.indexOf("moz-extension");
    if (gecko >= 0) return true;
    else if (gecko == -1) return false;
    else return null;
  }
}

function restoreOptions()
// Sets the options form to match the user's saved options
{
  var colorSel = document.getElementById("font-color"),
    fontSel = document.getElementsByName('font'),
    lhSel = document.getElementById('line-height'),
    coLen = colorSel.length,
    foLen = fontSel.length,
    lhLen = lhSel.length;
  // Colour
  chrome.storage.local.get("retroColor", function(result) {
    var r = result.retroColor;
    if (typeof r !== "string") return;
    for (var i = 0, len = coLen; i < len; i++) {
      if (colorSel[i].value === r) {
        colorSel[i].selected = true;
        break;
      }
    }
  });
  // Font
  chrome.storage.local.get("retroFont", function(result) {
    var fi,
      r = result.retroFont;
    if (typeof r !== "string") return;
    for (var i = 0, len = foLen; i < len; i++) {
      fi = fontSel[i];
      if (fi.value === r) {
        fi.checked = true;
        break;
      }
    }
  });
  // Line Height
  chrome.storage.local.get("lineHeight", function(result) {
    var r = result.lineHeight;
    if (typeof r !== "string") return;
    for (var i = 0, len = lhLen; i < len; i++) {
      if (lhSel[i].value === r) {
        lhSel[i].selected = true;
        break;
      }
    }
  });
  // Check-boxes
  chrome.storage.local.get("textFontInformation", function(result) {
    var input = document.getElementById("text-font-information"),
      r = result.textFontInformation;
    if (typeof r !== "boolean") r = true;
    input.checked = r;
  });
  chrome.storage.local.get("centerAlignment", function(result) {
    var input = document.getElementById("center-alignment"),
      r = result.centerAlignment;
    if (typeof r !== "boolean") r = true;
    input.checked = r;
  });
  chrome.storage.local.get("fontShadows", function(result) {
    var input = document.getElementById("font-shadows"),
      r = result.fontShadows;
    if (typeof r !== "boolean") r = false;
    input.checked = r;
  });
  chrome.storage.local.get("cp437CtrlCodes", function(result) {
    var input = document.getElementById("cp437-ctrl-codes"),
      r = result.cp437CtrlCodes;
    if (typeof r !== "boolean") r = false;
    input.checked = r;
  });
  chrome.storage.local.get("autoDetectRun", function(result) {
    var input = document.getElementById("auto-detect-run"),
      r = result.autoDetectRun;
    if (typeof r !== "boolean") r = true;
    input.checked = r;
  });
}

function saveColors()
// Saves the user font and background colour selection to local browser storage.
{
  var select = document.getElementById("font-color"),
    colors = select.options[select.selectedIndex].value;
  chrome.storage.local.set({
    'retroColor': colors
  });
}

function saveFont()
// Saves the user font selection to local browser storage.
{
  var font = document["fonts"].font.value;
  chrome.storage.local.set({
    'retroFont': font
  });
}

function saveLineHeight()
// Saves the user line height adjustments to local browser storage.
{
  var select = document.getElementById("line-height"),
    heights = select.options[select.selectedIndex].value;
  chrome.storage.local.set({
    'lineHeight': heights
  });
}

function useSavedColors()
// Gets and applies user's saved font colours to sample text.
{
  chrome.storage.local.get("retroColor", function(result) {
    var sample = document.getElementById('sample-dos-text').style,
      r = result.retroColor;
    if (typeof r !== "string") return;
    document.getElementById('sample-dos-text').style = getColorsRGB(r);
  });
}

function useSavedFont()
// Gets and applies user's saved font family to sample text.
{
  chrome.storage.local.get("retroFont", function(result) {
    var sample = document.getElementById('sample-dos-text').style,
      r = result.retroFont;
    if (typeof r !== "string") return;
    fontAdjust(r, sample);
  });
}

function useSavedEffects()
// Gets and applies user's saved font family to sample text.
{
  chrome.storage.local.get("fontShadows", function(result) {
    var sample = document.getElementById('sample-dos-text'),
      r = result.fontShadows;
    if (typeof r !== "boolean") return;
    textShadow(r, sample);
  });
}

// Run when options menu is launched.
(function() {

  // default font and colour combination
  var cssLink,
    radios = document.forms["fonts"].getElementsByTagName("label"),
    radiosLen = radios.length;

  // make adjustments to Options.html for Gecko 48 browsers
  if (isGecko()) {
    // additional CSS formatting
    var sheet = (function() {
      var style = document.createElement("style");
      document.head.appendChild(style);
      return style.sheet;
    })();
    sheet.insertRule("body { background-color: rgb(255, 255, 255); \
      border: 1px solid; font-family: Arial, Helvetica, sans-serif; \
      font-size: 75%; max-width: 400px; margin-left: auto; \
      margin-right: auto; padding: 1em; }", 0);
    sheet.insertRule("h1, h2, h3 { font-weight: normal; }", 1);
    sheet.insertRule("a:link { color: rgb(100, 149, 237); text-decoration: none; }", 2);
    sheet.insertRule("a:visited { color: rgb(100, 149, 237); text-decoration: none; }", 3);
    sheet.insertRule("a:hover { color: rgb(100, 149, 237); text-decoration: underline; }", 4);
    sheet.insertRule("a:active { color: rgb(255, 165, 0); text-decoration: none; }", 5);
    // add new tab targets for all links
    document.addEventListener("click", function(e) {
      if (e.target.href !== undefined && !e.target.hasAttribute("target")) {
        e.target.setAttribute("target", "_blank");
      }
    });
  }

  // restore user saved options
  document.addEventListener('DOMContentLoaded', restoreOptions);
  useSavedColors();
  useSavedFont();
  useSavedEffects();

  // insert a LINK into the options.html
  cssLink = linkCSS("text.css");
  document.getElementsByTagName("head")[0].appendChild(cssLink);

  // font selection events
  for (var i = 0, len = radiosLen; i < len; i++) {
    var status = document.getElementById('status');
    radios[i].onclick = function() {
      var fface = this.getElementsByTagName("input")[0].value;
      status.textContent = 'Saved font selection ' + fface;
      saveFont();
    }
    radios[i].onmouseover = function() {
      var fface = this.getElementsByTagName("input")[0].value,
        sample = document.getElementById('sample-dos-text').style;
      fontAdjust(fface, sample);
      status.textContent = 'Font ' + fface;
    }
  }

  // colours selection events
  document.getElementById("font-color").addEventListener("change", function() {
    var status = document.getElementById('status'),
      sample = document.getElementById('sample-dos-text');

    function colorName(c) {
      var s = c;
      switch (c) {
        case "appleiiGreen-appleiiBlack":
          s = "Apple II"
          break;
        case "amigaWhite-amigaGray":
          s = "Amiga"
          break;
        case "c64fg-c64bg":
          s = "Commodore 64"
          break;
        default:
          s = s.replace("-", " on ");
          break;
      }
      return s;
    }
    status.textContent = 'Saved ' + chrome.i18n.getMessage("color") + ' selection ' + colorName(this.value);
    sample.style = getColorsRGB(this.value);
    useSavedFont();
    saveColors();
    useSavedEffects();
  });

  // line height selection events
  document.getElementById("line-height").addEventListener("change", function() {
    status.textContent = 'Saved ' + this.value + ' line height selection';
    saveLineHeight();
  });

  // check-boxes
  document.getElementById("text-font-information").addEventListener("change", function() {
    chrome.storage.local.set({
      'textFontInformation': this.checked
    });
  });
  document.getElementById("center-alignment").addEventListener("change", function() {
    chrome.storage.local.set({
      'centerAlignment': this.checked
    });
  });
  document.getElementById("font-shadows").addEventListener("change", function() {
    chrome.storage.local.set({
      'fontShadows': this.checked
    });
    useSavedEffects();
  });
  document.getElementById("cp437-ctrl-codes").addEventListener("change", function() {
    chrome.storage.local.set({
      'cp437CtrlCodes': this.checked
    });
  });
  document.getElementById("auto-detect-run").addEventListener("change", function() {
    chrome.storage.local.set({
      'autoDetectRun': this.checked
    });
    localStorage.setItem("autoDetectRun", this.checked); // set localStorage for active Chrome tabs
  });

  // internationalisations
  i18nWord("color", "msg-color"); // color vs colour
  i18nWord("center", "msg-center"); // center vs centre
  // gray vs grey
  document.getElementById("gray-white-option").innerHTML = chrome.i18n.getMessage("gray_white_option");
  // help link
  document.getElementById("help-id").href = chrome.i18n.getMessage("url_help");
})();
