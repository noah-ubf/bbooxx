import * as _ from 'lodash';

import Book from './book';


export default class BibleQuoteModule {
  config = {};
  path = null;
  filename = null;

  constructor(config, path, filename = null) {
    this.config = config;
    this.path = path;
    this.filename = filename;
    this.books = config.books.map(book => new Book({
      ...book,
      module: this,
      path: `${path}${book.PathName}`,
      ChapterZero: this.config.ChapterZero,
    }));
  }

  getDescriptor() {
    const name = this.getShortName();
    return `(${name})`;
  }

  getName() {
    return this.config.BibleName;
  }

  getShortName() {
    return this.config.BibleShortName;
  }

  getFileName() {
    return this.filename;
  }

  isBible() {
    return this.config.Bible === 'Y';
  }

  isRightToLeft() {
    return this.config.Lefttoright === 'N';
  }

  getBooks() {
    return [...this.books];
  }

  getBookByShortName(name) {
    const res = _.find(this.books, b => (b.getShortName() === name));
    return res;
  }

  search(searchText, options, portion, done, stopped) {
    const words = _.chain(options.caseSensitive ? searchText : searchText.toLowerCase())
      .split(' ').compact().uniq().value();
    // return this.getBooks()[0].search(words, options);
    let books = [...this.getBooks()];

    const searchNext = () => {
      if (stopped()) books = [];
      if (books.length === 0) return done();
      const book = books.shift();
      book.search(words, options, portion, () => setTimeout(() => searchNext(), 0), stopped);
    }

    searchNext();
  }
}