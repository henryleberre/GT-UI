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
	cp -a ./src/ ./_build/src/$(1)/; \
	mkdir -p _build/zip/; \
	cd ./_build/src/$(1)/ && zip -r9 ./../../zip/$(1).zip ./; \

chromium:
	$(call make_generic,chromium,v3.json)

firefox:
	$(call make_generic,firefox,v2.json)

firefox_sign: firefox
	mkdir -p ./_build/dist/firefox
	cd _build/src/firefox && web-ext sign --api-key=$$(cat ../../../keys/firefox_api_key.txt) --api-secret=$$(cat ../../../keys/firefox_api_secret.txt) --channel=unlisted --id="{5c7a5cfb-c809-4f1d-9e7a-3eeebf72e191}"
	cp -a _build/src/firefox/web-ext-artifacts _build/dist/firefox/
	cp _build/src/firefox/.web-extension-id _build/dist/firefox/