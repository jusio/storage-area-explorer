function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
};

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};

window.onload = function () {
    var inspectedWindow = chrome.devtools.inspectedWindow;
    var remoteId;
    var port = chrome.runtime.connect();
    var local;
    var sync;
    if (inspectedWindow.tabId) {
        return;
    }
    inspectedWindow.eval("chrome.runtime.id", function (obj, isError) {
        remoteId = obj;
        var fncString = injectedScript.toString().replace("APP_ID", chrome.runtime.id);

        inspectedWindow.eval("(" + fncString + ")()", function (result, isError) {
            if (isError) {
                dummyLog("Failed to connect")
            } else {
                local = new DelegatedStorageArea(port, remoteId, "local");
                sync = new DelegatedStorageArea(port, remoteId, "sync");
                area.get(function (values) {
                    var contents = document.getElementById("contents");
                    contents.innerHTML = "";
                    for (var i in values) {
                        contents.innerHTML += "<br>" + i + " = " + values;
                    }
                });
            }
        })


    });

};



var injectedScript = function () {
    var from = "APP_ID";
    chrome.storage.onChanged.addListener(function (changes, name) {


        console.log("changes", changes);
    });

    chrome.runtime.onMessageExternal.addListener(function (message, sender, response) {
        console.log("Receive message from " + sender.id + " expected from " + from);
        if (sender.id === from && message.target === chrome.runtime.id) {


            console.log("Message", message);

            var storage = chrome.storage[message.type];
            var method = storage[message.method];
            var args = [];
            if (message.args) {
                for (var i in message.args) {
                    args.push(message.args[i]);
                }
            }
            args.push(function () {
                var results = [];
                for (var i = 0; i < arguments.length; i++) {
                    results.push(arguments[i]);
                }
                console.log("Results", results);
                message.results = results;
                chrome.runtime.sendMessage(from, message);
            });

            method.apply(storage, args);

        }
    });
};

function DelegatedStorageArea(port, remoteId, type) {
    var self = this;
    var methodCallbacks = {};

    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    function guid() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    function createMethodDelegate(name) {
        return function () {
            var callback;
            var args = [];
            var message = {target: remoteId, type: type, args: args, method: name};
            for (var i = 0; i < arguments.length; i++) {
                var argument = arguments[i];
                if (typeof argument === 'function') {
                    if (callback) {
                        throw new Error("There is already callback");
                    }
                    callback = argument;
                    continue;
                }
                args.push(argument);
            }
            if (callback) {
                message.id = guid();
                methodCallbacks[message.id] = callback;
            }

            port.postMessage(message);
        }
    }

    port.onMessage.addListener(function (message) {
        if (message.from !== remoteId) {
            return;
        }

        var result = message.obj;
        if (result.type != type) {
            return;
        }
        var callback = methodCallbacks[result.id];
        if (!callback) {
            dummyLog("Can't find callback for id " + result.id);
        }
        delete methodCallbacks[result.id];
        callback.apply(null, result.results);
    });
    ["get", "set", "remove", "clear", "getBytesInUse"].forEach(function (val) {
        self[val] = createMethodDelegate(val);
    });
}


