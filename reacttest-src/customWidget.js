var React = require("react");
var {PureRenderMixin} = React;
var CustomWidget = module.exports = React.createClass({
    mixins:[PureRenderMixin],
    render(){
        return <div>New Widget</div>
    }

});
