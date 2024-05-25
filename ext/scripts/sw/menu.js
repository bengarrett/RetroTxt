// File: scripts/sw/menu.js
//
// RetroTxt (right-click) context menus.

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`menu.js`)
})

chrome.contextMenus.onClicked.addListener((info) => {
  new Menu().event(info.menuItemId)
})

/**
 * Manage RetroTxt context menus.
 * @class Menu
 */
class Menu {
  constructor() {
    this.support = typeof chrome.contextMenus.onClicked !== `undefined`
    // contexts types for the RetroTxt context menus
    const toolbarButton = `browser_action`,
      insecure = `http://*/*`,
      secure = `https://*/*`,
      localFiles = `file:///*`
    this.contexts = [toolbarButton, `page`]
    // URL patterns to trigger the menus, to avoid inappropriate reveals
    this.urlPatterns = [insecure, secure, localFiles]
  }
  /**
   * Creates the context menus used on pages and on the task bar button.
   */
  async startup() {
    // each separator requires a unique id
    const id1 = 1
    // remove any existing menus to avoid undetected callback errors
    chrome.contextMenus.removeAll()
    // add items in order of display
    this._itemVersion()
    this._itemFonts()
    this._itemDisplay()
    this._itemSettings()
    this._itemSeparator(id1)
    this._itemDocumentation()
    this._itemCredits()
    this._itemSamples()
    this._itemUseful()
  }
  /**
   * Handles the results after a menu item is clicked.
   * @param [id=``] Id of the menu item that was clicked
   * @param [tab={}] Tab details where the click took place (`tabs.Tab`)
   */
  async event(id = ``) {
    switch (id) {
      case `version`:
      case `credits`:
      case `samples`:
      case `useful`:
      case `fonts`:
      case `display`:
      case `settings`:
      case `documentation`:
        return OpenOptions(`${id}`)
      default:
        return console.error(`an unknown Menu event id "${id}" was requested`)
    }
  }
  _itemVersion() {
    chrome.contextMenus.create(
      {
        title: `Version`,
        contexts: [`page`],
        documentUrlPatterns: this.urlPatterns,
        id: `version`,
      },
      () => {
        if (CheckLastError(`create "version" context menu`)) return
      },
    )
  }
  _itemFonts() {
    chrome.contextMenus.create(
      {
        title: `Fonts`,
        contexts: [`page`],
        documentUrlPatterns: this.urlPatterns,
        id: `fonts`,
      },
      () => {
        if (CheckLastError(`create "fonts" context menu`)) return
      },
    )
  }
  _itemDisplay() {
    chrome.contextMenus.create(
      {
        title: `Display`,
        contexts: [`page`],
        documentUrlPatterns: this.urlPatterns,
        id: `display`,
      },
      () => {
        if (CheckLastError(`create "display" context menu`)) return
      },
    )
  }
  _itemSettings() {
    chrome.contextMenus.create(
      {
        title: `Settings`,
        contexts: [`page`],
        documentUrlPatterns: this.urlPatterns,
        id: `settings`,
      },
      () => {
        if (CheckLastError(`create "settings" context menu`)) return
      },
    )
  }
  _itemDocumentation() {
    chrome.contextMenus.create(
      {
        title: `Documentation`,
        contexts: [`page`],
        documentUrlPatterns: this.urlPatterns,
        id: `documentation`,
      },
      () => {
        if (CheckLastError(`create "documentation" context menu`)) return
      },
    )
  }
  _itemCredits() {
    chrome.contextMenus.create(
      {
        title: `Credits`,
        contexts: [`page`],
        documentUrlPatterns: this.urlPatterns,
        id: `credits`,
      },
      () => {
        if (CheckLastError(`create "credits" context menu`)) return
      },
    )
  }
  _itemSamples() {
    chrome.contextMenus.create(
      {
        title: `Samples`,
        contexts: [`page`],
        documentUrlPatterns: this.urlPatterns,
        id: `samples`,
      },
      () => {
        if (CheckLastError(`create "samples" context menu`)) return
      },
    )
  }
  _itemUseful() {
    chrome.contextMenus.create(
      {
        title: `Useful`,
        contexts: [`page`],
        documentUrlPatterns: this.urlPatterns,
        id: `useful`,
      },
      () => {
        if (CheckLastError(`create "useful" context menu`)) return
      },
    )
  }
  /**
   * Inserts a line divider into the context menu.
   * @param [id=1] Unique id to assign the separator
   * @param [targets=[`page`]] Array of contexts in which to display
   * (see this.contexts)
   */
  _itemSeparator(id = 1, targets = [`page`]) {
    chrome.contextMenus.create(
      {
        type: `separator`,
        contexts: targets,
        id: `sep${id}`,
        documentUrlPatterns: this.urlPatterns,
      },
      () => {
        if (CheckLastError(`create "separator" context menu`)) return
      },
    )
  }
}

/* global ConsoleLoad CheckLastError OpenOptions */
