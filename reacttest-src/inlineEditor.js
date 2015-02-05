var React = require('react')

var InlineEditor = React.createClass({

    getInitialState: function () {
        return {editing: false}
    },
    edit: function (e) {
        e.preventDefault();
        this.setState({editing: true});
    },
    blur: function (e) {
        this.setState({editing: false});
    },
    keyDown: function (e) {
        if (e.keyCode == 13) {
            var newValue = this.refs.editor.getDOMNode().value;
            if (this.notifyValue(newValue)) {
                this.setState({editing: false});
            }
        }

    },
    notifyValue(val) {
        if(this.props.onNewValue){
            console.log("Notifying");
            var returnValue = this.props.onNewValue(this.props.value, val);
            console.log(returnValue);
            return returnValue;
        }
        return false
    },

    render: function () {
        var body;
        if (this.props.readonly || !this.state.editing) {
            if (this.props.formatter) {
                body = this.props.formatter(this.props.value);
            } else {
                body = this.props.value
            }
        } else {
            var defaultValue;
            if (this.props.editorValue) {
                defaultValue = this.props.editorValue(this.props.value);
            } else {
                defaultValue = this.props.value;
            }

            body = <input type="text"
                defaultValue={defaultValue}
                style={{width: "100%", height: "100%"}}
                onBlur={this.blur} autoFocus ref="editor" onKeyDown={this.keyDown}
            />
        }

        return <div onDoubleClick={this.edit}>{body}</div>
    }
});
module.exports = {InlineEditor: InlineEditor};
