// filename: text_ecma94.js
//
// JavaScript converts all the text it handles from the original encoding into UTF-16.
// The functions in this page converts legacy text encodings commonly found
// online to be JavaScript UTF-16 friendly.
//
// * UTF-16 is backwards compatible with ISO-8859-1 and US-ASCII.
// * Windows-1252 and ISO-8859-15 are backwards compatible with ISO-8859-1 and
// US-ASCII but requires some character modifications to display correctly when
// encoded to UTF-16.
// See text_cp_dos.js for the IBM/MS-DOS encoding functions.
//
// 8-Bit Single Byte Coded Graphic Character Sets - Latin Alphabets No. 1 to No. 4
// http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-094.pdf
'use strict'

/*global chrome checkArg */

function BuildCP1252(s = ``, verbose = false)
// Builds text using Windows-1252 source text, often wrongly called Windows-ANSI
// @s       String of Unicode UTF-16 text
// @verbose Display to the console each character that is handled
{
  if (typeof s !== `string`) checkArg(`s`, `string`, s)
  if (typeof verbose !== `boolean`) checkArg(`verbose`, `boolean`, verbose)

  const cp1252_8 = [`€`, ``, `‚`, `ƒ`, `„`, `…`, `†`, `‡`, `ˆ`, `‰`, `Š`, `‹`, `Œ`, ``, `Ž`, ``]
  const cp1252_9 = [``, `‘`, `’`, `“`, `”`, `•`, `–`, `—`, `\u02dc`, `™`, `š`, `›`, `œ`, ``, `ž`, `Ÿ`]
  const cp1252 = [...cp1252_8, ...cp1252_9]
  let code = 0, t = s, i = cp1252.length  // handle characters 80…FF
  while (i--) {
    code = i + 128
    if (verbose) console.log(`${i} ${String.fromCharCode(code)} ↣ ${cp1252[i]}`)
    t = t.replace(RegExp(String.fromCharCode(code), `g`), cp1252[i])
  }
  // handle character 1B (to inject EMCA-48 control function support)
  t = t.replace(RegExp(String.fromCharCode(27), `g`), `←`)
  this.text = t
  this.characterSet = cp1252
}

function BuildCP88591(s = ``)
// Builds text using ISO-8859-1 source text, commonly called Latin 1.
// @s       String of Unicode UTF-16 text
{
  if (typeof s !== `string`) checkArg(`s`, `string`, s)

  let t = s
  t = t.replace(RegExp(String.fromCharCode(27), `g`), `←`)
  this.text = t
}

function BuildCP885915(s = ``)
// Builds text using ISO-8859-15 source text, alternatively called Latin 9.
// @s       String of Unicode UTF-16 text
{
  if (typeof s !== `string`) checkArg(`s`, `string`, s)

  let t = s
  t = t.replace(RegExp(String.fromCharCode(164), `g`), `€`)
  t = t.replace(RegExp(String.fromCharCode(166), `g`), `Š`)
  t = t.replace(RegExp(String.fromCharCode(168), `g`), `š`)
  t = t.replace(RegExp(String.fromCharCode(180), `g`), `Ž`)
  t = t.replace(RegExp(String.fromCharCode(184), `g`), `ž`)
  t = t.replace(RegExp(String.fromCharCode(188), `g`), `Œ`)
  t = t.replace(RegExp(String.fromCharCode(189), `g`), `œ`)
  t = t.replace(RegExp(String.fromCharCode(190), `g`), `Ÿ`)
  // handle character 1B (to inject EMCA-48 control function support)
  t = t.replace(RegExp(String.fromCharCode(27), `g`), `←`)
  this.text = t
}

function BuildCPUtf8(s = ``)
// Builds text using UTF-8 source text
// NOTE In the future maybe use the TextDecoder() WebAPI
// https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder
// @s       String of Unicode UTF-16 text
{
  if (typeof s !== `string`) checkArg(`s`, `string`, s)

  let t = s
  t = t.replace(RegExp(String.fromCharCode(27), `g`), `←`)
  this.text = t
}

function BuildCPUtf16(s = ``)
// Builds text using ISO-8959-1 or US-ASCII source text
// JavaScript uses UTF-16 internally for the handling of all strings
// @s       String of Unicode UTF-16 text
{
  if (typeof s !== `string`) checkArg(`s`, `string`, s)

  let t = s
  // handle character 1B (to inject EMCA-48 control function support)
  t = t.replace(RegExp(String.fromCharCode(27), `g`), `←`)
  this.text = t
}
