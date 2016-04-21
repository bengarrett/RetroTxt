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

function restoreOptions()
// Sets the options form to match the user's saved options
{
  var colorSel = document.getElementById("font-color"),
    fontSel = document.getElementsByName('font'),
    coLen = colorSel.length,
    foLen = fontSel.length;
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
    radios[i].onclick = function() {
      var fface = this.getElementsByTagName("input")[0].value,
        status = document.getElementById('status');
      status.textContent = 'Saved font selection ' + fface;
      saveFont();
    }
    radios[i].onmouseover = function() {
      var fface = this.getElementsByTagName("input")[0].value,
        sample = document.getElementById('sample-dos-text').style;
      fontAdjust(fface, sample);
    }
    radios[i].onmouseout = function() {
      useSavedFont();
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