# parse_dos.js Fixes - Implementation Preview

## Overview

This document shows the exact changes needed to fix the critical bugs identified in `ext/scripts/parse_dos.js`.

## Critical Fix 1: Sanitizer Logic Improvement

**Current Code (Lines 42-56):**
```javascript
function sanitizer(text) {
  try {
    const clean = DOMPurify.sanitize(text, SECURE_DOMPURIFY_CONFIG)
    if (clean && clean !== text && !clean.includes(`<script>`)) {
      return clean
    }
    if (DeveloperModeDebug) {
      Console('Text sanitizer failure, using the fallback')
    }
    return DOMPurify.sanitize(text, { USE_PROFILES: { html: true } })
  } catch (error) {
    if (DeveloperModeDebug) {
      Console(`Text sanitizer error: ${error.message}, using the fallback`)
    }
    return DOMPurify.sanitize(text, { USE_PROFILES: { html: true } })
  }
}
```

**Problem:** Logic allows fallback to less secure profile too easily

**Fixed Code:**
```javascript
function sanitizer(text) {
  try {
    // First try with secure configuration
    const secureClean = DOMPurify.sanitize(text, SECURE_DOMPURIFY_CONFIG)
    
    // Check if secure cleaning was effective (removed something dangerous)
    const hasDangerousContent = text !== secureClean || 
      text.includes(`<script>`) || text.includes(`<iframe>`) || 
      text.includes(`onerror=`) || text.includes(`javascript:`)
    
    if (hasDangerousContent) {
      // If we found and removed dangerous content, use the secure version
      if (DeveloperModeDebug) {
        Console('Text sanitizer removed dangerous content, using secure version')
      }
      return secureClean
    }
    
    // If no dangerous content was found, we can use the more permissive profile
    // but still run it through DOMPurify for basic sanitization
    const permissiveClean = DOMPurify.sanitize(text, { USE_PROFILES: { html: true } })
    
    // Final safety check
    if (permissiveClean.includes(`<script>`) || permissiveClean.includes(`<iframe>`)) {
      if (DeveloperModeDebug) {
        Console('Fallback sanitizer still contains dangerous content, using secure version')
      }
      return secureClean
    }
    
    return permissiveClean
    
  } catch (error) {
    if (DeveloperModeDebug) {
      Console(`Text sanitizer error: ${error.message}, using secure fallback`)
    }
    // In case of any error, fall back to most secure option
    return DOMPurify.sanitize(text, SECURE_DOMPURIFY_CONFIG)
  }
}
```

## Critical Fix 2: Character Table Cache Management

**Current Code (Lines 65-75):**
```javascript
static _tableCache = {}

static _getCachedTable(name, creator) {
  if (!this._tableCache[name]) {
    this._tableCache[name] = creator()
  }
  return this._tableCache[name]
}
```

**Problem:** Unbounded cache growth

**Fixed Code:**
```javascript
static _tableCache = {}
static _cacheSizeLimit = 10 // Reasonable limit for different character sets
static _cacheCleanupInterval = null

static _getCachedTable(name, creator) {
  if (!this._tableCache[name]) {
    // Check if we need to clean up cache
    const cacheKeys = Object.keys(this._tableCache)
    if (cacheKeys.length >= this._cacheSizeLimit) {
      // Remove least recently used items (simple FIFO for now)
      const oldestKey = cacheKeys[0]
      delete this._tableCache[oldestKey]
      if (DeveloperModeDebug) {
        Console(`CharacterSet cache cleanup: removed ${oldestKey}`)
      }
    }
    
    this._tableCache[name] = creator()
    
    // Set up periodic cleanup if not already running
    if (!this._cacheCleanupInterval) {
      this._cacheCleanupInterval = setInterval(() => {
        this._cleanupCache()
      }, 3600000) // Clean up every hour
    }
  }
  return this._tableCache[name]
}

static _cleanupCache() {
  const cacheKeys = Object.keys(this._tableCache)
  if (cacheKeys.length > this._cacheSizeLimit / 2) {
    // Keep only the most recently used items
    const keysToKeep = cacheKeys.slice(-Math.floor(this._cacheSizeLimit / 2))
    const keysToRemove = cacheKeys.slice(0, cacheKeys.length - keysToKeep.length)
    
    keysToRemove.forEach(key => {
      delete this._tableCache[key]
    })
    
    if (DeveloperModeDebug) {
      Console(`CharacterSet cache cleanup: removed ${keysToRemove.length} items`)
    }
  }
}

// Add cleanup on extension unload if possible
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (this._cacheCleanupInterval) {
      clearInterval(this._cacheCleanupInterval)
      this._cacheCleanupInterval = null
    }
  })
}
```

## Critical Fix 3: Performance Optimization for Character Tables

**Current Code (Lines 130-145):**
```javascript
_cp437Table() {
  const cachedTables = CharacterSet._getCachedTable('cp437', () => {
    return {
      set_0: Array.from(`␀☺☻♥♦♣♠•◘○◙♂♀♪♫☼`),
      set_1: Array.from(`►◄↕‼¶§▬↨↑↓→←∟↔▲▼`),
      set_8: Array.from(`ÇüéâäàåçêëèïîìÄÅ`),
      set_9: Array.from(`ÉæÆôöòûùÿÖÜ¢£¥₧ƒ`),
      set_a: Array.from(`áíóúñÑªº¿⌐¬½¼¡«»`),
      set_b: Array.from(`░▒▓│┤╡╢╖╕╣║╗╝╜╛┐`),
      set_c: Array.from(`└┴┬├─┼╞╟╚╔╩╦╠═╬╧`),
      set_d: Array.from(`╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀`),
      set_e: Array.from(`αßΓπΣσµτΦΘΩδ∞φε∩`),
      set_f: Array.from(`≡±≥≤⌠⌡÷≈°∙·√ⁿ²■${nbsp}`)
    }
  })

  // Assign cached tables to instance for backward compatibility
  Object.assign(this, cachedTables)
}
```

**Problem:** Expensive Array.from() operations on every call

**Fixed Code:**
```javascript
_cp437Table() {
  const cachedTables = CharacterSet._getCachedTable('cp437', () => {
    // Pre-compute arrays once and cache them
    return {
      set_0: `␀☺☻♥♦♣♠•◘○◙♂♀♪♫☼`.split(''),
      set_1: `►◄↕‼¶§▬↨↑↓→←∟↔▲▼`.split(''),
      set_8: `ÇüéâäàåçêëèïîìÄÅ`.split(''),
      set_9: `ÉæÆôöòûùÿÖÜ¢£¥₧ƒ`.split(''),
      set_a: `áíóúñÑªº¿⌐¬½¼¡«»`.split(''),
      set_b: `░▒▓│┤╡╢╖╕╣║╗╝╜╛┐`.split(''),
      set_c: `└┴┬├─┼╞╟╚╔╩╦╠═╬╧`.split(''),
      set_d: `╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀`.split(''),
      set_e: `αßΓπΣσµτΦΘΩδ∞φε∩`.split(''),
      set_f: `≡±≥≤⌠⌡÷≈°∙·√ⁿ²■${nbsp}`.split('')
    }
  })

  // Use Object.assign only if we actually need the properties on the instance
  // Consider returning the cached tables directly instead
  Object.assign(this, cachedTables)
}
```

## Summary of Changes

### File: `ext/scripts/parse_dos.js`

**Changes Required:**
1. Lines 42-56: Improve sanitizer logic for better security
2. Lines 65-75: Add cache management to prevent memory leaks
3. Lines 130-145: Optimize character table creation performance

**Impact:**
- Improves security by preventing unsafe content from bypassing sanitization
- Prevents memory leaks from unbounded caching
- Improves performance of character set processing
- Enhances overall WebExtension reliability and security

**Risk Level:** Low - All changes are targeted fixes that preserve existing functionality while improving security and performance.