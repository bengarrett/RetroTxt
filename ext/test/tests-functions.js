/* eslint-env qunit:true */
/*global QUnit C0Controls Cs PCBoardText PlainText WildcatText
  Capitalize Titleize*/
"use strict"

QUnit.module(`functions.js`, {
  before: () => {
    // prepare something once for all tests
    console.info(`☑ New QUnit functions.js test`)
  },
  beforeEach: () => {
    // prepare something before each test
  },
  afterEach: () => {
    // clean up after each test
  },
  after: () => {
    // clean up once after all tests are done
    console.info(`☑ QUnit functions.js tests are complete`)
  },
})

const parser = new DOMParser()
let extensionId = null

QUnit.test(`CheckArguments() functions`, (assert) => {
  let error = CheckArguments(`test boolean`, `boolean`, `null`)
  assert.equal(
    error,
    `argument 'test boolean' should be a 'boolean' (true|false) instead of a 'string'`,
    `Should return an error string`
  )
  error = CheckArguments(
    `test default`,
    `got something`,
    `expected something else`
  )
  assert.equal(
    error,
    `argument 'test default' needs to be a 'got something' instead of a 'string'`,
    `Should return an error string`
  )
  error = CheckRange(`test length`, `length`, 1111, 0)
  assert.equal(
    error,
    `the number of characters '0' used for the argument 'test length' is too short, it needs to be at least '1111' characters`,
    `Should return an error string`
  )
  error = CheckRange(`test small`, `small`, 1111, 0)
  assert.equal(
    error,
    `the value '0' for the argument 'test small' is too small, it needs to be at least '1111' or greater`,
    `Should return an error string`
  )
})

QUnit.test(`C0Controls() class`, (assert) => {
  let c0controls = new C0Controls(`A`)
  assert.equal(c0controls.special(), false, `A is not a C0 character`)
  c0controls = new C0Controls(`${String.fromCharCode(9)}`)
  assert.equal(
    c0controls.special(),
    true,
    `horizontal tab (9) is a C0 character`
  )
})

QUnit.test(`BrowserEncodings() class`, (assert) => {
  let encoding = new BrowserEncodings(`UTF-32`)
  assert.equal(encoding.support(), false, `UTF-32 is unsupported`)
  assert.equal(encoding.label(), undefined, `UTF-32 is unsupported`)
  encoding = new BrowserEncodings(`SHIFT_JIS`)
  assert.equal(encoding.support(), true, `Shift_JIS is supported`)
  assert.equal(encoding.label(), Cs.Shift_JIS, `Shift_JIS is supported`)
  assert.equal(
    encoding.compactEncoding(),
    `SHIFT_JIS`,
    `Shift_JIS compressed should remain the same`
  )
  encoding = new BrowserEncodings(`Windows-1252`)
  assert.equal(
    encoding.compactEncoding(),
    `CP1252`,
    `Windows-1252 compressed is CP1252`
  )
})

QUnit.test(`Characters() class`, (assert) => {
  let characters = new Characters(Cs.DOS_437_English)
  assert.equal(
    characters.key,
    Cs.DOS_437_English,
    `DOS_437_English key should be DOS_437_English`
  )
  assert.equal(
    characters.encoding,
    undefined,
    `DOS_437_English encoding is not supported`
  )
  assert.equal(
    characters.label[0],
    `Code Page 437`,
    `DOS_437_English formal should be Code Page 437`
  )
  assert.equal(
    characters.label[1],
    `MS-DOS Latin`,
    `DOS_437_English informal should be MS-DOS Latin`
  )
  characters = new Characters(Cs.OutputUS_ASCII)
  assert.equal(
    characters.key,
    Cs.OutputUS_ASCII,
    `OutputUS_ASCII key should be OutputUS_ASCII`
  )
  assert.equal(
    characters.encoding,
    undefined,
    `OutputUS_ASCII encoding is not supported`
  )
  assert.equal(
    characters.label[0],
    `US-ASCII`,
    `OutputUS_ASCII formal should be US-ASCII`
  )
  assert.equal(
    characters.label[1].slice(-6),
    `ECMA-6`,
    `OutputUS_ASCII informal should contain ECMA-6`
  )

  characters = new Characters(`utf_32`)
  assert.equal(characters.support(), false, `utf_32 is unsupported`)
  characters = new Characters(Cs.UnicodeStandard)
  assert.equal(characters.support(), true, `UnicodeStandard is supported`)
  characters = new Characters(`UTF-32`)
  assert.equal(characters.supportedEncoding(), false, `UTF-32 is unsupported`)
  characters = new Characters(`UTF-8`)
  assert.equal(characters.supportedEncoding(), true, `UTF-8 is supported`)
  characters = new Characters(`utf_32`)
  assert.equal(characters._getLabel(), `?`, `UTF-32 is unsupported`)
  characters = new Characters(Cs.UnicodeStandard)
  assert.equal(
    characters._getLabel(),
    `UTF 8-bit: Unicode Transformation Format`,
    `UTF-8 is supported`
  )
  characters = new Characters(`UTF-32`)
  assert.equal(characters.getEncoding(), undefined, `UTF-32 is unsupported`)
  characters = new Characters(`UTF-8`)
  assert.equal(
    characters.getEncoding(),
    Cs.UnicodeStandard,
    `UTF-8 is supported`
  )
  characters = new Characters(`UTF-8`)
  assert.equal(characters.compactIn(), `UTF8`, `UTF-8 is supported`)
  characters = new Characters(`SHIFT_JIS`)
  assert.equal(characters.compactIn(), `Shift JIS`, `Shift_JIS is supported`)
  characters = new Characters(`MACINTOSH`)
  assert.equal(characters.compactIn(), `Mac OS Roman`, `MACINTOSH is supported`)
  characters = new Characters(Cs.UnicodeStandard)
  assert.equal(characters.compactOut(), `UTF8`, `UTF-8 is unsupported`)
  characters = new Characters(Cs.OutputUS_ASCII)
  assert.equal(
    characters.compactOut(),
    `USASCII`,
    `OutputUS_ASCII is supported`
  )
  characters = new Characters(Cs.OutputUS_ASCII)
  assert.equal(
    characters.titleOut().slice(-7),
    `Unicode`,
    `OutputUS_ASCII is supported`
  )
  characters = new Characters(`utf_32`)
  assert.equal(characters.titleIn().slice(-1), `?`, `UTF-32 is unsupported`)
  characters = new Characters(Cs.UnicodeStandard)
  assert.equal(
    characters.titleIn().slice(0, 17),
    `Document encoding`,
    `UTF-8 is supported`
  )
})

QUnit.test(`Guess() class`, (assert) => {
  let hi = `hello`,
    test = `\u00ef\u00bb\u00bf` + hi,
    guess = new Guess(test)
  assert.equal(guess.byteOrderMark(test), `UTF-8`, `Test string has a BOM`)
  test = `\u00ff\u00fe` + hi
  guess = new Guess(test)
  assert.equal(
    guess.byteOrderMark(test),
    `UTF-16, little endian`,
    `Test string has a BOM`
  )
  test = `\u00fe\u00ff` + hi
  guess = new Guess(test)
  assert.equal(
    guess.byteOrderMark(test),
    `UTF-16, big endian`,
    `Test string has a BOM`
  )
  test = `€99,95 on sale™`
  guess = new Guess(test)
  let div = document.createElement(`div`)
  div.append(`div`)
  assert.equal(
    guess._characterSet(),
    Cs.OutputUS_ASCII,
    `Result should be us_ascii`
  )
  assert.equal(
    guess._decimalSet(Array.from(test))[0],
    8364,
    `Result should be an array with numbers`
  )
  test = `Linux®`
  guess = new Guess(test)
  assert.equal(
    guess._characterSet(),
    `utf_8➡`,
    `Result should be UnicodeStandard`
  )
  div = document.createElement(`div`)
  div.append(`${test}`)
  assert.equal(
    guess.codePage(`utf_8➡`, div),
    `utf_8➡`,
    `Result should be UnicodeStandard`
  )
  assert.equal(
    guess._decimalSet(Array.from(test))[0],
    76,
    `Result should be an array with numbers`
  )
  guess = new Guess(`Hello ♕ world`)
  let result = guess._characterSet()
  assert.equal(
    result,
    Cs.Windows_1252_English,
    `Should be \`Windows_1252_English\``
  )
  guess = new Guess(`Hello world`)
  result = guess._characterSet(`Hello world`)
  assert.equal(result, Cs.OutputISO8859_1, `Should be \`OutputISO8859_1\``)
})

QUnit.test(`Configuration() class`, (assert) => {
  const cfg = new Configuration()
  assert.equal(cfg.cssWidth(), `100%`, `Configuration should be 100%`)
  assert.equal(
    cfg._fileExtsError()[0],
    `css`,
    `Should return a matching array item`
  )
  assert.equal(
    cfg.validateFilename(`my document.pdf`),
    false,
    `A PDF document should return true`
  )
  assert.equal(
    cfg.validateFilename(`my document.txt`),
    true,
    `A text document should return false`
  )
  assert.equal(
    cfg.validateFilename(`.index.js`),
    false,
    `A hidden JS file document should return true`
  )

  assert.equal(
    cfg.validateDomain(`defacto2.net`),
    false,
    `The domain should be false`
  )
  assert.equal(
    cfg.validateDomain(`feedly.com`),
    true,
    `The domain should be true`
  )
})

QUnit.test(`Font() class`, (assert) => {
  const fonts = new FontFamily(`appleii`)
  fonts.set()
  assert.equal(fonts.family, `Apple II`, `Font name should be Apple II`)
  fonts.key = `bios-2y`
  fonts.set()
  assert.equal(
    fonts.family,
    `BIOS (narrow)`,
    `Font name should be BIOS (narrow)`
  )
  fonts.key = `error`
  fonts.set()
  assert.equal(fonts.family, `ERROR`, `Invalid font name should return in caps`)
})

QUnit.test(`OptionsReset() class`, (assert) => {
  const ro = new OptionsReset()
  assert.equal(
    ro.get(`textBackgroundScanlines`),
    false,
    `Default value should be false`
  )
  assert.equal(
    ro.get(`colorsCustomBackground`),
    `#3f3f3f`,
    `Default value should be #3f3f3f`
  )
  assert.equal(
    ro.get(`settingsWebsiteDomains`)[0],
    `16colo.rs`,
    `Default value should be 16colo.rs`
  )
})

QUnit.test(`HardwarePalette() class`, (assert) => {
  const palette = new HardwarePalette(),
    gray = `${chrome.i18n.getMessage(`Gray`)}`

  assert.equal(palette.next(`IBM`), `XTerm`, `Next theme should be xterm`)
  assert.equal(palette.next(gray), `IBM`, `Next theme should reset to IBM`)
  assert.equal(palette.next(``), ``, `Next theme should fail`)
  assert.equal(palette.next(`error`), ``, `Next theme should fail`)
  palette.key = `CGA 0`
  assert.equal(palette.set(), true, `New theme should be saved`)
  assert.equal(palette.saved(), `CGA 0`, `Saved theme should be set to CGA 0`)
  assert.equal(
    palette.next(palette.saved()),
    `CGA 1`,
    `Next theme should be CGA 1`
  )

  palette.key = `IBM`
  palette.get()
  assert.equal(palette.filename, `vga`, `Get theme should be vga`)

  assert.equal(
    palette.savedFilename(),
    `../css/text_colors_cga_0.css`,
    `Example filename is incorrect`
  )
})

QUnit.test(`CreateLink() function`, (assert) => {
  function css(then, expected) {
    assert.equal(CreateLink(`test.css`, then), expected)
  }
  let linkElement =
      `<link id="dummyId" href="chrome-extension://` +
      extensionId +
      `/test.css" type="text/css" rel="stylesheet"></link>`,
    doc = parser.parseFromString(linkElement, `text/html`), // parse the tag into a HTML document
    link = doc.getElementsByTagName(`link`)[0].toString() // get the tag object from document and convert it to a string for testing
  css(`dummyId`, link, `TODO`)
  linkElement =
    `<link href="chrome-extension://` +
    extensionId +
    `/test.css" type="text/css" rel="stylesheet"></link>`
  doc = parser.parseFromString(linkElement, `text/html`)
  link = doc.getElementsByTagName(`link`)[0].toString()
})

QUnit.test(`FindControlSequences() function`, (assert) => {
  let content = FindControlSequences(`Hello world`)
  assert.equal(content, PlainText, `Should be \`plain\` text`)
  content = FindControlSequences(`@X17Hello world`)
  assert.equal(content, PCBoardText, `Should be \`pcboard\` text`)
  content = FindControlSequences(`@17@Hello world`)
  assert.equal(content, WildcatText, `Should be \`wildcat\` text`)
})

QUnit.test(`WebBrowser() function`, (assert) => {
  // use an alternative method of detecting browser engine
  // this may not work in future browser updates
  let engine = 0
  if (typeof browser !== `undefined`) {
    engine = 1
  }
  const browsergetBrowserEngine = WebBrowser()
  if (engine === 0)
    assert.equal(
      browsergetBrowserEngine,
      0,
      `Should return \`0\` if you're using a Chrome or Edge browser`
    )
  else if (engine === 1)
    assert.equal(
      browsergetBrowserEngine,
      1,
      `Should return \`1\` if you're using a Firefox browser`
    )
})

QUnit.test(`HumaniseFS() function`, (assert) => {
  let filesize = HumaniseFS()
  assert.equal(filesize, `0B`, `Should be 0 bytes`)
  filesize = HumaniseFS(10000)
  assert.equal(filesize, `9.8KiB`, `Should be 9.8KiB`)
  filesize = HumaniseFS(100000000)
  assert.equal(filesize, `95MiB`, `Should be 95MiB`)
  filesize = HumaniseFS(123456789.9)
  assert.equal(filesize, `118MiB`, `Should be 118MiB`)
  filesize = HumaniseFS(10000, 1000)
  assert.equal(filesize, `10kB`, `Should be 10kB`)
  filesize = HumaniseFS(100000000, 1000)
  assert.equal(filesize, `100MB`, `Should be 100MB`)
  filesize = HumaniseFS(123456789.9, 1000)
  assert.equal(filesize, `124MB`, `Should be 124MB`)
})

QUnit.test(`ParseToChildren() function`, (assert) => {
  const children = ParseToChildren(`Hello world`)
  assert.equal(children.nodeName, `DIV`, `Should return a <div> pair with text`)
  assert.equal(
    children.textContent,
    `Hello world`,
    `Should return a <div> pair with text`
  )
})

QUnit.test(`StringToBool() function`, (assert) => {
  let boolean = StringToBool(`error`)
  assert.equal(boolean, null, `'error' is not a valid boolean`)
  boolean = StringToBool(`true`)
  assert.equal(boolean, true, `'true' is a boolean`)
  boolean = StringToBool(1)
  assert.equal(boolean, true, `'true' is a boolean`)
  boolean = StringToBool(0)
  assert.equal(boolean, false, `'false' is a boolean`)
  boolean = StringToBool(`off`)
  assert.equal(boolean, false, `'false' is a boolean`)
})

QUnit.test(`Capitalize() function`, (assert) => {
  let word = Capitalize()
  assert.equal(word, ``, `Should be an empty string`)
  word = Capitalize(`hi`)
  assert.equal(word, `Hi`, `Should be Hi`)
  word = Capitalize(`HI`)
  assert.equal(word, `Hi`, `Should be Hi`)
  word = Capitalize(`hello world`)
  assert.equal(word, `Hello world`, `Should be Hello world`)
  word = Capitalize(`the_quick_brown_fox`)
  assert.equal(word, `The quick brown fox`, `Should be The quick brown fox`)
})

QUnit.test(`Titleize() function`, (assert) => {
  let word = Titleize()
  assert.equal(word, ``, `Should be an empty string`)
  word = Titleize(`hi`)
  assert.equal(word, `Hi`, `Should be Hi`)
  word = Titleize(`HI`)
  assert.equal(word, `Hi`, `Should be Hi`)
  word = Titleize(`hello world`)
  assert.equal(word, `Hello World`, `Should be Hello world`)
  word = Titleize(`the_quick_brown_fox`)
  assert.equal(word, `The Quick Brown Fox`, `Should be The quick brown fox`)
  word = Titleize(`welcome to the ibm pc`)
  assert.equal(word, `Welcome To The IBM PC`, `Should be Welcome to the IBM PC`)
  word = Titleize(`welcome to the ibm pc`)
  assert.equal(word, `Welcome To The IBM PC`, `Should be Welcome to the IBM PC`)
  word = Titleize(`welcome to the ibm pc8086`)
  assert.equal(
    word,
    `Welcome To The IBM PC8086`,
    `Should be Welcome to the IBM PC8086`
  )
})
