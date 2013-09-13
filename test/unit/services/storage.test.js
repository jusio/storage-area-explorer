describe("Test storage", function () {
    var delegateStorageMock;
    var evalServiceMock;
    var runtimeMock;
    var appContextMock;
    var _storage;
    var q;
    var rootScope;
    var usedPort;
    beforeEach(module("storageExplorer"));

    beforeEach(function () {
        delegateStorageMock = jasmine.createSpy("delegateStorageMock").andCallFake(function (promise, type) {
            delegateStorageMock.promise = promise;
            if (delegateStorageMock.types === undefined) {
                delegateStorageMock.types = [];
            }
            delegateStorageMock.types.push(type);
            return {};
        });
        appContextMock = jasmine.createSpy("appContextMock").andCallFake(function () {
            var deferred = q.defer();
            deferred.resolve({id: "appId"});
            rootScope.$apply();
            return deferred.promise;
        });
        runtimeMock = {
            onMessageExternal: chrome.mocks.createEvent(),
            connect: jasmine.createSpy("runtime.connect mock").andCallFake(function () {
                usedPort = chrome.mocks.createMockPort();
                spyOn(usedPort.onMessage, 'addListener').andCallThrough();
                return usedPort;
            }),
            id: "APP_ID"
        };
        evalServiceMock = {
            evalFunction: function () {

            }
        }
    });

    beforeEach(module(function ($provide) {
        $provide.value("runtime", runtimeMock);
        $provide.value('delegateStorage', delegateStorageMock);
        $provide.value("evalService", evalServiceMock);
        $provide.value("appContext", appContextMock);
    }));

    beforeEach(function () {
        inject(function ($q, $rootScope) {
            q = $q;
            rootScope = $rootScope;
        });
    });

    beforeEach(inject(function (storage) {
        _storage = storage;
    }));

    it("Should be initialised correctly", function () {
        expect(_storage.local).toBeDefined();
        expect(_storage.sync).toBeDefined();
        expect(appContextMock).toHaveBeenCalled();
        expect(delegateStorageMock).toHaveBeenCalled();
        expect(delegateStorageMock.promise).toBeDefined();
        expect(delegateStorageMock.types.length).toBe(2);
        expect(delegateStorageMock.types.indexOf('local')).toBeGreaterThan(-1);
        expect(delegateStorageMock.types.indexOf('sync')).toBeGreaterThan(-1);
        var callback = jasmine.createSpy("callback").andCallFake(function (connection) {
            expect(connection.remoteId).toBe('appId');
            expect(connection.port).toBe(usedPort);
        });
        delegateStorageMock.promise.then(callback);

        rootScope.$apply();
        expect(runtimeMock.connect).toHaveBeenCalled();
        expect(usedPort.onMessage.addListener).toHaveBeenCalled();
        expect(usedPort).toBeDefined();
        expect(callback).toHaveBeenCalled();
    });

    it("Should spawn angular messages on port messages", function () {
        rootScope.$apply();
        var callback = jasmine.createSpy("callback").andCallFake(function (event, change) {
            expect(change).toBe(obj);
        });
        rootScope.$on("$storageChanged", callback);
        var obj = {change: true};
        usedPort.onMessage({from: 'appId', obj: obj});
        expect(callback).toHaveBeenCalled();
    });

    it("Should react only to certain messages", function () {
        rootScope.$apply();
        var callback = jasmine.createSpy("callback");
        rootScope.$on("$storageChanged", callback);
        usedPort.onMessage({from: 'appId', obj: {}});
        usedPort.onMessage({from: 'badId', obj: {}});
        expect(callback).not.toHaveBeenCalled();
    });

    it("Inject script should be working correctly", function () {
        var chromeMock = {
            runtime: {
                onMessageExternal: chrome.mocks.createEvent(),
                id: "APP_ID"
            },
            storage: {
                onChanged: chrome.mocks.createEvent(),
                local: {
                    'clear': jasmine.createSpy("storage.local.clear").andCallFake(function (callback) {
                        callback("result");
                    }),
                    "META_FLAG": 120
                }
            }
        };
        spyOn(evalServiceMock, 'evalFunction').andCallFake(function (closure, params) {
            console.log(params);

            expect(params['APP_ID']).toBe("APP_ID");
            closure(chromeMock);
        });

        rootScope.$apply();
        var runtime = chromeMock.runtime;
        expect(runtime.onMessageExternal.listeners.length).toBe(1);
        var storage = chromeMock.storage;
        expect(storage.onChanged.listeners.length).toBe(1);
        runtime.sendMessage = jasmine.createSpy("sendMessage").andCallFake(function (targetId, message) {
            expect(targetId).toBe("APP_ID");
            expect(message.change).toBe(true);
            expect(message.changes).toBe("changes");
            expect(message.type).toBe("name");
        });
        storage.onChanged("changes", "name");
        expect(runtime.sendMessage).toHaveBeenCalled();
        runtime.sendMessage = jasmine.createSpy("sendMessage").andCallFake(function (targetId, message) {
            expect(targetId).toBe("APP_ID");
            expect(message.results.length).toBe(1);
            expect(message.results[0]).toBe("result");
            expect(message.meta['META_FLAG']).toBe(chromeMock.storage.local.META_FLAG);
        });
        runtime.onMessageExternal({target: 'APP_ID', method: "clear", type: 'local'}, {id: 'APP_ID'});
        expect(runtime.sendMessage).toHaveBeenCalled();
        expect(storage.local.clear).toHaveBeenCalled();


        runtime.sendMessage = jasmine.createSpy("runtime.sendMessage");
        runtime.onMessageExternal({}, {id: "APP_ID"});
        expect(runtime.sendMessage).not.toHaveBeenCalled();
        runtime.onMessageExternal({target: "APP_ID"}, {});
        expect(runtime.sendMessage).not.toHaveBeenCalled();
        storage.local.clear = jasmine.createSpy("storage.local.clear").andCallFake(function (arg, callback) {
            expect(arg).toBe("arg1");
            callback("result");
        });
        runtime.sendMessage = jasmine.createSpy("runtime.sendMessage").andCallFake(function (targetId, message) {
            expect(targetId).toBe("APP_ID");
            expect(message.results.length).toBe(1);
            expect(message.results[0]).toBe("result");
            expect(message.meta['META_FLAG']).toBe(chromeMock.storage.local.META_FLAG);
        });
        runtime.onMessageExternal({target: 'APP_ID', method: "clear", args: ["arg1"], type: 'local'}, {id: 'APP_ID'});
        expect(runtime.sendMessage).toHaveBeenCalled();
        expect(storage.local.clear).toHaveBeenCalled();


    });

});