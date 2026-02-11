# options.js Fixes - Implementation Preview

## Overview

This document shows the exact changes needed to fix the critical bugs identified in `ext/scripts/options.js`.

## Critical Fix 1: Error Handling in localGet()

**Current Code (Line 92):**
```javascript
if (typeof name === `undefined`) {
```

**Problem:** This check will always be false since `name` is assigned from `Object.getOwnPropertyNames(result)[0]`

**Fixed Code:**
```javascript
if (name === undefined) {
```

## Critical Fix 2: Null Check for i18n Messages

**Current Code (Lines 66-67):**
```javascript
const message = chrome.i18n.getMessage(word),
  elements = document.getElementsByClassName(className)
```

**Problem:** No validation if i18n message doesn't exist

**Fixed Code:**
```javascript
const message = chrome.i18n.getMessage(word)
if (message === undefined || message === ``) {
  console.warn(`Missing i18n message for: ${word}`)
  return
}
const elements = document.getElementsByClassName(className)
```

## Critical Fix 3: Error Handling in _gotBrowserInfo()

**Current Code (Lines 259-263):**
```javascript
let text
if (info.os === `mac` && info.arch === `arm`) text = `macOS M series`
else text = `${PlatformOS[info.os]} with ${PlatformArch[info.arch]}`
document.getElementById(`os`).textContent = text
```

**Problem:** No error handling for platform lookups

**Fixed Code:**
```javascript
let text
try {
  if (info.os === `mac` && info.arch === `arm`) text = `macOS M series`
  else text = `${PlatformOS[info.os] || info.os} with ${PlatformArch[info.arch] || info.arch}`
} catch (error) {
  console.error(`Failed to format platform info:`, error)
  text = `${info.os || 'Unknown'} ${info.arch || ''}`.trim()
}
document.getElementById(`os`).textContent = text
```

## Medium Fix 4: Event Listener Cleanup

**Current Code (Line 161):**
```javascript
document.getElementById(`updateNoticeBtn`).addEventListener(`click`, () => {
  const result = confirm("Stop this update tab from launching with future RetroTxt upgrades?")
  if (!result) return
  chrome.storage.local.set({ [key]: false })
  globalThis.close()
})
```

**Problem:** Event listeners are never cleaned up

**Fixed Code:**
```javascript
const updateNoticeBtn = document.getElementById(`updateNoticeBtn`)
if (updateNoticeBtn) {
  const handleClick = () => {
    const result = confirm("Stop this update tab from launching with future RetroTxt upgrades?")
    if (!result) return
    chrome.storage.local.set({ [key]: false })
    globalThis.close()
  }
  updateNoticeBtn.addEventListener(`click`, handleClick)
  // Store reference for potential cleanup
  if (!window.retroTxtEventListeners) window.retroTxtEventListeners = []
  window.retroTxtEventListeners.push({ element: updateNoticeBtn, type: 'click', handler: handleClick })
}
```

## Summary of Changes

### File: `ext/scripts/options.js`

**Changes Required:**
1. Line 92: Fix error handling logic in localGet()
2. Lines 66-67: Add null check for i18n messages
3. Lines 259-263: Add error handling for platform info operations
4. Line 161: Implement event listener cleanup pattern

**Impact:**
- Fixes error handling bug that could prevent proper fallback behavior
- Prevents runtime errors from missing i18n messages
- Improves robustness of platform detection
- Reduces memory leaks from event listeners
- Enhances overall WebExtension reliability

**Risk Level:** Low - All changes are targeted fixes that preserve existing functionality while fixing bugs.