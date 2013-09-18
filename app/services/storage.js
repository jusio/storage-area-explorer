angular.module("storageExplorer").factory("storage", function ($q, $rootScope, appContext, evalService, runtime, delegateStorage, targetPageInject) {
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
                }
                if (message == "portConnected") {
                    evalService.evalFunction(targetPageInject, {'APP_ID': runtime.id}).then(function () {
                        connectionDeferred.resolve({port: port, remoteId: remoteId});
                    });
                }
                !$rootScope.$$phase && $rootScope.$apply();

            });
            port.onDisconnect.addListener(function () {
                window.location.reload();
            });

        });


    return returnValue;
});