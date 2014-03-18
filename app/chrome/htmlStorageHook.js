(function (chrome) {
    if (!chrome.extension) {
        return;
    }
    var extension = chrome.extension;
    var storages = {};
    var port = extension.connect({name: "inspected_tab_"});

    storages['localStorage'] = new StorageArea(window.localStorage);
    storages['sessionStorage'] = new StorageArea(window.sessionStorage);
    function StorageChange(oldValue, newValue) {
        this.oldValue = oldValue;
        this.newValue = newValue;
    }

    function StorageArea(storage) {
        this.storage = storage;
    }

    function applyFunctorPerItem(items, functor) {
        if (typeof items === 'string') {
            functor(items);
        }
        if (typeof items === 'object') {
            if (Object.prototype.toString.call(items) === '[object Array]') {
                items.forEach(function (val) {
                    functor(items[val]);
                })
            } else {
                for (var key in items) {
                    if (items.hasOwnProperty(key)) {
                        functor(key, items[key]);
                    }
                }
            }
        }

    }

    StorageArea.prototype.get = function (items, callback) {
        if (typeof items === 'function') {
            callback = items;
            items = null;
        }
        var returnItems = {};
        var storage = this.storage;
        if (items === null || items === undefined) {
            for (var i = 0; i < storage.length; i++) {
                var key2 = storage.key(i);
                returnItems[key2] = storage.getItem(key2);
            }
        } else {
            applyFunctorPerItem(items, function (key) {
                var storedItem = storage.getItem(key);
                if (arguments.length === 2 && storedItem === null) {
                    storedItem = arguments[1];
                }
                returnItems[key] = storedItem;
            });
        }

        callback && callback(returnItems);
    };

    StorageArea.prototype.set = function (items, callback) {
        if (typeof items === 'function') {
            callback = items;
            items = null;
        }
        var storage = this.storage;
        applyFunctorPerItem(items, function (key, value) {
            storage.setItem(key, value);
        });
        callback && callback();
    };

    StorageArea.prototype.remove = function (items, callback) {
        if (typeof items === 'function') {
            callback = items;
            items = null;
        }
        var storage = this.storage;
        applyFunctorPerItem(items, function (key) {
            storage.removeItem(key);
        });
        callback && callback();
    };

    StorageArea.prototype.clear = function (callback) {
        this.storage.clear();
        callback && callback();
    };


    var frame = document.createElement("iframe");
    frame.style.display = 'none';
    document.documentElement.appendChild(frame);
    frame.contentWindow.addEventListener("storage", function (event) {
        var type = "";
        if (event.storageArea === event.currentTarget.localStorage) {
            type = "localStorage";
        } else if (event.storageArea === event.currentTarget.sessionStorage) {
            type = "sessionStorage"
        } else {
            console.log("Unknown storage area");
            return;
        }
        var changes = {};
        changes[event.key] = {newValue: event.newValue};
        port.postMessage({change: true, type: type, changes: changes});
    });
    port.onDisconnect.addListener(function () {
        document.documentElement.removeChild(frame);
    })


    port.onMessage.addListener(function (message) {
        if (!message.type || !storages[message.type]) {
            return;
        }
        handleMessage(message, storages[message.type]);
    });

    function handleMessage(message, storage) {
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
            port.postMessage(message);
        });
        message.meta = {};
        Object.keys(storage).forEach(function (key) {
            if (typeof storage[key] === 'function') {
                return;
            }
            message.meta[key] = storage[key];
        });
        method.apply(storage, args);
    }

})(chrome);