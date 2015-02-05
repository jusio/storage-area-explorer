if (!Object.assign) {
    Object.defineProperty(Object, 'assign', {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (target, firstSource) {
            'use strict';
            if (target === undefined || target === null) {
                throw new TypeError('Cannot convert first argument to object');
            }

            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource === undefined || nextSource === null) {
                    continue;
                }

                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
            return to;
        }
    });
}

var React = require("react/addons");
var FixedDataTable = require('fixed-data-table');
var {Table,Column}=FixedDataTable;
var Tabs = require("./tabs")
var Controls = require("./controls");
var InlineEditor = require("./inlineEditor").InlineEditor;
var Rx = require("rx");


window.addEventListener("load", function () {

    var storageChanges = new Rx.Subject();
    class TestStorage {

        constructor(number, name) {
            this.data = {};
            for (var i = 0; i < number; i++) {
                this.data[i + "key"] = i + "value";
            }
            this.storageType = name;

        }


        rename(keyOld, keyNew) {
            return new Promise((resolve)=> {
                var oldValue = this.data[keyOld];
                delete this.data[keyOld];
                this.data[keyNew] = oldValue;
                resolve();
                var changes = {};
                changes[keyOld] = {oldValue};
                changes[keyNew] = {newValue: oldValue};
                this.emitChange(changes);
                console.log("Renamed " + keyOld + " " + keyNew);
                console.log(changes);
            });
        }

        update(key, newValue) {
            var data = this.data;
            return new Promise((resolve)=> {
                console.log("updating");
                var oldValue = this.data[key];
                this.data[key] = newValue;
                resolve();
                var changes = {};
                changes[key] = {oldValue, newValue};
                this.emitChange(changes);
            });
        }

        emitChange(changes) {
            storageChanges.onNext({storage: this.storageType, changes: changes});
        }

        getData() {
            return new Promise((resolve)=> {
                resolve(Object.keys(this.data).map((key)=> {
                    return {key, value: this.data[key]}
                }));

            });
        }

        isReadonly() {
            return false;
        }

        getStats() {
            return new Promise((resolve)=> {
                resolve({size: Object.keys(this.data), maxSize: 100, items: 1000, maxItems: 10000});
            });

        }

        remove(key) {
            return new Promise((resolve)=> {
                var oldValue = this.data[key];
                delete  this.data[key];
                resolve();
                var changes = {};
                changes[key] = {oldValue};
                this.emitChange(changes);
            })
        }


    }






    var MainWidget = require("./mainWidget");
    var storages = [new TestStorage(1000, "window.localStorage"), new TestStorage(20, "window.sessionStorage")];
    React.render(<MainWidget changes={storageChanges} storages={storages}/>, document.getElementById("content"));
});