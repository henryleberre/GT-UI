function GetBrowserHandle() {
    return (typeof browser != 'undefined') ? browser : chrome;
}

function GetExtensionURL(path) {
    return GetBrowserHandle().runtime.getURL(path);
}

function InsertTemplate() {
    // Remove all stylesheets from OSCAR

    for (let lnk of document.head.getElementsByTagName("link")) {
        if (lnk.rel == "stylesheet") {
            document.head.removeChild(lnk);
        }
    }

    // Add stylesheets & JS
    const stylesheets = [
        "src/lib/bootstrap.min.css",
        "src/content/gtui.css"
    ];

    for (let stylesheet of stylesheets) {
        let lnk = document.createElement("link");
        lnk.href = GetExtensionURL(stylesheet);
        lnk.rel  = "stylesheet";

        document.head.appendChild(lnk);
    }

    const scripts = [
        "src/lib/bootstrap.bundle.min.js"
    ];

    for (let script of scripts) {
        let elem  = document.createElement("script");
        elem.src  = GetExtensionURL(script);
        elem.type = "text/javascript";
        document.head.appendChild(elem);
    }

    return fetch(GetExtensionURL("src/content/gtui.html")).then(async (fetched) => {
        return fetched.text();
    }).then(async (templateSource) => {
        return import(GetExtensionURL("src/lib/purify.min.js")).then(() => {
            let pageBodyDivs = Array.from(document.getElementsByClassName("pagebodydiv"));
            if (pageBodyDivs.length != 0) {         
                let pageContentNodes = [];
                for (let e of pageBodyDivs[0].childNodes) {
                    pageContentNodes.push(e.cloneNode(true));
                }
                
                let pageTitle = document.title;

                // The use of DOMPurify isn't justified but it was requested by Firefox
                // since I am loading my own (local) code.
                document.body.innerHTML = DOMPurify.sanitize(templateSource);

                let GTUI_pageContentElem = document.getElementById("GTUI_pageContent");
                for (let e of pageContentNodes) {
                    GTUI_pageContentElem.appendChild(e);
                }

                document.title = pageTitle + " (GT-UI)";
            }
        });
    });
}

function InsertLogoSRCs() {
    document.getElementById("GTUI_gtLogo").src     = GetExtensionURL("src/content/gt-logo.svg");
    document.getElementById("GTUI_githubLogo").src = GetExtensionURL("src/content/github-logo.svg");
}

function TopNavMenuShowActiveTab() {
    let domLinks = document.getElementById("GTUI_navbar_menu").getElementsByTagName("a");
    let menuIds  = ["P_GenMnu", "P_MainCSMnu", "P_StuMainMnu", "P_AdmMnu"];

    for (let i = 0; i < menuIds.length; ++i) {
        if (window.location.href.endsWith(menuIds[i])) {
            domLinks[i].style.color = "#f2c83f";
            break;
        }
    }
}

function GenerateGridMenu() {
    let mpts = document.getElementsByClassName("menuplaintable");
    if (mpts.length > 0) {
        let menuTDs = [];

        for (td of mpts[0].getElementsByTagName("td")) {
            if (Array.from(td.getElementsByTagName("a")).length > 0) {
                if (td.innerText != "") {
                    td.innerHTML = td.innerHTML.replace(/&nbsp;/g,'');

                    menuTDs.push(td);
                }
            }
        }

        let menuDiv = document.createElement("div");
        menuDiv.classList.add("GTUI_GridNavMenu", "container-fluid");

        let cardRowElem = document.createElement("div");
        cardRowElem.classList.add("row", "row-cols-1", "row-cols-md-3", "g-4");

        menuDiv.appendChild(cardRowElem);

        for (let idx = 0; idx < menuTDs.length; idx++) {
            let cardColElem = document.createElement("div");
            cardColElem.classList.add("col");

            // Create DOM elements
            let cardElem = document.createElement("div");
            cardElem.classList.add("card", "h-100", "border-dark");

            let cardHeaderElem = document.createElement("div");
            cardHeaderElem.className = "card-header text-light";
            cardHeaderElem.style.textAlign = "center";
            cardHeaderElem.style.fontWeight = "bolder";
            cardHeaderElem.style.backgroundColor = "#857437";

            let cardBodyElem = document.createElement("div");
            cardBodyElem.classList.add("card-body");

            let cardBodyTextElem = document.createElement("p");
            cardBodyTextElem.classList.add("card-text");

            let cardLink = document.createElement("a");
            cardLink.classList.add("btn", "btn-primary", "col-12");
            cardLink.innerText = "Visit";

            // Fill DOM elements
            { // Link
                for (let link of Array.from(menuTDs[idx].getElementsByTagName("a"))) {
                    if (!window.location.href.endsWith("bmenu.P_MainMnu")) {
                        if (link.innerText.trim().length == 0) {
                            link.remove();
                        } else {
                            cardLink.innerText = link.innerText;
                            break;
                        }
                    } else {
                        cardLink.innerText = [
                            "Student Services & Financial Aid",
                            "Personal Information",
                            "Campus Services",
                            "Admission",
                            "Take A Survey"
                        ][idx];
                        break;
                    }
                }
    
                cardLink.href = menuTDs[idx].getElementsByTagName("a")[0].href;
            }

            { // Description
                // Get Card's Description
                let descriptionTextRaw = "";
                for (let menuLinkDescText of menuTDs[idx].getElementsByClassName("menulinkdesctext")) {
                    descriptionTextRaw += menuLinkDescText.innerText;
                }

                if (descriptionTextRaw.includes(';')) {
                    // Turn lists (of ";" seperated values) into actual <ul><li> ones
                    let list = document.createElement("ul");
                    list.classList.add("list-group");
                    list.classList.add("list-group-flush");

                    for (let listElementText of descriptionTextRaw.split(';')) {
                        let listElement = document.createElement("li");
                        listElement.classList.add("list-group-item");
                        listElement.innerText = listElementText;

                        list.appendChild(listElement);
                    }

                    cardBodyTextElem.appendChild(list);
                } else {
                    // Otherwise, simply paste the description text
                    cardBodyTextElem.innerText = descriptionTextRaw;
                }
            }

            // Add to DOM
            cardBodyElem.appendChild(cardBodyTextElem);

            cardHeaderElem.appendChild(cardLink);
            cardElem.appendChild(cardHeaderElem);
            cardElem.appendChild(cardBodyElem);

            cardColElem.appendChild(cardElem);

            cardRowElem.appendChild(cardColElem);
        }

        let GTUI_pageContentElem = document.getElementById("GTUI_pageContent");

        GTUI_pageContentElem.removeChild(mpts[0]);

        document.getElementById("GTUI_pageContent").appendChild(menuDiv);
    }
}

function GenerateAlerts() {
    for (let e of document.getElementsByClassName("infotextdiv")) {
        e.classList.add("alert", "alert-warning");
        e.setAttribute("role", "alert");

        for (let e2 of e.getElementsByTagName("a")) {
            e2.classList.add("alert-link");
        }
    }
}

function RemoveBadHTML() {
    for (let e of document.querySelectorAll("a.skiplinks")) {
        if (e.innerText == "Skip to top of page") {
            e.remove();
        }
    }
}

function PrettyTables() {
    for (let table of document.getElementsByTagName("table")) {
        table.classList.add("table");

        let rows = Array.from(table.getElementsByTagName("tr"));

        if (rows.length >= 1 && window.location.href.endsWith("bprod/bwskfshd.P_CrseSchd")) { // If "Week at a glance"
            rows[0].classList.add("table-dark");
        }
    }
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
    for (let table of document.getElementsByTagName("table")) {
        let rows  = Array.from(table.getElementsByTagName("tr"));
        let nRows = rows.length;

        if (nRows < 2) {
            continue;
        }

        let nCols = Array.from(rows[1].getElementsByTagName("th")).length;

        rows[0].classList.add("table-dark");
        rows[1].classList.add("table-dark");

        if (nCols == 20) { // Is the case in "Lookup for classes"
            for (let row of rows.slice(2)) {
                const cols = Array.from(row.getElementsByTagName("td"));

                const nRemaining   = parseInt(cols[13].innerText);
                const nWLRemaining = parseInt(cols[16].innerText);
                
                row.classList.add(GetClassRowClassName(nRemaining, nWLRemaining));
            }
        }
    }
}

async function GTUI_Start(event) {
    InsertTemplate().then(() => {
        InsertLogoSRCs();
        TopNavMenuShowActiveTab();
        GenerateGridMenu();
        GenerateAlerts();
        RemoveBadHTML();
        PrettyTables();
        ShowOpenAndClosedClasses();
    });
}

if (document.readyState != "complete") {
    window.addEventListener("load", GTUI_Start);
} else {
    GTUI_Start();
}