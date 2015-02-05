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
var Immutable = require("immutable");
var FixedDataTable = require('fixed-data-table');
var {Table,Column}=FixedDataTable;
var Tabs = require("./tabs");
var Controls = require("./controls");
var InlineEditor = require("./inlineEditor").InlineEditor;
var Rx = require("rx");
var {Observable}=Rx;


function render(handler) {
    return (data, string_cellDataKey, object_rowData, number_rowIndex, any_columnData, number_width)=>
        <InlineEditor value={data}
            onNewValue={(oldValue, newValue)=>handler(number_rowIndex, oldValue, newValue)}></InlineEditor>
}
var MainWidget = module.exports = React.createClass({

    getInitialState() {
        return Immutable.fromJS({
            mode: "list",
            storage: "",
            items: [],
            width: document.documentElement.clientWidth,
            height: window.innerHeight - 75,
            tab:0
        });
    },

    componentWillMount() {
        this.resize = ()=> {
            this.replaceState(this.state.mergeDeep({
                width: document.documentElement.clientWidth,
                height: window.innerHeight - 75
            }));
        };
        window.addEventListener("resize", this.resize);

        this.tabChange = new Rx.BehaviorSubject(0);
        this.changesSub = this.props.changes.subscribe((change)=> {
            try {
                var changes = change.changes;
                var newItems = [];

                var items = this.state.get("items");
                for (var i = 0; i < items.size; i++) {
                    var item = items.get(i);
                    if (changes[item.get("key")]) {
                        var keyChange = changes[item.get("key")];
                        if (keyChange.newValue !== undefined) {
                            item = item.set("value", keyChange.newValue);
                            newItems.push(item);
                        }
                        delete changes[item.key];
                    } else {
                        newItems.push(item);
                    }
                }
                Object.keys(changes).forEach((key)=> {
                    newItems.push({key, value: changes[key].newValue});
                });

                this.replaceState(this.state.set("items", Immutable.fromJS(newItems)));
            } catch (e) {
                console.log(e);
            }
        });
        var self = this;
        this.tabSubscription = this.tabChange.subscribe((tab)=>{
            this.props.storages[tab].getData().then((items)=>{
                self.replaceState(self.state.set("items", Immutable.fromJS(items)).set("tab",tab));
            })
        });
    },
    componentWillUnmount(){
        this.tabSubscription.unsubscribe();
        this.changesSub.unsubscribe();
        window.removeEventListener("resize",this.resize);
    },

    onValueChange(row, oldValue, newValue) {
        var item = this.state.get("items").get(row);
        this.props.storages[this.state.get("tab")].update(item.get("key"), newValue);
        return true;
    },
    onKeyChange(row, oldValue, newValue) {
        this.props.storages[this.state.get("tab")].rename(oldValue, newValue);
        return true;
    },



    render() {
        var state = this.state;
        return <div>
            <Tabs tabs={this.props.storages.map((storage)=> {
                return {name: storage.storageType}
            })}
                initialTab={0} tabChanged={this.tabChange.onNext.bind(this.tabChange)}/>
            <Controls/>
            <Table
                rowHeight={25}
                rowGetter={(rowNumber)=>state.get("items").get(rowNumber).toJS()}
                rowsCount={this.state.get('items').size}
                width={this.state.get("width")}
                height={this.state.get("height")}
                headerHeight={25}
            >
                <Column
                    label="Key"
                    width={10}
                    dataKey={"key"}
                    flexGrow={1}
                    cellRenderer={render(this.onKeyChange)}
                />
                <Column
                    label="Value"
                    width={10}
                    dataKey={"value"}
                    cellRenderer={render(this.onValueChange)}
                    flexGrow={4}
                />
            </Table>
        </div>
    }

});

