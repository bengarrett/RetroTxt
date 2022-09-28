---
title: Source code installation & use
authors:
    - Ben Garrett
date: 2022-08-30
---
# Install and usage

RetroTxt employs an [open-sourced GNU LGPLv3 license](https://choosealicense.com/licenses/lgpl-3.0/) with the code available on [GitHub](https://github.com/bengarrett/RetroTxt).

This page instructs how to use the source in Chrome-based and Firefox web browsers.

[Visual Studio Code](https://code.visualstudio.com) is used to create RetroTxt, and so it has some `.vscode` conveniences included in the package, such as workspace settings and extension recommendations.

There are also [Node.js](https://nodejs.org) with [pnpm](https://pnpm.io) packages for the programming and build tools.

The source code gets lint with [ESLint](https://eslint.org/) and stylized using [Prettier](https://prettier.io/) opinionated formatting.

## Clone the repo

Run the following [Git](https://git-scm.com) or [gh](https://cli.github.com) command in a terminal.

=== "git"

    ```bash
    git clone https://github.com/bengarrett/RetroTxt.git
    ```

=== "gh"

     ```bash
     gh repo clone bengarrett/RetroTxt
     ```

## Install the packages

=== "pnpm"

    Use the [pnpm package manager](https://pnpm.io/installation).

    ```bash title="Install packages"
    cd RetroTxt
    pnpm install
    ```

## Use package dependencies

=== "task"

    Use [Task](https://taskfile.dev/), the task runner/build tool.

    ```bash title="Update packages"
    cd RetroTxt
    pnpm update
    task depends
    ```

## Run the source code

=== "Chrome"

    ### Use on Chrome, Edge, Brave, and Vivaldi

    I suggest that you create a [new user profile](https://support.google.com/chrome/answer/2364824?co=GENIE.Platform%3DDesktop&hl=en) and edit the Extension.

    === "Chrome"

        Open a new tab with the address of the Extensions feature.

        ``` title="Extensions Details address"
        chrome://extensions
        ```

        1.  In the Extensions tab, toggle **Developer mode**
        2.  Click the **Load unpacked** button
        3.  Navigate to the local directory containing the RetroTxt source code and select OK

        ![Chrome extensions developer mode](../assets/source_code-chrome.png)

    === "Edge"

        Open a new tab with in the address of the Extensions feature.

        ``` title="Extensions Details address"
        edge://extensions
        ```

        1.  In the Extensions tab, toggle **Developer mode**
        2.  Click the **Load unpacked** button
        3.  Navigate to the local directory containing the RetroTxt source code and select OK

        ![Edge extensions developer mode](../assets/source_code-edge.png)

    === "Brave"

        Open a new tab with in the address of the Extensions feature.

        ``` title="Extensions Details address"
        brave://extensions
        ```

        1.  In the Extensions tab, toggle **Developer mode**
        2.  Click the **Load unpacked** button
        3.  Navigate to the local directory containing the RetroTxt source code and select OK

    === "Vivaldi"
        ``` title="Extension Details address"
        vivaldi://extensions/
        ```

        1.  In the Extensions tab, toggle **Developer mode**
        2.  Click the **Load unpacked** button
        3.  Navigate to the local directory containing the RetroTxt source code and select OK

    RetroTxt should load. The Options link behind the **Details** button allows you to configure RetroTxt styling and behavior.
