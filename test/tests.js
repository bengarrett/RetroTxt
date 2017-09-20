// filename: tests.js
//
"use strict"

/*eslint no-undef:0*/

const parser = new DOMParser()
let extensionId = null

chrome.storage.local.clear(function () {
  const error = chrome.runtime.lastError
  if (error) {
    console.error(error)
  }
})
localStorage.clear()
sessionStorage.clear()

/*
  eventpage.js
*/
QUnit.module(`eventpage.js`)
chrome.storage.local.clear(function () {
  const error = chrome.runtime.lastError
  if (error) {
    console.error(error)
  }
})

QUnit.test(`ListMenuTitles`, function (assert) {
  const content = new ListMenuTitles(),
    item = content.codeOrder[2]
  assert.equal(content.amiga, `Amiga`, `Should be Amiga`)
  assert.equal(content[item], `↻ CP-1252`, `Should be MS-DOS CP-1252`)
})

QUnit.test(`ListSettings`, function (assert) {
  const content = new ListSettings()
  assert.equal(content.textBgScanlines, false, `textBgScanlines should be false`)
  assert.equal(content.runWebUrlsPermitted[0], `defacto2.net`, `Should be defacto2.net`)
  assert.equal(content.schemesPermitted[0], `file`, `Should be file`)
})

QUnit.test(`ListThemes`, function (assert) {
  const content = new ListThemes(),
    item = content.order[0]
  assert.equal(item, `linux`, `Should be linux`)
  assert.equal(content[item].retroFont, `monospace`, `Should be monospace`)
  assert.equal(content[item].retroColor, `theme-msdos`, `Should be theme-msdos`)
})

QUnit.test(`removeSubDomains`, function (assert) {
  let content = removeSubDomains(`https://www.defacto2.net/files/index.html&variable=false?morestuff=false`)
  assert.equal(content, `defacto2.net`, `Should be \`defacto2.net\``)
  content = removeSubDomains(`https://www.textfiles.com/text/some-random-file.txt`)
  assert.equal(content, `textfiles.com`, `Should be \`textfiles.com\``)
})

QUnit.test(`matchExts`, function (assert) {
  const extensions = new ListDefaults().avoidFileExtensions
  let content = matchExts(`https://www.defacto2.net/files/index.html&variable=false?morestuff=false`, extensions)
  assert.equal(content, false, `*.html should be \`false\``)
  content = matchExts(`https://www.textfiles.com/text/some-random-image.png`, extensions)
  assert.equal(content, true, `*.png should be \`true\``)
})

/*
 * functions.js
 */
QUnit.module(`functions.js`)

QUnit.test(`ListCharacterSets`, function (assert) {
  const content = new ListCharacterSets()
  assert.equal(content.sets[0], `out_8859_1`, `Should be \`out_8859_1\``)
})

QUnit.test(`ListDefaults`, function (assert) {
  const content = new ListDefaults()
  assert.equal(content.avoidDomains[0], `feedly.com`, `Should be \`feedly.com\``)
  assert.equal(content.avoidFileExtensions[0], `css`, `Should be \`css\``)
})

QUnit.test(`ListRGBThemes`, function (assert) {
  const content = new ListRGBThemes(),
    item = content.colors[content.color]
  assert.equal(item, `vga`, `Should be \`vga\``)
})

QUnit.test(`BuildFontStyles`, function (assert) {
  const content = new BuildFontStyles()
  assert.equal(content.family, `vga8`, `Should be \`vga8\``)
  assert.equal(content.string, `VGA8`, `Should be \`VGA8\``)
})

QUnit.test(`buildLinksToCSS`, function (assert) {
  function css(then, expected) {
    assert.equal(buildLinksToCSS(`test.css`, then),
      expected)
  }
  let linkElement = `<link id="dummyId" href="chrome-extension://` + extensionId + `/test.css" type="text/css" rel="stylesheet"></link>`,
    doc = parser.parseFromString(linkElement, `text/html`), // parse the tag into a HTML document
    link = doc.getElementsByTagName(`link`)[0].toString() // get the tag object from document and convert it to a string for testing
  css(`dummyId`, link, `TODO`)
  linkElement = `<link href="chrome-extension://` + extensionId + `/test.css" type="text/css" rel="stylesheet"></link>`
  doc = parser.parseFromString(linkElement, `text/html`)
  link = doc.getElementsByTagName(`link`)[0].toString()
})

QUnit.test(`findControlSequences`, function (assert) {
  let content = findControlSequences(`Hello world`)
  assert.equal(content, `plain`, `Should be \`plain\` text`)
  content = findControlSequences(`@X17Hello world`)
  assert.equal(content, `pcboard`, `Should be \`pcboard\` text`)
  content = findControlSequences(`@17@Hello world`)
  assert.equal(content, `wildcat`, `Should be \`wildcat\` text`)
})

QUnit.test(`findEngine`, function (assert) {
  // use an alternative method of detecting browser engine
  // this may not work in future browser updates
  let engine = `blink`
  if (typeof browser !== `undefined`) {
    engine = `gecko`
  }
  const browsergetBrowserEngine = findEngine()
  if (engine === `blink`) assert.equal(browsergetBrowserEngine, `blink`, `Should return \`blink\` if you're using a Chrome or Edge browser`)
  else if (engine === `gecko`) assert.equal(browsergetBrowserEngine, `gecko`, `Should return \`gecko\` if you're using a Firefox browser`)
})

QUnit.test(`HumaniseCP`, function (assert) {
  const content = new HumaniseCP(`src_CP1252`)
  assert.equal(content.text, `CP-437`, `Should be \`CP-437\``)
  assert.equal(content.title, `IBM/MS-DOS Code Page 437`, `Should be \`IBM/MS-DOS Code Page 437\``)
})

/*
 * retrotxt.js
 */
QUnit.module(`retrotxt.js`)

QUnit.test(`BuildCharSet`, function (assert) {
  let content = new BuildCharSet(`Hello ♕ world`)
  assert.equal(content.countUsAscii, 5, `Should be \`5\``)
  assert.equal(content.setPage, 6, `Should be \`6\``)
  assert.equal(content.guess, `src_CP1252`, `Should be \`src_CP1252\``)
  content = new BuildCharSet(`Hello world`)
  assert.equal(content.countUsAscii, 10, `Should be \`5\``)
  assert.equal(content.setPage, 0, `Should be \`0\``)
  assert.equal(content.guess, `out_8859_1`, `Should be \`out_8859_1\``)
})

QUnit.test(`switch2PlainText`, function (assert) {
  assert.equal(switch2PlainText(), undefined, `Should return no value`)
  const test = new FindDOM()
  test.pre0 = {}
  test.pre0.style = {}
  test.pre0.style.display = `block`
  switch2PlainText(test)
  assert.equal(test.pre0.style.display, `block`, `pre0 display should be set to \`block\``)
  test.pre1 = {}
  test.pre1.style = {}
  test.pre1.style.display = ``
  test.preCount = 2
  switch2PlainText(test)
  assert.equal(test.pre0.style.display, `block`, `pre0 display should be set to \`block\``)
  assert.equal(test.pre1.style.display, ``, `pre1 display should be set to \`\``)
})

/*
 * text_cp_dos.js
 */
QUnit.module(`text_cp_dos.js`)

QUnit.test(`ListCP437`, function (assert) {
  const set = new ListCP437().set_0
  assert.equal(set[1], `☺`, `Should be \`☺\``)
  assert.equal(set[1].charCodeAt(0), `9786`, `Should be character code 9786`)
  assert.equal(set[1].codePointAt(0), `9786`, `Should be character code 9786`)
})

QUnit.test(`List8859_5`, function (assert) {
  const set = new List8859_5().set_a
  assert.equal(set[15], `¤`, `Should be \`¤\``)
  assert.equal(set[15].charCodeAt(0), `164`, `Should be character code 164`)
  assert.equal(set[15].codePointAt(0), `164`, `Should be character code 164`)
})

QUnit.test(`\`BuildCPDos\``, function (assert) {
  // must use localStorage for tests to work correctly!
  const usersettingDisplayCtrlCode = localStorage.getItem(`textDosCtrlCodes`),
    string = `°°A²²BßC` + String.fromCharCode(13) + `Z÷Y.` // Character code 13 = carriage return / new line
  let buildResult = new BuildCPDos(string).text
  localStorage.setItem(`textDosCtrlCodes`, false)
  assert.equal(buildResult, `░░A▓▓B▀C` + String.fromCharCode(13) + `Z≈Y.`, `Treat ASCII control characters as that`)
  localStorage.setItem(`textDosCtrlCodes`, true)
  buildResult = new BuildCPDos(string).text
  //  assert.equal(buildResult, `░░A▓▓B▀C\nZ≈Y.`, `Treat ASCII control characters as DOS (CP-437) glyphs for display`)
  localStorage.setItem(`textDosCtrlCodes`, usersettingDisplayCtrlCode)
  buildResult = new BuildCPDos(`THE quick Brown f0x j!%$.`).text
  assert.equal(buildResult, `THE quick Brown f0x j!%$.`, `ASCII characters are universal so should never be converted between different code pages`)
  buildResult = new BuildCPDos(`░▒▓┌┬┐`).text
  assert.equal(buildResult, `░▒▓┌┬┐`, `Converting characters unique to CP-437 should return them unmodified`)
  buildResult = new BuildCPDos(`☺☕♫`).text
  assert.equal(buildResult, `☺☕♫`, `Other Unicode characters should remain untouched`)
  buildResult = new BuildCPDos(``).text
  assert.equal(buildResult, ``, `An empty string should return a blank string`)
  buildResult = new BuildCPDos().text
  assert.equal(buildResult, ``, `A null string should return a blank string`)
})

QUnit.test(`BuildBBS`, function (assert) {
  let content = BuildBBS(`@X01Hello world.`, `pcboard`)
  assert.deepEqual(content.innerHTML, `<i class="PB0 PF1">Hello world.</i>`, `Should contain HTML tags`)
  content = BuildBBS(`@CLS@@X01Hello world.`, `pcboard`)
  assert.equal(content.innerHTML, `<i class="PB0 PF1">Hello world.</i>`, `Should contain HTML tags`)
  content = BuildBBS(`@CLS@@X01Hello world.`, `pcboard`)
  assert.equal(content.innerHTML, `<i class="PB0 PF1">Hello world.</i>`, `Should contain HTML tags`)
})


QUnit.module(`text_ecma48.js`, {
  before: function () {
    // prepare something once for all tests
  },
  beforeEach: function () {
    // prepare something before each test
  },
  afterEach: function () {
    // clean up after each test
  },
  after: function () {
    // clean up once after all tests are done
  }
})
QUnit.test(`SGRCreate`, function (assert) {
  const content = new SGRCreate()
  assert.equal(content.colorF, 37, `Should be \`37\``)
  assert.equal(content.bold, false, `Should be \`false\``)
})

QUnit.test(`CursorReset`, function (assert) {
  const content = new CursorCreate()
  assert.equal(content.maxColumns, 80, `Should be \`80\``)
  assert.equal(content.column, 1, `Should be \`1\``)
})

QUnit.test(`findControlCode()`, function (assert) {
  // set a random string encoded in Unicode decimal to use as a sample base
  const sample = [48, 59, 51, 52, 109, 9556, 9552, 9552, 51, 72, null, 32, 32, 32, 9553, 32, 9484]
  const reply = `findControlCode should return`
  let a = []
  let test = ``
  // CU* [1-9]
  gccTest([65])
  assert.equal(test, `CUU,1,1`, `${reply} cursor up`)
  gccTest([66])
  assert.equal(test, `CUD,1,1`, `${reply} cursor down`)
  gccTest([67])
  assert.equal(test, `CUF,1,1`, `${reply} cursor forward`)
  gccTest([68])
  assert.equal(test, `CUB,1,1`, `${reply} cursor back`)
  gccTest([53, 65])
  assert.equal(test, `CUU,2,5`, `${reply} cursor up 5`)
  gccTest([57, 54, 67])
  assert.equal(test, `CUF,3,96`, `${reply} cursor forward 96`)
  gccTest([52, 56, 53, 66]) // 485f
  assert.equal(test, `CUD,4,485`, `${reply} cursor down 485`)
  gccTest([52, 56, 53, 48, 66]) // 4850f
  assert.equal(test, `CUD,5,4850`, `${reply} cursor down 4850`)
  gccTest([48, 66])
  assert.equal(test, `CUD,2,0`, `0 value ${reply} cursor down 0`)
  // HVP [10-18]
  gccTest([72])
  assert.equal(test, `HVP,1,1,1`, `'H' ${reply} cursor position row = 1, col = 1`)
  gccTest([49, 56, 59, 72])
  assert.equal(test, `HVP,4,18,1`, `'18;H' ${reply} cursor position row = 18, col = 1`)
  gccTest([49, 56, 72])
  assert.equal(test, `HVP,3,18,1`, `'18H' ${reply} cursor position row = 18, col = 1`)
  gccTest([49, 56, 59, 49, 72])
  assert.equal(test, `HVP,5,18,1`, `'18;1H' ${reply} cursor position row = 18, col = 1`)
  gccTest([59, 72])
  assert.equal(test, `HVP,2,1,1`, `';H' ${reply} cursor position row = 1, col = 1`)
  gccTest([59, 49, 56, 72])
  assert.equal(test, `HVP,4,1,18`, `';18H' ${reply} cursor position row = 1, col = 18`)
  gccTest([49, 59, 49, 56, 72])
  assert.equal(test, `HVP,5,1,18`, `'1;18H' ${reply} cursor position row = 1, col = 18`)
  gccTest([49, 48, 48, 48, 72])
  assert.equal(test, `HVP,5,1000,1`, `'1000H' ${reply} cursor position row = 1000, col = 1`)
  // CUP [18-19]
  gccTest([102])
  assert.equal(test, `HVP,1,1,1`, `'f' ${reply} cursor position row = 1, col = 1`)
  gccTest([49, 48, 48, 48, 102])
  assert.equal(test, `HVP,5,1000,1`, `'f' ${reply} cursor position row = 1000, col = 79`)
  //return
  // ED [20-23]
  gccTest([74])
  assert.equal(test, `ED,1,0`, `'J' should clear the cursor to the end of the row`)
  gccTest([48, 74])
  assert.equal(test, `ED,2,0`, `'J' should clear the cursor to the end of the row`)
  gccTest([49, 74])
  assert.equal(test, `ED,2,1`, `'J' should clear the cursor to the beginning of the display`)
  gccTest([50, 74])
  assert.equal(test, `ED,2,2`, `'J' should clear the entire display`)
  // EL [24-30]
  gccTest([75])
  assert.equal(test, `EL,1,0`, `'K' should clear the cursor to the end of the line`)
  gccTest([48, 75])
  assert.equal(test, `EL,2,0`, `'K' should clear the cursor to the end of the line`)
  gccTest([49, 75])
  assert.equal(test, `EL,2,1`, `'K' should clear the cursor to the beginning of the line`)
  gccTest([50, 75])
  assert.equal(test, `EL,2,2`, `'K' should clear the entire line`)
  // DSR
  gccTest([54, 110])
  assert.equal(test, null, `'6n' is ignored`)
  // SCP
  gccTest([115])
  assert.equal(test, `SCP,1`, `'s' should save the current cursor position`)
  // RCP
  gccTest([117])
  assert.equal(test, `RCP,1`, `'u' should restore the current cursor position`)
  // SGR [31-39]
  gccTest([109])
  assert.equal(test, `SGR,1,0`, `findControlCode 'm' should reset text rendition attributes`)
  gccTest([48, 109])
  assert.equal(test, `SGR,2,0`, `findControlCode '0m' should reset text rendition attributes`)
  gccTest([49, 109])
  assert.equal(test, `SGR,2,1`, `findControlCode '1m' should set bold text rendition attributes`)
  gccTest([51, 49, 109])
  assert.equal(test, `SGR,3,31`, `findControlCode '31m' should set text foreground colour attribute`)
  gccTest([52, 55, 109])
  assert.equal(test, `SGR,3,47`, `'47m' should set text background colour attribute`)
  gccTest([52, 55, 59, 51, 49, 109])
  assert.equal(test, `SGR,6,47,31`, `findControlCode '47;31m' should set text background and foreground colour attributes`)
  gccTest([51, 49, 59, 52, 55, 109])
  assert.equal(test, `SGR,6,31,47`, `findControlCode '31;47m' should set text background and foreground colour attributes`)
  gccTest([48, 59, 51, 49, 59, 52, 55, 109])
  assert.equal(test, `SGR,8,0,31,47`, `findControlCode '0;31;47m' should reset text attributes then set background and foreground colours`)
  gccTest([48, 59, 49, 59, 51, 49, 59, 52, 55, 109])
  assert.equal(test, `SGR,10,0,1,31,47`, `findControlCode '0;1;31;47m' should reset text attributes then set bold, background and foreground colours`)
  // SM [40-]
  gccTest([104])
  assert.equal(test, null, `findControlCode 'h' should fail`)
  gccTest([63, 104])
  assert.equal(test, null, `findControlCode '?h' should fail`)
  gccTest([63, 57, 48, 104])
  assert.equal(test, null, `findControlCode '?90h' should fail`)
  gccTest([63, 48, 104])
  assert.equal(test, `SM,3,0`, `'?0h' should set screen mode to 0`)
  gccTest([63, 49, 51, 104])
  assert.equal(test, `SM,4,13`, `findControlCode '?13h' should set screen mode to 13`)
  gccTest([48, 104])
  assert.equal(test, `SM,2,0`, `findControlCode '0h' should set screen mode to 0`)
  gccTest([49, 51, 104])
  assert.equal(test, `SM,3,13`, `findControlCode '13h' should set screen mode to 13`)
  // RM
  gccTest([63, 49, 51, 108])
  assert.equal(test, `RM,4,13`, `findControlCode '?13l should reset screen mode to 13`)
  // non-standard
  gccTest([48, 113])
  assert.equal(test, `/x,2,0`, `findControlCode '0q' should disable extended keyboard support`)
  gccTest([49, 113])
  assert.equal(test, `/x,2,1`, `findControlCode '1q' should enable extended keyboard support`)

  function gccTest(values = [])
  // Initialise the test of findControlCode()
  // @values  Array of text characters represented in Unicode decimal values
  {
    a = sample // reset array to the sample code
    values.unshift(859291, null) // inject expected Control Sequence Initiator and null into sample value
    a = values.concat(a) // merge CSI and sample value into sample code
    test = findControlCode(a, 0) // run sample in function for unit testing
  }
})

QUnit.test(`buildCSI()`, function (assert) {
  // "?" is just a place holder for these tests
  const reply = `should return`
  let sample = [`CUP`, `?`, 20, 5]
  let test = buildCSI(sample)
  assert.deepEqual(test, `HVP+20+5`, `CUP should return a HVP string`)
  sample = [`HVP`, `?`, 12, 12]
  test = buildCSI(sample)
  assert.deepEqual(test, `HVP+12+12`, `HVP should return a HVP string`)
  sample = [`CUD`, `?`, 1]
  test = buildCSI(sample)
  assert.deepEqual(test, `CUD+1`, `CUD should return a CUD string`)
  sample = [`CUD`, `?`, 5]
  test = buildCSI(sample)
  assert.deepEqual(test, `CUD+5`, `CUD should return a CUD string`)
  sample = [`CUF`, `?`, 1]
  test = buildCSI(sample)
  assert.deepEqual(test, `CUF+1`, `CUF should return a CUF string`)
  sample = [`CUF`, `?`, 3]
  test = buildCSI(sample)
  assert.deepEqual(test, `CUF+3`, `CUF should return a CUF string`)
  sample = [`DSR`, 1]
  test = buildCSI(sample)
  assert.deepEqual(test, ``, `DSR is unknown and should not return anything`)
  sample = [`ED`, `?`, 0]
  test = buildCSI(sample)
  assert.deepEqual(test, `ED+0`, `ED ${reply} ED 0`)
  sample = [`ED`, `?`, 1]
  test = buildCSI(sample)
  assert.deepEqual(test, `ED+1`, `ED ${reply} ED 1`)
  sample = [`ED`, `?`, 2]
  test = buildCSI(sample)
  assert.deepEqual(test, `ED+2`, `ED ${reply} ED 2`)
  sample = [`EL`, `?`, 0]
  test = buildCSI(sample)
  assert.deepEqual(test, `EL+0`, `EL ${reply} ED 0`)
  sample = [`EL`, `?`, 1]
  test = buildCSI(sample)
  assert.deepEqual(test, `EL+1`, `EL ${reply} EL 1`)
  sample = [`EL`, `?`, 2]
  test = buildCSI(sample)
  assert.deepEqual(test, `EL+2`, `EL ${reply} EL 2`)
})

QUnit.test(`Text to Unicode decimal conversion functions`, function (assert) {
  let textArr = buildDecimalArray(`abc`)
  let test
  assert.deepEqual(textArr, [97, 98, 99], `'abc' should return an array containing these numeric values`)
  test = buildDecimalArray(`\r\n`)
  assert.deepEqual(test, [13, 10], `'CRLF' should return an array containing these numeric values`)
  test = buildDecimalArray(`098`)
  assert.deepEqual(test, [48, 57, 56], `'098' should return an array containing these numeric values`)
  test = buildDecimalArray(`←[0;30;47m`)
  assert.deepEqual(test, [155, null, 48, 59, 51, 48, 59, 52, 55, 109], `'←[0;30;47m' should return an array containing these numeric values`)
})

QUnit.test(`BuildEcma48()`, function (assert) {
  const t = {
    _: `<span class=\"dos-cursor\">_</span>`,
    oTSM4: `<div id=\"row-1\"><i class=\"SGR37 SGR40 SGR12\">Hello world.</i></div>`,
    oTSM18: `<div id=\"row-1\"><i class=\"SGR37 SGR40 SGR17\">Hello world.</i></div>`
  }
  const reply = `sequence into HTML.`
  const inputText = `Hello world.`
  const outputText = `<div id=\"row-1\"><i class=\"SGR37 SGR40\">Hello world.</i></div>`

  let sample = ``
  let uniqueResult = ``
  let test
  // no controls
  sample = `Hello world.`
  test = new BuildEcma48(sample).innerHTML
  //test.innerHTML
  assert.equal(test, outputText, `'${sample}' ${reply}`)
  // C0 only
  sample = `Hello\nworld.`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR40\">Hello</i></div><div id=\"row-2\"><i class=\"SGR37 SGR40\">world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // ANSI.SYS controls (https://msdn.microsoft.com/en-us/library/cc722862.aspx)
  // CUP (cursor position)
  sample = `←[H${inputText}`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, outputText, `'${sample}' ${reply}`)

  sample = `←[;H${inputText}`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, outputText, `'${sample}' ${reply}`)

  sample = `←[2H${inputText}`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR40\"> </i></div><div id=\"row-2\"><i class=\"SGR37 SGR40\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `←[;18H${inputText}` // 1 row, 18 column
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i id=\"column-1-to-18\" class=\"SGR0\">${` `.repeat(18)}</i><i class=\"SGR37 SGR40\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // HVP (horizontal vertical position)
  sample = `←[f${inputText}`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, outputText, `'${sample}' ${reply}`)

  sample = `←[1;18f${inputText}`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i id=\"column-1-to-18\" class=\"SGR0\">${` `.repeat(18)}</i><i class=\"SGR37 SGR40\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `←[1;40f${inputText}`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i id=\"column-1-to-40\" class=\"SGR0\">${` `.repeat(40)}</i><i class=\"SGR37 SGR40\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `←[1;80f${inputText}`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i id=\"column-1-to-80\" class=\"SGR0\">${` `.repeat(80)}</i><i class=\"SGR37 SGR40\"></i></div><div id=\"row-2\"><i class=\"SGR37 SGR40\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // CUP (cursor up)
  sample = `←[A${inputText}`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, outputText, `'${sample}' ${reply}`)

  sample = `←[5A${inputText}`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, outputText, `'${sample}' ${reply}`)

  sample = `←[60A${inputText}`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, outputText, `'${sample}' ${reply}`)

  sample = `←[555A${inputText}`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, outputText, `'${sample}' ${reply}`)

  sample = `←[1523A${inputText}`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, outputText, `'${sample}' ${reply}`)
  // CUD (cursor down)
  sample = `←[B${inputText}`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR40\"> </i></div><div id=\"row-2\"><i class=\"SGR37 SGR40\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `←[3B${inputText}`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR40\"> </i></div><div id=\"row-2\"><i class=\"SGR37 SGR40\"> </i></div><div id=\"row-3\"><i class=\"SGR37 SGR40\"> </i></div><div id=\"row-4\"><i class=\"SGR37 SGR40\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `Hello←[BNew←[Blines`
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR40\">Hello</i></div><div id=\"row-2\"><i class=\"SGR37 SGR40\">New</i></div><div id=\"row-3\"><i class=\"SGR37 SGR40\">lines</i></div>`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // CUF (cursor forward)
  sample = `←[C${inputText}`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i id=\"column-1\" class=\"SGR0\"> </i><i class=\"SGR37 SGR40\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `←[1C${inputText}`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i id=\"column-1\" class=\"SGR0\"> </i><i class=\"SGR37 SGR40\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `Hello←[Cworld`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR40\">Hello</i><i id=\"column-6\" class=\"SGR0\"> </i><i class=\"SGR37 SGR40\">world</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `←[5C${inputText}`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i id=\"column-1-to-5\" class=\"SGR0\">     </i><i class=\"SGR37 SGR40\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // CUB (cursor back)
  sample = `${inputText}←[5D`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, outputText, `'${sample}' ${reply}`)
  // SCP (save cursor position) and RCP (restore cursor position)
  sample = `hello←[s\n←[u world`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR40\">hello world</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // ED2 Erase display
  sample = `←[2J${inputText}`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR40\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // EL0 Erase line
  sample = `←[K${inputText}`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i id=\"column-1-to-80\" class=\"SGR0\">                                                                                </i><i class=\"SGR37 SGR40\"></i></div><div id=\"row-2\"><i class=\"SGR37 SGR40\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // SGM Set Graphics Mode
  // All attributes off
  sample = `←[0mHello world.`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, outputText, `'${sample}' ${reply}`)

  sample = `←[0mHello\nworld.`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR40\">Hello</i></div><div id=\"row-2\"><i class=\"SGR37 SGR40\">world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // 1 bold
  sample = `←[1mHello world.`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR137 SGR40\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  sample = `Hello ←[0;1;31mworld.`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR40\">Hello </i><i class=\"SGR131 SGR40\">world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // 4 underscore
  sample = `←[4mHello world.`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR40 SGR4\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  sample = `Hello ←[4mworld.`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR40\">Hello </i><i class=\"SGR37 SGR40 SGR4\">world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // 5 blink
  sample = `←[5mHello world.`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR40 SGR5\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // 7 reverse
  sample = `←[7mHello world.`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR40 SGR7\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // 8 conceal
  sample = `←[8mHello world.`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR40 SGR8\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  sample = `←[8mHello ←[8mworld.`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR40 SGR8\">Hello </i><i class=\"SGR37 SGR40\">world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // foreground colours
  sample = `←[35mHello world.`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR35 SGR40\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  sample = `Hello ←[31mworld.`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR40\">Hello </i><i class=\"SGR31 SGR40\">world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  sample = `←[0mHello ←[36mworld.`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR40\">Hello </i><i class=\"SGR36 SGR40\">world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // background colours
  sample = `←[45mHello world.`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR45\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  sample = `Hello ←[41mworld.`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR40\">Hello </i><i class=\"SGR37 SGR41\">world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // both foreground and background colours
  sample = `←[0;31;45m${inputText}←[1A`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR31 SGR45\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  sample = `←[31;45m${inputText}`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR31 SGR45\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  sample = `Hello ←[31;41mworld.`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR40\">Hello </i><i class=\"SGR31 SGR41\">world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // SM set mode
  let smReply = `should set to mode '40 x 148 x 25 monochrome (text)'`
  sample = `←[0h${inputText}`
  test = new BuildEcma48(sample)
  assert.equal(test.colorDepth, 1, `'${sample}' colorDepth ${smReply}`)
  assert.equal(test.font, `cga`, `'${sample}' font ${smReply}`)
  //assert.equal(test.lineWrap, true, `'${sample}' lineWrap ${smReply}`)
  sample = `←[7h${inputText}`
  smReply = `should enable line wrapping'`
  test = new BuildEcma48(sample)
  //assert.equal(test.lineWrap, true, `'${sample}' ${smReply}`)
  // RM restore mode
  sample = `←[0l${inputText}`
  smReply = `should restore to mode '40 x 148 x 25 monochrome (text)'`
  test = new BuildEcma48(sample)
  //assert.equal(test.colorDepth, 1, `'${sample}' colorDepth ${smReply}`)
  assert.equal(test.font, `cga`, `'${sample}' font ${smReply}`)
  //assert.equal(test.lineWrap, true, `'${sample}' lineWrap ${smReply}`)
  sample = `←[7l${inputText}`
  smReply = `should disable line wrapping'`
  test = new BuildEcma48(sample)
  //assert.equal(test.lineWrap, false, `'${sample}' ${smReply}`)
  // ECMA-48 controls
  // ED Erase in Page
  uniqueResult = `<div id=\"row-1\"><i id=\"column-1-to-80\" class=\"SGR0\">                                                                                </i><i class=\"SGR37 SGR40\"></i></div><div id=\"row-2\"><i class=\"SGR37 SGR40\">Hello world.</i></div>`
  sample = `←[J${inputText}`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `←[0J${inputText}`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR40\">Hello world.</i></div>`
  sample = `←[1J${inputText}`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `←[2J${inputText}`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // NOTE: 16/9/17 - switched RT to ignore \n values when rendering ANSI
  // [2J erases display
  sample = `${inputText}\n${inputText}\n${inputText}←[2J`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\" class=\"ED\"><i class=\"SGR37 SGR40\">Hello world.Hello world.Hello world.</i></div>`
  //uniqueResult = `<div id=\"row-1\" class=\"ED\"><i class=\"SGR37 SGR40\">Hello world.</i></div><div id=\"row-2\" class=\"ED\"><i class=\"SGR37 SGR40\">Hello world.</i></div><div id=\"row-3\" class=\"ED\"><i class=\"SGR37 SGR40\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // EL Erase in Line
  sample = `←[K${inputText}`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i id=\"column-1-to-80\" class=\"SGR0\">                                                                                </i><i class=\"SGR37 SGR40\"></i></div><div id=\"row-2\"><i class=\"SGR37 SGR40\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `←[0K${inputText}`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  // ←[1K is not supported
  //
  sample = `←[2K${inputText}`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\" class="ED"><i class=\"SGR37 SGR40\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // SGR Select Graphic Rendition
  // effects
  for (let sgr = 0; sgr < 22; sgr++) {
    sample = `←[${sgr}m${inputText}`
    test = new BuildEcma48(sample).innerHTML
    if ([0, 10].includes(sgr)) uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR40\">Hello world.</i></div>`
    else if (sgr === 1) uniqueResult = `<div id=\"row-1\"><i class=\"SGR137 SGR40\">Hello world.</i></div>`
    else uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR40 SGR${sgr}\">Hello world.</i></div>`
    assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  }
  // cancelled effects
  sample = `←[1mHello ←[22mworld.`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR137 SGR40\">Hello </i><i class=\"SGR37 SGR40\">world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  for (let sgr = 23; sgr < 29; sgr++) {
    if ([26, 28].includes(sgr)) continue
    sample = `←[${sgr - 20}mHello ←[${sgr}mworld.`
    test = new BuildEcma48(sample).innerHTML
    uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR40 SGR${sgr - 20}\">Hello </i><i class=\"SGR37 SGR40\">world.</i></div>`
    assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  }
  // foreground colours
  for (let sgr = 30; sgr < 40; sgr++) {
    if (sgr === 38) continue
    sample = `←[${sgr}m${inputText}`
    test = new BuildEcma48(sample).innerHTML
    uniqueResult = `<div id=\"row-1\"><i class=\"SGR${sgr} SGR40\">Hello world.</i></div>`
    assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  }
  // background colours
  for (let sgr = 40; sgr < 50; sgr++) {
    if (sgr === 48) continue
    sample = `←[${sgr}m${inputText}`
    test = new BuildEcma48(sample).innerHTML
    uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR${sgr}\">Hello world.</i></div>`
    assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  }
  // border effects
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR40 SGR51\">Hello </i><i class="SGR37 SGR40">world.</i></div>`
  sample = `←[51mHello ←[54mworld.`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR40 SGR52\">Hello </i><i class="SGR37 SGR40">world.</i></div>`
  sample = `←[52mHello ←[54mworld.`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR40 SGR53\">Hello </i><i class="SGR37 SGR40">world.</i></div>`
  sample = `←[53mHello ←[55mworld.`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // xterm 256 colours
  sample = `←[38;5;0m${inputText}`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR380 SGR40\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `←[38;5;10m${inputText}`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR3810 SGR40\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `←[38;5;100m${inputText}`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR38100 SGR40\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `←[38;5;255m${inputText}`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR38255 SGR40\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `←[48;5;255m${inputText}`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR48255\">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // unknown control functions
  sample = `←[6n${inputText}`
  test = new BuildEcma48(sample).innerHTML
  uniqueResult = `<div id=\"row-1\"><i class=\"SGR37 SGR40\">␛[6nHello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // Alternative Control Sequence Introducer
  // Set Mode =4h
  sample = `←[4h${inputText}`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, t.oTSM4, `'${sample}' ${reply}`)

  sample = `←[?4h${inputText}`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, t.oTSM4, `'${sample}' ${reply}`)

  sample = `←[=4h${inputText}`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, t.oTSM4, `'${sample}' ${reply}`)

  sample = `←[>4h${inputText}`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, t.oTSM4, `'${sample}' ${reply}`)

  sample = `←[18h${inputText}`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, t.oTSM18, `'${sample}' ${reply}`)

  sample = `←[?18h${inputText}`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, t.oTSM18, `'${sample}' ${reply}`)

  sample = `←[=18h${inputText}`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, t.oTSM18, `'${sample}' ${reply}`)

  sample = `←[>18h${inputText}`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, t.oTSM18, `'${sample}' ${reply}`)

  // iCE colors ←[?33h (on) and ←[?33l (off)

  sample = `←[?33h←[47;5m←[B${inputText}` // start with iCE on
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, `<div id=\"row-1\"><i class=\"SGR37 SGR47 SGR5\"></i></div><div id=\"row-2\"><i class=\"SGR37 SGR47 SGR5\">Hello world.</i></div>`, `'${sample}' ${reply}`)

  sample = `←[?33l←[47;5m←[B${inputText}` // start with iCE off
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, `<div id=\"row-1\"><i class=\"SGR37 SGR47 SGR5\"></i></div><div id=\"row-2\"><i class=\"SGR37 SGR47 SGR5\">Hello world.</i></div>`, `'${sample}' ${reply}`)

  sample = `←[?33h←[5;47m${inputText}`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, `<div id=\"row-1\"><i class=\"SGR37 SGR47 SGR5\">Hello world.</i></div>`, `'${sample}' ${reply}`)

  sample = `←[?33h←[6;47miCE iCE Baby←[?33l${inputText}`
  test = new BuildEcma48(sample).innerHTML
  assert.equal(test, `<div id=\"row-1\"><i class=\"SGR37 SGR47 SGR6\">iCE iCE Baby</i><i class=\"SGR37 SGR47 SGR6\">Hello world.</i></div>`, `'${sample}' ${reply}`)

  /*
   * text_ecma94.js
   */
  QUnit.module(`text_ecma94.js`)

  QUnit.test(`BuildCP1252`, function (assert) {
    const set = new BuildCP1252(`Can I pay in \u0080?`),
      result = `Can I pay in €?`
    assert.equal(set.text, result, `Should be the string '${result}'`)
  })

  QUnit.test(`BuildCP88591`, function (assert) {
    const set = new BuildCP88591(`MS-DOS end of line?\u001B`),
      result = `MS-DOS end of line?←`
    assert.equal(set.text, result, `Should be the string '${result}'`)
  })

  QUnit.test(`BuildCP885915`, function (assert) {
    const set = new BuildCP885915(`Can I pay in \u00A4?`),
      result = `Can I pay in €?`
    assert.equal(set.text, result, `Should be the string '${result}'`)
  })

  QUnit.test(`BuildCPUtf8`, function (assert) {
    const set = new BuildCPUtf8(`Smile \u{1F601}`),
      result = `Smile 😁`
    assert.equal(set.text, result, `Should be the string '${result}'`)
  })

  QUnit.test(`BuildCPUtf16`, function (assert) {
    const set = new BuildCPUtf16(`Smile \u{1F601}`),
      result = `Smile 😁`
    assert.equal(set.text, result, `Should be the string '${result}'`)
  })

  QUnit.test(`BuildCPUtf16`, function (assert) {
    const set = new BuildCPUtf16(`Smile \u{1F601}`),
      result = `Smile 😁`
    assert.equal(set.text, result, `Should be the string '${result}'`)
  })
})

QUnit.test(`BuildCPUtf16`, function (assert) {
  const set = new BuildCPUtf16(`Smile \u{1F601}`),
    result = `Smile 😁`
  assert.equal(set.text, result, `Should be the string '${result}'`)
})
QUnit.test(`BuildCPUtf8`, function (assert) {
  const set = new BuildCPUtf8(`Smile \u{1F601}`),
    result = `Smile 😁`
  assert.equal(set.text, result, `Should be the string '${result}'`)
})

QUnit.test(`BuildCPUtf16`, function (assert) {
  const set = new BuildCPUtf16(`Smile \u{1F601}`),
    result = `Smile 😁`
  assert.equal(set.text, result, `Should be the string '${result}'`)
})
