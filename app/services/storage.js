angular.module("storageExplorer").factory("storage", function ($q, $rootScope) {
    if (!chrome.devtools) {
        //no devtools context
        //let's fake the service
        var fakeReturn = {sync: {}, local: {}};

        ["get", "set", "remove", "clear", "getBytesInUse", "getMeta"].forEach(function (method) {
            angular.forEach(fakeReturn, function (obj) {
                obj[method] = function () {
                };
                if (method === 'get') {
                    obj[method] = function () {
                        for (var i = 0; i < arguments.length; i++) {
                            if (angular.isFunction(arguments[i])) {
                                arguments[i]({
                                    "value with very long key 1": "val1",
                                    "val2": "val2",
                                    "objVal": {
                                        test: {
                                            arr: []
                                        },
                                        fullArr: ["asd", false, null, 1,{}],
                                        val: 1,
                                        va2: false,
                                        val3: null
                                    }

                                });
                            }
                        }
                    };
                }
            });
        });

        return fakeReturn;
    }


    var localDeferred = $q.defer();
    var syncDeferred = $q.defer();
    var injectedScript = function () {
        var from = "APP_ID";
        chrome.storage.onChanged.addListener(function (changes, name) {
            chrome.runtime.sendMessage(from, {change: true, changes: changes, type: name});
        });

        chrome.runtime.onMessageExternal.addListener(function (message, sender, response) {
            if (sender.id === from && message.target === chrome.runtime.id) {
                var storage = chrome.storage[message.type];
                var method = storage[message.method];
                var args = [];
                if (message.args) {
                    for (var i in message.args) {
                        args.push(message.args[i]);
                    }
                }
                args.push(function () {
                    var results = [];
                    for (var i = 0; i < arguments.length; i++) {
                        results.push(arguments[i]);
                    }
                    message.results = results;
                    chrome.runtime.sendMessage(from, message);
                });
                message.meta = {};
                for (var j in storage) {
                    if (typeof storage[j] === 'function') {
                        continue;
                    }
                    message.meta[j] = storage[j];
                }
                method.apply(storage, args);
            }
        });
    };


    function DelegatedStorageArea(port, remoteId, type) {
        var self = this;
        var methodCallbacks = {};
        var metaDeferred = $q.defer();
        var meta = metaDeferred.promise;

        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        function guid() {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        }

        function createMethodDelegate(name) {
            return function () {
                var callback;
                var args = [];
                var message = {target: remoteId, type: type, args: args, method: name};
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

                port.postMessage(message);
            }
        }

        port.onMessage.addListener(function (message) {
            if (message.from !== remoteId) {
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
            meta = result.meta;

            var callback = methodCallbacks[result.id];
            if (!callback) {
                dummyLog("Can't find callback for id " + result.id);
                return;
            }
            delete methodCallbacks[result.id];
            try {
                callback.apply(null, result.results);
            } catch (e) {

            }
            $rootScope.$apply();

        });
        ["get", "set", "remove", "clear", "getBytesInUse"].forEach(function (val) {
            self[val] = createMethodDelegate(val);
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


    var inspectedWindow = chrome.devtools.inspectedWindow;
    dummyLog("Created inspected window");
    var remoteId;
    var port = chrome.runtime.connect();
    port.onMessage.addListener(function (message) {
        dummyLog("Received change " + angular.toJson(message));
        if (message.from === remoteId && message.obj.change) {
            dummyLog("Broadcasting change");
            $rootScope.$broadcast("$storageChanged", message.obj);
            $rootScope.$apply();
            dummyLog("Broadcasting complete");

        }
    });
    dummyLog("Connected to the port");
    var local;
    var sync;
    inspectedWindow.eval("chrome.runtime.id", function (obj, isError) {
        remoteId = obj;
        var fncString = injectedScript.toString().replace("APP_ID", chrome.runtime.id);
        dummyLog("Obtained remoteId " + remoteId);
        inspectedWindow.eval("(" + fncString + ")()", function (result, isError) {
            if (isError) {
                dummyLog("Failed to connect")
            } else {
                dummyLog("Createting areas");
                try {
                    local = new DelegatedStorageArea(port, remoteId, "local");
                    sync = new DelegatedStorageArea(port, remoteId, "sync");
                    localDeferred.resolve(local);
                    syncDeferred.resolve(sync);
                    returnValue.local = local;
                    returnValue.sync = sync;
                    $rootScope.$apply();
                } catch (e) {
                    dummyLog(e);
                }
            }
        })

    });


    var storage = {
        local: localDeferred.promise,
        sync: syncDeferred.promise
    };

    function delegateMethod(methodName, objName, container) {
        return function () {
            var deferred = $q.defer();
            var args = [];
            for (var i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            $q.when(container[objName]).then(function (obj) {
                deferred.resolve(obj[methodName].apply(obj, args));
            });
            return deferred.promise;
        }
    }

    var returnValue = {
        sync: {},
        local: {}
    };
    ["get", "set", "remove", "clear", "getBytesInUse", "getMeta"].forEach(function (val) {
        returnValue.local[val] = delegateMethod(val, 'local', storage);
        returnValue.sync[val] = delegateMethod(val, 'sync', storage);
    });


    return returnValue;
});