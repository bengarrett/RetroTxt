// filename: welcome.js
//
// These functions are used exclusively by welcome.html.
'use strict'

/*global chrome*/

// duplicated functions for example ANSI interactions

function iceColorsOn(link) {
  const iceCSS = document.getElementById(`retrotxt-4bit-ice`)
  if (iceCSS !== null) return
  let theme = new ListRGBThemes()
  document.head.appendChild(buildLinksToCSS(`css/text_colors_${theme.colors[theme.color]}-ice.css`, `retrotxt-4bit-ice`)) // child 4
  link.childNodes[1].innerHTML = `On`
}
function iceColorsOff(link) {
  let iceCSS = document.getElementById(`retrotxt-4bit-ice`)
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
  let doc = document.getElementsByTagName(`main`)[0]
  switch (link.innerHTML) {
    case `Normal`: changeTextEffect(`smeared`, doc); break
    case `Smeared`: changeTextEffect(`shadowed`, doc); break
    default: changeTextEffect(`normal`, doc)
  }
}

// welcome specific functions

function showEngine() {
  if (chrome.runtime.getManifest().options_ui !== undefined && chrome.runtime.getManifest().options_ui.page !== undefined) {
    const manifest = chrome.runtime.getManifest().options_ui.page,
      gecko = manifest.startsWith(`moz-extension`, 0)
    let browser = `Chrome`
    if (gecko === true) browser = `Firefox`
    document.getElementById(`browser`).textContent = browser
  }
}

function iceHref() {
  let link = document.getElementById(`ice-colors-toggle`)
  link.addEventListener(`click`, function () {
    link.onclick = iceToggle(this)
  })
}

function optionHref() {
  let link = document.getElementById(`optionsLink`)
  link.addEventListener(`click`, function () {
    chrome.runtime.openOptionsPage()
  })
}

function reloadHref() {
  let link = document.getElementById(`reloadLink`)
  link.addEventListener(`click`, function () {
    chrome.runtime.reload()
  })
}

function renderHref() {
  const link = document.getElementById(`h-text-rend`)
  link.addEventListener(`click`, function () {
    link.onclick = renderToggle(this)
  })
}

function shuffleUL() {
  // credit: https://stackoverflow.com/questions/7070054
  let ul = document.getElementById(`cards`)
  for (let i = ul.children.length; i >= 0; i--) {
    ul.appendChild(ul.children[Math.random() * i | 0])
  }
}

function urlHref(elm = ``, msg = ``) {
  let link = document.getElementById(elm)
  if (link !== null) {
    link.setAttribute(`href`, chrome.i18n.getMessage(msg))
  }
}

function gotBrowserInfo(i) {
  let str = document.getElementById(`program`)
  str.textContent = ` on ${i.vendor} ${i.name} ${i.version}`
}

function gotPlatformInfo(i) {
  let str = document.getElementById(`os`)
  switch (i.os) {
    case `win`: str.textContent = ` (Windows ${i.arch})`; break
    case `mac`: str.textContent = ` (macOS ${i.arch})`; break
    case `linux`: str.textContent = ` (Linux ${i.arch})`; break
    case `openbsd`: str.textContent = ` (BSD ${i.arch})`; break
  }
}

function runtimeInfo() {
  let m = chrome.runtime.getManifest()
  let str = document.getElementById(`manifest`)
  if (typeof browser.runtime !== `undefined`) {
    if (typeof browser.runtime.getBrowserInfo !== `undefined`) {
      let gettingInfo = browser.runtime.getBrowserInfo()
      gettingInfo.then(gotBrowserInfo)
    }
    if (typeof browser.runtime.getPlatformInfo !== `undefined`) {
      let gettingInfo = browser.runtime.getPlatformInfo()
      gettingInfo.then(gotPlatformInfo)
    }
  }
  str.textContent = `RetroTxt v${m.version}`
}

(function () {
  optionHref()
  reloadHref()
  urlHref(`docLink`, `url_help`)
  urlHref(`webLink`, `url`)
  urlHref(`faqLink`, `url_qa`)
  iceHref()
  renderHref()
  shuffleUL()
  runtimeInfo()
  showEngine()
})()