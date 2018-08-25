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
    return this.params.num;
  }

  getName() {
    return this.params.name;
  }

  getText() {
    if (_.isNull(this.text)) this.text = this.params.book._getChapterText(this);
    return this.text;
  }

  parse() {
    if (!_.isNull(this.verses)) return;
    const config = {
      module: this.params.module,
      book: this.params.book,
      chapter: this,
    };
    this.verses = this.params.book._getChapterVerses(this).map((lines, num) => new Verse({...config, lines, num}));
  }

  getVerses() {
    this.parse();
    return this.verses.map(v => v.getNewInstance());
  }

  search(words, options) {
    return _.chain(this.getVerses())
      .map(v => v.matches(words, options) ? v.getNewInstance() : null)
      .compact()
      .value();
  }
}

