---
title: Browser wars
authors:
    - Ben Garrett
date: 2022-08-30
hide:
  - toc
---

## Is there an operating system or browser preference?

!!! tips inline end "macOS tweaks"
    1. Make sure the _Retina Display Scale_ is exactly half your screen resolution for crisper text.
    2. For example, if a Macbook Pro 13.3" has a 2560 x 1600 resolution, you'd want the _Built-in Retina Display_ to scale to 1280 x 800.
    3. Because of the high resolutions with modern Apple hardware, you can also disable _Use font smoothing when available_.

All supported browsers use the same rendering engine, [Chromium](https://www.chromium.org/Home/), the open-sourced Chrome browser rendering engine.

macOS is the best platform for RetroTxt, displaying all text characters without distortion.

Chrome on Windows suffers from artifacts and distortions caused by its system-wide font hinting regardless of the browser. Chrome on Linux and ChromeOS uses the same internal font renderer and suffers from the same artifacts.

### insert comparison