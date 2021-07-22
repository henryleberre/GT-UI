let browserHandle   = (typeof browser != 'undefined') ? browser : chrome;
let GetExtensionURL = browserHandle.runtime.getURL;

const CSS_FILENAMES = [
    "src/lib/tailwind.min.css",
];

const JAVASCRIPT_FILENAMES = [

];

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
    document.body.innerHTML = await LoadFileContents("src/content/gtui.html");    

    // Insert OSCAR's Body Elements Into The Template
    bodyNodes.forEach((e) => {
        GetElementByIdAndDo("GTUI_pageContent", (pageContentElem) => {
            pageContentElem.appendChild(e);
        });
    });
}

function InsertLogoSRCs() {
    GetElementByIdAndDo("GTUI_gtLogo", (e) => {
        e.src = GetExtensionURL("src/content/gt-logo.svg");
    });

    GetElementByIdAndDo("GTUI_githubLogo", (e) => {
        e.src = GetExtensionURL("src/content/github-logo.svg");
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

function ShouldMakeTableHeaderDark(tableElem, nRows) {
    if (nRows == 0)
        return false;

    if (window.location.href.endsWith("bprod/bwskfshd.P_CrseSchd"))
        return true;

    return false;
}

function PrettyTables() {
    GetElementsByTagNameForeach(document, "table", (tableElem) => {
        tableElem.classList.add("mx-auto");

        let rows = Array.from(tableElem.getElementsByTagName("tr"));

        if (ShouldMakeTableHeaderDark(tableElem, rows.length)) { // If "Week at a glance"
            rows[0].classList.add("table-dark");
        }
    });
}

function PrettyInputs() {
    QuerySelectorAllForeach(document, "input[type='submit'],input[type='reset'],button,select", (e) => {
        e.classList.add("p-2", "bg-black", "text-white", "cursor-pointer");
    });
}

function GetClassTableItemClassName(nRemaining, nWLRemaining) {
    if (nRemaining > 0) {
        return "bg-green-200";
    }

    if (nWLRemaining > 0) {
        return "bg-yellow-200";
    }

    return "bg-red-200";
}

function ShowOpenAndClosedClasses() {
    GetElementsByTagNameForeach(document, "table", (tableElem) => {
        let rows  = Array.from(tableElem.getElementsByTagName("tr"));
        let nRows = rows.length;

        GetElementsByTagNameForeach(document, "th", (tdElem) => {
            tdElem.classList.add("py-4", "font-semibold", "text-white", "bg-black", "text-center");
        });

        GetElementsByTagNameForeach(document, "td", (tdElem) => {
            tdElem.classList.add("py-4", "font-semibold", "text-center");
        });

        if (nRows >= 2) {
            let nCols = Array.from(rows[1].getElementsByTagName("th")).length;

            if (nCols == 20) { // Is the case in "Lookup for classes"
                for (let row of rows.slice(2)) {
                    const cols = Array.from(row.getElementsByTagName("td"));

                    const nRemaining = parseInt(cols[13].innerText);
                    const nWLRemaining = parseInt(cols[16].innerText);

                    row.classList.add(GetClassTableItemClassName(nRemaining, nWLRemaining));
                }
            }
        }
    });
}

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
    ShowOpenAndClosedClasses();
}

if (document.readyState != "complete") {
    window.addEventListener("load", GTUI_Start);
} else {
    GTUI_Start();
}