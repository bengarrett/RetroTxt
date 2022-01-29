# Preferred operating system and browser?

To reduce excessive CPU usage and battery drains, Chrome artificially limits the processing resources available to Extensions. So it can be slower than Firefox to render large ANSI documents or text that use RGB color controls.

### 1. macOS

Apple's macOS is the best platform to use RetroTxt. Regardless of the browser, it displays shaded characters and blocks with no artifacts or distortion.

For crisper text, make sure the Retina Display Scale is exactly half your screen resolution. For example, if a Macbook Pro 13.3" has a 2560 x 1600 resolution, you'd want the Built-in Retina Display to scale to 1280 x 800. Because of the high resolutions with many modern Apple products, you can also disable Use font smoothing when available.

### 2. Linux <small>and ChromeOS</small>

Desktop Linux complicates things due to the number of varying components used by different distributions.

Firefox (at least on GNOME with Wayland), there are no artifacts, so it is the preferred browser on Linux.

Chrome and ChromeOS uses its internal font rendering, which suffers from the same artifacts as Chrome on Windows.

### 3. Windows

Regardless of the browser, Windows suffers from artifacts and distortions caused by its system wide font hinting.

 `████`<br>
<small>An example of characters that introduce artifacts</small>
