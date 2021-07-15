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
    let browserHandle = GetBrowserHandle();

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
        let menuData = [];

        for (td of mpts[0].getElementsByTagName("td")) {
            if (Array.from(td.getElementsByTagName("a")).length > 0) {
                if (td.innerText != "") {
                    let elemHTML = td.innerHTML.replace(/&nbsp;/g,'');

                    menuData.push(elemHTML);
                }
            }
        }

        let menuDiv = document.createElement("div");
        menuDiv.className = "GTUI_GridNavMenu container-fluid";

        let menuItemIdx = 0;
        let colCount    = 4;
        for (let rowIdx = 0; rowIdx <= Math.floor(menuData.length / colCount); rowIdx++) {
            let row = document.createElement("div");
            row.className = "row";

            for (let colIdx = 0; colIdx < colCount; colIdx++) {
                if (menuItemIdx < menuData.length) { // TODO: integrate this check into the loop
                    let col = document.createElement("div");
                    col.className = "col-xs-12 col-sm-6 col-md-4 col-lg-3 mt-3";
                    col.innerHTML += DOMPurify.sanitize(menuData[menuItemIdx]);

                    let colDescDiv = col.getElementsByClassName("menulinkdesctext")[0];

                    // Transform the description into a <ul><li> list
                    if (colDescDiv != undefined) {
                        if (colDescDiv.innerHTML.includes(";")) {
                            let ul = document.createElement("ul");
                            
                            for (let item of colDescDiv.innerHTML.split(";")) {
                                let li = document.createElement("li");
                                li.innerText = item.trim();
                                
                                ul.appendChild(li);
                            }

                            colDescDiv.appendChild(ul);
                        }
                    }

                    for (let link of Array.from(col.getElementsByTagName("a"))) {
                        if (!window.location.href.endsWith("bmenu.P_MainMnu")) {
                            if (link.innerText.trim().length == 0) {
                                link.remove();
                            }
                        } else {
                            link.innerText = [
                                "Student Services & Financial Aid",
                                "Personal Information",
                                "Campus Services",
                                "Admission",
                                "Take A Survey"
                            ][rowIdx * colCount + colIdx];
                        }
                    }

                    let mainLink = col.getElementsByTagName("a")[0];
                    
                    if (mainLink != undefined) {
                        mainLink.className = "btn btn-primary btn-block";
                    }
                    row.appendChild(col);
                }

                menuItemIdx++;
            }

            menuDiv.appendChild(row);
        }

        let GTUI_pageContentElem = document.getElementById("GTUI_pageContent");

        while (GTUI_pageContentElem.hasChildNodes()) {
            GTUI_pageContentElem.removeChild(GTUI_pageContentElem.firstChild);
        }

        document.getElementById("GTUI_pageContent").appendChild(menuDiv);
    }
}

async function GTUI_Start(event) {
    InsertTemplate().then(() => {
        InsertLogoSRCs();
        TopNavMenuShowActiveTab();
        GenerateGridMenu();
    });
}

if (document.readyState != "complete") {
    window.addEventListener("load", GTUI_Start);
} else {
    GTUI_Start();
}