angular.module("storageExplorer", []).
    value("extension", chrome.extension)
    .value("runtime", chrome.runtime)
    .value("devtools", chrome.devtools).run(function($rootScope,$window){
        $rootScope.reload = function(){
            $window.location.reload();
        }
    });

