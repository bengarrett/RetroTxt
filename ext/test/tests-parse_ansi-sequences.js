/*global Controls domObject reset resetCursor resetECMA resetSGR*/
'use strict';

QUnit.module(`ansi sequence`, {
  before: () => {
    // before all tests
    reset(resetCursor);
    reset(resetSGR);
    domObject.html = ``;
  },
  beforeEach: () => {
    // before each test
    reset();
  },
  afterEach: () => {
    // clean up after each test
    reset();
  },
  after: () => {
    // clean up after all tests
    reset(resetCursor);
    reset(resetECMA);
    reset(resetSGR);
    domObject.html = ``;
  },
});

// When needing to work on a single test, uncomment and use this
// const { only } = QUnit
// only(`override`, assert => {
//   const ansi = new Controls()
//   sample = `Hi`
//   ansi.text = sample
//   ansi.parse()
//   assert.equal(
//     ansi.htmlString,
//     `<div id="row-1"><i class="SGR37 SGR40">Hi</i></div>`,
//     `'${sample}' It's okay`
//   )
// })

const textIn = `Hello world.`,
  textOut = `<div id="row-1"><i class="SGR37 SGR40">Hello world.</i></div>`;
let sample = ``;

// ANSI.SYS controls (https://msdn.microsoft.com/en-us/library/cc722862.aspx)

const testC0 = new Map()
  // input, expected result
  // no controls
  .set(`Hello world.`, textOut)
  // C0 control
  .set(
    `Hello\nworld.`,
    `<div id="row-1"><i class="SGR37 SGR40">Hello</i></div><div id="row-2"><i class="SGR37 SGR40">world.</i></div>`
  );

QUnit.test(`ANSI.SYS C0 controls`, (assert) => {
  const ansi = new Controls();
  for (const [sample, result] of testC0.entries()) {
    ansi.text = sample;
    ansi.parse();
    assert.equal(ansi.htmlString, result, `'${sample}' ${result}`);
  }
});

const testCU = new Map()
  .set(`←[H${textIn}`, textOut)
  .set(`←[;H${textIn}`, textOut)
  .set(
    `←[2H${textIn}`,
    `<div id="row-1"><br></div><div id="row-2"><i class="SGR37 SGR40">Hello world.</i></div>`
  )
  .set(
    `←[;18H${textIn}`,
    `<div id="row-1"><i id="column-1-to-17" class="SGR0">${` `.repeat(
      17
    )}</i><i class="SGR37 SGR40">Hello world.</i></div>`
  )
  // CUP (cursor up) [not supported]
  .set(`←[A${textIn}`, textOut)
  .set(`←[5A${textIn}`, textOut)
  .set(`←[60A${textIn}`, textOut)
  .set(`←[555A${textIn}`, textOut)
  .set(`←[1523A${textIn}`, textOut)
  // CUD (cursor down)
  .set(
    `←[B${textIn}`,
    `<div id="row-1"><br></div><div id="row-2"><i class="SGR37 SGR40">Hello world.</i></div>`
  )
  .set(
    `←[3B${textIn}`,
    `<div id="row-1"><br></div><div id="row-2"><br></div><div id="row-3"><br></div><div id="row-4"><i class="SGR37 SGR40">Hello world.</i></div>`
  )
  .set(
    `Hello←[BNew←[Blines`,
    `<div id="row-1"><i class="SGR37 SGR40">Hello</i></div><div id="row-2"><i class="SGR37 SGR40">New</i></div><div id="row-3"><i class="SGR37 SGR40">lines</i></div>`
  )
  // CUF (cursor forward)
  .set(
    `←[C${textIn}`,
    `<div id="row-1"><i id="column-1" class="SGR0"> </i><i class="SGR37 SGR40">Hello world.</i></div>`
  )
  .set(
    `←[1C${textIn}`,
    `<div id="row-1"><i id="column-1" class="SGR0"> </i><i class="SGR37 SGR40">Hello world.</i></div>`
  )
  .set(
    `Hello←[Cworld`,
    `<div id="row-1"><i class="SGR37 SGR40">Hello</i><i id="column-6" class="SGR0"> </i><i class="SGR37 SGR40">world</i></div>`
  )
  .set(
    `←[5C${textIn}`,
    `<div id="row-1"><i id="column-1-to-5" class="SGR0">     </i><i class="SGR37 SGR40">Hello world.</i></div>`
  )
  // CUB (cursor back) [no supported]
  .set(`${textIn}←[5D`, textOut)
  // SCP (save cursor position)
  // RCP (restore cursor position)
  .set(
    `hello←[s\n←[u world`,
    `<div id="row-1"><i class="SGR37 SGR40">hello world</i></div>`
  );

QUnit.test(`ANSI.SYS CU (cursor position)`, (assert) => {
  const ansi = new Controls();
  for (const [sample, result] of testCU.entries()) {
    ansi.text = sample;
    ansi.parse();
    assert.equal(ansi.htmlString, result, `'${sample}' ${result}`);
  }
});

const testHVP = new Map()
  .set(`←[f${textIn}`, textOut)
  .set(
    `←[1;18f${textIn}`,
    `<div id="row-1"><i id="column-1-to-17" class="SGR0">${` `.repeat(
      17
    )}</i><i class="SGR37 SGR40">Hello world.</i></div>`
  )
  .set(
    `←[1;40f${textIn}`,
    `<div id="row-1"><i id="column-1-to-39" class="SGR0">${` `.repeat(
      39
    )}</i><i class="SGR37 SGR40">Hello world.</i></div>`
  )
  // The logic here is for the cursor to go row 1, column 80, that is where H of Hello
  // will print, then the reset of the word will wrap onto the next row
  .set(
    `←[1;80f${textIn}`,
    `<div id="row-1"><i id="column-1-to-79" class="SGR0">${` `.repeat(
      79
    )}</i><i class="SGR37 SGR40">H</i></div><div id="row-2"><i class="SGR37 SGR40">ello world.</i></div>`
  )
  .set(
    `←[1;81f${textIn}`,
    `<div id="row-1"><br></div><div id="row-2"><i class="SGR37 SGR40">Hello world.</i></div>`
  );

QUnit.test(`ANSI.SYS HVP (horizontal vertical position)`, (assert) => {
  const ansi = new Controls();
  for (const [sample, result] of testHVP.entries()) {
    ansi.text = sample;
    ansi.parse();
    assert.equal(ansi.htmlString, result, `'${sample}' ${result}`);
  }
});

const testErase = new Map()
  // ED2 Erase display
  .set(
    `←[2J${textIn}`,
    `<div id="row-1"><i class="SGR37 SGR40">Hello world.</i></div>`
  )
  // EL0 Erase line
  .set(
    `←[K${textIn}`,
    `<div id="row-1"><i id="column-1-to-80" class="SGR0">                                                                                </i></div><div id="row-2"><i class="SGR37 SGR40">Hello world.</i></div>`
  );

QUnit.test(`ANSI.SYS erase controls`, (assert) => {
  const ansi = new Controls();
  for (const [sample, result] of testErase.entries()) {
    ansi.text = sample;
    ansi.parse();
    assert.equal(ansi.htmlString, result, `'${sample}' ${result}`);
  }
});

const testSGM = new Map()
  // All attributes off
  .set(`←[0mHello world.`, textOut)
  .set(
    `←[0mHello\nworld.`,
    `<div id="row-1"><i class="SGR37 SGR40">Hello</i></div><div id="row-2"><i class="SGR37 SGR40">world.</i></div>`
  )
  // 1 Bold
  .set(
    `←[1mHello world.`,
    `<div id="row-1"><i class="SGR137 SGR40">Hello world.</i></div>`
  )
  .set(
    `Hello ←[0;1;31mworld.`,
    `<div id="row-1"><i class="SGR37 SGR40">Hello </i><i class="SGR131 SGR40">world.</i></div>`
  )
  // 4 Underscore
  .set(
    `←[4mHello world.`,
    `<div id="row-1"><i class="SGR37 SGR40 SGR4">Hello world.</i></div>`
  )
  .set(
    `Hello ←[4mworld.`,
    `<div id="row-1"><i class="SGR37 SGR40">Hello </i><i class="SGR37 SGR40 SGR4">world.</i></div>`
  )
  // 5 Blink
  .set(
    `←[5mHello world.`,
    `<div id="row-1"><i class="SGR37 SGR40 SGR5">Hello world.</i></div>`
  )
  // 7 Reverse
  .set(
    `←[7mHello world.`,
    `<div id="row-1"><i class="SGR37 SGR40 SGR7">Hello world.</i></div>`
  )
  // 8 conceal
  .set(
    `←[8mHello world.`,
    `<div id="row-1"><i class="SGR37 SGR40 SGR8">Hello world.</i></div>`
  )
  .set(
    `←[8mHello ←[8mworld.`,
    `<div id="row-1"><i class="SGR37 SGR40 SGR8">Hello </i><i class="SGR37 SGR40 SGR8">world.</i></div>`
  )
  // foreground colours
  .set(
    `←[35mHello world.`,
    `<div id="row-1"><i class="SGR35 SGR40">Hello world.</i></div>`
  )
  .set(
    `Hello ←[31mworld.`,
    `<div id="row-1"><i class="SGR37 SGR40">Hello </i><i class="SGR31 SGR40">world.</i></div>`
  )
  .set(
    `←[0mHello ←[36mworld.`,
    `<div id="row-1"><i class="SGR37 SGR40">Hello </i><i class="SGR36 SGR40">world.</i></div>`
  )
  .set(
    `←[45mHello world.`,
    `<div id="row-1"><i class="SGR37 SGR45">Hello world.</i></div>`
  )
  .set(
    `Hello ←[41mworld.`,
    `<div id="row-1"><i class="SGR37 SGR40">Hello </i><i class="SGR37 SGR41">world.</i></div>`
  )
  // both foreground and background colours
  .set(
    `←[0;31;45m${textIn}←[1A`,
    `<div id="row-1"><i class="SGR31 SGR45">Hello world.</i></div>`
  )
  .set(
    `←[31;45m${textIn}`,
    `<div id="row-1"><i class="SGR31 SGR45">Hello world.</i></div>`
  )
  .set(
    `Hello ←[31;41mworld.`,
    `<div id="row-1"><i class="SGR37 SGR40">Hello </i><i class="SGR31 SGR41">world.</i></div>`
  );

QUnit.test(`ANSI.SYS SGM (set graphics mode)`, (assert) => {
  const ansi = new Controls();
  for (const [sample, result] of testSGM.entries()) {
    ansi.text = sample;
    ansi.parse();
    assert.equal(ansi.htmlString, result, `'${sample}' ${result}`);
  }
});
QUnit.test(`ANSI.SYS SM (set mode)`, (assert) => {
  const ansi = new Controls();
  // SM set mode
  let smReply = `should set to mode '40 x 148 x 25 monochrome (text)'`;
  sample = `←[0h${textIn}`;
  ansi.text = sample;
  ansi.parse();
  assert.equal(ansi.colorDepth, 1, `'${sample}' colorDepth ${smReply}`);
  assert.equal(ansi.font, `ibm_cga`, `'${sample}' font ${smReply}`);
  assert.equal(ansi.lineWrap, undefined, `'${sample}' lineWrap ${smReply}`);
  sample = `←[7h${textIn}`;
  smReply = `should enable line wrapping but it is not implemented`;
  ansi.text = sample;
  ansi.parse();
  assert.equal(ansi.lineWrap, undefined, `'${sample}' ${smReply}`);
  // RM restore mode
  sample = `←[0l${textIn}`;
  smReply = `should restore to mode '40 x 148 x 25 monochrome (text)'`;
  ansi.text = sample;
  ansi.parse();
  assert.equal(ansi.font, `ibm_cga`, `'${sample}' font ${smReply}`);
  assert.equal(ansi.lineWrap, undefined, `'${sample}' lineWrap ${smReply}`);
  sample = `←[7l${textIn}`;
  smReply = `should disable line wrapping but it is not implemented`;
  ansi.text = sample;
  ansi.parse();
  assert.equal(ansi.lineWrap, undefined, `'${sample}' ${smReply}`);
});

const testE48 = new Map()
  // ED Erase in Page
  .set(
    `←[J${textIn}`,
    `<div id="row-1"><i id="column-1-to-80" class="SGR0">                                                                                </i></div><div id="row-2"><i class="SGR37 SGR40">Hello world.</i></div>`
  )
  .set(
    `←[0J${textIn}`,
    `<div id="row-1"><i id="column-1-to-80" class="SGR0">                                                                                </i></div><div id="row-2"><i class="SGR37 SGR40">Hello world.</i></div>`
  )
  .set(
    `←[1J${textIn}`,
    `<div id="row-1"><i class="SGR37 SGR40">Hello world.</i></div>`
  )
  .set(
    `←[2J${textIn}`,
    `<div id="row-1"><i class="SGR37 SGR40">Hello world.</i></div>`
  )
  // [2J erases display
  // NOTE: 16/9/17 - switched RT to ignore \n values when rendering ANSI
  // THIS RANDOMLY FAILS IN THE THE TESTS
  // .set(
  //   `${textIn}\n${textIn}\n${textIn}←[2J`,
  //   `<div id="row-1" class="ED"><i class="SGR37 SGR40">Hello world.</i></div><div id="row-2" class="ED"><i class="SGR37 SGR40">Hello world.</i></div><div id="row-3" class="ED"><i class="SGR37 SGR40">Hello world.</i></div>`
  // )
  // EL Erase in Line
  .set(
    `←[K${textIn}`,
    `<div id="row-1"><i id="column-1-to-80" class="SGR0">                                                                                </i></div><div id="row-2"><i class="SGR37 SGR40">Hello world.</i></div>`
  )
  .set(
    `←[0K${textIn}`,
    `<div id="row-1"><i id="column-1-to-80" class="SGR0">                                                                                </i></div><div id="row-2"><i class="SGR37 SGR40">Hello world.</i></div>`
  )
  // ←[1K is not supported
  .set(
    `←[2K${textIn}`,
    `<div id="row-1" class="ED"><i class="SGR37 SGR40">Hello world.</i></div>`
  );

QUnit.test(`ECMA-48 controls`, (assert) => {
  for (const [sample, result] of testE48.entries()) {
    const ac = new Controls(`${sample}`);
    ac.parse();
    assert.equal(ac.htmlString, result, `'${sample}' ${result}`);
  }
});

const testSGR = new Map()
  // border effects
  .set(
    `←[51mHello ←[54mworld.`,
    `<div id="row-1"><i class="SGR37 SGR40 SGR51">Hello </i><i class="SGR37 SGR40">world.</i></div>`
  )
  .set(
    `←[52mHello ←[54mworld.`,
    `<div id="row-1"><i class="SGR37 SGR40 SGR52">Hello </i><i class="SGR37 SGR40">world.</i></div>`
  )
  .set(
    `←[53mHello ←[55mworld.`,
    `<div id="row-1"><i class="SGR37 SGR40 SGR53">Hello </i><i class="SGR37 SGR40">world.</i></div>`
  )
  // xterm 256 colours
  .set(
    `←[38;5;0m${textIn}`,
    `<div id="row-1"><i class="SGR380 SGR40">Hello world.</i></div>`
  )
  .set(
    `←[38;5;10m${textIn}`,
    `<div id="row-1"><i class="SGR3810 SGR40">Hello world.</i></div>`
  )
  .set(
    `←[38;5;100m${textIn}`,
    `<div id="row-1"><i class="SGR38100 SGR40">Hello world.</i></div>`
  )
  .set(
    `←[38;5;255m${textIn}`,
    `<div id="row-1"><i class="SGR38255 SGR40">Hello world.</i></div>`
  )
  .set(
    `←[48;5;255m${textIn}`,
    `<div id="row-1"><i class="SGR37 SGR48255">Hello world.</i></div>`
  )
  // unknown control functions
  .set(
    `←[6n${textIn}`,
    `<div id="row-1"><i class="SGR37 SGR40">␛[6nHello world.</i></div>`
  );

QUnit.test(`ECMA-48 SGR (select graphic rendition)`, (assert) => {
  const ansi = new Controls(),
    reply = `sequence into HTML.`;
  // SGR Select Graphic Rendition
  // cancelled effects
  sample = `←[1mHello ←[22mworld.`;
  ansi.text = sample;
  ansi.parse();
  let uniqueResult = `<div id="row-1"><i class="SGR137 SGR40">Hello </i><i class="SGR37 SGR40">world.</i></div>`;
  assert.equal(ansi.htmlString, uniqueResult, `'${sample}' ${reply}`);
  for (let sgr = 23; sgr < 29; sgr++) {
    switch (sgr) {
      case 26:
      case 28:
        continue;
    }
    sample = `←[${sgr - 20}mHello ←[${sgr}mworld.`;
    ansi.text = sample;
    ansi.parse();
    uniqueResult = `<div id="row-1"><i class="SGR37 SGR40 SGR${
      sgr - 20
    }">Hello </i><i class="SGR37 SGR40">world.</i></div>`;
    assert.equal(ansi.htmlString, uniqueResult, `'${sample}' ${reply}`);
  }
  // foreground colours
  for (let sgr = 30; sgr < 40; sgr++) {
    if (sgr === 38) continue;
    sample = `←[${sgr}m${textIn}`;
    ansi.text = sample;
    ansi.parse();
    uniqueResult = `<div id="row-1"><i class="SGR${sgr} SGR40">Hello world.</i></div>`;
    assert.equal(ansi.htmlString, uniqueResult, `'${sample}' ${reply}`);
  }
  // background colours
  for (let sgr = 40; sgr < 50; sgr++) {
    if (sgr === 48) continue;
    sample = `←[${sgr}m${textIn}`;
    ansi.text = sample;
    ansi.parse();
    uniqueResult = `<div id="row-1"><i class="SGR37 SGR${sgr}">Hello world.</i></div>`;
    assert.equal(ansi.htmlString, uniqueResult, `'${sample}' ${reply}`);
  }
  reset();
  for (const [sample, result] of testSGR.entries()) {
    ansi.text = sample;
    ansi.parse();
    assert.equal(ansi.htmlString, result, `'${sample}' ${result}`);
  }
});

{
  const output4 = `<div id="row-1"><i class="SGR37 SGR40 SGR12">Hello world.</i></div>`,
    output18 = `<div id="row-1"><i class="SGR37 SGR40 SGR17">Hello world.</i></div>`,
    testE48Alt = new Map()
      // Set Mode =4h
      .set(`←[4h${textIn}`, output4)
      .set(`←[?4h${textIn}`, output4)
      .set(`←[=4h${textIn}`, output4)
      .set(`←[>4h${textIn}`, output4)
      // Set Mode =4h
      .set(`←[18h${textIn}`, output18)
      .set(`←[?18h${textIn}`, output18)
      .set(`←[=18h${textIn}`, output18)
      .set(`←[>18h${textIn}`, output18);

  QUnit.test(
    `ECMA-48 CSI alternatives (control sequence introducer)`,
    (assert) => {
      const ansi = new Controls();
      for (const [sample, result] of testE48Alt.entries()) {
        ansi.text = sample;
        ansi.parse();
        assert.equal(ansi.htmlString, result, `'${sample}' ${result}`);
      }
    }
  );
}

const testiCE = new Map()
  // iCE colors ←[?33h (on) and ←[?33l (off)
  // start with iCE on
  .set(
    `←[?33h←[47;5m←[B${textIn}`,
    `<div id="row-1"><br></div><div id="row-2"><i class="SGR37 SGR47 SGR5">Hello world.</i></div>`
  )
  // start with iCE off
  .set(
    `←[?33l←[47;5m←[B${textIn}`,
    `<div id="row-1"><br></div><div id="row-2"><i class="SGR37 SGR47 SGR5">Hello world.</i></div>`
  )
  .set(
    `←[?33h←[5;47m${textIn}`,
    `<div id="row-1"><i class="SGR37 SGR47 SGR5">Hello world.</i></div>`
  )
  .set(
    `←[?33h←[6;47miCE iCE Baby ←[?33l${textIn}`,
    `<div id="row-1"><i class="SGR37 SGR47 SGR6">iCE iCE Baby Hello world.</i></div>`
  );

QUnit.test(`iCE colors (non-blinking mode)`, (assert) => {
  const ansi = new Controls();
  for (const [sample, result] of testiCE.entries()) {
    ansi.text = sample;
    ansi.parse();
    assert.equal(ansi.htmlString, result, `'${sample}' ${result}`);
  }
});
