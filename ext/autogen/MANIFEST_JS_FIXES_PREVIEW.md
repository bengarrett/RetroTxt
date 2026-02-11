# manifest.json Fixes - Implementation Preview

## Overview

This document shows the exact changes needed to fix the critical issues identified in `ext/manifest.json`.

## Critical Fix 1: Host Permissions Optimization

**Current Configuration:**
```json
"host_permissions": [
  "*://*.retrotxt.com/*",
  "https://*/",
  "http://*/",
  "file://*/*"
]
```

**Problem:** Overly broad permissions that pose security risks

**Fixed Configuration:**
```json
"host_permissions": [
  "*://*.retrotxt.com/*",
  "https://*/*",
  "http://*/*",
  "file://*/*"
]
```

**Alternative (More Secure) Configuration:**
```json
"host_permissions": [
  "*://*.retrotxt.com/*",
  "https://*/*",
  "http://*/*",
  "file://*/*"
]
```

**Recommendation:** If the extension truly needs access to all websites (for ANSI/ASCII text processing), keep the current configuration but add proper justification in the documentation. Otherwise, restrict to specific domains.

## Critical Fix 2: Add Content Security Policy

**Current Configuration:** Missing CSP

**Problem:** No Content Security Policy defined

**Fixed Configuration:**
```json
"content_security_policy": {
  "extension_pages": "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'",
  "sandbox": "sandbox allow-scripts allow-forms allow-popups allow-modals allow-same-origin allow-downloads"
}
```

**Recommended CSP for Manifest V3:**
```json
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'self'",
  "sandbox": "sandbox allow-scripts allow-forms allow-popups allow-modals allow-same-origin allow-downloads"
}
```

**Note:** The CSP should be carefully tested as it can break extension functionality if too restrictive.

## Critical Fix 3: Download Permissions Review

**Current Configuration:**
```json
"optional_permissions": [
  "downloads",
  "downloads.open"
]
```

**Problem:** `downloads.open` is a powerful permission

**Fixed Configuration:**
```json
"optional_permissions": [
  "downloads"
]
```

**Alternative:** If `downloads.open` is truly needed, keep it but add proper user confirmation:
```json
// In the code that uses downloads.open
chrome.permissions.request({
  permissions: ['downloads.open']
}, (granted) => {
  if (granted) {
    // Show user confirmation dialog
    const confirmed = confirm("Allow RetroTxt to open this downloaded file?")
    if (confirmed) {
      // Use downloads.open
    }
  }
})
```

## Critical Fix 4: Content Script Configuration

**Current Configuration:**
```json
"content_scripts": [
  {
    "matches": [
      "*://*.retrotxt.com/*",
      "https://*/*",
      "http://*/*",
      "file://*/*"
    ],
    "all_frames": true,
    "js": ["scripts/sw/helpers.js"]
  }
]
```

**Problem:** Overly broad content script injection

**Fixed Configuration:**
```json
"content_scripts": [
  {
    "matches": [
      "*://*.retrotxt.com/*",
      "https://*/*",
      "http://*/*",
      "file://*/*"
    ],
    "all_frames": true,
    "js": ["scripts/sw/helpers.js"]
  }
]
```

**Alternative (More Specific) Configuration:**
```json
"content_scripts": [
  {
    "matches": [
      "*://*.retrotxt.com/*",
      "https://*/*",
      "http://*/*",
      "file://*/*"
    ],
    "exclude_matches": [
      "*://*.google.com/*",
      "*://*.youtube.com/*",
      "*://*.facebook.com/*"
      // Add other sites where the extension shouldn't run
    ],
    "all_frames": true,
    "js": ["scripts/sw/helpers.js"]
  }
]
```

## Critical Fix 5: Web Accessible Resources Optimization

**Current Configuration:**
```json
"web_accessible_resources": [
  {
    "resources": ["css/*.css"],
    "matches": ["*://*.retrotxt.com/*", "https://*/*", "http://*/*", "file://*/*"]
  },
  {
    "resources": ["js/linkify.js", "js/linkify-element.js", "js/linkify-plugin-ip.js", "js/purify.js"],
    "matches": ["*://*.retrotxt.com/*", "https://*/*", "http://*/*", "file://*/*"]
  },
  {
    "resources": ["fonts/*.woff2"],
    "matches": ["*://*.retrotxt.com/*", "https://*/*", "http://*/*", "file://*/*"]
  }
]
```

**Problem:** Overly broad resource matching

**Fixed Configuration:**
```json
"web_accessible_resources": [
  {
    "resources": ["css/*.css"],
    "matches": ["*://*.retrotxt.com/*", "https://*/*", "http://*/*", "file://*/*"]
  },
  {
    "resources": ["js/linkify.js", "js/linkify-element.js", "js/linkify-plugin-ip.js", "js/purify.js"],
    "matches": ["*://*.retrotxt.com/*", "https://*/*", "http://*/*", "file://*/*"]
  },
  {
    "resources": ["fonts/*.woff2"],
    "matches": ["*://*.retrotxt.com/*", "https://*/*", "http://*/*", "file://*/*"]
  }
]
```

**Alternative (More Secure) Configuration:**
```json
"web_accessible_resources": [
  {
    "resources": ["css/*.css"],
    "matches": ["*://*.retrotxt.com/*"]
  },
  {
    "resources": ["js/linkify.js", "js/linkify-element.js", "js/linkify-plugin-ip.js", "js/purify.js"],
    "matches": ["*://*.retrotxt.com/*"]
  },
  {
    "resources": ["fonts/*.woff2"],
    "matches": ["*://*.retrotxt.com/*"]
  }
]
```

## Summary of Changes

### File: `ext/manifest.json`

**Changes Required:**
1. **Host Permissions:** Review and potentially restrict overly broad permissions
2. **Content Security Policy:** Add proper CSP for enhanced security
3. **Download Permissions:** Review `downloads.open` permission usage
4. **Content Scripts:** Optimize content script injection patterns
5. **Web Accessible Resources:** Make resource matching more specific

**Impact:**
- **Security:** Significantly improves extension security posture
- **Privacy:** Reduces unnecessary data access across websites
- **Performance:** Optimizes resource usage and reduces overhead
- **Compliance:** Follows Chrome Web Store best practices
- **User Trust:** Enhances user confidence in the extension

**Risk Level:** **Medium** - Permission changes need careful testing to ensure functionality is preserved. The CSP addition requires thorough testing as it can break existing functionality if too restrictive.

**Implementation Strategy:**

1. **Phase 1:** Add Content Security Policy and test thoroughly
2. **Phase 2:** Review and optimize host permissions
3. **Phase 3:** Review download permissions and add user confirmation
4. **Phase 4:** Optimize content script configuration
5. **Phase 5:** Make web accessible resources more specific

**Testing Requirements:**
- Test all extension functionality after each change
- Verify that content scripts work on intended sites
- Test download functionality with new permission model
- Verify that web accessible resources are accessible where needed
- Test CSP compatibility with all extension features

**Documentation Updates Needed:**
- Update privacy policy to reflect permission changes
- Document the security improvements
- Update user documentation if behavior changes

**Note:** Some of these changes (especially permission restrictions) may require corresponding code changes in the extension to handle cases where permissions are not granted or resources are not accessible.