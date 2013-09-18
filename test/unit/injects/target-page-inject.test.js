describe("Test script which hooks up on the target page", function () {

    var mockChromeApi;
    var mockPort;
    var storageMock;
    var extensionMock;
    var _targetPageInject;


    beforeEach(function () {
        mockPort = chrome.mocks.createMockPort("APP_ID");
        mockPort.name = "Unique port";
        mockChromeApi = chrome.mocks.mockChromeApi();
        extensionMock = mockChromeApi.runtime;
        extensionMock.id = "APP_ID";
        extensionMock.connect.andCallFake(function () {
            return mockPort;
        });

        storageMock = mockChromeApi.storage;
        storageMock.local.clear.andCallFake(function (callback) {
            callback("result");
        });
        storageMock.local.META_FLAG = 120;


    });
    beforeEach(module("storageExplorer"));

    beforeEach(inject(function (targetPageInject) {
        _targetPageInject = targetPageInject;
    }));

    beforeEach(function () {
        _targetPageInject(mockChromeApi);
    });


    it("should connect to extension and listen for messages on port and storage", function () {
        expect(extensionMock.connect).toHaveBeenCalled();
        expect(mockPort.onMessage.hasListeners()).toBe(true);
        expect(storageMock.onChanged.hasListeners()).toBe(true);
        expect(mockPort.onDisconnect.hasListeners()).toBe(true);

    });

    it("should transmit storage changes to the port", function () {
        mockPort.postMessage = jasmine.createSpy("mockPort.postMessage").andCallFake(function (message) {
            expect(message.changes).toBe("changes");
            expect(message.type).toBe("name");
            expect(message.change).toBeTruthy();
        });
        storageMock.onChanged("changes", "name");
        expect(mockPort.postMessage).toHaveBeenCalled();

    });


    it("on message with method prop should call postmessage", function () {
        mockPort.postMessage = jasmine.createSpy("mockPort.postMessage").andCallFake(function (message) {
            expect(message.results.length).toBe(1);
            expect(message.results[0]).toBe("result");
            expect(message.meta['META_FLAG']).toBe(storageMock.local.META_FLAG);
        });
        mockPort.onMessage({target: 'APP_ID', method: "clear", type: 'local'});
        expect(mockPort.postMessage).toHaveBeenCalled();
        expect(storageMock.local.clear).toHaveBeenCalled();
    });

    it("should ignore empty messages and messages without method & type properties", function () {
        mockPort.postMessage = jasmine.createSpy("mockPort.postMessage");
        mockPort.onMessage({});
        expect(mockPort.postMessage).not.toHaveBeenCalled();
        mockPort.onMessage({target: "APP_ID"});
        expect(mockPort.postMessage).not.toHaveBeenCalled();
    });

    it("should correctly apply arguments to the storage", function () {
        storageMock.local.clear = jasmine.createSpy("storage.local.clear").andCallFake(function (arg, callback) {
            expect(arg).toBe("arg1");
            callback("result");
        });
        mockPort.postMessage = jasmine.createSpy("mockPort.postMessage").andCallFake(function (message) {
            expect(message.results.length).toBe(1);
            expect(message.results[0]).toBe("result");
            expect(message.meta['META_FLAG']).toBe(storageMock.local.META_FLAG);
        });
        mockPort.onMessage({target: 'APP_ID', method: "clear", args: ["arg1"], type: 'local'});
        expect(mockPort.postMessage).toHaveBeenCalled();
        expect(storageMock.local.clear).toHaveBeenCalled();
    });

    it("should remove listener on storage on disconnect", function () {
        mockPort.onDisconnect();
        expect(storageMock.onChanged.hasListeners()).toBe(false);
    })


});