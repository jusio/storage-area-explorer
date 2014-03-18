angular.module("storageExplorer").factory("storage", function ($q, $rootScope, appContext, evalService, runtime, delegateStorage, targetPageInject, extensionPageInject) {
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


        ['local', 'sync', 'localStorage', 'sessionStorage'].forEach(function (key) {
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
        local: delegateStorage(connectionDeferred.promise, "local"),
        managed: delegateStorage(connectionDeferred.promise, "managed"),
        localStorage: delegateStorage(connectionDeferred.promise, "localStorage"),
        sessionStorage: delegateStorage(connectionDeferred.promise, "sessionStorage")
    };
    appContext()
        .then(function (appInfo) {
            var connection = {};
            var remoteId;
            if (appInfo.id) {
                connection.appId = appInfo.id;
                remoteId = appInfo.id;
            }
            if (appInfo.tabId) {
                connection.tabId = appInfo.tabId;
            }
            if (!appInfo.id && appInfo.tabId) {
                remoteId = "for_tab_" + appInfo.tabId;
            }


            port = runtime.connect({name: remoteId});
            connection.port = port;
            port.onMessage.addListener(function (message) {


                if (message == "portConnected") {
                    if (appInfo.id && appInfo.tabId) {
                        evalService.evalFunction(extensionPageInject, {'APP_ID': runtime.id}).then(function () {
                            connectionDeferred.resolve(connection);
                        });
                    } else if (appInfo.id) {
                        evalService.evalFunction(targetPageInject, {'APP_ID': runtime.id}).then(function () {
                            connectionDeferred.resolve(connection);
                        });
                    } else {
                        connectionDeferred.resolve(connection)
                    }
                } else if (message.from.app == appInfo.id && message.from.tab == appInfo.tabId && message.obj.change) {
                    $rootScope.$broadcast("$storageChanged", message.obj);
                }
                !$rootScope.$$phase && $rootScope.$apply();

            });
            port.onDisconnect.addListener(function () {
                window.location.reload();
            });

        });


    return returnValue;
});