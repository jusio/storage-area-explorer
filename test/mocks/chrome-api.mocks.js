function resetChromeApi() {

    chrome.runtime = {
        sendMessage: function () {

        },
        onMessage: {
            addListener: function () {
            }
        },
        onMessageExternal: {
            addListener: function () {
            }
        }

    };
    chrome.devtools = {
        inspectedWindow: {
            "eval": function () {

            }
        }
    };


    chrome.extension = {
        onConnect: {
            addListener: function () {
            }
        }

    };
}
resetChromeApi();

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

        return event;
    },

    createMockPort: function createMockPort() {
        return {
            onMessage: chrome.mocks.createEvent(),
            onDisconnect: chrome.mocks.createEvent(),
            postMessage:function(){

            }
        };
    }
};