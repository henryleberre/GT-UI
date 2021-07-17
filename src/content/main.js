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
        menuDiv.className = "GTUI_GridNavMenu container-fluid";

        let cardRowElem = document.createElement("div");
        cardRowElem.className = "row row-cols-1 row-cols-md-3 g-4";

        menuDiv.appendChild(cardRowElem);

        for (let idx = 0; idx < menuTDs.length; idx++) {
            let cardColElem = document.createElement("div");
            cardColElem.className = "col";

            // Create DOM elements
            let cardElem = document.createElement("div");
            cardElem.className = "card h-100 border-dark";

            let cardHeaderElem = document.createElement("div");
            cardHeaderElem.className = "card-header text-light";
            cardHeaderElem.style.textAlign = "center";
            cardHeaderElem.style.fontWeight = "bolder";
            cardHeaderElem.style.backgroundColor = "#857437";

            let cardBodyElem = document.createElement("div");
            cardBodyElem.className = "card-body";

            let cardBodyTextElem = document.createElement("p");
            cardBodyTextElem.className = "card-text";

            let cardLink = document.createElement("a");
            cardLink.className = "btn btn-primary col-12";
            cardLink.innerText = "Visit";

            // Fill DOM elements
            {
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
            }

            for (let menuLinkDescText of menuTDs[idx].getElementsByClassName("menulinkdesctext")) {
                cardBodyTextElem.appendChild(menuLinkDescText);
            }

            cardLink.href = menuTDs[idx].getElementsByTagName("a")[0].href;

            // Add to DOM
            cardBodyElem.appendChild(cardBodyTextElem);

            cardHeaderElem.appendChild(cardLink);
            cardElem.appendChild(cardHeaderElem);
            cardElem.appendChild(cardBodyElem);

            cardColElem.appendChild(cardElem);

            cardRowElem.appendChild(cardColElem);
            
            //let colDescDiv = col.getElementsByClassName("menulinkdesctext")[0];
//
            //// Transform the description into a <ul><li> list
            //if (colDescDiv != undefined) {
            //    if (colDescDiv.innerHTML.includes(";")) {
            //        let ul = document.createElement("ul");
            //                
            //        for (let item of colDescDiv.innerHTML.split(";")) {
            //            let li = document.createElement("li");
            //            li.innerText = item.trim();
            //                    
            //            ul.appendChild(li);
            //        }
//
            //        colDescDiv.appendChild(ul);
            //    }
            //}
        }

        let GTUI_pageContentElem = document.getElementById("GTUI_pageContent");

        GTUI_pageContentElem.removeChild(mpts[0]);

        document.getElementById("GTUI_pageContent").appendChild(menuDiv);
    }
}

function GenerateAlerts() {
    for (let e of document.getElementsByClassName("infotextdiv")) {
        e.className += " alert alert-warning";
        e.setAttribute("role", "alert");

        for (let e2 of e.getElementsByTagName("a")) {
            e2.className += " alert-link";
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
        table.className += " table";
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
        let rows = table.getElementsByTagName("tr");
        if (Array.from(rows).length < 2) {
            continue;
        }

        let nCols = Array.from(rows[1].getElementsByTagName("th")).length;

        rows[0].classList.add("table-dark");
        rows[1].classList.add("table-dark");

        if (nCols == 20) { // Is the case in "Lookup for classes"
            for (let row of Array.from(rows).slice(2)) {
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