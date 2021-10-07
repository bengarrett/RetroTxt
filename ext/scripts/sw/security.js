// filename: sw/security.js
//
/*global CheckError ConsoleLoad Developer */
/*exported Security */

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`security.js`)
})

/**
 * Extension permissions interface.
 * @class Security
 */
class Security {
  /**
   * Creates an instance of Security.
   * @param [type=``] Permission type to handle `action`, `downloads`, `files` or `http`
   * @param [origin=``] An optional URL or URI
   */
  constructor(type = ``, origin = ``) {
    // IMPORTANT!
    // These Map values must match those in the `scripts/options.js` Security class.
    // Firefox REQUIRES tabs permission to access URL in the queryInfo
    // parameter to tabs.query().
    const permissions = new Map()
      .set(`action`, [`tabs`])
      .set(`downloads`, [`downloads`, `downloads.open`, `tabs`])
      .set(`files`, [`tabs`])
      // http must be `activeTab` instead of `tabs`, otherwise URLs listed
      // in `permissions` will not toggle
      .set(`http`, [`activeTab`])
    const origins = new Map()
      .set(`action`, [])
      .set(`downloads`, [`file:///*/`])
      .set(`files`, [`file:///*/`])
      .set(`http`, this._httpToOrigins())
    if (typeof type === `undefined`)
      return CheckError(
        `⚿ Security('${type}') is invalid, it must be either: ${Array.from(
          permissions.keys()
        )}.`
      )
    this.permissions = permissions.get(`${type}`)
    this.origins = origins.get(`${type}`)
    this.origin = origin
    this.type = type
  }
  /**
   * API access permission has been denied by the browser.
   */
  fail() {
    console.warn(
      `⚠ Extension permission access '${this.permissions}' is denied for %s.`,
      this.type
    )
  }
  /**
   * Creates a collection of permissions for use with the permissions methods.
   * @returns `permissions.Permissions` object
   */
  test() {
    chrome.storage.local.get(Developer, (store) => {
      if (Developer in store) {
        console.trace(`⚿ Security test request for '${this.type}'.`)
      }
    })
    if (this.type === `http`) this.origins = this._httpToOrigins()
    const permissionsToRequest = {
      permissions: this.permissions,
      origins: this.origins,
    }
    return permissionsToRequest
  }
  /**
   * Converts a URL supplied by `this.origin` into a collection of host permissions.
   * @returns Array containing host permissions
   */
  _httpToOrigins() {
    if (typeof this.origin === `undefined`) return this.origins
    if (this.origin.length < 1) return this.origins
    // parse URL to valid host
    var url = ``
    try {
      url = new URL(this.origin)
    } catch (e) {
      return [`*://${this.origin}/*`]
    }
    return [`*://${url.hostname}/*`]
  }
}
