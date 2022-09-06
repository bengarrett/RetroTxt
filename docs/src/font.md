---
title: Font conversion
authors:
    - Ben Garrett
date: 2022-08-30
---

## Web Open Font Format 2

RetroTxt relies on Truetype or OpenType web fonts in the [Web Open Font Format 2.0](https://www.w3.org/TR/WOFF2/) (WOFF2). The format offers the best compression to reduce the overall download and memory-use size of RetroTxt.

The WOFF2 format is relatively new, and most font distributions do not offer it. To add these fonts into RetroTxt older formats must first go through a conversion.

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

- [TransType](https://www.fontlab.com/font-converter/transtype)

### WOFF2 font conversion

- [google/woff2](https://github.com/google/woff2)
