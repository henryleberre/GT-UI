<h1 align="center">GT UI</h1>

## Get it on our website [https://henryleberre.github.io/GT-UI/](https://henryleberre.github.io/GT-UI/)

## Our mission

This projectly was originaly conveived as part of a group project for our GT 1000 IN5 class that strived to enhance the experience of every student - on and off campus. We are rather notorious for our current motto:

> Making Georgia Tech's class registration system as beautiful as its payment gateway.

## Building

We currently require a UNIX-based and BASH-like developpment environment, supporting the following packages. If you are on windows 10 or higher, you can download and install WSL as well as a distro, to obtain a suitable developpment environment.

Here is a guide for installing the required dependencies:
+ APT:    `sudo apt install git make zip imagemagick npm && npm install --global web-ext purgecss`
+ PACMAN: `sudo pacman   -S git make zip imagemagick npm && npm install --global web-ext purgecss`

The root Makefile is responsible for generating "builds" of the extension for each browser platform. Its default target generates builds for all platforms. It creates a directory `build` where generates source files trees, packed source versions, and signed versions.

## About manifests

Chrome encourages the use of Manifest v3 whilst Firefox hasn't completed its implementation of the standard, only supporting v2 for now. Consequently, we are required to maintain two seperate versions of our `manifest.json`. The review-team has been wonderful.

## Distribution

### Chromium Forks

The extension is listed as an extension on the Chrome Webstore. I believe you can download the packed .crx file from Google to ensure it's legitimate. 

### Firefox Forks

The extension is self-hosted on our website because Mozilla has a rather tedious review process. For example, I was asked to make my main content script run DOMPurify to sanitize the HTML it is processing - which is utterly ridiculous. Furthermore, Mozilla refused to host the extension for it was "too niche". I was compelled to host it myself.

I generate the signed .xpi extension archive using my Mozilla API keys - using the Makefile's `firefox_publish` target - which are excluded from the public source tree (and source control for that matter) for obvious security concerns. They currently reside in the /keys/ subdirectory. (View .gitignore).

Your are able to unpack the .xpi file - as a regular archive - to ensure it is legitimate.

## Notable references

+ [Georgia Tech's Official Colors](https://brand.gatech.edu/our-look/colors)
