describe("Testing background extension script", function () {


    var runtime = {};

    var extension = {};
    var port;
    var $document = {};
    var element;

    beforeEach(function () {
        resetChromeApi();
        extension = {
            onConnect: chrome.mocks.createEvent()
        };
        port = chrome.mocks.createMockPort();
        runtime = {
            onMessage: chrome.mocks.createEvent(),
            onMessageExternal: chrome.mocks.createEvent()
        };
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
        initializeExtension(runtime, extension, $document);

    });


    it("Should add proper listeners", function () {
        expect(runtime.onMessage.listeners.length).toBe(1);
        expect(runtime.onMessageExternal.listeners.length).toBe(1);
        expect(extension.onConnect.listeners.length).toBe(1);
    });

    it("Should correctly listen on port", function () {
        port.name = "test";
        extension.onConnect(port);
        expect(port.onMessage.listeners.length).toBe(1);
        expect(port.onDisconnect.listeners.length).toBe(1);
    });
    it("Should throw error when port doesn't have a name", function () {
        var exception;
        try {
            extension.onConnect(port);
        } catch (e) {
            exception = e;
        }
        expect(exception).toBeDefined();
    });
    it("Should throw error when there are more than two ports with the same name", function () {
        port.name = "test";
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
        port.name = "test";
        extension.onConnect(port);
        port.onDisconnect();
        extension.onConnect(port); //should throw exception otherwise
    });

    it("Should delegate message to correct port", function () {
        var exception;
        try {
            runtime.onMessageExternal(null, {});
        } catch (e) {
            exception = e;
        }
        expect(exception).toBeDefined();

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

    it("Should delegate messages from port to the runtime", function () {
        port.name = "uniquePort";
        extension.onConnect(port);
        runtime.sendMessage = jasmine.createSpy("runtime.sendMessage");
        var message = {target: port.name};
        port.onMessage(message);
        expect(runtime.sendMessage).toHaveBeenCalledWith(port.name, message);
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