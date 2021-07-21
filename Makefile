all: clean chromium firefox

clean:
	rm -rf ./_build/

make_generic = \
	mkdir -p ./_build/src/$(1)/; \
	rm -rf ./_build/src/$(1)/*; \
	mkdir -p ./_build/src/$(1)/; \
	cp ./manifests/$(2) ./_build/src/$(1)/manifest.json; \
	mkdir -p ./_build/src/$(1)/gtui_icons/; \
	convert -resize 128x128 ./gtui_icon.png ./_build/src/$(1)/gtui_icons/icon128x128.png; \
	convert -resize 64x64   ./gtui_icon.png ./_build/src/$(1)/gtui_icons/icon64x64.png; \
	convert -resize 48x48   ./gtui_icon.png ./_build/src/$(1)/gtui_icons/icon48x48.png; \
	convert -resize 32x32   ./gtui_icon.png ./_build/src/$(1)/gtui_icons/icon32x32.png; \
	convert -resize 16x16   ./gtui_icon.png ./_build/src/$(1)/gtui_icons/icon16x16.png; \
	cp -a ./src/ ./_build/src/$(1)/;

chromium:
	$(call make_generic,chromium,v3.json)
	google-chrome --no-message-box --pack-extension=_build/src/chromium --pack-extension-key=keys/chromium_private.pem

chromium_sign: chromium
	mkdir -p ./_build/dist/chromium
	mv ./_build/src/chromium.crx ./_build/dist/chromium/

firefox:
	$(call make_generic,firefox,v2.json)

firefox_sign: firefox
	mkdir -p ./_build/dist/firefox
	cd _build/src/firefox && web-ext sign --api-key=$$(cat ../../../keys/firefox_api_key.txt) --api-secret=$$(cat ../../../keys/firefox_api_secret.txt) --channel=unlisted
	cp -a _build/src/firefox/web-ext-artifacts _build/dist/firefox/
	cp _build/src/firefox/.web-extension-id _build/dist/firefox/