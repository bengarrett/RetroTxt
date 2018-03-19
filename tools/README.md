# RetroTxt > tools > kit

Kit is a Node.js multi-function terminal program that simplifies the running and building of the RetroTxt source code on multiple operating systems.

Kit has three purposes. To launch a browser running RetroTxt from this source code, to lint the source code for submission to the Mozilla Add-Ons and to package the source code into a zip archive, for Add-Ons and Chrome Store submission.

## Requirements

The program is for GNU/Linux, macOS or Windows. It requires an installation of [Node.js](https://nodejs.org/en/download/) and its [npm package manager](https://www.npmjs.com/get-npm) to install 3rd party dependencies.

It also requires the source code to RetroTxt and expects to be located in the sub-directory `tools`. Kit uses colour output and extended Unicode glyphs. Windows Command Prompt users may wish to use the [DejaVu Sans Mono](https://dejavu-fonts.github.io) to allow the display of these glyphs.

## Run

`npm install`

Will install all the required dependencies required by kit.js and store them locally in `node_modules`. It is a one time command.

`node kit`

Will list all the available _kit_ commands.

## Configurations

Kit will use default locations for browser directories, but the `kit.json` configuration file can override these. You can see the configurations with the `node kit cfg` command.

- `locations` Are the directory locations for the web browsers.
- - `google_chrome` [Google Chrome](https://www.google.com/chrome/)
- - `firefox` [Mozilla Firefox](https://www.mozilla.org)
- - `firefox_developer_edition` [Firefox Developer Edition](https://www.mozilla.org/en-US/firefox/developer/)
- - `firefox_extended_support_release` [Firefox Extended Support Release](https://www.mozilla.org/en-US/firefox/organizations/)
- `profiles` Browser profiles to use.
- - `google_chrome` Google Chrome profile directory name to use i.e. _Default_ or _Profile 1_, etc., when left blank the Default profile is in use.

Chrome does not permit the loading of web-extensions from the terminal so instead you have to create plus save a new user profile with __Developer Mode__ enabled and RetroTxt __Loaded Unpacked__ through the Chrome __Extensions__ tab.

Chrome saves its first profile to the directory _Default_ and any additional profiles as _Profile 1_, _Profile 2_ etc.