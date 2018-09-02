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

  hasStrongNumbers() {
    return this.config.StrongNumbers === 'Y';
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

  getBookByNum(num) {
    const res = this.books[num - 1];
    return res;
  }

  search(searchText, options, portion, done, stopped) {
    const words = _.chain(options.caseSensitive ? searchText : searchText.toLowerCase())
      .split(' ').compact().uniq().value();

    let books = options.book ? [options.book] : [...this.getBooks()];

    const searchNext = () => {
      if (stopped()) books = [];
      if (books.length === 0) return done();
      const book = books.shift();
      book.search(words, options, portion, () => setTimeout(() => searchNext(), 0), stopped);
    }

    searchNext();
  }
}