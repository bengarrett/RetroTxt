/* eslint-env qunit:true */
/*global Action Downloads Menu Security Tab Tabs ToolbarButton WebExtension */
"use strict"

try {
  QUnit.module(`eventpage.js`, {
    before: () => {
      // prepare something once for all tests
      console.info(`☑ New QUnit eventpage.js test`)
      chrome.storage.local.clear(() => {
        const error = chrome.runtime.lastError
        if (error) console.error(error)
      })
      localStorage.clear()
      sessionStorage.clear()
    },
    beforeEach: () => {
      // prepare something before each test
    },
    afterEach: () => {
      // clean up after each test
    },
    after: () => {
      // clean up once after all tests are done
      console.info(`☑ QUnit eventpage.js tests are complete`)
    }
  })
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
    [`downloads`, `downloads.open`, `tabs`],
    `Should return a pair of download items`
  )
  assert.deepEqual(
    dls.test().permissions,
    [`downloads`, `downloads.open`, `tabs`],
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
    `HTTPS ${item.filename} should have been saved to sessionStorage`
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
    `FTP ${item.filename} should not have been saved to sessionStorage`
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
    `IMAGE file ${item.filename} should not have been saved to sessionStorage`
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
