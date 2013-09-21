angular.module("storageExplorer").factory("appContext", function ($q, $rootScope, evalService) {
    return function () {
        return evalService.evalFunction(function (chrome) {
            var manifest = chrome.runtime.getManifest();
            if (manifest.permissions.indexOf("storage") === -1 && manifest["optional_permissions"].indexOf("storage") === -1) {
                throw new Error();
            }
            return {id: chrome.runtime.id, manifest: manifest};
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