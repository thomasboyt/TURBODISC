import React from 'react';
import HotKeys from '../lib/GlobalHotKeys';
import {History} from 'react-router';

const Attract = React.createClass({
  mixins: [
    History,
  ],

  getHandlers() {
    return {
      advance: (e) => {
        e.preventDefault();

        // TODO: advance to playing state
      }
    };
  },

  getKeyMap() {
    return {
      'advance': ['space', 'enter']
    };
  },

  render() {
    return (
      <HotKeys handlers={this.getHandlers()} keyMap={this.getKeyMap()}>
        <div className="attract-container">
          <div className="attract">
            <h1>TURBODISC</h1>
            <p>press space</p>
          </div>
        </div>
      </HotKeys>
    );
  }
});

export default Attract;
