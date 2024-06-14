---
title: Browser wars
authors:
    - Ben Garrett
date: 2022-08-30
hide:
  - toc
---

!!! tips inline end "macOS tweaks"
    1. Make sure the _Retina Display Scale_ is exactly half your screen resolution for crisper text.
    2. For example, if a Macbook Pro 13.3" has a 2560 x 1600 resolution, you'd want the _Built-in Retina Display_ to scale to 1280 x 800.
    3. Because of the high resolutions with modern Apple hardware, you can also disable _Use font smoothing when available_.

## A system or browser preference?

All supported browsers use the identical [Blink](https://www.chromium.org/blink/), open-sourced browser render engine.

Apple's **macOS is the best platform for RetroTxt** as it displays all text characters without distortion.
However, Chrome on other platforms, including Windows, Linux, and ChromeOS, suffers from distortions caused by its system-wide font hinting.

=== "macOS"

    ![RetroTxt ANSI on macOS](../assets/block-macos.png){ loading=lazy, width=239 }

=== "Windows"

    ![RetroTxt ANSI on Windows](../assets/block-windows.png){ loading=lazy, width=239 }

=== "Windows with CSS fix [^1]"

    ![RetroTxt ANSI on Windows fix](../assets/block-windows-css.png){ loading=lazy, width=239 }

[^1]: RetroTxt applies a cascading style fix to reduce the artifacts.