import * as _ from 'lodash';

import levenshtein from '../../levenshtein';
import parseLexems from './lexem_parser';
import XRefs from '../../../libs/xref';

export default class Verse {
  params = null;
  text = null;
  numText = null;
  header = null;
  lexems = null;
  strongsCount = null;
  debug = {};
  words = null;
  descriptor = null;
  xrefs = null;

  constructor(params=null) {
    if (!_.isNull(params)) {
      this.params = params;
      this.text = this.params.lines ? this.params.lines.join('\n') : '';
      if (params.module.isBible() && this.text) {
        // const rere = /^(\D*(<[^>]>)*)*(\d+([.>-]\d+)?)/.exec(this.text.substring(0, 50)); // TODO
        const rere = /(\d+)/.exec(this.text.substring(0, 50));
        if (rere) this.numText = rere[1];
        else this.numText = parseInt(this.text.replace(/^\D+/, ''), 10);
      } else {
        this.numText = params.num;
      }
    }
  }

  parseLexems() {
    if (this.lexems === null) {
      this.lexems = parseLexems(this.text, {
        hasStrongs: this.getModule().hasStrongNumbers(),
        hasVerseNumber: this.getModule().isBible(),
        font: this.getModule().config.DesiredFontName,
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
    this.xrefs = verse.xrefs;
    return this;
  }

  getDescriptor() {
    if (_.isNull(this.descriptor)) {
      const module = this.params.module.getShortName();
      const book = this.params.book.getShortName();
      const chapter = this.params.chapter.getNum();
      const verse = this.getNum();
      this.descriptor = `(${module})${book}.${chapter}:${verse}`;
    }
    return this.descriptor;
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
    this.parseLexems();
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
    this.parseLexems();
    return this.lexems;
  }

  getWords(caseSensitive) {
    if (_.isNull(this.words)) {
      const text = this.text.replace(/<\/?[^>]*>/, ' ');
      this.words = _.chain(text.split(/[ ,.:;+'"!?()[\]\\\/-]+/))
        .map(w => {
          if(!caseSensitive) w = w.toLowerCase();
          return w === '' ? null : w;
        })
        .compact()
        .uniq()
        .value();
    }
    return this.words;
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

  getXRefs() {
    if (!this.getModule().isBible()) return [];
    if (!this.xrefs) this.xrefs = XRefs.getOBRefs(this);
    return this.xrefs;
  }

  getPlainText() {
    return this.getLexems().filter(l => l.t !== 'strong').map(l => l.text).join(' ').replace(/ ([.,;:!?)])/g, '$1');
  }

  getNextVerse() {
    let verses = this.getChapter().getVerses();
    let index;
    verses.forEach((v, i) => { if (v.getNum() === this.getNum()) { index = i; } });

    if (index === verses.length - 1) {
      const chapter = this.getChapter().getNextChapter();
      if (!chapter) return null;
      verses = chapter.getVerses();
      index = -1;
    }

    return verses[index + 1];
  }
}
