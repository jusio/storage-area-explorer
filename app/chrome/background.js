function initializeExtension(runtime, extension, $document) {
    var ports = {};
    var externalPorts = {};


    function portDisconnected(targetId, disconnectedPort) {
        [ports, externalPorts].forEach(function (portsMap) {
            var port = portsMap[targetId];
            if (!port) {
                return;
            }
            if (port !== disconnectedPort) {
                port.disconnect();
            }
            delete portsMap[targetId];
        });
    }

    extension.onConnect.addListener(function (port) {
        if (port.name && !ports[port.name]) {
            ports[port.name] = port;
            if (port.name === runtime.id) {
                chrome.storage.onChanged.addListener(function (changes, name) {
                    port.postMessage({from: runtime.id, obj: {change: true, changes: changes, type: name}});
                });
            }
            port.postMessage("portConnected");
            console.debug("Local port " + port.name + " connected");
        } else {
            port.disconnect();
            throw new Error("Trying to register port for extension which is already existing. Extension id " + port.name);
        }

        port.onMessage.addListener(function (message) {
            if (port.name !== runtime.id) {
                if (externalPorts[port.name]) {
                    externalPorts[port.name].postMessage(message);
                } else {
                    port.disconnect();
                    throw new Error("Couldn't find external port for " + port.name);
                }
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
            console.debug("Local Port for " + port.name + "Disconnected, disconnecting external port");
            portDisconnected(port.name, port);
        });

    });

    extension.onConnectExternal.addListener(function (externalPort) {
        var senderId = externalPort.sender.id;
        console.debug("External port connected from app " + senderId);
        if (ports[senderId]) {
            externalPort.onDisconnect.addListener(function () {
                console.debug("External port from app " + senderId + " disconnected, disconnecting local port");
                portDisconnected(senderId, externalPort);
            });
            externalPort.onMessage.addListener(function (message) {
                var port = ports[senderId];
                if (port) {
                    port.postMessage({from: senderId, obj: message});
                } else {
                    externalPort.disconnect();
                    throw new Error("There is no port for handling messages from " + sender.id);
                }
            });
            externalPorts[senderId] = externalPort;

        } else {
            externalPort.disconnect();
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
            //noinspection JSCheckFunctionSignatures
            $document.execCommand('paste');
            response && response(area.value);
            area.value = '';
        }
    });

    var area = $document.createElement('textarea');
    $document.body.appendChild(area);

}
if (chrome.runtime && chrome.extension && document) {
    initializeExtension(chrome.runtime, chrome.extension, document);
}

