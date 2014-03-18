function getChromeApiMock(mocks) {
    var chrome = {};
    chrome.runtime = {
        sendMessage: jasmine.createSpy("runtime.sendMessage"),
        onMessage: mocks.createEvent(),
        onMessageExternal: mocks.createEvent(),
        connect: jasmine.createSpy("runtime.connect").andCallFake(function () {
            return mocks.createMockPort();
        }),
        getManifest: jasmine.createSpy("runtime.getManifest").andCallFake(function () {
            return {
                permissions: ["storage"],
                optional_permissions: []
            };
        })
    };
    chrome.devtools = {
        inspectedWindow: {
            "eval": jasmine.createSpy("devtools.inspectedWindow.eval"),
            tabId:11
        }
    };
    chrome.extension = {
        onConnect: mocks.createEvent(),
        onConnectExternal: mocks.createEvent(),
        connect: jasmine.createSpy("extension.connect").andCallFake(function () {
            return mocks.createMockPort();
        })
    };
    chrome.runtime.onConnectExternal = chrome.extension.onConnectExternal = mocks.createEvent();

    chrome.storage = {};
    chrome.storage.onChanged = mocks.createEvent();
    ['local', 'managed', 'sync'].forEach(function (storageName) {
        var area = chrome.storage[storageName] = {};
        ['set', 'remove', 'clear', 'get', 'getBytesInUse'].forEach(function (methodName) {
            area[methodName] = jasmine.createSpy("storage." + storageName + "." + methodName);
        });
    });

    return chrome;
}

chrome.mocks = {
    createEvent: function () {
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
        event.hasListeners = function () {
            return event.listeners.length > 0;
        };
        event.removeListener = function (target) {
            event.listeners.splice(event.listeners.indexOf(target), 1);
        };


        return event;
    },

    createMockPort: function createMockPort(id) {

        return {
            sender: {id: id},
            onMessage: chrome.mocks.createEvent(),
            onDisconnect: chrome.mocks.createEvent(),
            postMessage: jasmine.createSpy("port.postMessage"),
            disconnect: jasmine.createSpy("port.disconnect").andCallFake(function () {
                this.onDisconnect();
            })
        };
    }

};
chrome.mocks.mockChromeApi = getChromeApiMock.bind(null, chrome.mocks);
