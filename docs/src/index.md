# Install and usage

RetroTxt employs an [open sourced, GNU LGPLv3 license](https://choosealicense.com/licenses/lgpl-3.0/) with the code available on [GitHub](https://github.com/bengarrett/RetroTxt). This page instructs on how to use the source in both Chromium based and Firefox web browsers.

[Visual Studio Code](https://code.visualstudio.com) is used to create RetroTxt, and so it has some `.vscode` conveniences included in the package such as workspace settings and extension recommendations.

There are also [Node.js](https://nodejs.org) with [yarn](https://yarnpkg.com/) or npm packages for the programming and build tools.

The source code is linted with [ESLint](https://eslint.org/) and stylised using [Prettier](https://prettier.io/), an opinionated formatter.

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

=== "yarn"

    [Yarn package manager](https://yarnpkg.com).

    ```bash title="Install packages"
    cd RetroTxt
    yarn
    ```

    If the installation of the tools is successful, the `web-ext` command should return a version number.

    ```bash title="Test the tools"
    yarn run web-ext --version
    ```
    ```
    6.6.0 # your version might be newer
    ```

=== "npm"

    Node Package Manager is included in [Node.js](https://nodejs.org).

    ```bash title="Install packages"
    cd RetroTxt
    npm install
    ```

    If the installation of the tools is successful, the `web-ext` command should return a version number.

    ```bash title="Test the tools"
    npx web-ext --version
    ```
    ```
    6.6.0 # your version might be newer
    ```

## Run the source code

=== "Chrome"

    ### Use on Chrome, Edge and Brave

    I suggest that you create a [new user profile](https://support.google.com/chrome/answer/2364824?co=GENIE.Platform%3DDesktop&hl=en) for use and to edit the Extension.

    === "Chrome"

        Open a new tab with in the address of the Extensions feature.

        ``` title="Extensions address"
        chrome://extensions
        ```

        1.  In the Extensions tab, toggle **Developer mode**
        1.  Click the **Load unpacked** button
        1.  Navigate to the local directory containing the RetroTxt source code and select OK

        ![Chrome extensions developer mode](../assets/source_code-chrome.png)

    === "Edge"

        Open a new tab with in the address of the Extensions feature.

        ``` title="Extensions address"
        edge://extensions
        ```

        1.  In the Extensions tab, toggle **Developer mode**
        1.  Click the **Load unpacked** button
        1.  Navigate to the local directory containing the RetroTxt source code and select OK

        ![Edge extensions developer mode](../assets/source_code-edge.png)

    === "Brave"

        Open a new tab with in the address of the Extensions feature.

        ``` title="Extensions address"
        brave://extensions
        ```

        1.  In the Extensions tab, toggle **Developer mode**
        1.  Click the **Load unpacked** button
        1.  Navigate to the local directory containing the RetroTxt source code and select OK

    RetroTxt should load. The Options link behind the **Details** button and allows you to configure RetroTxt styling and behaviour.

=== "Firefox"

    ### Use on Firefox

    Firefox is locked down and doesn't permit the loading of extensions outside of the Firefox Add-ons page. Mozilla's [web-ext](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext) tool is the easiest method to bypass this.

    ```bash title="Copy the Firefox manifest"
    cd RetroTxt
    cp ext/json/manifest_firefox.json ext/manifest.json
    ```

    === "yarn"
        ```bash title="Load RetroTxt in Firefox with automatic extension reloading"
        yarn run web-ext run -s=ext
        ```

    === "npm"
        ```bash title="Load RetroTxt in Firefox with automatic extension reloading"
        npx web-ext run -s=ext
        ```

    ```
    Applying config file: ./package.json
    Running web extension from /RetroTxt/ext
    Use --verbose or open Tools > Web Developer > Browser Console to see logging
    Installed /RetroTxt/ext as a temporary add-on
    The extension will reload if any source file changes
    Press R to reload (and Ctrl-C to quit)
    ```

    ```bash title="Optional, after quitting Firefox, to restore the Chrome manifest"
    cp ext/json/manifest_chrome.json ext/manifest.json
    ```

    ---

    ### Linting with Firefox

    Mozilla's web-ext tool can be used to analyse the source code for any syntax or logic errors.

    ```bash title="Linting the source code"
    cp ext/json/manifest_firefox.json ext/manifest.json
    yarn run web-ext lint -s=ext
    ```

    ```
    Validation Summary:

    errors          0
    notices         0
    warnings        0
    ```

=== "Firefox Developer Edition"

    ### Use on Firefox Developer Edition

    1. Edit `ext/.web-ext-firefox.js`
    1. Update `"run": { "firefox": "firefox" }` and change it to `"run": { "firefox": "firefoxdeveloperedition" }`
    1. Follow the **Firefox**  instructions tab
