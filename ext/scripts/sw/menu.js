// filename: sw/menu.js
//
/*global ConsoleLoad UseCharSet Windows_1252_English ISO8859_5 OutputCP1252 OutputISO8859_15 OutputUS_ASCII openOptions CheckLastError */

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`menu.js`)
})

chrome.contextMenus.onClicked.addListener((info) => {
  console.log(`context menus click!`, info)
  new Menu().event(info.menuItemId)
})

// chrome.contextMenus.onClicked.addListener(() => {
//   new Menu().create()
// })

/**
 * Manage RetroTxt context menus.
 * @class Menu
 */
class Menu {
  constructor() {
    this.support = chrome.contextMenus.onClicked !== undefined
    // contexts types for the RetroTxt context menus
    // browser_action: is the tool bar button
    // page: is found by right clicking the body of a page or text file
    this.contexts = [`browser_action`, `page`]
    // URL patterns to trigger the menus, to avoid inappropriate reveals
    this.urlPatterns = [`http://*/*`, `https://*/*`, `file:///*`]
    // context menu titles
    this.titles = new Map()
      .set(`codeOrder`, [
        UseCharSet,
        OutputCP1252,
        OutputISO8859_15,
        OutputUS_ASCII,
        Windows_1252_English,
        ISO8859_5,
      ])
      .set(UseCharSet, `Automatic charset`)
      .set(Windows_1252_English, `CP-1252 ↻`)
      .set(OutputCP1252, `CP-1252`)
      .set(ISO8859_5, `ISO 8859-5 ↻`)
      .set(OutputISO8859_15, `ISO 8859-15`)
      .set(OutputUS_ASCII, `US-ASCII`)
  }
  /**
   * Creates the context menus used on pages and on the task bar button.
   */
  async create() {
    // each separator requires a unique id
    const id1 = 1,
      id2 = 2
    // remove any existing menus to avoid undetected callback errors
    chrome.contextMenus.removeAll()
    // add items in order of display
    this._itemTranscode()
    this._itemSeparator(id1)
    this._itemVersion()
    this._itemFonts()
    this._itemDisplay()
    this._itemSettings()
    this._itemSeparator(id2)
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
        return openOptions(`${id}`)
      case Windows_1252_English:
      case ISO8859_5:
      case UseCharSet:
      case OutputISO8859_15:
      case OutputUS_ASCII:
      case OutputCP1252: {
        // see `handleMessages()` in `scripts/retrotxt.js` for the event handler
        return chrome.tabs.query(
          { active: true, currentWindow: true },
          (tabs) => {
            chrome.tabs.sendMessage(
              tabs[0].id,
              {
                action: id,
                id: `transcode`,
              },
              () => {
                if (CheckLastError(`transcode tabs send message`)) return
                // save a session item to tell RetroTxt how to render the text
                // for this tab, session storage is isolated to the one active tab
                sessionStorage.setItem(`transcode`, id)
              }
            )
          }
        )
      }
      default:
        return console.error(`an unknown Menu event id "${id}" was requested`)
    }
  }
  /**
   * Unlock the Transcode text context menu.
   */
  enableTranscode() {
    chrome.contextMenus.update(`transcode`, {
      enabled: true,
    })
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
    )
  }
  _itemTranscode() {
    chrome.contextMenus.create(
      {
        title: `Transcode this text`,
        contexts: this.contexts,
        documentUrlPatterns: this.urlPatterns,
        id: `transcode`,
      },
      () => {
        if (CheckLastError(`create "transcode" context menu`)) return
      }
    )
    // generate `Transcode text` child items
    for (const id of this.titles.get(`codeOrder`)) {
      // only type `normal` works correctly with this menu as the transcode
      // configuration is a per-tab configuration, while these context menus
      // apply to all tabs
      chrome.contextMenus.create(
        {
          type: `normal`,
          title: this.titles.get(id),
          contexts: this.contexts,
          id: id,
          parentId: `transcode`,
          documentUrlPatterns: this.urlPatterns,
        },
        () => {
          if (CheckLastError(`create "transcode normal" context menu`)) return
        }
      )
    }
  }
}
