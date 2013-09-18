angular.module("storageExplorer").factory("storage", function ($q, $rootScope, appContext, evalService, runtime, delegateStorage) {
    if (!chrome.devtools && chrome.storage) {
        var returnValue = {};
        function delegate(object, name) {
            return function () {
                var args = [];
                for (var i = 0; i < arguments.length; i++) {
                    if (angular.isFunction(arguments[i])) {
                        (function (callback) {
                            args.push(function (value) {
                                callback(value);
                                !$rootScope.$$phase && $rootScope.$apply();
                            });
                        })(arguments[i]);
                        continue;
                    }
                    args.push(arguments[i]);
                }
                object[name].apply(object, args);
            }
        }


        ['local', 'sync'].forEach(function (key) {
            var meta = {};
            var storageArea = chrome.storage[key];
            var delegatedStorage = {};
            returnValue[key] = delegatedStorage;
            Object.keys(storageArea).forEach(function (stKey) {
                if (angular.isFunction(storageArea[stKey])) {
                    if (stKey.indexOf("on") === 0) {
                        return;
                    }
                    delegatedStorage[stKey] = delegate(storageArea, stKey);
                    return;
                }
                meta[stKey] = storageArea[stKey];
            });
            delegatedStorage.getMeta = function () {
                return meta;
            };

        });
        chrome.storage.onChanged.addListener(function (changes, type) {
            $rootScope.$broadcast("$storageChanged", {changes: changes, type: type});
        });

        return returnValue;
    }

    var injectedScript = function (chrome) {
        var from = "APP_ID";


        var port = chrome.extension.connect(from);
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

        chrome.storage.onChanged.addListener(function (changes, name) {
            console.log("Storage changed, notifying port " + port.name);
            console.log(port.postMessage.toString());
            port.postMessage({change: true, changes: changes, type: name});
            console.log("Port notified");
        });
    };
    var port;
    var remoteId;
    var connectionDeferred = $q.defer();
    returnValue = {
        sync: delegateStorage(connectionDeferred.promise, "sync"),
        local: delegateStorage(connectionDeferred.promise, "local")
    };
    appContext()
        .then(function (appInfo) {

            remoteId = appInfo.id;
            port = runtime.connect({name: remoteId});
            port.onMessage.addListener(function (message) {
                if (message.from === remoteId && message.obj.change) {
                    $rootScope.$broadcast("$storageChanged", message.obj);
                    !$rootScope.$$phase && $rootScope.$apply();
                }
            });

            return evalService.evalFunction(injectedScript, {'APP_ID': runtime.id});
        }).then(function () {
            connectionDeferred.resolve({port: port, remoteId: remoteId});
            !$rootScope.$$phase && $rootScope.$apply();
        });


    return returnValue;
});