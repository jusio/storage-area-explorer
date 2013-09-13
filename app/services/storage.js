angular.module("storageExplorer").factory("storage", function ($q, $rootScope, appContext, evalService, runtime, delegateStorage) {
    //TODO find some other way to define this script
    var injectedScript = function (chrome) {
        var from = "APP_ID";
        chrome.storage.onChanged.addListener(function (changes, name) {
            chrome.runtime.sendMessage(from, {change: true, changes: changes, type: name});
        });

        chrome.runtime.onMessageExternal.addListener(function (message, sender) {
            if (sender.id === from && message.target === chrome.runtime.id) {
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
                    chrome.runtime.sendMessage(from, message);
                });
                message.meta = {};
                for (var j in storage) {
                    if (typeof storage[j] === 'function') {
                        continue;
                    }
                    message.meta[j] = storage[j];
                }
                method.apply(storage, args);
            }
        });
    };
    var port;
    var remoteId;
    var connectionDeferred = $q.defer();
    var returnValue = {
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