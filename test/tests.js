const parser = new DOMParser();
let extensionId = null,
  engine = null;

if (typeof browser !== "undefined") {
  extensionId = browser.runtime.id;
  engine = "gecko";
} else if (typeof chrome !== "undefined") {
  extensionId = chrome.runtime.id;
  engine = "blink";
}
/*
 * eventPage.js
 */
QUnit.module("eventPage.js");

QUnit.test("newURLxhttpResponse", function(assert) {
  let filename, url = new newURLxhttpResponse();
  assert.equal(url.isTextFile, null, "No URL should return `null`");
  assert.equal(url.encoding, null, "No URL should return `null`");

  url = new newURLxhttpResponse("http://textfiles.com/bbs/1598.ufo");
  filename = "1598.ufo";
  assert.equal(url.isTextFile, true, filename + " text file should return `true`");
  assert.equal(url.encoding, "US-ASCII", filename + " text file should return `US-ASCII`");

  url = new newURLxhttpResponse("http://jargon-file.org/archive/jargon-1.0.3.dos.txt");
  filename = "jargon-1.0.3.dos.txt";
  assert.equal(url.isTextFile, true, filename + " text file should return `true`");
  assert.equal(url.encoding, "US-ASCII", filename + " text file should return `US-ASCII`");

  url = new newURLxhttpResponse("http://cd.textfiles.com/unprotect/POOL-UNP/POOLRAD.UNP");
  filename = "POOLRAD.UNP";
  assert.equal(url.isTextFile, true, filename + " text file should return `true`");
  assert.equal(url.encoding, "US-ASCII", filename + " text file should return `ISO-8859-1`");

  url = new newURLxhttpResponse("https://www.google.com");
  filename = "Google.com";
  assert.equal(url.isTextFile, false, filename + " should return `false`");
  assert.equal(url.encoding, "UTF-8", filename + " should return `other`");

  url = new newURLxhttpResponse("http://textfiles.com/bbs/12budord.txt");
  filename = "12budord.txt";
  assert.equal(url.isTextFile, true, filename + " should return `true`");
  assert.equal(url.encoding, "US-ASCII", filename + " should return `US-ASCII`");

  url = new newURLxhttpResponse("https://defacto2.net/file/raw/ae2b9e0");
  filename = "file/raw/ae2b9e0";
  assert.equal(url.isTextFile, true, filename + " should return `true`");
  assert.equal(url.encoding, "ISO-8859-1", filename + " should return `ISO-8859-1`");
});

/*
QUnit.test("newContentTypeHeader", function(assert) {
  let xhttp = {
      "Content-Length": 0,
      "Content-Type": "text/html; charset=iso-8859-1"
    }
  let content = new newContentTypeHeader("Content-Type: text/html; charset=iso-8859-1");
  assert.equal(content.type, "text", "Type should be `text`");
  assert.equal(content.subtype, "html", "Subtype should be `text`");
  assert.equal(content.encoding, "iso-8859-1", "Encoding should be `ISO-8859-1`");
  content = new newContentTypeHeader("Content-Type: text/html; charset=UTF-8");
  assert.equal(content.type, "text", "Type should be `text`");
  assert.equal(content.subtype, "html", "Subtype should be `text`");
  assert.equal(content.encoding, "UTF-8", "Encoding should be `UTF-8`");
  content = new newContentTypeHeader("Content-Type: text/plain; charset=US-ASCII");
  assert.equal(content.type, "text", "Type should be `text`");
  assert.equal(content.subtype, "plain", "Subtype should be `plain`");
  assert.equal(content.encoding, "US-ASCII", "Encoding should be `US-ASCII`");
});
*/
/*
 * functions.js
 */
QUnit.module("functions.js");

QUnit.test("newFontSettings", function(assert) {
  assert.throws(
    function() {
      newFontSettings();
    },
    "When no `ff` font-family parameter is provided newFontSettings() should throw an error"
  );
});

QUnit.test("createLinkToCSS", function(assert) {
  function css(then, expected) {
    assert.equal(createLinkToCSS("test.css", then),
      expected);
  }
  let linkElement = '<link id="dummyId" href="chrome-extension://' + extensionId + '/test.css" type="text/css" rel="stylesheet"></link>',
    doc = parser.parseFromString(linkElement, "text/html"), // parse the tag into a HTML document
    link = doc.getElementsByTagName("link")[0].toString(); // get the tag object from document and convert it to a string for testing
  css("dummyId", link, "TODO");
  linkElement = '<link href="chrome-extension://' + extensionId + '/test.css" type="text/css" rel="stylesheet"></link>';
  doc = parser.parseFromString(linkElement, "text/html");
  link = doc.getElementsByTagName("link")[0].toString();
  css("", link, "TODO");
  assert.throws(
    function() {
      createLinkToCSS();
    },
    "When no `f` or `i` parameters are provided createLinkToCSS() should throw an error"
  );
});

QUnit.test("newRgbColors", function(assert) {
  const colors = new newRgbColors(),
    amber = colors.amber,
    c64background = colors.c64bg;
  assert.equal(amber, "rgb(185,128,0)", "Amber color");
  assert.equal(c64background, "rgb(53,40,121)", "C64 background");
  assert.equal("", "", "No color");
  assert.equal("nonexistant", "nonexistant", "Typo color");
});

QUnit.test("changeTextShadow", function(assert) {
  //changeTextShadow(s, elm, color)
  assert.throws(
    function() {
      changeTextShadow();
    },
    "When no `c` color name parameter is provided changeTextShadow() should throw an error"
  );
});

QUnit.test("`convertCP1252String`", function(assert) {
  const usersettingDisplayCtrlCode = sessionStorage.getItem("cp437CtrlCodes"),
    testControlCharacter = "°°A²²BßC" + String.fromCharCode(13) + "Z÷Y."; // Character code 13 = carriage return / new line
  sessionStorage.setItem("cp437CtrlCodes", false);
  assert.equal(convertCP1252String(testControlCharacter), "░░A▓▓B▀C" + String.fromCharCode(13) + "Z≈Y.", "Treat ASCII control characters as that");
  sessionStorage.setItem("cp437CtrlCodes", true);
  assert.equal(convertCP1252String(testControlCharacter), "░░A▓▓B▀C♪Z≈Y.", "Treat ASCII control characters as DOS (CP-437) glyphs for display");
  sessionStorage.setItem("cp437CtrlCodes", usersettingDisplayCtrlCode);
  assert.equal(convertCP1252String("THE quick Brown f0x j!%$."), "THE quick Brown f0x j!%$.", "ASCII characters are universal so should never be converted between different code pages");
  assert.equal(convertCP1252String("░▒▓┌┬┐"), "░▒▓┌┬┐", "Converting characters unique to CP-437 should return them unmodified");
  assert.equal(convertCP1252String("☺☕♫"), "☺☕♫", "Other unicode characters should remain untouched");
  assert.equal(convertCP1252String(""), "", "An empty string should return a blank string");
  assert.equal(convertCP1252String(), "", "A null string should return a blank string");
});

/*
 * options.js
 */
QUnit.module("options.js");

QUnit.test("getColorsRGB", function(assert) {
  assert.equal(getColorsRGB("c64fg-c64bg"), "background-color: rgb(53,40,121); color: rgb(108,94,181);", "Should return a CSS foreground and background color rule set using rgb values");
  assert.equal(getColorsRGB("black-white"), "background-color: rgb(255,255,255); color: rgb(0,0,0);", "Should return a CSS foreground and background color rule set using rgb values");
  assert.equal(getColorsRGB("red-white"), "background-color: rgb(255,255,255); color: undefined;", "Should retrun an undefined value for the `red` color parameter");
  assert.equal(getColorsRGB(), "background-color: undefined; color: undefined;", "Should return undefined values in a CSS rule set");
  assert.equal(getColorsRGB(""), "background-color: undefined; color: undefined;", "Should return undefined values in a CSS rule set");
});

QUnit.test("getBrowserEngine", function(assert) {
  const browsergetBrowserEngine = getBrowserEngine();
  if (engine === "blink") assert.equal(browsergetBrowserEngine, "blink", "Should return `blink` if you're using a Chrome or Edge browser");
  else if (engine === "gecko") assert.equal(browsergetBrowserEngine, "gecko", "Should return `gecko` if you're using a Firefox browser");
});

/*
 * text.js
 */
QUnit.module("text.js");

QUnit.test("countColumns", function(assert) {
  const dummyObj = {};
  assert.equal(countColumns("ABCDE"), "40", "The minimum result should always be 40 columns of text");
  assert.equal(countColumns(""), "40", "An empty string should be returned as 40 columns of text");
  assert.equal(countColumns("ABCDE" + String.fromCharCode(13) + "Z÷Y."), "40", "New lines should not effect the column count");
  assert.equal(countColumns("1234567890123456789012345678901234567890"), "40", "40 chacters should return 40 columns");
  assert.equal(countColumns("12345678901234567890123456789012345678901"), "80", "41 characters should be returned as 80 colums");
  assert.equal(countColumns("12345678901234567890123456789012345678901234567890123456789012345678901234567890"), "80", "80 chacters should return 80 columns");
  assert.equal(countColumns("123456789012345678901234567890123456789012345678901234567890123456789012345678901"), "81", "Anything over 80 characters should return the character count as the column value");
  assert.throws(
    function() {
      countColumns(dummyObj);
    },
    "When no `text` parameter is provided the countColumns() should throw an error"
  );
});

QUnit.test("changeHeader", function(assert) {
  const dummyObj = {},
    htmlObj = {};
  htmlObj.style = {};
  htmlObj.style.color = "";
  assert.throws(
    function() {
      changeHeader();
    },
    "When no `colors` or `elm` parameters are provided the changeHeader() should throw an error"
  );
  assert.throws(
    function() {
      changeHeader(dummyObj);
    },
    "When no `colors` parameter is provided the changeHeader() should throw an error"
  );
  assert.throws(
    function() {
      changeHeader("", dummyObj);
    },
    "When an empty `colors` parameter is provided the changeHeader() should throw an error"
  );
  let test = changeHeader("white", htmlObj);
  assert.equal(typeof htmlObj.style.color, "string", "x");
  assert.equal(htmlObj.style.color, "white", "x color name");
});

QUnit.test("returnOriginalText", function(assert) {
  assert.equal(returnOriginalText(), undefined, "Should return no value");
  const test = new newPageElements();
  test.pre0 = {};
  test.pre0.style = {};
  test.pre0.style.display = "block";
  returnOriginalText(test);
  assert.equal(test.pre0.style.display, null, "pre0 display should be set to `null`");
  test.pre1 = {};
  test.pre1.style = {};
  test.pre1.style.display = "";
  test.preCount = 2;
  returnOriginalText(test);
  assert.equal(test.pre0.style.display, "none", "pre0 display should be set to `none`");
  assert.equal(test.pre1.style.display, null, "pre1 display should be set to `null`");
});

QUnit.test("newPageElements", function(assert) {
  const test = new newPageElements();
  assert.equal(test.cssLink, null, "`cssLink` needs to exist");
  assert.equal(test.header, null, "`header` needs to exist");
});

QUnit.test("newTextDefaults", function(assert) {
  const test = new newTextDefaults();
  assert.equal(test.family, "vga9", "family should be `vga9`");
  assert.equal(test.columns, "80", "columns should be `80`");
  assert.equal(test.width, "640px", "width should be `640px`");
});
