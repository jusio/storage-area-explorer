angular.module("storageExplorer", []).
    value("extension", chrome.extension)
    .value("runtime", chrome.runtime)
    .value("devtools", chrome.devtools);

