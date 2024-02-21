---
title: Manifest version 3
authors:
    - Ben Garrett
date: 2022-08-30
hide:
  - toc
---
# Manifest V3 usage

[Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/) is the replacement API created by Google for third-party Extensions on the Chromium web engine. [The announcement was that by the end of 2023](https://developer.chrome.com/docs/extensions/mv3/mv2-sunset/), the Chrome Web Store will not allow new Extension updates using [Manifest V2](https://developer.chrome.com/docs/extensions/mv2).

RetroTxt 5 uses Manifest V3, while earlier editions used Manifest version 2.

---

### The Manifest version 3 comes with several benefits for RetroTxt

#### The good

- The use of service workers that make the source code easier to layout and debug. RetroTxt v5 is now more resilient, and the migration fixed some previously hard-to-trace behavior bugs.
- Service workers also mean future features will be simpler to implement and test.
- Unfocused tabs can run the RetroTxt process while in the background.
- Offers an improved and safer permissions system, which means RetroTxt can work out of the box with less scary-looking permissions requests.

#### The bad

- __Firefox__ has limited support for Manifest V3, and there is no timeline for its full implementation.
