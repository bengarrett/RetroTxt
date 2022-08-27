---
hide:
  - toc
---
Unlike earlier versions, RetroTxt requires no additional permissions to work out of the box.

For security and safety, RetroTxt will only work on websites and domains you specifically list in the RetroTxt Settings tab under **Run RetroTxt on files hosted on these domains**. There you can add or remove the domains of your choosing.

You can access the RetroTxt Settings by typing `txt settings` in an address bar.

The only permanent domain is [retrotxt.com](https://retrotxt.com), which is used as a fallback to confirm the Extension installation. This domain also hosts the Sample artworks you can access by typing `txt samples` in an address bar.

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

    Please note, by default RetroTxt is only configured to use the `http://localhost` address.
    Any additional local addresses or IPs such as `http://127.0.0.1` will need to be added to the **Run RetroTxt on files hosted on these domains** setting.