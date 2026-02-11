# helpers.js Fixes - Implementation Preview

## Overview

This document shows the exact changes needed to fix the critical bugs identified in `ext/scripts/helpers.js`.

## Critical Fix 1: Undefined Variable in ToggleScanlines

**Current Code (Line 103):**
```javascript
if (typeof color === `string`) return applyNewClass(colorClass)
```

**Problem:** Variable `color` is undefined, should be `colorClass`

**Fixed Code:**
```javascript
if (typeof colorClass === `string`) return applyNewClass(colorClass)
```

## Critical Fix 2: Undefined Variable in ToggleTextEffect

**Current Code (Line 175):**
```javascript
if (typeof color === `string`)
  return dom.classList.add(`${colorClass}-shadowed`)
```

**Problem:** Variable `color` is undefined, should be `colorClass`

**Fixed Code:**
```javascript
if (typeof colorClass === `string`)
  return dom.classList.add(`${colorClass}-shadowed`)
```

## Critical Fix 3: Flawed Manifest Validation

**Current Code (Lines 59-62):**
```javascript
const manifestKeys = Object.keys(chrome.runtime.getManifest()).length
if (manifestKeys === 0)
  return console.error(
    `RetroTxt cannot continue as the Extension API is inaccessible.`
  )
```

**Problem:** This check is meaningless - `chrome.runtime.getManifest()` never returns empty object

**Fixed Code:**
```javascript
// Remove the flawed validation entirely, or replace with proper error handling
// Option 1: Remove completely (recommended)
// Option 2: Add try-catch around chrome.runtime.getURL call
```

## Medium Fix 4: Memory Leak Prevention in BusySpinner

**Current Code (Lines 75-82):**
```javascript
const div = document.createElement(`div`)
div.id = `spinLoader`
div.classList.add(`loader`)
document.body.append(div)
const stylesheet = CreateLink(`../css/retrotxt_loader.css`, `retrotxt-loader`)
return document.querySelector(`head`).append(stylesheet)
```

**Problem:** Stylesheet is never removed, causing memory leaks

**Fixed Code:**
```javascript
const div = document.createElement(`div`)
div.id = `spinLoader`
div.classList.add(`loader`)
document.body.append(div)
const stylesheet = CreateLink(`../css/retrotxt_loader.css`, `retrotxt-loader`)
document.querySelector(`head`).append(stylesheet)
// Store reference for cleanup
if (typeof window.retroTxtSpinLoader === 'undefined') {
  window.retroTxtSpinLoader = {}
}
window.retroTxtSpinLoader.stylesheet = stylesheet
return div
```

**Additional cleanup in hide case:**
```javascript
case false:
  if (spin !== null) {
    spin.classList.add(`is-hidden`)
    // Clean up stylesheet if it exists
    if (window.retroTxtSpinLoader?.stylesheet) {
      window.retroTxtSpinLoader.stylesheet.remove()
      window.retroTxtSpinLoader.stylesheet = null
    }
  }
```

## Summary of Changes

### File: `ext/scripts/helpers.js`

**Changes Required:**
1. Line 103: Fix undefined variable reference
2. Line 175: Fix undefined variable reference  
3. Lines 59-62: Remove flawed manifest validation
4. Lines 75-82: Add stylesheet cleanup mechanism
5. Case false in BusySpinner: Add stylesheet removal

**Impact:**
- Fixes runtime errors in scanlines and text effects
- Prevents memory leaks from accumulated stylesheets
- Removes misleading validation logic
- Improves overall WebExtension reliability

**Risk Level:** Low - All changes are targeted fixes that preserve existing functionality while fixing bugs.