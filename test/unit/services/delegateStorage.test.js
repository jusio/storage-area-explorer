describe("Test delegate storage", function () {
    var _delegateStorage;
    var q;
    var rootScope;
    var port;
    beforeEach(module("storageExplorer"));

    beforeEach(function () {
        inject(function (delegateStorage, $q, $rootScope) {
            _delegateStorage = delegateStorage;
            q = $q;
            rootScope = $rootScope;
        });
        port = chrome.mocks.createMockPort();
    });

    it("Should have all Storage Area methods + getMeta method", function () {
        var storageArea = _delegateStorage(q.defer().promise, 'local');
        ['get', 'set', 'clear', 'remove', 'getBytesInUse', 'getMeta'].forEach(function (name) {
            expect(typeof storageArea[name]).toBe("function");
        });
    });


    it('Should throw error when method is invoked with more than one function', function () {
        var deferred = q.defer();
        rootScope.$apply();
        var storageArea = _delegateStorage(deferred.promise, 'local');
        var exception;
        try {
            storageArea.get(function () {
            }, function () {
            });
        } catch (e) {
            exception = e;
        }
        expect(exception).toBeTruthy();
    });


    it("Should send message with id,when callback is present, and call callback when receive result with the same id", function () {
        var deferred = q.defer();
        var storageArea = _delegateStorage(deferred.promise, 'local');
        var messageID;
        port.postMessage = function (message) {
            expect(message.id).toBeDefined();
            messageID = message.id;
        };
        deferred.resolve({remoteId: "remote", port: port});
        var callback = jasmine.createSpy("callback");
        storageArea.get({}, callback);
        rootScope.$apply();
        expect(messageID).toBeDefined();
        port.onMessage({from: 'remote', obj: {id: messageID, type: 'local'}});
        rootScope.$apply();
        expect(callback).toHaveBeenCalled();
    });

    it("Should ignore messages with wrong id,empty id,type, and source", function () {
        var deferred = q.defer();
        var storageArea = _delegateStorage(deferred.promise, 'local');
        var messageID;
        port.postMessage = function (message) {
            expect(message.id).toBeDefined();
            messageID = message.id;
        };
        deferred.resolve({remoteId: "remote", port: port});
        var callback = jasmine.createSpy("callback");
        storageArea.get({}, callback);
        rootScope.$apply();
        port.onMessage({from: '', obj: {id: messageID, type: 'local'}});
        port.onMessage({from: 'remote', obj: {id: 'as', type: 'local'}});
        port.onMessage({from: 'remote', obj: {type: 'local'}});
        port.onMessage({from: 'remote', obj: {id: messageID, type: 'someothertype'}});
        expect(callback).not.toHaveBeenCalled();
    });

    it("Should correctly resolve getMeta, one first and second calls", function () {
        var deferred = q.defer();
        var storageArea = _delegateStorage(deferred.promise, 'local');
        var messageID;
        port.postMessage = function (message) {
            expect(message.id).toBeDefined();
            messageID = message.id;
        };
        deferred.resolve({remoteId: "remote", port: port});
        rootScope.$apply();
        var callback = jasmine.createSpy("callback");
        storageArea.getMeta().then(callback);
        port.onMessage({from: 'remote', obj: {id:'randomId', type: 'local', meta: true}});
        rootScope.$apply();
        expect(callback).toHaveBeenCalled();
        expect(storageArea.getMeta() === true).toBeTruthy();
        port.onMessage({from: 'remote', obj: {id:'randomId', type: 'local', meta: true}});

    });


    it("Should remember method invocations and call them when promise is resolved", function () {
        var deferred = q.defer();
        rootScope.$apply();
        var storageArea = _delegateStorage(deferred.promise, 'local');
        var methods = ['get', 'set', 'clear', 'remove', 'getBytesInUse'];
        methods.forEach(function (name) {
            storageArea[name]("testArg");
        });

        var calledMethods = [];
        var remoteId = "remoteId";
        port.postMessage = function (message) {
            expect(message.target).toBe(remoteId);
            expect(methods.indexOf(message.method) > -1).toBeTruthy();
            expect(message.args[0]).toBe("testArg");
            expect(message.type).toBe('local');
            expect(message.id).toBeUndefined();
            calledMethods.push(message.method);
        };
        deferred.resolve({remoteId: remoteId, port: port});
        rootScope.$apply();
        expect(calledMethods.length).toBe(methods.length);
        methods.forEach(function (method) {
            expect(calledMethods.indexOf(method)).toBeGreaterThan(-1);
        })
    });


});