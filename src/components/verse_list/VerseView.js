import React, { Component } from 'react';
import {FormattedMessage} from "react-intl";
import classNames from 'classnames';
import * as _ from 'lodash';

import LexemList from '../lexem_list/LexemList';
import Button from '../button/Button';
import Icon from '../icon/Icon';

import "./index.css"


class VerseView extends Component {
  renderHeader() {
    if (!this.props.showHeader) return null;
    const module = this.props.verse.v.getModule().getShortName();
    const bookNum = this.props.verse.v.getBook().getNum();
    const chapter = this.props.verse.v.getChapter().getNum();
    const verse = this.props.verse.v.getNum();
    const href = `go ${module} ${bookNum} ${chapter} ${verse}`;
    return (
      <span className="bx-verse-header">
        <span onClick={e => {e.stopPropagation(); this.fireLink(href);}}>
          { this.props.verse.v.getHeader() }
        </span>
      </span>
    );
  }

  renderVerseNum() {
    if (this.props.showHeader || !this.props.verse.v.getModule().isBible()) return null;
    return (
      <span className="bx-verse-num">{ this.props.verse.v.getNum() }</span>
    );
  }

  displayStrong(num) {
    if (this.props.displayStrong) {
      const kind = this.props.verse.v.getBook().isOT() ? 'H' : 'G';
      num = (num.match(/^(H|G)/i) ? num : `${kind}${num}`);
      this.props.displayStrong(num);
    }
  }

  fireLink(href) {
    if (this.props.fireLink) return this.props.fireLink(href);
    alert('Supposed to go to ' + href);
  }

  renderContent(lexems) {
    return (
      <span
        dir={this.props.verse.v.getModule().isRightToLeft() ? 'rtl' : 'ltr'}
        title={this.props.verse.v.getHeader()}
      >
        { this.renderVerseNum() }
        <LexemList
          lexems={lexems}
          fireLink={ href => this.fireLink(href) }
          displayStrong={ this.props.showStrongs && this.props.verse.v.hasStrongs() ? (num => this.displayStrong(num)) : null }
        />
      </span>
    );
  }

  renderButton(icon, title, action, params) {
    return (
      <FormattedMessage id={title} key={title}>
      {
        titleTranslated => <Button action={action} icon={icon} title={titleTranslated} {...params}/>
      }
      </FormattedMessage>
    );
  }

  renderXRefs() {
    const xrefs = this.props.verse.v.getXRefs();
    const module = this.props.verse.v.getModule();
    if (!xrefs) return null;
    let verses = [];
    const links = xrefs.map(xref => {
      const book = module.getBookByShortName(xref[0]);
      const book2 = module.getBookByShortName(xref[3]);
      if (!book) return null;
      const bName = book.getShortName();
      const bName2 = book2.getShortName();
      const xrefVerses = module.getXrefVerses(xref);
      verses = [...verses, ...xrefVerses];
      const title = `${bName}.${xref[1]}:${xref[2]}`;
      let title2 = '';
      if (book2 !== book) title2 = `-${bName2}.${xref[4]}:${xref[5]}`;
      else if (xref[4] !== xref[1]) title2 = `-${xref[4]}:${xref[5]}`;
      else if (xref[5] !== xref[2]) title2 = `-${xref[5]}`;
      const text = xrefVerses.map((v, i) => {
        const text = v.getPlainText();
        if (i === 0) return `${title}${title2} ${text}`;
        const vnum = v.getNum();
        return `${vnum} ${text}`;
      }).join('\n');
      return <span
        className="bx-verse-xref"
        key={xref}
        onClick={e => {e.stopPropagation(); this.props.toTempListAction(xrefVerses);}}
        title={ text }
      >
      {
        `${title}${title2}`
      }
      {" "}
      </span>;
    });

    return <div className="bs-verse-xrefs">
      <div className="bx-verse-xref-tools">
        { this.renderButton('addList', 'verse.xrefs.open', () => this.props.addTabListAction(verses), {}) }
        { this.renderButton('copy', 'verse.xrefs.copy', () => this.props.copyVersesAction(verses, '', ''/* TODO */), {}) }
        { this.renderButton('pageAtRight', 'verse.xrefs.pageAtRight', () => this.props.toTempListAction(verses), {}) }
      </div>
      <span className="bx-verse-icon"><Icon name="xrefs"/></span>
      { links }
    </div>;
  }

  renderStrongs() {
    const module = this.props.verse.v.getModule();
    if (module.hasStrongNumbers()) return null;

    const strongs = this.props.verse.v.getStrongs();

    return <div className="bs-verse-xrefs">
    <span className="bx-verse-icon"><Icon name="hash"/></span>
    {
      strongs.map((num, i) => <span key={i}>
        <span
          className="bx-t-strong"
          onClick={e => {e.stopPropagation(); this.displayStrong(num);}}
        >{ num }</span>
        {" "}
      </span>)
    }
    </div>;
  }

  render() {
    const lexems = this.props.verse.v.getLexems();
    if (lexems.length === 0 && this.props.verse.v.getText().trim() === '') return null;
    if (this.props.verse.v.getNum() === 0) return null;
    return (
      <div
        className={classNames({"bx-verse" : true, "selected": this.props.selected, 'bx-highlighted': this.props.highlighted})}
        onClick={e => this.props.onClick(e)}
        title={this.props.verse.v.getHeader()}
      >
      { this.renderHeader() }
      { this.props.showContent ? this.renderContent(lexems) : null }
      { this.props.showStrongs ? this.renderStrongs() : null }
      { this.props.showXRefs ? this.renderXRefs() : null }
      </div>
    );
  }
}

export default VerseView;
