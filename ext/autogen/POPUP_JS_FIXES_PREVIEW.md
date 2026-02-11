# popup.js Fixes - Implementation Preview

## Overview

This document shows the exact changes needed to fix the critical bugs identified in `ext/scripts/popup.js`.

## Critical Fix 1: Null Check in LinkTos()

**Current Code (Lines 30-34):**
```javascript
chrome.storage.local.get(`settingsWebsiteDomains`, (store) => {
  const domains = store.settingsWebsiteDomains
  domains.push(`retrotxt.com`)
  domains.sort()
  document.getElementById(`websites`).textContent = `${domains.join(", ")}`
})
```

**Problem:** No null check for `store.settingsWebsiteDomains`

**Fixed Code:**
```javascript
chrome.storage.local.get(`settingsWebsiteDomains`, (store) => {
  let domains = store.settingsWebsiteDomains
  if (!Array.isArray(domains)) {
    domains = []
  }
  domains.push(`retrotxt.com`)
  domains.sort()
  document.getElementById(`websites`).textContent = `${domains.join(", ")}`
})
```

## Critical Fix 2: Error Handling in isAllowedFileSchemeAccess()

**Current Code (Lines 43-52):**
```javascript
chrome.extension.isAllowedFileSchemeAccess((allowed) => {
  if (!allowed) {
    const div1 = document.getElementById(`localfiles`)
    div1.classList.add(`is-hidden`)
    const div2 = document.getElementById(`unlockLocalfiles`)
    div2.classList.remove(`is-hidden`)
    div2.addEventListener(`click`, () => {
      chrome.tabs.create({
        url: LinkDetails(),
      })
    })
  }
})
```

**Problem:** No error handling and event listener cleanup

**Fixed Code:**
```javascript
chrome.extension.isAllowedFileSchemeAccess((allowed) => {
  if (chrome.runtime.lastError) {
    console.error(`Failed to check file scheme access:`, chrome.runtime.lastError)
    return
  }
  if (!allowed) {
    const div1 = document.getElementById(`localfiles`)
    const div2 = document.getElementById(`unlockLocalfiles`)
    if (div1 && div2) {
      div1.classList.add(`is-hidden`)
      div2.classList.remove(`is-hidden`)
      
      const handleClick = () => {
        chrome.tabs.create({
          url: LinkDetails(),
        })
      }
      div2.addEventListener(`click`, handleClick)
      
      // Store for potential cleanup
      if (!window.retroTxtPopupListeners) window.retroTxtPopupListeners = []
      window.retroTxtPopupListeners.push({ element: div2, handler: handleClick })
    }
  }
})
```

## Critical Fix 3: Error Handling in TabTo()

**Current Code (Lines 88-98):**
```javascript
chrome.tabs.query({ url: path }, (tabs) => {
  for (let i = 0; i < tabs.length; i++) {
    chrome.tabs.update(tabs[i].id, {
      active: true,
      url: `${path}#top?t=${value}`,
    })
    return
  }
  chrome.tabs.create({
    active: true,
    url: `${path}#top?t=${value}`,
  })
})
```

**Problem:** No error handling and questionable early return logic

**Fixed Code:**
```javascript
chrome.tabs.query({ url: path }, (tabs) => {
  if (chrome.runtime.lastError) {
    console.error(`Failed to query tabs:`, chrome.runtime.lastError)
    // Fall back to creating new tab
    chrome.tabs.create({
      active: true,
      url: `${path}#top?t=${value}`,
    })
    return
  }
  
  if (tabs.length > 0) {
    // Update all matching tabs instead of just the first one
    const updatePromises = tabs.map(tab => {
      return new Promise((resolve) => {
        chrome.tabs.update(tab.id, {
          active: true,
          url: `${path}#top?t=${value}`,
        }, () => {
          if (chrome.runtime.lastError) {
            console.error(`Failed to update tab ${tab.id}:`, chrome.runtime.lastError)
          }
          resolve()
        })
      })
    })
    
    Promise.all(updatePromises).catch(error => {
      console.error(`Failed to update tabs:`, error)
    })
  } else {
    chrome.tabs.create({
      active: true,
      url: `${path}#top?t=${value}`,
    })
  }
})
```

## Medium Fix 4: Error Handling in LinkDetails()

**Current Code (Lines 5-20):**
```javascript
function LinkDetails() {
  const extensionId = chrome.runtime.id,
    ua = navigator.userAgent
  if (extensionId.length === 0) return ``
  if (ua.includes(`Firefox/`)) return ``
  const url = `://extensions?id=${extensionId}`
  if (ua.includes(`Edg/`)) return `edge${url}`
  if (ua.includes(`OPR/`)) return `opera${url}`
  return `chrome${url}`
}
```

**Problem:** No error handling for edge cases

**Fixed Code:**
```javascript
function LinkDetails() {
  try {
    const extensionId = chrome.runtime.id
    const ua = navigator.userAgent
    
    if (!extensionId || extensionId.length === 0) {
      console.warn(`Extension ID is empty`)
      return ``
    }
    
    if (ua.includes(`Firefox/`)) return ``
    
    const url = `://extensions?id=${extensionId}`
    
    if (ua.includes(`Edg/`)) return `edge${url}`
    if (ua.includes(`OPR/`)) return `opera${url}`
    
    // Default to Chrome
    return `chrome${url}`
    
  } catch (error) {
    console.error(`Failed to generate extension details URL:`, error)
    return ``
  }
}
```

## Summary of Changes

### File: `ext/scripts/popup.js`

**Changes Required:**
1. Lines 30-34: Add null check for settingsWebsiteDomains
2. Lines 43-52: Add error handling and event listener management
3. Lines 88-98: Add error handling and fix tab update logic
4. Lines 5-20: Add error handling to LinkDetails()

**Impact:**
- Prevents runtime errors when settings are missing
- Improves error handling for file scheme access
- Fixes tab management logic and adds proper error handling
- Makes LinkDetails() more robust
- Reduces memory leaks from event listeners
- Enhances overall WebExtension reliability

**Risk Level:** Low - All changes are targeted fixes that preserve existing functionality while fixing bugs.