// These functions are shared with text.js and options.js
"use strict";

function createLinkToCSS(f, i)
// Creates a LINK tag used to load a style sheet
// @f   CSS file name
// @i   ID name to apply to link tag
{
  if (typeof f === "undefined") throw "`f` the CSS file name has not been provided. You cannot create a CSS link that doesn't point to a file.";
  if (typeof i === "undefined") i = "";
  var l = document.createElement("link");
  if (i.length) l.id = i;
  l.href = chrome.extension.getURL(f);
  l.type = "text/css";
  l.rel = "stylesheet";
  return l;
}

function changeI18nWord(name, cls)
// Annoying word-around to add i18n support to .html files
// @name i18n message name
// @cls  span class name to inject translation into
{
  if (typeof name === "undefined") return;
  if (typeof cls === "undefined") return;
  // word capitalization
  function capitalize(s) {
    return s[0].toUpperCase() + s.slice(1);
  }
  var newword, word,
    words = document.getElementsByClassName(cls),
    wordCnt = words.length;
  for (var i = 0, len = wordCnt; i < len; i++) {
    word = words[i].innerHTML;
    newword = chrome.i18n.getMessage(name);
    if (word.slice(0, 1).toUpperCase()) {
      newword = capitalize(newword);
    }
    words[i].innerHTML = newword;
  }
}

function changeTextShadow(s, elm, color)
// Applies CSS3 text shadowing effects to an element
// @s     required boolean to enable or disable text show
// @elm   required HTML DOM element object to apply shadow effect to
// @color optional CSS colour class when we already know the new colour values
{

  if (typeof s === "undefined") throw "'s' is missing, it should be a boolean to disable or enable text shadow";
  if (typeof elm !== "object") throw "'elm' is missing, it should be the a HTML DOM element";

  function applyStyle(c) {
    if (typeof c === "string") {
      switch (c) {
        case "gray-black":
          elm.style.textShadow = "2px 2px 0px rgba(64, 64, 64, 1)";
          break;
        case "amigaWhite-amigaGray":
        case "appleiiGreen-appleiiBlack":
          elm.style.textShadow = "2px 2px 0px rgba(72, 72, 72, 1)";
          break;
        case "c64fg-c64bg":
          elm.style.textShadow = "2px 2px 0px rgba(30, 20, 77, 1)";
          break;
        default:
          if (c.split("-")[1] === "white") {
            elm.style.textShadow = "2px 2px 0px rgba(224, 224, 224, 1)";
          } else {
            elm.style.textShadow = "2px 2px 0px rgba(72, 72, 72, 1)";
          }
          break;
      }
    }
  }

  if (typeof s === null) s = true;
  // if s is false then disable the style
  if (!s) {
    elm.style.textShadow = "none";
  }
  // use colours provided by the colour parameter
  else if (typeof color === "string") {
    applyStyle(color);
  }
  // use colours fetched from chrome's storage (default)
  else {
    chrome.storage.local.get("retroColor", function(result) {
      var r = result.retroColor;
      applyStyle(r);
    });
  }
}

function convertCP1252String(s)
// Takes text loaded as Windows-1252 or ISO 8859-15 but created for
// PC/MS-DOS extended Code Page 437 and converts it into UTF-8 Unicode
/*
 CP-437 (DOS) https://msdn.microsoft.com/en-us/goglobal/cc305156
 CP-862 (DOS) https://msdn.microsoft.com/en-us/goglobal/cc305165
 IS0 8859-1   https://msdn.microsoft.com/en-us/goglobal/cc305167
 Windows 1252 https://msdn.microsoft.com/en-us/goglobal/cc305145
*/
// @s   String of text to convert
{
  if (typeof s === "undefined") s = "";
  let t = s;
  const ctrlCodes = sessionStorage.getItem("cp437CtrlCodes"),
    fullConversion = true;
  // We must convert the text user interface glyphs before the language characters.
  // All the characters [21-7E] are ASCII 7-bit and shared between both sets.
  // dithering [B0-B2]
  t = t.replace(/°/g, "░");
  t = t.replace(/±/g, "▒");
  t = t.replace(/²/g, "▓");
  // lines [B3-BF]
  t = t.replace(/³/g, "│");
  t = t.replace(/´/g, "┤");
  t = t.replace(/µ/g, "╡");
  t = t.replace(/¶/g, "╢");
  t = t.replace(/·/g, "╖");
  t = t.replace(/¸/g, "╕");
  t = t.replace(/¹/g, "╣");
  t = t.replace(/º/g, "║");
  t = t.replace(/»/g, "╗");
  t = t.replace(/¼/g, "╝");
  t = t.replace(/½/g, "╜");
  t = t.replace(/¾/g, "╛");
  t = t.replace(/¿/g, "┐");
  t = t.replace(/Ú/g, "┌");
  // lines [C0-CF]
  t = t.replace(/À/g, "└");
  t = t.replace(/Á/g, "┴");
  t = t.replace(/Â/g, "┬");
  t = t.replace(/Ã/g, "├");
  t = t.replace(/Ä/g, "─");
  t = t.replace(/Å/g, "┼");
  t = t.replace(/Æ/g, "╞");
  t = t.replace(/Ç/g, "╟");
  t = t.replace(/È/g, "╚");
  t = t.replace(/É/g, "╔");
  t = t.replace(/Ê/g, "╩");
  t = t.replace(/Ë/g, "╦");
  t = t.replace(/Ì/g, "╠");
  t = t.replace(/Í/g, "═");
  t = t.replace(/Î/g, "╬");
  t = t.replace(/Ï/g, "╧");
  // lines [D0-DA]
  t = t.replace(/Ð/g, "╨");
  t = t.replace(/Ñ/g, "╤");
  t = t.replace(/Ò/g, "╥");
  t = t.replace(/Ó/g, "╙");
  t = t.replace(/Ô/g, "╘");
  t = t.replace(/Õ/g, "╒");
  t = t.replace(/Ö/g, "╓");
  t = t.replace(/×/g, "╫");
  t = t.replace(/Ø/g, "╪");
  t = t.replace(/Ù/g, "┘");
  t = t.replace(/Ú/g, "┌");
  // blocks [DB-DF]
  t = t.replace(/Û/g, "█");
  t = t.replace(/Ü/g, "▄");
  t = t.replace(/Ý/g, "▌");
  t = t.replace(RegExp(String.fromCharCode(222), "g"), "▐");
  t = t.replace(/ß/g, "▀");
  t = t.replace(RegExp(String.fromCharCode(254), "g"), "■"); // [FE]
  //return t; // You could exit here to improve performance on large files?
  // misc characters [01-08]
  t = t.replace(RegExp(String.fromCharCode(1), "g"), "☺");
  t = t.replace(RegExp(String.fromCharCode(2), "g"), "☻");
  t = t.replace(RegExp(String.fromCharCode(3), "g"), "♥");
  t = t.replace(RegExp(String.fromCharCode(4), "g"), "♦");
  t = t.replace(RegExp(String.fromCharCode(5), "g"), "♣");
  t = t.replace(RegExp(String.fromCharCode(6), "g"), "♠");
  t = t.replace(RegExp(String.fromCharCode(7), "g"), "•");
  // pseudo-control codes (user option 'Display CP-437 control codes as DOS glyphs')
  if (typeof ctrlCodes === "string" && ctrlCodes === "true") {
    // [08-0A]
    t = t.replace(RegExp(String.fromCharCode(8), "g"), "◘"); // backspace
    t = t.replace(RegExp(String.fromCharCode(9), "g"), "○"); // tab
    //t = t.replace(RegExp(String.fromCharCode(10), "g"), "◙"); // line feed
    t = t.replace(RegExp(String.fromCharCode(13), "g"), "♪"); // carriage return
    t = t.replace(RegExp(String.fromCharCode(26), "g"), "→"); // DOS end of file
    t = t.replace(RegExp(String.fromCharCode(127), "g"), "⌂"); // [7F] delete
  }
  t = t.replace(RegExp(String.fromCharCode(255), "g"), " "); // [FF] space
  // [0B-0F]
  t = t.replace(RegExp(String.fromCharCode(11), "g"), "♂");
  t = t.replace(RegExp(String.fromCharCode(12), "g"), "♀");
  t = t.replace(RegExp(String.fromCharCode(14), "g"), "♫");
  t = t.replace(RegExp(String.fromCharCode(15), "g"), "☼");
  // [10-1F]
  t = t.replace(RegExp(String.fromCharCode(16), "g"), "►");
  t = t.replace(RegExp(String.fromCharCode(17), "g"), "◄");
  t = t.replace(RegExp(String.fromCharCode(18), "g"), "↕");
  t = t.replace(RegExp(String.fromCharCode(19), "g"), "‼");
  t = t.replace(RegExp(String.fromCharCode(20), "g"), "¶");
  t = t.replace(RegExp(String.fromCharCode(21), "g"), "§");
  t = t.replace(RegExp(String.fromCharCode(22), "g"), "▬");
  t = t.replace(RegExp(String.fromCharCode(23), "g"), "↨");
  // Directional arrows [18-1B]
  t = t.replace(RegExp(String.fromCharCode(24), "g"), "↑");
  t = t.replace(RegExp(String.fromCharCode(25), "g"), "↓");
  // [1A] 26 right arrow used as EOF
  t = t.replace(RegExp(String.fromCharCode(27), "g"), "←");
  // [1C-1F]
  t = t.replace(RegExp(String.fromCharCode(28), "g"), "∟");
  t = t.replace(RegExp(String.fromCharCode(29), "g"), "↔");
  t = t.replace(RegExp(String.fromCharCode(30), "g"), "▲");
  t = t.replace(RegExp(String.fromCharCode(31), "g"), "▼");
  // [A8-AF]
  t = t.replace(RegExp(String.fromCharCode(169), "g"), "⌐");
  t = t.replace(RegExp(String.fromCharCode(170), "g"), "¬");
  t = t.replace(RegExp(String.fromCharCode(171), "g"), "½");
  t = t.replace(RegExp(String.fromCharCode(172), "g"), "¼");
  t = t.replace(RegExp(String.fromCharCode(173), "g"), "¡");
  t = t.replace(RegExp(String.fromCharCode(174), "g"), "«");
  t = t.replace(RegExp(String.fromCharCode(175), "g"), "»");
  // [20] 32 is space
  // Can usually end here for most ascii art text and nfo files
  if (!fullConversion) return t;
  // [E0-EF]
  t = t.replace(RegExp(String.fromCharCode(224), "g"), "α");
  t = t.replace(RegExp(String.fromCharCode(225), "g"), "ß");
  t = t.replace(RegExp(String.fromCharCode(226), "g"), "Γ");
  t = t.replace(RegExp(String.fromCharCode(227), "g"), "π");
  t = t.replace(RegExp(String.fromCharCode(228), "g"), "Σ");
  t = t.replace(RegExp(String.fromCharCode(229), "g"), "σ");
  t = t.replace(RegExp(String.fromCharCode(230), "g"), "µ");
  t = t.replace(RegExp(String.fromCharCode(231), "g"), "τ");
  t = t.replace(RegExp(String.fromCharCode(232), "g"), "Φ");
  t = t.replace(RegExp(String.fromCharCode(233), "g"), "Θ");
  t = t.replace(RegExp(String.fromCharCode(234), "g"), "Ω");
  t = t.replace(RegExp(String.fromCharCode(235), "g"), "δ");
  t = t.replace(RegExp(String.fromCharCode(236), "g"), "∞");
  t = t.replace(RegExp(String.fromCharCode(237), "g"), "φ");
  t = t.replace(RegExp(String.fromCharCode(238), "g"), "ε");
  t = t.replace(RegExp(String.fromCharCode(239), "g"), "∩");
  // [F0-FF]
  t = t.replace(/ð/g, "≡"); // 240
  t = t.replace(RegExp(String.fromCharCode(241), "g"), "±");
  t = t.replace(RegExp(String.fromCharCode(242), "g"), "≥");
  t = t.replace(RegExp(String.fromCharCode(243), "g"), "≤");
  t = t.replace(RegExp(String.fromCharCode(244), "g"), "⌠");
  t = t.replace(RegExp(String.fromCharCode(245), "g"), "⌡");
  t = t.replace(RegExp(String.fromCharCode(246), "g"), "÷");
  t = t.replace(/÷/g, "≈"); // 247
  t = t.replace(RegExp(String.fromCharCode(248), "g"), "°");
  t = t.replace(/ù/g, "∙"); // 249
  t = t.replace(RegExp(String.fromCharCode(250), "g"), "·");
  t = t.replace(RegExp(String.fromCharCode(251), "g"), "√");
  t = t.replace(RegExp(String.fromCharCode(252), "g"), "ⁿ");
  t = t.replace(RegExp(String.fromCharCode(253), "g"), "²");
  // [FF] 255 is space and was handled earlier
  // Language specific characters with accents, currency & math.
  // [80-8F]
  t = t.replace(RegExp(String.fromCharCode(128), "g"), "Ç");
  t = t.replace(RegExp(String.fromCharCode(129), "g"), "ü");
  t = t.replace(RegExp(String.fromCharCode(130), "g"), "é");
  t = t.replace(RegExp(String.fromCharCode(131), "g"), "â");
  t = t.replace(RegExp(String.fromCharCode(132), "g"), "ä");
  t = t.replace(RegExp(String.fromCharCode(133), "g"), "à");
  t = t.replace(RegExp(String.fromCharCode(134), "g"), "å");
  t = t.replace(RegExp(String.fromCharCode(135), "g"), "ç");
  t = t.replace(RegExp(String.fromCharCode(136), "g"), "ê");
  t = t.replace(RegExp(String.fromCharCode(137), "g"), "ë");
  t = t.replace(RegExp(String.fromCharCode(138), "g"), "è");
  t = t.replace(RegExp(String.fromCharCode(139), "g"), "ï");
  // [90-9F]
  t = t.replace(RegExp(String.fromCharCode(140), "g"), "î");
  t = t.replace(RegExp(String.fromCharCode(141), "g"), "ì");
  t = t.replace(RegExp(String.fromCharCode(142), "g"), "Ä");
  t = t.replace(RegExp(String.fromCharCode(143), "g"), "Å");
  t = t.replace(RegExp(String.fromCharCode(144), "g"), "É");
  t = t.replace(RegExp(String.fromCharCode(145), "g"), "æ");
  t = t.replace(RegExp(String.fromCharCode(146), "g"), "Æ");
  t = t.replace(RegExp(String.fromCharCode(147), "g"), "ô");
  t = t.replace(RegExp(String.fromCharCode(148), "g"), "ö");
  t = t.replace(RegExp(String.fromCharCode(149), "g"), "ò");
  t = t.replace(RegExp(String.fromCharCode(150), "g"), "û");
  t = t.replace(RegExp(String.fromCharCode(151), "g"), "ù");
  t = t.replace(RegExp(String.fromCharCode(152), "g"), "ÿ");
  t = t.replace(RegExp(String.fromCharCode(153), "g"), "Ö");
  t = t.replace(RegExp(String.fromCharCode(154), "g"), "Ü");
  t = t.replace(RegExp(String.fromCharCode(155), "g"), "¢");
  t = t.replace(RegExp(String.fromCharCode(156), "g"), "£");
  t = t.replace(RegExp(String.fromCharCode(157), "g"), "¥");
  t = t.replace(RegExp(String.fromCharCode(158), "g"), "₧");
  t = t.replace(RegExp(String.fromCharCode(159), "g"), "ƒ");
  // [A0-A8]
  t = t.replace(RegExp(String.fromCharCode(160), "g"), "á");
  t = t.replace(RegExp(String.fromCharCode(161), "g"), "í");
  t = t.replace(RegExp(String.fromCharCode(162), "g"), "ó");
  t = t.replace(RegExp(String.fromCharCode(163), "g"), "ú");
  t = t.replace(RegExp(String.fromCharCode(164), "g"), "ñ");
  t = t.replace(RegExp(String.fromCharCode(165), "g"), "Ñ");
  t = t.replace(RegExp(String.fromCharCode(166), "g"), "ª");
  t = t.replace(RegExp(String.fromCharCode(167), "g"), "º");
  t = t.replace(RegExp(String.fromCharCode(168), "g"), "¿");
  return t;
}

function newFontSettings(ff)
// Return CSS3 styles to use with the font
// @ ff  CSS font family class name
{
  if (typeof ff !== "string") ff = "vga8";
  var cols = 80, // columns (characters per line)
    csslh, cssfs, // css values
    fh = 8, // font height in pixels
    fw = 8, // font width in pixels
    fx = 1.5, // multiplier for small, square fonts
    str, // humanise font family name
    use40Cols = false, // place holder for future 40 column wrapping
    width = fw * cols; // text container width in pixels
  // Font base height //
  // apply 14px height
  if (["ega", "mda"].indexOf(ff.substring(0, 3)) !== -1) {
    fh = 14;
  }
  // apply 16px height
  else if (["vga8", "vga9"].indexOf(ff.substring(0, 4)) !== -1) {
    fh = 16;
  }
  // apply 19px height
  else if (ff === "vgalcd") {
    fh = 19;
  }
  // apply 9px height
  else if (["tandynew225"].indexOf(ff.substring(0, 11)) !== -1) {
    fh = 9;
  }
  // Character base width //
  // apply 9px width
  if (["mda"].indexOf(ff) !== -1 || ff.substring(3, 4) === "9") {
    // catches ega9, vga9, etc.
    fw = 9;
  }
  // 40 columns restrictions place holder
  if (use40Cols && ["bios-2x", "cgathin", "ega8-2x", "ega9-2x", "pc1512", "tandynewtv", "tandynew225", "vga8-2x", "vga9-2x"].indexOf(ff) !== -1) {
    cols = 40;
    // to implement would need to implement the following CSS; pre.style.whiteSpace = "pre-wrap"; pre.style.wordBreak = "break-all";
  }
  // Wide & narrow font type width and height adjustments //
  switch (ff.split("-")[1]) {
    // wide fonts end with "-2x"
    case "2x":
      fw *= 2;
      width *= 2;
      break;
      // narrow fonts end with "-2y"
    case "2y":
      fh *= 2;
      break;
    default:
  }
  // Double font size for Amiga and Commodore 64 as they are a bit small.
  if (ff.substring(0, 5) === "amiga" || ff.substring(0, 7) === "appleii" || ff.substring(0, 3) === "c64" || ff.substring(0, 6) === "vgalcd") {
    fh *= fx;
    fw *= fx;
    width *= fx;
  }
  // CSS font size hacks (not sure if these result in accurate representations)
  if (ff.substring(0, 5) === "amiga" || ff.substring(0, 7) === "appleii" || ff.substring(0, 4) === "bios" ||
    ff.substring(0, 3) === "c64" || ff.substring(0, 3) === "cga" || ff.substring(0, 7) === "cgathin" ||
    ff.substring(0, 6) === "pc1512" || ff.substring(0, 5) === "tandy") {
    csslh = "100%"; // always use `100%` as Gecko renders the value `normal` differently to Blink
    cssfs = `${fh}px`;
  } else if (ff.substring(0, 6) === "vgalcd") {
    csslh = `19px`;
    cssfs = `${fh}px`;
  } else {
    csslh = `${fh}px`;
    cssfs = "medium";
  }

  // Humanise font family name
  str = ff.toUpperCase();
  str = str.replace("-2X", " (wide)");
  str = str.replace("-2Y", " (narrow)");
  str = str.replace("CGATHIN", " CGA Thin");
  str = str.replace("TANDYNEW", " Tandy ");
  // properties
  this.columns = cols;
  this.container = width;
  this.cssLineHeight = csslh;
  this.cssFontSize = cssfs;
  this.family = ff;
  this.height = fh;
  this.string = str;
  this.width = fw;
}

function newRgbColors()
// Colours as RGB (Red, Green, Blue)
{
  // pc colours
  this.amber = "rgb(185,128,0)";
  this.black = "rgb(0,0,0)";
  this.gray = "rgb(170,170,170)";
  this.green = "rgb(41,244,24)";
  this.white = "rgb(255,255,255)";
  // amiga
  this.amigaWhite = "rgb(247,247,247)";
  this.amigaGray = "rgb(148,148,148)";
  // apple ii (ntsc)
  // http://www.kreativekorp.com/miscpages/a2info/munafo.shtml
  this.appleiiBlack = "rgb(41,41,41)";
  this.appleiiGreen = "rgb(12,234,97)";
  // commodore 64
  this.c64fg = "rgb(108,94,181)";
  this.c64bg = "rgb(53,40,121)";
}
