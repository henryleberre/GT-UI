let browserHandle   = (typeof browser != 'undefined') ? browser : chrome;
let GetExtensionURL = browserHandle.runtime.getURL;

const CSS_FILENAMES = [
    "src/lib/bootstrap.min.css",
    "src/content/gtui.css"
];

const JAVASCRIPT_FILENAMES = [
    "src/lib/bootstrap.bundle.min.js"
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

    // Load Template (DOMPurify.sanitize required by Firefox for no reason)
    await ImportJavascriptModule("src/lib/purify.min.js");

    document.body.innerHTML = DOMPurify.sanitize(await LoadFileContents("src/content/gtui.html"));    

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
        return val == window.location.href
    });

    if (currentMenuLink != undefined)
        currentMenuLink.style.color = "#f2c83f";
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

        let menuDiv     = CreateChildOfType(pageContentElem, "div", "", "GTUI_GridNavMenu container-fluid", "");
        let cardRowElem = CreateChildOfType(menuDiv,         "div", "", "row row-cols-1 row-cols-md-3 g-4", "");

        for (let idx = 0; idx < menuTDs.length; idx++) {
            let cardColElem      = CreateChildOfType(cardRowElem,    "div", "", "col",                    "");
            let cardElem         = CreateChildOfType(cardColElem,    "div", "", "card h-100 border-dark", "");
            let cardHeaderElem   = CreateChildOfType(cardElem,       "div", "", "card-header text-light", "text-align: center; font-weight: bolder; background-color: #857437;");
            let cardBodyElem     = CreateChildOfType(cardElem,       "div", "", "card-body",              "");
            let cardBodyTextElem = CreateChildOfType(cardBodyElem,   "p",   "", "card-text",              "");
            let cardLink         = CreateChildOfType(cardHeaderElem, "a",   "", "btn btn-primary col-12", "");
            
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
                    let list = CreateChildOfType(cardBodyTextElem, "ul", "", "list-group list-group-flush", "");

                    for (let listElementText of descriptionTextRaw.split(';')) {
                        let listElement = CreateChildOfType(list, "li", "", "list-group-item", "");
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
        warningElem.classList.add("alert", "alert-warning");
        warningElem.setAttribute("role", "alert");


        GetElementsByTagNameForeach(warningElem, "a", (alertLink) => {
            alertLink.classList.add("alert-link");
        });
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
        tableElem.classList.add("table");

        let rows = Array.from(tableElem.getElementsByTagName("tr"));

        if (ShouldMakeTableHeaderDark(tableElem, rows.length)) { // If "Week at a glance"
            rows[0].classList.add("table-dark");
        }
    });
}

function GetClassRowClassName(nRemaining, nWLRemaining) {
    if (nRemaining > 0) {
        return "table-success";
    }

    if (nWLRemaining > 0) {
        return "table-warning";
    }

    return "table-danger";
}

function ShowOpenAndClosedClasses() {
    GetElementsByTagNameForeach(document, "table", (tableElem) => {
        let rows  = Array.from(tableElem.getElementsByTagName("tr"));
        let nRows = rows.length;

        if (nRows >= 2) {
            let nCols = Array.from(rows[1].getElementsByTagName("th")).length;

            rows[0].classList.add("table-dark");
            rows[1].classList.add("table-dark");

            if (nCols == 20) { // Is the case in "Lookup for classes"
                for (let row of rows.slice(2)) {
                    const cols = Array.from(row.getElementsByTagName("td"));

                    const nRemaining = parseInt(cols[13].innerText);
                    const nWLRemaining = parseInt(cols[16].innerText);

                    row.classList.add(GetClassRowClassName(nRemaining, nWLRemaining));
                }
            }
        }
    });
}

async function GTUI_Start(event) {
    await InsertTemplate();

    InsertLogoSRCs();
    TopNavMenuShowActiveTab();
    GenerateGridMenu();
    GenerateAlerts();
    RemoveBadHTML();
    PrettyTables();
    ShowOpenAndClosedClasses();
}

if (document.readyState != "complete") {
    window.addEventListener("load", GTUI_Start);
} else {
    GTUI_Start();
}