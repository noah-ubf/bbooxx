import * as _ from 'lodash';
import iconv from 'iconv-lite';
const electron = window.require('electron');
const fs = electron.remote.require('fs');

import Chapter from './chapter';


export default class Book {
  module = null;
  params = null;
  lines = null;
  chapters = [];
  chLines = [];
  vLines = [];
  loaded = false;

  constructor(params) {
    this.params = params;
    this.module = this.params.module;
    const firstVal = this.params.ChapterZero === 'Y' ? 0 : 1;
    const lastVal = +this.params.ChapterQty;
    this.chapters = _.range(firstVal, lastVal + 1).map(i => new Chapter({
      module: this.module,
      book: this,
      num: i,
      name: `${i}`,
    }));
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

  getShortName() {
    let name = _.chain(this.params).get('ShortName').split(' ').first().value();
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
      s = s.replace(/^src="/, '  src="');
      s = s.split(' src="').map((ss, i) => {
        if (i === 0 ) return ss;
        const index = ss.indexOf('"');
        const fname = decodeURI(ss.substr(0, index)).replace('\\', '/');
        const rest = ss.substr(index);
        const fullPath = `${this.module.path}${fname}`;
        try {
          const data = fs.readFileSync(fullPath);
          const dataUrl = data.toString('base64');
          return `data:image/gif;base64,${dataUrl}${rest}`
        } catch (e) {
        }
        return ss;
      }).join(' src="');
      return s;
    })
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
      portion(chapter.search(words, options));
      setTimeout(() => searchNext(), 0);
    }

    searchNext();
  }
}
