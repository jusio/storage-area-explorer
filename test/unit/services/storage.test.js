describe("Test storage", function () {
    var delegateStorageMock;
    var evalServiceMock;
    var runtimeMock;
    var appContextMock;
    var _storage;
    var q;
    var rootScope;
    var usedPort;
    var chromeApiMock;
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
        evalServiceMock = {
            evalFunction: function () {

            }
        };
        chromeApiMock = chrome.mocks.mockChromeApi();
        runtimeMock = chromeApiMock.runtime;
        runtimeMock.id = "APP_ID";
        runtimeMock.connect = jasmine.createSpy("testSpy").andCallFake(function () {
            usedPort = chrome.mocks.createMockPort();
            spyOn(usedPort.onMessage, 'addListener').andCallThrough();
            return usedPort;
        });
        console.log("created runtime mock");

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
        expect(usedPort.onDisconnect.hasListeners()).toBeTruthy();
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

    it("", function () {
        describe("Inject script should be working correctly", function () {


            //TODO split into separate test suite, way too hard to maintain
            var mockPort = chrome.mocks.createMockPort("APP_ID");
            mockPort.name = "Unique port";
            var extensionMock = chromeApiMock.extension;

            extensionMock.connect.andCallFake(function () {
                return mockPort;
            });
            extensionMock.id = "APP_ID";
            chromeApiMock.storage.local.clear.andCallFake(function (callback) {
                callback("result");
            });
            chromeApiMock.storage.local.META_FLAG = 120;


            spyOn(evalServiceMock, 'evalFunction').andCallFake(function (closure, params) {
                expect(params['APP_ID']).toBe("APP_ID");
                closure(chromeApiMock);
            });

            rootScope.$apply();
            var storage = chromeApiMock.storage;
            it("should connect to extension and listen for messages on port and storage", function () {
                expect(extensionMock.connect).toHaveBeenCalled();
                expect(mockPort.onMessage.hasListeners()).toBe(true);
                expect(storage.onChanged.hasListeners()).toBe(true);
            });

            it("should transmit storage changes to the port", function () {
                mockPort.postMessage = jasmine.createSpy("mockPort.postMessage").andCallFake(function (message) {
                    expect(message.changes).toBe("changes");
                    expect(message.type).toBe("name");
                    expect(message.change).toBeTruthy();
                });
                storage.onChanged("changes", "name");
                expect(mockPort.postMessage).toHaveBeenCalled();

            });


            it("on message with method prop should call postmessage", function () {
                mockPort.postMessage = jasmine.createSpy("mockPort.postMessage").andCallFake(function (message) {
                    expect(message.results.length).toBe(1);
                    expect(message.results[0]).toBe("result");
                    expect(message.meta['META_FLAG']).toBe(chromeApiMock.storage.local.META_FLAG);
                });
                mockPort.onMessage({target: 'APP_ID', method: "clear", type: 'local'});
                expect(mockPort.postMessage).toHaveBeenCalled();
                expect(storage.local.clear).toHaveBeenCalled();
            });

            it("should ignore empty messages and messages without method & type properties",function(){
                mockPort.postMessage = jasmine.createSpy("mockPort.postMessage");
                mockPort.onMessage({});
                expect(mockPort.postMessage).not.toHaveBeenCalled();
                mockPort.onMessage({target: "APP_ID"});
                expect(mockPort.postMessage).not.toHaveBeenCalled();
            });

            it("should correctly apply arguments to the storage",function(){
                storage.local.clear = jasmine.createSpy("storage.local.clear").andCallFake(function (arg, callback) {
                    expect(arg).toBe("arg1");
                    callback("result");
                });
                mockPort.postMessage = jasmine.createSpy("mockPort.postMessage").andCallFake(function (message) {
                    expect(message.results.length).toBe(1);
                    expect(message.results[0]).toBe("result");
                    expect(message.meta['META_FLAG']).toBe(chromeApiMock.storage.local.META_FLAG);
                });
                mockPort.onMessage({target: 'APP_ID', method: "clear", args: ["arg1"], type: 'local'});
                expect(mockPort.postMessage).toHaveBeenCalled();
                expect(storage.local.clear).toHaveBeenCalled();
            })

        })
    });

});