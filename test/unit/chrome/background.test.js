describe("Testing appContext Service", function () {


    function createEvent() {
        var event = function () {
            var args = [];
            for (var i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }

            event.listeners.forEach(function (listener) {
                listener.apply(null, args);
            });
        };
        event.listeners = [];
        event.addListener = function () {
            event.listeners.push(arguments[0]);
        };

        return event;
    }

    function createMockPort() {
        return {
            onMessage: createEvent(),
            onDisconnect: createEvent()
        };
    }

    var runtime = {};

    var extension = {};


    beforeEach(function () {
        resetChromeApi();
        extension = {
            onConnect: createEvent()
        };
        runtime = {
            onMessage: createEvent(),
            onMessageExternal: createEvent()
        };

    });


    it("Should add proper listeners", function () {
        initializeExtension(runtime, extension);
        expect(runtime.onMessage.listeners.length).toBe(1);
        expect(runtime.onMessageExternal.listeners.length).toBe(1);
        expect(extension.onConnect.listeners.length).toBe(1);
    });

    it("Should correctly listen on port", function () {
        var port = createMockPort();
        initializeExtension(runtime, extension);
        extension.onConnect(port, {name: "test"});
        expect(port.onMessage.listeners.length).toBe(1);
        expect(port.onDisconnect.listeners.length).toBe(1);
    });


});