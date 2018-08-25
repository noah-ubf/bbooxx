import React, { Component } from 'react';
import classNames from 'classnames';

import "./index.css"


class VerseView extends Component {
  renderHeader() {
    if (!this.props.showHeader) return null;
    return (
      <div className="bx-verse-header">
        { this.props.verse.getHeader() }
      </div>
    );
  }

  renderContent(lexems) {
    if (lexems.length === 0) {
      return (
        <div
          dangerouslySetInnerHTML={{__html: this.props.verse.getText()}}
          title={this.props.verse.getHeader()}
        />
      );
    } else {
      const composed = lexems.map(l => `${l.open}${l.text}${l.close}`).join(' ');
      return (
        <div
          dir={this.props.verse.getModule().isRightToLeft() ? 'rtl' : 'ltr'}
          dangerouslySetInnerHTML={{__html: composed}}
          title={this.props.verse.getHeader()}
        />
      );
    }
  }

  render() {
    const lexems = this.props.verse.getLexems();
    if (lexems.length === 0 && this.props.verse.getText().trim() === '') return null;
    if (this.props.verse.getNum() === 0) return null;
    return (
      <div
        className={classNames({"bx-verse" : true, "selected": this.props.selected})}
        onClick={e => this.props.onClick(e)}
        title={this.props.verse.getHeader()}
      >
      { this.renderHeader() }
      { this.renderContent(lexems) }
      </div>
    );
  }
}

export default VerseView;
