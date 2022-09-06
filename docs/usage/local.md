---
title: "View files stored on your computer"
authors:
    - Ben Garrett
date: 2022-08-30
hide:
  - toc
---
# View files stored on your computer

Browsers are happy to read files and directories stored locally on your computer by typing a file or directory path into the address bar.

=== "Windows"

    I may have a text file on Windows in my Downloads folder.

    ``` title="Windows file path"
    C:\Users\Ben\Downloads\myfile.txt
    ```

    You can paste this path into a browser tab address, and it will convert it into a browser-friendly file URI and render the document.

    ``` title="Browser address"
    file:///C:/Users/Ben/Downloads/myfile.txt
    ```

    You can also browse your Windows drive.

    ``` title="Browser address for the C: drive"
    file:///C:/
    ```

=== "macOS or Linux"

    I may have a text file located in my home directory.

    ``` title="Computer file path"
    /home/ben/myfile.txt
    ```

    You can paste this path into a browser tab address, and it will convert it into a browser-friendly file URI and render the document.

    ``` title="Browser address"
    file:///home/ben/myfile.txt
    ```

    You can also browse your hard drive.

    ``` title="Browser address for the hard drive"
    file:///
    ```

!!! tip "Chrome, Edge, Brave, or Vivaldi"

    Chrome, Edge, Brave, Vivaldi, and other Chromium-based browsers require the **Allow access to file URLs** Extension Details setting enabled if you wish to use RetroTxt to view files stored on your computer.

    === "Chrome"
        ``` title="Extension Details address"
        chrome://extensions/
        ```

    === "Edge"
        ``` title="Extension Details address"
        edge://extensions/
        ```

    === "Brave"
        ``` title="Extension Details address"
        brave://extensions/
        ```

    === "Vivaldi"
        ``` title="Extension Details address"
        vivaldi://extensions/
        ```