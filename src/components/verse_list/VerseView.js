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

  renderVerseNum() {
    if (this.props.showHeader || !this.props.verse.getModule().isBible()) return null;
    return (
      <span className="bx-verse-num">{ this.props.verse.getNum() }</span>
    );
  }

  showStrongNumber(e, num) {
    if (this.props.displayStrong) {
      e.stopPropagation();
      this.props.displayStrong(num);
    }
    // alert(num);
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
      return (
        <div
          dir={this.props.verse.getModule().isRightToLeft() ? 'rtl' : 'ltr'}
          title={this.props.verse.getHeader()}
        >
          { this.renderVerseNum() }
          {
            lexems.map((l, i) => (
              <span key={i}>
                <span dangerouslySetInnerHTML={{__html: `${l.space?' ':''}${l.open}${l.text}${l.close}`}} />
                { (this.props.showStrongs && l.strongs && l.strongs.length > 0) 
                  ? l.strongs.map((s, i) => (
                    <span className="bx-strong-number-link" key={i} onClick={(e) => this.showStrongNumber(e, s)}>{s}</span>
                  )) : null }
              </span>
            ))
          }
        </div>
      );
      // const composed = lexems.map(l => `${l.space?' ':''}${l.open}${l.text}${l.close}`).join('');
      // return (
      //   <div
      //     dir={this.props.verse.getModule().isRightToLeft() ? 'rtl' : 'ltr'}
      //     title={this.props.verse.getHeader()}
      //   >
      //     { this.renderVerseNum() }
      //     <span dangerouslySetInnerHTML={{__html: composed}} />
      //   </div>
      // );
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
