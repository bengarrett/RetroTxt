---
title: Manifest version 3
authors:
    - Ben Garrett
date: 2022-08-30
hide:
  - toc
---
# Manifest V3

[Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/) is the replacement API created by Google for third-party Extensions on the Chromium web engine. [The announcement is that by the end of 2022](https://developer.chrome.com/docs/extensions/mv3/mv2-sunset/), the Chrome Web Store will not allow any new Extension updates using Manifest V2.

RetroTxt from version 5.0 uses Manifest V3, while earlier editions used Manifest V2.

Manifest V3 comes with several benefits for RetroTxt.

### The good

1. Manifest V3 uses service workers that make the source code easier to layout and debug. RetroTxt v5 is now more resilient, and the migration fixed some previously hard-to-trace behavior bugs.
1. Service workers also mean future features will be simpler to implement and test.
1. Unfocused tabs can run RetroTxt in the background.
1. Manifest V3 has an improved and safer permissions system, which means RetroTxt can work out of the box without any scary-looking permissions requests.

### The bad

1. Firefox has no support for Manifest V3, and there is no timeline for its implementation.
