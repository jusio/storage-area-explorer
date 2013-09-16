function initializeExtension(runtime, extension, $document) {
    var ports = {};
    extension.onConnect.addListener(function (port) {
        console.log("Connected");
        if (port.name && !ports[port.name]) {
            ports[port.name] = port;
            if (port.name === runtime.id) {
                chrome.storage.onChanged.addListener(function (changes, name) {
                    port.postMessage({from: runtime.id, obj: {change: true, changes: changes, type: name}});
                });
            }
        } else {
            port.disconnect();
            throw new Error("Trying to register port for extension which is already existing. Extension id " + port.name);
        }

        port.onMessage.addListener(function (message) {
            if (port.name !== runtime.id) {
                runtime.sendMessage(port.name, message);
            } else {
                var storage = chrome.storage[message.type];
                var method = storage[message.method];
                var args = [];
                if (message.args) {
                    message.args.forEach(function (arg) {
                        args.push(arg);
                    });
                }
                args.push(function () {
                    var results = [];
                    for (var i = 0; i < arguments.length; i++) {
                        results.push(arguments[i]);
                    }
                    message.results = results;
                    port.postMessage({from: runtime.id, obj: message});
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
        port.onDisconnect.addListener(function () {
            delete ports[port.name];
        });

    });
    runtime.onMessageExternal.addListener(function (message, sender) {
        var port = ports[sender.id];
        if (port) {
            port.postMessage({from: sender.id, obj: message});
        } else {
            console.log(message);
            throw new Error("There is no port for handling messages from " + sender.id);
        }
    });

    runtime.onMessage.addListener(function (message, sender, response) {
        if (message.action === 'copy') {
            area.value = message.params[0];
            area.select();
            $document.execCommand('copy');
            response && response();
            area.value = '';
            return;
        }
        if (message.action === 'paste') {
            area.select();
            $document.execCommand("paste");
            response && response(area.value);
            area.value = '';
        }
    });

    var area = $document.createElement("textarea");
    $document.body.appendChild(area);

}
initializeExtension(chrome.runtime, chrome.extension, document);