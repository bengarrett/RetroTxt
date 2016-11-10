// filename: text_cp_dos.js
//
// JavaScript converts all the text it handles from the original encoding into UTF-16.
// The functions in this page converts legacy text encodings commonly used on
// legacy IBM-PC/MS-DOS systems to be JavaScript UTF-16 friendly.
//
// See text_ecma48.js for ANSI art conversion functions.
//     text_ecma94.js for the legacy online encoding functions.
//
// Characters 32…126 are skipped as they are based on the US-ASCII/ECMA-43
// near-universal character set, "8-Bit Coded Character Set Structure and Rules".
// Characters 0…31 commonly are bits for C0 control functions, but in PC-DOS
// and MS-DOS they were also used for the display of characters.
// ECMA-43 (US-ASCII) www.ecma-international.org/publications/standards/Ecma-043.htm
// ECMA-48 (contains C0) www.ecma-international.org/publications/standards/Ecma-048.htm
"use strict";

function ListCP437()
// Code Page 437 IBM ftp.software.ibm.com/software/globalization/gcoc/attachments/CP00437.pdf
//               Microsoft msdn.microsoft.com/en-us/library/cc195060.aspx?f=255&MSPPError=-2147217396
// Code Page comparisons www.aivosto.com/vbtips/charsets-codepages-dos.html
// NOTE the chess pieces are place holders ♔ ♕
{
  this.set_0 = ["␀", "☺", "☻", "♥", "♦", "♣", "♠", "•", "◘", "○", "◙", "♂", "♀", "♪", "♫", "☼"];
  this.set_1 = ["►", "◄", "↕", "‼", "¶", "§", "▬", "↨", "↑", "↓", "→", "←", "∟", "↔", "▲", "▼"];
  this.set_8 = ["Ç", "ü", "é", "â", "ä", "à", "å", "ç", "ê", "ë", "è", "ï", "î", "ì", "Ä", "Å"];
  this.set_9 = ["É", "æ", "Æ", "ô", "ö", "ò", "û", "ù", "ÿ", "Ö", "Ü", "¢", "£", "¥", "₧", "ƒ"];
  this.set_a = ["á", "í", "ó", "ú", "ñ", "Ñ", "ª", "º", "¿", "⌐", "¬", "½", "¼", "¡", "«", "»"];
  this.set_b = ["░", "▒", "▓", "│", "┤", "╡", "╢", "♔", "╕", "╣", "║", "╗", "╝", "╜", "╛", "┐"];
  this.set_c = ["└", "┴", "┬", "├", "─", "┼", "╞", "╟", "╚", "╔", "╩", "╦", "╠", "═", "╬", "╧"];
  this.set_d = ["╨", "╤", "╥", "╙", "╘", "╒", "╓", "╫", "╪", "┘", "┌", "█", "▄", "▌", "▐", "▀"];
  this.set_e = ["α", "ß", "Γ", "π", "Σ", "σ", "µ", "τ", "Φ", "Θ", "Ω", "δ", "∞", "\u03C6", "ε", "∩"];
  this.set_f = ["≡", "±", "≥", "≤", "⌠", "⌡", "÷", "≈", "°", "\u2219", "♕", "√", "ⁿ", "²", "\u25A0", "\u00A0"];
}

function ListCP865()
// Code Page 865
// It is identical to CP-437 except for 3 character differences
{
  const cp437 = new ListCP437();
  this.set_9 = cp437.set_9;
  this.set_a = cp437.set_a;
  // we use hex positions and Unicode
  this.set_9[parseInt("B", 16)] = `\u00F8`;
  this.set_9[parseInt("D", 16)] = `\u00D8`;
  this.set_a[parseInt("F", 16)] = `\u00A4`;
}

function BuildCPDos(s = ``, mapTo = "CP437", verbose = false)
// Converts a string of text to emulate a MS-DOS Code Page using UTF-16 encoded
// characters.
// @s       String of Unicode UTF-16 text
// @mapTo   The character encoding map to use, either CP437, CP860 or USASCII
// @verbose Display to the console each character that is handled
{
  const
    charSets = new ListCharacterSets(),
    c0Controls = charSets.C0common,
    mapCP437 = new ListCP437(),
    showCtrlCodes = localStorage.getItem("textDosCtrlCodes");
  let t = s,
    i = t.length;

  // build character maps
  let map0_127, map128_255;
  if (["CP437", "USASCII"].includes(mapTo)) {
    map0_127 = mapCP437.set_0.concat(mapCP437.set_1);
    map128_255 = mapCP437.set_8.concat(mapCP437.set_9, mapCP437.set_a, mapCP437.set_b, mapCP437.set_c, mapCP437.set_d, mapCP437.set_e, mapCP437.set_f);
  } else if (mapTo === "CP865") {
    const mapCP865 = new ListCP865();
    map0_127 = mapCP437.set_0.concat(mapCP437.set_1);
    map128_255 = mapCP437.set_8.concat(mapCP865.set_9, mapCP865.set_a, mapCP437.set_b, mapCP437.set_c, mapCP437.set_d, mapCP437.set_e, mapCP437.set_f);
  }
  // handle characters 0…128 [00…F1]
  i = map0_127.length;
  while (i--) {
    // TODO Options 'DOS Control Glyphs' check box implementation
    // character 10 is nearly always a line feed (to begin a new line)
    if (i === 10) continue;
    // ignore common C0 control characters that are normally used for page formatting
    else if (typeof showCtrlCodes !== "string" || showCtrlCodes !== "true") {
      if (c0Controls.includes(i) === true) {
        if (verbose) console.log(`${i} ${String.fromCharCode(i)} ≠> ${map0_127[i]}`);
        continue;
      }
    }
    if (verbose) console.log(`${i} ${String.fromCharCode(i)} => ${map0_127[i]}`);
    t = t.replace(RegExp(String.fromCharCode(i), "g"), map0_127[i]);
  }

  // handle characters 129…255 [80…FF]
  i = map128_255.length;
  let cpa = 128, // character position adjustment
    code = 0;
  if (mapTo === "CP865") cpa = cpa + 864; // CP-865
  while (i--) {
    code = i + cpa;
    if (verbose) console.log(`${i} ${String.fromCharCode(code)} => ${map128_255[i]}`);
    t = t.replace(RegExp(String.fromCharCode(code), "g"), map128_255[i]);
  }
  // handle character exceptions
  // 127 [7F]
  if (typeof showCtrlCodes === "string" && showCtrlCodes === "true") {
    t = t.replace(RegExp(String.fromCharCode(127), "g"), "⌂");
  }
  // replace place holders with the actual characters
  // these otherwise can conflict if both are in the same document
  t = t.replace(RegExp("♔", "g"), "╖"); // ╖ CP437 00B7, Unicode 2556
  t = t.replace(RegExp("♕", "g"), "\u00B7"); // · CP436 00FA, Unicode 00B7
  // return as object
  this.text = t;
}

function BuildBBS(s = ``, format = ``, monochrome = false)
// Converts plain text documents embedded with legacy BBS colour codes and
// converts it into a HTML5 document with CSS colour styles
// @s   String of text to convert
// @monochrome  If true this will strip out the BBS colour codes but not
//  apply any replacement CSS colour styles
{
  let bbsRegex = ``,
    t = s;

  // confirm if text is formatted with either PCBoard or Wildcat colour codes
  if (format.length === 0) {
    let trimmed = s.trim(),
      compare = trimmed.slice(0, 5);
    format = findControlSequences(compare);
  }
  switch (format) {
    case "pcboard":
      bbsRegex = `@X([0-9|A-F])([0-9|A-F])`;
      t = t.replace(RegExp('@CLS@', "ig"), ''); // ignored control code used to clear screen
      break;
    case "wildcat":
      bbsRegex = `@([0-9|A-F])([0-9|A-F])@`;
      break;
    default:
      return s;
  }

  // Escape any less-than signs that could be mistaken for a HTML tag
  t = t.replace(RegExp(String.fromCharCode(60), "g"), '&lt;');
  if (monochrome === true) {
    // monochrome only, strip out the BBS colour codes
    t = t.replace(RegExp(bbsRegex, "ig"), '');
    t = `${t}</i>`;
    return t;
  }
  t = t.replace(RegExp(bbsRegex, "ig"), '</i><i class="PB$1 PF$2">');
  t = `${t}</i>`;
  return t;
}
