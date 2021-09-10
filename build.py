#!/usr/bin/env python3

import pathlib, os, json, shutil

from tqdm import tqdm
from PIL  import Image

def get_filename(filepath):
    return os.path.basename(filepath)

def create_directory(name):
    os.makedirs(name, exist_ok=True)

def create_directories(names):
    for name in names:
        create_directory(name)

def copy_files_to_directory(filenames, directory):
    for filename in filenames:
        shutil.copy(filename, directory)

def get_paths_to_files_in_directory(directory):
    if not directory.endswith("/"):
        directory = directory + "/"
    
    return [ directory + filename for filename in os.listdir(directory) ]

def filter_ends_with(arr, arr_s):
    def _predicate(filename):
        for s in arr_s:
            if filename.endswith(s):
                return True
        
        return False

    return list(filter(_predicate, arr))

def filter_not_end_with(arr, arr_s):
    def _predicate(filename):
        for s in arr_s:
            if filename.endswith(s):
                return False
        
        return True
    
    return list(filter(_predicate, arr))

def get_without_duplicates(arr):
    return list(set(arr))

def add_trailing_slash(s):
    if s.endswith("/"):
        return s

    return s + "/"

def purge_css(destFolder, inCSSFilepaths, inContent):
    base = "purgecss --config ./purgecss.config.js --output {} --css {} --content {}"
    for filepath in inCSSFilepaths:
        dstFilepath = add_trailing_slash(destFolder) + get_filename(filepath)

        os.system(base.format(dstFilepath, filepath, inContent))

def read_json_file(filename):
    f = open(filename, "r")
    r = json.loads(f.read())
    f.close()

    return r

def write_json_file(filename, data):
    f = open(filename, "w")
    json.dump(data, open(filename, "w"), indent=4)
    f.close()

def delete_directory(directory):
    shutil.rmtree(directory, ignore_errors=True)

def has_key(obj, key):
    return key in list(obj.keys())

def get_with_key_or_fail(obj, key, err):
    if has_key(obj, key):
        return obj[key]
    
    print("[FATAL ERROR: {}]".format(err))
    exit(-1)

def get_with_key_or(obj, key, val):
    if has_key(obj, key):
        return obj[key]
    
    return val

CONFIG           = {}
MANIFEST_COMMON  = {}
POPUP_OBJ_COMMON = {
        "default_icon": {},
        "default_title": "",
        "default_popup": ""
}

def build_common():
    global MANIFEST_COMMON
    global POPUP_OBJ_COMMON

    create_directories(["build/Common", "build/Common/icons", "build/Common/popup"])

    MANIFEST_COMMON = {
        "name":            get_with_key_or     (CONFIG, "name",    "build.config.json doesn't have a name field"),
        "version":         get_with_key_or_fail(CONFIG, "version", "build.config.json doesn't have a version field"),
        "description":     get_with_key_or     (CONFIG, "description", ""),
        "permissions":     get_with_key_or     (CONFIG, "permissions", {}),
        "icons":           {},
        "content_scripts": []
    }

    # Generate Icons
    icon = Image.open(CONFIG["icon"]["filename"])
    for size in CONFIG["icon"]["sizes"]:
        dims          = (size, size)
        filename_icon = "build/Common/icons/icon{}.png".format(size)
        icon.resize(dims).save(filename_icon)

        MANIFEST_COMMON["icons"][str(size)] = "icons/icon{}.png".format(size)

    # Generate Content Scripts
    for cs in CONFIG["content_scripts"]:
        create_directories(["build/Common/{}".format(cs["id"])])

        filenames = cs["loads"] + cs["accesses"]

        filenames_css     = filter_ends_with   (filenames, [".css"])
        filenames_not_css = filter_not_end_with(filenames, [".css"])

        copy_files_to_directory(filenames_not_css, "build/Common/{}".format(cs["id"]))

        purge_css("build/Common/{}".format(cs["id"]), filenames_css, " ".join(filenames_not_css))

        # Fill Manifest's content_scripts
        obj = {}
        obj["matches"] = cs["matches"]
        
        for ext in ["css", "js"]:
            obj[ext] = filter_ends_with([ "{}/".format(cs["id"]) + filename for filename in os.listdir("build/Common/{}/".format(cs["id"])) ], [ext])

        MANIFEST_COMMON["content_scripts"].append(obj)

    # Handle Popup
    popup_css_filenames     = filter_ends_with   (CONFIG["popup"], [".css"])
    popup_not_css_filenames = filter_not_end_with(CONFIG["popup"], [".css"])

    copy_files_to_directory(popup_not_css_filenames, "build/Common/popup")
    purge_css("build/Common/popup", popup_css_filenames, " ".join(popup_not_css_filenames))

    # Create POPUP_OBJ_COMMON
    POPUP_OBJ_COMMON["default_title"] = CONFIG["name"]
    POPUP_OBJ_COMMON["default_popup"] = "popup/" + get_filename(filter_ends_with(CONFIG["popup"], [".html"])[0])
    POPUP_OBJ_COMMON["default_icon"]  = MANIFEST_COMMON["icons"]

def build_for_browser(browser_obj):
    global CONFIG
    global MANIFEST_COMMON

    browser_name     = get_with_key_or_fail(browser_obj, "name", "No browser name provided")
    browser_manifest = get_with_key_or_fail(browser_obj, "manifest_version", "No manifest version provided")

    # Create Dirs
    build_dir = "build/{}".format(browser_name) + "/"

    create_directories([build_dir + "icons", build_dir + "popup"])

    copy_files_to_directory(get_paths_to_files_in_directory("build/Common/icons"), build_dir + "icons")
    copy_files_to_directory(get_paths_to_files_in_directory("build/Common/popup"), build_dir + "popup")

    for cs in CONFIG["content_scripts"]:
        create_directories([build_dir + cs["id"]])

        copy_files_to_directory(get_paths_to_files_in_directory("build/Common/{}".format(cs["id"])), build_dir + cs["id"])

    MANIFEST = {
        "manifest_version": browser_manifest,
        "web_accessible_resources": []
    }

    MANIFEST.update(MANIFEST_COMMON)

    if browser_manifest == 2:
        for cs in CONFIG["content_scripts"]:
            MANIFEST["web_accessible_resources"] += [ "{}/".format(cs["id"]) + get_filename(filepath) for filepath in cs["accesses"] ]
            MANIFEST["web_accessible_resources"] = get_without_duplicates(MANIFEST["web_accessible_resources"])

        if has_key(browser_obj["params"], "browser_specific_settings"):
            MANIFEST["browser_specific_settings"] = browser_obj["params"]["browser_specific_settings"]

        MANIFEST["browser_action"] = POPUP_OBJ_COMMON

        if browser_obj["self_host"]:
            MANIFEST["browser_specific_settings"] = {
                "gecko": {
                    "id": browser_obj["extension_id"],
                    "update_url": browser_obj["params"]["updates.json_url"]
                }
            }
    elif browser_manifest == 3:
        for cs in CONFIG["content_scripts"]:
            MANIFEST["web_accessible_resources"].append({
                "matches":   cs["matches"],
                "resources": [ "{}/".format(cs["id"]) + get_filename(filepath) for filepath in cs["accesses"] ]
            })
        
        MANIFEST["action"] = POPUP_OBJ_COMMON
    else:
        print("Unknown Manifest Version")
        exit(-1)

    write_json_file(build_dir + "manifest.json", MANIFEST)

    # Create Zip Archive
    shutil.make_archive("build/{}".format(browser_obj["name"]), "zip", "build/{}/".format(browser_obj["name"]))

def run():
    global CONFIG

    create_directories(["build"])

    CONFIG = read_json_file("build.config.json")

    print("Building {} @ v{}".format(CONFIG["name"], CONFIG["version"]))

    build_common()

    for browser in tqdm(get_with_key_or(CONFIG, "browsers", [])):
        build_for_browser(browser)

if __name__ == "__main__":
    run()