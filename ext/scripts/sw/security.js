// File: scripts/sw/security.js
//
// Web extension API restriction checks and permission grants.

chrome.runtime.onInstalled.addListener(() => {
  ConsoleLoad(`security.js`)
})

/**
 * Extension permissions interface.
 * @class Security
 */
// eslint-disable-next-line no-unused-vars
class Security {
  /**
   * Creates an instance of Security.
   * @param [type=``] Permission type to handle `action`, `downloads`, `files` or `http`
   * @param [origin=``] An optional URL or URI
   */
  constructor(type = ``, origin = ``) {
    // IMPORTANT!
    // These mapped values must match the Permission class of `scripts/options.js`.
    const permissions = new Map()
      .set(`action`, [])
      .set(`downloads`, [`downloads`, `downloads.open`])
      .set(`files`, [])
      // http must be `activeTab` instead of `tabs`, otherwise URLs listed
      // in `permissions` will not toggle
      .set(`http`, [`activeTab`])
    const origins = new Map()
      .set(`action`, [])
      .set(`downloads`, [])
      .set(`files`, [])
      .set(`http`, this._httpToOrigins())
    if (typeof type === `undefined`)
      return CheckError(
        `⚿ Security('${type}') is invalid, it must be either: ${Array.from(
          permissions.keys(),
        )}.`,
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
      this.type,
    )
  }
  /**
   * Creates a collection of permissions for use with the permissions methods.
   * @returns `permissions.Permissions` object
   */
  test() {
    chrome.storage.local.get(Developer, (store) => {
      if (Developer in store)
        console.trace(`⚿ Security test request for '${this.type}'.`)
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
    let url
    try {
      url = new URL(this.origin)
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      return [`*://${this.origin}/*`]
    }
    return [`*://${url.hostname}/*`]
  }
}

/*global CheckError ConsoleLoad Developer */
