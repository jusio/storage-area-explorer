angular.module("storageExplorer").service("evalService", function (devtools, $q, $rootScope) {

    this.evalFunction = function (closure, parameters) {
        var deferred = $q.defer();

        var closureString = closure.toString();
        if (parameters) {
            Object.keys(parameters).forEach(function (key) {
                closureString = closureString.replace(key, parameters[key]);
            });
        }

        devtools.inspectedWindow.eval("(" + closureString + ")(chrome)", function (value, isError) {
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