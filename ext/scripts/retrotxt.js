// File: script/retrotxt.js
//
// Content-script to apply RetroTxt to a browser tab DOM,
// or restore the tab to its original raw text state.

// SAUCE fonts.
// These must be kept current to the font families in fonts_ibm.css & fonts_home.css.
const atascii = `candyantics`,
  commodore64 = `petme64`,
  ibmVGA = `ibm_vga_9x16`,
  ibmVGA8 = `ibm_vga_8x16`,
  ibmVGA50 = `ibm_vga_9x8`,
  ibmVGA508 = `ibm_ega_8x8`,
  ibmVGA25G = `ast_premiumexec`,
  ibmEGA = `ibm_ega_8x14`,
  ibmEGA43 = `ibm_ega_8x8`,
  topaz1 = `topaza500`,
  topaz1_ = `topazplusa500`,
  topaz2 = `topaza1200`,
  topaz2_ = `topazplusa1200`,
  potNoodle = `p0tnoodle`,
  microknight = `microknight`,
  microknight_ = `microknightplus`,
  mosoul = `mosoul`,
  trueColor = 24, // 24-bit colour
  bit8Color = 8, // 256 colour
  bit4Color = 4, // 16 colour
  bit2Color = 2, // 4 colour
  bit1Color = 1 // 2 colour

/**
 * Document Object Model (DOM) programming interface for HTML.
 * @class DOM
 */
class DOM {
  /**
   * Creates an instance of DOM.
   * @param [ecma48={}] ANSI data object
   * @param [palette=new HardwarePalette()] Colour palette object
   */
  constructor(ecma48 = {}, palette = new HardwarePalette()) {
    this.body = document.body
    this.article = document.getElementsByTagName(`article`)[0]
    this.cssLink = document.getElementById(`retrotxt-styles`)
    this.head = document.querySelector(`head`)
    this.headers = document.getElementsByTagName(`header`)
    this.main = document.querySelector(`main`)
    this.pre = document.getElementsByTagName(`pre`)[1]
    this.preCount = document.getElementsByTagName(`pre`).length
    this.rawText = document.getElementsByTagName(`pre`)[0]
    if (typeof this.rawText === `undefined`) {
      console.info(`The active tab is a blank page with no text.`)
      this.rawText = document.createElement(`pre`)
      this.body.append(this.rawText)
      this.preCount = document.getElementsByTagName(`pre`).length
    }
    // fetch Options stored values to be usable here
    this.storage = [
      `ansiPageWrap`,
      `colorsAnsiColorPalette`,
      `colorsCustomBackground`,
      `colorsCustomForeground`,
      `colorsTextPairs`,
      `fontFamilyName`,
      `settingsInformationHeader`,
      `textAccurate9pxFonts`,
      `textBackgroundScanlines`,
      `textBlinkingCursor`,
      `textCenterAlign`,
      `textFontSize`,
      `textLineHeight`,
      `textRenderEffect`,
    ]
    // parameters
    this.ecma48 = ecma48
    this.palette = palette
    // local storage results
    this.results
    this.backgroundColor = ``
    this.format = this._format()
  }
  /**
   * Discover the text or document format.
   */
  _format() {
    if (typeof qunit === `undefined`) {
      if (typeof this.pre === `undefined`) {
        if (typeof this.rawText === `undefined`) {
          console.error(`this.rawText element is missing`)
          return ``
        }
        return FindControlSequences(this.rawText.textContent)
      }
      return FindControlSequences(this.pre.textContent)
    }
  }
  /**
   * Initialises runtime and storage listeners.
   */

  async initialize() {
    chrome.runtime.onConnect.addListener((port) => {
      port.onMessage.addListener(handleConnections)
    })
    // context menu, on-click listener
    chrome.runtime.onMessage.addListener(handleMessages)
    // monitor for any changed Options set by the user
    chrome.storage.onChanged.addListener(handleChanges)
    // switch between the original plain text and the HTML conversion
    const port = chrome.runtime.connect({ name: `tabModified` })
    if (this.cssLink !== null) {
      if (this.cssLink.disabled === true) this._constructRawText()
      if (this.cssLink.disabled === false) this._constructPre()
      // end Execute() function, then tell an event listener in eventpage.js
      // that the body of this browser tab is modified
      port.postMessage({ tabModified: false })
      return
    }
    // fetch and apply saved Options
    chrome.storage.local.get(this.storage, (result) => {
      const dom = new DOM()
      dom.results = result
      dom.restore()
    })
    // tells the eventpage.js listener that the body of this tab is modified
    port.postMessage({ tabModified: true })
  }
  /**
   * Constructs the Document Object Model needed to display RetroTxt.
   */
  async construct() {
    // build link tags
    const palette = new HardwarePalette(),
      path = `../css`
    // 1-bit colour themes (ASCII, NFO)
    this.head.append(CreateLink(`${path}/retrotxt.css`, `retrotxt-styles`))
    this.head.append(CreateLink(`${path}/layout.css`, `retrotxt-layout`))
    this.head.append(CreateLink(`${path}/text_colors.css`, `retrotxt-theme`))
    // load any CSS that are used to mimic colours by the text file
    const format = this.format,
      link4bit = `retrotxt-4bit`
    // 4-bit colour text
    switch (format) {
      case ANSIText:
        this.head.append(CreateLink(palette.savedFilename(), link4bit))
        this.head.append(
          CreateLink(`${path}/text_colors_8bit.css`, `retrotxt-8bit`),
        )
        this.head.append(
          CreateLink(`${path}/text_ecma_48.css`, `retrotxt-ecma48`),
        )
        break
      case PCBoardText:
      case TelegardText:
      case WildcatText:
        this.head.append(
          CreateLink(`${path}/text_colors_pcboard.css`, link4bit),
        )
        break
      case CelerityText:
      case RenegadeText:
        this.head.append(CreateLink(`${path}/text_colors_pipe.css`, link4bit))
        break
      case WWIVHashText:
      case WWIVHeartText:
        this.head.append(
          CreateLink(`${path}/text_colors_wviv-pipe.css`, link4bit),
        )
        break
    }
    // disable links
    let i = this.head.children.length
    while (i--) {
      this.head.children[i].disabled = false
    }
  }
  /**
   * Create the header element with event listeners.
   */
  async constructHeader() {
    const hide = document.getElementById(`headerMinimal`),
      show = document.getElementById(`toggleUp`)
    // information header
    if (hide !== null) hide.onclick = () => this.clickHeader(1)
    if (show !== null) show.onclick = () => this.clickHeader(2)
    switch (`${this.results.settingsInformationHeader}`) {
      case `on`:
        this.clickHeader(1)
        break
      case `off`:
        this.clickHeader(0)
        break
      case `close`:
        this.clickHeader(2)
        break
      default:
        this.clickHeader(1)
        chrome.storage.local.set({ [`settingsInformationHeader`]: `on` })
        localStorage.setItem(`settingsInformationHeader`, `on`)
        console.log(
          `🖫 Could not obtain the required settingsInformationHeader setting to determine the information header state.`,
        )
    }
    this._constructRender()
    this._constructPalette()
    this._constructIceColors()
    this._constructPageWrap()
  }
  /**
   * Construct text render.
   */
  async _constructRender() {
    const id = `renderToggle`,
      article = document.getElementsByTagName(`article`)[0],
      elm = document.getElementById(id)
    if (elm === null) return console.error(`${id} element is missing`)
    elm.onclick = () => {
      switch (elm.textContent.toLowerCase()) {
        case `normal`:
          return ToggleTextEffect(`shadowed`, article)
        default:
          return ToggleTextEffect(`normal`, article)
      }
    }
  }
  /**
   * Construct colour palette.
   */
  async _constructPalette() {
    const toggle = document.getElementById(`colorPaletteToggle`),
      palette = new HardwarePalette()
    if (ecma48.colorDepth !== bit4Color)
      return toggle.classList.add(`has-text-weight-normal`)
    if (toggle === null) return
    if (ecma48.colorDepth !== bit4Color) return
    toggle.onclick = () => {
      // this cycles through to the next palette
      const css = document.getElementById(`retrotxt-4bit-ice`),
        current = palette.saved()
      palette.key = palette.next(current)
      palette.set()
      toggle.textContent = `${palette.key}`
      // update link
      const link = chrome.runtime.getURL(palette.savedFilename())
      document.getElementById(`retrotxt-4bit`).href = link
      // update ice colors link
      if (css !== null)
        css.href = chrome.runtime.getURL(palette.savedFilename(true))
    }
  }
  /**
   * Construct ice color, only shows with EMCA48/ANSI documents.
   */
  async _constructIceColors() {
    const toggle = document.getElementById(`toggleIceColors`)
    if (toggle === null) return
    const setting =
      `${Boolean(this.ecma48.iceColors)}` ||
      `${localStorage.getItem(`ansiUseIceColors`)}`

    // Sep. 2022, BLOCKTRONICS WTF4 MEGAJOINT
    // this tab causes a memory leak due to the blinking characters
    // in Manifest V2 this wasn't a issue but it is in Chrome v106?
    const memoryLeak = `://retrotxt.com/e/preview_00.ans`
    if (window.location.toString().includes(memoryLeak)) {
      this.head.append(
        CreateLink(`../css/text_colors_4bit-ice.css`, `retrotxt-4bit-ice`),
      )
      const elm = document.getElementById(`toggleIceColors`)
      elm.style = `text-decoration:line-through`
      elm.title = `Due to a memory leak with Chrome, this toggle is disabled for this page`
      return this._toggleOn(toggle)
    }

    toggle.onclick = () => this.clickIceColors()
    if (setting === `true`) {
      this.head.append(
        CreateLink(`../css/text_colors_4bit-ice.css`, `retrotxt-4bit-ice`),
      )
      this._toggleOn(toggle)
    } else this._toggleOff(toggle)
  }
  /**
   * Construct the page wrap.
   */
  async _constructPageWrap() {
    const toggle = document.getElementById(`togglePageWrap`)
    if (toggle === null) return
    const key = `ansiPageWrap`,
      setting = sessionStorage.getItem(key) || localStorage.getItem(key)
    toggle.onclick = () => this.clickPageWrap()
    if (`${setting}` === `true`) {
      this.head.append(
        CreateLink(`../css/text_pagewrap.css`, `retrotxt-page-wrap`),
      )
      this._toggleOn(toggle)
    } else this._toggleOff(toggle)
  }
  /**
   * Construct the pre element.
   */
  async _constructPre() {
    const schemes = [`chrome-extension`, `moz-extension`],
      scheme = globalThis.location.protocol.split(`:`)[0],
      hide = `is-hidden`
    // skip any URLs that match ignore schemes
    for (const ignore of schemes) {
      if (scheme.includes(ignore)) return
    }
    // hide classes
    ToggleScanlines(false, this.body)
    // hide page style customisations
    const preElements = 2
    if (this.preCount >= preElements) {
      if (this.headers !== null)
        for (const header of this.headers) {
          header.classList.add(hide)
        }
      this.rawText.classList.add(hide)
      this.pre.classList.remove(hide)
      // temporary workaround for a Blink engine issue where the previous
      // background colour of the <body> element is cached and not removed
      if (WebBrowser() === Engine.chrome)
        this.pre.style.backgroundColor = `white`
    } else if (typeof this.rawText !== `undefined`)
      this.rawText.classList.remove(hide)
    // hide links
    const links = Array.from(this.head.childNodes)
    links.forEach((link) => (link.disabled = true))
    // hide red alert messages
    DisplayAlert(false)
  }
  /**
   * Construct the raw text document.
   */
  async _constructRawText() {
    chrome.storage.local.get(`settingsInformationHeader`, (result) => {
      switch (`${result.settingsInformationHeader}`) {
        case `on`:
          this.clickHeader(1)
          break
        case `off`:
          this.clickHeader(0)
          break
        case `close`:
          this.clickHeader(2)
          break
        default:
          this.clickHeader(1)
          chrome.storage.local.set({ [`settingsInformationHeader`]: `on` })
          localStorage.setItem(`settingsInformationHeader`, `on`)
          console.log(
            `🖫 Could not obtain the required settingsInformationHeader setting to determine the information header state.`,
          )
      }
    })
    // temporary workaround for issue where the previous
    // background colour of <body> is cached and not removed
    if (WebBrowser() === Engine.chrome)
      this.pre.style.removeProperty(`background-color`)
    this.pre.classList.add(`is-hidden`)
    this.rawText.classList.remove(`is-hidden`)
    const links = Array.from(this.head.childNodes)
    links.forEach((link) => (link.disabled = false))
    // hide spin loader
    BusySpinner(false)
  }
  /**
   * Toggles the 'Accurate 9px EGA/VGA fonts' font replacements
   */
  async clickAccurate9pxFonts() {
    if (this.results.textAccurate9pxFonts === false)
      return this.head.append(
        CreateLink(`../css/fonts_ibm-scale-9x.css`, `retrotxt-scale-fonts`),
      )
    const css = document.getElementById(`retrotxt-scale-fonts`)
    if (css !== null) css.remove()
  }
  /**
   * Toggles the 'ANSI color palette'.
   */
  async clickAnsiColorPalette(palette = ``) {
    const name =
      palette === `` ? `${this.results.colorsAnsiColorPalette}` : palette
    const ansi = new HardwarePalette(),
      i = ansi.filenames.indexOf(name)
    if (i < -1) return console.error(`Unknown colour palette name '${name}'`)
    ansi.key = `${ansi.palettes[i]}`
    ansi.set()
    const link = document.getElementById(`retrotxt-4bit`),
      elm = document.getElementById(`colorPaletteToggle`)
    if (link !== null) link.href = chrome.runtime.getURL(ansi.savedFilename())
    if (elm !== null && ecma48.colorDepth === bit4Color)
      elm.textContent = `${ansi.key}`
  }
  /**
   * Toggles the 'Blinking cursor and text' blinking animation
   */
  async clickBlinkingCursorText() {
    if (this.results.textBlinkingCursor === false)
      return this.head.append(
        CreateLink(`../css/text_animation-off.css`, `no-blinkingCursorText`),
      )
    const css = document.getElementById(`no-blinkingCursorText`)
    if (css !== null) css.remove()
  }
  /**
   * Toggles 'Center align text' alignment.
   */
  async clickCenterAlign(center = false) {
    if (typeof this.article === `undefined`)
      return console.error(`this.article element does not exist`)
    this.article.classList.remove(`has-left`, `has-center`)
    if (center) this.article.classList.add(`has-center`)
    else this.article.classList.add(`has-left`)
  }
  /**
   * Applies the background and foreground colours.
   */
  async clickTextPairs() {
    try {
      this.body.removeAttribute(`class`)
      RemoveTextPairs(this.article)
    } catch {
      // some Firefox versions throw a security error while using file:///
    }
    // refresh scan lines & font shadows as they are effected by colour changes
    chrome.storage.local.get(
      [`textBackgroundScanlines`, `textRenderEffect`],
      (result) => {
        if (!(`textBackgroundScanlines` in result))
          CheckError(
            `🖫 Could not obtain the required textBackgroundScanlines setting to apply the scanlines effect.`,
            true,
          )
        if (!(`textRenderEffect` in result))
          CheckError(
            `🖫 Could not obtain the required textRenderEffect setting to apply text effects.`,
            true,
          )
        const sl = result.textBackgroundScanlines,
          te = result.textRenderEffect
        // scan lines in the body element
        if (typeof sl === `boolean` && sl === true)
          ToggleScanlines(true, this.body)
        // font shadowing applied to text in the main element
        // 10-Feb-2024 Changed to use the new textRenderEffect setting boolean type
        if (
          (typeof te === `string` && te === `shadowed`) ||
          (typeof te === `boolean` && te === true)
        )
          ToggleTextEffect(`shadowed`, this.article)
      },
    )
    // apply new colours
    const colorName = this.backgroundColor
    let colorId = colorName
    // background to body
    if (colorName.startsWith(`theme-`) === false) colorId = `theme-${colorName}`
    if (this.body.classList === null)
      return console.error(`the classList for the body element is null`)
    this.body.classList.add(`${colorName}-bg`)
    // foreground to article
    if (typeof this.article === `undefined`)
      return console.error(`article element is missing`)
    if (this.article.classList === null)
      return console.error(`the classList for the article element is null`)
    this.article.classList.add(`${colorName}-fg`)
    // clean up custom colours
    if (colorName !== `theme-custom`) {
      this.body.removeAttribute(`style`)
      this.article.removeAttribute(`style`)
    }
    // handle colour fixes
    const fixes = document.getElementById(`white-bg-fixes`)
    switch (colorId) {
      case `theme-atarist`:
      case `theme-windows`:
        if (fixes === null)
          this.head.append(
            CreateLink(
              `../css/text_colors_white_bg-fixes.css`,
              `white-bg-fixes`,
            ),
          )
        break
      default:
        if (fixes !== null) fixes.remove()
    }
    // handle theme-custom colours, this also loads the stylesheet and applies CSS
    if (colorName === `theme-custom`) {
      chrome.storage.local.get(
        [`colorsCustomBackground`, `colorsCustomForeground`],
        (result) => {
          const body = this.body.style,
            article = this.article.style
          if (`colorsCustomBackground` in result)
            body.backgroundColor = `${result.colorsCustomBackground}`
          else this.body.removeProperty(`backgroundColor`)
          if (`colorsCustomForeground` in result)
            article.color = `${result.colorsCustomForeground}`
          else this.article.removeProperty(`color`)
        },
      )
    }
  }
  /**
   * Toggles the information header.
   * @param [display=true] Show the header in the browser tab
   */
  async clickHeader(state = -1) {
    if (state === null) CheckArguments(`display`, `number`, state)
    const hide = `is-hidden`,
      off = 0,
      always = 1,
      minimalise = 2
    switch (state) {
      case minimalise:
        this.headers[0].classList.add(hide)
        this.headers[1].classList.remove(hide)
        break
      case always:
        this.headers[0].classList.remove(hide)
        this.headers[1].classList.add(hide)
        break
      case off:
        this.headers[0].classList.add(hide)
        this.headers[1].classList.add(hide)
        break
      default:
        console.error(`The provided state "${state}" for the header is invalid`)
        this.headers[0].classList.add(hide)
        this.headers[1].classList.add(hide)
    }
  }
  /**
   * Toggle 'Page wrap'.
   */
  async clickPageWrap() {
    const css = document.getElementById(`retrotxt-page-wrap`),
      elm = document.getElementById(`togglePageWrap`)
    if (elm === null) return
    switch (elm.textContent.toLowerCase()) {
      case `off`: {
        this.head.append(
          CreateLink(`../css/text_pagewrap.css`, `retrotxt-page-wrap`),
        )
        this._toggleOn(elm)
        break
      }
      default: {
        if (css !== null) css.remove()
        this._toggleOff(elm)
      }
    }
  }
  /**
   * Toggle 'Use iCE colors'.
   */
  async clickIceColors() {
    const css = document.getElementById(`retrotxt-4bit-ice`),
      elm = document.getElementById(`toggleIceColors`),
      palette = new HardwarePalette()
    if (elm === null) return
    switch (elm.textContent.toLowerCase()) {
      case `off`: {
        if (css !== null) return
        palette.key = elm.textContent
        const saved = palette.set()
        if (saved === false) {
          palette.key = `IBM`
          palette.set()
        }
        this.head.append(
          CreateLink(palette.savedFilename(true), `retrotxt-4bit-ice`),
        )
        this._toggleOn(elm)
        break
      }
      default: {
        if (css !== null) css.remove()
        this._toggleOff(elm)
      }
    }
  }
  /**
   * Toggles 'Text size'
   * @param [size=`1`] Text size value
   */
  async clickTextSize(size = `1`) {
    if (typeof size !== `string`) CheckArguments(`textFontSize`, `string`, size)
    if (typeof this.rawText === `undefined`)
      return console.error(`this.rawText element is missing`)
    this.rawText.classList.remove(
      `is-font-2`,
      `is-font-3`,
      `is-font-4`,
      `is-font-5`,
      `is-font-6`,
      `is-font-7`,
      `is-font-8`,
    )
    if (size === `1`) return
    this.rawText.classList.add(`is-font-${size}`)
  }
  /**
   * Toggles 'Line height'
   * @param [height=`1`] Line height value
   */
  async clickLineHeight(height = `1`) {
    if (typeof height !== `string`)
      CheckArguments(`lineHeight`, `string`, height)
    if (typeof this.rawText === `undefined`)
      return console.error(`this.rawText element is missing`)
    this.rawText.classList.remove(
      `is-size-2`,
      `is-size-3`,
      `is-size-4`,
      `is-size-5`,
      `is-size-6`,
      `is-size-7`,
      `is-size-8`,
    )
    if (height === `1`) return
    this.rawText.classList.add(`is-size-${height}`)
  }
  /**
   * Link stylesheets for 'ANSI color palette'.
   */
  async linkAnsiColorPalette() {
    const path = `../css`,
      depth = this.ecma48.colorDepth,
      url = chrome.runtime.getURL,
      link4bit = `retrotxt-4bit`
    ecma48.colorDepth = depth
    switch (depth) {
      case trueColor:
      case bit8Color:
        this.palette.key = `xterm`
        this.palette.set()
        document.getElementById(link4bit).href = url(
          this.palette.savedFilename(),
        )
        break
      case 3:
        document.getElementById(link4bit).href = url(
          `${path}/text_colors_cga_1.css`,
        )
        break
      case 2:
        document.getElementById(link4bit).href = url(
          `${path}/text_colors_cga_0.css`,
        )
        break
      case 1:
        document.getElementById(link4bit).remove()
        break
      case 0:
        document.getElementById(link4bit).href = url(
          `${path}/text_colors_gray.css`,
        )
        break
    }
    // handle 8-bit stylesheet
    switch (depth) {
      case trueColor:
      case bit8Color:
        break
      default:
        document.getElementById(`retrotxt-8bit`).remove()
    }
    // ice colors
    if (ecma48.iceColors === true)
      this.head.append(
        CreateLink(this.palette.savedFilename(true), `${link4bit}-ice`),
      )
  }
  /**
   * Toggle any stylesheet fixes.
   */
  async linkFixTextPairs() {
    // colour choices
    if (typeof this.results.colorsTextPairs !== `string`) return
    if (document.getElementById(`white-bg-fixes`) !== null) return
    switch (this.results.colorsTextPairs) {
      case `theme-atarist`:
      case `theme-windows`:
        this.head.append(
          CreateLink(`../css/text_colors_white_bg-fixes.css`, `white-bg-fixes`),
        )
        break
    }
  }
  /**
   * Apply saved options kept in the Extension localStorage.
   */
  restore() {
    this._restoreAccurate9pxFonts()
    this._restoreBackgroundScanlines()
    this._restoreBlinkingCursorText()
    this._restoreCenterAlign()
    this._restoreFont()
    this._restoreTextSize()
    this._restoreLineheight()
    this._restorePallete()
    this._restorePageWrap()
    this._restoreRender()
    this._restoreTextPairs()
  }
  async _restoreAccurate9pxFonts() {
    const fonts = this.results.textAccurate9pxFonts
    if (`${fonts}` === `false`) return this.clickAccurate9pxFonts()
    if (StringToBool(fonts) === null)
      return this._restoreErr(`textAccurate9pxFonts`)
  }
  async _restoreBackgroundScanlines() {
    const bsl = this.results.textBackgroundScanlines
    if (`${bsl}` === `true`) {
      const toggle = bsl
      ToggleScanlines(toggle, this.body)
    } else if (StringToBool(bsl) === null)
      this._restoreErr(`textBackgroundScanlines`)
  }
  async _restoreBlinkingCursorText() {
    const ba = this.results.textBlinkingCursor
    if (`${ba}` === `false`) return this.clickBlinkingCursorText()
    if (StringToBool(ba) === null) return this._restoreErr(`textBlinkingCursor`)
  }
  async _restoreCenterAlign() {
    const center = this.results.textCenterAlign
    if (`${center}` === `true`) return this.clickCenterAlign(true)
    if (`${center}` === `false`) return this.clickCenterAlign(false)
    if (StringToBool(center) === null)
      return this._restoreErr(`textCenterAlign`)
  }
  async _restoreFont() {
    // Shift_JIS requires the Mono font family and overrides the user's font selection
    if (document.characterSet.toLowerCase() === Cs.Shift_JIS) {
      const fonts = new FontFamily(`MONA`)
      return fonts.swap(this.rawText)
    }
    const rf = this.results.fontFamilyName
    if (typeof rf === `string`) {
      const fonts = new FontFamily(rf)
      return fonts.swap(this.rawText)
    }
    this._restoreErr(`fontFamilyName`)
  }
  async _restoreTextSize() {
    const ts = this.results.textFontSize
    if (typeof ts === `string`) return this.clickTextSize(ts)
    this._restoreErr(`textFontSize`)
  }
  async _restoreLineheight() {
    const lh = this.results.textLineHeight
    if (typeof lh === `string`) return this.clickLineHeight(lh)
    this._restoreErr(`lineHeight`)
  }
  async _restorePallete() {
    if (this.format === ANSIText) {
      if (typeof this.results.colorsAnsiColorPalette === `string`)
        return this.clickAnsiColorPalette()
      this._restoreErr(`colorsAnsiColorPalette`)
    }
  }
  async _restorePageWrap() {
    const wrap = this.results.ansiPageWrap
    if (`${wrap}` === `true`) return this.clickPageWrap()
    if (StringToBool(wrap) === null) return this._restoreErr(`ansiPageWrap`)
  }
  async _restoreRender() {
    const te = this.results.textRenderEffect
    if (typeof te === `string`) {
      const effect = te
      return ToggleTextEffect(effect, this.article)
    }
    // 10-Feb-2024 Changed to use the new textRenderEffect setting boolean type
    if (typeof te === `boolean` && te === true) {
      return ToggleTextEffect(`shadowed`, this.article)
    }
    if (typeof te === `boolean` && te === false) {
      return ToggleTextEffect(`normal`, this.article)
    }
    if (typeof te !== `string` || typeof te !== `boolean`)
      this._restoreErr(`textRenderEffect`)
  }
  async _restoreTextPairs() {
    const rc = this.results.colorsTextPairs
    if (typeof rc === `string`) {
      this.backgroundColor = rc
      this.clickTextPairs()
    } else this._restoreErr(`colorsTextPairs`)
  }
  async _restoreErr(id) {
    CheckError(
      `Could not obtain the required ${id} setting to apply execute RetroTxt.`,
      true,
    )
  }
  async _toggleOn(elm = document.createElement(null)) {
    elm.textContent = `On`
    elm.classList.add(`has-text-success`)
    elm.classList.remove(`has-text-warning`)
  }
  async _toggleOff(elm = document.createElement(null)) {
    elm.textContent = `Off`
    elm.classList.add(`has-text-warning`)
    elm.classList.remove(`has-text-success`)
  }
}

/**
 * Builds metadata from plain text.
 * @class Input
 */
class Input {
  /**
   * Creates an instance of Input.
   * @param [encoding=``] Document page encoding
   * @param [text=``] Plain text
   */
  constructor(encoding = ``, text = ``) {
    const guess = new Guess(text)
    this.BOM = guess.byteOrderMark()
    this.characterSet = `${document.characterSet}`
    this.encoding = encoding
    this.format = FindControlSequences(text)
    this.length = text.length
    this.text = `${text}`
    // replace the document page encoding
    if (this.BOM.length > 0) this.encoding = this.BOM
  }
}
/**
 * SAUCE metadata
 * Standard Architecture for Universal Comment Extensions
 * see: http://www.acid.org/info/sauce/sauce.htm
 *
 * To reduce the memory footprint when handling large text files. The SauceMeta
 * text is an object pointing to the in-memory location, instead of duplicating
 *  the text using a primitive string.
 * @class SauceMeta
 */
class SauceMeta {
  /**
   * Creates an instance of SauceMeta.
   * @param [input={}] Input class object
   */
  constructor(input = { text: `` }) {
    this.text = input.text
    this.length = input.text.length
    this.commentLines = ``
    this.sliced = ``
    this.html = null
    // SAUCE items
    this.id = ``
    this.version = ``
    this.title = ``
    this.author = ``
    this.group = ``
    this.date = ``
    this.fileSize = ``
    this.dataType = ``
    this.fileType = ``
    this.TInfo1 = ``
    this.TInfo2 = ``
    this.TInfo3 = ``
    this.TInfo4 = ``
    this.comments = ``
    this.TFlags = ``
    this.TInfoS = ``
    // data containers
    this.configs = {
      flags: `00000000`,
      iceColors: `0`,
      letterSpacing: `00`,
      aspectRatio: `00`,
      codePage: ``,
      fontFamily: ``,
      fontName: ``,
      length: 0,
      width: 0,
    }
    this.dates = {
      ccyymmdd: `00000000`,
      year: 0,
      month: 0,
      day: 0,
    }
    this.positions = {
      length: null,
      sauceIndex: null,
      comntIndex: null,
    }
    // A rudimentary Map of ANSI/ASCII groups linked to 16colo.rs crew ids.
    // This is not too useful as most artists don't include their group as metadata.
    this.sixteenColors = new Map()
      .set(`acid`, `acid`)
      .set(`a.m.i.s.h`, `amish`)
      .set(`amish`, `amish`)
      .set(`apathy`, `apathy`)
      .set(`black maiden`, `black maiden`)
      .set(`blender!`, `blender`)
      .set(`blocktronics`, `blocktronics`)
      .set(`cia`, `cia`)
      .set(`fuel`, `fuel`)
      .set(`glue`, `glue`)
      .set(`ice`, `ice`)
      .set(`impure`, `impure`)
      .set(`lazarus`, `lazarus`)
      .set(`lazarus7`, `lazarus`)
      .set(`mistigris`, `mistigris`)
      .set(`remorse`, `remorse`)
      .set(`sac`, `sac`)
      .set(`seviin`, `seviin`)
      .set(`titan`, `titan`)
      .set(`zenith`, `zenith`)
    // match SAUCE font families to RetroTxt fonts
    this.sauceFonts = new Map()
      // Standard hardware font on VGA cards for 80×25 text mode (code page 437)
      // IBM VGA  9×16
      .set(`IBM VGA`, ibmVGA)
      // Standard hardware font on VGA cards for condensed 80×50 text mode (code page 437)
      // IBM VGA50  9×8
      .set(`IBM VGA50`, ibmVGA50)
      // Custom font for emulating 80×25 in VGA graphics mode 12 (640×480 16 color) (code page 437)
      // IBM VGA25G	8×19
      // ast_premiumexec is a 8x19, 640x480 font that replicates the VGA characters
      .set(`IBM VGA25G`, ibmVGA25G)
      // Standard hardware font on EGA cards for 80×25 text mode (code page 437)
      // IBM EGA  8×14
      .set(`IBM EGA`, ibmEGA)
      // Standard hardware font on EGA cards for condensed 80×43 text mode (code page 437)
      // IBM EGA43  8×8
      .set(`IBM EGA43`, ibmEGA43)
      // Original Amiga Topaz Kickstart 1.x font. (A500, A1000, A2000)
      .set(`Amiga Topaz 1`, topaz1)
      // Modified Amiga Topaz Kickstart 1.x font. (A500, A1000, A2000)
      .set(`Amiga Topaz 1+`, topaz1_)
      // Original Amiga Topaz Kickstart 2.x font (A600, A1200, A4000)
      .set(`Amiga Topaz 2`, topaz2)
      // Modified Amiga Topaz Kickstart 2.x font (A600, A1200, A4000)
      .set(`Amiga Topaz 2+`, topaz2_)
      // Original P0T-NOoDLE font.
      .set(`Amiga PoT-NOoDLE`, potNoodle)
      .set(`Amiga P0T-NOoDLE`, potNoodle)
      // Original MicroKnight font.
      .set(`Amiga MicroKnight`, microknight)
      // Modified MicroKnight font.
      .set(`Amiga MicroKnight+`, microknight_)
      // Original mOsOul font.
      .set(`Amiga mOsOul`, mosoul)
      // Original PETSCII font in shifted mode. Shifted mode (text) has both uppercase and lowercase letters. This mode is actuated by pressing Shift+Commodore key.
      .set(`C64 shifted`, commodore64)
      // Original Commodore PETSCII font (PET, VIC-20, C64, CBM-II, Plus/4, C16, C116 and C128) in the unshifted mode. Unshifted mode (graphics) only has uppercase letters and additional graphic characters. This is the normal boot font.
      .set(`C64 unshifted`, commodore64)
      // Original ATASCII font (Atari 400, 800, XL, XE)
      .set(`Atari`, atascii)
    // initialise sauce metadata
    if (this.length > 500) {
      this._find()
      this._slice()
      this._fontFamily()
      this._fontCodePage()
    }
  }
  /**
   * Validate the SAUCE record.
   */
  valid() {
    if (this.id === `SAUCE00`) return true
    return false
  }
  /**
   * Parse and converts SAUCE metadata to HTML for page display.
   * @returns HTMLElement or `null`
   */
  _constructHeaderDiv() {
    const now = new Date(),
      months = [
        `January`,
        `February`,
        `March`,
        `April`,
        `May`,
        `June`,
        `July`,
        `August`,
        `September`,
        `October`,
        `November`,
        `December`,
      ],
      the = {
        year: this.dates.year,
        month: this.dates.month,
        day: this.dates.day,
        string: ``,
      }
    let joiner = `by `,
      body = ``
    // parse SAUCE version
    if (this.version !== `00`) return null
    // title
    if (this.title.trim() !== ``) body += ` '${this.title}' `
    // authors
    if (this.author.trim() !== ``) {
      body += ` by '${this.author}' `
      joiner = `of `
    }
    // group
    const group = this.group.trim()
    if (group !== ``) body += ` ${joiner} ${group} `
    // date
    if (this.dates.ccyymmdd.trim() !== ``) {
      if (the.year > 1980 && the.year <= now.getFullYear()) {
        if (the.day > 0 && the.day <= 31 && the.month > 0 && the.month <= 12)
          the.string = ` ${months[the.month - 1]} ${the.day} `
        body = body.trim()
        if (body.length > 0) body += `, dated ${the.year} ${the.string}`
        else body = `Dated ${the.year} ${the.string}`
      }
    }
    // create elements
    const div = document.createElement(`div`)
    div.append(document.createElement(`hr`))
    // sauce metadata
    const sauce = document.createElement(`div`)
    sauce.id = `sauce00Data`
    sauce.textContent = body.trim()
    // append 16colo.rs crew link
    if (this.sixteenColors.has(group.toLowerCase())) {
      const id = this.sixteenColors.get(group.toLowerCase()),
        link = document.createElement(`a`)
      link.setAttribute(`href`, `https://16colo.rs/tags/group/${id}`)
      link.textContent = `16colo.rs/${id}`
      sauce.append(` `, link)
    }
    // author comments
    const commt = document.createElement(`div`)
    commt.id = `SAUCE00-comment`
    commt.classList.add(`is-hidden`)
    commt.textContent = this.commentLines.trim()
    if (body.length <= 0) return null
    div.append(sauce)
    if (this.commentLines.trim() !== ``) {
      commt.classList.remove(`is-hidden`)
      div.append(commt)
    }
    return div
  }
  /**
   * Remove malformed metadata from data.
   * @param [data=``] Text to clean
   * @returns string
   */
  _clean(data = ``) {
    // note: do NOT delete the space in this RegExp, or SAUCE embedded documents will fail
    return data.replace(/[^A-Za-z0-9 ]/g, ``)
  }
  /**
   * Discovers and parses any SAUCE metadata contained in the text.
   */
  _find() {
    // scan the last 2500 characters of the text for a SAUCE identifier
    let scanLength = 2500
    if (this.length < scanLength) scanLength = this.length
    const search = this.text.slice(this.length - scanLength, this.length),
      start = search.indexOf(`SAUCE00`) - scanLength,
      comntStart = search.lastIndexOf(`COMNT`)
    // data containers
    this.positions = {
      length: this.length,
      sauceIndex: this.length + start,
      comntIndex: this.length - comntStart,
    }
    // when no `COMNT` is found, delete the position index
    if (comntStart === -1) this.positions.comntIndex = 0
    // binary zero is represented as Unicode code point 65533 (�),
    // referred to as the 'replacement character'.
    // RegExp pattern to find all binary zeros
    const binaryZero = new RegExp(String.fromCharCode(65533), `g`)
    // search the last 2500 characters for a SAUCE record
    this.sliced = this.text.slice(start, this.length)
    this._extract()
    // when no SAUCE identifier is found
    if (this.id !== `SAUCE00`) {
      this.positions.length = 0
      this.positions.sauceIndex = 0
      this.positions.comntIndex = 0
      return this
    }
    // handle the date
    this.dates.ccyymmdd = this.date
    this.dates.year = parseInt(this.date.slice(0, 4))
    this.dates.month = parseInt(this.date.slice(4, 6))
    this.dates.day = parseInt(this.date.slice(6, 8))
    // handle ANSiFlags
    // see http://www.acid.org/info/sauce/sauce.htm#ANSiFlags
    // get binary representation of character
    this.configs.flags = this.TFlags.charCodeAt(0).toString(2)
    // pad with leading 0s to make an 8-bit binary string
    switch (this.configs.flags) {
      case `1010`:
        this.configs.letterSpacing = `10`
        this.configs.iceColors = `1`
        break
      case `1100`:
        this.configs.letterSpacing = `10`
        this.configs.iceColors = `0`
        break
      case `1111111111111101`:
      case `1011`:
      case `101`:
      case `11`:
      case `1`:
        this.configs.letterSpacing = `01`
        this.configs.iceColors = `1`
        break
      case `10`:
        this.configs.letterSpacing = `01`
        this.configs.iceColors = `0`
        break
      default:
        if (this.configs.flags.length === 5) {
          this.configs.aspectRatio = this.configs.flags.slice(0, 2)
          this.configs.letterSpacing = this.configs.flags.slice(2, 4)
          this.configs.iceColors = this.configs.flags.charAt(4)
        } else if (!isNaN(Number(this.configs.flags)))
          console.log(`New ANSiFlags found: '%s'.`, this.configs.flags)
    }
    // handle font name
    this.configs.fontName = this.TInfoS.replace(binaryZero, ``)
    // document length (ignored) & width
    if (typeof TextEncoder === `function`) {
      // see http://ourcodeworld.com/articles/read/164/how-to-convert-an-uint8array-to-string-in-javascript
      const textEncoder = new TextEncoder(),
        text = `${this.TInfo1.replace(binaryZero, ``)[0]}`
      // 6/Oct/20: encodeInto is still experimental and fails on some conversions
      const bytes = new Uint8Array(text.length)
      textEncoder.encodeInto(text, bytes)
      // this is a hacked workaround for issue 44.
      // https://github.com/bengarrett/RetroTxt/issues/44
      let byteSequence = Array.from(bytes).join()
      // fallback incase encodeInto returns a 0 value
      if ([``, `0`].includes(byteSequence))
        byteSequence = textEncoder.encode(text).join()
      // these sets contain uint8array byte sequences
      //  and their matching column values
      const widths = new Map()
        .set(`117,110,100,101,102,105,110,101,100`, `80`)
        .set(`226,128,147`, `150`)
        .set(`226,128,157`, `148`)
        .set(`226,128,153`, `146`)
        .set(`226,128,161`, `135`)
        .set(`226,128,158`, `132`)
        .set(`194,170`, `1450`)
        .set(`194,188`, `700`)
        .set(`194,169`, `169`)
        .set(`194,164`, `420`)
        .set(`195,186`, `250`)
        .set(`195,180`, `500`)
        .set(`195,176`, `240`)
        .set(`195,156`, `220`)
        .set(`195,146`, `210`)
        .set(`208,168`, `200`)
        .set(`195,136`, `200`)
        .set(`194,191`, `447`)
        .set(`194,187`, `187`)
        .set(`194,180`, `180`)
        .set(`194,162`, `162`)
        .set(`194,160`, `160`)
        .set(`194,144`, `144`)
        .set(`197,146`, `140`)
        .set(`197,160`, `138`)
        .set(`104`, `360`)
        .set(`94`, `350`)
        .set(`91`, `80`)
        .set(`80`, `80`)
      // any malformed width values that are less than 80, will cause
      // false positives for other text that share these actual widths
      // TODO: add a notice allowing people to toggle between the possible widths,
      // ie: Switch to either 64 or 320 columns and save the choice to localStorage
      const largePiece = 15000
      if (this.length > largePiece) {
        widths.set(`69`, `325`).set(`64`, `320`).set(`32`, `800`)
      }
      // 44px width is a common size for FILE_ID.DIZ/FILE_ID.ANS
      const fileIDMaximumLength = 5000 // an arbitrary value 🤷
      if (this.length > fileIDMaximumLength) widths.set(`44`, `300`)
      const columns = widths.get(`${byteSequence}`)
      if (typeof columns === `undefined`) {
        if (byteSequence !== ``)
          console.log(`New width byte sequence`, byteSequence)
        this.configs.width = `${byteSequence.split(`,`)[0]}`
      } else this.configs.width = `${columns}`
    }
    // comment lines
    const maxLines = 255,
      lineSize = 64
    if (comntStart > -1 && comntStart - start < maxLines * lineSize) {
      this.commentLines = search.slice(
        comntStart + `COMNT`.length,
        search.indexOf(`SAUCE00`),
      )
    }
  }
  /**
   * Determine the RetroTxt font family to use.
   */
  _fontFamily() {
    if (this.version !== `00`) return
    const fontValue = `${this.configs.fontName}`
    // clean-up any malformed data
    const font = fontValue.replace(/[^A-Za-z0-9 +/-]/g, ``)
    // These 2 bits can be used to select the 8 pixel or 9 pixel variant of a particular font
    // 00: Legacy value. No preference.
    // 01: Select 8 pixel font.
    // 10: Select 9 pixel font.
    const pixel8 = `01`,
      pixel9 = `10`
    if (font === `IBM VGA`) {
      switch (this.configs.letterSpacing) {
        case pixel8:
          return (this.configs.fontFamily = ibmVGA8)
        case pixel9:
          return (this.configs.fontFamily = ibmVGA)
      }
    }
    if (font === `IBM VGA50`) {
      switch (this.configs.letterSpacing) {
        case pixel8:
          return (this.configs.fontFamily = ibmVGA508)
        case pixel9:
          return (this.configs.fontFamily = ibmVGA50)
      }
    }
    // default font family to use if no font information exists
    if (fontValue === ``)
      return (this.configs.fontFamily = this.sauceFonts.get(`IBM VGA`))
    // get local font
    this.configs.fontFamily = this.sauceFonts.get(font) || ``
  }
  /**
   * Returns a suitable codepage to use based on the supplied SAUCE font family.
   */
  _fontCodePage() {
    const font = `${this.configs.fontName}`,
      fonts = new Map()
        .set(`Amiga`, Cs.OutputCP1252)
        .set(`Atari`, Cs.Windows_1252_English)
        .set(`DOS`, Cs.DOS_437_English)
        .set(`special`, Cs.ISO8859_5),
      split = this._clean(font).split(` `),
      fontName = split[0]
    let codePage = ``
    if (fonts.has(fontName))
      return (this.configs.codePage = fonts.get(fontName))
    if (fontName === `IBM`) {
      // Chrome special case for when it confuses CP437 ANSI as ISO-8859-5
      if (
        WebBrowser() === Engine.chrome &&
        document.characterSet === `ISO-8859-5`
      )
        this.configs.codePage = fonts.get(`special`)
      const iso8859_1 = `819`
      if (split[2] === iso8859_1) codePage = fonts.get(`Amiga`)
      else codePage = fonts.get(`DOS`)
    }
    this.configs.codePage = codePage
  }
  /**
   * Extracts SAUCE metadata from sliced text.
   */
  _extract() {
    const text = this.sliced,
      binaryZero = new RegExp(String.fromCharCode(65533), `g`)
    if (typeof text !== `string`)
      CheckArguments(`this.sliced`, `string`, this.sliced)
    this.id = text.slice(0, 7)
    if (this.id !== `SAUCE00`)
      return console.log(`SAUCE metadata ID check failed, _extract aborted.`)
    // string values
    this.version = text.slice(5, 7) // 2 bytes
    this.title = text.slice(7, 42).trim() // 35 bytes
    this.title = this.title.replace(binaryZero, ``)
    this.author = text.slice(42, 62).trim() // 20 bytes
    this.author = this.author.replace(binaryZero, ``)
    this.group = text.slice(62, 82).trim() // 20 bytes
    this.group = this.group.replace(binaryZero, ``)
    this.date = text.slice(82, 90).trim() // 8 bytes
    this.TInfoS = text.slice(106, 128) // 22 bytes
    this.cType = text.slice(90, 106) // 16 bytes
    // binary values
    // note: these are not always accurate due to the source files being
    // loaded as text rather than binary data
    this.fileSize = text.slice(90, 94)
    this.dataType = text.slice(94, 95)
    this.fileType = text.slice(95, 96)
    this.TInfo1 = text.slice(96, 98)
    this.TInfo2 = text.slice(98, 100)
    this.TInfo3 = text.slice(100, 102)
    this.TInfo4 = text.slice(102, 104)
    this.comments = text.slice(104, 105)
    this.TFlags = text.slice(105, 106)
  }
  /**
   * Extracts text comments from SAUCE.
   */
  _slice() {
    if (this.valid()) {
      // creates HTML
      this.html = this._constructHeaderDiv()
      // remove sauce record from text
      const i = this.positions.comntIndex
      if (i > 0 && i < this.positions.sauceIndex) {
        // re-evaluate location of `COMNT` and remove it from text
        const cmnt = this.text.lastIndexOf(`COMNT`)
        this.text = this.text.slice(0, cmnt)
      } else {
        // re-evaluate location of SAUCE and remove it from text
        const sauce = this.text.lastIndexOf(`SAUCE00`)
        this.text = this.text.slice(0, sauce)
      }
      // Clean up lead padding, which can cause malformed escape sequences in ANSI text.
      // Look for a fixed DLE, SUB character sequence and trim the text.
      // note: regex and indexOf do not work with C0 control characters
      const slice = this.text.slice(-6)
      if (slice.codePointAt(0) === 10 && slice.codePointAt(1) === 26)
        this.text = this.text.slice(0, -6)
      else if (slice.codePointAt(1) === 10 && slice.codePointAt(2) === 26)
        this.text = this.text.slice(0, -5)
    }
  }
}
/**
 * HTML mark-up output.
 * @class Output
 */
class Output {
  /**
   * Creates an instance of Output.
   * @param [sauce={}] SAUCE class object
   * @param [dom={}] DOM class object
   */
  constructor(sauce = {}, dom = {}) {
    const config = new Configuration()
    this.article = document.createElement(`article`)
    this.encode = this.newBold()
    this.encode.id = `documentEncoding`
    this.main = document.createElement(`main`)
    this.pre = document.createElement(`pre`)
    this.slice = sauce.text
    // assume 80 for all text formats
    this.columns = config.textRender.get(`columns`)
    this.rows = 0
    // data objects
    this.data = {
      cs: ``,
      cp: {},
      errs: 0,
      html: ``,
      oths: 0,
      sauce: sauce.html,
    }
    this.dom = dom
    this.ecma48 = {}
    this.sauce = sauce
  }
  /**
   * Append an underscore cursor.
   */
  cursor() {
    const span = this.newSpan()
    span.classList.add(`dos-cursor`)
    span.textContent = `_`
    this.pre.append(span)
  }
  /**
   * ECMA48 data.
   */
  ecma48Data() {
    this.ecma48 = new Controls(`${this.data.html}`, this.sauce)
    this.ecma48.parse()
    this._ecma48Statistics()
    // font override
    sessionStorage.removeItem(`lockFont`)
    const font = this.ecma48.font
    if (typeof font === `undefined`)
      CheckError(
        `🖫 'this.ecma48.font' should have returned a font value or 'null' but instead returned ${this.ecma48.font}.`,
      )
    else if (font !== null) {
      const family = new FontFamily(font)
      // fonts.swap() needs to run before setting the sessionStorage
      family.swap(this.pre)
      sessionStorage.setItem(`lockFont`, `true`)
    }
    // colour palette
    this.dom.ecma48 = this.ecma48
    this.dom.linkAnsiColorPalette()
    // parse text & insert it into the browser tab
    if (typeof this.data.html === `string`) {
      const html = ParseToChildren(this.data.html)
      this.pre.append(html)
    } else
      CheckError(
        `Expecting a string type for output.data.html but instead it is ${typeof this
          .data.html}.`,
      )
    return this.ecma48
  }
  /**
   * Prints ECMA48 error statistics to the browser console.
   */
  ecma48Errors() {
    const oths = this.data.oths,
      errs = this.data.errs,
      warning = 4
    if (oths > 0 || errs > 0) {
      // construct error message
      const errorCount = oths + errs
      let msg = ``
      if (oths > 0) {
        msg += `${oths} unsupported function`
        if (oths > 1) msg += `s`
      }
      if (oths > 0 && errs > 0) msg += ` and `
      if (errs > 0) {
        msg += `${errs} unknown control`
        if (errs > 1) msg += `s`
      }
      msg += ` found.`
      // display as feedback
      if (errorCount <= warning) return console.info(msg)
      // display in console
      msg += `\nThe display of the ANSI is inaccurate!`
      console.info(msg)
    }
  }

  /**
   * Creates information on the input, output codepage, and text encoding.
   * @param input Input text object
   * @param width With for the <pre> element
   */
  headerEncoding(input, width = ``) {
    // lock centring alignment to 640px columns
    this.article.style.width = width
    const chrset = input.characterSet
    if (chrset === null) return
    const fonts = new FontFamily(),
      text = { in: ``, out: `` },
      elm = {
        ansi: document.createElement(`span`),
        in: document.createElement(`span`),
        out: document.createElement(`span`),
      },
      stored = { item: null, text: `` },
      vs = `→`
    // obtain transcode setting
    stored.item = sessionStorage.getItem(`lockTranscode`)
    // ==============================================
    // 'Document encoding determined by this browser'
    // ==============================================
    const inputEncoding = new BrowserEncodings(input.characterSet),
      inputChars = new Characters(inputEncoding.label())
    text.in = inputChars.compactIn()
    elm.in.textContent = text.in
    elm.in.title = inputChars.titleIn(input.characterSet)
    if (inputEncoding.support() === false) this._headerUnknown(elm.in, chrset)
    else this.encode.addEventListener(`click`, this._setEncoding)
    // ==============================================
    // 'Page encoding output'
    // ==============================================
    const chars = new Characters(`${this.data.cs}`)
    if (stored.item !== null) chars.key = `${stored.item}`
    const title = this._headerTitle(stored, text, chars, inputEncoding.label())
    elm.out.textContent = text.out
    elm.out.title = chars.titleOut(title)
    // ==============================================
    // handle codepages that require specific fonts
    // ==============================================
    switch (text.in) {
      // these cases will override the user saved font choices
      case `SHIFT_JIS`:
        elm.out.textContent = ``
        elm.out.title = ``
        fonts.key = `MONA`
        fonts.swap(this.pre)
        break
      default:
        this._headerTranscode(stored, elm, text)
    }
    this.encode.append(elm.in)
    if (input.format === ANSIText) {
      this.encode.append(vs, elm.out)
      elm.ansi.title = `ECMA-48/ANSI X3.64 presentation control and cursor functions`
      elm.ansi.textContent = `ANSI`
      this.encode.append(` `, elm.ansi)
    } else if (elm.out.textContent !== ``) {
      this.encode.append(vs, elm.out)
    }
    if (typeof qunit !== `undefined`) return elm
  }
  newBold() {
    return document.createElement(`strong`)
  }
  newDiv() {
    return document.createElement(`div`)
  }
  newHead() {
    return document.createElement(`header`)
  }
  newKBD() {
    return document.createElement(`kbd`)
  }
  newSpan() {
    return document.createElement(`span`)
  }
  preInit() {
    this.pre.id = `styledDocument`
    this.pre.classList.add(`text-1x`)
  }
  /**
   * Rebuild text with a new character encoding.
   */
  rebuildCharacterSet() {
    const characterSet = `${this.data.cs}`,
      sessionItem = sessionStorage.getItem(`lockTranscode`)
    // The Transcode() class is found in parse_dos.js
    const transcode = new Transcode(`${characterSet}`, `${this.slice}`)
    this.slice = ``
    this.sauce.text = ``
    // count number of rows (lines of text)
    const rowCount = (text = this.data.html) => {
      return text.trim().split(/\r\n|\r|\n/).length
    }
    // Transcode this text user override
    if (sessionItem !== null) {
      // US-ASCII transcode value simply returns the input text.
      // Other transcode selections require the text to be rebuilt based on the
      // sessionItem value.
      if (sessionItem !== Cs.OutputUS_ASCII) transcode.rebuild(sessionItem)
      this.data.html = transcode.text
      return (this.rows = rowCount())
    }
    // SAUCE code page override
    const scp = this.sauce.configs.codePage
    if (scp !== `` && scp !== Cs.DOS_437_English) {
      transcode.rebuild(scp)
      this.data.html = transcode.text
      return (this.rows = rowCount())
    }
    let newCodePage = characterSet
    if (characterSet.slice(-1) === Cs.TranscodeToggle)
      newCodePage = characterSet.slice(0, -1)
    // Characters() class is found in functions.js
    const characters = new Characters(newCodePage)
    // Normalise text where `document.characterSet` is supplied, i.e WINDOWS-1250
    if (characters.supportedEncoding() === true) {
      const text = new DOSText(`${transcode.text}`, {
        codepage: `${characters.getEncoding(newCodePage)}`,
      })
      this.data.html = text.normalize()
      return (this.rows = rowCount())
    }
    // normalise text where code page key is supplied, i.e Windows_1252_English
    if (characters.support() === true) {
      const text = new DOSText(`${transcode.text}`, { codepage: newCodePage })
      this.data.html = text.normalize()
      return (this.rows = rowCount())
    }
    CheckError(
      `'${newCodePage}' is not a valid rebuildCharacterSet() identifier.`,
      false,
    )
  }
  /**
   * Sets the transcode character encoding and reloads the browser tab.
   */
  _setEncoding() {
    const sessionItem = sessionStorage.getItem(`lockTranscode`)
    switch (sessionItem) {
      case Cs.OutputCP1252: // cp_1252➡
        sessionStorage.setItem(`lockTranscode`, Cs.OutputISO8859_15)
        break
      case Cs.OutputISO8859_15: // iso_8859_15➡
        sessionStorage.setItem(`lockTranscode`, Cs.OutputUS_ASCII)
        break
      case Cs.OutputUS_ASCII: // us_ascii➡
        sessionStorage.setItem(`lockTranscode`, Cs.Windows_1252_English)
        break
      case Cs.Windows_1252_English: // cp_1252
        sessionStorage.setItem(`lockTranscode`, Cs.ISO8859_5)
        break
      case Cs.ISO8859_5: // iso_8859_5
        sessionStorage.removeItem(`lockTranscode`)
        break
      default: // none or automatic
        sessionStorage.setItem(`lockTranscode`, Cs.OutputCP1252)
    }
    // reload the active tab
    Console(`Tab will be refreshed with a new character set.`)
    globalThis.location.reload()
    return
  }
  /**
   * ECMA48 statistics.
   */
  _ecma48Statistics() {
    const cols = this.ecma48.columns,
      maxColumns = 999,
      sauceBug = 180
    if (cols === maxColumns && this.sauce.configs.width >= sauceBug)
      this.columns = null
    else this.columns = cols
    this.rows = this.ecma48.rows
    // this copies the string and increases the memory heap
    this.data.html = this.ecma48.htmlString
    // empty the string to reduce memory usage
    this.ecma48.htmlString = ``
    this.data.oths = this.ecma48.otherCodesCount
    this.data.errs = this.ecma48.unknownCount
  }
  _headerUnknown(span = HTMLSpanElement, chrset = ``) {
    // this class highlights the `characterSet` string
    span.textContent = `unsupported ${chrset}`
    span.classList.add(`has-text-warning`)
    span.title = `The browser has choosen to use an unsupported legacy character set`
  }
  _headerTitle(stored, text, chrs, label) {
    const key = `${chrs.key}`,
      out = new BrowserEncodings(chrs.key)
    // matches the `Characters.output` Map
    // i.e OutputISO8859_1 that is supplied by this Extension
    if (chrs.outputs.has(key)) {
      stored.text = chrs.compactOut()
      text.out = chrs.compactOut()
      return chrs.titleOut()
    }
    // matches the `Document.characterSet` property supplied by the browser
    // i.e ISO-8859-1, UTF-8, WINDOWS-1252, etc
    if (out.support()) {
      // append an arrow to label, i.e iso-8859-1➡
      const newLabel = `${out.label()}${Cs.TranscodeToggle}`
      // make sure input encoding doesn't match output encoding
      // i.e CP1252 → CP1252
      if (chrs.outputs.has(newLabel) && newLabel.slice(0, -1) !== label)
        chrs.key = out.label()
      else chrs.key = Cs.DOS_437_English
      stored.text = chrs.compactOut()
      text.out = chrs.compactOut()
      return chrs.titleOut()
    }
    // matches `Characters.labels` Map that is supplied by SAUCE metadata
    // i.e Cs.DOS_437_English
    if (chrs.support()) {
      stored.text = chrs.compactOut()
      text.out = chrs.compactOut()
      return chrs.titleOut()
    }
    return ``
  }
  _headerTranscode(stored, elm, text) {
    const old = document.createElement(`span`)
    switch (stored.item) {
      // transcode text `CP-1252 ⇉` and `ISO 8859-5 ⇉` selections
      case Cs.Windows_1252_English:
      case Cs.ISO8859_5:
        if (text.in === stored.text) {
          elm.in.classList.add(`has-text-underline`)
          elm.in.textContent = text.in
          return
        }
        old.textContent = text.in
        elm.in.append(old)
        elm.in.textContent = stored.text
        elm.in.title = `Unable to transcode this text using '${stored.text} ⇉'`
        elm.in.classList.add(`has-text-strike`)
        return
      // transcode text is set to `Browser default`
      default:
        // unsupported input
        if (text.in.length === 0) return
        // the standard output character set
        if (text.out === `CP437`) return
        // transcode text output enabled
        if (stored.text === text.out) {
          elm.out.classList.add(`has-text-underline`)
          elm.out.textContent = text.out
          return
        }
        if (stored.text !== ``) {
          // Transcode text selection is unsupported. A use case would be if the
          // localStorage has been edited using the browser developer tools.
          const old = document.createElement(`span`)
          old.textContent = text.out
          elm.out.append(old)
          elm.out.textContent = stored.text
          elm.out.classList.add(`has-text-strike`)
        }
    }
  }
}
/**
 * Information header.
 * Document and text details in a selectable header.
 * @class Information
 */
class Information extends Output {
  constructor(input = {}, output = {}, sauce = {}, ecma48 = {}) {
    super()
    // data class objects
    this.input = input
    this.output = output
    this.sauce = sauce
    this.ecma48 = ecma48
    // import html elements
    this.area = super.newSpan()
    this.font = super.newSpan()
    this.hide = super.newHead()
    this.hide.id = `headerMinimal`
    this.show = super.newHead()
    this.show.id = `headerReveal`
    this.size = super.newSpan()
  }
  /**
   * Construct the information header.
   * ⌘ + Option + u
   * Ctrl + u
   */
  async create() {
    const div1 = document.createElement(`div`),
      div2 = document.createElement(`div`)
    this._createToggle()
    this.append(div1)
    div1.append(
      this._info(`pixels`),
      this.area,
      this._sep(),
      this._info(`characters`),
      this.size,
      this._sep(),
      this._info(`encoding`),
      this.output.encode,
      this._sep(),
      this._label(`view original text`),
      this._keyboardShortcuts(),
    )
    this.append(div2)
    div2.append(
      this._label(`render`),
      this._setRender(),
      this._sep(),
      this._label(`fontname`),
      this.font,
    )
    if (this.input.format === ANSIText) {
      div2.append(
        this._sep(),
        this._label(`palette`),
        this._setPalette(),
        this._sep(),
        this._label(`iCE colors`),
        this._setIceColors(),
      )
      // append any ecma-48 errors
      const sum = this.ecma48.otherCodesCount + this.ecma48.unknownCount,
        errorTrigger = 10
      if (sum > errorTrigger) return this.append(this._setErrorBBS())
      if (sum > 0) return this.append(this._setWarningBBS())
    }
    div2.append(this._sep(), this._label(`page wrap`), this._setPageWrap())
  }
  append(element) {
    this.show.append(element)
  }
  /**
   * Document size notice.
   */
  createCharacterCount() {
    this.size.title = `Number of characters contained in the text`
    if (this.input.length === 0) {
      this.size.textContent = `None`
      return
    }
    this.size.textContent = HumaniseFS(this.input.length, 1000)
  }
  /**
   * Dynamic font in use notice.
   */
  createFontname() {
    const fonts = new FontFamily()
    if (this.input.characterSet.toLowerCase() === Cs.Shift_JIS) {
      fonts.key = `mona`
      fonts.set()
      return this._setFontname(fonts)
    }
    // ecma48 encode text
    const font = this.ecma48.font
    if (typeof font !== `undefined` && font !== null) {
      fonts.key = font
      fonts.set()
      return this._setFontname(fonts)
    }
    // ascii encoded text
    switch (this.sauce.version) {
      case `00`: {
        // use the font name contained in SAUCE metadata
        sessionStorage.removeItem(`lockFont`)
        const sauceFont = this.sauce.configs.fontFamily
        if (sauceFont === ``)
          return console.warn(
            `Could not obtain a font name from the SAUCE metadata.`,
          )
        fonts.key = sauceFont.toUpperCase()
        fonts.set()
        fonts.swap(this.output.pre)
        sessionStorage.setItem(`lockFont`, `true`)
        return this._setFontname(fonts)
      }
      default:
        // use the font selected in Options
        chrome.storage.local.get([`fontFamilyName`], (result) => {
          if (!(`fontFamilyName` in result))
            return CheckError(
              `🖫 Could not obtain the required fontFamilyName setting to apply the header.`,
              false,
            )
          fonts.key = result.fontFamilyName.toUpperCase()
          fonts.set()
          this._setFontname(fonts)
        })
    }
  }
  /**
   * Document measurements.
   */
  createPixels() {
    const columns = document.createElement(`span`),
      lines = document.createElement(`span`)
    columns.title = `Pixel width of text`
    columns.id = `widthOfText`
    lines.title = `Pixel length of text`
    lines.id = `lengthOfText`
    columns.textContent = `?`
    lines.textContent = `?`
    this.area.append(columns, "x", lines)
  }
  /**
   * Display and hide header switch.
   */
  _createToggle() {
    // hidden <header> element object
    const show = document.createElement(`strong`)
    show.id = `toggleDown`
    show.title = `Reveal the information header`
    show.textContent = `▼`
    const hide = document.createElement(`strong`)
    hide.id = `toggleUp`
    hide.title = `Hide this information header`
    hide.textContent = `▲`
    this.hide.append(show)
    this.show.append(hide)
  }
  _label(text = ``) {
    const s = document.createElement(`small`)
    s.textContent = `${text} `
    return s
  }
  _info(text = ``) {
    const s = document.createElement(`small`)
    s.textContent = `${text} `
    return s
  }
  _sep(chr = `·`) {
    const s = super.newSpan()
    s.classList.add(`has-text-grey-dark`)
    s.textContent = ` ${chr} `
    return s
  }
  _setErrorBBS() {
    const div = super.newDiv(),
      span = super.newSpan()
    span.textContent = `Unfortunately, this work of animated BBS art is too complicated to replicate as HTML`
    div.append(span)
    return div
  }
  /**
   * Font in use notice.
   * @param name Font family
   */
  _setFontname(fonts = FontFamily) {
    const family = `${fonts.family}`
    this.font.id = `fontnameInUse`
    this.font.textContent = `${family.replaceAll(`_`, ` `)}`
    this.font.classList.add(`font-${fonts.key.toLowerCase()}`)
    this.font.title = `${fonts.title(family)}`
  }
  _setIceColors() {
    const bold = super.newBold(),
      span = super.newSpan()
    bold.textContent = `On`
    bold.id = `toggleIceColors`
    span.title = `Toggle between blinking mode or static background ${chrome.i18n.getMessage(
      `color`,
    )}`
    span.append(bold)
    return span
  }
  _setPalette(colorDepth = this.ecma48.colorDepth) {
    const strong = super.newBold(),
      r = document.createElement(`span`),
      g = document.createElement(`span`),
      b = document.createElement(`span`)
    strong.id = `colorPaletteToggle`
    switch (colorDepth) {
      case trueColor:
        strong.title = `A range of 16.7 million ${chrome.i18n.getMessage(
          `color`,
        )}s using the RGB true ${chrome.i18n.getMessage(`color`)} palette`
        r.textContent = `R`
        r.classList.add(`has-text-danger`)
        g.textContent = `G`
        g.classList.add(`has-text-success`)
        b.textContent = `B`
        b.classList.add(`has-text-info`)
        strong.append(r)
        strong.append(g)
        strong.append(b)
        break
      case bit8Color:
        strong.title = `A range of 256 ${chrome.i18n.getMessage(
          `color`,
        )}s using the xterm palette`
        strong.textContent = `xterm 8-bit`
        break
      case bit4Color:
        strong.title = `Switch ANSI ${chrome.i18n.getMessage(`color`)} palettes`
        strong.textContent = `IBM`
        break
      case bit2Color:
        strong.textContent = `4 ${chrome.i18n.getMessage(`color`)} magenta`
        break
      case bit1Color:
        strong.textContent = `2 ${chrome.i18n.getMessage(`color`)} monochrome`
        break
      case 0:
        strong.textContent = `monochrome`
        break
    }
    return strong
  }
  _setPageWrap() {
    const bold = super.newBold(),
      span = super.newSpan()
    bold.textContent = ``
    bold.id = `togglePageWrap`
    span.title = `ANSI text will behave as HTML where lines can break to wrap the text to the tab.`
    span.append(bold)
    return span
  }
  _setRender() {
    const bold = super.newBold()
    bold.id = `renderToggle`
    bold.title = `Switch between text render methods`
    return bold
  }
  _setWarningBBS() {
    const div = super.newDiv(),
      span = super.newSpan()
    span.textContent = `This replication of BBS art to HTML is partly inaccurate`
    div.append(span)
    return div
  }
  _keyboardShortcuts() {
    const kbd = super.newKBD()
    kbd.textContent = `Ctrl+U`
    chrome.storage.local.get(`platform`, (store) => {
      const macOS = 1
      if (store.platform === macOS) kbd.textContent = `command+option+U`
    })
    return kbd
  }
}

/**
 * Switch the browser tab between RetroTxt's output and the raw text output.
 * @class Invoke
 */
class Invoke {
  constructor() {
    this.dom = new DOM()
  }
  toggle() {
    if (this.dom.cssLink === null) return
    if (this.dom.main.classList.contains(`is-hidden`)) return this.show()
    this.hide()
  }
  show() {
    Console(`Invoke.show()`)
    const defaultBG = `theme-msdos-bg`,
      defaultFG = `theme-msdos-fg`
    let body = sessionStorage.getItem(`bodyClass`)
    body = body === null ? defaultBG : body
    this._addClasses(this.dom.body, body)
    this._addBackground(this.dom.body)
    const main = sessionStorage.getItem(`mainClass`)
    this._addClasses(this.dom.main, main)
    let article = sessionStorage.getItem(`articleClass`)
    article = article === null ? defaultFG : article
    this._addClasses(this.dom.article, article)
    const hide = `is-hidden`
    this.dom.pre.classList.add(hide)
    this.dom.rawText.classList.remove(hide)
    this.dom.main.classList.remove(hide)
    return BusySpinner(false)
  }
  hide() {
    Console(`Invoke.hide()`)
    const body = this.dom.body
    this._removeBackground(body)
    sessionStorage.setItem(`bodyClass`, body.classList.value)
    this._removeClasses(body)
    const main = this.dom.main
    sessionStorage.setItem(`mainClass`, main.classList.value)
    this._removeClasses(main)
    const article = this.dom.article
    sessionStorage.setItem(`articleClass`, article.classList.value)
    this._removeClasses(article)
    const hide = `is-hidden`
    this.dom.pre.classList.remove(hide)
    this.dom.rawText.classList.add(hide)
    this.dom.main.classList.add(hide)
    return BusySpinner(false)
  }
  _addBackground(elm = HTMLElement) {
    const key = `bodyBackground`
    let color = sessionStorage.getItem(key)
    color = color === null ? `` : color
    sessionStorage.removeItem(key)
    if (color === ``) return
    elm.style.backgroundColor = `${color}`
  }
  _addClasses(elm = HTMLElement, values = ``) {
    for (const value of values.split(` `)) {
      if (value === ``) break
      elm.classList.add(`${value}`)
    }
  }
  _removeBackground(elm = HTMLElement) {
    const bg = `${elm.style.backgroundColor}`
    if (bg === ``) return
    sessionStorage.setItem(`bodyBackground`, bg)
    elm.style.removeProperty(`background-color`)
  }
  _removeClasses(elm = HTMLElement) {
    const values = elm.classList.value.split(` `)
    for (const value of values) {
      if (value === ``) continue
      elm.classList.remove(`${value}`)
    }
  }
}

/**
 * The Extension storage event handler.
 * @param change OnChanged `chrome.storage` object
 */
function handleChanges(change) {
  if (typeof change !== `object`) CheckArguments(`change`, `object`, change)
  const changes = {
    accurate9pxFonts: change.textAccurate9pxFonts,
    backgroundScanline: change.textBackgroundScanlines,
    blink: change.textBlinkingCursor,
    centerAlign: change.textCenterAlign,
    colorPalette: change.colorsAnsiColorPalette,
    columnWrap: change.ansiColumnWrap,
    customBackground: change.colorsCustomBackground,
    customForeground: change.colorsCustomForeground,
    dosControlGlyphs: change.textDOSControlGlyphs,
    fontname: change.fontFamilyName,
    info: change.settingsInformationHeader,
    lineHeight: change.textLineHeight,
    pageWrap: change.ansiPageWrap,
    renderEffect: change.textRenderEffect,
    textFontSize: change.textFontSize,
    textPairs: change.colorsTextPairs,
    smearBlockCharacters: change.textSmearBlockCharacters,
    useIceColors: change.ansiUseIceColors,
  }
  chrome.storage.local.get(Developer, (store) => {
    if (Developer in store) {
      Object.entries(changes).forEach(([key, value]) => {
        const pref = `🖫 storage event handler`,
          t = typeof value
        if (t === `undefined`) return
        if (t === `object`) {
          console.log(
            `${pref} 🡲 ${key} %c${value.oldValue}%c ${value.newValue}`,
            "text-decoration:line-through",
            "text-decoration:none",
          )
        } else {
          console.log(`${pref} 🡲 ${key}`)
          console.log(value)
        }
      })
    }
  })
  const dom = new DOM()
  if (changes.accurate9pxFonts) {
    dom.results = { textAccurate9pxFonts: changes.accurate9pxFonts.newValue }
    return dom.clickAccurate9pxFonts()
  }
  if (changes.backgroundScanline) {
    const body = document.getElementsByTagName(`body`)[0]
    if (typeof body === `object`)
      ToggleScanlines(changes.backgroundScanline.newValue, body)
    return
  }
  if (changes.blink) {
    dom.results = { textBlinkingCursor: changes.blink.newValue }
    return dom.clickBlinkingCursorText()
  }
  if (changes.centerAlign) {
    if (changes.centerAlign.newValue === true) return dom.clickCenterAlign(true)
    return dom.clickCenterAlign(false)
  }
  if (changes.colorPalette)
    return dom.clickAnsiColorPalette(changes.colorPalette.newValue)
  if (changes.columnWrap) {
    const key = `ansiColumnWrap`
    sessionStorage.setItem(key, changes.columnWrap.newValue)
    return localStorage.setItem(key, changes.columnWrap.newValue)
  }
  if (changes.customBackground || changes.customForeground) {
    if (changes.customBackground)
      localStorage.setItem(
        `colorsCustomBackground`,
        changes.customBackground.newValue,
      )
    if (changes.customForeground)
      localStorage.setItem(
        `colorsCustomForeground`,
        changes.customForeground.newValue,
      )
    // custom colours are handled by `DOM.clickTextPairs()`
    dom.backgroundColor = `theme-custom`
    return dom.clickTextPairs()
  }
  if (changes.dosControlGlyphs)
    localStorage.setItem(
      `textDOSControlGlyphs`,
      changes.dosControlGlyphs.newValue,
    )
  if (changes.fontname) {
    const family = new FontFamily(`${changes.fontname.newValue}`)
    family.swap(dom.rawText)
    chrome.storage.local.get(`textLineHeight`, (result) => {
      if (!(`textLineHeight` in result))
        return CheckError(
          `🖫 Could not obtain the required textLineHeight setting to adjust the layout.`,
          true,
        )
      dom.clickLineHeight(result.textLineHeight)
    })
    chrome.storage.local.get(`textFontSize`, (result) => {
      if (!(`textFontSize` in result))
        return CheckError(
          `🖫 Could not obtain the required textFontSize setting to adjust the layout.`,
          true,
        )
      dom.clickTextSize(result.textFontSize)
    })
  }
  if (changes.info) {
    switch (`${changes.info.newValue}`) {
      case `on`:
        return dom.clickHeader(1)
      case `off`:
        return dom.clickHeader(0)
      case `close`:
        return dom.clickHeader(2)
    }
  }
  if (changes.textFontSize)
    return dom.clickTextSize(changes.textFontSize.newValue)
  if (changes.lineHeight)
    return dom.clickLineHeight(changes.lineHeight.newValue)
  if (changes.pageWrap) {
    const key = `ansiPageWrap`
    sessionStorage.setItem(key, changes.pageWrap.newValue)
    dom.results = { ansiPageWrap: changes.pageWrap.newValue }
    return dom.clickPageWrap()
  }
  if (changes.renderEffect && typeof dom.article === `object`) {
    switch (`${changes.renderEffect.newValue}`) {
      case `true`:
        return ToggleTextEffect(`shadowed`, dom.article)
      case `false`:
        return ToggleTextEffect(`normal`, dom.article)
      default:
        return ToggleTextEffect(changes.renderEffect.newValue, dom.article)
    }
  }
  if (changes.textPairs) {
    const newColor = changes.textPairs.newValue
    dom.backgroundColor = newColor
    dom.clickTextPairs()
    chrome.storage.local.get(
      [`textBackgroundScanlines`, `textCenterAlign`, `textRenderEffect`],
      (result) => {
        const article = document.getElementsByTagName(`article`)[0],
          body = document.body,
          bsl = result.textBackgroundScanlines,
          err = `🖫 Could not obtain the required setting to handle changes,`
        // update the scan lines on background colour requirement
        if (typeof bsl === `undefined`)
          CheckError(`${err} "textBackgroundScanlines" is undefined.`, true)
        else if (`${bsl}` === `true` && typeof body === `object`)
          ToggleScanlines(true, body, newColor)
        // update the text effect colours requirement
        const te = result.textRenderEffect
        if (typeof te === `undefined`)
          CheckError(`${err} "textRenderEffect" is undefined.`, true)
        else if (typeof article === `object`) {
          switch (`${te}`) {
            case `true`:
              ToggleTextEffect(`shadowed`, article, newColor)
              break
            case `false`:
              ToggleTextEffect(`normal`, article, newColor)
              break
            default:
              ToggleTextEffect(te, article, newColor)
          }
        }
        // update the centre alignment requirement
        const ca = result.textCenterAlign
        if (typeof ca === `undefined`)
          CheckError(`${err} "textCenterAlign" is undefined.`, true)
        else if (typeof article === `object`) {
          if (`${ca}` === `true`) dom.clickCenterAlign(true)
          else dom.clickCenterAlign(false)
        }
      },
    )
    return
  }
  if (changes.smearBlockCharacters)
    localStorage.setItem(
      `textSmearBlockCharacters`,
      changes.smearBlockCharacters.newValue,
    )
  if (changes.useIceColors) {
    localStorage.setItem(`ansiUseIceColors`, changes.useIceColors.newValue)
    return dom.clickIceColors()
  }
}

/**
 * Handle long-lived messages passed on by service workers.
 * @param message OnMessage event for the `chrome.runtime` object
 */
function handleConnections(message) {
  if (typeof message.initTab === `number`) {
    const tabID = message.initTab,
      port = chrome.runtime.connect({ name: `invoker` })
    Console(`✉ initTab #${tabID} message received.`)
    if (document.getElementById(`retrotxt-styles`) === null) {
      port.postMessage({ tabID: tabID, init: false })
      Console(`✉ initTab is false post message.`)
      return
    }
    port.postMessage({ tabID: tabID, init: true })
    Console(`✉ initTab is true post message.`)
    return
  }
  if (typeof message.toggleTab === `number`) {
    Console(`✉ toggleTab #${message.toggleTab} message received.`)
    new Invoke().toggle()
    return
  }
  if (typeof message.tabTranscode === `string`) {
    const value = message.tabTranscode
    Console(`✉ tabTranscode ${value} message received.`)
    if (value === Cs.UseCharSet) sessionStorage.removeItem(`lockTranscode`)
    else sessionStorage.setItem(`lockTranscode`, value)
    // reload the active tab
    globalThis.location.reload()
    return
  }
  console.group(`✉ Unexpected long-lived message.`)
  console.log(message)
  console.groupEnd()
}

/**
 * Handle one-time messages passed on by service workers.
 * @param message OnMessage event for the `chrome.runtime` object
 */
function handleMessages(message, sender) {
  // Receiving messages here from event page requires the
  // `chrome.tabs.sendMessage` method which includes the `tabId`. Responding to
  // these messages from the event page requires the `chrome.runtime.sendMessage`
  // method without the `tabId`.
  const unexpected = () => {
    if (typeof qunit !== `undefined`) return false
    chrome.storage.local.get(Developer, (store) => {
      if (Developer in store) {
        console.group(`✉ Unexpected one-time message.`)
        console.log(message)
        console.log(sender)
        console.groupEnd()
      }
    })
  }

  if (message.id === `executeNOW`) {
    Execute(sender.tab.id)
    return
  }
  Console(`✉ Received '${message.id}' for handleMessages().`)
  switch (message.id) {
    case `CheckError`:
      Console(`✉ 'CheckError' message received.`)
      // display an error alert box on the active tab
      return DisplayAlert()
    case `qunit`:
      return true
    default:
      return unexpected()
  }
}

/**
 * Execute RetroTxt, used by the chrome.tabs `executeScript` method.
 * @param [tabId=0] Browser tab id to execute RetroTxt
 * @param [pageEncode=`unknown`] Page encoding used by the tab
 */
function Execute(tabId = 0, pageEncode = `unknown`) {
  if (typeof tabId !== `number`) CheckArguments(`tabId`, `number`, tabId)
  if (typeof pageEncode !== `string`)
    CheckArguments(`pageEncode`, `string`, pageEncode)

  let DeveloperMode = false
  chrome.storage.local.get(Developer, (store) => {
    if (Developer in store) DeveloperMode = true
  })

  const tabEncode = pageEncode.toLowerCase()
  // clean-up session items, in case the tab was previously used by RetroTxt
  try {
    sessionStorage.removeItem(`lockFont`)
  } catch (e) {
    console.group(`RetroTxt will not be able to work with this webpage`)
    console.info(
      `For security, this website is configured to block the use of session storage (content-security-policy); OR this browser has the session storage setting disabled.`,
    )
    console.error(e)
    console.groupEnd()
    DisplayAlert(
      true,
      `RetroTxt cannot work with this webpage. For security, it blocked the use of session storage.`,
    )
    return BusySpinner(false)
  }
  // create DOM object
  const dom = new DOM()
  dom.initialize()
  dom.construct()
  // defaults
  const config = new Configuration(),
    guess = new Guess()
  // text data objects
  let ecma48 = {}

  if (DeveloperMode) console.log(`Execute('${tabId}', '${tabEncode}')`)

  if (typeof dom.rawText === `undefined`)
    return CheckError(
      `RetroTxt failed to load and has been aborted. Were you trying to load an empty file?`,
    )
  if ([`UTF-16BE`, `UTF-16LE`].includes(document.characterSet))
    DisplayEncodingAlert()

  const input = new Input(tabEncode, `${dom.rawText.textContent}`)
  if (DeveloperMode) console.log(input)

  const sauce = new SauceMeta(input)
  if (DeveloperMode) console.log(sauce)

  const output = new Output(sauce, dom)
  if (DeveloperMode) console.log(output)

  // copy user settings to the localStorage of the active browser tab
  config.setLocalStorage(`ansiColumnWrap`)
  config.setLocalStorage(`ansiPageWrap`)
  config.setLocalStorage(`ansiUseIceColors`)
  config.setLocalStorage(`textAccurate9pxFonts`)
  config.setLocalStorage(`textBlinkingCursor`)
  config.setLocalStorage(`textDOSControlGlyphs`)
  config.setLocalStorage(`textSmearBlockCharacters`)
  // determine and rebuild the character set
  // attempt to use SAUCE metadata
  if (sauce.valid()) {
    output.data.cs = sauce.configs.codePage
    // this resets the codepage when the browser applies an incorrect character set
    // that requires character transcoding, such as ISO8859-5 > CP437
    if (tabEncode === `unknown`) output.data.cs = ``
  }
  // attempt to guess the character set
  if (output.data.cs === ``) output.data.cs = guess.codePage(null, output)
  output.rebuildCharacterSet()
  let inputMessage
  const fmt = textType(input.format)
  if (fmt === BBSText) {
    // handle non-ASCII text formatting
    try {
      inputMessage = `${chrome.i18n.getMessage(input.format)}`
      if (inputMessage.length === 0) {
        console.warn(`"${input.format}" is not found in messages.json locales`)
      }
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      // do nothing
    }
    // convert BBS colour codes and pipes to HTML with CSS
    const bbs = new BBS(`${output.data.html}`, input.format),
      print = bbs.print(input.format)
    consoleBBS(print)
    output.data.html = ``
    output.pre = bbs.normalize()
    output.encode.title = `Special bulletin board system, text formatting`
    output.encode.textContent = `${print}`
  }
  if (fmt === ANSIText) {
    // ECMA-48 aka ANSI encoded text
    consoleECMA()
    ecma48 = output.ecma48Data()
    output.data.html = ``
  }
  if (fmt === PlainText) {
    const bbs = new BBS(`${output.data.html}`, PlainText)
    output.data.html = ``
    output.pre = bbs.normalize()
    const wrapCol = sessionStorage.getItem(`ansiColumnWrap`)
    const wrapPage = sessionStorage.getItem(`ansiPageWrap`)
    if (wrapCol === `true`)
      output.pre.classList.add(`has-text-plain-with-container`)
    if (wrapPage === `true`) output.pre.classList.add(`has-text-plain`)
  }
  // apply a blinking cursor
  output.cursor()
  // reveal the text font in the information header
  chrome.storage.local.get(`settingsInformationHeader`, (result) => {
    dom.ecma48 = ecma48
    dom.palette = output.palette
    dom.results = result
    if (sauce.version === `00`) {
      const i = parseInt(sauce.configs.iceColors, 10)
      dom.ecma48.iceColors = i === 1
    }
    dom.constructHeader()
  })
  // apply any stylesheet fixes
  chrome.storage.local.get([`colorsTextPairs`], (result) => {
    dom.results = result
    dom.linkFixTextPairs()
  })
  output.preInit()
  // code page details
  switch (fmt) {
    case ANSIText:
      output.ecma48Errors()
    // fallthrough
    case PlainText:
      output.headerEncoding(input, config.cssWidth())
  }
  // information header
  const information = new Information(input, output, sauce, ecma48)
  information.createPixels()
  information.createCharacterCount()
  information.createFontname()
  information.create()
  // SAUCE records for text font info
  if (output.data.sauce !== null) information.append(output.data.sauce)
  // create an alert message at the top of the page
  const chkErr = globalThis.checkedErr
  DisplayAlert(Boolean(typeof chkErr !== `undefined` && chkErr === true))
  // hide original source text
  dom.rawText.classList.add(`is-hidden`)
  // set the document language, en is for generic English
  document.documentElement.lang = `en`
  document.documentElement.translate = false
  // insert the new tags into the HTML of the DOM
  dom.head.append(tabTitle(sauce))
  // insert the header into document
  output.main.append(information.show)
  output.main.append(information.hide)
  output.main.append(output.article)
  output.article.append(output.pre)
  try {
    dom.body.insertBefore(output.main, dom.rawText)
  } catch {
    CheckError(`⚠ Unexpected DOM.body HTMLElement Node error.`)
    const err = document.getElementById(`displayAlert`)
    err.textContent = `Oops, it looks like the HTML has failed to render! Is the RetroTxt Extension Unit Tests loaded in another tab? Try closing it and reload this.`
  }
  // linkify DOM
  chrome.storage.local.get(
    [`linkifyHyperlinks`, `linkifyValidate`],
    (store) => {
      const hyper = store.linkifyHyperlinks
      const validate = store.linkifyValidate
      if (validate === true && hyper === true) {
        linkifyElement(document.getElementById(`styledDocument`), {
          validate: {
            url: (value) => /^https?:\/\//.test(value),
          },
        })
      } else if (hyper === true)
        linkifyElement(document.getElementById(`styledDocument`))
    },
  )
  // clean-up globals
  cleanup(output)
  // hide the spin loader
  BusySpinner(false)
  // delay calculating the element size as the received client values are incorrect
  const halfASecond = 500
  setTimeout(pixels, halfASecond)
  // create a window resize event to update the pixel values
  window.addEventListener(`resize`, pixels)
  // throw a check error for testing
  if (typeof globalThis !== `undefined`) {
    const hash = globalThis.location.hash
    if (hash === `#sorry-retrotxt-has-run-into-a-problem`)
      CheckError(`this is a test of the CheckError dialog`, false)
  }
}

function pixels() {
  const m = document.getElementsByTagName(`pre`)[0],
    w = document.getElementById(`widthOfText`),
    h = document.getElementById(`lengthOfText`)
  h.textContent = m.clientHeight
  w.textContent = m.clientWidth
}

function cleanup(output) {
  delete output.article
  delete output.columns
  delete output.data
  delete output.dom
  delete output.ecma48
  delete output.encode
  delete output.main
  delete output.pre
  delete output.rows
  delete output.sauce
  delete output.slice
  delete output.text
  delete output.unknownCount
  //delete ecma48.colorDepth (required for palette toggle)
  delete ecma48.columns
  delete ecma48.font
  delete ecma48.htmlString
  delete ecma48.iceColors
  delete ecma48.lineWrap
  delete ecma48.otherCodesCount
  delete ecma48.rows
  delete ecma48.sauce
  delete ecma48.text
  delete ecma48.unknownCount
  delete ecma48.verbose
}
function consoleBBS(inputMessage = ``) {
  return console.info(
    `%c%c${inputMessage} %c${chrome.i18n.getMessage(`color`)} codes.`,
    `font-weight: bold`,
    `font-weight: bold; color: green`,
    `font-weight: bold; color: initial`,
  )
}
function consoleECMA() {
  return console.info(
    `%c%cECMA-48%c control sequences in use.`,
    `font-weight: bold`,
    `font-weight: bold; color: green`,
    `font-weight: bold; color: default`,
  )
}
function markTab(mark = `[··]`) {
  // mark tab title with the RetroTxt ascii logo
  if (globalThis.location.protocol === `file:`) {
    const path = globalThis.location.pathname
      .split(`/`)
      .filter((el) => {
        return Boolean(el)
      })
      .pop()
    return `${mark} ${path}`
  }
  return `${mark} ${globalThis.location.host}${globalThis.location.pathname}`
}
function tabTitle(sauce) {
  const title = document.createElement(`title`)
  if (typeof sauce !== `object` || !Object.hasOwn(sauce, `title`)) {
    console.error(`tabTitle sauce object requires the title property.`)
    return title
  }
  if (sauce.title !== ``) {
    title.textContent = `[··] ${sauce.title}`
    if (sauce.author !== ``) title.textContent += ` by ${sauce.author}`
    return title
  }
  if (window.location.toString().includes(`://retrotxt.com/e/`)) {
    const file = window.location.toString().split(`/`)
    title.textContent = `[··] `
    switch (file.at(-1)) {
      case `preview_00.ans`:
        title.textContent += `WTF4 by Blocktronics`
        break
      case `preview_01.ans`:
        title.textContent += `The Dark Empire by Vito`
        break
      case `preview_03.ans`:
        title.textContent += `WTF4 by R5`
        break
      case `preview_05.asc`:
        title.textContent += `assskeyart by iks`
        break
      case `preview_06.ans`:
        title.textContent += `Spidertronics by Luciano Ayres`
        break
      case `preview_07.pcb`:
        title.textContent += `The Lair by The Falcon's Lair`
        break
      case `preview_08.ans`:
        title.textContent += `Lahabana by XZ`
        break
      case `preview_09.ans`:
        title.textContent += `Critical Condition by A.A.A`
        break
      case `preview_10.ans`:
        title.textContent += `Colly by XD`
        break
      case `preview_12.asc`:
        title.textContent += `function party by iks`
        break
      case `preview_14.ans`:
        title.textContent += `Cyonx by Enz0`
        break
      case `preview_17.ans`:
        title.textContent += `Orchestra by KE`
        break
      case `preview_18.ans`:
        title.textContent += `ju67`
        break
      default:
        title.textContent = markTab()
    }
    return title
  }
  title.textContent = markTab()
  return title
}
function textType(format = ``) {
  switch (format) {
    case CelerityText:
    case PCBoardText:
    case RenegadeText:
    case TelegardText:
    case WildcatText:
    case WWIVHashText:
    case WWIVHeartText:
      return BBSText
    case ANSIText:
      return ANSIText
    default:
      return PlainText
  }
}
// eslint no-unused-variable fix
if (typeof Execute !== `undefined`) void 0

/* global ecma48 linkifyElement BBS BrowserEncodings BusySpinner Characters CheckArguments
Configuration Console CreateLink Cs Developer Controls CheckError DisplayAlert
DisplayEncodingAlert DOSText Engine FindControlSequences FontFamily Guess HardwarePalette
HumaniseFS ParseToChildren RemoveTextPairs StringToBool ToggleScanlines ToggleTextEffect Transcode WebBrowser
ANSIText BBSText CelerityText PlainText PCBoardText RenegadeText TelegardText WildcatText WWIVHashText WWIVHeartText */
