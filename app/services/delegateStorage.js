angular.module("storageExplorer").factory('delegateStorage', function ($rootScope, $q) {

    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    function guid() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }


    function DelegatedStorageArea(connectionPromise, type) {
        var self = this;
        var methodCallbacks = {};
        var metaDeferred = $q.defer();
        var meta = metaDeferred.promise;
        $q.when(connectionPromise).then(function (connection) {
            connectionPromise = connection;
            connection.port.onMessage.addListener(function (message) {
                if (message.from !== connection.remoteId) {
                    return;
                }

                var result = message.obj;
                if (!result.id) {
                    return;
                }
                if (result.type != type) {
                    return;
                }
                if (metaDeferred) {
                    metaDeferred.resolve(result.meta);
                    metaDeferred = null;
                }
                if (result.meta) {
                    meta = result.meta;
                }

                var callback = methodCallbacks[result.id];
                if (!callback) {
                    return;
                }
                delete methodCallbacks[result.id];
                try {
                    callback.apply(null, result.results);
                } catch (e) {

                }
                $rootScope.$apply();
            })
        });

        function createMethodDelegate(name, connectionPromise) {

            return function () {
                var args = [];
                var callback;
                var message = {type: type, args: args, method: name};

                for (var i = 0; i < arguments.length; i++) {
                    var argument = arguments[i];
                    if (typeof argument === 'function') {
                        if (callback) {
                            throw new Error("There is already callback");
                        }
                        callback = argument;
                        continue;
                    }
                    args.push(argument);
                }
                if (callback) {
                    message.id = guid();
                    methodCallbacks[message.id] = callback;
                }
                $q.when(connectionPromise).then(function (connection) {
                    message.target = connection.remoteId;
                    connection.port.postMessage(message);
                });

            }
        }


        ["get", "set", "remove", "clear", "getBytesInUse"].forEach(function (val) {
            self[val] = createMethodDelegate(val, connectionPromise);
        });
        self.getMeta = function () {
            if (metaDeferred) {
                var deferred = $q.defer();
                $q.when(meta).then(function (meta) {
                    deferred.resolve(meta);
                });
                return deferred.promise;
            } else {
                return meta;
            }
        }
    }

    return function (connectionPromise, type) {
        return new DelegatedStorageArea(connectionPromise, type);
    }

});