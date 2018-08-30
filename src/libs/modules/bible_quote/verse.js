import * as _ from 'lodash';

import levenshtein from '../../levenshtein';
import parseLexems from './lexem_parser';

export default class Verse {
  params = null;
  text = null;
  numText = null;
  header = null;
  lexems = [];
  strongsCount = null;
  debug = {};

  constructor(params=null) {
    if (!_.isNull(params)) {
      this.params = params;
      this.text = this.params.lines ? this.params.lines.join('\n') : '';
      this.lexems = parseLexems(this.text, {
        hasStrongs: this.getModule().hasStrongNumbers(),
        hasVerseNumber: this.getModule().isBible(),
      });
      if (_.get(this.lexems,[0, 't']) === 'versenum') this.numText = _.get(this.lexems,[0, 't', 'verseNum']);
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
    this.debug = verse.debug;
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
      _.forEach(this.lexems, l => (this.strongsCount += (l.t === 'strong' ? 1 : 0) ));
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
