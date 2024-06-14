---
title: Program patterns
authors:
    - Ben Garrett
date: 2024-02-19
hide:
  - toc
---
# Program patterns

## Code encoding

All web extension code, including JS, CSS, and HTML, should be encoded as __UTF-8__ using Unix-style __LF__ (line-feed) newline controls.

## Parsing escape codes complexity

The terms _ANSI escape codes_ or _sequences_ get given to plain text documents embedded with special terminal text stylizations and controls. Long formalized into several technical standards such as ANSI X3.64, [ISO/IEC 6429](https://www.iso.org/obp/ui/#iso:std:iso-iec:6429:ed-3:v1:en), and [EMCA-48](https://ecma-international.org/publications-and-standards/standards/ecma-48/), they are commonly but inaccurately referred to as <q>[ANSI text](https://blog.ansi.org/2019/10/ansi-art-ascii-art-iso-standards-x3-64/)</q>.

The ANSI escape paradigm originates from the 1970s in a very different computing landscape when file and memory size reduction trumped usability. Unlike modern HTML syntax, there is no identifier to finish or close text stylizations or formatting changes.

Instead, when parsing text, one must look ahead through the code for control modifiers that affect the existing stylizations. Unfortunately, these closing modifiers may be deep within the text document or not provided.

For example, in HTML, you wrap the bold text around a pair of `<strong></strong>` tags. In markdown, the same boldness can be done using a set of `__` or `**` characters.

```html
<strong>This is bold text</strong>
<br>
<strong>This is strong <em>and stresses emphasis</em></strong>
<br>
HTML can be <span style="color: red;">red</span>,
<span style="color: green;">green</span>,
or <span style="color: yellow;">yellow</span>.
```

```markdown
__This is bold text__
**This is bold text**
_This is italicized text_
___This is bold and italicized text___
```

But for <small>(ANSI)</small> escape-encoded text, the escape code value `1` is used to toggle <q>bold</q> text. This style must remain active until one of the following escape code values are found:

- `0` for the <q>reset/normal</q> font toggle
- `22` for the <q>bold off</q> toggle
- `23` for the <q>normal intensity</q> toggle

```ansi
This is \e[1mbold text\e[0m
This \e[3mitalicizes text which continues through the next lines
This is also \e[1mbold text\e[22m
And this is \e[1mbold text\e[23m, but
then\e[0m this resets all text.

Escape codes can be \e[31mred\e[0m, \e[32mgreen\e[0m, or \e[33myellow\e[0m.

And multiple \e[1;31;47mstyles\e[0m can be combined.
```

Because of this complexity, the code uses a JS class object named [SGR](https://github.com/bengarrett/RetroTxt/blob/main/ext/scripts/parse_ansi.js#L326) ([select or set graphic rendition](https://vt100.net/docs/vt510-rm/SGR.html)) to keep track of the active font and style toggles while parsing the escape-encoded document. The JS object has over a dozen boolean properties to track the various text styles, some integer properties for the foreground and background, 16-color values, and a pair of strings for hexadecimal RGB color codes.

[RGB color codes](https://gist.github.com/sindresorhus/bed863fb8bedf023b833c88c322e44f9) are not part of the ANSI standard but are in some text artworks and are used by various applications. An RGB foreground or background color value will always override a previous 16 or 256-color value until a normal/reset control code (`\e[0m`) is used.

One key functionality of the standard is controlling the [cursor position](https://man7.org/linux/man-pages/man4/console_codes.4.html). Much like a modern text editor, you could use the controls to move the text input cursor up or down, left or right, to then apply additional text or styles to the new screen position.

Unfortunately, HTML does not replicate this type of functionality at all. While it could be possible to track such positioning using JS and the Document Object Model in the browser, it would be needlessly complex and time-consuming for little reward. The typical use case for cursor movement was text art and animations from the early 1990s created for [Bulletin Board Systems](https://www.computerhope.com/jargon/b/bbs.htm). However, these texts are better suited to read in a fixed-size ANSI editor, viewer, or terminal app than a web browser.

The code uses a [line-break HTML element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/br) to support the cursor's down positioning and forward (`→` right movement) by injecting space characters for each forward value and `↓` down position. But there is no intention to support the back (`←` left movement) and `↑` up positioning controls.

## Conflicts, ASCII and IBM code pages

The 256 codepoint [Code page 437](https://en.wikipedia.org/wiki/Code_page_437) was the primary text encoding for [personal computers](https://www.ibm.com/history/personal-computer) in the USA and Canada during the 1980s and early 1990s. However, CP-437 is incompatible with the universal [ASCII text encoding](https://developer.mozilla.org/en-US/docs/Glossary/ASCII) and the [Unicode encoding](https://developer.mozilla.org/en-US/docs/Glossary/Unicode).

The first 32 [code points](https://en.wikipedia.org/wiki/Code_point) (`0x00-0x1F`) of CP-437 contain display characters, while in ASCII and Unicode, these are control codes. For the applications using the legacy CP-437, it was up to the software to decide whether to display characters or obey an ASCII control code.

For example, in [MS-DOS](https://www.britannica.com/technology/MS-DOS), the primary PC operating system in the 1980s, code point 26 (`0x1A`) can display a right arrow `→` or a marker to signal the end-of-document.

For another example, code point 13 (`0x0D`) is usually a newline carriage return, but with CP-437, it can be the musical note `♪`.

Whenever IBM CP-437 or other IBM codepages are detected, the RetroTxt code will generally obey the everyday control codes shown below, but otherwise, it displays the characters from the IBM codepage.

```
Code point 0x08, "◘" is always a backspace control
Code point 0x09, "○" is always a horizontal tab
Code point 0x13, "♪" is always carriage return
Code point 0x1A, "→" is treaded as an end of file marker
Code point 0x7F, "⌂" is always a delete control
```

## Switch conditionals and a lot of loops

When conceiving the initial code, I targeted the new ES6 ([ECMAScript 2015](http://es6-features.org/)). Unfortunately, this standard set lacked an equivalent to a [regex look-behind assertion](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Lookbehind_assertion) feature, so the code had to implement opaque multiple-loop switch conditionals to pattern match for control modifiers within the text document.

At the time, switch statements were the most performant conditional pattern for the Chromium [V8&nbsp;JavaScript&nbsp;engine](https://v8.dev/), thanks to byte code conversion.

```js
// CUU, CUD, CUF, CUB - Cursor Up, Down, Forward, Back
switch (digit._0) {
  case true:
    switch (digit._1) {
      case true:
        switch (digit._2) {
          case true:
            switch (digit._3) {
              case true:
                if (this._cursorCode(peak._4))
                  // ←[1523A move thousands of places
                  return this._cursorMove(peak._4, [
                    peak._0,
                    peak._1,
                    peak._2,
                    peak._3,
                  ])
                break
              default:
                ...
```

## Text characters and pattern matching

The code uses strings instead integer arrays, even though most ANSI and legacy text interpretators historically would be hexadecimal or binary. But in browsers, the documents are loaded in as [UTF-16](https://unicode.org/faq/utf_bom.html) text, so conversion to integer values for parsing and back again as text for display seems unnecessary.

As a bonus, text-based pattern matching is more readable than character and control code values.

## There are no magic numbers

When dealing with legacy text standards, it is easy to fall into the trap of using hexadecimal or decimal codes as value representations which have no meaning without additional documentation. Code should always be readable without needing conversion tables or assumed knowledge.

For example, using a symbol named `ESC` or `escape` is far more meaningful than providing the hexadecimal value `0x1B` or the integer `27` value out of context.

```js
const escape = 27
if (char === escape) {
  ...
}
```

## Classes

JS classes are used throughout the code except for some helper and local functions.
They are templates for creating readable objects with more accessible naming options.

```js
// An example of a class object in use
const ansi = new Controls()
ansi.parse()
console.log("counts, columns: ", ansi.columns, "rows: ", ansi.rows)
```

## Idiomatic text elements

The HTML idiomatic element applies CSS classes and styles to the text on the page. The code parses through the original text and escape controls, then uses the browser DOM to generate a new body element on the page, filled with idiomatic elements and text characters. The idiomatic approach seemed most appropriate and reduced the overall markup size.

> The `<i>` HTML element represents a range of text that is set off from the normal text for some reason, such as idiomatic text, technical terms, taxonomical designations, among others. Historically, these have been presented using italicized type, which is the original source of the `<i>` naming of this element.

+ [https://developer.mozilla.org/en-US/docs/Web/HTML/Element/i](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/i)

## The preference for reference over of primitive types

When ES6 was new and the code conceived, the Chromium V8 JavaScript engine was optimized for reference types over primitive types.
But this has since changed, and the engine uses a more balanced approach. However, the code still uses reference types for most of the data.

> Copying and accessing JS reference types, such as arrays and objects, can use far less memory than simple types, such as long strings or integers. When passing data using simple types, the data gets duplicated or modified instead of referenced.

## Objects vs arrays

During code design in the days of ES6, the JS community believed that objects were more memory efficient than arrays, so several array constructors, such as `Uint8Array`, were skipped. However, this disparity is not relevant today.

## Do not combine reference types with primitive types in large sets

Referenced value types such as  `undefined` or `null` should never be mixed with simple values as [they cause a performance hit](https://ponyfoo.com/articles/javascript-performance-pitfalls-v8#take-away-from-this-section).

An array with exclusive **number** elements should only use `-1` or `NaN` for the absence of a value.

An array with exclusive **string** elements should only use `` as empty values.
