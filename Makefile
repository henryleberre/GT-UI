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
	cd ./_build/src/$(1)/ && zip -r9 ./../../$(1).zip ./; \

chromium:
	$(call make_generic,chromium,v3.json)

firefox:
	$(call make_generic,firefox,v2.json)