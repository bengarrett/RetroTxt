# Install and usage

RetroTxt employs an [open-sourced GNU LGPLv3 license](https://choosealicense.com/licenses/lgpl-3.0/) with the code available on [GitHub](https://github.com/bengarrett/RetroTxt). This page instructs how to use the source in Chromium-based and Firefox web browsers.

[Visual Studio Code](https://code.visualstudio.com) is used to create RetroTxt, and so it has some `.vscode` conveniences included in the package, such as workspace settings and extension recommendations.

There are also [Node.js](https://nodejs.org) with [yarn](https://yarnpkg.com/) or npm packages for the programming and build tools.

The source code get lint with [ESLint](https://eslint.org/) and stylized using [Prettier](https://prettier.io/), an opinionated formatter.

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

    ### Use on Chrome, Edge, and Brave

    I suggest that you create a [new user profile](https://support.google.com/chrome/answer/2364824?co=GENIE.Platform%3DDesktop&hl=en) and edit the Extension.

    === "Chrome"

        Open a new tab with the address of the Extensions feature.

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

    RetroTxt should load. The Options link behind the **Details** button allows you to configure RetroTxt styling and behavior.
