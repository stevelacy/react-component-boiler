'use strict';

var ReactCompositeComponent = require('react/lib/ReactCompositeComponent');
var DOM = require('react/lib/ReactDOM');
var PropTypes = require('react/lib/ReactPropTypes');


var Component = ReactCompositeComponent.createClass({
  displayName: 'Component',
  propTypes: {
    onClick: PropTypes.func
  },

  getDefaultProps: function() {
    return {};
  },

  getInitialState: function() {
    return {};
  },

  render: function(){
    return DOM.div({});
  }
});

module.exports = Component;
