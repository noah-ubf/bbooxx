import * as _ from 'lodash';
import iconv from 'iconv-lite';

import BibleQuoteModule from './modules/bible_quote/bible_quote';


const ENCODINGS = {
  '162': 'windows-1254',
  '129': 'EUC-KR',
  '201': 'windows-1252',
};

const getEncoding = text => {
  const configText = text && text.toString().split(/\r\n|\n\r|\n|\r/);
  let res = null;

  if (!configText) return null;

  configText.some(line => {
    const parsed = line.split(/^([^=]+)=/);
    if (parsed.length < 3) return false;
    const key = parsed[1].trim();
    const val = parsed[2].trim();
    if ((key === 'DesiredFontCharset' || key === 'DefaultEncoding') && val) {
      res = key === 'DefaultEncoding' ? val : ENCODINGS[parsed[2].trim()];
      return true;
    }
    return false;
  });

  return res || 'windows-1251';
};


const defaultConfig = {
  BibleName: '',
  BibleShortName: '',
  Bible: '',
  OldTestament: '',
  NewTestament: '',
  Apocrypha: '',
  Greek: '',
  Alphabet: '',
  DesiredFontName: null,
  DesiredFontCharset: null,
  ChapterSign: '',
  VerseSign: '',
  BookQty: 0,
  SoundDirectory: null,
};


export default (text, path, filename) => {
  if (!text) return null;

  const config = { 
    ...defaultConfig,
    __encoding: getEncoding(text),
    path,
    filename,
    books: []
  };

  let configText = '';
  try {
    configText = iconv.decode(text, config.__encoding).split(/\r\n|\n\r|\n|\r/);
  } catch(e) {
    console.log(e.message);
    return null;
  }

  if (!configText) return null;

  let bookNum = -1;
  configText.forEach(line => {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed[0] === ';' || (trimmed[0] === '/' && trimmed[1] === '/')) return;
    const parsed = line.split(/^([^=]+)=/);
    if (parsed.length < 3) return;
    const key = parsed[1].trim();
    const value = parsed[2].trim();
    switch (key) {
      case 'PathName': {
        bookNum++;
        _.set(config.books, `[${bookNum}].${key}`, value);
        break;
      }
      case 'FullName':
      case 'ShortName':
      case 'ChapterQty': {
        _.set(config.books, `[${bookNum}].${key}`, value);
        break;
      }
      case '__encoding': break;
      default:
        config[key] = value;
    }
  });

  if (!config.BibleName || config.books.length === 0) return null;

  return new BibleQuoteModule(config, path, filename);
}
