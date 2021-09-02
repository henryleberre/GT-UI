let browserHandle = (typeof browser != 'undefined') ? browser : chrome;

browserHandle.storage.sync.get("isOn", (result) => {
    if (result.isOn == undefined) {
        browserHandle.storage.sync.set({"isOn": true});
    }
});

function update_buttons() {
    browserHandle.storage.sync.get("isOn", (result) => {
        const GREEN = "bg-green-400";
        const RED   = "bg-red-400";
    
        if (result.isOn) {
            document.getElementById("btn_on").classList.add(GREEN);
            document.getElementById("btn_off").classList.remove(RED);
        } else {
            document.getElementById("btn_on").classList.remove(GREEN);
            document.getElementById("btn_off").classList.add(RED);
        }
    });
}

document.getElementById("btn_on").onclick  = (event) => { browserHandle.storage.sync.set({"isOn": true }); update_buttons(); };
document.getElementById("btn_off").onclick = (event) => { browserHandle.storage.sync.set({"isOn": false}); update_buttons(); };

update_buttons();