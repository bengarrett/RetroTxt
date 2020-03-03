/* eslint-env qunit:true */
/*global handleMessages DOM Information Input Output */
"use strict"

QUnit.module(`retrotxt.js`, {
  before: () => {
    // prepare something once for all tests
    console.info(`☑ New QUnit retrotxt.js test`)
  },
  beforeEach: () => {
    // prepare something before each test
  },
  afterEach: () => {
    // clean up after each test
  },
  after: () => {
    // clean up once after all tests are done
    console.info(`☑ QUnit retrotxt.js tests are complete`)
  }
})

QUnit.test(`DOM() class`, assert => {
  const dom = new DOM()
  assert.equal(dom.head.nodeName, `HEAD`, `Should be a <head> element`)
  assert.equal(dom.cssLink, null, `Should be null element doesn't exist`)
  assert.equal(
    dom.storage[1],
    `customBackground`,
    `Storage item 1 should be customBackground`
  )
  dom.construct()
  assert.equal(
    dom.head.lastChild.nodeName,
    `LINK`,
    `Should be a <link> element`
  )
})

QUnit.test(`Input() class`, assert => {
  const input = new Input(`text/plain`, `Hello world.`)
  assert.equal(input.characterSet, `UTF-8`, `Document should be UYTF-8`)
  assert.equal(input.encoding, `text/plain`, `Text is text/plain`)
  assert.equal(input.format, `plain`, `Text is plain`)
  assert.equal(input.length, 12, `Text is 12 characters long`)
  assert.equal(input.BOM, ``, `Text has no BOM`)
  const bom = new Input(`text/plain`, `\u00FE\u00FF${input.text}`)
  assert.equal(bom.length, 14, `Text is 14 characters long`)
  assert.equal(bom.BOM, `UTF-16, big endian`, `Text has a  BOM`)
})

QUnit.test(`SAUCE() class`, assert => {
  let sauce = new SAUCE()
  assert.equal(sauce.configs.fontFamily, ``, `Sauce should be invalid`)
  sauce.version = `00`
  sauce.configs.fontName = `IBM VGA`
  sauce.configs.letterSpacing = `10`
  sauce.fontFamily()
  assert.equal(sauce.configs.fontFamily, `vga9`, `Font should be vga9`)
  sauce.configs.letterSpacing = `9`
  sauce.fontFamily()
  assert.equal(sauce.configs.fontFamily, `vga8`, `Font should be vga8`)
  sauce.configs.fontName = `C64 unshifted`
  sauce.fontFamily()
  assert.equal(sauce.configs.fontFamily, `c64`, `Font should be c64`)
  let clean = sauce.clean(`@#H$@i#^%`)
  assert.equal(clean, `Hi`, `Should return the word 'hi'`)
  clean = sauce.clean(`hello world.`)
  assert.equal(clean, `hello world`, `Should return the word 'hello world'`)
  sauce.input = { text: `Hello world` }
  sauce.find()
  assert.equal(sauce.positions.sauceIndex, 0, `No SAUCE data found`)
  const input = {
    text: `Cras sit amet purus urna. Phasellus in dapibus ex. Proin pretium eget leo ut gravida. Praesent egestas urna at tincidunt mollis. Vivamus nec urna lorem. Vestibulum molestie accumsan lectus, in egestas metus facilisis eget. Nam consectetur, metus et sodales aliquam, mi dui dapibus metus, non cursus libero felis ac nunc. Nulla euismod, turpis sed mollis faucibus, orci elit dapibus leo, vitae placerat diam eros sed velit. Fusce convallis, lorem ut vulputate suscipit, tortor risus rhoncus mauris, a mattis metus magna at lorem. Sed molestie velit ipsum, in vulputate metus consequat eget. Fusce quis dui lacinia, laoreet lectus et, luctus velit. Pellentesque ut nisi quis orci pulvinar placerat vel ac lorem. Maecenas finibus fermentum erat, a pulvinar augue dictum mattis. Aenean vulputate consectetur velit at dictum. Donec vehicula ante quis ante venenatis, eu ultrices lectus egestas. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae;
 COMNTAny comments go here.                                           SAUCE00Sauce title                        Sauce author        Sauce group         20161126�`
  }
  sauce = new SAUCE(input)
  assert.equal(sauce.valid(), true, `SAUCE Id exists`)
  sauce.extract()
  assert.equal(sauce.id, `SAUCE00`, `Sauce id should be 00`)
  assert.equal(sauce.title, `Sauce title`, `Sauce title`)
  assert.equal(sauce.fileSize, `�`, `Sauce filesize should be a binary value`)
  assert.equal(sauce.date, `20161126`, `Unformatted sauce date`)
  const div = sauce.divBlock()
  assert.equal(div.nodeName, `DIV`, `Should be a <div> pair`)
  assert.equal(
    div.firstChild.textContent,
    `'Sauce title'  by 'Sauce author'  of  Sauce group, dated 2016  November 26`,
    `<div> pair should contain SAUCE data`
  )
  assert.equal(
    div.firstChild.nextSibling.textContent.trim(),
    `Any comments go here.`,
    `Sauce comment`
  )
})

QUnit.test(`Output() class`, assert => {
  const input = {
    text: `Cras sit amet purus urna. Phasellus in dapibus ex. Proin pretium eget leo ut gravida. Praesent egestas urna at tincidunt mollis. Vivamus nec urna lorem. Vestibulum molestie accumsan lectus, in egestas metus facilisis eget. Nam consectetur, metus et sodales aliquam, mi dui dapibus metus, non cursus libero felis ac nunc. Nulla euismod, turpis sed mollis faucibus, orci elit dapibus leo, vitae placerat diam eros sed velit. Fusce convallis, lorem ut vulputate suscipit, tortor risus rhoncus mauris, a mattis metus magna at lorem. Sed molestie velit ipsum, in vulputate metus consequat eget. Fusce quis dui lacinia, laoreet lectus et, luctus velit. Pellentesque ut nisi quis orci pulvinar placerat vel ac lorem. Maecenas finibus fermentum erat, a pulvinar augue dictum mattis. Aenean vulputate consectetur velit at dictum. Donec vehicula ante quis ante venenatis, eu ultrices lectus egestas. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae;
 COMNTAny comments go here.                                           SAUCE00Sauce title                        Sauce author        Sauce group         20161126�`,
    characterSet: `US-ASCII`
  }
  const sauce = new SAUCE(input)
  const output = new Output(sauce)
  assert.equal(output.encode.id, `h-doc-fmt`, `Should be an element id`)
  assert.equal(
    output.newBold().nodeName,
    `STRONG`,
    `Should be an STRONG element`
  )
  assert.equal(
    output.padding(10).textContent,
    `          `,
    `Should be 10 whitespace characters`
  )
  output.cursor()
  assert.equal(output.pre.nodeName, `PRE`, `Should be an PRE element`)
  assert.equal(
    output.pre.firstChild.nodeName,
    `SPAN`,
    `Should be an SPAN element`
  )
  assert.equal(
    output.fontSize().title,
    `Font size adjustment`,
    `Should be a STRONG element`
  )
  output.data.html = `&lt;p&gt;RetroTxt runs on Chrome &amp; Firefox&lt;/p&gt;`
  output.htmlEscapes()
  assert.equal(
    output.pre.textContent,
    `<p>RetroTxt runs on Chrome & Firefox</p>`,
    `Should include unescaped <&> characters`
  )
  output.showTextFormat(input)
  assert.equal(
    output.pre.classList.contains(`text-1x`),
    true,
    `Should have class 'text-1x' class`
  )
  input.characterSet = `SHIFT_JIS`
})

QUnit.test(`Information() class`, assert => {
  const information = new Information()
  information.setMeasurements()
  assert.equal(information.area.nodeName, `SPAN`, `Should be a <span> element`)
  assert.equal(
    information.area.firstChild.nodeName,
    `SPAN`,
    `Should be a <span> element`
  )
  assert.equal(
    information.area.firstChild.title,
    `Pixel width of text`,
    `Should be a <span> element`
  )
  assert.equal(
    information.area.lastChild.nodeName,
    `SPAN`,
    `Should be a <span> element`
  )
  assert.equal(
    information.area.lastChild.title,
    `Pixel length of text`,
    `Should be a <span> element`
  )
  information.setDocumentSize()
  assert.equal(
    information.size.title,
    `Number of characters contained in the text`,
    `Should be a element title`
  )
  information.setFont(`Hello world`)
  assert.equal(
    information.font.textContent,
    `Hello world`,
    `Text content should contain a string`
  )
  assert.equal(
    information.setPalette(0).textContent,
    `monochrome`,
    `Text content should be monochrome`
  )
  assert.equal(
    information.setPalette(24).textContent,
    `RGB`,
    `Text content should be RGB`
  )
})

QUnit.test(`handleMessages() function`, assert => {
  const message = { id: `qunit` }
  assert.equal(handleMessages(message), true, `Test message should be handled`)
  message.id = `test unexpected`
  assert.equal(handleMessages(message), false, `Test message should fail`)
})
