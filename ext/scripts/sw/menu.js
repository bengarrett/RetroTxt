// filename: sw/menu.js
//
/*global ConsoleLoad CheckLastError Cs GetCurrentTab OpenOptions */

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`menu.js`)
})

chrome.contextMenus.onClicked.addListener((info) => {
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
    const toolbarButton = `browser_action`,
      insecure = `http://*/*`,
      secure = `https://*/*`,
      localFiles = `file:///*`
    this.contexts = [toolbarButton, `page`]
    // URL patterns to trigger the menus, to avoid inappropriate reveals
    this.urlPatterns = [insecure, secure, localFiles]
    // context menu titles
    this.titles = new Map()
      .set(`codeOrder`, [
        Cs.UseCharSet,
        Cs.OutputCP1252,
        Cs.OutputISO8859_15,
        Cs.OutputUS_ASCII,
        Cs.Windows_1252_English,
        Cs.ISO8859_5,
      ])
      .set(Cs.UseCharSet, `Automatic charset`)
      .set(Cs.Windows_1252_English, `CP-1252 ⇉`)
      .set(Cs.OutputCP1252, `CP-1252`)
      .set(Cs.ISO8859_5, `ISO 8859-5 ⇉`)
      .set(Cs.OutputISO8859_15, `ISO 8859-15`)
      .set(Cs.OutputUS_ASCII, `US-ASCII`)
  }
  /**
   * Creates the context menus used on pages and on the task bar button.
   */
  async startup() {
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
        return OpenOptions(`${id}`)
      case Cs.Windows_1252_English:
      case Cs.ISO8859_5:
      case Cs.UseCharSet:
      case Cs.OutputISO8859_15:
      case Cs.OutputUS_ASCII:
      case Cs.OutputCP1252: {
        // see `handleConnections` in `scripts/retrotxt.js` for the event handler
        GetCurrentTab().then((result) => {
          if (typeof result.id !== `number`) return
          const port = chrome.tabs.connect(result.id, { name: `menuTranscode` })
          port.postMessage({ tabTranscode: `${id}` })
        })
        return
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
