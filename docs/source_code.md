# RetroTxt

## Source code

RetroTxt is released under an [open sourced license](https://github.com/bengarrett/RetroTxt/blob/master/LICENSE.md) with the complete code available on [GitHub](https://github.com/bengarrett/RetroTxt). This page instructs on how to use the source code in both Chrome and Firefox web browsers.

### Download

Download the RetroTxt source code onto your local computer.

Either by using [this GitHub link](https://github.com/bengarrett/RetroTxt/archive/master.zip) and decompress the saved `RetroTxt-master.zip`.

Or run the following command in a terminal.

`git clone https://github.com/bengarrett/RetroTxt.git`

### Use on Chrome

I suggest that you create a new user profile in Chrome and use that to load and edit this web extension.

1. Open a new tab and type in the address `chrome://extensions/`
2. In the Extensions tab make sure __Developer Mode__ is checked
3. Click the __Load unpacked extension...__ button
4. Navigate to the local directory containing the RetroTxt source code and select OK

![Font options selection](assets/sourcecode_chrome_loaded.png)

RetroTxt should now be loaded. The [Options link](options.md) allows you to configure RetroTxt styling and behaviour. You can test RetroTxt and its Options while browsing a site like [Jason Scott's Top 100 Textfiles](http://textfiles.com/100/).

### Use on Firefox

Firefox is locked down and doesn't normally permit the loading of extensions outside of the Mozilla Add-ons page. Instead it is recommended developers use the [Firefox Developer Edition](https://www.mozilla.org/en-US/firefox/developer/) for this task.

In Firefox Developer Edition.
1. Open a new tab and type in the address `about:debugging`
2. Select __Add-ons__
3. Check the __Enable add-on debugging__ checkbox
4. Click the __Load Temporary Add-on__ button and navigate to the local directory containing the RetroTxt source code
5. Open the `manifest.json` file and you're done

![Font options selection](assets/sourcecode_firefox.png)

Now in the same tab.
1. Type in the address `about:addons`
2. Select __Extensions__
3. RetroTxt should be listed there with a number of buttons including __Options__
4. The [Options button](options.md) allows you to configure RetroTxt styling and behaviour
5. Test RetroTxt and its Options while browsing a site like [Jason Scott's Top 100 Textfiles](http://textfiles.com/100/)

![Font options selection](assets/sourcecode_firefox_addons.png)
