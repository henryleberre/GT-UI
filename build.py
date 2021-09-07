import pathlib, os, json, shutil
from PIL import Image

def GetFilename(filepath):
    return filepath.split("/")[-1]

def CreateDirectory(name):
    os.makedirs(name, exist_ok=True)

def CopyFilesToDirectory(filenames, directory):
    for filename in filenames:
        shutil.copy(filename, directory)

def GetPathsToAllFilesInDirectory(directory):
    return [ directory + filename for filename in os.listdir(directory) ]

def FilterEndsWith(arr, arr_s):
    def _predicate(filename):
        for s in arr_s:
            if filename.endswith(s):
                return True
        
        return False

    return list(filter(_predicate, arr))

def FilterNotEndsWith(arr, arr_s):
    def _predicate(filename):
        for s in arr_s:
            if filename.endswith(s):
                return False
        
        return True
    
    return list(filter(_predicate, arr))

def WithoutDuplicates(arr):
    return list(set(arr))

def PurgeCSS(dest, inCSS, inContent):
    os.system("purgecss --config ./purgecss.config.js --output {} --css {} --content {}".format(dest, inCSS, inContent))

def PurgeCSSMultiple(destFolder, inCSSFilepaths, inContent):
    for filepath in inCSSFilepaths:
        PurgeCSS(destFolder + "/" + GetFilename(filepath), filepath, inContent)

# Clean
shutil.rmtree("build/", ignore_errors=True)

CONFIG = json.loads(open("build.config.json").read())

print("Building {} @ v{}".format(CONFIG["name"], CONFIG["version"]))
CreateDirectory("build")

print("- Common Stage:")
CreateDirectory("build/common")

MANIFEST_COMMON = {
    "name":        CONFIG["name"],
    "version":     CONFIG["version"],
    "permissions": CONFIG["permissions"],
    "icons": {},
}

print("  - Generating Icons...")
CreateDirectory("build/common/icons")

icon = Image.open(CONFIG["icon"]["filename"])
for size in CONFIG["icon"]["sizes"]:
    icon.resize((int(size), int(size))).save("build/common/icons/icon{}.png".format(size))
    MANIFEST_COMMON["icons"][size] = "icons/icon{}.png".format(size)

print("  - Generating Content Scripts...")
for i in range(len(CONFIG["content_scripts"])):
    cs = CONFIG["content_scripts"][i]
    CreateDirectory("build/common/{}".format(cs["id"]))

    cs_files = cs["loads"] + cs["accesses"]

    cs_files_css     = FilterEndsWith(cs_files, [".css"])
    cs_files_not_css = FilterNotEndsWith(cs_files, [".css"])

    CopyFilesToDirectory(cs_files_not_css, "build/common/{}".format(cs["id"]))

    PurgeCSSMultiple("build/common/{}".format(cs["id"]), cs_files_css, " ".join(cs_files_not_css))

print("  - Generating Popup...")
CreateDirectory("build/common/popup")

popup_css_files     = FilterEndsWith(CONFIG["popup"], [".css"])
popup_not_css_files = FilterNotEndsWith(CONFIG["popup"], [".css"])

CopyFilesToDirectory(popup_not_css_files, "build/common/popup")
PurgeCSSMultiple("build/common/popup", popup_css_files, " ".join(popup_not_css_files))

print("- Firefox Stage:")
CreateDirectory("build/Firefox")

MANIFEST_V2 = {
    "manifest_version": 2,
    "content_scripts": [],
    "web_accessible_resources": [],
    "browser_action": {
        "default_icon": {},
        "default_title": CONFIG["name"],
        "default_popup": "popup/" + GetFilename(FilterEndsWith(CONFIG["popup"], [".html"])[0])
    },
    "browser_specific_settings": CONFIG["browser_specific_settings"]
}

MANIFEST_V2.update(MANIFEST_COMMON)

print("  - Copying Icons...")
CreateDirectory("build/Firefox/icons")
CopyFilesToDirectory([ "build/common/icons/icon{}.png".format(size) for size in CONFIG["icon"]["sizes"] ], "build/Firefox/icons")

print("  - Handling Content Scripts...")
for i in range(len(CONFIG["content_scripts"])):
    cs = CONFIG["content_scripts"][i]

    CreateDirectory("build/Firefox/{}".format(cs["id"]))

    filepaths = GetPathsToAllFilesInDirectory("build/common/{}/".format(cs["id"]))
    CopyFilesToDirectory(filepaths, "build/Firefox/{}".format(cs["id"]))

    csObj = {}
    csObj["matches"] = cs["matches"]

    for ext in ["css", "js"]:
        csObj[ext] = FilterEndsWith([ "{}/".format(cs["id"]) + filename for filename in os.listdir("build/common/{}/".format(cs["id"])) ], [ext])

    MANIFEST_V2["content_scripts"].append(csObj)

    MANIFEST_V2["web_accessible_resources"] = WithoutDuplicates(MANIFEST_V2["web_accessible_resources"] + [ "{}/".format(cs["id"]) + GetFilename(filepath) for filepath in cs["accesses"] ])

print("  - Handling Popup...")
CreateDirectory("build/Firefox/popup")
CopyFilesToDirectory(GetPathsToAllFilesInDirectory("build/common/popup/"), "build/Firefox/popup")

print("  - Adding Icons to Manifest..")
for size in CONFIG["icon"]["sizes"]:
    MANIFEST_V2["browser_action"]["default_icon"][size] = "icons/icon{}.png".format(size)

print("  - Writing Manifest...")
json.dump(MANIFEST_V2, open("build/Firefox/manifest.json", "w"), indent=4)

print("  - Creating Archive...")
shutil.make_archive("build/Firefox", "zip", "build/Firefox/")

print("- Chromium Stage:")
CreateDirectory("build/Chromium")

print("  - Copying Common & Firefox...")
CreateDirectory("build/Chromium/icons")
CopyFilesToDirectory(GetPathsToAllFilesInDirectory("build/common/icons/"), "build/Chromium/icons")

CreateDirectory("build/Chromium/popup")
CopyFilesToDirectory(GetPathsToAllFilesInDirectory("build/common/popup/"), "build/Chromium/popup")

for i in range(len(CONFIG["content_scripts"])):
    cs = CONFIG["content_scripts"][i]

    CreateDirectory("build/Chromium/{}".format(cs["id"]))
    CopyFilesToDirectory(GetPathsToAllFilesInDirectory("build/common/{}/".format(cs["id"])), "build/Chromium/{}".format(cs["id"]))

MANIFEST_V3 = {
    "manifest_version": 3,
    "web_accessible_resources": [],
    "action": MANIFEST_V2["browser_action"],
    "content_scripts": MANIFEST_V2["content_scripts"]
}

MANIFEST_V3.update(MANIFEST_COMMON)

print("  - Resolving Web Accessible Resources...")
for i in range(len(CONFIG["content_scripts"])):
    cs = CONFIG["content_scripts"][i]

    MANIFEST_V3["web_accessible_resources"].append({
        "matches":   cs["matches"],
        "resources": [ "{}/".format(cs["id"]) + GetFilename(filepath) for filepath in cs["accesses"] ]
    })

print("  - Writing Manifest...")
json.dump(MANIFEST_V3, open("build/Chromium/manifest.json", "w"), indent=4)

print("  - Creating Archive...")
shutil.make_archive("build/Chromium", "zip", "build/Chromium/")
