angular.module("storageExplorer", []).
    value("extension", chrome.extension)
    .value("runtime", chrome.runtime)
    .value("devtools", chrome.devtools);


function dummyLog(message) {

//    var elementById = document.getElementById("display");
//    elementById.innerHTML += "<br>";
//    elementById.innerText += message;
}