import * as _ from 'lodash';
import iconv from 'iconv-lite';
const electron = window.require('electron');
const fs = electron.remote.require('fs');

import parseLexems from './lexem_parser';


export default class BibleQuoteStrongNumbers {
  config = {};
  path = null;
  textPath = null;
  kind = '';
  loaded = false;
  index = {};

  constructor(path) {
    this.path = path;
    this.textPath = path.replace(/\.idx$/i, '.htm');
    this.name = 'Bible Quote Strongs Lexicon Module';
    if (path.match(/hebrew.idx$/i)) this.kind = 'H'; // this strange BibleQuote magic :(
    else if (path.match(/greek.idx$/i)) this.kind = 'G';
  }

  load() {
    if(this.loaded) return true;
    let index = this.readFile(this.path);
    if (!index) return false;
    index = index.split('\n');
    this.name = index[0];
    for(let i = 1; i < index.length; i+=2) {
      const num = parseInt(index[i], 10);
      let start = parseInt(index[i+1], 10);
      let end = (i + 3 < index.length)? parseInt(index[i+3], 10) : -1;
      const key = this.kind + num;
      this.index[key] = [start, end];
    }
    this.loaded = true;
  }

  readFile(fname) {
    try {
      return iconv.decode(fs.readFileSync(fname), 'win-1251'); // Looks like BQ is cyrillic-oriented, so...
    } catch (e) { return null; }
  }

  getName() {
    this.load();
    return this.name;
  }

  getPath() {
    return this.path;
  }

  getTextPath() {
    return this.textPath;
  }

  hasHebrew() {
    return (this.type === 'H');
  }

  hasGreek() {
    return (this.type === 'G');
  }

  get(num) {
    let kind = num[0];
    if (kind !== this.kind) return null;
    this.load();
    const key = kind + (num.replace(/^[^0-9]0*/, '') || 0);
    if (!this.index[key]) return null;
    const text = this.readFile(this.textPath);
    //TODO:  fs.readSync(fd, buffer, offset, length, position)
    if (!text) return null;
    let start = this.index[key][0];
    let end = this.index[key][1];
    const article = text.substring(start, end);
    const lexems = parseLexems(article, { hasStrongs: true });
    return {
      name: this.getName(),
      lexems,
    };
  }
}