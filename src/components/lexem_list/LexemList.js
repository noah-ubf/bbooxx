import React, { Component } from 'react';
import classNames from 'classnames';
import * as _ from 'lodash';

import "./index.css"


class LexemList extends Component {
  displayStrong(e, num) {
    if (this.props.displayStrong) {
      e.stopPropagation();
      this.props.displayStrong(num);
    }
  }

  fireLink(e, href) {
    e.stopPropagation();
    e.preventDefault();
    if (this.props.fireLink) {
      this.props.fireLink(href);
    }
  }

  render() {
    let cont = false;
    let br = false;

    return _.map(this.props.lexems, (l, i) => {
      let classes = {};
      let text = _.isString(l.text) ? l.text : '';
      if (_.get(l, 'mode.size')) classes[`bx-t-size-${l.mode.size}`] = true;
      if (_.get(l, 'mode.bold')) classes[`bx-t-bold`] = true;
      if (_.get(l, 'mode.italic')) classes[`bx-t-italic`] = true;

      if (l.t === 'block' || l.t === '/block') {
        br = cont;
        return null;
      }

      if (l.t === 'linebreak') {
        return ( <br key={i} /> );
      }

      if (l.t === 'versenum') {
        return null; // never show verse numbers here.
      }

      if (l.t === 'img') {
        return ( <img key={i} src={l.src} alt="" /> );
      }

      if (l.t === 'block/') {
        classes[`bx-t-block-${l.ntype.toLowerCase()}`] = true;
        return ( <p key={i} className={classNames(classes)}>{ l.text }</p> );
      }

      if (l.t === 'link') {
        classes['bx-t-link'] = true;
        cont = true;
        return ( <a key={i} href={l.href} onClick={e => this.fireLink(e, l.href)} className={classNames(classes)}>{ text }</a> );
      }

      if (l.t === 'anchor') {
        return ( <a key={i} name={l.name} /> );
      }

      if (l.t === 'strong') {
        return (
          this.props.displayStrong
          ? <span key={i} className="bx-t-strong" onClick={(e) => this.displayStrong(e, text)}>{ text }</span>
          : null
        );
      }

      if (text.trim() === '') return <span key={i} className="separator"> { text } </span>;

      const ret = (
        <span key={i} className={classNames(classes)} style={{color: _.get(l, 'mode.color')}}>
          { l.space ? (<span> </span>) : null }
          { br ? (<br />) : null }
          <span key={i} className={classNames(classes)}>
            { text }
          </span>
        </span>
      );
      br = false;
      cont = true;
      return ret;
    });
  }
}

export default LexemList;
