# Fonts

## WOFF2

Convert and compact a Truetype font into WOFF2 for use by RetroTxt.

!!! TODO
    - woff2 offers the best compression to reduce the download size of RT.
    - woff2 is supported by all browsers that RT uses.
    - woff2 fonts are too new and not usually included with font packages.
    - woff2 is basically woff with a different compression method (* lookup name)

[woff2 for node.js](https://github.com/fontello/wawoff2).

```bash title="Convert example"
yarn run font mona.ttf mona.woff2
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

## Encoding fonts

#### Online conversion

- [font squirrel](https://www.fontsquirrel.com/tools/webfont-generator)
- [transfonter](https://transfonter.org)

#### Online metadata

- [font drop](https://fontdrop.info)

#### Offline conversion

- [transtype](https://www.fontlab.com/font-converter/transtype)

#### Woff2 batch conversion

- [woff2](https://github.com/google/woff2)
