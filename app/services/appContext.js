angular.module("storageExplorer").factory("appContext", function ($q, $rootScope, evalService) {
    var appDeferred = $q.defer();
    var appInfo = appDeferred.promise;
    evalService.evalFunction(function () {
        return {id: chrome.runtime.id, manifest: chrome.runtime.getManifest()};
    }).then(function (result) {
            var info = {
                id: result.id,
                name: result.manifest.name,
                manifest: result.manifest
            };
            appDeferred.resolve(info);
            appDeferred = null;
            appInfo = info;

        }, function () {
            appDeferred.reject();
            appDeferred = null;
            appInfo = null;
        });


    return function () {
        var deferred = $q.defer();
        if (appInfo) {
            $q.when(appInfo).then(function (result) {
                deferred.resolve(result);
            }, function () {
                deferred.reject();
            });
        } else {
            deferred.reject();
        }
        return deferred.promise;
    }
});