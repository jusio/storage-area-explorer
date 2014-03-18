function initializeExtension(runtime, extension, $document, tabs) {
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


    function clearTabsPorts(tabPortName, portInstance){
        var otherName;
        if(tabPortName.indexOf("for_tab_") > -1){
           otherName = "inspected_tab_" + tabPortName.substring("for_tab_".length);
        } else if (tabPortName == "inspected_tab_") {
            tabPortName = tabPortName + portInstance.sender.tab.id;
            otherName = "for_tab_" + portInstance.sender.tab.id;
        }
        [tabPortName,otherName].forEach(function(name){
            var portToDisconnect = ports[name];
            if(!portToDisconnect){
                return;
            }
            if(portToDisconnect != portInstance){
                portToDisconnect.disconnect();
            }
            delete ports[name];
        });


    }

    extension.onConnect.addListener(function (port) {
        console.debug("connectedPort from tab ", port.sender);
        if (!ports[port.name]) {
            if (port.name.indexOf("for_tab_") === 0) {
                console.log("Devtools listenening for tab ",port.name);
                ports[port.name] = port;
                var tabId = parseInt(port.name.substring("for_tab_".length));
                tabs.executeScript(tabId, {file: "app/chrome/htmlStorageHook.js"},function(e,p){
                    port.postMessage("portConnected");
                });
                port.onMessage.addListener(function (message) {
                    var target = ports["inspected_tab_" + tabId];
                    target.postMessage(message);
                });
                port.onDisconnect.addListener(function(){
                    clearTabsPorts(port.name,port);
                });

            } else if (port.name == "inspected_tab_") {
                console.log("Inspected tab connected",port.name);
                ports["inspected_tab_" + port.sender.tab.id] = port;
                port.onMessage.addListener(function(message){

                    var devtoolsPort = ports["for_tab_" + port.sender.tab.id];
                    devtoolsPort.postMessage({from:"for_tab_" + port.sender.tab.id, obj:message});
                });
                port.onDisconnect.addListener(function(){
                   clearTabsPorts(port.name,port);
                });

            } else {
                console.log("Another port connected",port);
                ports[port.name] = port;
                port.onMessage.addListener(function (message) {
                    if (externalPorts[port.name]) {
                        externalPorts[port.name].postMessage(message);
                    } else {
                        port.disconnect();
                        throw new Error("Couldn't find external port for " + port.name);
                    }

                });
                port.postMessage("portConnected");
                port.onDisconnect.addListener(function () {
                    console.debug("Local Port for " + port.name + " Disconnected, disconnecting external port");
                    portDisconnected(port.name, port);
                });
            }

        } else {
            port.disconnect();
            throw new Error("Trying to register port for extension which is already existing. Extension id " + port.name);
        }


    });


    //only invoked by chrome apps
    extension.onConnectExternal.addListener(function (externalPort) {
        var senderId = externalPort.sender.id;
        console.debug("url " + externalPort.sender.url);
        console.debug("tab " + externalPort.tab);
        console.debug("External port connected from app " + senderId);
        var portName = senderId;

        if (ports[portName]) {
            externalPort.onDisconnect.addListener(function () {
                console.debug("External port from app " + senderId + " disconnected, disconnecting local port");
                portDisconnected(portName, externalPort);
            });
            externalPort.onMessage.addListener(function (message) {
                var port = ports[portName];
                if (port) {
                    port.postMessage({from: portName, obj: message});
                } else {
                    externalPort.disconnect();
                    throw new Error("There is no port for handling messages from " + sender.id);
                }
            });
            externalPorts[portName] = externalPort;

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
    initializeExtension(chrome.runtime, chrome.extension, document, chrome.tabs);
}

