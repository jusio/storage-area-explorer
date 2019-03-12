console.timeEnd('total')
angular.module("storageExplorer", []).
    value("extension", chrome.extension)
    .value("runtime", chrome.runtime)
    .value("devtools", chrome.devtools).run(function ($rootScope, $window, devtools) {
        $rootScope.reload = function () {
            if (!angular.isUndefined(devtools.inspectedWindow.tabId)) {
                devtools.inspectedWindow.reload();
            }
            $window.location.reload();

        }
    });

