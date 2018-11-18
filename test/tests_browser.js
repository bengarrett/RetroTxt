// filename: tests_browser.js
// QUnit in-browser tests
/* eslint-env qunit:true */
/*global Action BBS buildCSI buildDecimalArray BrowserEncodings BuildEcma48 C0Controls Contrast CursorInit DOM DOSText Downloads
findControlCode Guess handleMessages Information Input Menu Output Security SGRInit Tab Tabs ToolbarButton Transcode WebExtension*/
"use strict"

const parser = new DOMParser()
let extensionId = null

chrome.storage.local.clear(() => {
  const error = chrome.runtime.lastError
  if (error) console.error(error)
})
localStorage.clear()
sessionStorage.clear()

/*
  eventpage.js
*/
try {
  QUnit.module(`eventpage.js`)
} catch (e) {
  if (e instanceof ReferenceError) {
    const div = document.getElementById(`qunit`)
    const h = document.createElement(`p`)
    const t = document.createElement(`p`)
    const b = document.createElement(`strong`)
    b.style.color = `red`
    b.textContent = `Unit testing has been disabled in this copy of RetroTxt.`
    t.textContent = `It depends on the QUnit testing framework which is incompatible with the WebExtension submission process used by addons.mozilla.org.`
    h.appendChild(b)
    div.appendChild(h)
    div.appendChild(t)
  }
}

QUnit.test(`Tabs() class`, assert => {
  let tabs = new Tabs()
  assert.equal(tabs.tabId, 0, `Tab Id should return 0`)
  tabs.listen()
  tabs.remove()
})

QUnit.test(`Tab() class`, assert => {
  let info = { status: `complete`, title: `Example dot com` }
  let tab = new Tab(5, `https://example.com`, info, `onCreated`)
  assert.equal(tab.id, 5, `Mock tab id should be 5`)
  assert.equal(
    tab.url,
    `https://example.com`,
    `Mock tab url should return a URL`
  )
  assert.equal(
    tab.info.status,
    `complete`,
    `Mock tab info status should be returned`
  )
  assert.equal(
    tab.info.title,
    `Example dot com`,
    `Mock info title should be returned`
  )
  assert.equal(tab.menuId, `onCreated`, `Mock tab menu id should be onCreated`)
  assert.ok(tab.validateURLSyntax(), `example.com is a valid URL`)
  tab = new Tab(0, `telnet://example.com`)
  assert.equal(tab.validateURLSyntax(), false, `Is an invalid URI`)
  tab = new Tab(0, `The website title`)
  assert.equal(tab.validateURLSyntax(), false, `Is an invalid URI`)
  tab = new Tab(0, `chrome-extension://...`)
  assert.equal(tab.validateURLSyntax(), false, `Is an invalid URI`)
  tab = new Tab(0, `ftp://...`)
  assert.equal(tab.validateURLSyntax(), false, `Is an invalid URI`)
  tab = new Tab(0, ``)
  assert.equal(tab.validateURLSyntax(), false, `Is an invalid URI`)
  tab = new Tab(0, `https://www.example.com/hello-world/`)
  assert.equal(
    tab.removeSubDomains(),
    `example.com`,
    `Should return example.com`
  )
  tab = new Tab(0, `ftp://example.com`)
  assert.equal(
    tab.removeSubDomains(),
    `example.com`,
    `Should return example.com`
  )
  tab = new Tab(0, `www.example.com`)
  assert.equal(
    tab.removeSubDomains(),
    `example.com`,
    `Should return example.com`
  )
  tab = new Tab(0, `example.com`)
  assert.equal(
    tab.removeSubDomains(),
    `example.com`,
    `Should return example.com`
  )
})

QUnit.test(`ToolbarButton() class`, assert => {
  const bar = new ToolbarButton(0, `Hello`)
  assert.equal(bar.id, 0, `Tab id should return 0`)
  assert.equal(bar.title, `RetroTxt`, `RetroTxt title is incorrect`)
})

QUnit.test(`Action() class`, assert => {
  const info = {}
  let action = new Action(0, info)
  assert.equal(action.scheme, ``, `Scheme should be empty`)
  assert.equal(action.id, 0, `Tab id should return 0`)
  assert.equal(action.state, false, `State should return false`)
  assert.equal(
    action.info.url,
    `tabs.Tab.url permission denied`,
    `Info is empty so the URL should fail`
  )
  info.url = `https://example.com`
  action = new Action(0, info)
  assert.equal(action.scheme, `https`, `URL in info should return a scheme`)
  assert.equal(action.validateScheme(), true, `URL scheme is valid`)
  info.url = `ftps://example.com`
  action = new Action(0, info)
  assert.equal(action.scheme, `ftps`, `URL in info should return a scheme`)
  assert.equal(action.validateScheme(), false, `URL scheme is invalid`)
})

QUnit.test(`Security() class`, assert => {
  const blank = new Security()
  assert.equal(blank.permissions, undefined, `This is an invalid declaration`)
  const dls = new Security(`downloads`)
  assert.deepEqual(
    dls.permissions,
    [`downloads`, `downloads.open`,`tabs`],
    `Should return a pair of download items`
  )
  assert.deepEqual(
    dls.test().permissions,
    [`downloads`, `downloads.open`,`tabs`],
    `Should return a pair of download items`
  )
  assert.deepEqual(dls.origins, [`file:///*/`], `Should return a file origin`)
  assert.deepEqual(
    dls.test().origins,
    [`file:///*/`],
    `Should return a file origin`
  )
  let https = new Security(`http`, `https://www.example.com/`)
  assert.deepEqual(
    https.test().origins,
    [`*://www.example.com/*`],
    `Should return a pair of example.com origins`
  )
  https = new Security(`http`, `example.com`)
  assert.deepEqual(
    https.test().origins,
    [`*://example.com/*`],
    `Should return a pair of example.com origins`
  )
})

QUnit.test(`Storage() class`, assert => {
  const store = new Storage()
  assert.equal(store.storageReset, false, `Storage reset should be false`)
  assert.equal(
    store.defaults.get(`updatedNotice`),
    true,
    `Update notice should be true`
  )
  store.pass(`textKey`, `testValue`)
  assert.equal(
    localStorage.textKey,
    `testValue`,
    `Local storage test value should be set`
  )
  store.wipe()
  assert.equal(
    localStorage.textKey,
    undefined,
    `Local storage test value should be wiped`
  )
  store.scan()
  store.clean()
})

QUnit.test(`Downloads() class`, assert => {
  let downloads = new Downloads(false)
  assert.equal(downloads.monitor, false, `Downloads monitor should be false`)
  let item = {}
  item.url = `https://retrotxt.com/e/preview_03.ans`
  item.filename = `preview_03.ans`
  item.id = 0
  downloads.item = item
  downloads.create()
  let stored = sessionStorage.getItem(`download${item.id}-localpath`)
  assert.equal(
    stored,
    item.filename,
    `${item.filename} should have been saved to sessionStorage`
  )
  sessionStorage.removeItem(`download${item.id}-localpath`)
  item = {}
  item.url = `ftp://retrotxt.com/e/preview_01.ans`
  item.filename = `preview_01.ans`
  item.id = 0
  downloads.item = item
  downloads.create()
  stored = sessionStorage.getItem(`download${item.id}-localpath`)
  assert.equal(
    stored,
    null,
    `ftp ${item.filename} should not have been saved to sessionStorage`
  )
  sessionStorage.removeItem(`download${item.id}-localpath`)
  item = {}
  item.url = `http://retrotxt.com/e/preview_01.png`
  item.filename = `preview_01.png`
  item.id = 0
  downloads.item = item
  downloads.create()
  stored = sessionStorage.getItem(`download${item.id}-localpath`)
  assert.equal(
    stored,
    null,
    `Image file ${item.filename} should not have been saved to sessionStorage`
  )
  let delta = {}
  delta.filename = {}
  delta.filename.current = `preview_01.ans`
  downloads.delta = delta
  assert.equal(
    downloads.setFilename(),
    true,
    `${delta.filename.current} should have been saved to sessionStorage`
  )
  delta.filename.current = `preview_01.png`
  downloads.delta = delta
  assert.equal(
    downloads.setFilename(),
    false,
    `${delta.filename.current} should not have been saved to sessionStorage`
  )
})

QUnit.test(`WebExtension() class`, assert => {
  const extension = new WebExtension()
  assert.equal(
    extension.defaults.get(`textBgScanlines`),
    false,
    `text background scanlines should be false`
  )
  assert.equal(
    extension.defaults.get(`retroFont`),
    `vga8`,
    `retro font should be vga8`
  )
  extension.activateTab(null, { tabid: 0 })
  assert.equal(
    sessionStorage.getItem(`tab0textfile`),
    `true`,
    `tab0textfile session item should be true`
  )
  assert.equal(
    sessionStorage.getItem(`tab0encoding`),
    `unknown`,
    `tab0encoding session item should be unknown`
  )
})

QUnit.test(`Menu() class`, assert => {
  const menu = new Menu()
  assert.deepEqual(
    menu.contexts,
    [`browser_action`, `page`],
    `menu context should only be browser action and page`
  )
  assert.equal(
    menu.titles.get(`c64`),
    `Commodore 64`,
    `menu item is not correct`
  )
  assert.equal(menu.themeIds.has(`vga8`), true, `Theme id is missing from set`)
  menu.newTheme(`msdos`)
  assert.equal(
    localStorage.getItem(`retroColor`),
    `theme-msdos`,
    `theme was not correctly set`
  )
  assert.equal(
    localStorage.getItem(`retroFont`),
    `vga8`,
    `theme was not correctly set`
  )
})

/*
 * functions.js
 */
QUnit.module(`functions.js`)

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
  // hsl with a lavender input
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
    true,
    `A PDF document should return true`
  )
  assert.equal(
    cfg.validateFilename(`my document.txt`),
    false,
    `A text document should return false`
  )
  assert.equal(
    cfg.validateFilename(`.index.js`),
    true,
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

/*
 * retrotxt.js
 */
QUnit.module(`retrotxt.js`)

QUnit.test(`DOM() class`, assert => {
  const dom = new DOM()
  assert.equal(dom.head.nodeName, `HEAD`, `Should be a <head> element`)
  assert.equal(dom.cssLink, null, `Should be null element doesn't exist`)
  assert.equal(
    dom.storage[0],
    `customBackground`,
    `1st storage item should be customBackground`
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
  assert.equal(div.firstChild.nextSibling.textContent.trim(), `Any comments go here.`, `Sauce comment`)
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

/*
 * parse_dos.js
 */
QUnit.module(`parse_dos.js`)

QUnit.test(`CharacterSet() class`, assert => {
  const cs = new CharacterSet(`cp_437`)
  assert.equal(cs.set, `cp_437`, `Set should be a character set name`)
  assert.equal(cs.get().length, 128, `Set should be an array of 128 characters`)
  assert.equal(cs.get()[0], `Ç`, `The first character should be Ç`)
  cs.cp437Table()
  assert.equal(cs.set_0[0], `␀`, `The first character should be ␀`)
  assert.equal(cs.cp437_C0()[0], `␀`, `The first character should be ␀`)
  assert.equal(cs.cp437()[0], `Ç`, `The first character should be Ç`)
  assert.equal(cs.iso8859_1()[0], `á`, `The first character should be á`)
  cs.cp1250Table()
  assert.equal(cs.set_8[0], `€`, `The first character should be €`)
  assert.equal(cs.cp1250()[0], `€`, `The first character should be €`)
  cs.cp1251Table()
  assert.equal(cs.set_8[0], `Ђ`, `The first character should be Ђ`)
  assert.equal(cs.cp1251()[0], `Ђ`, `The first character should be Ђ`)
  cs.iso8859_5Table()
  assert.equal(cs.set_a[1], `Ё`, `The 2nd character should be Ё`)
  assert.equal(cs.iso8859_5()[1], `Ё`, `The 2nd character should be Ё`)
  cs.iso8859_10Table()
  assert.equal(cs.set_a[1], `Ą`, `The 2nd character should be Ą`)
  assert.equal(cs.iso8859_10()[1], `Ą`, `The 2nd character should be Ą`)
  cs.macRomanTable()
  assert.equal(cs.set_8[0], `Ä`, `The first character should be Ä`)
  assert.equal(cs.macRoman()[0], `Ä`, `The first character should be Ä`)
  assert.equal(cs.cp437_C0()[1], `☺`, `Should be \`☺\``)
  assert.equal(
    cs.cp437_C0()[1].charCodeAt(0),
    `9786`,
    `Should be character code 9786`
  )
  assert.equal(
    cs.cp437_C0()[1].codePointAt(0),
    `9786`,
    `Should be character code 9786`
  )
  assert.equal(cs.cp437()[50], `▓`, `Should be \`▓\``)
})

QUnit.test(`Transcode() class`, assert => {
  const tc1 = new Transcode(null, `Can I pay in \u0080?`)
  tc1._input_cp1252()
  let expected = `Can I pay in €?`
  assert.equal(tc1.text, expected, `Should be the string '${expected}'`)
  const tc2 = new Transcode(`iso_8859_1➡`, `MS-DOS end of line?\u001B`)
  tc2.rebuild()
  expected = `MS-DOS end of line?←`
  assert.equal(tc2.text, expected, `Should be the string '${expected}'`)
  const tc3 = new Transcode(null, `Can I pay in \u00A4?`)
  tc3._input_iso8859_15()
  expected = `Can I pay in €?`
  assert.equal(tc3.text, expected, `Should be the string '${expected}'`)
  const tc4 = new Transcode(null, `Smile \u{1F601}`)
  tc4.rebuild()
  expected = `Smile 😁`
  assert.equal(tc4.text, expected, `Should be the string '${expected}'`)
  let transcode = new Transcode(`cp_1252➡`, `Hello world!`)
  assert.equal(transcode.set, `cp_1252➡`, `Should be a set`)
  assert.equal(transcode.text, `Hello world!`, `Should be a string`)
  assert.equal(transcode.hasSupport(), true, `cp_1252➡ is supported`)
  transcode.rebuild()
  transcode = new Transcode(`cp_1252➡`, `!Hello world!\u001B`)
  transcode.rebuild()
  assert.equal(transcode.text, `!Hello world!←`, `cp_1252➡ is supported`)
  // _input_cp1252
  transcode = new Transcode(null, `${String.fromCharCode(128)}`)
  transcode._input_cp1252()
  assert.equal(transcode.text, `€`, `Char 128 should convert to €`)
  transcode = new Transcode(null, `${String.fromCharCode(129)}`)
  transcode._input_cp1252()
  assert.equal(transcode.text, ``, `Char 129 should be empty`)
  transcode = new Transcode(null, `${String.fromCharCode(149)}`)
  transcode._input_cp1252()
  assert.equal(transcode.text, `•`, `Char 149 should convert to •`)
  // _input_iso8859_15
  transcode = new Transcode(null, `${String.fromCharCode(164)}`)
  transcode._input_iso8859_15()
  assert.equal(transcode.text, `€`, `Char 164 should convert to €`)
  transcode.table_cp1252()
  assert.equal(transcode.set_8[0], `€`, `First character should be a €`)
})

QUnit.test(`DOSText() class`, assert => {
  // textDosCtrlCodes can effect the results of these tests
  // input cp-865
  // CSpell:ignore Æôöòûùÿ áíóúñ Çéäàåçëèïîì Æôöòûù ŔÁÂĂÄĹĆÇČÉĘËĚÍÎĎ ĐŃŇÓÔŐÖ ŘŮÚŰÜÝ đńňóôőö řůúűüýţ
  let dos = new DOSText(`ÉæÆôöòûùÿÖÜø£Ø₧ƒ`, { codepage: `cp_865` })
  assert.equal(
    dos.normalize(),
    `ÉæÆôöòûùÿÖÜ¢£¥₧ƒ`,
    `CP 865 set 9 input should return CP-437 set 9 output`
  )
  dos = new DOSText(`áíóúñÑªº¿⌐¬½¼¡«¤`, { codepage: `cp_865` })
  assert.equal(
    dos.normalize(),
    `áíóúñÑªº¿⌐¬½¼¡«»`,
    `CP 865 set A input should return CP-437 set A output`
  )
  // input cp-1250
  dos = new DOSText(`€‚„…†‡‰Š‹ŚŤŽŹ`, { codepage: `cp_1250` }) // 13 chars
  assert.equal(
    dos.normalize(),
    `ÇéäàåçëèïîìÄÅ`,
    `CP 1250 set 8 input should return CP-437 set 8 output`
  )
  dos = new DOSText(`‘’“”•–—™š›śťžź`, { codepage: `cp_1250` })
  assert.equal(
    dos.normalize(),
    `æÆôöòûùÖÜ¢£¥₧ƒ`,
    `CP 1250 set 9 input should return CP-437 set 9 output`
  )
  dos = new DOSText(`\u00A0ˇ˘Ł¤Ą¦§¨©Ş«¬\u00AD®Ż`, { codepage: `cp_1250` })
  assert.equal(
    dos.normalize(),
    `áíóúñÑªº¿⌐¬½¼¡«»`,
    `CP 1250 set A input should return CP-437 set A output`
  )
  dos = new DOSText(`°±˛ł´µ¶·¸ąş»Ľ˝ľż`, { codepage: `cp_1250` })
  assert.equal(
    dos.normalize(),
    `░▒▓│┤╡╢╖╕╣║╗╝╜╛┐`,
    `CP 1250 set B input should return CP-437 set B output`
  )
  dos = new DOSText(`ŔÁÂĂÄĹĆÇČÉĘËĚÍÎĎ`, { codepage: `cp_1250` })
  assert.equal(
    dos.normalize(),
    `└┴┬├─┼╞╟╚╔╩╦╠═╬╧`,
    `CP 1250 set C input should return CP-437 set C output`
  )
  dos = new DOSText(`ĐŃŇÓÔŐÖ×ŘŮÚŰÜÝŢß`, { codepage: `cp_1250` })
  assert.equal(
    dos.normalize(),
    `╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀`,
    `CP 1250 set D input should return CP-437 set D output`
  )
  dos = new DOSText(`ŕáâăäĺćçčéęëěíîď`, { codepage: `cp_1250` })
  assert.equal(
    dos.normalize(),
    `αßΓπΣσµτΦΘΩδ∞φε∩`,
    `CP 1250 set E input should return CP-437 set E output`
  )
  dos = new DOSText(`đńňóôőö÷řůúűüýţ˙`, { codepage: `cp_1250` })
  assert.equal(
    dos.normalize(),
    `≡±≥≤⌠⌡÷≈°∙·√ⁿ²■\u00A0`,
    `CP 1250 set F input should return CP-437 set F output`
  )
  // input cp-1251
  dos = new DOSText(`ЂЃ‚ѓ„…†‡€‰Љ‹ЊЌЋЏ`, { codepage: `cp_1251` })
  assert.equal(
    dos.normalize(),
    `ÇüéâäàåçêëèïîìÄÅ`,
    `CP 1251 set 8 input should return CP-437 set 8 output`
  )
  dos = new DOSText(`ђ‘’“”•–—™љ›њќћџ`, { codepage: `cp_1251` })
  // position 0x98, chr ÿ has intentionally been dropped
  assert.equal(
    dos.normalize(),
    `ÉæÆôöòûùÖÜ¢£¥₧ƒ`,
    `CP 1251 set 9 input should return CP-437 set 9 output`
  )
  dos = new DOSText(`\u00A0ЎўЈ¤Ґ¦§Ё©Є«¬\u00AD®Ї`, { codepage: `cp_1251` })
  assert.equal(
    dos.normalize(),
    `áíóúñÑªº¿⌐¬½¼¡«»`,
    `CP 1251 set A input should return CP-437 set A output`
  )
  dos = new DOSText(`°±Ііґµ¶·ё№є»јЅѕї`, { codepage: `cp_1251` })
  assert.equal(
    dos.normalize(),
    `░▒▓│┤╡╢╖╕╣║╗╝╜╛┐`,
    `CP 1251 set B input should return CP-437 set B output`
  )
  // CSpell:ignore АБВГДЕЖЗИЙКЛМНОП РСТУФХЦЧШЩЪЫЬЭЮЯ
  dos = new DOSText(`АБВГДЕЖЗИЙКЛМНОП`, { codepage: `cp_1251` })
  assert.equal(
    dos.normalize(),
    `└┴┬├─┼╞╟╚╔╩╦╠═╬╧`,
    `CP 1251 set C input should return CP-437 set C output`
  )
  dos = new DOSText(`РСТУФХЦЧШЩЪЫЬЭЮЯ`, { codepage: `cp_1251` })
  assert.equal(
    dos.normalize(),
    `╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀`,
    `CP 1251 set D input should return CP-437 set D output`
  )
  dos = new DOSText(`абвгдежзийклмноп`, { codepage: `cp_1251` })
  assert.equal(
    dos.normalize(),
    `αßΓπΣσµτΦΘΩδ∞φε∩`,
    `CP 1251 set E input should return CP-437 set E output`
  )
  dos = new DOSText(`рстуфхцчшщъыьэюя`, { codepage: `cp_1251` })
  assert.equal(
    dos.normalize(),
    `≡±≥≤⌠⌡÷≈°∙·√ⁿ²■\u00A0`,
    `CP 1251 set F input should return CP-437 set F output`
  )
  // input iso-8859-1
  dos = new DOSText(`\u00A0¡¢£¤¥¦§¨©ª«¬\u00AD®¯`, { codepage: `iso_8859_1` })
  assert.equal(
    dos.normalize(),
    `áíóúñÑªº¿⌐¬½¼¡«»`,
    `ISO 8859-1 set A input should return CP-437 set A output`
  )
  // input iso-8859-15
  dos = new DOSText(`\u00A0¡¢£€¥Š§š©ª«¬\u00AD®¯`, { codepage: `iso_8859_15` })
  assert.equal(
    dos.normalize(),
    `áíóúñÑªº¿⌐¬½¼¡«»`,
    `ISO 8859-15 set A input should return CP-437 set A output`
  )
  dos = new DOSText(`°±²³Žµ¶·ž¹º»ŒœŸ¿`, { codepage: `iso_8859_15` })
  assert.equal(
    dos.normalize(),
    `░▒▓│┤╡╢╖╕╣║╗╝╜╛┐`,
    `ISO 8859-15 set A input should return CP-437 set A output`
  )
  // input Macintosh Roman character set
  // CSpell:ignore Çüéâäàåçêëèïîì êëíìîïñóòôöõúùûü ªºΩæø ÂÊÁËÈÍÎÏÌÓÔ
  // CSpell:disable
  dos = new DOSText(`ÄÅÇÉÑÖÜáàâäãåçéè`, { codepage: `mac_roman` })
  // CSpell:enable
  assert.equal(
    dos.normalize(),
    `ÇüéâäàåçêëèïîìÄÅ`,
    `Mac set 8 input should return CP-437 set 8 output`
  )
  dos = new DOSText(`êëíìîïñóòôöõúùûü`, { codepage: `mac_roman` })
  assert.equal(
    dos.normalize(),
    `ÉæÆôöòûùÿÖÜ¢£¥₧ƒ`,
    `Mac set 9 input should return CP-437 set 9 output`
  )
  dos = new DOSText(`†°¢£§•¶ß®©™´¨≠ÆØ`, { codepage: `mac_roman` })
  assert.equal(
    dos.normalize(),
    `áíóúñÑªº¿⌐¬½¼¡«»`,
    `Mac set A input should return CP-437 set A output`
  )
  dos = new DOSText(`∞±≤≥¥µ∂∑∏π∫ªºΩæø`, { codepage: `mac_roman` })
  assert.equal(
    dos.normalize(),
    `░▒▓│┤╡╢╖╕╣║╗╝╜╛┐`,
    `Mac set B input should return CP-437 set B output`
  )
  dos = new DOSText(`¿¡¬√ƒ≈∆«»…\u00A0ÀÃÕŒœ`, { codepage: `mac_roman` })
  assert.equal(
    dos.normalize(),
    `└┴┬├─┼╞╟╚╔╩╦╠═╬╧`,
    `Mac set C input should return CP-437 set C output`
  )
  dos = new DOSText(`–—“”‘’÷◊ÿŸ⁄€‹›ﬁﬂ`, { codepage: `mac_roman` })
  assert.equal(
    dos.normalize(),
    `╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀`,
    `Mac set D input should return CP-437 set D output`
  )
  dos = new DOSText(`‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔ`, { codepage: `mac_roman` })
  assert.equal(
    dos.normalize(),
    `αßΓπΣσµτΦΘΩδ∞φε∩`,
    `Mac set E input should return CP-437 set E output`
  )
  dos = new DOSText(`ÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ`, { codepage: `mac_roman` })
  assert.equal(
    dos.normalize(),
    `≡±≥≤⌠⌡÷≈°∙·√ⁿ²■\u00A0`,
    `Mac set F input should return CP-437 set F output`
  )
  // input UTF16
  dos = new DOSText(`Hello world.`)
  assert.deepEqual(
    `Hello world.`,
    `Hello world.`,
    `Text should remain unchanged`
  )
  dos = new DOSText(`\u0003\u0004\u0005\u0006`, {
    codepage: `mac_roman`,
    displayControls: true
  })
  assert.equal(
    dos.normalize(),
    `♥♦♣♠`,
    `ASCII control codes should return CP-437 glyphs`
  )
  dos = new DOSText(`\u0001\u0021α■`, {
    codepage: `input_UTF16`,
    displayControls: true
  })
  assert.equal(
    dos.normalize(),
    `☺!α■`,
    `ASCII control codes and ASCII extended should return CP-437 glyphs`
  )
  // Test textDosCtrlCodes
  let string = `░░A▓▓B▀C${String.fromCharCode(9)}Z≈Y.`
  dos = new DOSText(string, { displayControls: false })
  assert.deepEqual(
    dos.normalize(),
    `░░A▓▓B▀C\u0009Z≈Y.`,
    `Tab control should function as a control`
  )
  // Test normalisations
  string = `░░A▓▓B▀C` + String.fromCharCode(13) + `Z≈Y.`
  dos = new DOSText(string, { displayControls: false })
  assert.equal(
    dos.normalize(),
    string,
    `Treat ASCII control characters as that`
  )
  string = `THE quick Brown f0x j!%$.`
  dos = new DOSText(string)
  assert.equal(
    dos.normalize(),
    string,
    `ASCII characters are universal so should never be converted between different code pages`
  )
  string = `░▒▓┌┬┐`
  dos = new DOSText(string)
  assert.equal(
    dos.normalize(),
    string,
    `Converting characters unique to CP-437 should return them unmodified`
  )
  string = `☺☕♫`
  dos = new DOSText(string)
  assert.equal(
    dos.normalize(),
    string,
    `Other Unicode characters should remain untouched`
  )
  // test all ascii controls
  // Note using Unicode hex values not decimal values
  dos = new DOSText(`\u0000`, { displayControls: true })
  if (FindEngine() === `gecko`) assert.equal(dos.normalize(), ` `, `Should return `)
  else assert.equal(dos.normalize(), `␀`, `Should return ␀`)
  dos = new DOSText(`\u0001`, { displayControls: true })
  assert.equal(dos.normalize(), `☺`, `Should return ☺`)
  dos = new DOSText(`\u0002`, { displayControls: true })
  assert.equal(dos.normalize(), `☻`, `Should return ☻`)
  dos = new DOSText(`\u0003`, { displayControls: true })
  assert.equal(dos.normalize(), `♥`, `Should return ♥`)
  dos = new DOSText(`\u0004`, { displayControls: true })
  assert.equal(dos.normalize(), `♦`, `Should return ♦`)
  dos = new DOSText(`\u0005`, { displayControls: true })
  assert.equal(dos.normalize(), `♣`, `Should return ♣`)
  dos = new DOSText(`\u0006`, { displayControls: true })
  assert.equal(dos.normalize(), `♠`, `Should return ♠`)
  dos = new DOSText(`\u0007`, { displayControls: true })
  assert.equal(dos.normalize(), `•`, `Should return •`)
  dos = new DOSText(`\u0008`, { displayControls: true })
  assert.equal(dos.normalize(), `◘`, `Should return ◘`)
  dos = new DOSText(`\u0009`, { displayControls: true })
  assert.equal(dos.normalize(), `\t`, `Should return a tab`)
  dos = new DOSText(`\u000A`, { displayControls: true })
  assert.equal(dos.normalize(), `\n`, `Should return a newline`)
  dos = new DOSText(`\u000B`, { displayControls: true })
  assert.equal(dos.normalize(), `♂`, `Should return ♂`)
  dos = new DOSText(`\u000C`, { displayControls: true })
  assert.equal(dos.normalize(), `♀`, `Should return ♀`)
  dos = new DOSText(`\u000D`, { displayControls: true })
  assert.equal(dos.normalize(), `\n`, `Should return a newline`)
  dos = new DOSText(`\u000E`, { displayControls: true })
  assert.equal(dos.normalize(), `♫`, `Should return ♫`)
  dos = new DOSText(`\u000F`, { displayControls: true })
  assert.equal(dos.normalize(), `☼`, `Should return ☼`)
  dos = new DOSText(`\u0010`, { displayControls: true })
  assert.equal(dos.normalize(), `►`, `Should return ►`)
  dos = new DOSText(`\u0011`, { displayControls: true })
  assert.equal(dos.normalize(), `◄`, `Should return ◄`)
  dos = new DOSText(`\u0012`, { displayControls: true })
  assert.equal(dos.normalize(), `↕`, `Should return ↕`)
  dos = new DOSText(`\u0013`, { displayControls: true })
  assert.equal(dos.normalize(), `‼`, `Should return ‼`)
  dos = new DOSText(`\u0014`, { displayControls: true })
  assert.equal(dos.normalize(), `¶`, `Should return ¶`)
  dos = new DOSText(`\u0015`, { displayControls: true })
  assert.equal(dos.normalize(), `§`, `Should return §`)
  dos = new DOSText(`\u0016`, { displayControls: true })
  assert.equal(dos.normalize(), `▬`, `Should return ▬`)
  dos = new DOSText(`\u0017`, { displayControls: true })
  assert.equal(dos.normalize(), `↨`, `Should return ↨`)
  dos = new DOSText(`\u0018`, { displayControls: true })
  assert.equal(dos.normalize(), `↑`, `Should return ↑`)
  dos = new DOSText(`\u0019`, { displayControls: true })
  assert.equal(dos.normalize(), `↓`, `Should return ↓`)
  dos = new DOSText(`\u001A`, { displayControls: true })
  assert.equal(dos.normalize(), `→`, `Should return →`)
  dos = new DOSText(`\u001B`, { displayControls: true })
  assert.equal(dos.normalize(), `←`, `Should return ←`)
  dos = new DOSText(`\u001C`, { displayControls: true })
  assert.equal(dos.normalize(), `∟`, `Should return ∟`)
  dos = new DOSText(`\u001D`, { displayControls: true })
  assert.equal(dos.normalize(), `↔`, `Should return ↔`)
  dos = new DOSText(`\u001E`, { displayControls: true })
  assert.equal(dos.normalize(), `▲`, `Should return ▲`)
  dos = new DOSText(`\u001F`, { displayControls: true })
  assert.equal(dos.normalize(), `▼`, `Should return ▼`)
  // test Windows 1252 empty placeholders
  dos = new DOSText(`\u00FC`, { displayControls: true })
  assert.equal(dos.normalize(), `ü`, `Should return ü`)
  dos = new DOSText(`\u00EC`, { displayControls: true })
  assert.equal(dos.normalize(), `ì`, `Should return ì`)
  dos = new DOSText(`\u00C5`, { displayControls: true })
  assert.equal(dos.normalize(), `Å`, `Should return Å`)
  dos = new DOSText(`\u00C9`, { displayControls: true })
  assert.equal(dos.normalize(), `É`, `Should return É`)
  dos = new DOSText(`\u00A5`, { displayControls: true })
  assert.equal(dos.normalize(), `¥`, `Should return ¥`)
  // Unicode stops following ASCII control values from here
  dos = new DOSText(`\u0020`, { displayControls: true })
  assert.equal(dos.normalize(), ` `, `Should return a space`)
  dos = new DOSText(` !"#$%&'()*+,-./`, { displayControls: true })
  assert.equal(
    dos.normalize(),
    ` !"#$%&'()*+,-./`,
    `Should return a collection of symbols`
  )
  dos = new DOSText(`0123456789:;<=>?`, { displayControls: true })
  assert.equal(dos.normalize(), `0123456789:;<=>?`, `Should return 0123...?`)
  // CSpell:ignore ABCDEFGHIJKLMNOPQRSTUVWXYZ
  dos = new DOSText(`@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`, {
    displayControls: true
  })
  assert.equal(
    dos.normalize(),
    `@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`,
    `Should return uppercase letters`
  )
  dos = new DOSText(`abcdefghijklmnopqrstuvwxyz{|}~⌂`, {
    displayControls: true
  })
  assert.equal(
    dos.normalize(),
    `abcdefghijklmnopqrstuvwxyz{|}~⌂`,
    `Should return lowercase letters`
  )
  dos = new DOSText(`ÇüéâäàåçêëèïîìÄÅ`, { displayControls: true })
  assert.equal(dos.normalize(), `ÇüéâäàåçêëèïîìÄÅ`, `Should return row 8`)
  dos = new DOSText(`ÉæÆôöòûùÿÖÜ¢£¥₧ƒ`, { displayControls: true })
  assert.equal(dos.normalize(), `ÉæÆôöòûùÿÖÜ¢£¥₧ƒ`, `Should return row 9`)
  dos = new DOSText(`áíóúñÑªº¿⌐¬½¼¡«»`, { displayControls: true })
  assert.equal(dos.normalize(), `áíóúñÑªº¿⌐¬½¼¡«»`, `Should return row A`)
  dos = new DOSText(`░▒▓│┤╡╢╖╕╣║╗╝╜╛┐`, { displayControls: true })
  assert.equal(dos.normalize(), `░▒▓│┤╡╢╖╕╣║╗╝╜╛┐`, `Should return row B`)
  dos = new DOSText(`└┴┬├─┼╞╟╚╔╩╦╠═╬╧`, { displayControls: true })
  assert.equal(dos.normalize(), `└┴┬├─┼╞╟╚╔╩╦╠═╬╧`, `Should return row C`)
  dos = new DOSText(`╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀`, { displayControls: true })
  assert.equal(dos.normalize(), `╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀`, `Should return row D`)
  dos = new DOSText(`αßΓπΣσµτΦΘΩδ∞φε∩`, { displayControls: true })
  assert.equal(dos.normalize(), `αßΓπΣσµτΦΘΩδ∞φε∩`, `Should return row E`)
  dos = new DOSText(`≡±≥≤⌠⌡÷≈°∙·√ⁿ²■`, { displayControls: true })
  assert.equal(dos.normalize(), `≡±≥≤⌠⌡÷≈°∙·√ⁿ²■`, `Should return row F`)
  // CSpell:disable
  string = `"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."`
  // CSpell:enable
  dos = new DOSText(string, { displayControls: true })
  assert.equal(
    dos.normalize(),
    `${string}`,
    `Should return row the standard Lorem Ipsum passage`
  )
  // test conflicts
  dos = new DOSText(`\u2022\u00F2\u00F2\u2022`, { displayControls: true })
  assert.equal(dos.normalize(), `•òò•`, `Should return •òò•`)
  dos = new DOSText(`\u00B7\u2556`, { displayControls: true })
  assert.equal(dos.normalize(), `·╖`, `Should return · middle dot and ╖`)
  dos = new DOSText(`\u00A1`, { displayControls: true })
  assert.equal(dos.normalize(), `¡`, `Should return ¡ inverted exclamation`)
  dos = new DOSText(`[ ][\u00A0\u00A0]`, { displayControls: false })
  assert.equal(dos.normalize(), `[ ][\u00A0\u00A0]`, `Should return 3 spaces`)
  dos = new DOSText(`\u00AB`, { displayControls: true })
  assert.equal(dos.normalize(), `«`, `Should return « left double angle quote`)
  dos = new DOSText(`\u00DF`, { displayControls: true })
  assert.equal(dos.normalize(), `ß`, `Should return ß small Latin sharp S`)
  dos = new DOSText(`\u00B0`, { displayControls: true })
  assert.equal(dos.normalize(), `°`, `Should return ° degree`)
  dos = new DOSText(`\u00B1`, { displayControls: true })
  assert.equal(dos.normalize(), `±`, `Should return ± plus-minus`)
  dos = new DOSText(`\u00B2`, { displayControls: true })
  assert.equal(dos.normalize(), `²`, `Should return ² square sign`)
  dos = new DOSText(`\u00E1`, { displayControls: true })
  assert.equal(dos.normalize(), `á`, `Should return á an acute a`)
  dos = new DOSText(`\u00FF`, { displayControls: true })
  assert.equal(dos.normalize(), `ÿ`, `Should return ÿ an diaeresis y`)
  dos = new DOSText(`\u00B5`, { displayControls: true })
  assert.equal(dos.normalize(), `µ`, `Should return µ micro sign`)
  dos = new DOSText(`\u03C6`, { displayControls: true })
  assert.equal(dos.normalize(), `φ`, `Should return φ small Phi`)
  dos = new DOSText(`\u25A0`, { displayControls: true })
  assert.equal(dos.normalize(), `■`, `Should return ■ block square`)
  dos = new DOSText(`\u2219\u00B7`, { displayControls: true })
  assert.equal(
    dos.normalize(),
    `∙·`,
    `Should return ∙ bullet operator and · middle dot`
  )
  dos = new DOSText(`[ ][\u00A0\u00A0]`, { displayControls: false })
  assert.equal(dos.normalize(), `[ ][\u00A0\u00A0]`, `Should return 3 spaces`)
  dos = new DOSText(`\u0192`, { displayControls: true })
  assert.equal(dos.normalize(), `ƒ`, `Should return ƒ f with hook`)
  dos = new DOSText(`\u00B5`, { displayControls: true })
  assert.equal(dos.normalize(), `µ`, `Should return µ micro sign`)
  dos = new DOSText(`\u00C7`, { displayControls: true })
  assert.equal(dos.normalize(), `Ç`, `Should return Ç c with cedilla`)
})
QUnit.test(`DOSText() class lookup functions`, assert => {
  const dos = new DOSText(``, { displayControls: true })
  dos.characterTable()
  assert.equal(dos.asciiTable[1], `☺`, `Should return a ☺`)
  assert.equal(dos.extendedTable[1], `ü`, `Should return a ü`)
  dos.codepage = `cp_1251`
  dos.characterTable()
  assert.equal(dos.asciiTable[1], `☺`, `Should return a ☺`)
  assert.equal(dos.extendedTable[0], `Ђ`, `Should return a Ђ`)
  dos.codepage = `cp_1252`
  dos.characterTable()
  assert.equal(dos.fromCharCode(1), `☺`, `Should return a ☺`)
  assert.equal(dos.fromCharCode(31), `▼`, `Should return a ▼`)
  assert.equal(dos.fromCharCode(254), `■`, `Should return a ■`)
  assert.equal(dos.fromCharCode(176), `░`, `Should return a ░`)
})

QUnit.test(`BBS() class`, assert => {
  // detect()
  let bbs = new BBS(`plain text string`).detect()
  let content = bbs
  assert.equal(content, ``, `Should return an empty result`)

  content = `@X01Hello world.`
  bbs = new BBS(content).detect()
  assert.equal(bbs, `pcboard`, `Should detect PCBoard @ codes`)

  content = `@01@Hello world.`
  bbs = new BBS(content).detect()
  assert.equal(bbs, `wildcat`, `Should detect WildCat @ codes`)

  content = `@X01Hello world.`
  bbs = new BBS(content).normalize()
  assert.deepEqual(
    bbs.innerHTML,
    `<i class="PB0 PF1">Hello world.</i>`,
    `Should contain HTML tags`
  )

  content = `@01@Hello world.`
  bbs = new BBS(content).normalize()
  assert.deepEqual(
    bbs.innerHTML,
    `<i class="PB0 PF1">Hello world.</i>`,
    `Should contain HTML tags`
  )

  content = `@01@Hello world.`
  bbs = new BBS(content, `wildcat`).normalize()
  assert.deepEqual(
    bbs.innerHTML,
    `<i class="PB0 PF1">Hello world.</i>`,
    `Should contain HTML tags`
  )
  content = `@X01Hello world.`
  bbs = new BBS(content).normalize()
  assert.deepEqual(
    bbs.innerHTML,
    `<i class="PB0 PF1">Hello world.</i>`,
    `Should contain HTML tags`
  )
  content = `@01@Hello world.`
  bbs = new BBS(content).normalize()
  assert.deepEqual(
    bbs.innerHTML,
    `<i class="PB0 PF1">Hello world.</i>`,
    `Should contain HTML tags`
  )
  // format mis-match
  content = `@01@Hello world.`
  bbs = new BBS(content, `pcboard`).normalize()
  assert.deepEqual(
    bbs.innerHTML,
    `<i class="PB@ PF0">@X@01@Hello world.</i>`,
    `Should contain HTML tags`
  )
  // more complicated syntax
  content = `@CLS@@X01H@X05e@X0Bl@X00l@XFFo@X01 world.`
  bbs = new BBS(content).normalize()
  assert.deepEqual(
    bbs.innerHTML,
    `<i class="PB0 PF1">H</i><i class="PB0 PF5">e</i><i class="PB0 PFB">l</i><i class="PB0 PF0">l</i><i class="PBF PFF">o</i><i class="PB0 PF1"> world.</i>`,
    `Should return this HTML`
  )
})

QUnit.module(`parse_ansi.js`, {
  before: () => {
    // prepare something once for all tests
  },
  beforeEach: () => {
    // prepare something before each test
  },
  afterEach: () => {
    // clean up after each test
  },
  after: () => {
    // clean up once after all tests are done
  }
})
QUnit.test(`SGRInit`, assert => {
  const content = new SGRInit()
  assert.equal(content.colorF, 37, `Should be \`37\``)
  assert.equal(content.bold, false, `Should be \`false\``)
})

QUnit.test(`cursorClear`, assert => {
  const content = new CursorInit()
  assert.equal(content.maxColumns, 80, `Should be \`80\``)
  assert.equal(content.column, 1, `Should be \`1\``)
})

QUnit.test(`findControlCode()`, assert => {
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
    9484
  ]
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
  assert.equal(
    test,
    `HVP,1,1,1`,
    `'H' ${reply} cursor position row = 1, col = 1`
  )
  gccTest([49, 56, 59, 72])
  assert.equal(
    test,
    `HVP,4,18,1`,
    `'18;H' ${reply} cursor position row = 18, col = 1`
  )
  gccTest([49, 56, 72])
  assert.equal(
    test,
    `HVP,3,18,1`,
    `'18H' ${reply} cursor position row = 18, col = 1`
  )
  gccTest([49, 56, 59, 49, 72])
  assert.equal(
    test,
    `HVP,5,18,1`,
    `'18;1H' ${reply} cursor position row = 18, col = 1`
  )
  gccTest([59, 72])
  assert.equal(
    test,
    `HVP,2,1,1`,
    `';H' ${reply} cursor position row = 1, col = 1`
  )
  gccTest([59, 49, 56, 72])
  assert.equal(
    test,
    `HVP,4,1,18`,
    `';18H' ${reply} cursor position row = 1, col = 18`
  )
  gccTest([49, 59, 49, 56, 72])
  assert.equal(
    test,
    `HVP,5,1,18`,
    `'1;18H' ${reply} cursor position row = 1, col = 18`
  )
  gccTest([49, 48, 48, 48, 72])
  assert.equal(
    test,
    `HVP,5,1000,1`,
    `'1000H' ${reply} cursor position row = 1000, col = 1`
  )
  // CUP [18-19]
  gccTest([102])
  assert.equal(
    test,
    `HVP,1,1,1`,
    `'f' ${reply} cursor position row = 1, col = 1`
  )
  gccTest([49, 48, 48, 48, 102])
  assert.equal(
    test,
    `HVP,5,1000,1`,
    `'f' ${reply} cursor position row = 1000, col = 79`
  )
  //return
  // ED [20-23]
  gccTest([74])
  assert.equal(
    test,
    `ED,1,0`,
    `'J' should clear the cursor to the end of the row`
  )
  gccTest([48, 74])
  assert.equal(
    test,
    `ED,2,0`,
    `'J' should clear the cursor to the end of the row`
  )
  gccTest([49, 74])
  assert.equal(
    test,
    `ED,2,1`,
    `'J' should clear the cursor to the beginning of the display`
  )
  gccTest([50, 74])
  assert.equal(test, `ED,2,2`, `'J' should clear the entire display`)
  // EL [24-30]
  gccTest([75])
  assert.equal(
    test,
    `EL,1,0`,
    `'K' should clear the cursor to the end of the line`
  )
  gccTest([48, 75])
  assert.equal(
    test,
    `EL,2,0`,
    `'K' should clear the cursor to the end of the line`
  )
  gccTest([49, 75])
  assert.equal(
    test,
    `EL,2,1`,
    `'K' should clear the cursor to the beginning of the line`
  )
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
  assert.equal(
    test,
    `SGR,1,0`,
    `findControlCode 'm' should reset text rendition attributes`
  )
  gccTest([48, 109])
  assert.equal(
    test,
    `SGR,2,0`,
    `findControlCode '0m' should reset text rendition attributes`
  )
  gccTest([49, 109])
  assert.equal(
    test,
    `SGR,2,1`,
    `findControlCode '1m' should set bold text rendition attributes`
  )
  gccTest([51, 49, 109])
  assert.equal(
    test,
    `SGR,3,31`,
    `findControlCode '31m' should set text foreground colour attribute`
  )
  gccTest([52, 55, 109])
  assert.equal(
    test,
    `SGR,3,47`,
    `'47m' should set text background colour attribute`
  )
  gccTest([52, 55, 59, 51, 49, 109])
  assert.equal(
    test,
    `SGR,6,47,31`,
    `findControlCode '47;31m' should set text background and foreground colour attributes`
  )
  gccTest([51, 49, 59, 52, 55, 109])
  assert.equal(
    test,
    `SGR,6,31,47`,
    `findControlCode '31;47m' should set text background and foreground colour attributes`
  )
  gccTest([48, 59, 51, 49, 59, 52, 55, 109])
  assert.equal(
    test,
    `SGR,8,0,31,47`,
    `findControlCode '0;31;47m' should reset text attributes then set background and foreground colours`
  )
  gccTest([48, 59, 49, 59, 51, 49, 59, 52, 55, 109])
  assert.equal(
    test,
    `SGR,10,0,1,31,47`,
    `findControlCode '0;1;31;47m' should reset text attributes then set bold, background and foreground colours`
  )
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
  assert.equal(
    test,
    `SM,4,13`,
    `findControlCode '?13h' should set screen mode to 13`
  )
  gccTest([48, 104])
  assert.equal(
    test,
    `SM,2,0`,
    `findControlCode '0h' should set screen mode to 0`
  )
  gccTest([49, 51, 104])
  assert.equal(
    test,
    `SM,3,13`,
    `findControlCode '13h' should set screen mode to 13`
  )
  // RM
  gccTest([63, 49, 51, 108])
  assert.equal(
    test,
    `RM,4,13`,
    `findControlCode '?13l should reset screen mode to 13`
  )
  // non-standard
  gccTest([48, 113])
  assert.equal(
    test,
    `/x,2,0`,
    `findControlCode '0q' should disable extended keyboard support`
  )
  gccTest([49, 113])
  assert.equal(
    test,
    `/x,2,1`,
    `findControlCode '1q' should enable extended keyboard support`
  )

  function gccTest(
    values = [] // Initialise the test of findControlCode() // @values  Array of text characters represented in Unicode decimal values
  ) {
    a = sample // reset array to the sample code
    values.unshift(859291, null) // inject expected Control Sequence Initiator and null into sample value
    a = values.concat(a) // merge CSI and sample value into sample code
    test = findControlCode(a, 0) // run sample in function for unit testing
  }
})

QUnit.test(`buildCSI()`, assert => {
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

QUnit.test(`Text to Unicode decimal conversion functions`, assert => {
  let textArr = buildDecimalArray(`abc`)
  let test
  assert.deepEqual(
    textArr,
    [97, 98, 99],
    `'abc' should return an array containing these numeric values`
  )
  test = buildDecimalArray(`\r\n`)
  assert.deepEqual(
    test,
    [13, 10],
    `'CRLF' should return an array containing these numeric values`
  )
  test = buildDecimalArray(`098`)
  assert.deepEqual(
    test,
    [48, 57, 56],
    `'098' should return an array containing these numeric values`
  )
  test = buildDecimalArray(`←[0;30;47m`)
  assert.deepEqual(
    test,
    [155, null, 48, 59, 51, 48, 59, 52, 55, 109],
    `'←[0;30;47m' should return an array containing these numeric values`
  )
})

QUnit.test(`BuildEcma48()`, assert => {
  const t = {
    _: `<span class="dos-cursor">_</span>`,
    oTSM4: `<div id="row-1"><i class="SGR37 SGR40 SGR12">Hello world.</i></div>`,
    oTSM18: `<div id="row-1"><i class="SGR37 SGR40 SGR17">Hello world.</i></div>`
  }
  const reply = `sequence into HTML.`
  const inputText = `Hello world.`
  const outputText = `<div id="row-1"><i class="SGR37 SGR40">Hello world.</i></div>`

  let sample = ``
  let uniqueResult = ``
  let test
  // no controls
  sample = `Hello world.`
  test = new BuildEcma48(sample).htmlString
  //test.htmlString
  assert.equal(test, outputText, `'${sample}' ${reply}`)
  // C0 only
  sample = `Hello\nworld.`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR37 SGR40">Hello</i></div><div id="row-2"><i class="SGR37 SGR40">world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // ANSI.SYS controls (https://msdn.microsoft.com/en-us/library/cc722862.aspx)
  // CUP (cursor position)
  sample = `←[H${inputText}`
  test = new BuildEcma48(sample).htmlString
  assert.equal(test, outputText, `'${sample}' ${reply}`)

  sample = `←[;H${inputText}`
  test = new BuildEcma48(sample).htmlString
  assert.equal(test, outputText, `'${sample}' ${reply}`)

  sample = `←[2H${inputText}`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR37 SGR40"> </i></div><div id="row-2"><i class="SGR37 SGR40">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `←[;18H${inputText}` // 1 row, 18 column
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i id="column-1-to-18" class="SGR0">${` `.repeat(
    18
  )}</i><i class="SGR37 SGR40">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // HVP (horizontal vertical position)
  sample = `←[f${inputText}`
  test = new BuildEcma48(sample).htmlString
  assert.equal(test, outputText, `'${sample}' ${reply}`)

  sample = `←[1;18f${inputText}`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i id="column-1-to-18" class="SGR0">${` `.repeat(
    18
  )}</i><i class="SGR37 SGR40">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `←[1;40f${inputText}`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i id="column-1-to-40" class="SGR0">${` `.repeat(
    40
  )}</i><i class="SGR37 SGR40">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `←[1;80f${inputText}`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i id="column-1-to-80" class="SGR0">${` `.repeat(
    80
  )}</i><i class="SGR37 SGR40"></i></div><div id="row-2"><i class="SGR37 SGR40">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // CUP (cursor up)
  sample = `←[A${inputText}`
  test = new BuildEcma48(sample).htmlString
  assert.equal(test, outputText, `'${sample}' ${reply}`)

  sample = `←[5A${inputText}`
  test = new BuildEcma48(sample).htmlString
  assert.equal(test, outputText, `'${sample}' ${reply}`)

  sample = `←[60A${inputText}`
  test = new BuildEcma48(sample).htmlString
  assert.equal(test, outputText, `'${sample}' ${reply}`)

  sample = `←[555A${inputText}`
  test = new BuildEcma48(sample).htmlString
  assert.equal(test, outputText, `'${sample}' ${reply}`)

  sample = `←[1523A${inputText}`
  test = new BuildEcma48(sample).htmlString
  assert.equal(test, outputText, `'${sample}' ${reply}`)
  // CUD (cursor down)
  sample = `←[B${inputText}`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR37 SGR40"> </i></div><div id="row-2"><i class="SGR37 SGR40">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `←[3B${inputText}`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR37 SGR40"> </i></div><div id="row-2"><i class="SGR37 SGR40"> </i></div><div id="row-3"><i class="SGR37 SGR40"> </i></div><div id="row-4"><i class="SGR37 SGR40">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  //CSpell:ignore Blines Cworld mworld
  sample = `Hello←[BNew←[Blines`
  uniqueResult = `<div id="row-1"><i class="SGR37 SGR40">Hello</i></div><div id="row-2"><i class="SGR37 SGR40">New</i></div><div id="row-3"><i class="SGR37 SGR40">lines</i></div>`
  test = new BuildEcma48(sample).htmlString
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // CUF (cursor forward)
  sample = `←[C${inputText}`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i id="column-1" class="SGR0"> </i><i class="SGR37 SGR40">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `←[1C${inputText}`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i id="column-1" class="SGR0"> </i><i class="SGR37 SGR40">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `Hello←[Cworld`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR37 SGR40">Hello</i><i id="column-6" class="SGR0"> </i><i class="SGR37 SGR40">world</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `←[5C${inputText}`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i id="column-1-to-5" class="SGR0">     </i><i class="SGR37 SGR40">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // CUB (cursor back)
  sample = `${inputText}←[5D`
  test = new BuildEcma48(sample).htmlString
  assert.equal(test, outputText, `'${sample}' ${reply}`)
  // SCP (save cursor position) and RCP (restore cursor position)
  sample = `hello←[s\n←[u world`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR37 SGR40">hello world</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // ED2 Erase display
  sample = `←[2J${inputText}`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR37 SGR40">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // EL0 Erase line
  sample = `←[K${inputText}`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i id="column-1-to-80" class="SGR0">                                                                                </i><i class="SGR37 SGR40"></i></div><div id="row-2"><i class="SGR37 SGR40">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // SGM Set Graphics Mode
  // All attributes off
  sample = `←[0mHello world.`
  test = new BuildEcma48(sample).htmlString
  assert.equal(test, outputText, `'${sample}' ${reply}`)

  sample = `←[0mHello\nworld.`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR37 SGR40">Hello</i></div><div id="row-2"><i class="SGR37 SGR40">world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // 1 bold
  sample = `←[1mHello world.`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR137 SGR40">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  sample = `Hello ←[0;1;31mworld.`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR37 SGR40">Hello </i><i class="SGR131 SGR40">world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // 4 underscore
  sample = `←[4mHello world.`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR37 SGR40 SGR4">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  sample = `Hello ←[4mworld.`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR37 SGR40">Hello </i><i class="SGR37 SGR40 SGR4">world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // 5 blink
  sample = `←[5mHello world.`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR37 SGR40 SGR5">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // 7 reverse
  sample = `←[7mHello world.`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR37 SGR40 SGR7">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // 8 conceal
  sample = `←[8mHello world.`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR37 SGR40 SGR8">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  sample = `←[8mHello ←[8mworld.`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR37 SGR40 SGR8">Hello </i><i class="SGR37 SGR40">world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // foreground colours
  sample = `←[35mHello world.`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR35 SGR40">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  sample = `Hello ←[31mworld.`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR37 SGR40">Hello </i><i class="SGR31 SGR40">world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  sample = `←[0mHello ←[36mworld.`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR37 SGR40">Hello </i><i class="SGR36 SGR40">world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // background colours
  sample = `←[45mHello world.`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR37 SGR45">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  sample = `Hello ←[41mworld.`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR37 SGR40">Hello </i><i class="SGR37 SGR41">world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // both foreground and background colours
  sample = `←[0;31;45m${inputText}←[1A`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR31 SGR45">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  sample = `←[31;45m${inputText}`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR31 SGR45">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  sample = `Hello ←[31;41mworld.`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR37 SGR40">Hello </i><i class="SGR31 SGR41">world.</i></div>`
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
  uniqueResult = `<div id="row-1"><i id="column-1-to-80" class="SGR0">                                                                                </i><i class="SGR37 SGR40"></i></div><div id="row-2"><i class="SGR37 SGR40">Hello world.</i></div>`
  sample = `←[J${inputText}`
  test = new BuildEcma48(sample).htmlString
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `←[0J${inputText}`
  test = new BuildEcma48(sample).htmlString
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  uniqueResult = `<div id="row-1"><i class="SGR37 SGR40">Hello world.</i></div>`
  sample = `←[1J${inputText}`
  test = new BuildEcma48(sample).htmlString
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `←[2J${inputText}`
  test = new BuildEcma48(sample).htmlString
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // NOTE: 16/9/17 - switched RT to ignore \n values when rendering ANSI
  // [2J erases display
  sample = `${inputText}\n${inputText}\n${inputText}←[2J`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1" class="ED"><i class="SGR37 SGR40">Hello world.Hello world.Hello world.</i></div>`
  //uniqueResult = `<div id="row-1" class="ED"><i class="SGR37 SGR40">Hello world.</i></div><div id="row-2" class="ED"><i class="SGR37 SGR40">Hello world.</i></div><div id="row-3" class="ED"><i class="SGR37 SGR40">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // EL Erase in Line
  sample = `←[K${inputText}`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i id="column-1-to-80" class="SGR0">                                                                                </i><i class="SGR37 SGR40"></i></div><div id="row-2"><i class="SGR37 SGR40">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `←[0K${inputText}`
  test = new BuildEcma48(sample).htmlString
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  // ←[1K is not supported
  //
  sample = `←[2K${inputText}`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1" class="ED"><i class="SGR37 SGR40">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // SGR Select Graphic Rendition
  // effects
  for (let sgr = 0; sgr < 22; sgr++) {
    sample = `←[${sgr}m${inputText}`
    test = new BuildEcma48(sample).htmlString
    if ([0, 10].includes(sgr))
      uniqueResult = `<div id="row-1"><i class="SGR37 SGR40">Hello world.</i></div>`
    else if (sgr === 1)
      uniqueResult = `<div id="row-1"><i class="SGR137 SGR40">Hello world.</i></div>`
    else
      uniqueResult = `<div id="row-1"><i class="SGR37 SGR40 SGR${sgr}">Hello world.</i></div>`
    assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  }
  // cancelled effects
  sample = `←[1mHello ←[22mworld.`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR137 SGR40">Hello </i><i class="SGR37 SGR40">world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  for (let sgr = 23; sgr < 29; sgr++) {
    if ([26, 28].includes(sgr)) continue
    sample = `←[${sgr - 20}mHello ←[${sgr}mworld.`
    test = new BuildEcma48(sample).htmlString
    uniqueResult = `<div id="row-1"><i class="SGR37 SGR40 SGR${sgr -
      20}">Hello </i><i class="SGR37 SGR40">world.</i></div>`
    assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  }
  // foreground colours
  for (let sgr = 30; sgr < 40; sgr++) {
    if (sgr === 38) continue
    sample = `←[${sgr}m${inputText}`
    test = new BuildEcma48(sample).htmlString
    uniqueResult = `<div id="row-1"><i class="SGR${sgr} SGR40">Hello world.</i></div>`
    assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  }
  // background colours
  for (let sgr = 40; sgr < 50; sgr++) {
    if (sgr === 48) continue
    sample = `←[${sgr}m${inputText}`
    test = new BuildEcma48(sample).htmlString
    uniqueResult = `<div id="row-1"><i class="SGR37 SGR${sgr}">Hello world.</i></div>`
    assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  }
  // border effects
  uniqueResult = `<div id="row-1"><i class="SGR37 SGR40 SGR51">Hello </i><i class="SGR37 SGR40">world.</i></div>`
  sample = `←[51mHello ←[54mworld.`
  test = new BuildEcma48(sample).htmlString
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  uniqueResult = `<div id="row-1"><i class="SGR37 SGR40 SGR52">Hello </i><i class="SGR37 SGR40">world.</i></div>`
  sample = `←[52mHello ←[54mworld.`
  test = new BuildEcma48(sample).htmlString
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  uniqueResult = `<div id="row-1"><i class="SGR37 SGR40 SGR53">Hello </i><i class="SGR37 SGR40">world.</i></div>`
  sample = `←[53mHello ←[55mworld.`
  test = new BuildEcma48(sample).htmlString
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // xterm 256 colours
  sample = `←[38;5;0m${inputText}`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR380 SGR40">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `←[38;5;10m${inputText}`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR3810 SGR40">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `←[38;5;100m${inputText}`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR38100 SGR40">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `←[38;5;255m${inputText}`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR38255 SGR40">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)

  sample = `←[48;5;255m${inputText}`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR37 SGR48255">Hello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // unknown control functions
  sample = `←[6n${inputText}`
  test = new BuildEcma48(sample).htmlString
  uniqueResult = `<div id="row-1"><i class="SGR37 SGR40">␛[6nHello world.</i></div>`
  assert.equal(test, uniqueResult, `'${sample}' ${reply}`)
  // Alternative Control Sequence Introducer
  // Set Mode =4h
  sample = `←[4h${inputText}`
  test = new BuildEcma48(sample).htmlString
  assert.equal(test, t.oTSM4, `'${sample}' ${reply}`)

  sample = `←[?4h${inputText}`
  test = new BuildEcma48(sample).htmlString
  assert.equal(test, t.oTSM4, `'${sample}' ${reply}`)

  sample = `←[=4h${inputText}`
  test = new BuildEcma48(sample).htmlString
  assert.equal(test, t.oTSM4, `'${sample}' ${reply}`)

  sample = `←[>4h${inputText}`
  test = new BuildEcma48(sample).htmlString
  assert.equal(test, t.oTSM4, `'${sample}' ${reply}`)

  sample = `←[18h${inputText}`
  test = new BuildEcma48(sample).htmlString
  assert.equal(test, t.oTSM18, `'${sample}' ${reply}`)

  sample = `←[?18h${inputText}`
  test = new BuildEcma48(sample).htmlString
  assert.equal(test, t.oTSM18, `'${sample}' ${reply}`)

  sample = `←[=18h${inputText}`
  test = new BuildEcma48(sample).htmlString
  assert.equal(test, t.oTSM18, `'${sample}' ${reply}`)

  sample = `←[>18h${inputText}`
  test = new BuildEcma48(sample).htmlString
  assert.equal(test, t.oTSM18, `'${sample}' ${reply}`)

  // iCE colors ←[?33h (on) and ←[?33l (off)

  sample = `←[?33h←[47;5m←[B${inputText}` // start with iCE on
  test = new BuildEcma48(sample).htmlString
  assert.equal(
    test,
    `<div id="row-1"><i class="SGR37 SGR47 SGR5"></i></div><div id="row-2"><i class="SGR37 SGR47 SGR5">Hello world.</i></div>`,
    `'${sample}' ${reply}`
  )

  sample = `←[?33l←[47;5m←[B${inputText}` // start with iCE off
  test = new BuildEcma48(sample).htmlString
  assert.equal(
    test,
    `<div id="row-1"><i class="SGR37 SGR47 SGR5"></i></div><div id="row-2"><i class="SGR37 SGR47 SGR5">Hello world.</i></div>`,
    `'${sample}' ${reply}`
  )

  sample = `←[?33h←[5;47m${inputText}`
  test = new BuildEcma48(sample).htmlString
  assert.equal(
    test,
    `<div id="row-1"><i class="SGR37 SGR47 SGR5">Hello world.</i></div>`,
    `'${sample}' ${reply}`
  )

  sample = `←[?33h←[6;47miCE iCE Baby←[?33l${inputText}`
  test = new BuildEcma48(sample).htmlString
  assert.equal(
    test,
    `<div id="row-1"><i class="SGR37 SGR47 SGR6">iCE iCE Baby</i><i class="SGR37 SGR47 SGR6">Hello world.</i></div>`,
    `'${sample}' ${reply}`
  )
})
