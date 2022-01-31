---
hide:
  - toc
---
# Manifest V3

[Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/) (MV3) is the replacement API created by Google for third-party web extensions on the Chromium web engine. [The announcement is that by the end of 2022](https://developer.chrome.com/docs/extensions/mv3/mv2-sunset/), the Chrome Web Store will not allow any new Extension updates using Manifest V2 (MV2).

RetroTxt version 5.0 uses MV3, while earlier versions used MV2.

Manifest V3 comes with several benefits for RetroTxt but some significant issues. Most of these should are to be fixed by the end of 2022.

### The good

1. MV3 uses service workers that make the source code easier to layout and debug. RetroTxt v5 is now more resilient, and the migration managed to fix some previously hard to trace behavior bugs.
1. Service workers also mean future features will be simpler to implement and test.
1. Unfocused tabs can run RetroTxt in the background.
1. MV3 has an improved and safer permissions system, which means RetroTxt can work out of the box without any scary-looking permissions requests.
### The bad

1. Firefox has no support for MV3, and there is no timeline for its implementation.
1. The Omnibox API to allow custom commands in the address bar does not work with no timeline for a fix.
1. The ability for RetroTxt to be used as a local text file viewer is not working. There is a workaround using a command-line argument within Chrome or Edge. But it is an inelegant solution.