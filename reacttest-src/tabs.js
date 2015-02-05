var React = require('react');
function delegateTo(obj, val) {

    if (!obj) {
        return;
    }
    return obj(val);
}
var Tab = React.createClass({

    handleClick: function () {
        delegateTo(this.props.onselect);
    },
    render: function () {
        return <li className={this.props.active ? "active" : null}>
            <a onClick={this.handleClick}>
                    {this.props.name}
                <div className="usage">{this.props.description}</div>
            </a>
        </li>
    }
});


var Tabs = React.createClass({

    getInitialState: function () {
        return {selectedTab: this.props.initialTab ? this.props.initialTab : 0};
    },

    setSelectedTab: function (index) {
        var old = this.state.selectedTab;
        this.setState({selectedTab: index});
        if (this.props.tabChanged) {
            this.props.tabChanged(index, old);
        }
    },

    render: function () {
        var self = this;
        var tabs = this.props.tabs.map(function (tab, index) {
            return <Tab
                key={index}
                name={tab.name}
                active={index == self.state.selectedTab}
                onselect={self.setSelectedTab.bind(self, index)}
                description={tab.description}

            />;
        });

        return <div className="header">
            <ul className="nav nav-tabs">{tabs}</ul>
        </div>
    }
});

module.exports = Tabs;