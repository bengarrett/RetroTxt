---
hide:
  - toc
---
# Is there an operating system or browser preference?

## Browsers

Chrome-based browsers reduce CPU usage and battery drain by limiting the resources available to Extensions. So they can be slower than Firefox to render large ANSI documents or text that use RGB color controls.

## Operating systems

### **Great**, macOS

macOS is the best platform to use RetroTxt, regardless of the browser, and it displays shaded characters and blocks with no artifacts or distortion.

Some tips, make sure the **Retina Display Scale** is exactly half your screen resolution for crisper text. For example, if a Macbook Pro 13.3" has a 2560 x 1600 resolution, you'd want the **Built-in Retina Display** to scale to `1280 x 800`. Because of the high resolutions with modern Apple hardware, you can also disable **Use font smoothing when available**.

### **Good**, Linux <small>and ChromeOS</small>

Desktop Linux complicates things due to the varying components used by different distributions.

Firefox[^1] has no artifacts, so it is the preferred browser on Linux.

Chrome and ChromeOS use an internal font renderer, which suffers from the same artifacts as Chrome on Windows.

### **Fine**, Windows

Windows suffers from artifacts and distortions caused by its system-wide font hinting regardless of the browser.

[^1]: At least on GNOME with Wayland.