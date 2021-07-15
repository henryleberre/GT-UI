<h1 align="center">GT UI</h1>

## Download links

<p align="center">
  <a rel="noreferrer noopener" href="https://chrome.google.com/webstore/detail/dark-reader/eimadpbcbfnmbkopoojfekhnkhdbieeh/">
    <img src="https://github.com/alrra/browser-logos/blob/main/src/chrome/chrome_64x64.png?raw=true">
    <img src="https://github.com/alrra/browser-logos/blob/main/src/brave/brave_64x64.png?raw=true">
    <img src="https://github.com/alrra/browser-logos/blob/main/src/chromium/chromium_64x64.png?raw=true">
    <img src="https://github.com/alrra/browser-logos/blob/main/src/edge/edge_64x64.png?raw=true">
    <img src="https://github.com/alrra/browser-logos/blob/main/src/opera/opera_64x64.png?raw=true">
    <img src="https://github.com/alrra/browser-logos/blob/main/src/vivaldi/vivaldi_64x64.png?raw=true">
  </a>
  <a rel="noreferrer noopener" href="https://addons.mozilla.org/en-US/firefox/addon/gt-ui/">
    <img src="https://github.com/alrra/browser-logos/blob/main/src/firefox/firefox_64x64.png?raw=true">
    <img src="https://github.com/alrra/browser-logos/blob/main/src/tor/tor_64x64.png?raw=true">
  </a>
</p>

GT-UI is available for most modern browsers that are forks of either Chromium or Firefox. Support for others like Safari is not yet established.

## Our mission

This projectly was originaly conveived as part of a group project for our GT 1000 IN5 class that strived to enhance the experience of every student - on and off campus. We are rather notorious for our current motto:

> Making Georgia Tech's class registration system as beautiful as its payment gateway.

## Building

Required packages:
+ Debian: `sudo apt install git make zip imagemagick`
+ Arch: `sudo pacman -S git make zip imagemagick` (not tested)

The root Makefile is responsible for generating "builds" of the extension for each browser platform. Its default target generates for all platforms. It creates a directory `_build` where generates the sources files for each platform in `_build/src/<platform>`, and outputs the packed versions as `_build/<platform>.zip`.

## How it works

### Prettify

Whenever a page is being loaded, and its URL matches `https://oscar.gatech.edu/*`, the content script `src/content/main.js` is executed by the browser. It then performs the following:
+ Waits for the page to finish loading to invoke `GTUI_Start()`
+ It fetches the template we created for OSCAR's new look
+ Inserts the current DOM from the original OSCAR into the said template
+ Replaces the DOM with our "filled" template
+ Loads some resources such as icons from our `web_accessible_resources`
+ If there is a menu, it creates a prettier one by extracting and reconstructing the original menu
 
Some extra Javascript & CSS is needed to change the appearance of the page's content (i.e: formating menus, ...).

### About manifests

Chrome encourages the use of Manifest v3 whilst Firefox hasn't completed its implementation of the standard, only supporting v2 for now. Consequently, we are required to maintain two seperate versions of our `manifest.json`.

## Notable references

+ [Georgia Tech's Official Colors](https://brand.gatech.edu/our-look/colors)
