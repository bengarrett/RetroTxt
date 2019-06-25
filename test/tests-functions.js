/* eslint-env qunit:true */
/*global C0Controls */
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
  }
})

const parser = new DOMParser()
let extensionId = null

QUnit.test(`CheckArguments() functions`, assert => {
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

QUnit.test(`C0Controls() class`, assert => {
  let c0controls = new C0Controls(`A`)
  assert.equal(c0controls.special(), false, `A is not a C0 character`)
  c0controls = new C0Controls(`${String.fromCharCode(9)}`)
  assert.equal(
    c0controls.special(),
    true,
    `horizontal tab (9) is a C0 character`
  )
})

QUnit.test(`BrowserEncodings() class`, assert => {
  let encoding = new BrowserEncodings(`UTF-32`)
  assert.equal(encoding.support(), false, `UTF-32 is unsupported`)
  assert.equal(encoding.label(), undefined, `UTF-32 is unsupported`)
  encoding = new BrowserEncodings(`SHIFT_JIS`)
  assert.equal(encoding.support(), true, `SHIFT_JIS is supported`)
  assert.equal(encoding.label(), `shift_jis`, `SHIFT_JIS is supported`)
  assert.equal(
    encoding.compactEncoding(),
    `SHIFT_JIS`,
    `SHIFT_JIS compressed should remain the same`
  )
  encoding = new BrowserEncodings(`Windows-1252`)
  assert.equal(
    encoding.compactEncoding(),
    `CP1252`,
    `Windows-1252 compressed is CP1252`
  )
})

QUnit.test(`Characters() class`, assert => {
  let characters = new Characters(`cp_437`)
  assert.equal(characters.key, `cp_437`, `cp_437 key should be cp_437`)
  assert.equal(
    characters.encoding,
    undefined,
    `cp_437 encoding is not supported`
  )
  assert.equal(
    characters.label[0],
    `Code Page 437`,
    `cp_437 formal should be Code Page 437`
  )
  assert.equal(
    characters.label[1],
    `MS-DOS Latin`,
    `cp_437 informal should be MS-DOS Latin`
  )
  characters = new Characters(`us_ascii➡`)
  assert.equal(characters.key, `us_ascii➡`, `us_ascii➡ key should be us_ascii➡`)
  assert.equal(
    characters.encoding,
    undefined,
    `us_ascii➡ encoding is not supported`
  )
  assert.equal(
    characters.label[0],
    `US-ASCII`,
    `us_ascii➡ formal should be US-ASCII`
  )
  assert.equal(
    characters.label[1].slice(-6),
    `ECMA-6`,
    `us_ascii➡ informal should contain ECMA-6`
  )

  characters = new Characters(`utf_32`)
  assert.equal(characters.support(), false, `utf_32 is unsupported`)
  characters = new Characters(`utf_8`)
  assert.equal(characters.support(), true, `utf_8 is supported`)
  characters = new Characters(`UTF-32`)
  assert.equal(characters.supportedEncoding(), false, `UTF-32 is unsupported`)
  characters = new Characters(`UTF-8`)
  assert.equal(characters.supportedEncoding(), true, `UTF-8 is supported`)
  characters = new Characters(`utf_32`)
  assert.equal(characters.getLabel(), `?`, `UTF-32 is unsupported`)
  characters = new Characters(`utf_8`)
  assert.equal(
    characters.getLabel(),
    `UTF 8-bit: Unicode Transformation Format`,
    `UTF-8 is supported`
  )
  characters = new Characters(`UTF-32`)
  assert.equal(characters.getEncoding(), undefined, `UTF-32 is unsupported`)
  characters = new Characters(`UTF-8`)
  assert.equal(characters.getEncoding(), `utf_8`, `UTF-8 is supported`)
  characters = new Characters(`UTF-8`)
  assert.equal(characters.compactIn(), `UTF8`, `UTF-8 is supported`)
  characters = new Characters(`SHIFT_JIS`)
  assert.equal(characters.compactIn(), `Shift JIS`, `SHIFT_JIS is supported`)
  characters = new Characters(`MACINTOSH`)
  assert.equal(characters.compactIn(), `Mac OS Roman`, `MACINTOSH is supported`)
  characters = new Characters(`utf_8`)
  assert.equal(characters.compactOut(), `UTF8`, `UTF-8 is unsupported`)
  characters = new Characters(`us_ascii➡`)
  assert.equal(characters.compactOut(), `USASCII`, `us_ascii➡ is supported`)
  characters = new Characters(`us_ascii➡`)
  assert.equal(
    characters.titleOut().slice(-7),
    `Unicode`,
    `us_ascii➡ is supported`
  )
  characters = new Characters(`utf_32`)
  assert.equal(characters.titleIn().slice(-1), `?`, `UTF-32 is unsupported`)
  characters = new Characters(`utf_8`)
  assert.equal(
    characters.titleIn().slice(0, 17),
    `Document encoding`,
    `UTF-8 is supported`
  )
})

QUnit.test(`Guess() class`, assert => {
  let hi = `hello`
  let test = `\u00ef\u00bb\u00bf` + hi
  let guess = new Guess(test)
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
  let divText = document.createTextNode(`${test}`)
  div.appendChild(divText)
  assert.equal(guess.characterSet(), `us_ascii➡`, `Result should be us_ascii`)
  assert.equal(
    guess.decimalSet(Array.from(test))[0],
    8364,
    `Result should be an array with numbers`
  )
  test = `Linux®`
  guess = new Guess(test)
  assert.equal(guess.characterSet(), `utf_8➡`, `Result should be utf_8`)
  div = document.createElement(`div`)
  divText = document.createTextNode(`${test}`)
  div.appendChild(divText)
  assert.equal(
    guess.codePage(`utf_8➡`, div),
    `utf_8➡`,
    `Result should be utf_8`
  )
  assert.equal(
    guess.decimalSet(Array.from(test))[0],
    76,
    `Result should be an array with numbers`
  )
  guess = new Guess(`Hello ♕ world`)
  let result = guess.characterSet()
  assert.equal(result, `cp_1252`, `Should be \`cp_1252\``)
  guess = new Guess(`Hello world`)
  result = guess.characterSet(`Hello world`)
  assert.equal(result, `iso_8859_1➡`, `Should be \`iso_8859_1➡\``)
})

QUnit.test(`Contrast() class`, assert => {
  const f3b = new Contrast(`#f3b`)
  assert.deepEqual(
    f3b.rgb(),
    [255, 51, 187],
    `Should return an array of RGB values`
  )
  assert.deepEqual(
    f3b.parseHex(),
    [255, 51, 187],
    `Should return an array of RGB values`
  )
  const ff33bb = new Contrast(`#ff33bb`)
  assert.deepEqual(
    ff33bb.rgb(),
    [255, 51, 187],
    `Should return an array of RGB values`
  )
  assert.deepEqual(
    ff33bb.parseHex(),
    [255, 51, 187],
    `Should return an array of RGB values`
  )
  const invalid = new Contrast(`#invalid`)
  assert.deepEqual(
    invalid.rgb(),
    [-1, -1, -1],
    `Should return an array of -1 values`
  )
  assert.deepEqual(
    invalid.parseHex(),
    [-1, -1, -1],
    `Should return an array of -1 values`
  )
  const rgb1 = new Contrast(`rgb(0,255,128)`)
  assert.deepEqual(
    rgb1.rgb(),
    [0, 255, 128],
    `Should return an array of RGB values`
  )
  assert.deepEqual(
    rgb1.parseRGB(),
    [0, 255, 128],
    `Should return an array of RGB values`
  )
  const rgb2 = new Contrast(`rgb(0,-255,128)`)
  assert.deepEqual(
    rgb2.rgb(),
    [-1, -1, -1],
    `Should return an array of -1 values`
  )
  assert.deepEqual(
    rgb2.parseRGB(),
    [-1, -1, -1],
    `Should return an array of -1 values`
  )
  const rgb3 = new Contrast(`invalidColorValue`)
  assert.deepEqual(
    rgb3.rgb(),
    [-1, -1, -1],
    `'invalidColorValue' should return an array of -1 values`
  )
  // css level 1
  const css1 = new Contrast(`red`)
  assert.deepEqual(
    css1.rgb(),
    [255, 0, 0],
    `'red' should return an array of RGB values`
  )
  const css1Hex = new Contrast(`#F00`)
  assert.deepEqual(
    css1Hex.rgb(),
    [255, 0, 0],
    `'red' should return an array of RGB values`
  )
  // css level 2
  const css2 = new Contrast(`lightgoldenrodyellow`)
  assert.deepEqual(
    css2.rgb(),
    [250, 250, 210],
    `'lightgoldenrodyellow' should return an array of RGB values`
  )
  const css2Hex = new Contrast(`#fafad2`)
  assert.deepEqual(
    css2Hex.rgb(),
    [250, 250, 210],
    `'lightgoldenrodyellow' should return an array of RGB values`
  )
  // css level 3
  const css3 = new Contrast(`papayawhip`)
  assert.deepEqual(
    css3.rgb(),
    [255, 239, 213],
    `'papayawhip' should return an array of RGB values`
  )
  const css3Hex = new Contrast(`#FfEfD5`)
  assert.deepEqual(
    css3Hex.rgb(),
    [255, 239, 213],
    `'papayawhip' should return an array of RGB values`
  )
  // lavender
  const lavender = new Contrast(`lavender`)
  assert.deepEqual(
    lavender.rgb(),
    [230, 230, 250],
    `'lavender' should return an array of RGB values`
  )
  // HSL with a lavender input
  const hsl1 = new Contrast(`hsl(4.71239rad, 60%, 70%)`)
  assert.deepEqual(
    hsl1.rgb(),
    [179, 133, 224],
    `HSL rad should return an array of RGB values`
  )
  const hsl2 = new Contrast(`hsl(.75turn, 60%, 70%)`)
  assert.deepEqual(
    hsl2.rgb(),
    [178, 133, 224],
    `HSL turn should return an array of RGB values`
  )
  const hsl3 = new Contrast(`hsl(270, 60%, 70%)`)
  assert.deepEqual(
    hsl3.rgb(),
    [179, 133, 224], // should be 179
    `HSL degrees should return an array of RGB values`
  )
  const hsl4 = new Contrast(`hsl(0°,0%,75%)`)
  assert.deepEqual(
    hsl4.rgb(),
    [191, 191, 191], // should be 192 * 3
    `HSL degrees should return an array of RGB values`
  )
  const hsl5 = new Contrast(`hsl(300°,100%,50%)`)
  assert.deepEqual(
    hsl5.rgb(),
    [255, 0, 254], // should be 255
    `HSL degrees should return an array of RGB values`
  )
  const hslBlack = new Contrast(`hsl(0°,0%,0%)`)
  assert.deepEqual(
    hslBlack.rgb(),
    [0, 0, 0],
    `HSL degrees should return an array of RGB values`
  )
  const hslBlack2 = new Contrast(`hsl(360°,0%,0%)`)
  assert.deepEqual(
    hslBlack2.rgb(),
    [0, 0, 0],
    `HSL degrees should return an array of RGB values`
  )
  const hslBlack3 = new Contrast(`hsl(0,0,0%)`)
  assert.deepEqual(
    hslBlack3.rgb(),
    [0, 0, 0],
    `HSL degrees should return an array of RGB values`
  )
  const bright1 = new Contrast(`#000`)
  assert.deepEqual(
    bright1.brightness(),
    0,
    `Brightness should be a value between 0 - 255`
  )
  const bright2 = new Contrast(`black`)
  assert.deepEqual(
    bright2.brightness(),
    0,
    `Brightness should be a value between 0 - 255`
  )
  const bright3 = new Contrast(`red`)
  assert.deepEqual(
    bright3.brightness(),
    76.245,
    `Brightness should be a value between 0 - 255`
  )
  const bright4 = new Contrast(`#fff`)
  assert.deepEqual(
    bright4.brightness(),
    255,
    `Brightness should be a value between 0 - 255`
  )
  const bright5 = new Contrast(`#fffff0`)
  assert.deepEqual(
    bright5.brightness(),
    253.29,
    `Brightness should be a value between 0 - 255`
  )
  const bright6 = new Contrast(`invalidvalue`)
  assert.deepEqual(
    bright6.brightness(),
    -1,
    `An invalid colour should return a brightness value of -1`
  )
  const bright7 = new Contrast(`hsl(300°,100%,50%)`)
  assert.deepEqual(
    bright7.brightness(),
    105.201,
    `Brightness should be a value between 0 - 255`
  )
  const blackVsWhite1 = new Contrast(`black`, `white`)
  assert.equal(
    blackVsWhite1.brighterTest(),
    false,
    `brighterThan should be false`
  )
  const blackVsWhite2 = new Contrast(`black`, `#fff`)
  assert.equal(
    blackVsWhite2.brighterTest(),
    false,
    `brighterThan should be false`
  )
  const blackVsWhite3 = new Contrast(`hsl(0°,0%,0%)`, `rgb(255,255,255)`)
  assert.equal(
    blackVsWhite3.brighterTest(),
    false,
    `brighterThan should be false`
  )
  const blackVsWhite4 = new Contrast(`white`, `black`)
  assert.equal(
    blackVsWhite4.brighterTest(),
    true,
    `brighterThan should be true`
  )
  const same = new Contrast(`white`, `#ffffff`)
  assert.equal(same.brighterTest(), false, `brighterThan should be false`)
  const invalidB = new Contrast(`invalid`, `#ffffff`)
  assert.equal(invalidB.brighterTest(), false, `brighterThan should be false`)
})

QUnit.test(`Configuration() class`, assert => {
  const cfg = new Configuration()
  assert.equal(cfg.cssWidth(), `100%`, `Configuration should be 100%`)
  assert.equal(
    cfg.domainsString(),
    `16colo.rs;defacto2.net;gutenberg.org;scene.org;textfiles.com;textmod.es;uncreativelabs.net`,
    `Domains are incorrect`
  )

  assert.equal(
    cfg.fileExtsError()[0],
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

QUnit.test(`Font() class`, assert => {
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

QUnit.test(`OptionsReset() class`, assert => {
  const ro = new OptionsReset()
  assert.equal(
    ro.get(`textBgScanlines`),
    false,
    `Default value should be false`
  )
  assert.equal(
    ro.get(`customBackground`),
    `#3f3f3f`,
    `Default value should be #3f3f3f`
  )
  assert.equal(
    ro.get(`runWebUrlsPermitted`)[0],
    `16colo.rs`,
    `Default value should be 16colo.rs`
  )
})

QUnit.test(`HardwarePalette() class`, assert => {
  const palette = new HardwarePalette()
  const gray = `${chrome.i18n.getMessage(`Gray`)}`

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

QUnit.test(`CreateLink() function`, assert => {
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

QUnit.test(`FindControlSequences() function`, assert => {
  let content = FindControlSequences(`Hello world`)
  assert.equal(content, `plain`, `Should be \`plain\` text`)
  content = FindControlSequences(`@X17Hello world`)
  assert.equal(content, `pcboard`, `Should be \`pcboard\` text`)
  content = FindControlSequences(`@17@Hello world`)
  assert.equal(content, `wildcat`, `Should be \`wildcat\` text`)
})

QUnit.test(`FindEngine() function`, assert => {
  // use an alternative method of detecting browser engine
  // this may not work in future browser updates
  let engine = `blink`
  if (typeof browser !== `undefined`) {
    engine = `gecko`
  }
  const browsergetBrowserEngine = FindEngine()
  if (engine === `blink`)
    assert.equal(
      browsergetBrowserEngine,
      `blink`,
      `Should return \`blink\` if you're using a Chrome or Edge browser`
    )
  else if (engine === `gecko`)
    assert.equal(
      browsergetBrowserEngine,
      `gecko`,
      `Should return \`gecko\` if you're using a Firefox browser`
    )
})

QUnit.test(`HumaniseFS() function`, assert => {
  let filesize = HumaniseFS()
  assert.equal(filesize, `0B`, `Should be 0 bytes`)
  filesize = HumaniseFS(10000)
  assert.equal(filesize, `9.8KiB`, `Should be 9.8KiB`)
  filesize = HumaniseFS(100000000)
  assert.equal(filesize, `95.4MiB`, `Should be 95.4MiB`)
  filesize = HumaniseFS(123456789.9)
  assert.equal(filesize, `117.7MiB`, `Should be 117.7MiB`)
  filesize = HumaniseFS(10000, 1000)
  assert.equal(filesize, `10kB`, `Should be 10kB`)
  filesize = HumaniseFS(100000000, 1000)
  assert.equal(filesize, `100MB`, `Should be 100MB`)
  filesize = HumaniseFS(123456789.9, 1000)
  assert.equal(filesize, `123.5MB`, `Should be 123.5MB`)
})

QUnit.test(`ParseToChildren() function`, assert => {
  const children = ParseToChildren(`Hello world`)
  assert.equal(children.nodeName, `DIV`, `Should return a <div> pair with text`)
  assert.equal(
    children.textContent,
    `Hello world`,
    `Should return a <div> pair with text`
  )
})

QUnit.test(`StringToBool() function`, assert => {
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
