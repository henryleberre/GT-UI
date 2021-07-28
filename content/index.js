let browserHandle   = (typeof browser != 'undefined') ? browser : chrome;
let GetExtensionURL = browserHandle.runtime.getURL;

const CSS_FILENAMES = [
    "content/tailwind.min.css",
];

const JAVASCRIPT_FILENAMES = [

];

const COLOR_CLASSES = {
    "SUCCESS": "bg-green-200",
    "WARNING": "bg-yellow-200",
    "ERROR":   "bg-red-200"
};

function IncludeCSSFile(filename) {
    let link  = document.createElement("link");
    link.href = GetExtensionURL(filename);
    link.rel  = "stylesheet";

    document.head.appendChild(link);
}

function IncludeJavascriptFile(filename) {
    let script  = document.createElement("script");
    script.src  = GetExtensionURL(filename);
    script.type = "text/javascript";
    document.head.appendChild(script);
}

async function LoadFileContents(filename) {
    let fetched = await fetch(GetExtensionURL(filename));
    let text    = await fetched.text();

    return text;
}

function ImportJavascriptModule(filename) {
    return import(GetExtensionURL(filename));
}

function GetElementByIdAndDo(id, callback) {
    let e = document.getElementById(id);

    if (e != undefined)
        callback(e);
}

function GetElementsByClassNameForeach(parentElem, className, callback) {
    return Array.from(parentElem.getElementsByClassName(className)).forEach(callback);
}

function GetElementsByTagNameForeach(parentElem, tagName, callback) {
    return Array.from(parentElem.getElementsByTagName(tagName)).forEach(callback);
}

function QuerySelectorAllForeach(parentElem, selector, callback) {
    return Array.from(parentElem.querySelectorAll(selector)).forEach(callback);
}

function CreateChildOfType(parent, childTagName, id = "", className = "", style = "") {
    let e = document.createElement(childTagName);
    parent.appendChild(e);

    e.id = id;
    e.className = className;
    e.setAttribute("style", style);

    return e;
}

async function InsertTemplate() {
    // Remove all stylesheets from OSCAR
    QuerySelectorAllForeach(document.head, "link[rel='stylesheet']", (lnk) => {
        lnk.remove();
    });

    // Add stylesheets & JS
    CSS_FILENAMES.forEach(IncludeCSSFile);
    JAVASCRIPT_FILENAMES.forEach(IncludeJavascriptFile);

    // Extract Body Elements From OSCAR's Loaded Page
    let bodyNodes = [];
    GetElementsByClassNameForeach(document, "pagebodydiv", (bodyDiv) => {
        bodyDiv.childNodes.forEach((e) => {
            bodyNodes.push(e.cloneNode(true));
        });
    });

    // Load Template
    document.body.innerHTML = await LoadFileContents("content/index.html");    

    // Insert OSCAR's Body Elements Into The Template
    bodyNodes.forEach((e) => {
        GetElementByIdAndDo("GTUI_pageContent", (pageContentElem) => {
            pageContentElem.appendChild(e);
        });
    });
}

function InsertLogoSRCs() {
    GetElementByIdAndDo("GTUI_gtLogo", (e) => {
        e.src = GetExtensionURL("res/gt-logo.svg");
    });

    GetElementByIdAndDo("GTUI_githubLogo", (e) => {
        e.src = GetExtensionURL("res/github-logo.svg");
    });
}

function TopNavMenuShowActiveTab() {
    let currentMenuLink = Array.from(document.querySelectorAll("#GTUI_navbar_menu a")).find((val) => {
        return window.location.href.includes(val);
    });

    if (currentMenuLink != undefined) {
        GetElementsByTagNameForeach(currentMenuLink, "svg", (svgElem) => {
            svgElem.style.color = "#f2c83f";
        });
    }
        
}

function GenerateGridMenu() {
    GetElementsByClassNameForeach(document, "menuplaintable", (mptElem) => {
        let menuTDs = [];

        GetElementsByTagNameForeach(mptElem, "td", (tdElem) => {
            if (Array.from(tdElem.getElementsByTagName("a")).length > 0) {
                if (tdElem.innerText != "") {
                    tdElem.innerHTML = tdElem.innerHTML.replace(/&nbsp;/g, '');

                    menuTDs.push(tdElem);
                }
            }
        });

        let pageContentElem = document.getElementById("GTUI_pageContent");

        let menuDiv = CreateChildOfType(pageContentElem, "div", "", "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4", "");

        for (let idx = 0; idx < menuTDs.length; idx++) {
            let cardColElem      = CreateChildOfType(menuDiv,        "div", "", "rounded-xl shadow-2xl", "");
            let cardElem         = CreateChildOfType(cardColElem,    "div", "", "",    "");
            let cardHeaderElem   = CreateChildOfType(cardElem,       "div", "", "",    "");
            let cardBodyElem     = CreateChildOfType(cardElem,       "div", "", "p-4 text-xl", "");
            let cardBodyTextElem = CreateChildOfType(cardBodyElem,   "p",   "", "",    "");
            let cardLink         = CreateChildOfType(cardHeaderElem, "a",   "", "text-center w-full p-4 rounded-md bg-black text-white text-2xl", "display: inline-block;");
            
            cardLink.innerText = "Visit";
            cardLink.href      = menuTDs[idx].getElementsByTagName("a")[0].href;

            // Link
            GetElementsByTagNameForeach(menuTDs[idx], "a", (linkElem) => {
                if (!window.location.href.endsWith("bmenu.P_MainMnu")) {
                    if (linkElem.innerText.trim().length == 0) {
                        linkElem.remove();
                    } else {
                        cardLink.innerText = linkElem.innerText;
                    }
                } else {
                    cardLink.innerText = [
                        "Student Services & Financial Aid",
                        "Personal Information",
                        "Campus Services",
                        "Admission",
                        "Take A Survey"
                    ][idx];
                }
            });

            { // Description
                // Get Card's Description
                let descriptionTextRaw = "";
                GetElementsByClassNameForeach(menuTDs[idx], "menulinkdesctext", (menuLinkDescText) => {
                    descriptionTextRaw += menuLinkDescText.innerText;
                });

                if (descriptionTextRaw.includes(';')) {
                    // Turn lists (of ";" seperated values) into actual <ul><li> ones
                    let list = CreateChildOfType(cardBodyTextElem, "ul", "", "", "");

                    for (let listElementText of descriptionTextRaw.split(';')) {
                        let listElement = CreateChildOfType(list, "li", "", "border-black list-none rounded-sm px-3 py-3", "");
                        listElement.innerText = listElementText;
                    }
                } else {
                    // Otherwise, simply paste the description text
                    cardBodyTextElem.innerText = descriptionTextRaw;
                }
            }
        }

        mptElem.remove();
    });
}

function GenerateAlerts() {
    GetElementsByClassNameForeach(document, "infotextdiv", (warningElem) => {
        warningElem.classList.add("bg-yellow-200", "p-5", "rounded-md");
    });
}

function RemoveBadHTML() {
    // Remove SkipLinks
    QuerySelectorAllForeach(document, "a.skiplinks", (skipLink) => {
        if (skipLink.innerText == "Skip to top of page")
            skipLink.remove();
    });
}

function PrettyTables() {
    GetElementsByTagNameForeach(document, "table", (tableElem) => {
        tableElem.classList.add("mx-auto");

        GetElementsByTagNameForeach(document, "th", (tdElem) => {
            tdElem.classList.add("border", "py-4", "font-semibold", "text-white", "bg-black", "text-center");
        });

        GetElementsByTagNameForeach(document, "td", (tdElem) => {
            tdElem.classList.add("border", "py-4", "font-semibold", "text-center");
        });
    });
}

function PrettyInputs() {
    QuerySelectorAllForeach(document, "input[type='submit'],input[type='reset'],button,select", (e) => {
        e.classList.add("p-2", "bg-black", "text-white", "cursor-pointer");
    });

    QuerySelectorAllForeach(document, "input[type='text']", (e) => {
        e.classList.add("p-2", "border-2", "border-black");
    });
}

function TableApplyClassToTDRowsWith(table, fncGetClass) {
    for (let row of Array.from(table.getElementsByTagName("tr"))) {
        let cells = row.getElementsByTagName("td");

        if (cells.length == 0)
            continue;

        row.classList.add(fncGetClass(cells));
    }
}

function SectionClassSearchAddOpenClosedColors() {
    GetElementsByTagNameForeach(document, "table", (table) => {
        TableApplyClassToTDRowsWith(table, (cells) => {
            if (cells.length != 20)
                return;

            const nRemaining   = parseInt(cells[13].innerText);
            const nWLRemaining = parseInt(cells[16].innerText);
    
            return (nRemaining > 0) ? COLOR_CLASSES["SUCCESS"] : ((nWLRemaining > 0) ? COLOR_CLASSES["WARNING"] : COLOR_CLASSES["ERROR"]);
        });
    });
}

const PAGE_URL_FUNC_MAP = {
    "bwskfcls.P_GetCrse": () => { // Simple section class search
        SectionClassSearchAddOpenClosedColors();
    },
    "bwskfreg.P_AltPin": () => { // Add/Drop Classes
        QuerySelectorAllForeach(document, "table[summary='Current Schedule']", (table) => {
            TableApplyClassToTDRowsWith(table, (cells) => {
                const isWaitlisted = cells[0].innerText.includes("Wait Listed Course");

                return (!isWaitlisted) ? COLOR_CLASSES["SUCCESS"] : COLOR_CLASSES["WARNING"];
            });
        });
    },
    "bwskfcls.P_GetCrse_Advanced": () => { // Advanced section class search
        SectionClassSearchAddOpenClosedColors();
    }
};

async function GTUI_Start(event) {
    if (window.location.href == "https://oscar.gatech.edu/") {
        return;
    }

    await InsertTemplate();

    InsertLogoSRCs();
    TopNavMenuShowActiveTab();
    GenerateGridMenu();
    GenerateAlerts();
    RemoveBadHTML();
    PrettyTables();
    PrettyInputs();

    const endURL = window.location.href.split("/bprod/")[1];
    if (endURL in PAGE_URL_FUNC_MAP)
        PAGE_URL_FUNC_MAP[endURL]();
}

GTUI_Start();