
function initializeDevtoolsPage(panels, inspectedWindow) {
    inspectedWindow.eval("!!chrome.storage", function (res) {
        if (res) {
            panels.create(
                "Storage Explorer",
                "img/angular.png",
                "/app/html/panel.html"
            );
        }
    });
}
initializeDevtoolsPage(chrome.devtools.panels, chrome.devtools.inspectedWindow);

