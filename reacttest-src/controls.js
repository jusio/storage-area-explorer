var React = require("react");
function delegateTo(obj, val) {

    if (!obj) {
        return;
    }
    return obj(val);
}

function makeButton(text, type, handler) {
    return <button className={["btn", "btn-" + type, "btn-xs"].join(' ')} onClick={handler}>{text}</button>;
}

function makeDropDown(text, items) {
    return <div className="btn-group">
        <button type="button" className="btn btn-info dropdown-toggle btn-xs" data-toggle="dropdown">
                    {text}
            <span className="caret"></span>
        </button>
        <ul className="dropdown-menu" role="menu">
                {items.map(function (item) { return (<li><a href="#" onClick={item.action}><span className={["glyphicon", "glyphicon-" + item.icon].join(' ')}></span>{item.text}</a></li>);})}
        </ul>
    </div>
}

var Controls = module.exports = React.createClass({
    add: function () {
        delegateTo(this.props.onAdd);
    },
    clear: function () {
        delegateTo(this.props.onClear);
    },
    exportToFile: function () {
        delegateTo(this.props.exportToFile);
    },
    exportToClipboard: function () {
        delegateTo(this.props.exportToClipboard);
    },
    importFromFile: function () {
        delegateTo(this.props.importFromFile);
    },
    importFromClipBoard: function () {
        delegateTo(this.props.importFromClipBoard);
    },


    render: function () {
        var buttons = [];

        if (!this.props.readonly) {
            buttons.push(makeButton("Add Item", "primary", this.add));
        }
        if (!this.props.readonly && !this.props.empty) {
            buttons.push(makeButton("Clear", "warning", this.clear));
        }
        if (!this.props.empty) {
            buttons.push(makeDropDown("Export", [
                {
                    text: "To File",
                    action: this.exportToFile,
                    icon: "download"
                },
                {
                    text: "To Clip Board",
                    action: this.exportToClipboard,
                    icon: "export"
                }

            ]))
        }
        if (!this.props.readonly) {
            buttons.push(makeDropDown("Import", [
                {
                    text: "From File",
                    action: this.importFromFile
                },
                {
                    text: "From Clipboard",
                    action: this.importFromClipBoard
                }
            ]));
        }


        return <div className="controls">
                    {buttons}
        </div>
    }
});