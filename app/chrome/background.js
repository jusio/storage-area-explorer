function initializeExtension(runtime, extension) {
    var ports = {};
    extension.onConnect.addListener(function (port) {
        if (!ports[port.name]) {
            console.log("Registered port for handling messages from " + port.name);
            ports[port.name] = port;
        } else {
            console.error("Trying to register port for extension which is already existing. Extension id " + port.name);
            port.disconnect();
            return;
        }

        port.onMessage.addListener(function (message) {
            if (message.target) {
                runtime.sendMessage(message.target, message);
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
            console.error("There is no port for handling messages from " + sender.id);
        }
    });

    runtime.onMessage.addListener(function (message, sender, response) {
        if (message.action === 'copy') {
            area.value = message.params[0];
            area.select();
            document.execCommand('copy');
            response && response();
            area.value = '';
            return;
        }
        if (message.action === 'paste') {
            area.select();
            document.execCommand("paste");
            response && response(area.value);
            area.value = '';
        }
    });

    var area = document.createElement("textarea");
    document.body.appendChild(area);

}
initializeExtension(chrome.runtime, chrome.extension);