<h1 align="center">GT UI</h1>

## Get it [here](https://henryleberre.github.io/GT-UI/)

## Our mission

This projectly was originaly conveived as part of a group project for our GT 1000 IN5 class that strived to enhance the experience of every student - on and off campus. We are rather notorious for our current motto:

> Making Georgia Tech's class registration system as beautiful as its payment gateway.

## Building

If on Windows, please install WSL2.

Required packages:
+ Debian: `sudo apt install git make zip imagemagick npm`
+ Arch: `sudo pacman -S git make zip imagemagick npm`
+ All: `npm install --global web-ext purgecss`

The root Makefile is responsible for generating "builds" of the extension for each browser platform. Its default target generates for all platforms. It creates a directory `_build` where generates the sources files for each platform in `_build/src/<platform>`, and outputs the packed versions as `_build/<platform>.zip`.

## About manifests

Chrome encourages the use of Manifest v3 whilst Firefox hasn't completed its implementation of the standard, only supporting v2 for now. Consequently, we are required to maintain two seperate versions of our `manifest.json`.

## Distribution

### Chromium Forks

It is listed as an extension on the Chrome Webstore. Reviews often take a day or so.

### Firefox Forks

The extension is self-hosted on our website because Mozilla has a rather tedious review process. For example, I was asked to make my main content script run DOMPurify to sanitize the HTML it is processing - which is utterly ridiculous. Furthemore, not being able to comply with their guideline that requires me to provide them login credentials to try out the extension, I was compelled to host it myself.

I generate the signed .xpi extension archived using my Mozilla API keys - using the Makefile's `firefox_publish` target - which are excluded from the public source tree (and source control for that matter) for obvious security concerns. They currently reside in the /keys/ subdirectory. (View .gitignore).

Your are able to unpack the .xpi file - as a regular archive - to ensure it is legitimate.

## Notable references

+ [Georgia Tech's Official Colors](https://brand.gatech.edu/our-look/colors)
