/* eslint-env qunit:true */
/*global QUnit Controls cursor domObject ecma48 italicElement reset resetCursor resetECMA resetSGR
Build CharacterAttributes Cursor Markup Metadata Scan SGR Statistics */
"use strict"

QUnit.module(`parse_ansi.js`, {
  before: () => {
    // prepare something once for all tests
    console.info(
      `☑ New QUnit parse_ansi.js test, data containers have been reset`
    )
    reset(resetCursor)
    reset(resetECMA)
    reset(resetSGR)
    domObject.html = ``
  },
  beforeEach: () => {
    // prepare something before each test
    reset(resetCursor)
    reset(resetECMA)
    reset(resetSGR)
    domObject.html = ``
  },
  afterEach: () => {
    // clean up after each test
    reset(resetCursor)
    reset(resetECMA)
    reset(resetSGR)
    domObject.html = ``
  },
  after: () => {
    // clean up once after all tests are done
    reset(resetCursor)
    reset(resetECMA)
    reset(resetSGR)
    domObject.html = ``
    console.info(`☑ QUnit parse_ansi.js tests are complete`)
  },
})

QUnit.test(`Controls._hideEntities()`, (t) => {
  const ansi = new Controls()

  ansi.text = `Hello<p>& world</p>`
  let test = ansi._hideEntities()
  t.equal(test, `Hello⮘p⮚& world⮘/p⮚`)

  ansi.text = `A, B &amp; C`
  test = ansi._hideEntities()
  t.equal(test, `A, B ⮙ C`)

  ansi.text = `␛[>`
  test = ansi._hideEntities()
  t.equal(test, `␛[>`)

  ansi.text = `<i>`
  test = ansi._hideEntities()
  t.equal(test, `⮘i⮚`)
})

QUnit.test(`Controls._parseFont()`, (t) => {
  const ansi = new Controls()
  t.equal(ansi._parseFont(), null)
  t.equal(ansi._parseFont(20), `eaglespcga_alt3`)
  t.equal(ansi._parseFont(11), `ibm_bios`)
  t.equal(ansi._parseFont(`12`), `ibm_cga`)
  t.equal(ansi._parseFont(99), undefined)
  t.equal(ansi._parseFont(`twelve`), undefined)
})

QUnit.test(`Cursor`, (t) => {
  const cursor = new Cursor()
  t.equal(cursor.maxColumns, 80, `Should be \`80\``)
  t.equal(cursor.column, 1, `Should be \`1\``)
  const test = new Cursor()
  test.maxColumns = 99
  t.equal(test.maxColumns, 99, `Should be \`99\``)
  cursor.reset(test)
  t.equal(test.maxColumns, 80, `Should be \`80\``)
})

QUnit.test(`Cursor.columnElement() async`, (t) => {
  const test = new Cursor(),
    done0 = t.async(),
    done1 = t.async(),
    done10 = t.async(),
    doneNaN = t.async()
  setTimeout(() => {
    domObject.html = `` // reset
    test.columnElement(0)
    t.equal(
      domObject.html,
      `</i><i id="column-1-to-80" class="SGR0">                                                                                </i><i class="SGR37 SGR40"></i></div><div id="row-2"><i class="SGR37 SGR40">`,
      `Italic element should contain 80 spaces`
    )
    done0()
  }, 50)
  setTimeout(() => {
    domObject.html = `` // reset
    test.columnElement(1)
    t.equal(
      domObject.html,
      `</i><i id="column-1" class="SGR0"> </i><i class="SGR37 SGR40">`,
      `Italic element should contain 1 space`
    )
    done1()
  }, 50)
  setTimeout(() => {
    domObject.html = `` // reset
    test.columnElement(10)
    t.equal(
      domObject.html,
      `</i><i id="column-2-to-11" class="SGR0">          </i><i class="SGR37 SGR40">`,
      `Italic elements should total 10 spaces`
    )
    done10()
  }, 50)
  setTimeout(() => {
    domObject.html = `` // reset
    test.columnElement(`abc`)
    t.equal(
      domObject.html,
      ``,
      `An invalid supplied value should abort the function`
    )
    doneNaN()
  }, 500)
})

QUnit.test(`Cursor.columnParse()`, (t) => {
  const test = new Cursor()
  cursor.column = 1
  test.columnParse()
  t.equal(cursor.column, 2, `cursor.column should be \`2\``)
  cursor.column = 1
  test.columnParse(10)
  t.equal(cursor.column, 11, `cursor.column should be \`11\``)
  cursor.column = 1
  test.columnParse(`abc`)
  t.equal(cursor.column, 1, `cursor.column should be unchanged \`1\``)
})

QUnit.test(`Cursor.rowElement()`, (t) => {
  const reset = () => {
    cursor.column = 1
    cursor.row = 1
  }
  const test = new Cursor()
  reset()
  test.rowElement()
  t.equal(cursor.row, 2, `cursor.row should be \`2\``)
  reset()
  test.rowElement(10)
  t.equal(cursor.row, 11, `cursor.row should be \`11\``)
  reset()
  test.rowElement(10, 10)
  t.equal(cursor.row, 11, `cursor.column should be \`11\``)
  t.equal(cursor.row, 11, `cursor.row should be \`11\``)
  reset()
  test.rowElement(`abc`)
  t.equal(cursor.row, 1, `cursor.row should be unchanged \`1\``)
})

QUnit.test(`SGR`, (t) => {
  const sgr = new SGR()
  t.equal(sgr.colorF, 37, `Should be \`37\``)
  t.equal(sgr.bold, false, `Should be \`false\``)
  const test = new SGR()
  test.bold = true
  t.equal(test.bold, true, `Should be \`true\``)
  sgr.reset(test)
  t.equal(test.bold, false, `Should be \`false\``)
})

QUnit.test(`Statistics`, (t) => {
  const cursor = new Statistics()
  t.equal(cursor.unknown, 0, `Should be \`80\``)
  t.equal(cursor.colorDepth, 4, `Should be \`1\``)
  const test = new Statistics()
  test.unknown = 99
  t.equal(test.unknown, 99, `Should be \`99\``)
  cursor.reset(test)
  t.equal(test.unknown, 0, `Should be \`80\``)
})

QUnit.test(`italicElement()`, (t) => {
  let test = italicElement()
  t.equal(test, `<i class="SGR37 SGR40">`, `Should be a default element`)
  test = italicElement(`SGR30`)
  t.equal(test, `<i class="SGR37 SGR40">`, `Should be a default element`)
})

QUnit.test(`CharacterAttributes.createSGRClass()`, (t) => {
  const test = new CharacterAttributes()
  // test initial values
  t.equal(test.toggles.colorF, 37, `colorF should be \`37\``)
  t.equal(test.toggles.colorB, 40, `font should be \`40\``)
  t.equal(test.toggles.overLined, false, `overLined should be \`false\``)
  t.equal(test.createSGRClass(), `SGR37 SGR40`, `Should return \`SGR37 SGR40\``)
  // test modified values
  test.toggles.colorF = 31
  t.equal(test.createSGRClass(), `SGR31 SGR40`, `Should return \`SGR31 SGR40\``)
  test.toggles.overLined = true
  t.equal(
    test.createSGRClass(),
    `SGR31 SGR40 SGR53`,
    `Should return \`SGR31 SGR40 SGR53\``
  )
  // test ecma48 modifications
  ecma48.font = 11
  t.equal(
    test.createSGRClass(),
    `SGR31 SGR40 SGR53 SGR11`,
    `Should return \`SGR31 SGR40 SGR53 SGR11\``
  )
})

QUnit.test(`CharacterAttributes.createRGBStyle()`, (t) => {
  const test = new CharacterAttributes()
  // test RGB styles
  test.parameters = `SGR+38+2+0+0+0`
  t.equal(
    test.createRGBStyle(),
    `color:rgb(0,0,0)`,
    `Should return RGB foreground style \`color:rgb(0,0,0)\``
  )
  test.parameters = `SGR+48+2+255+255+255`
  t.equal(
    test.createRGBStyle(),
    `color:rgb(0,0,0);background-color:rgb(255,255,255)`,
    `Should return RGB foreground style \`color:rgb(0,0,0);background-color:rgb(255,255,255)\``
  )
  test.toggles.rgbF = ``
  test.toggles.rgbB = ``
  test.styles = ``
  test.parameters = `SGR+48+2+255+255+255`
  t.equal(
    test.createRGBStyle(),
    `background-color:rgb(255,255,255)`,
    `Should return RGB background style \`background-color:rgb(255,255,255)\``
  )
  test.styles = ``
  test.parameters = `SGR+48+2+1`
  t.equal(test.createRGBStyle(), ``, `Is an invalid RGB paramater`)
})

QUnit.test(`CharacterAttributes._aixterm()`, (t) => {
  const test = new CharacterAttributes()
  test.value = 90
  test.toggles.bold = false
  test.toggles.blinkSlow = false
  t.equal(test.toggles.bold, false, `Initial toggle bold should be off`)
  t.equal(test._aixterm(), 30, `aixterm() value \`60\` should return \`30\``)
  t.equal(test.toggles.bold, true, `aixterm() value \`60\` should toggle bold`)
  test.value = 100
  t.equal(test._aixterm(), 40, `aixterm() value \`40\` should return \`40\``)
  t.equal(
    test.toggles.blinkSlow,
    true,
    `aixterm() value \`60\` should toggle blinkSlow`
  )
  test.value = `hundred`
  t.equal(
    test._aixterm(),
    null,
    `aixterm() with an invalid value should return \`null\``
  )
})

QUnit.test(`CharacterAttributes.setBackground()`, (t) => {
  const test = new CharacterAttributes(),
    foreground = 37,
    background = 47,
    xterm = 480
  test.value = foreground
  t.equal(test._setBackground(), false, `SGR value \`37\` is not a background`)
  test.value = background
  t.equal(test._setBackground(), true, `SGR value \`47\` is a background`)
  test.value = xterm
  t.equal(
    test._setBackground(),
    true,
    `SGR value \`480\` is an xterm background`
  )
  test.value = `abc`
  t.equal(test._setBackground(), false, `SGR value \`abc\` is not a background`)
})

QUnit.test(`CharacterAttributes.setForeground()`, (t) => {
  const test = new CharacterAttributes(),
    foreground = 37,
    background = 47,
    xterm = 380
  test.value = background
  t.equal(test._setForeground(), false, `SGR value \`47\` is not a foreground`)
  test.value = foreground
  t.equal(test._setForeground(), true, `SGR value \`37\` is a foreground`)
  test.value = xterm
  t.equal(
    test._setForeground(),
    true,
    `SGR value \`380\` is an xterm foreground`
  )
  test.value = `abc`
  t.equal(test._setForeground(), false, `SGR value \`abc\` is not a foreground`)
})

QUnit.test(`CharacterAttributes.rgb()`, (t) => {
  const reset = () => {
    test.styles = ``
    test.toggles.rgbB = ``
    test.toggles.rgbF = ``
  }
  const test = new CharacterAttributes(),
    reservedForeground = 38,
    reservedBackground = 48,
    rgbFlag = 2
  test.value = reservedForeground
  test.values = [null, reservedForeground, rgbFlag, 0, 0, 0]
  t.equal(
    test._rgb(),
    `color:rgb(0,0,0)`,
    `Should return RGB foreground style \`color:rgb(0,0,0)\``
  )
  reset()
  test.value = reservedBackground
  test.values = [null, reservedBackground, rgbFlag, 211, 198, 54]
  t.equal(
    test._rgb(),
    `background-color:rgb(211,198,54)`,
    `Should return RGB background style \`background-color:rgb(211,198,54)\``
  )
  reset()
  test.value = reservedBackground
  test.values = [null, reservedBackground, rgbFlag, 256, 333, 9999]
  t.equal(test._rgb(), ``, `Is not a valid RGB value`)
})

QUnit.test(`CharacterAttributes.xtermBG()`, (t) => {
  const test = new CharacterAttributes(),
    goodValues = [480, 4811, 48255]
  for (const v of goodValues) {
    test.value = v
    t.equal(
      test._xtermBG(),
      true,
      `\`${test.value}\` is a valid xterm background`
    )
  }
  const badValues = [47, 999, `abc`]
  for (const v of badValues) {
    test.value = v
    t.equal(
      test._xtermBG(),
      false,
      `\`${test.value}\` is not a valid xterm background`
    )
  }
})

QUnit.test(`CharacterAttributes.xtermFG()`, (t) => {
  const test = new CharacterAttributes(),
    goodValues = [380, 3888, 38255]
  for (const v of goodValues) {
    test.value = v
    t.equal(
      test._xtermFG(),
      true,
      `\`${test.value}\` is a valid xterm foreground`
    )
  }
  const badValues = [37, 999, `abc`]
  for (const v of badValues) {
    test.value = v
    t.equal(
      test._xtermFG(),
      false,
      `\`${test.value}\` is not a valid xterm foreground`
    )
  }
})

QUnit.test(`CharacterAttributes.presentation()`, (t) => {
  const ca = new CharacterAttributes(),
    normalIntensityColor = 22,
    italic = 3,
    underline = 4,
    tests = [`bold`, `faint`, `italic`, `underline`]
  let val = 0
  for (const name of tests) {
    val++
    ca.toggles[`${name}`] = false
    ca.value = val
    ca._presentation()
    t.equal(
      ca.toggles[`${name}`],
      true,
      `\`${name}\` toggle should be \`true\``
    )
  }
  // bold & faint are now both toggled, value 22 should disable them
  ca.value = normalIntensityColor
  ca._presentation()
  t.equal(ca.toggles.bold, false, `\`bold\` toggle should be \`false\``)
  t.equal(ca.toggles.faint, false, `\`faint\` toggle should be \`false\``)
  // disable other toggles
  ca.value = italic
  ca._presentation()
  t.equal(ca.toggles.italic, false, `\`italic\` toggle should be \`false\``)
  ca.value = underline
  ca._presentation()
  t.equal(
    ca.toggles.underline,
    false,
    `\`underline\` toggle should be \`false\``
  )
})

const testBuild = new Map()
  .set([], `</i></div>`)
  .set([`h`, `i`], `<div id="row-1"><i class="SGR37 SGR40">hi</i></div>`)
  .set(
    [`H`, `e`, `l`, `l`, `o`, ` `, `w`, `o`, `r`, `l`, `d`, `.`],
    `<div id="row-1"><i class="SGR37 SGR40">Hello world.</i></div>`
  )
  .set(
    [`SGR+1`, `h`, `i`, `SGR+0`],
    `<div id="row-1"><i class="SGR137 SGR40">hi</i><i class="SGR37 SGR40"></i></div>`
  )
  .set(
    [`SGR+5`, `h`, `SGR+0`, `i`],
    `<div id="row-1"><i class="SGR37 SGR40 SGR5">h</i><i class="SGR37 SGR40">i</i></div>`
  )
  .set(
    [`a`, `\n`, `b`, `undefined`, `c`, `null`, `d`],
    `<div id="row-1"><i class="SGR37 SGR40">a</i></div><div id="row-2"><i class="SGR37 SGR40">bcd</i></div>`
  )
// TODO very extensive testing on SGR+ combinations

QUnit.test(`HTML class functions`, (t) => {
  for (const [seq, result] of testBuild.entries()) {
    domObject.html = ``
    const h = new Markup()
    h.sequences = seq
    h.build()
    t.equal(domObject.html, result, `'${seq}' ${result}`)
  }
})

const testElmI = new Map()
  .set(`SGR+35+44`, `<i class="SGR35 SGR44">`)
  .set(`SGR+1`, `<i class="SGR135 SGR44">`)
  .set(`SGR+0`, `<i class="SGR37 SGR40">`)
  .set(`SM+1`, `<i class="SGR37 SGR40">`)
  .set(``, `<i class="SGR37 SGR40">`)
  // Map keys must be unique, so instead of reusing SGR+0 which will be ignored
  // create a unique sequence that ends with +0 to reset the sgr toggles
  .set(`SGR+1+0`, `<i class="SGR37 SGR40">`)
  // RGB 24-bit
  .set(
    `SGR+38+2+254+200+100`,
    `<i class="SGR40" style="color:rgb(254,200,100)">`
  )
  .set(
    `SGR+48+2+0+0+0`,
    `<i style="color:rgb(254,200,100);background-color:rgb(0,0,0)">`
  )
  .set(`SGR+2+0`, `<i class="SGR37 SGR40">`)
  // aixterm, toggles bold and background brightness
  .set(`SGR+91+105`, `<i class="SGR131 SGR45 SGR5">`)
  // xterm, uses a custom internal syntax
  // SGR+[38|48][0-255], see _functionsForArray() case `SGR`
  .set(`SGR+3+0`, `<i class="SGR37 SGR40">`)
  .set(`SGR+48232`, `<i class="SGR37 SGR48232">`)
  .set(`SGR+4899`, `<i class="SGR37 SGR4899">`)
  .set(`SGR+38254`, `<i class="SGR38254 SGR4899">`)

QUnit.test(`Markup._element_i()`, (t) => {
  for (const [item, result] of testElmI.entries()) {
    const h = new Markup()
    h.item.value = `${item}`
    t.equal(h._element_i(), result, `'${item}' ${result}`)
  }
})

QUnit.test(`HTML miscellaneous functions`, (t) => {
  const h = new Markup()
  // _closeElements()
  domObject.html = `<div id="row-1"><i class="SGR37 SGR40">Hi`
  h._closeElements()
  t.equal(
    domObject.html,
    `<div id="row-1"><i class="SGR37 SGR40">Hi</i></div>`,
    `Open elements should be closed`
  )
  domObject.html = `<div id="row-1"><i class="SGR37 SGR40">Hi</i></div>             ␛[��`
  h._closeElements()
  t.equal(
    domObject.html,
    `<div id="row-1"><i class="SGR37 SGR40">Hi</i></div>`,
    `Open elements should be closed`
  )
  domObject.html = `<div id="row-1"><i class="SGR37 SGR40"></i></div>`
  h._closeElements()
  t.equal(
    domObject.html,
    `<div id="row-1"><i class="SGR37 SGR40"> </i></div>`,
    `italic element should contain a space`
  )
  // test valid eraseLines setting
  domObject.html = `<div id="row-1"><i class="SGR37 SGR40">Hi</i></div>`
  cursor.eraseLines = [0]
  h._eraseLines()
  t.equal(
    domObject.html,
    `<div id="row-1" class="ED"><i class="SGR37 SGR40">Hi</i></div>`,
    `Row 1 should contain an \`ED\` class`
  )
  domObject.html = `<div id="row-1"><i class="SGR37 SGR40">Hi</i></div><div id="row-2"><i class="SGR37 SGR40">Bye</i></div>`
  cursor.eraseLines = [0, 1]
  h._eraseLines()
  t.equal(
    domObject.html,
    `<div id="row-1" class="ED"><i class="SGR37 SGR40">Hi</i></div><div id="row-2" class="ED"><i class="SGR37 SGR40">Bye</i></div>`,
    `Row 1 & 2 should contain an \`ED\` class`
  )
  // test valid + invalid eraseLines settings
  domObject.html = `<div id="row-1"><i class="SGR37 SGR40">Hi</i></div>`
  cursor.eraseLines = [0, 1, 2, 3, 4]
  h._eraseLines()
  t.equal(
    domObject.html,
    `<div id="row-1" class="ED"><i class="SGR37 SGR40">Hi</i></div>`,
    `Row 1 should contain an \`ED\` class`
  )
  // test only invalid eraseLines setting
  domObject.html = `<div id="row-1"><i class="SGR37 SGR40">Hi</i></div>`
  cursor.eraseLines = [99]
  h._eraseLines()
  t.equal(
    domObject.html,
    `<div id="row-1"><i class="SGR37 SGR40">Hi</i></div>`,
    `Row 1 should display standard SGR classes`
  )
})

QUnit.test(`Markup._parseNamedSequence() CUD`, (t) => {
  const h = new Markup()
  h._parseNamedSequence(0, ``)
  t.equal(cursor.row, 1, `Row should remain at 1`)
  t.equal(cursor.previousRow, 0, `Previous row should be 0`)
  h._parseNamedSequence(5, `CUD+5`)
  t.equal(cursor.row, 6, `Row should be at 6`)
  t.equal(cursor.previousRow, 1, `Previous row should be 1`)
  h._parseNamedSequence(8, `CUD+1`)
  t.equal(cursor.row, 7, `Row should be at 7`)
  t.equal(cursor.previousRow, 6, `Previous row should be 6`)
})

QUnit.test(`Markup._parseNamedSequence() CUF`, (t) => {
  const h = new Markup(),
    defaultColumns = 80
  h._parseNamedSequence(0, ``)
  t.equal(cursor.column, 1, `Cursor should remain at 1`)
  t.equal(cursor.maxColumns, defaultColumns, `Max columns should be 80`)
  h._parseNamedSequence(5, `CUF+5`)
  t.equal(cursor.column, 6, `Cursor be at 6`)
  t.equal(cursor.maxColumns, defaultColumns, `Max columns should be 80`)
  h._parseNamedSequence(5, `CUF+70`)
  t.equal(cursor.column, 76, `Cursor be at 76`)
  // force the creation of a new row?
  h._parseNamedSequence(5, `CUF+10`)
  t.equal(cursor.column, 6, `Cursor be at 6`)
  h._parseNamedSequence(6, `CUF+50`)
  t.equal(cursor.column, 56, `Cursor be at 56`)
})

QUnit.test(`Markup._parseNamedSequence() HVP`, (t) => {
  const h = new Markup(),
    defaultColumns = 80
  // test invalid coordinates
  h._parseNamedSequence(0, ``)
  t.equal(cursor.column, 1, `Cursor should remain at 1`)
  t.equal(cursor.row, 1, `Row should remain at 1`)
  t.equal(cursor.previousRow, 0, `Previous row should be 0`)
  t.equal(cursor.maxColumns, defaultColumns, `Max columns should be 80`)
  h._parseNamedSequence(0, `HVP+0+0`)
  t.equal(cursor.column, 1, `Cursor should remain at 1`)
  t.equal(cursor.row, 1, `Row should remain at 1`)
  t.equal(cursor.previousRow, 0, `Previous row should be 0`)
  t.equal(cursor.maxColumns, defaultColumns, `Max columns should be 80`)
  // test valid coordinates
  h._parseNamedSequence(0, `HVP+1+1`)
  t.equal(cursor.column, 1, `Cursor should remain at 1`)
  t.equal(cursor.row, 1, `Row should remain at 1`)
  t.equal(cursor.previousRow, 1, `Previous row should be 1`)
  t.equal(cursor.maxColumns, defaultColumns, `Max columns should be 80`)
  h._parseNamedSequence(0, `HVP+1+10`)
  t.equal(cursor.column, 10, `Cursor should be at 10`)
  h._parseNamedSequence(0, `HVP+10+10`)
  t.equal(cursor.column, 10, `Cursor should remain at 10`)
  t.equal(cursor.row, 10, `Row should remain at 10`)
  t.equal(cursor.previousRow, 1, `Previous row should be 1`)
  h._parseNamedSequence(0, `HVP+50+50`)
  t.equal(cursor.column, 50, `Cursor should be at 50`)
  t.equal(cursor.row, 50, `Row should remain at 50`)
  t.equal(cursor.previousRow, 10, `Previous row should be 10`)
  h._parseNamedSequence(0, `HVP+50+79`)
  t.equal(cursor.column, 79, `Cursor should be at 79`)
  t.equal(cursor.row, 50, `Row should remain at 50`)
  t.equal(cursor.previousRow, 50, `Previous row should be 50`)
  h._parseNamedSequence(0, `HVP+50+80`)
  t.equal(cursor.column, 80, `Cursor should be at 80`)
  t.equal(cursor.row, 50, `Row should remain at 50`)
  // test maximum columns
  h._parseNamedSequence(0, `HVP+50+100`)
  t.equal(cursor.column, 20, `Cursor should be at 20`)
  t.equal(cursor.row, 51, `Row should remain at 51`)
  t.equal(cursor.previousRow, 50, `Previous row should be 50`)
})

QUnit.test(`Markup._parseNamedSequence() ICE`, (t) => {
  const h = new Markup()
  h._parseNamedSequence(0, ``)
  t.equal(ecma48.iceColors, false, `Toggle should remain unchanged`)
  h._parseNamedSequence(0, `ICE+1`)
  t.equal(ecma48.iceColors, true, `Toggle should be on`)
  h._parseNamedSequence(0, `ICE+0`)
  t.equal(ecma48.iceColors, false, `Toggle should be off`)
  t.equal(
    domObject.html,
    ``,
    `DOM Object should remain empty while row is 1 or below`
  )
})

QUnit.test(`Markup._parseNamedSequence() SGR`, (t) => {
  const h = new Markup()
  // this command does not effect sgr toggles
  h._parseNamedSequence(0, `SGR+1`)
  t.equal(
    domObject.html,
    ``,
    `DOM Object should remain empty while row is 1 or below`
  )
  h._parseNamedSequence(2, `SGR+1`)
  t.equal(
    domObject.html,
    `</i><i class="SGR137 SGR40">`,
    `DOM Object should contain an open <i> element`
  )
  h._parseNamedSequence(2, `SGR+2+5`)
  t.equal(
    domObject.html,
    `</i><i class="SGR137 SGR40"></i><i class="SGR137 SGR40 SGR2 SGR5">`,
    `DOM Object should contain a closed and opened <i> elements`
  )
})

QUnit.test(`Markup._parseNamedSequence() ED+`, (t) => {
  const h = new Markup()
  h._parseNamedSequence(0, `ED+0`)
  t.deepEqual(cursor.eraseLines, [], `Should have no effect`)
  h._parseNamedSequence(0, `ED+1`)
  t.deepEqual(cursor.eraseLines, [], `Should not erase any rows`)
  h._parseNamedSequence(0, `ED+2`)
  t.deepEqual(cursor.eraseLines, [], `Should not erase any rows`)
  cursor.row = 2
  cursor.column = 2
  h._parseNamedSequence(0, `ED+1`)
  t.deepEqual(cursor.eraseLines, [0, 1], `Should hide 2 rows`)
  h._parseNamedSequence(0, `ED+2`)
  t.deepEqual(cursor.eraseLines, [0, 1], `Should hide 2 rows`)
  cursor.row = 999
  h._parseNamedSequence(0, `ED+1`)
  t.equal(cursor.eraseLines.length, 999, `Should hide 999 rows`)
})

QUnit.test(`Markup._parseNamedSequence() EL+`, (t) => {
  const h = new Markup()
  h._parseNamedSequence(0, `EL+0`)
  t.deepEqual(cursor.eraseLines, [], `Should have no effect`)
  cursor.row = 0
  h._parseNamedSequence(0, `EL+1`)
  t.deepEqual(cursor.eraseLines, [], `Should have no effect`)
  h._parseNamedSequence(0, `EL+2`)
  t.deepEqual(cursor.eraseLines, [], `Should have no effect`)
  cursor.row = 1
  h._parseNamedSequence(0, `EL+2`)
  t.deepEqual(cursor.eraseLines, [0], `Should remove the first line`)
  cursor.row = 3
  h._parseNamedSequence(0, `EL+2`)
  t.deepEqual(cursor.eraseLines, [0, 2], `Should remove the 1st & 3rd line`)
  cursor.row = 4
  h._parseNamedSequence(0, `EL+2`)
  t.deepEqual(
    cursor.eraseLines,
    [0, 2, 3],
    `Should remove the 1st, 3rd and 4th line`
  )
})

QUnit.test(`Markup._parseNamedSequence() SM+`, (t) => {
  const h = new Markup()
  h._parseNamedSequence(0, `SM+0`)
  t.strictEqual(h.colorDepth, 1, `1-bit color should be triggered`)
  t.strictEqual(h.font, 12, `MDA font 80×25 #12 should be triggered`)
  t.strictEqual(h.maxColumns, 40, `40 column row limit should be triggered`)
  h._parseNamedSequence(0, `SM+5`)
  t.strictEqual(h.colorDepth, 0, `4-bit monochrome color should be triggered`)
  t.strictEqual(h.font, 12, `MDA font 80×25 #12 should be triggered`)
  h._parseNamedSequence(0, `SM+18`)
  t.strictEqual(h.colorDepth, 4, `4-bit color should be triggered`)
  t.strictEqual(h.font, 17, `VGA font #17 should be triggered`)
})

QUnit.test(`Markup._parseNamedSetMode()`, (t) => {
  const h = new Markup()
  h._parseNamedSetMode(0)
  t.strictEqual(h.colorDepth, 1, `1-bit color should be triggered`)
  t.strictEqual(h.font, 12, `MDA font 80×25 #12 should be triggered`)
  t.strictEqual(h.maxColumns, 40, `40 column row limit should be triggered`)
  h._parseNamedSetMode(5)
  t.strictEqual(h.colorDepth, 0, `4-bit monochrome color should be triggered`)
  t.strictEqual(h.font, 12, `MDA font 80×25 #12 should be triggered`)
  h._parseNamedSetMode(18)
  t.strictEqual(h.colorDepth, 4, `4-bit color should be triggered`)
  t.strictEqual(h.font, 17, `VGA font #17 should be triggered`)
})

const testSpecial = new Map()
  .set(` `, ` `)
  .set(`⮚`, `&gt;`)
  .set(`⮘`, `&lt;`)
  .set(`⮙`, `&amp;`)
  .set(`\n`, `lf`)

QUnit.test(`Markup._specialMarker()`, (t) => {
  for (const [item, result] of testSpecial.entries()) {
    const h = new Markup()
    domObject.html = ``
    t.equal(`${h._specialMarker(item)}`, result, `'${item}' ${result}`)
  }
})

QUnit.test(`Metadata.parse()`, (t) => {
  const data = {
    version: `00`,
    configs: { fontFamily: `vga8`, width: 100, iceColors: 1 },
  }
  const m = new Metadata(data)
  m.parse()
  t.equal(m.font, `vga8`, `Font family VGA8 should be stored`)
  t.strictEqual(cursor.maxColumns, 100, `The SAUCE width should be stored`)
  t.equal(ecma48.iceColors, true, `iCE Colors should be flagged`)
  data.configs.iceColors = `0`
  m.parse()
  t.equal(ecma48.iceColors, false, `iCE Colors should not be flagged`)
})

QUnit.test(`Scan.controlCode()`, (t) => {
  // Initialise the test of controlCode()
  // @values Array of text characters represented in Unicode decimal values
  const run = (values = []) => {
    // reset array to the sample code
    let a = sample
    // inject expected Control Sequence Initiator and null into sample value
    values.unshift(859291, null)
    // merge CSI and sample value into sample code
    a = values.concat(a)
    const build = new Build()
    // run sample in function for unit testing
    input = build.controlCode(0, a)
  }

  // set a random string encoded in Unicode decimal to use as a sample base
  const sample = [
    48,
    59,
    51,
    52,
    109,
    9556,
    9552,
    9552,
    51,
    72,
    null,
    32,
    32,
    32,
    9553,
    32,
    9484,
  ]
  const reply = `controlCode should return`
  let input = ``
  // CU* [1-9]
  run([65])
  t.equal(input, `CUU,1,1`, `${reply} cursor up`)
  run([66])
  t.equal(input, `CUD,1,1`, `${reply} cursor down`)
  run([67])
  t.equal(input, `CUF,1,1`, `${reply} cursor forward`)
  run([68])
  t.equal(input, `CUB,1,1`, `${reply} cursor back`)
  run([53, 65])
  t.equal(input, `CUU,2,5`, `${reply} cursor up 5`)
  run([57, 54, 67])
  t.equal(input, `CUF,3,96`, `${reply} cursor forward 96`)
  run([52, 56, 53, 66]) // 485f
  t.equal(input, `CUD,4,485`, `${reply} cursor down 485`)
  run([52, 56, 53, 48, 66]) // 4850f
  t.equal(input, `CUD,5,4850`, `${reply} cursor down 4850`)
  run([48, 66])
  t.equal(input, `CUD,2,0`, `0 value ${reply} cursor down 0`)
  // HVP [10-18]
  run([72])
  t.equal(input, `HVP,1,1,1`, `'H' ${reply} cursor position row = 1, col = 1`)
  run([49, 56, 59, 72])
  t.equal(
    input,
    `HVP,4,18,1`,
    `'18;H' ${reply} cursor position row = 18, col = 1`
  )
  run([49, 56, 72])
  t.equal(
    input,
    `HVP,3,18,1`,
    `'18H' ${reply} cursor position row = 18, col = 1`
  )
  run([49, 56, 59, 49, 72])
  t.equal(
    input,
    `HVP,5,18,1`,
    `'18;1H' ${reply} cursor position row = 18, col = 1`
  )
  run([59, 72])
  t.equal(input, `HVP,2,1,1`, `';H' ${reply} cursor position row = 1, col = 1`)
  run([59, 49, 56, 72])
  t.equal(
    input,
    `HVP,4,1,18`,
    `';18H' ${reply} cursor position row = 1, col = 18`
  )
  run([49, 59, 49, 56, 72])
  t.equal(
    input,
    `HVP,5,1,18`,
    `'1;18H' ${reply} cursor position row = 1, col = 18`
  )
  run([49, 48, 48, 48, 72])
  t.equal(
    input,
    `HVP,5,1000,1`,
    `'1000H' ${reply} cursor position row = 1000, col = 1`
  )
  // CUP [18-19]
  run([102])
  t.equal(input, `HVP,1,1,1`, `'f' ${reply} cursor position row = 1, col = 1`)
  run([49, 48, 48, 48, 102])
  t.equal(
    input,
    `HVP,5,1000,1`,
    `'f' ${reply} cursor position row = 1000, col = 79`
  )
  //return
  // ED [20-23]
  run([74])
  t.equal(input, `ED,1,0`, `'J' should clear the cursor to the end of the row`)
  run([48, 74])
  t.equal(input, `ED,2,0`, `'J' should clear the cursor to the end of the row`)
  run([49, 74])
  t.equal(
    input,
    `ED,2,1`,
    `'J' should clear the cursor to the beginning of the display`
  )
  run([50, 74])
  t.equal(input, `ED,2,2`, `'J' should clear the entire display`)
  // EL [24-30]
  run([75])
  t.equal(input, `EL,1,0`, `'K' should clear the cursor to the end of the line`)
  run([48, 75])
  t.equal(input, `EL,2,0`, `'K' should clear the cursor to the end of the line`)
  run([49, 75])
  t.equal(
    input,
    `EL,2,1`,
    `'K' should clear the cursor to the beginning of the line`
  )
  run([50, 75])
  t.equal(input, `EL,2,2`, `'K' should clear the entire line`)
  // DSR
  run([54, 110])
  t.equal(input, ``, `'6n' is ignored`)
  // SCP
  run([115])
  t.equal(input, `SCP,1`, `'s' should save the current cursor position`)
  // RCP
  run([117])
  t.equal(input, `RCP,1`, `'u' should restore the current cursor position`)
  // SGR [31-39]
  run([109])
  t.equal(
    input,
    `SGR,1,0`,
    `controlCode 'm' should reset text rendition attributes`
  )
  run([48, 109])
  t.equal(
    input,
    `SGR,2,0`,
    `controlCode '0m' should reset text rendition attributes`
  )
  run([49, 109])
  t.equal(
    input,
    `SGR,2,1`,
    `controlCode '1m' should set bold text rendition attributes`
  )
  run([51, 49, 109])
  t.equal(
    input,
    `SGR,3,31`,
    `controlCode '31m' should set text foreground colour attribute`
  )
  run([52, 55, 109])
  t.equal(
    input,
    `SGR,3,47`,
    `'47m' should set text background colour attribute`
  )
  run([52, 55, 59, 51, 49, 109])
  t.equal(
    input,
    `SGR,6,47,31`,
    `controlCode '47;31m' should set text background and foreground colour attributes`
  )
  run([51, 49, 59, 52, 55, 109])
  t.equal(
    input,
    `SGR,6,31,47`,
    `controlCode '31;47m' should set text background and foreground colour attributes`
  )
  run([48, 59, 51, 49, 59, 52, 55, 109])
  t.equal(
    input,
    `SGR,8,0,31,47`,
    `controlCode '0;31;47m' should reset text attributes then set background and foreground colours`
  )
  run([48, 59, 49, 59, 51, 49, 59, 52, 55, 109])
  t.equal(
    input,
    `SGR,10,0,1,31,47`,
    `controlCode '0;1;31;47m' should reset text attributes then set bold, background and foreground colours`
  )
  // SM [40-]
  run([104])
  t.equal(input, ``, `controlCode 'h' should fail`)
  run([63, 104])
  t.equal(input, ``, `controlCode '?h' should fail`)
  run([63, 57, 48, 104])
  t.equal(input, ``, `controlCode '?90h' should fail`)
  run([63, 48, 104])
  t.equal(input, `SM,3,0`, `'?0h' should set screen mode to 0`)
  run([63, 49, 51, 104])
  t.equal(input, `SM,4,13`, `controlCode '?13h' should set screen mode to 13`)
  run([48, 104])
  t.equal(input, `SM,2,0`, `controlCode '0h' should set screen mode to 0`)
  run([49, 51, 104])
  t.equal(input, `SM,3,13`, `controlCode '13h' should set screen mode to 13`)
  // RM
  run([63, 49, 51, 108])
  t.equal(input, `RM,4,13`, `controlCode '?13l should reset screen mode to 13`)
  // non-standard
  run([48, 113])
  t.equal(
    input,
    `/x,2,0`,
    `controlCode '0q' should disable extended keyboard support`
  )
  run([49, 113])
  t.equal(
    input,
    `/x,2,1`,
    `controlCode '1q' should enable extended keyboard support`
  )
})

const testFuncs = new Map()
  .set([`CUP`, `?`, 20, 5], `HVP+20+5`)
  .set([`HVP`, `?`, 12, 12], `HVP+12+12`)
  .set([`CUD`, `?`, 1], `CUD+1`)
  .set([`CUD`, `?`, 5], `CUD+5`)
  .set([`CUF`, `?`, 1], `CUF+1`)
  .set([`CUF`, `?`, 3], `CUF+3`)
  .set([`DSR`, 1], ``)
  .set([`ED`, `?`, 0], `ED+0`)
  .set([`ED`, `?`, 1], `ED+1`)
  .set([`ED`, `?`, 2], `ED+2`)
  .set([`EL`, `?`, 0], `EL+0`)
  .set([`EL`, `?`, 1], `EL+1`)
  .set([`EL`, `?`, 2], `EL+2`)

QUnit.test(`Scan.functions()`, (t) => {
  for (const [test, result] of testFuncs.entries()) {
    const s = new Scan()
    t.equal(
      s._functionsForArray(test),
      result,
      `[${test}] should return "${result}"`
    )
  }
})

const testFfa = new Map()
  .set([`CUP`, `?`, 20, 5], `HVP+20+5`)
  .set([`CUP`, `?`, `20`, `5`], `HVP+20+5`)
  .set([`HVP`, `?`, `12`, `12`], `HVP+12+12`)
  .set([`SGR`, `3`, `23`], `SGR+23`)
  .set([`EL`, `2`, `0`], `EL+0`)
  .set([`SGR`, `7`, `0`, `1`, `31`], `SGR+0+1+31`)
  .set([`RGB`, `8`, `2`, `0`, `0`, `0`], `SGR+38+2+0+0+0`)
  .set([`RGB`, `8`, `2`, `255`, `0`, `0`], `SGR+38+2+255+0+0`)
  // not supported
  .set([`CUU`, `5`, `152`], ``)
  .set([`CUB`, `5`, `5`], ``)
  .set([], ``)

QUnit.test(`Scan._functionsForArray()`, (t) => {
  for (const [test, result] of testFfa.entries()) {
    const s = new Scan()
    t.equal(
      s._functionsForArray(test),
      result,
      `[${test}] should return "${result}"`
    )
  }
})

const testChrAttr = new Map()
  .set(`Hello world.`, ``)
  .set(`39m;0;1;36m`, `SGR,10,39,0,1,36`)
  .set(`0m`, `SGR,2,0`)

QUnit.test(`Scan._characterAttributes()`, (t) => {
  const input = (text) => {
    const b = new Build(`${text}`)
    return b._decimals()
  }

  for (const [test, result] of testChrAttr.entries()) {
    const s = new Scan()
    const cp = input(test)
    t.equal(
      s._characterAttributes(0, cp, cp.length),
      result,
      `\`${test}\` should return "${result}"`
    )
  }
})

const testCursorC = new Map()
  .set(-1, false)
  .set(0, false)
  .set(65, true)
  .set(68, true)
  .set(69, false)

QUnit.test(`Scan._cursorCode()`, (t) => {
  for (const [test, result] of testCursorC.entries()) {
    const s = new Scan()
    t.equal(s._cursorCode(test), result, `[${test}] should return "${result}"`)
  }
})

const testCursorM = new Map()
  .set([65, [0]], `CUU,1,1`)
  .set([67, [49]], `CUF,2,1`)
  .set([67, [49, 54]], `CUF,3,16`)
  .set([65, [49, 48]], `CUU,3,10`)
  .set([66, [49, 48]], `CUD,3,10`)
  .set([67, [49, 48]], `CUF,3,10`)
  .set([68, [49, 48]], `CUB,3,10`)
  .set([68, [49, 48, 48]], `CUB,4,100`)
  .set([68, [49, 48, 48, 48]], `CUB,5,1000`)
  .set([68, [49, 48, 48, 48, 48]], `CUB,6,10000`)
  // invalid inputs
  .set([64, [0]], ``)
  .set([65, [64]], `CUU,2,@`)

QUnit.test(`Scan._cursorMove()`, (t) => {
  for (const [test, result] of testCursorM.entries()) {
    const s = new Scan()
    t.equal(
      s._cursorMove(test[0], test[1]),
      result,
      `[${test}] should return "${result}"`
    )
  }
})

const testCursorH = new Map()
  .set(-1, ``)
  .set(0, ``)
  .set(65, `up`)
  .set(68, `left`)
  .set(69, ``)

QUnit.test(`Scan._cursorHuman()`, (t) => {
  for (const [test, result] of testCursorH.entries()) {
    const s = new Scan()
    t.equal(s._cursorHuman(test), result, `[${test}] should return "${result}"`)
  }
})

const testCursorN = new Map()
  .set(-1, ``)
  .set(0, ``)
  .set(65, `CUU`)
  .set(68, `CUB`)
  .set(69, ``)

QUnit.test(`Scan._cursorName()`, (t) => {
  for (const [test, result] of testCursorN.entries()) {
    const s = new Scan()
    t.equal(s._cursorName(test), result, `[${test}] should return "${result}"`)
  }
})

const testDigit = new Map()
  .set(-1, false)
  .set(0, false)
  .set(47, false)
  .set(48, true)
  .set(57, true)
  .set(58, false)

QUnit.test(`Scan._digit()`, (t) => {
  for (const [test, result] of testDigit.entries()) {
    const s = new Scan()
    t.equal(s._digit(test), result, `[${test}] should return "${result}"`)
  }
})

const testCursorHVP = new Map()
  .set([], `HVP,1,1,1`)
  .set([51, 53, 59, 54, 50], `HVP,6,35,62`)
  .set([51, 49, 59], `HVP,4,31,1`)
  .set([55, 59], `HVP,3,7,1`)

QUnit.test(`Scan._cursorHVP()`, (t) => {
  for (const [test, result] of testCursorHVP.entries()) {
    const s = new Scan()
    t.equal(s._cursorHVP(test), result, `[${test}] should return "${result}"`)
  }
})

const testPabloDraw = new Map()
  .set(
    [49, 59, 50, 52, 53, 59, 49, 55, 54, 59, 50, 53, 53, 116],
    `RGB,14,1,245,176,255`
  )
  .set(
    [49, 59, 50, 53, 53, 59, 49, 48, 50, 59, 49, 48, 54, 116],
    `RGB,14,1,255,102,106`
  )
  .set([49, 59, 49, 57, 49, 59, 48, 59, 53, 116], `RGB,10,1,191,0,5`)
  .set([49, 59, 49, 57, 49, 59, 48, 59, 53, 116, -1], `RGB,10,1,191,0,5`)
  // pass an invalid RGB value of (1,591,0)
  .set([49, 59, 49, 57, 49, 116, 48, 59, 53, 116], ``)

QUnit.test(`Scan._pabloDrawRGB()`, (t) => {
  for (const [test, result] of testPabloDraw.entries()) {
    const s = new Scan()
    t.equal(
      s._pabloDrawRGB(test),
      result,
      `[${test}] should return "${result}"`
    )
  }
})

const testSM = new Map()
  .set([0, [0, 0], true], ``)
  // set mode
  .set([104, [49], true], `SM,3,1`)
  .set([104, [55], true], `SM,3,7`)
  .set([104, [49, 56], true], `SM,4,18`)
  // remove mode
  .set([108, [49], false], `RM,2,1`)
  .set([108, [55], false], `RM,2,7`)
  .set([108, [49, 53], false], `RM,3,15`)
  // invalid modes (values do not matter)
  .set([104, [55, 88], true], `SM,4,7X`)

QUnit.test(`Scan._setMode()`, (t) => {
  for (const [test, result] of testSM.entries()) {
    const s = new Scan()
    t.equal(
      s._setMode(test[0], test[1], test[2]),
      result,
      `[${test}] should return "${result}"`
    )
  }
})

const testAOT = new Map()
  // test strings
  .set(``, [])
  .set(`abc`, [`a`, `b`, `c`])
  .set(`098`, [`0`, `9`, `8`])
  // test controls
  .set(`←[0;30;47m`, [`SGR+0+30+47`])
  .set(`←[>0h←[0m`, [`SM+0`, `SGR+0`])
  .set(`←[1;255;155;157tABC←[0;1;45;35mXYZ`, [
    `SGR+38+2+255+155+157`,
    `A`,
    `B`,
    `C`,
    `SGR+0+1+45+35`,
    `X`,
    `Y`,
    `Z`,
  ])
  // test MSDOS end of file
  .set(`abc→`, [`a`, `b`, `c`, `SGR+0`])

QUnit.test(`Build.arrayOfText()`, (t) => {
  for (const [test, result] of testAOT.entries()) {
    const b = new Build(test)
    t.deepEqual(b.arrayOfText(), result, `"${test}" should return [${result}]`)
  }
})

const testDec = new Map()
  .set(``, [])
  .set(`abc`, [97, 98, 99])
  .set(`\r\n`, [13, 10])
  .set(`098`, [48, 57, 56])
  .set(`←[0;30;47m`, [155, -1, 48, 59, 51, 48, 59, 52, 55, 109])

QUnit.test(`Build._decimals()`, (t) => {
  for (const [test, result] of testDec.entries()) {
    const b = new Build(test)
    t.deepEqual(b._decimals(), result, `"${test}" should return [${result}]`)
  }
})
