// filename: retrotxt.js
//
// These functions are used to apply and remove RetroTxt from browser tabs.

"use strict";

function BuildCharSet(s = ``)
// Converts a string of text to emulate a MS-DOS Code Page using UTF-16 encoded
// characters.
// @s       String of Unicode UTF-16 text
// @verbose Display to the console each character that is handled
{
  const
    charInfo = new ListCharacterSets(),
    c0Controls = charInfo.C0common,
    sets = charInfo.sets;

  let cp437 = 0,
    iso8859 = 0,
    page = 0,
    usascii = 0,
    unsure = 0,
    t = s,
    i = t.length;

  guessCodePage();

  this.guess = sets[page];
  this.setPage = page;
  this.countCP437 = cp437;
  this.countIso8859 = iso8859;
  this.countUnknown = unsure;
  this.countUsAscii = usascii;

  function buildDecimalSet(set = [])
  // Converts an array of characters into an array of Unicode decimal values
  {
    let decimal = 0,
      decimals = set;
    for (let j = 0; j < set.length; j++) {
      decimal = set[j].codePointAt(0);
      if (decimal !== undefined) decimals[j] = decimal;
    }
    decimals = decimals.filter(checkDecimal);
    return decimals.sort();

    function checkDecimal(value) {
      return value !== "";
    }
  }

  /*
    function buildHexSet(set = [])
    // Converts an array of characters into an array of Unicode hex values
    {
      let decimal = 0,
        hexs = set;
      for (let j = 0; j < set.length; j++) {
        decimal = set[j];
        if (decimal !== undefined) hexs[j] = decimal.toString(16);
      }
      return hexs;
    }
  */

  function guessCodePage(limit = 10000)
  // Guess the encoding of the text
  {
    const cp1252Set = new BuildCP1252().characterSet,
      cp1252Decimals = buildDecimalSet(cp1252Set);

    let char = ``,
      cp = 0,
      hex = ``,
      position = 0;

    while (i--) {
      if (i < t.length - limit) break; // scan at most, the last 500 characters
      position = t.length - i;
      char = t[position];
      cp = t.codePointAt(position);
      if (cp !== undefined) hex = cp.toString(16);
      // Unsupported Unicode code point?
      if (cp >= 65535) page = 7;
      // distinctive CP-1252 chars 128,142,158,159,130…140,145…156
      // these also double-up as C1 controls in UTF-8
      else if (cp1252Decimals.includes(cp)) page = 3;
      // hack to deal with characters decimals 993…1248 found in some ANSI art
      else if (cp > 992 && cp < 1249) page = 2;
      // UTF-8 catch-all
      else if (cp > 255) page = 6;
      // count the guesses of other characters
      else {
        // potential block and line characters found in ANSI/ASCII art
        //if (cp >= 176 && cp <= 223 || [254, 249, 250].includes(cp)) cp437++; // broader catch
        if (cp >= 176 && cp <= 181 || cp >= 185 && cp <= 188 || cp >= 190 && cp <= 197 || cp >= 200 && cp <= 206 || cp >= 217 && cp <= 223 || [254, 249, 250].includes(cp)) cp437++; // only catches single and double lines but not single/double combination characters
        // other than common C0 controls like newline if characters 1…31 are found
        // then assume it is a CP-437 document
        else if (cp !== 10 && cp !== 27 && cp > 0 && cp < 32 && c0Controls.includes(cp) === false) cp437++;
        // if the character is between these ranges that was not caught by CP-437 then it's assumed ISO-8859-1 or 15
        else if (cp >= 160 && cp <= 255) iso8859++;
        // anything else below 128 is certainly US-ASCII
        else if (cp <= 127) usascii++;
        // otherwise, not sure
        else unsure++;
      }
      if (page > 0) break; // exit scan after the encoding has been guessed
    }
    //console.log(`guessCodePage() counts: iso8859 ${iso8859} cp437 ${cp437} usascii ${usascii}, total characters ${t.length}`);
    if (iso8859 > 0) page = 4;
    if (cp437 > iso8859) page = 1;
    //if (cp437 > 0 && cp437 > Math.ceil(t.length / 10)) page = 1; // if CP line/block characters account for 10% of the text

    // function displayChr() {
    //   console.log(`#${i} #${position} char ${char} decimal ${cp} (${hex})`);
    // }
  }
}

function FindDOM()
// Page elements
{
  this.body = document.body;
  this.cssLink = document.getElementById("retrotxt-styles");
  this.head = document.querySelector("head");
  this.header = document.querySelector("header");
  this.main = document.querySelector("main");
  this.pre0 = document.getElementsByTagName("pre")[0];
  this.pre1 = document.getElementsByTagName("pre")[1];
  this.preCount = document.getElementsByTagName("pre").length;
}

function buildStyles(dom = new FindDOM())
// Constructs the HTML DOM that will be needed to display RetroTxt's styles
// @dom A HTML DOM Object that will be modified
{
  const theme = new ListRGBThemes();

  // make a <link> to point to the CSS for use with 1-bit colour themes (ASCII, NFO)
  const link0 = buildLinksToCSS(`css/retrotxt.css`, `retrotxt-styles`);
  dom.head.appendChild(link0); // child 0
  // make a <link> to point to the CSS for use with 1-bit colour themes (ASCII, NFO)
  const link1 = buildLinksToCSS(`css/text_colors.css`, `retrotxt-theme`);
  dom.head.appendChild(link1); // child 1

  // load any CSS that are used to mimic colours by the text file
  let txtStr;
  if (typeof dom.pre1 === "undefined") {
    txtStr = dom.pre0.innerHTML;
  } else {
    txtStr = dom.pre1.innerHTML;
  }
  const txtStrTrim = txtStr.trim(),
    txtType = findControlSequences(txtStrTrim.slice(0, 4));
  // make <link> tags to point to CSS files for use with 4-bit colour text
  if (["pcboard", "wildcat"].includes(txtType) === true) {
    const link2 = buildLinksToCSS(`css/text_colors_pcboard.css`, `retrotxt-4bit`);
    dom.head.appendChild(link2); // child 2
  } else if (txtType === "ecma48") {
    const link2 = buildLinksToCSS(`css/text_colors_${theme.colors[theme.color]}.css`, `retrotxt-4bit`);
    dom.head.appendChild(link2); // child 2
    const link3 = buildLinksToCSS(`css/text_colors_8bit.css`, `retrotxt-8bit`);
    dom.head.appendChild(link3); // child 3
    const link4 = buildLinksToCSS(`css/text_ecma_48.css`, `ecma-48`);
    dom.head.appendChild(link4); // child 4
  }
  // disable links
  let i = dom.head.children.length;
  while (i--) {
    dom.head.children[i].disabled = false;
  }
}

function changeColors(colorName = ``, dom = new FindDOM())
// Applies background colour to the body and colour to the <PRE> tag containing
// the text document.
// @colorName   Colour name
// @dom         A HTML DOM Object that will be modified
{
  let color = colorName;

  try {
    dom.body.className = ``;
    dom.main.className = ``;
  } catch (err) {
    // Firefox currently throws a security error when handling file:///
    //return;
  }

  // refresh scan lines and font shadows as they are effected by colour changes
  chrome.storage.local.get(["textBgScanlines", "textFontShadows"], function(result) {
    const tsl = result.textBgScanlines,
      tfs = result.textFontShadows;
    // scan lines on the page body
    if (typeof tsl === "boolean" && tsl === true) changeTextScanlines(true, dom.body);
    // font shadowing applied to text in the page main tag
    if (typeof tfs === "boolean" && tfs === true) changeTextShadow(true, dom.main);
  });
  // apply new colours
  if (color.startsWith("theme-") === false) color = `theme-${color}`;
  dom.body.classList.add(`${color}-bg`);
  dom.main.classList.add(`${color}-fg`);
}

function changeFont(ff = ``, dom = new FindDOM())
// Applies the font family to the <PRE> tag containing the text document.
// @ff  Font family to apply
// @dom A HTML DOM Object that will be modified
{
  if (typeof dom.style !== "object" && typeof dom.style.fontFamily !== "string") throw `'dom' is a required object that needs a HTML DOM`;
  // Ignore changeFont request if sessionStorage fontOverride is true
  const fO = sessionStorage.getItem('fontOverride', 'true');
  if (typeof fO === "string" && fO === "true") {
    return;
  }
  // Change the font
  let element = dom;
  const classAsArray = element.className.split(" "),
    font = new BuildFontStyles(ff);
  console.info(`Using font ${font.string}`);
  // loop through and remove any font-* classes
  let i = classAsArray.length;
  while (i--) {
    if (classAsArray[i].startsWith("font-")) element.classList.remove(classAsArray[i]);
  }
  // inject replacement font
  element.classList.add(`font-${ff}`);
  // Update the header with new font information
  let headerItem = window.document.getElementById("h-doc-font-family");
  headerItem.innerHTML = ff.toUpperCase();
}

function changeLineHeight(lh = `normal`, dom = new FindDOM())
// Applies line height modifications to the <PRE> tag containing the text document.
// @lh  Number that will be multiplied with the font size to set the line height
// @dom A HTML DOM Object that will be modified
{
  if (typeof dom.pre0.style.lineHeight !== "string") throw `'dom' is a required object that needs a HTML DOM`;
  dom.pre0.style.lineHeight = lh;
}

function changeOffTheme(dom = new FindDOM())
// Display the original, unmodified text document
{
  const ignoredSchemes = ["chrome-extension", "moz-extension"],
    urlScheme = window.location.protocol.split(":")[0];
  // Skip URL schemes that match `ignoredSchemes`
  let i = 0,
    removeCSSChildren = true;
  for (; i < ignoredSchemes.length; i++) {
    if (urlScheme.includes(ignoredSchemes[i])) removeCSSChildren = false;
  }
  // delete links to CSS files
  if (removeCSSChildren !== false) {
    while (dom.head.hasChildNodes()) {
      dom.head.removeChild(dom.head.firstChild);
    }
  }
  // delete classes
  changeTextScanlines(false, dom.body);
  // delete page style customisations
  dom.body.removeAttribute("style");
  if (dom.preCount >= 2) {
    if (dom.header !== null) dom.header.style.display = `none`;
    dom.pre0.style.display = `none`;
    dom.pre1.style.display = null;
  } else if (typeof dom.pre0 !== "undefined") {
    dom.pre0.style.display = null;
  }
}

function changeOnTheme(dom = new FindDOM())
// Display the text document processed by RetroTxt
// @dom A HTML DOM Object that will be modified
{
  if (typeof dom.pre0.style.display !== "string") throw `'dom' is a required object that needs a HTML DOM`;
  chrome.storage.local.get("textFontInformation", function(result) {
    const r = result.textFontInformation;
    if (typeof r === "boolean" && r === false) dom.header.style.display = `none`;
    else dom.header.style.display = `block`;
  });
  dom.pre0.style.display = `block`;
  dom.pre1.style.display = `none`;
}

function findPageColumns(text = ``)
// Calculate the number of columns in use by the innerHTML text
// Regular expression sourced from
// http://stackoverflow.com/questions/8802145/replace-html-entities-with-regular-expression
// @text A required string of text
{
  if (typeof text !== "string" || text.length === 0) throw `'text' is a needed string that should be a sample of text used to determine the number of columns`;
  let cols, len = 0;
  const patt = /&(?:[a-z\d]+|#\d+|#x[a-f\d]+);/img; // find HTML entities
  cols = new ListDefaults().columns; // default 80 columns
  const splitTxt = text.split(/\r\n|\r|\n/); // split original text into lines
  for (let i in splitTxt) {
    let cleanedText = splitTxt[i].replace(patt, " ").trim(); // replace HTML entities with spaces
    if (len < cleanedText.length) len = cleanedText.length;
  }
  //console.log("Columns actual count: " + len);
  if (len <= 40) cols = 40;
  else if (len <= cols); // do nothing & keep cols as default
  else cols = len;
  return cols;
}

function runRetroTxt(tabId = 0, pageEncoding = `unknown`)
// Execute RetroTxt
// This is the main purpose of retrotxt.js, functions outside of here are mostly
// there to allow unit testing.
{
  let dom = new FindDOM();
  // context menu onclick listener
  chrome.runtime.onMessage.addListener(handleMessages);
  // monitor for any changed Options set by the user
  chrome.storage.onChanged.addListener(handleChanges);

  /* Switch between the original and our stylised copy of the text document */
  // Display original text document
  if (dom.cssLink !== null) {
    changeOffTheme(dom);
    // tell a listener in eventpage.js that this tab's body has been modified
    chrome.runtime.sendMessage({
      retroTxtified: false
    });
  }
  // Display RetroTxtified text
  else {
    // get and apply saved Options
    chrome.storage.local.get(["retroColor", "retroFont", "lineHeight", "textFontShadows", "textBgScanlines", "textCenterAlignment"], function(result) {
      let dom = new FindDOM();
      // colour choices
      let r = result.retroColor;
      if (typeof r === "string") changeColors(r, dom);
      // font selection
      r = result.retroFont;
      if (typeof r === "string") changeFont(r, dom.pre0);
      // line height choice
      r = result.lineHeight;
      if (typeof r === "string") changeLineHeight(r, dom);
      // font shadow
      r = result.textFontShadows;
      if (typeof r === "boolean" && r === true) changeTextShadow(r, dom.main);
      // scan lines
      r = result.textBgScanlines;
      if (typeof r === "boolean" && r === true) changeTextScanlines(r, dom.body);
      // centre alignment of text
      r = result.textCenterAlignment;
      if (typeof r === "boolean" && r === true) {
        dom.main.style.margin = `auto`; // vertical & horizontal alignment
      }
    });

    // Stylise text document
    buildStyles(dom);

    // tell a listener in eventpage.js that this tab's body has been modified
    chrome.runtime.sendMessage({
      retroTxtified: true
    });

    // Restore stylised text, hide original unconverted text
    if (dom.preCount >= 2) {
      changeOnTheme(dom);
    }
    // Create a copy of the text document for applying styles.
    else {
      const
        txtDef = new ListDefaults(),
        txtOriginal = dom.pre0.innerHTML,
        txtStrTrim = txtOriginal.trim(),
        textBOM = findUnicode(txtOriginal),
        txtType = findControlSequences(txtStrTrim.slice(0, 4));
      let
        newHeader = document.createElement("header"),
        newMain = document.createElement("main"),
        txtModified = txtOriginal,
        newPre = document.createElement("pre"),
        txtCols, txtFormat, txtLength;
      // Transcode the content of the document so it will display correctly with
      // UTF-16 encoding.
      //
      // the web server page encoding states it is Unicode
      if (["UTF-8", "UTF-16"].includes(pageEncoding) === true) {
        newPre.innerHTML = dom.pre0.innerHTML;
        console.log(`'Content-Type' header sent by the server was ${pageEncoding}, transcoding has been skipped`);
      }
      // the content of the document has been detected as Unicode
      else if (textBOM.length > 0) {
        txtFormat = dom.pre0.innerHTML;
        txtLength = txtFormat.split(/\r\n|\r|\n/).length;
        newPre.innerHTML = txtFormat;
        console.log(`${textBOM} encoding was found, transcoding has been skipped`);
      }
      // otherwise transcode the content into UTF-16
      else {
        // browser storage is asynchronous so fetch the user's saved
        // options and store them as synchronous sessionStorage
        chrome.storage.local.get(["textDosCtrlCodes"], function(result) {
          // display DOS CP-437 characters that normally function as C0 control functions
          const r = result.textDosCtrlCodes;
          if (typeof r === "boolean") {
            localStorage.setItem("textDosCtrlCodes", r);
          }
        });

        // handle any attached SAUCE meta data
        // 'Standard Architecture for Universal Comment Extensions'
        // http://www.acid.org/info/sauce/sauce.htm
        const saucePosition = txtOriginal.length - 128,
          sauceText = txtOriginal.slice(saucePosition, txtOriginal.length),
          sauceId = sauceText.slice(0, 7),
          sauce00 = new FindSauce00(sauceText);
        if (sauceId === "SAUCE00") {
          // search for comments
          let commentId = ``,
            commentPosition = 0,
            commentText = ``,
            i = 5;
          while (i--) {
            commentPosition = saucePosition - (i * 64) - 5;
            commentText = txtOriginal.slice(commentPosition, txtOriginal.length - 128);
            commentId = commentText.slice(0, 5);
            if (commentId === "COMNT") break;
          }
          if (commentId === "COMNT") {
            sauce00.comment = commentText.slice(5); // remove COMNT string
            // remove SAUCE comment from text
            txtModified = txtModified.slice(0, commentPosition);
          }
          // remove other SAUCE meta data from text
          txtModified = txtModified.slice(0, saucePosition);
        }

        // handle character sets and transcoding
        let userTranscode = ``,
          txtLen = txtModified.length,
          buildText = {},
          charSet = ``,
          columnsUsed = 80,
          otherCodesCount = 0,
          unknownCount = 0;
        // guess character set
        userTranscode = sessionStorage.getItem("transcode");
        if (typeof userTranscode !== "string" || userTranscode === "codeAutomatic") {
          const charData = new BuildCharSet(txtModified);
          charSet = charData.guess;
        }
        // user overrides using the `Transcode text` context menu
        else {
          if (userTranscode === "codeMsdos0") charSet = "CP437";
          if (userTranscode === "codeMsdos1") charSet = "CP865";
          if (userTranscode === "codeWindows") charSet = "CP1252";
          if (userTranscode === "codeLatin9") charSet = "ISO885915";
          if (userTranscode === "codeNone") charSet = "USASCII";
        }
        // rebuild text with new character encoding
        switch (charSet) {
          case "CP437":
          case "CP865":
            buildText = new BuildCPDos(txtModified, charSet);
            break;
          case "CP1252":
            buildText = new BuildCP1252(txtModified);
            break;
          case "ISO88591":
            buildText = new BuildCP88591(txtModified);
            break;
          case "ISO885915":
            buildText = new BuildCP885915(txtModified);
            break;
          case "UTF8":
            buildText = new BuildCPUtf8(txtModified);
            break;
          case "USASCII":
          case "UTFERR":
            buildText = new BuildCPUtf16(txtModified);
            break;
        }
        // parse rebuilt text
        txtFormat = buildText.text;
        // count number of lines
        txtLength = txtFormat.split(/\r\n|\r|\n/).length;
        // the converted text should be at least the same size as the original
        if (txtFormat.length < txtLen) {
          try {
            throw `Text did not convert correctly, the new text size of ${txtFormat.length} characters should be the same or larger than the original size of ${txtLen} characters`;
          } catch (e) {
            console.error("runRetroTxt()", e);
          }
        }
        // converts PCBoard and WildCat! BBS colour codes into HTML and CSS
        else if (["pcboard", "wildcat"].includes(txtType) === true) {
          console.info(`%c%c${chrome.i18n.getMessage(txtType)}%c colour codes in use`, `font-weight: bold`, `font-weight: bold; color: red`, `font-weight: bold; color: initial`);
          txtFormat = BuildBBS(txtFormat, txtType, false);
        }
        // converts ECMA-48 aka ANSI escape codes into HTML and CSS
        else if (txtType === "ecma48") {
          console.info(`%c%cECMA-48%c control sequences in use`, `font-weight: bold`, `font-weight: bold; color: green`, `font-weight: bold; color: initial`);
          const parseEcma48 = new BuildEcma48(txtFormat, false, false);
          columnsUsed = parseEcma48.columns;
          txtLength = parseEcma48.rows;
          txtFormat = parseEcma48.textAsHTML;
          otherCodesCount = parseEcma48.otherCodesCount;
          unknownCount = parseEcma48.unknownCount;
          // handle Set/Restore Mode functionality
          const replacementFont = parseEcma48.font;
          sessionStorage.removeItem('fontOverride');
          if (replacementFont !== null) {
            console.log(`Set mode font override to ${replacementFont}`);
            changeFont(replacementFont, newPre); // this needs to run before setting the sessionStorage
            sessionStorage.setItem('fontOverride', 'true');
          }
          const colorDepth = parseEcma48.colorDepth;
          if (colorDepth !== null) {
            if (colorDepth === 1) {
              console.log(`Set mode 1-bit color depth override`);
              document.getElementById("retrotxt-4bit").remove();
              document.getElementById("retrotxt-8bit").remove();
            } else if (colorDepth === 0) {
              console.log(`Set mode grayscale override`);
              let colorLink = document.getElementById("retrotxt-4bit");
              colorLink.href = colorLink.href.replace(/text_colors_vga/, 'text_colors_gray'); // TODO change this regex replace to a condition?
            }
          }
        }
        // plain and ASCII text
        else {}
        // append a blinking cursor to the text
        txtFormat = `${txtFormat}<span class="dos-cursor">_</span>`;
        // inject text into the browser tab
        newPre.innerHTML = txtFormat;

        // statistics for information header
        if (["ecma48", "pcboard", "wildcat"].includes(txtType) === true) {
          txtCols = columnsUsed;
        } else {
          txtCols = findPageColumns(txtModified); // count the number of text columns
          newPre.style.width = txtDef.width; // lock centring alignment to 640px columns
        }
        // create the information header
        newHeader.innerHTML = `<span title="Columns of text">${txtCols}</span> x\
                      <span title="Lines of text">${txtLength}</span> \
                      <span title="Number of characters contained in the text"></span> \
                      <span title="Font family used for display" id="h-doc-font-family" class="capitalize">font?</span>`;
        // append page transcode details to information header
        const dspTranscode = new FindTranscode(charSet);
        newHeader.innerHTML = `${newHeader.innerHTML} <span title="${dspTranscode.title}">${dspTranscode.text}</span>`;
        // append BBS codes notification to header
        if (["pcboard", "wildcat"].includes(txtType) === true) {
          newHeader.innerHTML = `${newHeader.innerHTML} \
          <span id="h-doc-fmt" title="Special bulletin board system, text formatting">- \
          '${chrome.i18n.getMessage(txtType)}' ${chrome.i18n.getMessage("color")} codes in use</span>`;
        }
        // append ECMA-48 control sequence details to the information header
        else if (txtType === "ecma48") {
          newHeader.innerHTML = `${newHeader.innerHTML} <span id="h-doc-fmt" title="ECMA-48/ANSI X3.64 presentation control and cursor functions">- ANSI control sequences in use</span>`;
          if (otherCodesCount > 0) {
            let otherAsText = ``;
            if (otherCodesCount === 1) otherAsText = `1 unsupported function`;
            else if (otherCodesCount > 1 && otherCodesCount < 5) otherAsText = `${otherCodesCount} unsupported functions`;
            else if (otherCodesCount >= 5) otherAsText = `${otherCodesCount} unsupported functions, this display is probably inaccurate`;
            if (otherAsText.length > 0) newHeader.innerHTML = `${newHeader.innerHTML} with <span id="h-doc-fmt">${otherAsText}</span>`;
          }
          if (unknownCount > 0) {
            let errorAsText = `${unknownCount} unknown ECMA-48 sequence`;
            if (unknownCount > 1) errorAsText = `${errorAsText}s`;
            let conjunction = `with`;
            if (otherCodesCount > 0) conjunction = `and`;
            newHeader.innerHTML = `${newHeader.innerHTML} ${conjunction} <span id="h-doc-fmt">${errorAsText}</span>`;
          }
        }
        // append SAUCE00 meta data to the information header
        if (sauce00.version === "00") {
          let sauceStr = ``;
          if (sauce00.title.trim() !== "") sauceStr = `${sauceStr}'${sauce00.title}' `;
          let joiner = `by `;
          if (sauce00.author.trim() !== "") {
            sauceStr = `${sauceStr}by ${sauce00.author} `;
            joiner = `of `;
          }
          if (sauce00.group.trim() !== "") sauceStr = `${sauceStr}${joiner}${sauce00.group} `;
          if (sauce00.date.trim() !== "") {
            let dateAsString = ``;
            const d = new Date(),
              currentYear = d.getFullYear(),
              months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
              sauceDate = sauce00.date.trim(),
              sauceYear = parseInt(sauceDate.slice(0, 4)),
              sauceMonth = parseInt(sauceDate.slice(4, 6)),
              sauceDay = parseInt(sauceDate.slice(6, 8));
            if (sauceYear > 1980 && sauceYear <= currentYear) {
              if (sauceDay > 0 && sauceDay <= 31 && sauceMonth > 0 && sauceMonth <= 12) {
                dateAsString = ` ${months[sauceMonth]} ${sauceDay}`;
              }
              sauceStr = `${sauceStr} from ${sauceYear}${dateAsString}`;
            }
          }
          if (sauceStr.length > 0) newHeader.innerHTML = `${newHeader.innerHTML}<div id="SAUCE00-metadata">${sauceStr}</div>`;
          if (sauce00.comment.trim() !== "") newHeader.innerHTML = `${newHeader.innerHTML}<div id="SAUCE00-comment"><em>${sauce00.comment.trim()}</em></div>`;
        }
        // update header using saved details
        chrome.storage.local.get(["retroFont"], function(result) {
          if (typeof result.retroFont === "undefined" || result.retroFont.length === 0) return;
          let element = window.document.getElementById("h-doc-font-family");
          element.innerHTML = result.retroFont.toUpperCase();
        });

        // hide original unconverted text
        dom.pre0.style.display = `none`;
        // insert new tags into HTML DOM
        newMain.appendChild(newPre);
        dom.body.insertBefore(newHeader, dom.pre0);
        dom.body.insertBefore(newMain, dom.pre0);

        // hide spin loader
        let spinner = window.document.getElementById("spin-loader");
        if (spinner !== null) spinner.setAttribute("style", "display:none");
      }
    }
  }

  function FindSauce00(sauceText = ``)
  // Extracts SAUCE meta data appended to any text document
  // http://www.acid.org/info/sauce/sauce.htm
  {
    this.id = sauceText.slice(0, 7);
    this.version = ``;
    this.title = ``;
    this.author = ``;
    this.group = ``;
    this.date = ``;
    this.fileSize = ``;
    this.dataType = ``;
    this.fileType = ``;
    this.TInfo1 = ``;
    this.TInfo2 = ``;
    this.TInfo3 = ``;
    this.TInfo4 = ``;
    this.comments = ``;
    this.TFlags = ``;
    this.TInfoS = ``;
    this.comment = ``;
    if (this.id === "SAUCE00") {
      this.version = sauceText.slice(5, 7); // 2 bytes
      this.title = sauceText.slice(7, 42).trim(); // 35 bytes
      this.author = sauceText.slice(42, 62).trim(); // 20 bytes
      this.group = sauceText.slice(62, 82).trim(); // 20 bytes
      this.date = sauceText.slice(82, 90).trim(); // 8 bytes
      this.TInfoS = sauceText.slice(106, 128); // 22 bytes
      this.cType = sauceText.slice(90, 106); // 16 bytes
      this.fileSize = sauceText.slice(90, 94);
      this.dataType = sauceText.slice(94, 95);
      this.fileType = sauceText.slice(95, 96);
      this.TInfo1 = sauceText.slice(96, 98);
      this.TInfo2 = sauceText.slice(98, 100);
      this.TInfo3 = sauceText.slice(100, 102);
      this.TInfo4 = sauceText.slice(102, 104);
      this.comments = sauceText.slice(104, 105);
      this.TFlags = sauceText.slice(105, 106);
    }
  }

  function findUnicode(s = ``)
  // Look for any Unicode Byte Order Marks (identifiers) though this is not
  // reliable as the browser can strip them out.
  // Using Byte Order Marks https://msdn.microsoft.com/en-us/library/windows/desktop/dd374101%28v=vs.85%29.aspx?f=255&MSPPError=-2147217396
  {
    // get the first 4 characters of the string and convert them into hexadecimal values
    const mark = s.slice(0, 4),
      chr1 = mark.charCodeAt(0).toString(16).toLowerCase(),
      chr2 = mark.charCodeAt(1).toString(16).toLowerCase(),
      chr3 = mark.charCodeAt(2).toString(16).toLowerCase(),
      chr4 = mark.charCodeAt(3).toString(16).toLowerCase();
    let description = "";
    if (chr1 === "ef" && chr2 === "bb" && chr3 === "bf") description = "UTF-8";
    else if (chr1 === "ff" && chr2 === "fe") description = "UTF-16, little endian";
    else if (chr1 === "fe" && chr2 === "ff") description = "UTF-16, big endian";
    else if (chr1 === "ff" && chr2 === "fe" && chr3 === "00" && chr4 === "00") description = "UTF-32, little endian";
    else if (chr1 === "00" && chr2 === "00" && chr3 === "fe" && chr4 === "ff") description = "UTF-32, little endian";
    return description;
  }

  function handleChanges(changes)
  // Handles all changes made to storage the chrome.storage
  {
    let dom = new FindDOM();
    // font
    if (changes.retroFont) {
      changeFont(changes.retroFont.newValue, dom.pre0);
      chrome.storage.local.get("lineHeight", function(result) {
        changeLineHeight(result.lineHeight, dom);
      });
    }
    // colours
    else if (changes.retroColor) {
      const changedC = changes.retroColor.newValue;
      changeColors(changedC, dom);
      // update font shadow and scan lines
      chrome.storage.local.get(["textFontShadows", "textBgScanlines"], function(r) {
        const body = document.body,
          main = document.getElementsByTagName("main")[0];
        if (typeof r === "boolean" && r === true && typeof pre === "object") {
          // need to update font shadow colour
          changeTextShadow(true, main, changedC);
        }
        if (typeof r === "boolean" && r === true && typeof body === "object") {
          // need to update scan lines if background colour changes
          changeTextScanlines(true, body, changedC);
        }
      });
    }
    // line height
    else if (changes.lineHeight) {
      changeLineHeight(changes.lineHeight.newValue, dom);
    }
    // information text
    else if (changes.textFontInformation) {
      const h = document.getElementsByTagName("header")[0];
      if (typeof h === "object") {
        if (!changes.textFontInformation.newValue) h.style.display = `none`;
        else h.style.display = `block`;
      }
    }
    // centre, vertical & horizontal alignment
    else if (changes.textCenterAlignment) {
      if (typeof dom.main === "object" && changes.textCenterAlignment.newValue) {
        dom.main.style.margin = `auto`;
      } else {
        dom.main.style.margin = `initial`;
      }
    }
    // shadows
    else if (changes.textFontShadows) {
      const main = document.getElementsByTagName("main")[0];
      if (typeof main === "object") {
        changeTextShadow(changes.textFontShadows.newValue, main);
      }
    }
    // scan lines
    else if (changes.textBgScanlines) {
      const body = document.getElementsByTagName("body")[0];
      if (typeof body === "object") {
        changeTextScanlines(changes.textBgScanlines.newValue, body);
      }
    }
  }

  function handleMessages(message) {
    if (message.id === "transcode") {
      sessionStorage.setItem("transcode", message.action);
      // reload the active tab
      window.location.reload();
    }
  }
}
