angular.module("storageExplorer").value("targetPageInject", function (chrome) {
    var from = "APP_ID";
    var port = chrome.runtime.connect(from);
    port.onMessage.addListener(function (message) {
        if (message.target !== chrome.runtime.id || !message.type) {
            return;
        }
        var storage = chrome.storage[message.type];
        var method = storage[message.method];
        var args = [];
        if (message.args) {
            message.args.forEach(function (arg) {
                args.push(arg);
            });
        }
        args.push(function () {
            var results = [];
            for (var i = 0; i < arguments.length; i++) {
                results.push(arguments[i]);
            }
            message.results = results;
            port.postMessage(message);
        });
        message.meta = {};
        Object.keys(storage).forEach(function (key) {
            if (typeof storage[key] === 'function') {
                return;
            }
            message.meta[key] = storage[key];
        });
        method.apply(storage, args);
    });

    port.onDisconnect.addListener(function () {
        chrome.storage.onChanged.removeListener(storageListener);
    });

    var storageListener = function (changes, name) {
        port.postMessage({change: true, changes: changes, type: name});
    };
    chrome.storage.onChanged.addListener(storageListener);
});