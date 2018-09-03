import * as _ from 'lodash';
import iconv from 'iconv-lite';
const electron = window.require('electron');
const fs = electron.remote.require('fs');

import Chapter from './chapter';
import { BIBLE_BOOKS } from '../descriptor';


export default class Book {
  module = null;
  params = null;
  lines = null;
  chapters = [];
  chLines = [];
  vLines = [];
  loaded = false;
  shortNames = [];
  bibleParams = {
    name: '',
    OT: false,
    NT: false,
    Ap: false,
    section: ''
  };

  constructor(params) {
    this.params = params;
    this.module = this.params.module;
    this.shortNames = _.chain(this.params).get('ShortName').split(' ').value() || [];
    const firstVal = this.params.ChapterZero === 'Y' ? 0 : 1;
    const lastVal = +this.params.ChapterQty + firstVal - 1;
    this.chapters = _.range(firstVal, lastVal + 1).map(i => new Chapter({
      module: this.module,
      book: this,
      num: i,
      name: `${i}`,
    }));
    if (this.getModule().isBible()) {
      this.shortNames.some(name => {
        if (!BIBLE_BOOKS[name]) return false;
        this.bibleParams = {
          ...this.bibleParams,
          ...BIBLE_BOOKS[name],
          name
        };
        return true;
      });
    }
  }

  getModule() {
    return this.module;
  }

  getDescriptor() {
    const module = this.module.getDescriptor();
    const name = this.getShortName();
    return `${module}${name}`;
  }

  load() {
    const fileContent = fs.readFileSync(this.params.path);
    const text = iconv.decode(fileContent, this.params.module.config.__encoding)
    this.lines = this._convertLines(text.split(/\r\n|\n\r|\n|\r/));

    if (this.params.module.config.ChapterZero !== 'Y') {
      this.chLines.push(0);
      this.vLines.push([]);
    }
    this.lines.forEach((l, i) => {
      if (l.indexOf(this.params.module.config.ChapterSign) !== -1) {
        this.chLines.push(i);
        if (this.vLines.length > 0) this.vLines[this.vLines.length - 1].push(i);
        this.vLines.push([i])
      }
      if (this.vLines.length > 0 && l.indexOf(this.params.module.config.VerseSign) !== -1) {
        this.vLines[this.vLines.length - 1].push(i);
      }
    })
    this.chLines.push(this.lines.length);
    if (this.vLines.length > 0) this.vLines[this.vLines.length - 1].push(this.lines.length);
    this.loaded = true;
    // console.log('LOAD:', this.lines, this.chLines, this.vLines);
  }

  getName() {
    return this.params.FullName;
  }

  getNum() {
    return this.params.num;
  }

  getShortName() {
    let name = _.first(this.shortNames);
    if (_.isUndefined(name)) name = this.getNum();
    else name = name.replace(/\.$/, '');
    return name;
  }

  getChapters() {
    return this.chapters;
  }

  getChapterByNum(num) {
    const res = _.find(this.chapters, c => (c.getNum() === +num));
    return res;
  }

  getText(chapter) {
    if (!this.loaded) this.load();

    return this.lines && this.lines.join('\n');
  }

  _getChapterText(chapter) {
    // returns whole chapter as a text
    if (!this.loaded) this.load();

    const text = this.lines.slice(
      this.chLines[chapter.getNum()],
      this.chLines[chapter.getNum() + 1]
    ).join('\n');

    if(this.module.config.DesiredFontName) {
      return `<font face="${this.module.config.DesiredFontName}">${text}</font>`;
    }
    return text;
  }

  _convertLines(lines) {
    // const regexp = /<\/?(table|tr|td|p|sup|dl|dt|dd|big|small)( [^>]*)?>/i;
    const regexpBR = /<(\/body|\/html)( [^>]*)?>/ig;

    return lines.map(s => {
      // s = s.replace(regexp, '');
      s = s.replace(regexpBR, '');
      s = s.replace(/^src=/i, '  src=');
      s = s.split(/ src=/i).map((ss, i) => {
        if (i === 0 ) return ss;
        let index;
        let uri;
        let rest;
        if (ss[0] === '"') {
          ss = ss.substr(1);
          index = ss.indexOf('"');
          uri = ss.substr(0, index);
          rest = ss.substr(index + 1);
        } else {
          index = ss.indexOf('>');
          uri = ss.substr(0, index);
          rest = ss.substr(index);
        }
        const fname = decodeURI(uri).replace('\\', '/');
        let data = this.readFile(fname) || this.readFile(fname.toLowerCase()) || this.readFile(fname.toUpperCase());
        if (!data) return ss;
        const dataUrl = data.toString('base64');
        return `"data:image/gif;base64,${dataUrl}"${rest}`
      }).join(' src=');
      return s;
    })
  }

  readFile(fname) {
    try {
      return fs.readFileSync(`${this.module.path}${fname}`);
    } catch (e) { return null; }
  }

  _getChapterVerses(chapter) {
    if (!this.loaded) this.load();

    const positions = this.vLines[chapter.getNum()];
    const verseTexts = _.map(positions, (vl, i) => {
      if (i === 0) return null;
      return this.lines.slice(positions[i - 1], positions[i]);
    });
    return verseTexts.slice(1);
  }

  search(words, options, portion, done, stopped) {
    let chapters = [...this.getChapters()];

    const searchNext = () => {
      if (stopped()) chapters = [];
      if (chapters.length === 0) return done();
      const chapter = chapters.shift();
      const descriptor = chapter.getDescriptor();
      portion(chapter.search(words, options), descriptor);
      setTimeout(() => searchNext(), 0);
    }

    searchNext();
  }

  getStandardName() {
    
  }

  isOT() { return this.bibleParams.OT; }

  isNT() { return this.bibleParams.NT; }
}
