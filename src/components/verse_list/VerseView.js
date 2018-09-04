import React, { Component } from 'react';
import classNames from 'classnames';
import * as _ from 'lodash';

import LexemList from '../lexem_list/LexemList';

import "./index.css"


class VerseView extends Component {
  renderHeader() {
    if (!this.props.showHeader) return null;
    const module = this.props.verse.getModule().getShortName();
    const bookNum = this.props.verse.getBook().getNum();
    const chapter = this.props.verse.getChapter().getNum();
    const verse = this.props.verse.getNum();
    const href = `go ${module} ${bookNum} ${chapter} ${verse}`;
    return (
      <div className="bx-verse-header">
        <span onClick={e => {e.stopPropagation(); this.fireLink(href);}}>
          { this.props.verse.getHeader() }
        </span>
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
    if (this.props.fireLink) return this.props.fireLink(href);
    alert('Supposed to go to ' + href);
  }

  renderContent(lexems) {
    console.log('this.domRef=', this.domRef);
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
        className={classNames({"bx-verse" : true, "selected": this.props.selected, 'bx-highlighted': this.props.highlighted})}
        onClick={e => this.props.onClick(e)}
        title={this.props.verse.getHeader()}
      >
      { this.renderHeader() }
      { this.props.showContent ? this.renderContent(lexems) : null }
      </div>
    );
  }
}

export default VerseView;
