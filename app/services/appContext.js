angular.module("storageExplorer").factory("appContext", function ($q, $rootScope) {
    var appDeferred = $q.defer();
    var appInfo = appDeferred.promise;
    if (!chrome.devtools) {
        return function () {
            return $q.defer().promise
        }
    }


    var inspectedWindow = chrome.devtools.inspectedWindow;
    inspectedWindow.eval('(function(){console.log(chrome.runtime.getManifest()); return {id:chrome.runtime.id, manifest:chrome.runtime.getManifest()};})()', function (result, isError) {
        if (result && !isError) {
            var info = {
                id: result.id,
                name: result.manifest.name,
                manifest: result.manifest
            };
            appDeferred.resolve(info);
            appDeferred = null;
            appInfo = info;

        } else {
            appDeferred.reject();
            appDeferred = null;
            appInfo = {id: "unknown", name: "unknown", manifest: {}};
        }
        $rootScope.$apply();
    });

    return function () {
        var deferred = $q.defer();
        if (appInfo) {
            $q.when(appInfo).then(function (result) {
                deferred.resolve(result);
            });
        }
        return deferred.promise;
    }
});