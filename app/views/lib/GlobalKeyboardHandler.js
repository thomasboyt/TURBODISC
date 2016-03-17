import React from 'react';

export const keysDown = new Set();

const GlobalKeyboardWrapper = React.createClass({
  propTypes: {
    children: React.PropTypes.element.isRequired,
  },

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  },

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
  },

  handleKeyDown(e) {
    if (!keysDown.has(e.keyCode)) {
      keysDown.add(e.keyCode);

      return false;
    }
  },

  handleKeyUp(e) {
    if (keysDown.has(e.keyCode)) {
      keysDown.delete(e.keyCode);
      return false;
    }
  },

  render() {
    return this.props.children;
  }
});

export default GlobalKeyboardWrapper;
