import * as _ from 'lodash';

import levenshtein from '../../levenshtein';

export default class Verse {
  params = null;
  text = null;
  numText = null;
  header = null;
  lexems = [];

  constructor(params=null) {
    if (!_.isNull(params)) {
      this.params = params;
      this.text = this.params.lines ? this.params.lines.join('\n') : '';
      this.parseLexems();
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

  getNum() {
    return +this.params.num;
  }

  getHeader() {
    if (_.isNull(this.header)) {
      const book = this.params.book.getShortName();
      const chapter = this.params.chapter.getNum();
      const verses = this.getNum(); // TODO: can be several verses in one text block, like in Turkish bible
      this.header = book[book.length-1] === '.' ? `${book}${chapter}:${verses}` : `${book}.${chapter}:${verses}`;
    }

    return this.header;
  }

  parseLexems() {
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(this.text, "text/html");
    let nodes = [...htmlDoc.childNodes[0].childNodes[1].childNodes];
    // console.log('NODES[0]: ', nodes)

    let plainTree = [];
    const convNodes = nodes => _.compact(nodes.map(n => {
      // console.log('===>', n, n.nodeName)
      if (n.nodeName === "#comment") {
        return null;
      } else if (n.nodeName === '#text') {
        return {t: 'text', text: n.textContent.trim()};
      } else if (n.nodeName !== 'IMG' && n.innerHTML === '') {
        return null;
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
        if (!node) {
          // skip
        } else if (node.t === 'text') {
          plainTree = parent.open ? [
            ...plainTree,
            {
              text: node.text,
              open: parent && parent.open,
              close: parent && parent.close,
            }
          ] : [
            ...plainTree,
            ..._.chain(node.text).split(' ').compact().map(s => ({
              text: s,
              open: parent && parent.open,
              close: parent && parent.close,
            }))
          ];
        } else if (node.children.length === 0) {
          plainTree = [...plainTree, {
            text: node.text,
            open: `${parent.open}${node.open}`,
            close: `${node.close}${parent.close}`,
          }];
        } else {
          walkTree(node.children, {
            open: `${parent.open}${node.open}`,
            close: `${node.close}${parent.close}`,
          });
        }
      });
    }

    nodes = convNodes(nodes);
    if (nodes.length === 1 && nodes[0].t === 'P') nodes = nodes[0].children;
    walkTree(nodes);
    
    if (this.params.module.isBible() && plainTree[0] && plainTree[0].text.match(/^[0-9]+$/)) {
      this.numText = plainTree[0].text;
      plainTree = plainTree.slice(1); // TODO groupped verses, like in Turkish
    }
    // console.log('NODES[1]: ', nodes, plainTree);
    // console.log('NODES[2]: ', JSON.stringify(nodes), JSON.stringify(plainTree));

    if (this.params.module.config.StrongNumbers === 'Y') {
      // TODO 
    }

    this.lexems = plainTree;
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
    // console.log('matches: ', words, options, this)
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
