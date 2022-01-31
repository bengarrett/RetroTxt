---
hide:
  - toc
---
# Is there an operating system or browser preference?

## Browser

Chromium-based browsers reduce excessive CPU usage and battery drains by limiting the processing resources available to Extensions. So they can be slower than Firefox to render large ANSI documents or text that use RGB color controls.

## Operating system

### Great: macOS

Apple's macOS is the best platform to use RetroTxt. Regardless of the browser, it displays shaded characters and blocks with no artifacts or distortion.

Make sure the **Retina Display Scale** is exactly half your screen resolution for crisper text. For example, if a Macbook Pro 13.3" has a 2560 x 1600 resolution, you'd want the **Built-in Retina Display** to scale to `1280 x 800`. Because of the high resolutions with many modern Apple products, you can also disable **Use font smoothing when available**.

### Good: Linux <small>and ChromeOS</small>

Desktop Linux complicates things due to the varying components used by different distributions.

Firefox (at least on GNOME with Wayland), has no artifacts, so it is the preferred browser on Linux.

Chrome and ChromeOS use their internal font rendering, which suffers from the same artifacts as Chrome on Windows.

### Average: Windows

Windows suffers from artifacts and distortions caused by its system-wide font hinting regardless of the browser.