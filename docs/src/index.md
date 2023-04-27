---
date: 2022-08-30
---
# Install and usage

This page instructs how to use and build the source code for Chrome.

RetroTxt employs an [open-sourced license]((https://choosealicense.com/licenses/lgpl-3.0/)) with the code available on [GitHub](https://github.com/bengarrett/RetroTxt).

You'll require the following command line tools to download and initialize the repository.

- [git](https://git-scm.com)
- [Node.js](https://nodejs.org/engit)
- [pnpm](https://pnpm.io)
- [Task](https://taskfile.dev)

!!! note ""
    [Visual Studio Code](https://code.visualstudio.com) is used to create RetroTxt, and so it has some `.vscode` conveniences included in the package, such as workspace settings and extension recommendations.

## Clone the repo

Run the following [Git](https://git-scm.com) or [gh](https://cli.github.com) command in a terminal.

```bash
git clone https://github.com/bengarrett/RetroTxt.git
```

## Install the dependencies

```bash
cd RetroTxt
pnpm install
task depends
```

## (optional) Edit the manifest file

The `ext/manifest.json` file contains the configuration and metadata for RetroTxt.

```json
  "host_permissions": [
    "*://*.retrotxt.com/*",
    "https://*/",
    "http://*/",
    "file://*/"
  ],
```

## Run the source code

I suggest that you create a [new user profile](https://support.google.com/chrome/answer/2364824?co=GENIE.Platform%3DDesktop&hl=en) and edit the Extension.

Open a new tab with the address of the Extensions feature.

tip, `chrome://extensions/` will work in other browsers such as Edge.

``` title="Extensions Details address"
chrome://extensions
```

1.  In the Extensions tab, toggle **Developer mode**
2.  Click the **Load unpacked** button
3.  Navigate to the local directory containing the RetroTxt source code and select OK

![Chrome extensions developer mode](../assets/source_code-chrome.png)

RetroTxt should load. The Options link behind the **Details** button allows you to configure RetroTxt styling and behavior.
