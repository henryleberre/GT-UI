window.addEventListener("load", async (event) => {    
    // Get Template Page
    const templateSRC = await (await (await fetch(chrome.runtime.getURL("page_template.html"))).text());

    // Copy the page's content into the template and make it the current DOM
    let bodySRC = document.getElementsByClassName("pagebodydiv")[0].innerHTML;
    document.getElementsByTagName("html")[0].innerHTML = templateSRC;
    document.getElementById("GTUI_pageContent").innerHTML = bodySRC;

    // Insert Logo
    document.getElementById("GTUI_gtLogo").src = chrome.runtime.getURL("gt-logo.svg");

    // Make Prettier Menus
    let mpts = document.getElementsByClassName("menuplaintable");
    if (mpts.length > 0) {
        let menuData = [];

        for (td of mpts[0].getElementsByTagName("td")) {
            if (Array.from(td.getElementsByTagName("a")).length > 0) {
                if (td.innerText != "") {
                    menuData.push(td.innerHTML);
                }
            }
        }

        let menuDiv = document.createElement("div");
        menuDiv.className = "container-fluid";

        let menuItemIdx = 0;
        let colCount    = 4;
        for (let rowIdx = 0; rowIdx <= Math.floor(menuData.length / colCount); rowIdx++) {
            let row = document.createElement("div");
            row.className = "row";

            if (rowIdx > 0) {
                row.className += " mt-3";
            }

            for (let colIdx = 0; colIdx < colCount; colIdx++) {
                if (menuItemIdx < menuData.length) { // TODO: integrate this check into the loop
                    let col = document.createElement("div");
                    col.className = "col-xs-12 col-sm-6 col-md-4 col-lg-3";
                    col.innerHTML += menuData[menuItemIdx].replace(/&nbsp;/g,'');

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