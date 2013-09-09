var panels = chrome.devtools.panels;
if (!chrome.devtools.inspectedWindow.tabId) {

    chrome.devtools.inspectedWindow.eval("!!chrome.storage", function (res) {
        if (res) {
            panels.create(
                "Storage Explorer",
                "img/angular.png",
                "/app/html/panel.html"
            );
        }
    });

}