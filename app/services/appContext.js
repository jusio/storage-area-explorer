angular.module("storageExplorer").factory("appContext", function ($q, $rootScope) {
    var appDeferred = $q.defer();
    var appInfo = appDeferred.promise;


    var port = chrome.runtime.connect();

    port.onMessage.addListener(function (result) {
        if (result.name) {
            appDeferred.resolve(result);
            appDeferred = null;
            appInfo = result;
            port.disconnect();
        }
    });

    var inspectedWindow = chrome.devtools.inspectedWindow;
    inspectedWindow.eval('chrome.runtime.id', function (id, isError) {
        if (id && !isError) {
            port.postMessage({appId: id});
        } else {
        }
    });

    return function () {
        var deferred = $q.defer();
        if(appInfo) {
            $q.when(appInfo).then(function (result) {
                deferred.resolve(result);
            });
        }
        return deferred.promise;
    }
});