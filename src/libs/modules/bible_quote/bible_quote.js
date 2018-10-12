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
    this.books = config.books.map((book, i) => new Book({
      ...book,
      module: this,
      path: `${path}${book.PathName}`,
      ChapterZero: this.config.ChapterZero,
      num: i + 1,
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
    const res = _.find(this.books, b => (b.getName() === name || b.getStandardName() === name || b.getShortNames().indexOf(name) !== -1));
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

  getXrefVerses(xref) {
    // console.log('getXrefVerses: ', xref)
    let book = this.getBookByShortName(xref[0]); if (!book) return [];
    const book2 = this.getBookByShortName(xref[3]) || book;
    if (book !== book2 && book.getNextBook() !== book2) return [];
    if (book === book2 && xref[4] < xref[1]) return [];
    let chapter =  book.getChapterByNum(xref[1]); if (!chapter) return [];
    if (xref[4] === xref[1] && xref[5] < xref[2]) return [];
    let verse = chapter.getVerseByNum(xref[2]); if (!verse) return [];
    let verses = [ verse ];
    let i = 0;
    while (i++ < 30 && verse
      && (verse.getChapter().getNum() < xref[4]
          || (verse.getChapter().getNum() === xref[4] && verse.getNum() < xref[5])
    )) {
      verse = verse.getNextVerse();
      if (verse) verses.push(verse);
    }
    return verses;
  }
}