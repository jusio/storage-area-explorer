function initializeDevtoolsPage(panels) {
    panels.create(
        "Storage Explorer",
        "img/angular.png",
        "/app/html/panel.html");

}
if (chrome.devtools && chrome.devtools.panels) {
    initializeDevtoolsPage(chrome.devtools.panels);
}

