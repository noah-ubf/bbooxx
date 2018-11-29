import * as _ from 'lodash';

import Verse from './verse';

export default class Chapter {
  text = null;
  params = null;
  verses = null;

  constructor(params) {
    this.params = params;
  }

  getDescriptor() {
    const book = this.params.book.getDescriptor();
    const chapter = this.getNum();
    return `${book}.${chapter}`;
  }

  getNum() {
    return +this.params.num;
  }

  getName() {
    return this.params.name;
  }

  getModule() {
    return this.params.module;
  }

  getBook() {
    return this.params.book;
  }

  getText() {
    if (_.isNull(this.text)) this.text = this.params.book._getChapterText(this);
    return this.text;
  }

  getPrevChapter() {
    let chapters = this.getBook().getChapters();
    let index = chapters.indexOf(this);

    if (index === 0) {
      const book = this.getBook().getPrevBook();
      if (!book) return null;
      chapters = book.getChapters();
      index = chapters.length;
    }

    return chapters[index - 1];
  }

  getNextChapter() {
    let chapters = this.getBook().getChapters();
    let index = chapters.indexOf(this);

    if (index === chapters.length - 1) {
      const book = this.getBook().getNextBook();
      if (!book) return null;
      chapters = book.getChapters();
      index = -1;
    }

    return chapters[index + 1];
  }

  parse() {
    if (!_.isNull(this.verses)) return;
    const config = {
      module: this.params.module,
      book: this.params.book,
      chapter: this,
    };
    const chVerses = this.params.book._getChapterVerses(this);
    this.verses = chVerses.map((lines, num) => {
      return new Verse({...config, lines, num})
    });
  }

  getVerseByNum(num) {
    this.parse();
    return _.find(this.verses, v => (v.getNum() === +num));
  }

  getVerses(v1=null, v2=null) {
    return this._getVerses(v1, v2);
  }

  _getVerses(v1=null, v2=null) {
    this.parse();
    if (_.isNull(v1)) return this.verses.map(v => v.getNewInstance()).filter(v => (v.getNum() > 0));
    else if (_.isNull(v2)) return this.verses.filter(v => (v.getNum() === +v1)).map(v => v.getNewInstance());
    else return _.chain(this.verses)
      .filter(v => (v.getNum() >= +v1 && v.getNum() <= +v2))
      .map(v => v.getNewInstance())
      .value();
  }

  search(words, options) {
    return _.chain(this.getVerses())
      .map(v => v.matches(words, options) ? v.getNewInstance() : null)
      .compact()
      .value();
  }
}

