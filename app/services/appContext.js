angular.module("storageExplorer").factory("appContext", function ($q, $rootScope, evalService) {
    return function () {
        return evalService.evalFunction(function (chrome) {
            return {id: chrome.runtime.id, manifest: chrome.runtime.getManifest()};
        }).then(function (result) {
                var info = {
                    id: result.id,
                    name: result.manifest.name,
                    manifest: result.manifest
                };
                return $q.when(info)
            }, function () {
                return $q.reject();
            });
    }
});