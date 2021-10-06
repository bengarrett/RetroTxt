// Replacement for eventpage with DOM access but cannot use the Chrome API.

// Content scripts are files that run in the context of web pages. By using
// the standard Document Object Model (DOM), they are able to read details of
// the web pages the browser visits, make changes to them, and pass information
// to their parent extension.

// Content scripts can access Chrome APIs used by their parent extension by
// exchanging messages with the extension. They can also access the URL of an
// extension's file with chrome.runtime.getURL() and use the result the same as other URLs.

// https://developer.chrome.com/docs/extensions/mv3/content_scripts/

// Additionally, content scripts can access the following chrome APIs directly:

// i18n
// storage
// runtime:
//  connect
//  getManifest
//  getURL
//  id
//  onConnect
//  onMessage
//  sendMessage
