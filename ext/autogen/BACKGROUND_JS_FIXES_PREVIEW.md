# background.js Fixes - Implementation Preview

## Overview

This document shows the exact changes needed to fix the critical bugs identified in `ext/scripts/sw/background.js`.

## Critical Fix 1: Error Handling in devMode()

**Current Code (Lines 73-84):**
```javascript
function devMode() {
  chrome.management.getSelf((info) => {
    switch (info.installType) {
      case `development`:
        console.info(`Development RetroTxt method detected.`)
        return chrome.storage.local.set({ [Developer]: true })
      case `admin`:
      case `normal`:
      case `sideload`:
      case `other`:
        return chrome.storage.local.remove(Developer)
    }
  })
}
```

**Problem:** No error handling for Chrome API calls

**Fixed Code:**
```javascript
function devMode() {
  chrome.management.getSelf((info) => {
    // Check for Chrome runtime errors
    if (chrome.runtime.lastError) {
      console.error(`Failed to get management info:`, chrome.runtime.lastError)
      // Fall back to checking if we're in development mode another way
      // For now, assume not in development mode if we can't check
      chrome.storage.local.remove(Developer)
      return
    }
    
    // Check if info is valid
    if (!info || !info.installType) {
      console.error(`Invalid management info received`)
      chrome.storage.local.remove(Developer)
      return
    }
    
    try {
      switch (info.installType) {
        case `development`:
          console.info(`Development RetroTxt method detected.`)
          chrome.storage.local.set({ [Developer]: true }, () => {
            if (chrome.runtime.lastError) {
              console.error(`Failed to set development mode:`, chrome.runtime.lastError)
            }
          })
          break
        case `admin`:
        case `normal`:
        case `sideload`:
        case `other`:
          chrome.storage.local.remove(Developer, () => {
            if (chrome.runtime.lastError) {
              console.error(`Failed to remove development mode:`, chrome.runtime.lastError)
            }
          })
          break
        default:
          console.warn(`Unknown install type: ${info.installType}, assuming normal installation`)
          chrome.storage.local.remove(Developer)
      }
    } catch (error) {
      console.error(`Error processing management info:`, error)
      chrome.storage.local.remove(Developer)
    }
  })
}
```

## Critical Fix 2: Error Handling in setPlatform()

**Current Code (Lines 91-107):**
```javascript
function setPlatform() {
  chrome.runtime.getPlatformInfo((info) => {
    const windows = `win`,
      macOS = `mac`
    let store
    switch (info.os) {
      case windows:
        store = Os.windows
        break
      case macOS:
        store = Os.macOS
        break
      default:
        store = Os.linux
        break
    }
    chrome.storage.local.set({ [`platform`]: store })
  })
}
```

**Problem:** No error handling for Chrome API calls

**Fixed Code:**
```javascript
function setPlatform() {
  chrome.runtime.getPlatformInfo((info) => {
    // Check for Chrome runtime errors
    if (chrome.runtime.lastError) {
      console.error(`Failed to get platform info:`, chrome.runtime.lastError)
      // Fall back to a reasonable default
      chrome.storage.local.set({ [`platform`]: Os.linux })
      return
    }
    
    // Check if info is valid
    if (!info || !info.os) {
      console.error(`Invalid platform info received`)
      chrome.storage.local.set({ [`platform`]: Os.linux })
      return
    }
    
    try {
      const windows = `win`,
        macOS = `mac`
      let store
      
      switch (info.os) {
        case windows:
          store = Os.windows
          break
        case macOS:
          store = Os.macOS
          break
        default:
          // Android, ChromeOS, Linux, FreeBSD, etc.
          store = Os.linux
          break
      }
      
      // Store the platform with error handling
      chrome.storage.local.set({ [`platform`]: store }, () => {
        if (chrome.runtime.lastError) {
          console.error(`Failed to store platform info:`, chrome.runtime.lastError)
        } else {
          console.info(`Platform detected as: ${store}`)
        }
      })
    } catch (error) {
      console.error(`Error processing platform info:`, error)
      chrome.storage.local.set({ [`platform`]: Os.linux })
    }
  })
}
```

## Critical Fix 3: Startup Coordination

**Current Code (Lines 45-60):**
```javascript
function startup() {
  setPlatform()
  new Menu().startup()
  new Omnibox().startup()
  new Downloads().startup()
  
  switch (WebBrowser()) {
    case Engine.chrome:
      console.info(`RetroTxt startup for the Chromium engine.`)
      break
    case Engine.firefox:
      console.info(`RetroTxt startup for the Firefox engine.`)
      break
  }
}
```

**Problem:** No coordination between async operations

**Fixed Code:**
```javascript
function startup() {
  // Use a promise-based approach to coordinate startup
  new Promise((resolve, reject) => {
    try {
      // First, ensure platform is set
      setPlatform()
      
      // Give a small delay to allow platform to be set before other components start
      setTimeout(() => {
        try {
          // Start other components
          new Menu().startup()
          new Omnibox().startup()
          new Downloads().startup()
          
          switch (WebBrowser()) {
            case Engine.chrome:
              console.info(`RetroTxt startup for the Chromium engine.`)
              break
            case Engine.firefox:
              console.info(`RetroTxt startup for the Firefox engine.`)
              break
            default:
              console.info(`RetroTxt startup for unknown browser engine.`)
          }
          
          resolve()
        } catch (error) {
          console.error(`Error during component startup:`, error)
          reject(error)
        }
      }, 100) // Small delay to allow platform to be set
      
    } catch (error) {
      console.error(`Error during startup initialization:`, error)
      reject(error)
    }
  }).catch(error => {
    console.error(`RetroTxt startup failed:`, error)
    // Extension can still function with defaults even if startup fails
  })
}
```

## Summary of Changes

### File: `ext/scripts/sw/background.js`

**Changes Required:**
1. Lines 73-84: Add comprehensive error handling to devMode()
2. Lines 91-107: Add comprehensive error handling to setPlatform()
3. Lines 45-60: Improve startup coordination with promise-based approach

**Impact:**
- Prevents silent failures in Chrome API calls
- Provides better error reporting and debugging information
- Improves startup reliability and coordination
- Enhances overall WebExtension robustness
- Makes the extension more resilient to API failures

**Risk Level:** Low - All changes are targeted fixes that preserve existing functionality while improving error handling and reliability.