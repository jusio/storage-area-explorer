angular.module("storageExplorer").service("clipboard", function ($q, $rootScope) {

    this.put = function (value) {
        var deferred = $q.defer();
        chrome.runtime.sendMessage({action: 'copy', params: [value]}, function () {
            deferred.resolve();
            $rootScope.$apply();
        });
        return deferred.promise;
    };

    this.get = function () {
        var deferred = $q.defer();
        chrome.runtime.sendMessage({action: 'paste'}, function (text) {
            deferred.resolve(text);
            $rootScope.$apply();
        });
        return deferred.promise;
    };

});