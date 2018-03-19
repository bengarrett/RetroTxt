// filename: kit.js

const chalk = require(`chalk`)
const fs = require(`fs-extra`)
const mfs = require(`../manifest.json`)
const os = require(`os`)
const path = require(`path`)
const ini = require(`./${path.basename(__filename, `.js`)}.json`) // my nod to DOS ;)
const pkg = require(`./package.json`)
const args = process.argv

// Firefox
const ff = {
  de: ini.locations.firefox_developer_edition,
  env: ``,
  esr: ini.locations.firefox_extended_support_release,
  std: ini.locations.firefox,
}
// Google Chrome
const gc = {
  std: ini.locations.google_chrome,
  profile: ini.profiles.google_chrome,
}
// Distribution package
const { sep } = require(`path`)
const package = {
  folder: os.homedir(),
  name: `${mfs.short_name.toLowerCase()}-${mfs.version}.zip`, // retrotxt-2.5.14.zip
}

// Use OS environment variables to guess default browser locations
if (!gc.std || !ff.std || !ff.de || !ff.esr) { // match undefined & empty strings
  // Windows program paths
  const x86 = process.env[`ProgramFiles(x86)`] || `C:\\Program Files (x86)`
  const x64 = process.env[`ProgramFiles`] || `C:\\Program Files`

  switch (os.platform()) {
    case `darwin`:
      if (!gc.std) gc.std = `/Applications/Google Chrome.app`
      if (!ff.std) ff.std = `/Applications/Firefox.app`
      if (!ff.de) ff.de = `/Applications/Firefox Developer Edition.app`
      if (!ff.esr) ff.esr = `/Applications/Firefox ESR.app` // custom name as it normally uses Firefox.app
      break
    case `linux`:
      // Chromium & Chrome use different binary names, google-chrome, chromium-browser
      // Officially Google Chrome supports Debian, Ubuntu, Fedora and openSUSE distros
      if (!gc.std) gc.std = `/usr/bin/google-chrome`
      if (!ff.std) ff.std = `/usr/bin/firefox`
      // if (!ff.de) ff.de = ``
      // if (!ff.esr) ff.esr = ``
      break
    case `win32`:
      // Google Chrome
      // expects Windows 10, earlier editions of Windows keep Chrome in different locations
      if (!gc.std) gc.std = `${x86}\\Google\\Chrome\\Application\\chrome.exe`
      // Firefox has both 64-bit and 32-bit editions that can be installed in different locations
      if (!ff.std) {
        ff.std = `${x64}\\Mozilla Firefox\\firefox.exe`
        if (os.arch() === `x64` && fs.existsSync(ff) == false) ff.env = `x64`
        else {
          ff.env = `x86`
          ff.std = `${eval(ff.env)}\\Mozilla Firefox\\firefox.exe`
        }
      }
      if (!ff.de) ff.de = `${eval(ff.env)}\\Mozilla Firefox DE\\firefox.exe`
      if (!ff.esr) ff.esr = `${eval(ff.env)}\\Mozilla Firefox ESR\\firefox.exe`
      break
  }
}

// parse arguments

//args version
// `version` var searches the `args` array for multiple values
// source: https://stackoverflow.com/questions/16312528/check-if-an-array-contains-any-element-of-another-array-in-javascript
const version = args.some(r => [`v`, `version`].includes(r))
if (version === true) {
  console.log(`${chalk.bold(mfs.name)} ${chalk.bold(mfs.version_name)} (${chalk.italic(mfs.version)})\n \u21B3 Toolkit ${pkg.version}`)
  process.exit(0)
}

//args config
const config = args.some(r => [`cfg`, `config`].includes(r))
if (config == true) {
  let fb = ``
  fb += `These configurations can be overridden in ${path.basename(__filename, `.js`)}.json\n\n`
  fb += `Google Chrome\t\t`
  fb += cfgCheck(gc.std)
  fb += `\nMozilla Firefox\t\t`
  fb += cfgCheck(ff.std)
  fb += `\nFirefox Developer Ed.\t`
  fb += cfgCheck(ff.de)
  fb += `\nFirefox ESR\t\t`
  fb += cfgCheck(ff.esr)
  fb += `\n`
  if (ini.profiles.google_chrome) fb += `\n${chalk.dim(`Chrome profile to use:`)} ${ini.profiles.google_chrome}`
  fb += `\n${chalk.gray(`Minimum Chrome version required:`)} ${mfs.minimum_chrome_version}`
  fb += `\n${chalk.gray(`Minimum Firefox versions required:`)} ${mfs.applications.gecko.strict_min_version}`
  fb += `\n\nNew builds will be saved to ${chalk.bold(`${[package.folder]}${sep}${package.name}`)}\n`
  console.log(fb)
  if (os.platform() === `win32`) {
    console.log(`This tool uses Unicode glyphs such as \u2717 cross & \u2713 mark`)
    console.log(`If your terminal does not display these a font switch to DejaVu Sans Mono should fix this`)
    console.log(`https://dejavu-fonts.github.io/`)
  }
  process.exit(0)
}

//args chrome
const chrome = args.some(r => [`c`, `chrome`].includes(r))
if (chrome === true) {
  const prof = ini.profiles.google_chrome
  let fb = `Launching Chrome`, // feedback
    opts = `` // chrome terminal options
  if (prof) {
    fb += ` as profile ${chalk.underline(prof)}`
    opts = `--profile-directory="${prof}"`
  }
  if (fs.existsSync(gc.std) === false) {
    fb += `\n` + cfgCheck(gc.std)
    console.log(fb)
    process.exit(1)
  }
  console.log(fb)
  return launchChrome(gc.std, opts)
}

//args firefox
const firefox = args.some(r => [`ff`, `firefox`, `de`, `firefox-dev`, `esr`, `firefox-esr`].includes(r))
if (firefox === true) {
  let path = ``
  switch (args[2]) {
    case `ff`: case `firefox`: path = ff.std; break
    case `de`: case `firefox-dev`: path = ff.de; break
    case `esr`: case `firefox-esr`: path = ff.esr; break
    default:
      throw `Expected the browser command '${args[2]}' to be a Firefox browser`
  }
  let fb = `Launching Firefox`
  if (os.platform() === `darwin`) path += `/Contents/MacOS/firefox-bin`
  if (fs.existsSync(path) === false) {
    fb += `\n` + cfgCheck(path)
    console.log(fb)
    process.exit(1)
  }
  console.log(fb)
  if (os.platform() === `win32`) return launchRunWin32(path)
  return launchRun(path)
}

//args lint
const lint = args.some(r => [`l`, `lint`].includes(r))
if (lint === true) {
  return launchWebExtLint()
}

//args build
const build = args.some(r => [`b`, `build`].includes(r))
if (build === true) {
  return launchWebExtBuild()
}

//args none or unknown
console.log(`Usage: node ${path.basename(__filename, `.js`)} command\n`)
console.log(`Commands:`)
console.log(`  b\tbuild\t\tPackage ${mfs.name} into a zip file for distribution\n`)
console.log(`  l\tlint\t\tRun a linter over the ${mfs.name} source\n`)
console.log(`  c\tchrome\t\tRun ${mfs.name} extension in Google Chrome`)
console.log(`  ff\tfirefox\t\tRun extension in Mozilla Firefox`)
console.log(`  de\tfirefox-dev\tRun extension in Firefox Developer Edition`)
console.log(`  esr\tfirefox-esr\tRun extension in Firefox Extended Support Release`)
console.log(`\n  cfg\tconfig\t\tDisplay browser configurations`)
console.log(`  v\tversion\t\tShow version information`)
process.exit(0)

function cfgCheck(path = ``) {
  if (path.length === 0) return chalk.red(`No program location given!`)
  if (fs.existsSync(path) === false) return chalk.red(`${path} \u2717`)
  // path exists
  return `${path} ${chalk.green(`\u2713`)}`
}

function launchChrome(bin = ``, profile = ``) {
  const options = {}
  const args = []
  let cmd = ``
  switch (os.platform()) {
    case `darwin`: // macOS requires the use of the `open` command to launch GUI apps
      cmd = `open`
      args.push(`-g`, `-a`, `${bin}`)
      break
    default: // other Unix-like systems
      cmd = `${bin}`
  }
  const { execFile } = require(`child_process`)
  if (profile.length > 0) args.push(`--args`, `${profile}`)
  const chrome = execFile(cmd, args, options)

  chrome.stdout.on(`data`, (data) => {
    console.log(`${data}`)
  })
  chrome.stderr.on(`data`, (data) => {
    console.log(`${chalk.red(cmd)} ${data}`)
  })
  chrome.on(`close`, (code) => {
    if (code > 0) console.log(`${chalk.red(`${cmd} \u2717`)} exited with ${chalk.bold(`code ${code}`)}`)
    else console.log(`\u2713 Chrome is running`)
  })
}

function launchWebExtBuild() {
  let verbose = true
  // create temporary directory
  const tmpDir = os.tmpdir()
  fs.mkdtemp(`${tmpDir}${sep}retrotxt-`, (err, folder) => {
    if (err) throw err
    console.log(`Copying files to be packaged`)
    if (verbose === true) console.log(`Using temporary directory: ${folder}`)
    // determine what to copy
    const root = path.normalize(`${process.cwd()}${sep}..`)
    const ignoreBases = [`.git`, `.vscode`, `docs`, `fonts`, `tools`, `test`]
    const ignoreExts = [`.svg`]
    const ignore = (src) => {
      const relativeDir = `${src.slice(root.length)}`
      const feedback = (bool) => {
        if (verbose === false) return
        if (relativeDir === ``) return
        if (bool === true) return console.log(`${chalk.green(`>`)} ${relativeDir} ${chalk.green(`\u2713`)}`)
        return console.log(`${chalk.dim.red(`-`)} ${chalk.dim(relativeDir)} ${chalk.dim.red(`\u2717`)}`)
      }
      const base = path.basename(src)
      const dir = path.dirname(src)
      const ext = path.extname(src)
      const fontsDir = path.normalize(`${root}${sep}fonts`)
      const woff2Dir = path.normalize(`${fontsDir}${sep}woff2`)
      const materialDir = path.normalize(`${fontsDir}${sep}material`)
      const mIcon = path.normalize(`${materialDir}${sep}iconfont`)
      const mContent = path.normalize(`${materialDir}${sep}content`)
      // special case, skip all fonts except those in the /woff2 and material sub-directories
      if (src === fontsDir) { feedback(true); return true } // these cases are required otherwise all fonts will be skipped
      if (src === woff2Dir) { feedback(true); return true }
      if (dir.startsWith(woff2Dir) === true) { feedback(true); return true }
      if (src === materialDir) { feedback(true); return true }
      if (src === mIcon) { feedback(true); return true }
      if (src === mContent) { feedback(true); return true }
      if (dir.startsWith(woff2Dir) === true) { feedback(true); return true }
      if (dir.startsWith(mIcon) === true) { feedback(true); return true }
      if (dir.startsWith(mContent) === true) { feedback(true); return true }
      // skip bases (includes directories)
      let skip = ``
      for (skip of ignoreBases) {
        const skipDir = path.normalize(`${root}${sep}${skip}`)
        if (base === skip || dir.startsWith(skipDir) === true) { feedback(false); return false }
      }
      // skip files with extensions
      for (skip of ignoreExts) {
        if (ext === skip) { feedback(false); return false }
      }
      // skip Unix-like hidden files
      if (base.startsWith(`.`)) { feedback(false); return false }
      feedback(true)
      return true
    }
    // recursive copy files using fs-extra, files flagged by ignore() are skipped
    const options = { preserveTimestamps: true, filter: ignore }
    fs.copy(`..`, `${folder}`, options, (err) => {
      if (err) throw err
      if (verbose === true) {
        console.log(`\nThe following items will be packaged`)
        let items = ``
        fs.readdirSync(folder).forEach(item => items += `${item} `)
        console.log(`${chalk.magenta(items)}\n`)
      }
    })
    // use web-ext to package the copied files
    const args = [`build`, `--source-dir`, folder, `--artifacts-dir`, package.folder, `--overwrite-dest`]
    if (os.platform() !== `win32`) {
      const { execFile } = require(`child_process`)
      const build = execFile(`web-ext`, args)
      build.stdout.on(`data`, (data) => {
        console.log(`${data}`)
      })
      build.stderr.on(`data`, (data) => {
        console.log(`${chalk.red(`web-ext`)} ${data}`)
      })
      build.on(`close`, (code) => {
        if (code > 0) console.log(`${chalk.red(`web-ext \u2717`)} exited with ${chalk.bold(`code ${code}`)}`)
        else {
          fs.stat(`${package.folder}${sep}${package.name}`, (err, info) => {
            if (err) console.log(`${chalk.green(`\u2713`)} The package is ready`)
            const filesize = require(`file-size`)
            const fsHuman = filesize(info.size).human(`jedec`)
            console.log(`${chalk.green(`\u2713`)} The compressed package at ${fsHuman} is done`)
          })
        }
      })
    } else {
      const args = `build --source-dir ${folder} --artifacts-dir=${package.folder} --overwrite-dest`
      // Windows treats web-ext as a script so we need to use exec
      const exec = require(`child_process`).exec
      exec(`web-ext ${args}`, options, (error, stdout, stderr) => {
        if (error) {
          console.error(`${chalk.red.bold(`Error: web-ext build`)}\n${error}`)
          return
        } if (stdout.length) {
          console.log(stdout)
          console.log(`web-ext \u2713 builder is done`)
        }
        if (stderr.length) {
          console.log(stderr)
          console.log(`${chalk.red(`web-ext \u2717`)} runner`)
        }
      })
    }
  })
}

function launchWebExtLint() {
  const options = {}
  const args = [`lint`, `--source-dir`, `..`, `--artifacts-dir`, `../builds`, `--ignore-files=test/*`, `tools/*`]
  if (os.platform() !== `win32`) {
    const { execFile } = require(`child_process`)
    const lint = execFile(`web-ext`, args, options)

    lint.stdout.on(`data`, (data) => {
      console.log(`${data}`)
    })

    lint.stderr.on(`data`, (data) => {
      console.log(`${chalk.red(`web-ext`)} ${data}`)
    })

    lint.on(`close`, (code) => {
      if (code > 0) console.log(`${chalk.red(`web-ext \u2717`)} exited with ${chalk.bold(`code ${code}`)}`)
      else console.log(`web-ext \u2713 linter is done`)
    })
  } else {
    const exec = require(`child_process`).exec
    const params = args.join(` `)
    exec(`web-ext ${params}`, options, (error, stdout, stderr) => {
      if (error) {
        console.error(`${chalk.red.bold(`Error: web-ext lint`)}\n${error}`)
        return
      }
      if (stdout.length) {
        console.log(stdout)
        console.log(`web-ext \u2713 linter is done`)
      }
      if (stderr.length) {
        console.log(stderr)
        console.log(`${chalk.red(`web-ext \u2717`)} linter`)
      }
    })
  }
}

function launchRunWin32(path = ``) {
  const options = {}
  const args = `run --source-dir .. --firefox="${path}"`
  // Windows treats web-ext as a script so we need to use exec
  const exec = require(`child_process`).exec
  exec(`web-ext ${args}`, options, (error, stdout, stderr) => {
    if (error) {
      console.error(`${chalk.red.bold(`Error: web-ext run`)}\n${error}`)
      return
    } if (stdout.length) {
      console.log(stdout)
      console.log(`web-ext \u2713 runner is done`)
    }
    if (stderr.length) {
      console.log(stderr)
      console.log(`${chalk.red(`web-ext \u2717`)} runner`)
    }
  })
}

function launchRun(path = ``) {
  const options = {}
  const args = [`run`, `--source-dir`, `..`, `--firefox=${path}`]
  // Unix-like OSes let us use execFile which is more efficient
  const { execFile } = require(`child_process`)
  const we = execFile(`web-ext`, args, options)

  we.stdout.on(`data`, (data) => {
    console.log(`${data}`)
  })

  we.stderr.on(`data`, (data) => {
    console.log(`${chalk.red(`err`)} ${data}`)
  })

  we.on(`close`, (code) => {
    if (code > 0) console.log(`${chalk.red(`web-ext \u2717`)} exited with ${chalk.bold(`code ${code}`)}`)
    else console.log(`web-ext \u2713 runner is done`)
  })
}