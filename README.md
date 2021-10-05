<h2 align="center"><a href="https://henryleberre.github.io/GT-UI">Get OSCAR+</a></h2>
<p align="center">OSCAR+ improves the look and feel of Georgia Tech's OSCAR</p>
<p align="center"><i>"OSCAR like it's 2021" - <a href="https://github.com/henryleberre">@henryleberre</a></i></p>

## 1. Joining the team

Feel free to open pull requests, issues, and to contact me directly through my [academic email](mailto:henryleberre@gatech.edu) and social media profiles.

## 2. Getting up and running

### 2-a) Development Environment

Depending on your operating system, please run:

```
sudo apt install python3 python3-pip npm # Debian, Ubuntu, Pop!OS, and Mint
sudo pacman -S python python-pip npm     # Arch :)
brew install git python npm              # MacOS *(2)
```

<sup><i>\*(1) On Windows, please use [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10) and a Linux distribution like [Ubuntu](https://www.microsoft.com/en-us/p/ubuntu/9nblggh4msv6?activetab=pivot:overviewtab). \*(2) On MacOS, please install [Homebrew](https://brew.sh/), as well as the latest beta build of XCode.</i></up>

In all cases:

```
npm install -g web-ext purgecss
pip install Pillow tqdm google-api-python-client
```

### 2-b) Clone the repository

Navigate to your desired directory and run `git clone --recursive https://github.com/henryleberre/GT-UI && cd GT-UI`.

### 2-c) Build

Run `python3 build.py` to generate a development version of OSCAR+ compatible with Chrome (any Chromium derivative), in the `build` directory. You can now open Chrome, navigate to the extensions page, enable Developer Mode, and click on "Load Unpacked", selecting the file `build/zip/Chromium.zip`.

## 3. Technical Presentation

### 3-a) Scope & Intended Audiance

This technical presentation's scope is purposefully limited to the design of OSCAR+. Please refer to [Google Chrome's Extension Documentation](https://developer.chrome.com/docs/extensions/), as well [Mozilla's](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions) for a thorough overview of web browser extension developement. 

### 3-b) Modifying OSCAR's UI

Our - minified and reduced thanks to [PurgeCSS](https://github.com/FullHuman/purgecss) - CSS library ([TailwindCSS](https://github.com/tailwindlabs/tailwindcss)), and main content script get loaded whenever a user visits OSCAR, which loads an HTML template, which we fill the DOM's current elements after page loading. Then, we simply replace the DOM with the previously created and filled template. We then apply some more logic to further improve the page's esthetics, prettifying menus, and class registration pages.

### 3-c) Build Process

Our `build.py` script generate builds for all supported browsers, by selecting, generating, purging, and minifying different files from the main source tree into a coherent folder structure for each target browser, depending on the configuration file `build.config.json`. Please read these files for extended information and a list of supported targets. For instance, it generates a series of different sized icons from a single high resolution icon. The script also generates zip files for each target, and is able to sign and publish builds if you have the appropriate cryptographic keys - which you shall not!

### 3-d) Browser Support & Distribution

As of writing, Chrome encourages the use of Manifest v3 whilst Firefox hasn't completed its implementation of the standard, only supporting v2 for now. As a result, our build script generates two versions, one for firefox and one for chromium.

+ **Chromium and its forks:** The extension is publicly listed on the Google Chrome Web Store. After publishing the zip archive for a new release, the review process is concerningly fast, being sometimes immediate.

+ **Firefox and its forks:** The extension is self-hosted on our website because Mozilla has a rather tedious review process. For instance, we were asked to make my main content script run DOMPurify to sanitize the HTML it is processing - which is utterly ridiculous. Furthermore, Mozilla refused to host the extension for it was "too niche". I was compelled to host it myself. I generate the signed .xpi extension archive using my Mozilla API keys using the script `publish.py` target. Clicking on the Firefox icon to download the extension our website simply links to the .xpi extension file in our latest GitHub release. Your are able to unpack the .xpi file - as a regular archive - to ensure it is legitimate and trustworthy.

+ **Safari:** We mainly use Apple's latest [Safari Web Extension Converter](https://developer.apple.com/documentation/safariservices/safari_web_extensions/converting_a_web_extension_for_safari) available on the latest beta builds of XCode to convert Firefox's (manifest v2) version of the extension to compatible XCode projects for Safari on iOS and Mac OS.

## 4. References

+ [OSCAR+'s Website](https://henryleberre.github.io/GT-UI)
+ [Georgia Tech's Official Colors](https://brand.gatech.edu/our-look/colors)
+ [Google Chrome's Extension Documentation](https://developer.chrome.com/docs/extensions/)
+ [Mozilla's Extension Documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
