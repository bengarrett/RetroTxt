---
title: Font conversion
authors:
    - Ben Garrett
date: 2022-08-30
---

!!! warning ""
    The `ext/fonts/` directory contains fonts that are not compatible with the LGPL-3.0 license and cannot be used in other projects.

## Web Open Font Format 2

RetroTxt relies on Truetype or OpenType web fonts in the WOFF2[^1] format that offers the best compression to reduce the overall download and memory-use.

The WOFF2[^1] format is relatively new, and many font distributions do not offer it. Older formats must first be converted to add these fonts to RetroTxt.

### [WebAssembly TTF to WOFF2](https://github.com/fontello/wawoff2)


```bash title="Convert a Truetype font into WOFF2"
cd RetroTxt
pnpm run font fontname.ttf fontname.woff2
```

!!! Tip "Tip for Windows"

    Windows users may need to update the font script in the `package.json` file.

    === "Original"

        ``` json
        "scripts": {
          "font": "woff2_compress.js"
        },
        ```

    === "Edit"

        ``` json
        "scripts": {
          "font": "woff2_compress.js.cmd"
        },
        ```

## Font tools

### Online generators

- [Font Squirrel Webfont Generator](https://www.fontsquirrel.com/tools/webfont-generator)
- [transfonter Webfont generator](https://transfonter.org)

### Online metadata

- [FontDrop!](https://fontdrop.info)

### Universal font conversion

- [TransType](https://www.fontlab.com/font-converter/transtype) (paid)

### WOFF2 font conversion

- [google/woff2](https://github.com/google/woff2)

[^1]: [Web Open Font Format 2.0](https://www.w3.org/TR/WOFF2/)