# encoding.js Fixes - Implementation Preview

## Overview

This document shows the exact changes needed to fix the critical bugs identified in `ext/scripts/encoding.js`.

## Critical Fix 1: DOM Reference Bug in Guess.codePage()

**Current Code (Line 308):**
```javascript
this.text = `${dom.slice}`
```

**Problem:** `dom.slice` doesn't exist on DOM objects

**Fixed Code:**
```javascript
this.text = dom.textContent || dom.innerText || ``
```

## Critical Fix 2: Error Handling in FontFamily.swap()

**Current Code (Lines 720-725):**
```javascript
const lockFont = `${sessionStorage.getItem(`lockFont`)}`
if (lockFont === `true`)
  return console.log(
    `Cannot refresh font as lock-font is set to true.`,
    `\nThis is either because the text is ANSI encoded or contains SAUCE metadata with font family information.`,
  )
```

**Problem:** String comparison with boolean logic

**Fixed Code:**
```javascript
const lockFont = sessionStorage.getItem(`lockFont`)
if (lockFont === `true` || lockFont === true)
  return console.log(
    `Cannot refresh font as lock-font is set to true.`,
    `\nThis is either because the text is ANSI encoded or contains SAUCE metadata with font family information.`,
  )
```

## Critical Fix 3: Add Null Checks in _swap()

**Current Code (Lines 750-755):**
```javascript
const header = globalThis.document.getElementById(`fontnameInUse`)
if (header !== null) {
  header.textContent = this.set().replaceAll(`_`, ` `)
  header.title = this.title(this.family)
  replaceFont(fontClass, header)
}
```

**Problem:** No null checks for critical operations

**Fixed Code:**
```javascript
const header = globalThis.document.getElementById(`fontnameInUse`)
if (header !== null) {
  try {
    header.textContent = this.set().replaceAll(`_`, ` `)
    header.title = this.title(this.family)
    replaceFont(fontClass, header)
  } catch (error) {
    console.error(`Failed to update font header:`, error)
  }
}
```

## Medium Fix 4: Improve Error Handling in _decimalSet()

**Current Code (Line 458):**
```javascript
if (typeof set !== `object`) CheckArguments(`set`, `array`, set)
```

**Problem:** Confusing parameter naming and error message

**Fixed Code:**
```javascript
if (!Array.isArray(set)) CheckArguments(`set`, `array`, set)
```

## Summary of Changes

### File: `ext/scripts/encoding.js`

**Changes Required:**
1. Line 308: Fix DOM text extraction
2. Lines 720-725: Improve lockFont comparison logic
3. Lines 750-755: Add error handling for header operations
4. Line 458: Improve array type checking

**Impact:**
- Fixes runtime errors in character encoding detection
- Improves error handling for font operations
- Prevents potential crashes in DOM manipulation
- Enhances overall WebExtension reliability

**Risk Level:** Low - All changes are targeted fixes that preserve existing functionality while fixing bugs.