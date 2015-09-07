function PortManager() {
    this.uiPorts = {
        app: {
            tab: {
                ports: {}
            },
            ports: {}
        },
        tab: {
            ports: {}
        }
    };

    this.targetPorts = {
        app: {
            tab: {
                ports: {}
            },
            ports: {}

        },
        tab: {
            ports: {}
        }
    }
}


function findPort(ports, app, tab) {
    if (app && tab) {
        return ports.app.tab.ports[app + "_" + tab];
    }
    if (app) {
        return ports.app.ports[app];
    }
    if (tab) {
        return ports.tab.ports[tab];
    }
    return null;
}

function putPort(ports, app, tab, port) {
    if (findPort(ports, app, tab)) {
        throw new Error("Such port already exist");
    }
    if (app && tab) {
        ports.app.tab.ports[app + "_" + tab] = port;
        return;
    }
    if (tab) {
        ports.tab.ports[tab] = port;
        return;
    }
    if (app) {
        ports.app.ports[app] = port;
        return;
    }
    throw new Error("Can't put port without app or tab");
}

function removePort(ports, app, tab) {
    if (!findPort(ports, app, tab)) {
        return;
    }
    if (app && tab) {
        delete ports.app.tab.ports[app + "_" + tab];
        return;
    }
    if (tab) {
        delete ports.tab.ports[tab];
        return;
    }
    if (app) {
        delete ports.app.ports[app];
    }
}

PortManager.prototype.getUiPort = function (app, tab) {
    return findPort(this.uiPorts, app, tab);
};

PortManager.prototype.getTargetPort = function (app, tab) {
    return findPort(this.targetPorts, app, tab);
};


PortManager.prototype.onPortDisconnected = function (app, tab, disconnectedPort) {
    console.log("Disconnecting ports for " + app + ":" + tab);
    var removePort2 = removePort(this.uiPorts, app, tab);
    var removePort1 = removePort(this.targetPorts, app, tab);
    [removePort1, removePort2].forEach(function (port) {
        if (!port) {
            return;
        }
        if (port == disconnectedPort) {
            return;
        }
        port.disconnect();
    });
};

PortManager.prototype.trackUiPort = function (app, tab, port) {
    var self = this;
    console.log("Trying to track ui port for app " + app + " and tab " + tab);
    putPort(this.uiPorts, app, tab, port);
    port.onDisconnect.addListener(function () {
        removePort(self.uiPorts, app, tab);
        var targetPort = findPort(self.targetPorts, app, tab);
        if (targetPort) {
            targetPort.disconnect();
            self.onPortDisconnected(app, tab, targetPort);
        }
    });
    port.onMessage.addListener(function (message) {
        console.log("Received message from ui port,  app:tab " + app + ":" + tab, message);
        var targetPort = self.getTargetPort(app, tab);
        if (targetPort) {
            targetPort.postMessage(message);
        } else {
            port.disconnect();
            self.onPortDisconnected(app, tab, port);
            console.error("Target port not found for  app id " + app + " and tab id " + tab);
        }
    });


};

PortManager.prototype.trackTargetPort = function (app, tab, port) {
    if(this.getTargetPort(app, tab)){
        port.disconnect();
        throw new Error("port for " + app + ":" + tab + " already exist");

    }
    if(!this.getUiPort(app, tab)){
        port.disconnect();
        throw new Error("Target port cannot be tracked before ui port exist. Id " + app + ":" + tab);
    }
    var self = this;
    console.log("Trying to track target port for app " + app + " and tab " + tab);
    putPort(this.targetPorts, app, tab, port);
    port.onDisconnect.addListener(function () {
        removePort(self.targetPorts, app, tab);
        var uiPort = findPort(self.uiPorts, app, tab);
        if (uiPort) {
            uiPort.disconnect();
            self.onPortDisconnected(app, tab, uiPort);
        }
    });
    port.onMessage.addListener(function (message) {
        console.log("Received message from ui port,  app:tab " + app + ":" + tab, message);
        var uiPort = self.getUiPort(app, tab);
        if (uiPort) {
            uiPort.postMessage({from: {tab: tab, app: app}, obj: message});
        } else {
            port.disconnect();
            self.onPortDisconnected(app, tab, port);
            console.error("Can't find ui port for appId " + app + " and tab Id" + tab);
        }
    })

};


function initializeExtension(runtime, extension, $document, tabs) {

    var portManager = new PortManager();
    extension.onConnect.addListener(function (port) {
        if (port.name.indexOf("for_tab_") === 0) {
            console.log("Devtools listening for tab ", port.name);
            var tabId = parseInt(port.name.substring("for_tab_".length));
            tabs.executeScript(tabId, {file: "app/chrome/htmlStorageHook.js"}, function (e, p) {
                port.postMessage("portConnected");
                console.log("Connecting devtools port");
            });
            portManager.trackUiPort(undefined, tabId, port);
        } else if (port.name == "inspected_tab_") {
            console.log("Inspected tab connected", port.name);
            portManager.trackTargetPort(undefined, port.sender.tab.id, port);
        } else {
            console.log("Another port connected", port);
            if(port.name.indexOf("_")< 0) {
                portManager.trackUiPort(port.name, undefined, port);
            } else {
               var names = port.name.split("_");
                portManager.trackUiPort(names[0], names[1], port);
            }
            port.postMessage("portConnected");
        }
    });


    //only invoked by chrome apps
    extension.onConnectExternal.addListener(function (externalPort) {
        var appName = externalPort.sender.id;
        var tabId = externalPort.sender.tab ? externalPort.sender.tab.id : undefined;

        if (portManager.getUiPort(appName, tabId)) {
            portManager.trackTargetPort(appName, tabId, externalPort)
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



