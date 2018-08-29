import * as _ from 'lodash';

import levenshtein from '../../levenshtein';
import { convertFontToUtf8 } from './font_convert';

export default class Verse {
  params = null;
  text = null;
  numText = null;
  header = null;
  lexems = [];
  strongsCount = null;

  constructor(params=null) {
    if (!_.isNull(params)) {
      this.params = params;
      this.text = this.params.lines ? this.params.lines.join('\n') : '';
      this.lexems = this.parseLexems(this.text);
    }
  }

  getNewInstance() {
    return new Verse().clone(this);
  }

  clone(verse) {
    this.params = verse.params;
    this.text = verse.text;
    this.numText = verse.numText;
    this.header = verse.header;
    this.lexems = verse.lexems;
    this.strongsCount = verse.strongsCount;
    return this;
  }

  getDescriptor() {
    const module = this.params.module.getShortName();
    const book = this.params.book.getShortName();
    const chapter = this.params.chapter.getNum();
    const verse = this.getNum();
    return `(${module})${book}.${chapter}:${verse}`;
  }

  getModule() {
    return this.params.module;
  }

  getBook() {
    return this.params.book;
  }

  getChapter() {
    return this.params.chapter;
  }

  getNum() {
    return +this.params.num;
  }

  hasStrongs() {
    if (_.isNull(this.strongsCount)) {
      this.strongsCount = 0;
      _.forEach(this.lexems, l => (this.strongsCount += _.get(l, 'strongs.length', 0)));
    }
    return (this.strongsCount > 0);
  }

  getHeader() {
    if (_.isNull(this.header)) {
      const book = this.params.book.getShortName();
      const chapter = this.params.chapter.getNum();
      const verses = this.getNum(); // TODO: can be several verses in one text block, like in Turkish bible
      this.header = book[book.length - 1] === '.' ? `${book}${chapter}:${verses}` : `${book}.${chapter}:${verses}`;
    }

    return this.header;
  }

  parseLexems(text) {
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(text, "text/html");
    let nodes = [..._.get(htmlDoc, 'childNodes[0].childNodes[1].childNodes', [])];
    // console.log('NODES[0]: ', nodes)

    let plainTree = [];
    let lexems = [];

    const convNodes = nodes => _.compact(nodes.map(n => {
      // console.log('===>', n, n.nodeName)
      if (n.nodeName === "#comment") {
        return null;
      } else if (n.nodeName === '#text') {
        return {t: 'text', text: n.textContent};
      } else if (n.nodeName !== 'IMG' && n.innerHTML === '') {
        return null;
      } else if(n.nodeName === 'FONT' && n.face.match(/^(Heb|Grk)/)) {
        return {
          t: 'text',
          text: convertFontToUtf8(n.face, n.outerText),
          open: '',
          close: '',
          children: convNodes([...n.childNodes])
        };
      } else {
        return {
          t: n.nodeName,
          html: n.outerHTML,
          text: n.outerText,
          open: n.outerHTML.substring(0, n.outerHTML.indexOf('>') + 1),
          close: `</${n.nodeName}>`,
          children: convNodes([...n.childNodes])
        };
      }
    }));

    const walkTree = (nodes, parent = {open: '', close: ''}) => {
      nodes.forEach(node => {
        if (!node) return;
        let open = node.open || '';
        let close = node.close || '';
        if (node.close === '</P>') {
          if (parent.close ==='') {
            open = '';
            close = '';
          }
          if (plainTree.length > 0) {
            plainTree = [...plainTree, { text: ' ', open, close }];
          }
        }
        if (node.t === 'text') {
          plainTree = parent.open ? [
            ...plainTree,
            {
              text: node.text,
              open: `${parent.open}${open}`,
              close: `${close}${parent.close}`,
            }
          ] : [
            ...plainTree,
            ..._.chain(node.text).split(/\b/).map(s => ({
              text: s,
              open: `${parent.open}${open}`,
              close: `${close}${parent.close}`,
              isStrong: !!(this.getModule().hasStrongNumbers() && s.match(/^(H|G)?\d+$/i)),
            })).value()
          ];
        } else if (node.children.length === 0) {
          plainTree = [...plainTree, {
            text: node.text,
            open: `${parent.open}${open}`,
            close: `${close}${parent.close}`,
          }];
        } else {
          walkTree(node.children, {
            open: `${parent.open}${open}`,
            close: `${close}${parent.close}`,
          });
        }
      });
    }

    nodes = convNodes(nodes);
    if (nodes.length === 1 && nodes[0].t === 'P') nodes = nodes[0].children;
    walkTree(nodes);
    
    if (this.params.module.isBible() && plainTree[0] && plainTree[0].text.trim().match(/^[0-9]+$/)) {
      this.numText = plainTree[0].text;
      plainTree = plainTree.slice(1); // TODO groupped verses, like in Turkish
    }

    let space = false;
    plainTree.forEach(n => {
      if (n.text.trim() === '' && (!n.open || n.open.length < 10)/* TODO: a better way for detecting media? */) {
        space = true;
      } else if (n.isStrong && lexems.length > 0) {
        let s = n.text;
        if (s.match(/^\d+$/i)) s = (this.getBook().isNT() ? 'G' : 'H') + s;
        lexems[lexems.length - 1].strongs.push(s) // TODO: check other formats!!!
        space = false;
      } else {
        let t = n.text.trim();
        let strongs = [];
        if (n.text[0] === ' ') space = true;
        const res = /^(.*)((H|G)\d+)(\s*)$/.exec(t);
        if (res && res[2]) {
          t = res[1];
          strongs.push(res[2]);
        }
        lexems.push({open: n.open, close: n.close, text: t, space, strongs});
        if (n.text[n.text.length - 1] === ' ') space = true;
        else space = false;
      }
    });

    return lexems;
  }

  getText() {
    return this.text;
  }

  getLexems() {
    return this.lexems;
  }

  getWords(caseSensitive) {
    return _.chain(this.text.split(' '))
      .map(w => {
        if(!caseSensitive) w = w.toLowerCase();
        w = w.replace(/[,.:;+'"!?()[\]\\\/-]/g, '').trim();
        return w === '' ? null : w;
      })
      .compact()
      .uniq()
      .value();
  }

  matches(words, options) {
    const myWords =  this.getWords(options.caseSensitive);
    return options.fuzzy ? this.containsFuzzy(words, myWords) : this.contains(words, myWords);
  }

  contains(words, myWords) {
    return _.every(words, w => {
      return (myWords.indexOf(w) !== -1); 
    });
  }

  containsFuzzy(words, myWords) {
    return _.every(words, w => {
      return myWords.some(ww => (levenshtein(ww, w) <= Math.round((w.length + ww.length) / 9)));
    });
  }
}
