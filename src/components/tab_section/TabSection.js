import React, { Component } from 'react'}


import classNames from 'classnames';

import "./index.css";


class TabSection extends Component {
  renderTabs() {
    return (
      <div className="bx-verse-header">
        { this.props.verse.getHeader() }
      </div>
    );
  }

  render() {
    
  }
}

export default TabSection;