#!/usr/bin/env python3

import build_ext    # build_ext.py
import os, json

from httplib2 import Http
from apiclient.discovery import build
from oauth2client.service_account import ServiceAccountCredentials

# 0.
# 0.0 -> Build
build_ext.run()

# 0.1 -> Get Version #
CONFIG = json.loads(open("build.config.json").read())

print("\nPublishing {} @ v{}".format(CONFIG["name"], CONFIG["version"]))

# 1.  Firefox
# 1.0 Firefox -> Sign

MOZILLA_JWT_ISSUER_KEY = open("keys/MOZILLA_JWT_ISSUER.key", 'r').read().replace('\n', '')
MOZILLA_JWT_SECRET_KEY = open("keys/MOZILLA_JWT_SECRET.key", 'r').read().replace('\n', '')

#os.system("cd ./build/Firefox && web-ext sign --api-key=\"{}\" --api-secret=\"{}\" --channel=unlisted".format(MOZILLA_JWT_ISSUER_KEY, MOZILLA_JWT_SECRET_KEY))

# 1.1 Firefox -> Update "updates.json" 

UPDATES_JSON = json.loads(open("docs/updates.json").read())
UPDATES_JSON_UPDATES = UPDATES_JSON["addons"][list(UPDATES_JSON["addons"].keys())[0]]["updates"]

for update in UPDATES_JSON_UPDATES:
    if float(update["version"]) >= float(CONFIG["version"]):
        print("updates.json alread has version v{} >= v{}".format(update["version"], CONFIG["version"]))
        exit(-1)

UPDATES_JSON_UPDATES.append({
    "version":     CONFIG["version"],
    "update_link": "https://github.com/henryleberre/GT-UI/releases/download/{}/Firefox.xpi".format(CONFIG["version"])
})

json.dump(UPDATES_JSON, open("docs/updates.json", "w"), indent=4)

# 2.  Chrome
# https://github.com/googleapis/google-api-python-client/issues/248

SCOPES = ['https://www.googleapis.com/auth/chromewebstore']

credentials = ServiceAccountCredentials.from_json_keyfile_name('keys/CHROME_KEYS.json', SCOPES)
http_auth = credentials.authorize(Http())
chromewebstore = build('chromewebstore', 'v1.1', http=http_auth)



# 3.  Publish a new GitHub Release