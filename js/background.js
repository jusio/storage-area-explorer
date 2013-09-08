(function () {
    var ports = [];
    chrome.extension.onConnect.addListener(function (port) {
        ports.push(port);
        console.log("connected bg", port);
        port.onMessage.addListener(function (message) {
            console.log("received message");
            chrome.runtime.sendMessage(message.target, message);
        });
        port.onDisconnect.addListener(function () {
            var index = ports.indexOf(port);
            if (index > -1) {
                ports.splice(index, 1);
            }
        });

    });
    chrome.runtime.onMessageExternal.addListener(function (message, sender, response) {
        for (var i in ports) {
            ports[i].postMessage({from: sender.id, obj: message});
        }
        console.log("Message from " + sender.id + " contents ", message);
    });

})();