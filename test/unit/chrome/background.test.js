describe("Testing background extension script", function () {


    var runtime = {};

    var extension = {};
    var port;
    var $document = {};
    var element;
    var externalPort;
    beforeEach(function () {
        port = chrome.mocks.createMockPort();
        $document = {

            body: {
                appendChild: function (newElement) {
                    element = newElement;
                }
            },
            createElement: function () {
                return {
                    select: jasmine.createSpy("select")
                };
            },
            execCommand: function () {

            }

        };
        var mockChromeApi = chrome.mocks.mockChromeApi();
        extension = mockChromeApi.extension;
        runtime = mockChromeApi.runtime;
        port.name = "unique";
        externalPort = chrome.mocks.createMockPort(port.name);
        initializeExtension(runtime, extension, $document);
    });


    it("Should add proper listeners", function () {
        expect(runtime.onMessage.listeners.length).toBe(1);
        expect(extension.onConnectExternal.listeners.length).toBe(1);
        expect(extension.onConnect.listeners.length).toBe(1);
    });

    it("should post message on port when connected", function () {
        port.name = "uniquePort";
        extension.onConnect(port);
        expect(port.postMessage).toHaveBeenCalledWith("portConnected")
    });

    it("should disconnect external port when local port is disconnected", function () {
        extension.onConnect(port);
        extension.onConnectExternal(externalPort);
        port.onDisconnect();
        expect(externalPort.disconnect).toHaveBeenCalled();
    });


    it("should disconnect local port when external port is disconnected", function () {
        extension.onConnect(port);
        extension.onConnectExternal(externalPort);
        externalPort.onDisconnect();
        expect(port.disconnect).toHaveBeenCalled();
    });

    it("should disconnect local port if message received before external port is connected", function () {
        extension.onConnect(port);
        try {
            port.onMessage("message");
        } catch (e) {

        }
        expect(port.disconnect).toHaveBeenCalled();
    });


    it("should pass messages from external port to local", function () {
        extension.onConnect(port);
        extension.onConnectExternal(externalPort);
        port.postMessage = jasmine.createSpy();
        externalPort.onMessage("message");
        expect(port.postMessage).toHaveBeenCalled();
    });

    it("Should correctly listen on port", function () {
        port.name = "test";
        extension.onConnect(port);
        expect(port.onMessage.listeners.length).toBe(1);
        expect(port.onDisconnect.listeners.length).toBe(1);
    });
    it("Should throw error when port doesn't have a name", function () {
        var exception;
        delete port.name;
        try {
            extension.onConnect(port);
        } catch (e) {
            exception = e;
        }
        expect(exception).toBeDefined();
    });
    it("Should throw error when there are more than two ports with the same name", function () {
        extension.onConnect(port);
        var exception;
        try {
            extension.onConnect(port);
        } catch (e) {
            exception = e;
        }
        expect(exception).toBeDefined();
    });

    it("Should delete disconnected ports", function () {
        extension.onConnect(port);
        port.onDisconnect();
        extension.onConnect(port); //should throw exception otherwise
    });

    it("Should delegate message to correct port", function () {
        port.name = "uniquePort";
        port.postMessage = jasmine.createSpy("port.postMessage");
        extension.onConnect(port);
        runtime.onMessageExternal({}, {id: "uniquePort"});
        expect(port.postMessage).toHaveBeenCalled();
        port.postMessage = jasmine.createSpy("port.postMessage");

        var anotherPort = chrome.mocks.createMockPort();
        anotherPort.name = "uniquePort2";
        anotherPort.postMessage = jasmine.createSpy("port2.postMessage");
        extension.onConnect(anotherPort);
        runtime.onMessageExternal({}, {id: "uniquePort2"});
        expect(port.postMessage).not.toHaveBeenCalled();
        expect(anotherPort.postMessage).toHaveBeenCalled();
    });

    it("Should disconnect external port if it is not expected", function () {
        var mockPort = chrome.mocks.createMockPort();
        extension.onConnectExternal(mockPort);
        expect(mockPort.disconnect).toHaveBeenCalled();
    });


    it("Should delegate messages from port to the externalPort", function () {
        port.name = "uniquePort";
        extension.onConnect(port);
        var externalPort = chrome.mocks.createMockPort(port.name);
        extension.onConnectExternal(externalPort);
        expect(port.disconnect).not.toHaveBeenCalled();
        expect(externalPort.disconnect).not.toHaveBeenCalled();
        var message = {target: port.name};
        port.onMessage(message);
        expect(externalPort.postMessage).toHaveBeenCalledWith(message);
    });

    it("Should support 'copy' action message", function () {
        spyOn($document, 'execCommand');
        var callback = jasmine.createSpy("callback");
        runtime.onMessage({action: "copy", params: ["test"]}, {}, callback);
        expect($document.execCommand).toHaveBeenCalledWith('copy');
        expect(element.select).toHaveBeenCalled();
        expect(callback).toHaveBeenCalled();
        expect(element.value).toBe('');
    });

    it("Should support 'paste' action message", function () {
        spyOn($document, 'execCommand').andCallFake(function () {
            element.value = "newValue";
        });
        var callback = jasmine.createSpy("callback");
        runtime.onMessage({action: "paste"}, {}, callback);
        expect($document.execCommand).toHaveBeenCalledWith('paste');
        expect(element.select).toHaveBeenCalled();
        expect(callback).toHaveBeenCalledWith("newValue");
    });

    it("Should ignore unknown messages", function () {
        spyOn($document, 'execCommand');
        var callback = jasmine.createSpy("callback");
        runtime.onMessage({action: "cut"}, {}, callback);
        expect($document.execCommand).not.toHaveBeenCalled();
        expect(callback).not.toHaveBeenCalled();
    })


});