Unlike earlier versions, RetroTxt requires no additional permissions to work out of the box.

For security and safety, RetroTxt will only work on websites and domains you specifically list in the RetroTxt Settings tab under **Run RetroTxt on files hosted on these domains**. Here you can add or remove domains of your choosing.

You can access the RetroTxt Settings by typing `rt settings` as the browser tab address.

The only permanent domain is [retrotxt.com](https://retrotxt.com), which is used as a fallback to confirm the installation of the Extension. This domain also hosts the Sample artworks that you can access by typing `rt samples` as the browser tab address.

The samples are also browsable using: [retrotxt.com/e](https://retrotxt.com/e)

---

[There are instructions to browse local files on your computer](../local).

!!! example

    ### Or you could run a simple, local web server on your computer

    === "NPM"
        ```bash
        # an example path
        cd yourfiles

        npx http-server
        ```

    === "Python3"
        ```bash
        # an example path
        cd yourfiles

        python3 -m http.server
        ```

    === "Python2"
        ```bash
        # an example path
        cd yourfiles

        python -m SimpleHTTPServer
        ```

    === "PHP"
        ```bash
        # an example path
        cd yourfiles

        php -S localhost:8000
        ```
