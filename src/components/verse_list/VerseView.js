import React, { Component } from 'react';
import classNames from 'classnames';
import * as _ from 'lodash';

import LexemList from '../lexem_list/LexemList';

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

  renderVerseNum() {
    if (this.props.showHeader || !this.props.verse.getModule().isBible()) return null;
    return (
      <span className="bx-verse-num">{ this.props.verse.getNum() }</span>
    );
  }

  displayStrong(num) {
    if (this.props.displayStrong) {
      const kind = this.props.verse.getBook().isOT() ? 'H' : 'G';
      num = (num.match(/^(H|G)/i) ? num : `${kind}${num}`);
      this.props.displayStrong(num);
    }
  }

  fireLink(href) {
    alert('Supposed to go to ' + href);
  }

  renderContent(lexems) {
    return (
      <div
        dir={this.props.verse.getModule().isRightToLeft() ? 'rtl' : 'ltr'}
        title={this.props.verse.getHeader()}
      >
        { this.renderVerseNum() }
        <LexemList
          lexems={lexems}
          fireLink={ href => this.fireLink(href) }
          displayStrong={ this.props.showStrongs && this.props.verse.hasStrongs() ? (num => this.displayStrong(num)) : null }
        />
      </div>
    );
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
