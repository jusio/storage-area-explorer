angular.module("storageExplorer", []).
    value("extension", chrome.extension)
    .value("runtime", chrome.runtime)
    .value("devtools", chrome.devtools).run(function($rootScope,$window,devtools){
        $rootScope.reload = function(){
            devtools.inspectedWindow.reload();
            $window.location.reload();

        }
    });

