window.addEventListener("load", async (event) => {    
    // Get Template Page
    let browserHandle = (typeof browser != 'undefined') ? browser : chrome;

    const templateSRC = await (await (await fetch(browserHandle.runtime.getURL("page_template.html"))).text());

    // Copy the page's content into the template and make it the current DOM
    let bodySRC = document.getElementsByClassName("pagebodydiv")[0].innerHTML;
    document.getElementsByTagName("html")[0].innerHTML = templateSRC;
    document.getElementById("GTUI_pageContent").innerHTML = bodySRC;

    // Insert Logos
    document.getElementById("GTUI_gtLogo").src = browserHandle.runtime.getURL("gt-logo.svg");
    document.getElementById("GTUI_githubLogo").src = browserHandle.runtime.getURL("github-logo.svg");

    // Top Menu: Show active page/menu item
    let topMenuLinks = document.getElementById("GTUI_navbar_menu").getElementsByTagName("a");
    let topMenuGetParams = ["P_GenMnu", "P_MainCSMnu", "P_StuMainMnu", "P_AdmMnu"];

    let paramIdx = 0;
    for (let param of topMenuGetParams) {
        if (window.location.href.endsWith(param)) {
            topMenuLinks[paramIdx].style.color = "#f2c83f";
            break;
        }
        paramIdx++;
    }

    // Make Prettier Menus
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
                        if (link.innerText == "") {
                            link.remove();
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
});