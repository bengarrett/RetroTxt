
# View files stored on your computer

!!! tip "Chrome, Edge &amp; Brave"

    Chrome, Chromium, Edge and Brave require the **Allow access to file URLs** Extension setting enabled if you wish to use RetroTxt to view files stored on your computer.

    This can be found in the browser Extensions tab, in the **Details** section of the RetroTxt installation.

    === "Chrome"
        ``` title="Extensions address"
        chrome://extensions/
        ```

    === "Edge"
        ``` title="Extensions address"
        edge://extensions/
        ```

    === "Brave"
        ``` title="Extensions address"
        brave://extensions/
        ```

Browsers are quite happy to read files and directories stored locally on your computer by typing a path into the address bar.

=== "Windows"

    On Windows, I may have a text file located in my downloads folder.

    ``` title="Windows file path"
    C:\Users\Ben\Downloads\myfile.txt
    ```

    You can paste this path into a browser tab address and it will convert it into a browser friendly file URI and render the document.

    ``` title="Browser address"
    file:///C:/Users/Ben/Downloads/myfile.txt
    ```

    You can also browse your Windows drive.

    ``` title="Browser address for the C: drive"
    file:///C:/
    ```

=== "macOS &amp; Linux"

    I may have a text file location in my home directory.

    ``` title="Computer file path"
    /home/ben/myfile.txt
    ```

    You can paste this path into a browser tab address and it will convert it into a browser friendly file URI and render the document.

    ``` title="Browser address"
    file:///home/ben/myfile.txt
    ```

    You can also browse your hard drive.

    ``` title="Browser address for the hard drive"
    file:///
    ```
