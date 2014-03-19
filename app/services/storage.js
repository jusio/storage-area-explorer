angular.module("storageExplorer").factory("storage", function ($q, $rootScope, appContext, evalService, runtime, delegateStorage, targetPageInject, extensionPageInject) {
    var port;
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
            if(appInfo.id && appInfo.tabId){
                remoteId = appInfo.id + "_" + appInfo.tabId;
            }


            port = runtime.connect({name: remoteId});
            connection.port = port;
            port.onMessage.addListener(function (message) {


                if (message == "portConnected") {
                    if (appInfo.id) {
                        evalService.evalFunction(extensionPageInject, {'APP_ID': runtime.id}).then(function () {
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