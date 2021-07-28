all: clean chromium firefox

clean:
	rm -rf ./build/

build_common:
	mkdir -p ./build/common/content/
	mkdir -p ./build/common/popup/
	mkdir -p ./build/common/icons/
	mkdir -p ./build/common/popup/
	mkdir -p ./build/common/res/
	mkdir -p ./build/dist/
	mkdir -p ./build/zip/
	mkdir -p ./build/src/

	convert -resize 128x128 ./res/icon.png ./build/common/icons/icon128x128.png
	convert -resize 64x64   ./res/icon.png ./build/common/icons/icon64x64.png
	convert -resize 48x48   ./res/icon.png ./build/common/icons/icon48x48.png
	convert -resize 32x32   ./res/icon.png ./build/common/icons/icon32x32.png
	convert -resize 16x16   ./res/icon.png ./build/common/icons/icon16x16.png

	purgecss --config ./purgecss.config.js --output ./build/common/content/tailwind.min.css --css ./libs/tailwind.min.css --content ./content/index.html ./content/index.js
	purgecss --config ./purgecss.config.js --output ./build/common/popup/tailwind.min.css   --css ./libs/tailwind.min.css --content ./popup/index.html

	cp -a ./content/* ./build/common/content/
	cp -a ./popup/* ./build/common/popup/

	rsync -avq ./res/* ./build/common/res/ --exclude icon.png

chromium: build_common
	mkdir -p ./build/src/chromium
	cp -R ./build/common/. ./build/src/chromium
	cp ./manifests/v3.json ./build/src/chromium/manifest.json
	cd ./build/src/chromium/ && zip -qq -r9 ./../../zip/chromium.zip ./

firefox: build_common
	mkdir -p ./build/src/firefox
	cp -R ./build/common/. ./build/src/firefox
	cp ./manifests/v2.json ./build/src/firefox/manifest.json
	cd ./build/src/firefox/ && zip -qq -r9 ./../../zip/firefox.zip ./

firefox_publish: firefox
	mkdir -p ./build/dist/firefox
	cd ./build/src/firefox && web-ext sign --api-key=$$(cat ../../../keys/firefox_api_key.txt) --api-secret=$$(cat ../../../keys/firefox_api_secret.txt) --channel=unlisted
	cp -a ./build/src/firefox/web-ext-artifacts ./dist/firefox/
	cp ./build/src/firefox/.web-extension-id ./dist/firefox/