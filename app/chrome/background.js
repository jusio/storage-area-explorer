(function () {
    var ports = [];
    chrome.extension.onConnect.addListener(function (port) {
        ports.push(port);
        console.log("connected bg", port);
        port.onMessage.addListener(function (message) {
            console.log("received message");
            if (message.target) {
                chrome.runtime.sendMessage(message.target, message);
            } else if (message.executeAction) {

            }
        });
        port.onDisconnect.addListener(function () {
            var index = ports.indexOf(port);
            if (index > -1) {
                ports.splice(index, 1);
            }
        });

    });
    chrome.runtime.onMessageExternal.addListener(function (message, sender) {
        ports.forEach(function (port) {
            port.postMessage({from: sender.id, obj: message});
        });
        console.log("Message from " + sender.id + " contents ", message);
    });

    chrome.runtime.onMessage.addListener(function (message, sender, response) {
        console.log("action", message);
        if (message.action === 'copy') {


            area.value = message.params[0];
            area.select();
            document.execCommand('copy');
            console.log("Copied " + area.value);
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

})();