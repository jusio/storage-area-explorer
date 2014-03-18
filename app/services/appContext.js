angular.module("storageExplorer").factory("appContext", function ($q, $rootScope, evalService,devtools) {
    return function () {
        return evalService.evalFunction(function (chrome) {
            var storageTypes = [];
            var returnValue = {storageTypes: storageTypes};

            try {
                returnValue.id = chrome.runtime.id;

                var manifest = chrome.runtime.getManifest();
                returnValue.manifest = manifest;
                if (manifest.permissions.indexOf("storage") > -1 || manifest["optional_permissions"].indexOf("storage") > -1) {
                    storageTypes.push('local');
                    storageTypes.push('sync');
                    storageTypes.push('managed');
                }

            } catch (e) {
//                console.log("Error chrome api ", e);
            }
            try {
                if (window.localStorage) {
                    storageTypes.push('localStorage');
                }
                if (window.sessionStorage) {
                    storageTypes.push('sessionStorage')
                }

            } catch (e) {
//                console.log("Error storage api",e);
            }
//            console.log("Almost finished", returnValue);
            return returnValue;
        }).then(function (result) {
            var info = {
                id: result.id,
                manifest: result.manifest,
                tabId: devtools.inspectedWindow.tabId,
                storageTypes: result.storageTypes
            };
            if (result.manifest) {
                info.name = result.manifest.name;
            }

            return $q.when(info)
        }, $q.reject());
    }
});