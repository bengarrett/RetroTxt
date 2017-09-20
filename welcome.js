// filename: welcome.js
//
// These functions are used exclusively by welcome.html.
'use strict'

/*global browser chrome buildLinksToCSS changeTextEffect ListRGBThemes */

// duplicated functions for example ANSI interactions

function iceColorsOn(link) {
  const iceCSS = document.getElementById(`retrotxt-4bit-ice`)
  if (iceCSS !== null) return
  const theme = new ListRGBThemes()
  document.head.appendChild(buildLinksToCSS(`css/text_colors_${theme.colors[theme.color]}-ice.css`, `retrotxt-4bit-ice`)) // child 4
  link.childNodes[1].innerHTML = `On`
}
function iceColorsOff(link) {
  const iceCSS = document.getElementById(`retrotxt-4bit-ice`)
  if (iceCSS !== null) iceCSS.remove()
  link.childNodes[1].innerHTML = `Off`
}
// ice color toggle functions
function iceToggle(link) {
  switch (link.childNodes[1].innerHTML) {
    case `On`: iceColorsOff(link); break
    default: iceColorsOn(link)
  }
}

// text render
function renderToggle(link) {
  const doc = document.getElementsByTagName(`main`)[0]
  switch (link.innerHTML) {
    case `Normal`: changeTextEffect(`smeared`, doc); break
    case `Smeared`: changeTextEffect(`shadowed`, doc); break
    default: changeTextEffect(`normal`, doc)
  }
}

// welcome specific functions
async function fontSizeHref() {
  const link = document.getElementById(`h-doc-text-adjust`)
  const doc = document.getElementsByTagName(`main`)[0]
  link.addEventListener(`click`, function () {
    switch (this.textContent) {
      case `1x`:
        link.textContent = `2x`
        doc.classList.add(`text-2x`)
        doc.classList.remove(`text-1x`)
        break
      case `2x`:
        link.textContent = `1x`
        doc.classList.add(`text-1x`)
        doc.classList.remove(`text-2x`)
        break
    }
  })
}

async function headerHref() {
  async function changeHeader(show = true) {
    const h = document.getElementsByTagName(`header`)
    if (typeof h[0] === `object`) {
      switch (show) {
        case false:
          h[0].style.display = `none` // header-show
          h[1].style.display = `block` // header-hide
          break
        case true:
          h[0].style.display = `block`
          h[1].style.display = `none`
          break
      }
    }
    return
  }

  const linkH = document.getElementById(`h-ui-toggle-hide`)
  const linkS = document.getElementById(`h-ui-toggle-show`)
  linkH.addEventListener(`click`, () => changeHeader(true))
  linkS.addEventListener(`click`, () => changeHeader(false))
}

async function iceHref() {
  const link = document.getElementById(`ice-colors-toggle`)
  link.addEventListener(`click`, function () {
    link.onclick = iceToggle(this)
  })
}

async function optionHref() {
  const link = document.getElementById(`optionsLink`)
  link.addEventListener(`click`, () => chrome.runtime.openOptionsPage())
}

async function reloadHref() {
  const link = document.getElementById(`reloadLink`)
  link.addEventListener(`click`, () => chrome.runtime.reload())
}

async function renderHref() {
  const link = document.getElementById(`h-text-rend`)
  link.addEventListener(`click`, function () {
    link.onclick = renderToggle(this)
  })
}

async function showBrowser() {
  if (chrome.runtime.getManifest().options_ui !== undefined && chrome.runtime.getManifest().options_ui.page !== undefined) {
    const manifest = chrome.runtime.getManifest().options_ui.page
    const br = document.getElementById(`browser`)
    if (manifest.startsWith(`moz-extension`, 0) === true) br.textContent = `Firefox`
    else br.textContent = `Chrome`
  }
}

async function shuffleUL() {
  // credit: https://stackoverflow.com/questions/7070054
  const ul = document.getElementById(`cards`)
  for (let i = ul.children.length; i >= 0; i--) {
    ul.appendChild(ul.children[Math.random() * i | 0])
  }
}

async function rtuHref() {
  const link = document.getElementById(`rtu-ui-a`)
  link.addEventListener(`click`, function () {
    localStorage.setItem(`updatedNotice`, false)
    chrome.storage.local.set({ [`updatedNotice`]: false })
    window.close()
  })
}

async function urlHref(elm = ``, msg = ``) {
  const link = document.getElementById(elm)
  if (link !== null) {
    link.setAttribute(`href`, chrome.i18n.getMessage(msg))
  }
}

async function gotBrowserInfo(i) {
  const str = document.getElementById(`program`)
  str.textContent = ` on ${i.vendor} ${i.name} ${i.version}`
}

async function gotPlatformInfo(i) {
  const str = document.getElementById(`os`)
  switch (i.os) {
    case `win`: str.textContent = ` (Windows ${i.arch})`; break
    case `mac`: str.textContent = ` (macOS ${i.arch})`; break
    case `linux`: str.textContent = ` (Linux ${i.arch})`; break
    case `openbsd`: str.textContent = ` (BSD ${i.arch})`; break
  }
}

async function runtimeInfo() {
  const m = chrome.runtime.getManifest()
  const str = document.getElementById(`manifest`)
  const rtu = document.getElementById(`rtu`)
  const rtui = document.getElementById(`rtu-ui`)
  const ver = document.getElementById(`rt-updated`)
  if (typeof browser.runtime !== `undefined`) {
    if (typeof browser.runtime.getBrowserInfo !== `undefined`) {
      const gettingInfo = browser.runtime.getBrowserInfo()
      gettingInfo.then(gotBrowserInfo)
    }
    if (typeof browser.runtime.getPlatformInfo !== `undefined`) {
      const gettingInfo = browser.runtime.getPlatformInfo()
      gettingInfo.then(gotPlatformInfo)
    }
  }
  str.textContent = `RetroTxt v${m.version}`
  ver.textContent = `${m.version_name}`
  if (location.hash.includes(`#update`)) {
    rtu.style.display = `block`
    rtui.style.display = `block`
    document.title = `[··] ${m.version_name} update`
  }
}

(function () {
  optionHref()
  reloadHref()
  urlHref(`docLink`, `url_help`)
  urlHref(`webLink`, `url`)
  urlHref(`faqLink`, `url_qa`)
  fontSizeHref()
  headerHref()
  iceHref()
  renderHref()
  rtuHref()
  shuffleUL()
  runtimeInfo()
  showBrowser()
})()