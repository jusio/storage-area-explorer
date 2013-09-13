angular.module("storageExplorer").service("evalService", function (devtools, $q, $rootScope) {

    this.evalFunction = function (closure) {
        var deferred = $q.defer();

        devtools.inspectedWindow.eval("(" + closure + ")()", function (value, isError) {
            if (isError) {
                deferred.reject(value);
            } else {
                deferred.resolve(value)
            }
            $rootScope.$apply();
        });

        return deferred.promise;

    };


});