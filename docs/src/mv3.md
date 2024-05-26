---
title: Manifest version 3
authors:
    - Ben Garrett
date: 2022-08-30
hide:
  - toc
---
# Manifest V3 usage

[Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/) is Google's replacement API for third-party Extensions on the Chromium web engine. The announcement meant the retirement of the long-established Manifest V2 Extensions for all Chromium browsers. RetroTxt 5 uses Manifest V3, while prior editions use Manifest V2.

__Firefox__ has limited support for Manifest V3, and there is no priority or a timeline for its full implementation.

---

#### The Manifest version 3 comes with several benefits for RetroTxt

- The use of service workers that make the source code easier to layout and debug. RetroTxt v5 is now more resilient, and the migration fixed some previously hard-to-trace behavior bugs.
- Service workers also mean future features will be simpler to implement and test.
- Unfocused tabs can run the RetroTxt process while in the background.
- Offers an improved and safer permissions system, which means RetroTxt can work out of the box with less scary-looking permissions requests.
