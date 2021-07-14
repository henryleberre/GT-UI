function GetBrowserHandle() {
    return (typeof browser != 'undefined') ? browser : chrome;
}

function GetExtensionURL(path) {
    return GetBrowserHandle().runtime.getURL(path);
}

function InsertTemplate() {
    return fetch(GetExtensionURL("src/content/gtui.html")).then(async (fetched) => {
        return fetched.text()
    }).then(async (templateSource) => {
        let pageBodyDivs = Array.from(document.getElementsByClassName("pagebodydiv"));
        if (pageBodyDivs.length != 0) {            
            let pageTitle = document.title;

            document.getElementsByTagName("html")[0].innerHTML    = templateSource;
            document.getElementById("GTUI_pageContent").innerHTML = pageBodyDivs[0].innerHTML;
            document.title = pageTitle + " (GT-UI)";
        }
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
        menuDiv.className = "container-fluid";
        menuDiv.className = "GTUI_GridNavMenu";

        let menuItemIdx = 0;
        let colCount    = 4;
        for (let rowIdx = 0; rowIdx <= Math.floor(menuData.length / colCount); rowIdx++) {
            let row = document.createElement("div");
            row.className = "row";

            for (let colIdx = 0; colIdx < colCount; colIdx++) {
                if (menuItemIdx < menuData.length) { // TODO: integrate this check into the loop
                    let col = document.createElement("div");
                    col.className = "col-xs-12 col-sm-6 col-md-4 col-lg-3 mt-3";
                    col.innerHTML += menuData[menuItemIdx];

                    let colDescDiv = col.getElementsByClassName("menulinkdesctext")[0];

                    // Transform the description into a <ul><li> list
                    if (colDescDiv != undefined) {
                        let descHTML = colDescDiv.innerHTML;
                        if (descHTML.includes(";")) {
                            let newDescHTML = "<ul>";
                            
                            for (let item of descHTML.split(";")) {
                                newDescHTML += "<li>" + item.trim() + "</li>";
                            }

                            newDescHTML += "</ul>";

                            descHTML = newDescHTML;
                        }

                        colDescDiv.innerHTML = descHTML;
                    }

                    for (let link of Array.from(col.getElementsByTagName("a"))) {
                        if (!window.location.href.endsWith("bmenu.P_MainMnu")) {
                            if (link.innerText == "") {
                                link.remove();
                            }
                        } else {
                            const bmenuP_MainMnuItemNames = ["Student Services & Financial Aid", "Personal Information", "Campus Services", "Admission", "Take A Survey"];

                            link.innerHTML = bmenuP_MainMnuItemNames[rowIdx * colCount + colIdx];
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

        document.getElementById("GTUI_pageContent").innerHTML = "";
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

window.addEventListener("load", GTUI_Start);