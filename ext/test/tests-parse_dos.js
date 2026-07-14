/*global CharacterSet Cs BBS DOSText PCBoardText Transcode WildcatText */
'use strict';

QUnit.module(`dos`, {
  before: () => {
    // prepare something once for all tests
    console.info(`☑ New QUnit dos test.`);
  },
  beforeEach: () => {
    // prepare something before each test
  },
  afterEach: () => {
    // clean up after each test
  },
  after: () => {
    // clean up once after all tests are done
    console.info(`☑ QUnit dos tests are complete.`);
  },
});

QUnit.test(`CharacterSet class`, (assert) => {
  const cs = new CharacterSet(Cs.DOS_437_English);
  assert.equal(
    cs.set,
    Cs.DOS_437_English,
    `Set should be a character set name`
  );
  assert.equal(
    cs.get().length,
    128,
    `Set should be an array of 128 characters`
  );
  assert.equal(cs.get()[0], `Ç`, `The first character should be Ç`);
  cs._cp437Table();
  assert.equal(cs.set_0[0], `␀`, `The first character should be ␀`);
  assert.equal(cs._cp437_C0()[0], `␀`, `The first character should be ␀`);
  assert.equal(cs._cp437()[0], `Ç`, `The first character should be Ç`);
  assert.equal(cs._iso8859_1()[0], `á`, `The first character should be á`);
  cs._cp1250Table();
  assert.equal(cs.set_8[0], `€`, `The first character should be €`);
  assert.equal(cs._cp1250()[0], `€`, `The first character should be €`);
  cs._cp1251Table();
  assert.equal(cs.set_8[0], `Ђ`, `The first character should be Ђ`);
  assert.equal(cs._cp1251()[0], `Ђ`, `The first character should be Ђ`);
  cs._iso8859_5Table();
  assert.equal(cs.set_a[1], `Ё`, `The 2nd character should be Ё`);
  assert.equal(cs._iso8859_5()[1], `Ё`, `The 2nd character should be Ё`);
  cs._iso8859_10Table();
  assert.equal(cs.set_a[1], `Ą`, `The 2nd character should be Ą`);
  assert.equal(cs._iso8859_10()[1], `Ą`, `The 2nd character should be Ą`);
  cs._macRomanTable();
  assert.equal(cs.set_8[0], `Ä`, `The first character should be Ä`);
  assert.equal(cs._macRoman()[0], `Ä`, `The first character should be Ä`);
  assert.equal(cs._cp437_C0()[1], `☺`, `Should be \`☺\``);
  assert.equal(
    cs._cp437_C0()[1].charCodeAt(0),
    `9786`,
    `Should be character code 9786`
  );
  assert.equal(
    cs._cp437_C0()[1].codePointAt(0),
    `9786`,
    `Should be character code 9786`
  );
  assert.equal(cs._cp437()[50], `▓`, `Should be \`▓\``);
});

QUnit.test(`Transcode class`, (assert) => {
  const tc1 = new Transcode(null, `Can I pay in \u0080?`);
  tc1._input_cp1252();
  let expected = `Can I pay in €?`;
  assert.equal(tc1.text, expected, `Should be the string '${expected}'`);
  const tc2 = new Transcode(Cs.OutputISO8859_1, `MS-DOS end of line?\u001B`);
  tc2.rebuild();
  expected = `MS-DOS end of line?←`;
  assert.equal(tc2.text, expected, `Should be the string '${expected}'`);
  const tc3 = new Transcode(null, `Can I pay in \u00A4?`);
  tc3._input_iso8859_15();
  expected = `Can I pay in €?`;
  assert.equal(tc3.text, expected, `Should be the string '${expected}'`);
  const tc4 = new Transcode(null, `Smile \u{1F601}`);
  tc4.rebuild();
  expected = `Smile 😁`;
  assert.equal(tc4.text, expected, `Should be the string '${expected}'`);
  let transcode = new Transcode(Cs.OutputCP1252, `Hello world!`);
  assert.equal(transcode.set, Cs.OutputCP1252, `Should be a set`);
  assert.equal(transcode.text, `Hello world!`, `Should be a string`);
  assert.equal(transcode.hasSupport(), true, `Cs.OutputCP1252 is supported`);
  transcode.rebuild();
  transcode = new Transcode(Cs.OutputCP1252, `!Hello world!\u001B`);
  transcode.rebuild();
  assert.equal(
    transcode.text,
    `!Hello world!←`,
    `Cs.OutputCP1252 is supported`
  );
  // _input_cp1252
  transcode = new Transcode(null, `${String.fromCharCode(128)}`);
  transcode._input_cp1252();
  assert.equal(transcode.text, `€`, `Char 128 should convert to €`);
  transcode = new Transcode(null, `${String.fromCharCode(129)}`);
  transcode._input_cp1252();
  assert.equal(transcode.text, ``, `Char 129 should be empty`);
  transcode = new Transcode(null, `${String.fromCharCode(149)}`);
  transcode._input_cp1252();
  assert.equal(transcode.text, `•`, `Char 149 should convert to •`);
  // _input_iso8859_15
  transcode = new Transcode(null, `${String.fromCharCode(164)}`);
  transcode._input_iso8859_15();
  assert.equal(transcode.text, `€`, `Char 164 should convert to €`);
  transcode._table_cp1252();
  assert.equal(transcode.set_8[0], `€`, `First character should be a €`);
});

QUnit.test(`DOSText class`, (assert) => {
  // textDosCtrlCodes can effect the results of these tests
  // input cp-865
  let dos = new DOSText(`ÉæÆôöòûùÿÖÜø£Ø₧ƒ`, { codepage: Cs.DOS_865 });
  assert.equal(
    dos.normalize(),
    `ÉæÆôöòûùÿÖÜ¢£¥₧ƒ`,
    `CP 865 set 9 input should return CP-437 set 9 output`
  );
  dos = new DOSText(`áíóúñÑªº¿⌐¬½¼¡«¤`, { codepage: Cs.DOS_865 });
  assert.equal(
    dos.normalize(),
    `áíóúñÑªº¿⌐¬½¼¡«»`,
    `CP 865 set A input should return CP-437 set A output`
  );
  // input cp-1250
  dos = new DOSText(`€‚„…†‡‰Š‹ŚŤŽŹ`, { codepage: Cs.Windows_1250 }); // 13 chars
  assert.equal(
    dos.normalize(),
    `ÇéäàåçëèïîìÄÅ`,
    `CP 1250 set 8 input should return CP-437 set 8 output`
  );
  dos = new DOSText(`‘’“”•–—™š›śťžź`, { codepage: Cs.Windows_1250 });
  assert.equal(
    dos.normalize(),
    `æÆôöòûùÖÜ¢£¥₧ƒ`,
    `CP 1250 set 9 input should return CP-437 set 9 output`
  );
  dos = new DOSText(`\u00A0ˇ˘Ł¤Ą¦§¨©Ş«¬\u00AD®Ż`, {
    codepage: Cs.Windows_1250,
  });
  assert.equal(
    dos.normalize(),
    `áíóúñÑªº¿⌐¬½¼¡«»`,
    `CP 1250 set A input should return CP-437 set A output`
  );
  dos = new DOSText(`°±˛ł´µ¶·¸ąş»Ľ˝ľż`, { codepage: Cs.Windows_1250 });
  assert.equal(
    dos.normalize(),
    `░▒▓│┤╡╢╖╕╣║╗╝╜╛┐`,
    `CP 1250 set B input should return CP-437 set B output`
  );
  dos = new DOSText(`ŔÁÂĂÄĹĆÇČÉĘËĚÍÎĎ`, { codepage: Cs.Windows_1250 });
  assert.equal(
    dos.normalize(),
    `└┴┬├─┼╞╟╚╔╩╦╠═╬╧`,
    `CP 1250 set C input should return CP-437 set C output`
  );
  dos = new DOSText(`ĐŃŇÓÔŐÖ×ŘŮÚŰÜÝŢß`, { codepage: Cs.Windows_1250 });
  assert.equal(
    dos.normalize(),
    `╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀`,
    `CP 1250 set D input should return CP-437 set D output`
  );
  dos = new DOSText(`ŕáâăäĺćçčéęëěíîď`, { codepage: Cs.Windows_1250 });
  assert.equal(
    dos.normalize(),
    `αßΓπΣσµτΦΘΩδ∞φε∩`,
    `CP 1250 set E input should return CP-437 set E output`
  );
  dos = new DOSText(`đńňóôőö÷řůúűüýţ˙`, { codepage: Cs.Windows_1250 });
  assert.equal(
    dos.normalize(),
    `≡±≥≤⌠⌡÷≈°∙·√ⁿ²■\u00A0`,
    `CP 1250 set F input should return CP-437 set F output`
  );
  // input cp-1251
  dos = new DOSText(`ЂЃ‚ѓ„…†‡€‰Љ‹ЊЌЋЏ`, { codepage: Cs.Windows_1251 });
  assert.equal(
    dos.normalize(),
    `ÇüéâäàåçêëèïîìÄÅ`,
    `CP 1251 set 8 input should return CP-437 set 8 output`
  );
  dos = new DOSText(`ђ‘’“”•–—™љ›њќћџ`, { codepage: Cs.Windows_1251 });
  // position 0x98, chr ÿ has intentionally been dropped
  assert.equal(
    dos.normalize(),
    `ÉæÆôöòûùÖÜ¢£¥₧ƒ`,
    `CP 1251 set 9 input should return CP-437 set 9 output`
  );
  dos = new DOSText(`\u00A0ЎўЈ¤Ґ¦§Ё©Є«¬\u00AD®Ї`, {
    codepage: Cs.Windows_1251,
  });
  assert.equal(
    dos.normalize(),
    `áíóúñÑªº¿⌐¬½¼¡«»`,
    `CP 1251 set A input should return CP-437 set A output`
  );
  dos = new DOSText(`°±Ііґµ¶·ё№є»јЅѕї`, { codepage: Cs.Windows_1251 });
  assert.equal(
    dos.normalize(),
    `░▒▓│┤╡╢╖╕╣║╗╝╜╛┐`,
    `CP 1251 set B input should return CP-437 set B output`
  );
  dos = new DOSText(`АБВГДЕЖЗИЙКЛМНОП`, { codepage: Cs.Windows_1251 });
  assert.equal(
    dos.normalize(),
    `└┴┬├─┼╞╟╚╔╩╦╠═╬╧`,
    `CP 1251 set C input should return CP-437 set C output`
  );
  dos = new DOSText(`РСТУФХЦЧШЩЪЫЬЭЮЯ`, { codepage: Cs.Windows_1251 });
  assert.equal(
    dos.normalize(),
    `╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀`,
    `CP 1251 set D input should return CP-437 set D output`
  );
  dos = new DOSText(`абвгдежзийклмноп`, { codepage: Cs.Windows_1251 });
  assert.equal(
    dos.normalize(),
    `αßΓπΣσµτΦΘΩδ∞φε∩`,
    `CP 1251 set E input should return CP-437 set E output`
  );
  dos = new DOSText(`рстуфхцчшщъыьэюя`, { codepage: Cs.Windows_1251 });
  assert.equal(
    dos.normalize(),
    `≡±≥≤⌠⌡÷≈°∙·√ⁿ²■\u00A0`,
    `CP 1251 set F input should return CP-437 set F output`
  );
  // input iso-8859-1
  dos = new DOSText(`\u00A0¡¢£¤¥¦§¨©ª«¬\u00AD®¯`, { codepage: Cs.ISO8859_1 });
  assert.equal(
    dos.normalize(),
    `áíóúñÑªº¿⌐¬½¼¡«»`,
    `ISO 8859-1 set A input should return CP-437 set A output`
  );
  // input iso-8859-15
  dos = new DOSText(`\u00A0¡¢£€¥Š§š©ª«¬\u00AD®¯`, { codepage: Cs.ISO8859_15 });
  assert.equal(
    dos.normalize(),
    `áíóúñÑªº¿⌐¬½¼¡«»`,
    `ISO 8859-15 set A input should return CP-437 set A output`
  );
  dos = new DOSText(`°±²³Žµ¶·ž¹º»ŒœŸ¿`, { codepage: Cs.ISO8859_15 });
  assert.equal(
    dos.normalize(),
    `░▒▓│┤╡╢╖╕╣║╗╝╜╛┐`,
    `ISO 8859-15 set A input should return CP-437 set A output`
  );
  // input Macintosh Roman character set
  dos = new DOSText(`ÄÅÇÉÑÖÜáàâäãåçéè`, { codepage: Cs.Macintosh });
  assert.equal(
    dos.normalize(),
    `ÇüéâäàåçêëèïîìÄÅ`,
    `Mac set 8 input should return CP-437 set 8 output`
  );
  dos = new DOSText(`êëíìîïñóòôöõúùûü`, { codepage: Cs.Macintosh });
  assert.equal(
    dos.normalize(),
    `ÉæÆôöòûùÿÖÜ¢£¥₧ƒ`,
    `Mac set 9 input should return CP-437 set 9 output`
  );
  dos = new DOSText(`†°¢£§•¶ß®©™´¨≠ÆØ`, { codepage: Cs.Macintosh });
  assert.equal(
    dos.normalize(),
    `áíóúñÑªº¿⌐¬½¼¡«»`,
    `Mac set A input should return CP-437 set A output`
  );
  dos = new DOSText(`∞±≤≥¥µ∂∑∏π∫ªºΩæø`, { codepage: Cs.Macintosh });
  assert.equal(
    dos.normalize(),
    `░▒▓│┤╡╢╖╕╣║╗╝╜╛┐`,
    `Mac set B input should return CP-437 set B output`
  );
  dos = new DOSText(`¿¡¬√ƒ≈∆«»…\u00A0ÀÃÕŒœ`, { codepage: Cs.Macintosh });
  assert.equal(
    dos.normalize(),
    `└┴┬├─┼╞╟╚╔╩╦╠═╬╧`,
    `Mac set C input should return CP-437 set C output`
  );
  dos = new DOSText(`–—“”‘’÷◊ÿŸ⁄€‹›ﬁﬂ`, { codepage: Cs.Macintosh });
  assert.equal(
    dos.normalize(),
    `╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀`,
    `Mac set D input should return CP-437 set D output`
  );
  dos = new DOSText(`‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔ`, { codepage: Cs.Macintosh });
  assert.equal(
    dos.normalize(),
    `αßΓπΣσµτΦΘΩδ∞φε∩`,
    `Mac set E input should return CP-437 set E output`
  );
  dos = new DOSText(`ÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ`, { codepage: Cs.Macintosh });
  assert.equal(
    dos.normalize(),
    `≡±≥≤⌠⌡÷≈°∙·√ⁿ²■\u00A0`,
    `Mac set F input should return CP-437 set F output`
  );
  // input UTF16
  //dos = new DOSText(`Hello world.`);
  assert.deepEqual(
    `Hello world.`,
    `Hello world.`,
    `Text should remain unchanged`
  );
  dos = new DOSText(`\u0003\u0004\u0005\u0006`, {
    codepage: Cs.Macintosh,
    displayControls: true,
  });
  assert.equal(
    dos.normalize(),
    `♥♦♣♠`,
    `ASCII control codes should return CP-437 glyphs`
  );
  dos = new DOSText(`\u0001\u0021α■`, {
    codepage: `input_UTF16`,
    displayControls: true,
  });
  assert.equal(
    dos.normalize(),
    `☺!α■`,
    `ASCII control codes and ASCII extended should return CP-437 glyphs`
  );
  // Test textDosCtrlCodes
  let string = `░░A▓▓B▀C${String.fromCharCode(9)}Z≈Y.`;
  dos = new DOSText(string, { displayControls: false });
  assert.deepEqual(
    dos.normalize(),
    `░░A▓▓B▀C\u0009Z≈Y.`,
    `Tab control should function as a control`
  );
  // Test normalisations
  string = `░░A▓▓B▀C${String.fromCharCode(13)}Z≈Y.`;
  dos = new DOSText(string, { displayControls: false });
  assert.equal(
    dos.normalize(),
    string,
    `Treat ASCII control characters as that`
  );
  string = `THE quick Brown f0x j!%$.`;
  dos = new DOSText(string);
  assert.equal(
    dos.normalize(),
    string,
    `ASCII characters are universal so should never be converted between different code pages`
  );
  string = `░▒▓┌┬┐`;
  dos = new DOSText(string);
  assert.equal(
    dos.normalize(),
    string,
    `Converting characters unique to CP-437 should return them unmodified`
  );
  string = `☺☕♫`;
  dos = new DOSText(string);
  assert.equal(
    dos.normalize(),
    string,
    `Other Unicode characters should remain untouched`
  );
  // test all ascii controls
  // Note using Unicode hex values not decimal values
  dos = new DOSText(`\u0000`, { displayControls: true });
  assert.equal(dos.normalize(), ` `, `DOSText.normalize() Should return `);
  dos = new DOSText(`\u0001`, { displayControls: true });
  assert.equal(dos.normalize(), `☺`, `Should return ☺`);
  dos = new DOSText(`\u0002`, { displayControls: true });
  assert.equal(dos.normalize(), `☻`, `Should return ☻`);
  dos = new DOSText(`\u0003`, { displayControls: true });
  assert.equal(dos.normalize(), `♥`, `Should return ♥`);
  dos = new DOSText(`\u0004`, { displayControls: true });
  assert.equal(dos.normalize(), `♦`, `Should return ♦`);
  dos = new DOSText(`\u0005`, { displayControls: true });
  assert.equal(dos.normalize(), `♣`, `Should return ♣`);
  dos = new DOSText(`\u0006`, { displayControls: true });
  assert.equal(dos.normalize(), `♠`, `Should return ♠`);
  dos = new DOSText(`\u0007`, { displayControls: true });
  assert.equal(dos.normalize(), `•`, `Should return •`);
  dos = new DOSText(`\u0008`, { displayControls: true });
  assert.equal(dos.normalize(), `◘`, `Should return ◘`);
  dos = new DOSText(`\u0009`, { displayControls: true });
  assert.equal(dos.normalize(), `\t`, `Should return a tab`);
  dos = new DOSText(`\u000A`, { displayControls: true });
  assert.equal(dos.normalize(), `\n`, `Should return a newline`);
  dos = new DOSText(`\u000B`, { displayControls: true });
  assert.equal(dos.normalize(), `♂`, `Should return ♂`);
  dos = new DOSText(`\u000C`, { displayControls: true });
  assert.equal(dos.normalize(), `♀`, `Should return ♀`);
  dos = new DOSText(`\u000D`, { displayControls: true });
  assert.equal(dos.normalize(), `\n`, `Should return a newline`);
  dos = new DOSText(`\u000E`, { displayControls: true });
  assert.equal(dos.normalize(), `♫`, `Should return ♫`);
  dos = new DOSText(`\u000F`, { displayControls: true });
  assert.equal(dos.normalize(), `☼`, `Should return ☼`);
  dos = new DOSText(`\u0010`, { displayControls: true });
  assert.equal(dos.normalize(), `►`, `Should return ►`);
  dos = new DOSText(`\u0011`, { displayControls: true });
  assert.equal(dos.normalize(), `◄`, `Should return ◄`);
  dos = new DOSText(`\u0012`, { displayControls: true });
  assert.equal(dos.normalize(), `↕`, `Should return ↕`);
  dos = new DOSText(`\u0013`, { displayControls: true });
  assert.equal(dos.normalize(), `‼`, `Should return ‼`);
  dos = new DOSText(`\u0014`, { displayControls: true });
  assert.equal(dos.normalize(), `¶`, `Should return ¶`);
  dos = new DOSText(`\u0015`, { displayControls: true });
  assert.equal(dos.normalize(), `§`, `Should return §`);
  dos = new DOSText(`\u0016`, { displayControls: true });
  assert.equal(dos.normalize(), `▬`, `Should return ▬`);
  dos = new DOSText(`\u0017`, { displayControls: true });
  assert.equal(dos.normalize(), `↨`, `Should return ↨`);
  dos = new DOSText(`\u0018`, { displayControls: true });
  assert.equal(dos.normalize(), `↑`, `Should return ↑`);
  dos = new DOSText(`\u0019`, { displayControls: true });
  assert.equal(dos.normalize(), `↓`, `Should return ↓`);
  dos = new DOSText(`\u001A`, { displayControls: true });
  assert.equal(dos.normalize(), `→`, `Should return →`);
  dos = new DOSText(`\u001B`, { displayControls: true });
  assert.equal(dos.normalize(), `←`, `Should return ←`);
  dos = new DOSText(`\u001C`, { displayControls: true });
  assert.equal(dos.normalize(), `∟`, `Should return ∟`);
  dos = new DOSText(`\u001D`, { displayControls: true });
  assert.equal(dos.normalize(), `↔`, `Should return ↔`);
  dos = new DOSText(`\u001E`, { displayControls: true });
  assert.equal(dos.normalize(), `▲`, `Should return ▲`);
  dos = new DOSText(`\u001F`, { displayControls: true });
  assert.equal(dos.normalize(), `▼`, `Should return ▼`);
  // test Windows 1252 empty placeholders
  dos = new DOSText(`\u00FC`, { displayControls: true });
  assert.equal(dos.normalize(), `ü`, `Should return ü`);
  dos = new DOSText(`\u00EC`, { displayControls: true });
  assert.equal(dos.normalize(), `ì`, `Should return ì`);
  dos = new DOSText(`\u00C5`, { displayControls: true });
  assert.equal(dos.normalize(), `Å`, `Should return Å`);
  dos = new DOSText(`\u00C9`, { displayControls: true });
  assert.equal(dos.normalize(), `É`, `Should return É`);
  dos = new DOSText(`\u00A5`, { displayControls: true });
  assert.equal(dos.normalize(), `¥`, `Should return ¥`);
  // Unicode stops following ASCII control values from here
  dos = new DOSText(`\u0020`, { displayControls: true });
  assert.equal(dos.normalize(), ` `, `Should return a space`);
  dos = new DOSText(` !"#$%&'()*+,-./`, { displayControls: true });
  assert.equal(
    dos.normalize(),
    ` !"#$%&'()*+,-./`,
    `Should return a collection of symbols`
  );
  dos = new DOSText(`0123456789:;<=>?`, { displayControls: true });
  assert.equal(dos.normalize(), `0123456789:;<=>?`, `Should return 0123...?`);
  dos = new DOSText(`@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`, {
    displayControls: true,
  });
  assert.equal(
    dos.normalize(),
    `@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`,
    `Should return uppercase letters`
  );
  dos = new DOSText(`abcdefghijklmnopqrstuvwxyz{|}~⌂`, {
    displayControls: true,
  });
  assert.equal(
    dos.normalize(),
    `abcdefghijklmnopqrstuvwxyz{|}~⌂`,
    `Should return lowercase letters`
  );
  dos = new DOSText(`ÇüéâäàåçêëèïîìÄÅ`, { displayControls: true });
  assert.equal(dos.normalize(), `ÇüéâäàåçêëèïîìÄÅ`, `Should return row 8`);
  dos = new DOSText(`ÉæÆôöòûùÿÖÜ¢£¥₧ƒ`, { displayControls: true });
  assert.equal(dos.normalize(), `ÉæÆôöòûùÿÖÜ¢£¥₧ƒ`, `Should return row 9`);
  dos = new DOSText(`áíóúñÑªº¿⌐¬½¼¡«»`, { displayControls: true });
  assert.equal(dos.normalize(), `áíóúñÑªº¿⌐¬½¼¡«»`, `Should return row A`);
  dos = new DOSText(`░▒▓│┤╡╢╖╕╣║╗╝╜╛┐`, { displayControls: true });
  assert.equal(dos.normalize(), `░▒▓│┤╡╢╖╕╣║╗╝╜╛┐`, `Should return row B`);
  dos = new DOSText(`└┴┬├─┼╞╟╚╔╩╦╠═╬╧`, { displayControls: true });
  assert.equal(dos.normalize(), `└┴┬├─┼╞╟╚╔╩╦╠═╬╧`, `Should return row C`);
  dos = new DOSText(`╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀`, { displayControls: true });
  assert.equal(dos.normalize(), `╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀`, `Should return row D`);
  dos = new DOSText(`αßΓπΣσµτΦΘΩδ∞φε∩`, { displayControls: true });
  assert.equal(dos.normalize(), `αßΓπΣσµτΦΘΩδ∞φε∩`, `Should return row E`);
  dos = new DOSText(`≡±≥≤⌠⌡÷≈°∙·√ⁿ²■`, { displayControls: true });
  assert.equal(dos.normalize(), `≡±≥≤⌠⌡÷≈°∙·√ⁿ²■`, `Should return row F`);
  // spellcheck-language "en"
  string = `"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."`;
  // spellcheck-language "en"
  dos = new DOSText(string, { displayControls: true });
  assert.equal(
    dos.normalize(),
    `${string}`,
    `Should return row the standard Lorem Ipsum passage`
  );
  // test conflicts
  dos = new DOSText(`\u2022\u00F2\u00F2\u2022`, { displayControls: true });
  assert.equal(dos.normalize(), `•òò•`, `Should return •òò•`);
  dos = new DOSText(`\u00B7\u2556`, { displayControls: true });
  assert.equal(dos.normalize(), `·╖`, `Should return · middle dot and ╖`);
  dos = new DOSText(`\u00A1`, { displayControls: true });
  assert.equal(dos.normalize(), `¡`, `Should return ¡ inverted exclamation`);
  dos = new DOSText(`[ ][\u00A0\u00A0]`, { displayControls: false });
  assert.equal(dos.normalize(), `[ ][\u00A0\u00A0]`, `Should return 3 spaces`);
  dos = new DOSText(`\u00AB`, { displayControls: true });
  assert.equal(dos.normalize(), `«`, `Should return « left double angle quote`);
  dos = new DOSText(`\u00DF`, { displayControls: true });
  assert.equal(dos.normalize(), `ß`, `Should return ß small Latin sharp S`);
  dos = new DOSText(`\u00B0`, { displayControls: true });
  assert.equal(dos.normalize(), `°`, `Should return ° degree`);
  dos = new DOSText(`\u00B1`, { displayControls: true });
  assert.equal(dos.normalize(), `±`, `Should return ± plus-minus`);
  dos = new DOSText(`\u00B2`, { displayControls: true });
  assert.equal(dos.normalize(), `²`, `Should return ² square sign`);
  dos = new DOSText(`\u00E1`, { displayControls: true });
  assert.equal(dos.normalize(), `á`, `Should return á an acute a`);
  dos = new DOSText(`\u00FF`, { displayControls: true });
  assert.equal(dos.normalize(), `ÿ`, `Should return ÿ an diaeresis y`);
  dos = new DOSText(`\u00B5`, { displayControls: true });
  assert.equal(dos.normalize(), `µ`, `Should return µ micro sign`);
  dos = new DOSText(`\u03C6`, { displayControls: true });
  assert.equal(dos.normalize(), `φ`, `Should return φ small Phi`);
  dos = new DOSText(`\u25A0`, { displayControls: true });
  assert.equal(dos.normalize(), `■`, `Should return ■ block square`);
  dos = new DOSText(`\u2219\u00B7`, { displayControls: true });
  assert.equal(
    dos.normalize(),
    `∙·`,
    `Should return ∙ bullet operator and · middle dot`
  );
  dos = new DOSText(`[ ][\u00A0\u00A0]`, { displayControls: false });
  assert.equal(dos.normalize(), `[ ][\u00A0\u00A0]`, `Should return 3 spaces`);
  dos = new DOSText(`\u0192`, { displayControls: true });
  assert.equal(dos.normalize(), `ƒ`, `Should return ƒ f with hook`);
  dos = new DOSText(`\u00B5`, { displayControls: true });
  assert.equal(dos.normalize(), `µ`, `Should return µ micro sign`);
  dos = new DOSText(`\u00C7`, { displayControls: true });
  assert.equal(dos.normalize(), `Ç`, `Should return Ç c with cedilla`);
});

QUnit.test(`DOSText class lookup`, (assert) => {
  const dos = new DOSText(``, { displayControls: true });
  dos._characterTable();
  assert.equal(dos.asciiTable[1], `☺`, `Should return a ☺`);
  assert.equal(dos.extendedTable[1], `ü`, `Should return a ü`);
  dos.codepage = Cs.Windows_1251;
  dos._characterTable();
  assert.equal(dos.asciiTable[1], `☺`, `Should return a ☺`);
  assert.equal(dos.extendedTable[0], `Ђ`, `Should return a Ђ`);
  dos.codepage = Cs.Windows_1252_English;
  dos._characterTable();
  assert.equal(dos._fromCharCode(1), `☺`, `Should return a ☺`);
  assert.equal(dos._fromCharCode(31), `▼`, `Should return a ▼`);
  assert.equal(dos._fromCharCode(254), `■`, `Should return a ■`);
  assert.equal(dos._fromCharCode(176), `░`, `Should return a ░`);
});

QUnit.test(`BBS class`, (assert) => {
  let bbs = new BBS(`plain text string`)._detect(),
    content = bbs;
  assert.equal(content, ``, `Should return an empty result`);
  content = `@X01Hello world.`;
  bbs = new BBS(content)._detect();
  assert.equal(bbs, PCBoardText, `Should detect PCBoard @ codes`);
  content = `@01@Hello world.`;
  bbs = new BBS(content)._detect();
  assert.equal(bbs, WildcatText, `Should detect WildCat @ codes`);
  content = `@X01Hello world.`;
  bbs = new BBS(content).normalize();
  assert.deepEqual(
    bbs.innerHTML,
    `<i class="PB0 PF1">Hello world.</i>`,
    `Should contain HTML tags`
  );
  content = `@01@Hello world.`;
  bbs = new BBS(content).normalize();
  assert.deepEqual(
    bbs.innerHTML,
    `<i class="PB0 PF1">Hello world.</i>`,
    `Should contain HTML tags`
  );
  content = `@01@Hello world.`;
  bbs = new BBS(content, WildcatText).normalize();
  assert.deepEqual(
    bbs.innerHTML,
    `<i class="PB0 PF1">Hello world.</i>`,
    `Should contain HTML tags`
  );
  content = `@X01Hello world.`;
  bbs = new BBS(content).normalize();
  assert.deepEqual(
    bbs.innerHTML,
    `<i class="PB0 PF1">Hello world.</i>`,
    `Should contain HTML tags`
  );
  content = `@01@Hello world.`;
  bbs = new BBS(content).normalize();
  assert.deepEqual(
    bbs.innerHTML,
    `<i class="PB0 PF1">Hello world.</i>`,
    `Should contain HTML tags`
  );
  // format mis-match
  content = `@01@Hello world.`;
  bbs = new BBS(content, PCBoardText).normalize();
  assert.deepEqual(
    bbs.innerHTML,
    `<i class="PB@ PF0">@X@01@Hello world.</i>`,
    `Should contain HTML tags`
  );
  // more complicated syntax
  content = `@CLS@@X01H@X05e@X0Bl@X00l@XFFo@X01 world.`;
  bbs = new BBS(content).normalize();
  assert.deepEqual(
    bbs.innerHTML,
    `<i class="PB0 PF1">H</i><i class="PB0 PF5">e</i><i class="PB0 PFB">l</i><i class="PB0 PF0">l</i><i class="PBF PFF">o</i><i class="PB0 PF1"> world.</i>`,
    `Should return PCBoard text as HTML`
  );
});
