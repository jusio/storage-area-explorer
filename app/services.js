angular.module("storageExplorer").factory("storage", function ($q, $rootScope) {
    var deferred = $q.defer();
    var injectedScript = function () {
        var from = "APP_ID";
        chrome.storage.onChanged.addListener(function (changes, name) {
            chrome.runtime.sendMessage(from,{change: true, changes: changes, type: name});
        });

        chrome.runtime.onMessageExternal.addListener(function (message, sender, response) {
            if (sender.id === from && message.target === chrome.runtime.id) {
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
                    message.results = results;
                    chrome.runtime.sendMessage(from, message);
                });
                message.meta = {};
                for(var j in storage) {
                    if(typeof storage[j] === 'function') {
                        continue;
                    }
                    message.meta[j] = storage[j];
                }
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
            if (!result.id) {
                return;
            }
            if (result.type != type) {
                return;
            }
            angular.forEach(result.meta,function(val,key){
               self[key] = val;
            });

            var callback = methodCallbacks[result.id];
            if (!callback) {
                dummyLog("Can't find callback for id " + result.id);
                return;
            }
            delete methodCallbacks[result.id];
            try {
                callback.apply(null, result.results);
            } catch (e) {

            }
            $rootScope.$apply();

        });
        ["get", "set", "remove", "clear", "getBytesInUse"].forEach(function (val) {
            self[val] = createMethodDelegate(val);
        });
    }


    var inspectedWindow = chrome.devtools.inspectedWindow;
    dummyLog("Created inspected window");
    var remoteId;
    var port = chrome.runtime.connect();
    port.onMessage.addListener(function (message) {
        dummyLog("Received change " + angular.toJson(message));
        if (message.from === remoteId && message.obj.change) {
            dummyLog("Broadcasting change");
            $rootScope.$broadcast("$storageChanged", message.obj);
            $rootScope.$apply();
            dummyLog("Broadcasting complete");

        }
    });
    dummyLog("Connected to the port");
    var local;
    var sync;
    inspectedWindow.eval("chrome.runtime.id", function (obj, isError) {
        remoteId = obj;
        var fncString = injectedScript.toString().replace("APP_ID", chrome.runtime.id);
        dummyLog("Obtained remoteId " + remoteId);
        inspectedWindow.eval("(" + fncString + ")()", function (result, isError) {
            if (isError) {
                dummyLog("Failed to connect")
            } else {
                dummyLog("Createting areas");
                try {
                    local = new DelegatedStorageArea(port, remoteId, "local");
                    sync = new DelegatedStorageArea(port, remoteId, "sync");
                    deferred.resolve({local: local, sync: sync});
                    $rootScope.$apply();
                } catch (e) {
                    dummyLog(e);
                }
            }
        })

    });
    return deferred.promise;
});


function dummyLog(message) {

//    var elementById = document.getElementById("display");
//    elementById.innerHTML += "<br>";
//    elementById.innerText += message;
}