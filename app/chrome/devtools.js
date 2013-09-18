function initializeDevtoolsPage(panels, inspectedWindow) {


    inspectedWindow.eval("!!chrome.runtime && chrome.runtime.getManifest()", function (manifest) {
        if (!!manifest.permissions && manifest.permissions.indexOf("storage") > -1) {
            panels.create(
                "Storage Explorer",
                "img/angular.png",
                "/app/html/panel.html");
        }
    });
}
if (chrome.devtools && chrome.devtools.panels && chrome.devtools.inspectedWindow) {
    initializeDevtoolsPage(chrome.devtools.panels, chrome.devtools.inspectedWindow);
}

