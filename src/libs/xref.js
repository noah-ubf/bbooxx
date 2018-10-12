const electron = window.require('electron');
const remote = electron.remote;
const fs = remote.require('fs');
const path = remote.require('path');
import * as _ from 'lodash';

import { numToEn, numFromEn } from './numeration';


export const engBooks = [ 
  'Genesis',
  'Exodus',
  'Leviticus',
  'Numbers',
  'Deuteronomy',
  'Joshua',
  'Judges',
  'Ruth',
  '1Samuel',
  '2Samuel',
  '1Kings',
  '2Kings',
  '1Chron',
  '2Chron',
  'Ezra',
  'Nehemiah',
  'Esther',
  'Job',
  'Psalms',
  'Proverbs',
  'Ecclesia',
  'Songs',
  'Isaiah',
  'Jeremiah',
  'Lamentations',
  'Ezekiel',
  'Daniel',
  'Hosea',
  'Joel',
  'Amos',
  'Obadiah',
  'Jonah',
  'Micah',
  'Nahum',
  'Habakkuk',
  'Zephaniah',
  'Haggai',
  'Zechariah',
  'Malachi',
  'Matthew',
  'Mark',
  'Luke',
  'John',
  'Acts',
  'Romans',
  '1Corinthians',
  '2Corinthians',
  'Galatians',
  'Ephesians',
  'Philippians',
  'Colossians',
  '1Thessalonians',
  '2Thessalonians',
  '1Timothy',
  '2Timothy',
  'Titus',
  'Philemon',
  'Hebrews',
  'James',
  '1Peter',
  '2Peter',
  '1John',
  '2John',
  '3John',
  'Jude',
  'Revelation',
];


const OBBooks = [
  'Gen',
  'Exod',
  'Lev',
  'Num',
  'Deut',
  'Josh',
  'Judg',
  'Ruth',
  '1Sam',
  '2Sam',
  '1Kgs',
  '2Kgs',
  '1Chr',
  '2Chr',
  'Ezra',
  'Neh',
  'Esth',
  'Job',
  'Ps',
  'Prov',
  'Eccl',
  'Song',
  'Isa',
  'Jer',
  'Lam',
  'Ezek',
  'Dan',
  'Hos',
  'Joel',
  'Amos',
  'Obad',
  'Jonah',
  'Mic',
  'Nah',
  'Hab',
  'Zeph',
  'Hag',
  'Zech',
  'Mal',
  'Matt',
  'Mark',
  'Luke',
  'John',
  'Acts',
  'Rom',
  '1Cor',
  '2Cor',
  'Gal',
  'Eph',
  'Phil',
  'Col',
  '1Thess',
  '2Thess',
  '1Tim',
  '2Tim',
  'Titus',
  'Phlm',
  'Heb',
  'Jas',
  '1Pet',
  '2Pet',
  '1John',
  '2John',
  '3John',
  'Jude',
  'Rev',
];


class XRefs {
  obxrefs = {};
  saved = false;

  constructor() {
    this.readOBXRefs();
  }

  readOBXRefs() {
    // console.log('filePath:', remote.app.getAppPath())
    const filePath = path.join(remote.app.getAppPath(), 'src', 'libs', 'ob_xrefs.dat');
    const buf = fs.readFileSync(filePath);
    const data = {};
    for (let i = 0; i < buf.length; i+=11) {
      let b1 = engBooks[buf[i] - 1];
      let c1 = buf[i + 1];
      let v1 = buf[i + 2];
      let b2 = engBooks[buf[i + 3] - 1];
      let c2 = buf[i + 4];
      let v2 = buf[i + 5];
      let b3 = engBooks[buf[i + 6] - 1];
      let c3 = buf[i + 7];
      let v3 = buf[i + 8];
      let w = buf.readUInt16BE(i + 9)
      if (!data[b1]) data[b1] = {};
      if (!data[b1][c1]) data[b1][c1] = {};
      if (!data[b1][c1][v1]) data[b1][c1][v1] = [];
      data[b1][c1][v1].push([b2, c2, v2, b3, c3, v3, w]);
    }
    console.log(data)
    this.obxrefs = data;
  }

  getOBRefs(verse) {
    const module = verse.getModule();
    const bookName = verse.getBook().getStandardName();
    const chNum = verse.getChapter().getNum();
    const vNum = verse.getNum();
    let refs = _.get(this.obxrefs, numToEn(module, [bookName, chNum, vNum]));
    return refs && refs.map(ref => ref && [
      ...numFromEn(module, [ref[0], ref[1], ref[2]]),
      ...numFromEn(module, [ref[3], ref[4], ref[5]]),
      ref[6],
    ]);
  }


  convertOBXrefs() {
    if (0&&this.saved) return;
    this.saved = true;
    console.log('convertOBXrefs:')
    const filePath = path.join(remote.app.getAppPath(), 'src', 'libs', 'ob_xrefs.txt');
    const filePathW = path.join(remote.app.getAppPath(), 'src', 'libs', 'ob_xrefs.dat');
    const str = fs.readFileSync(filePath, {encoding: 'utf-8'});
    const lines = str.split('\n').map(s => s.trim());
    const buf = Buffer.allocUnsafe(str.length / 2);
    let pos = 0;
    // OBBooks
    const re = /^([^.]+)\.(\d+)\.(\d+) +([^\.]+)\.(\d+)\.(\d+)(-([^\.]+)\.(\d+)\.(\d+))? +(-?\d+)/
    console.log('convertOBXrefs [start]:')
    lines.forEach((l, i) => {
      if (i === 0 || !l) return;
      const rs = re.exec(l);
      // if (i < 100) console.log(rs)
      if (!rs) return;
      const b0 = OBBooks.indexOf(rs[1]) + 1;
      if (!b0) return;
      const c0 = parseInt(rs[2], 10);
      const v0 = parseInt(rs[3], 10);

      const b1 = OBBooks.indexOf(rs[4]) + 1;
      if (!b1) return;
      const c1 = parseInt(rs[5], 10);
      const v1 = parseInt(rs[6], 10);

      const b2 = rs[8] ? OBBooks.indexOf(rs[8]) + 1 : b1;
      const c2 = rs[9] ? parseInt(rs[9], 10) : c1;
      const v2 = rs[10] ? parseInt(rs[10], 10) : v1;

      const w = parseInt(rs[11], 10);

      buf[pos] = b0;
      buf[pos + 1] = c0;
      buf[pos + 2] = v0;
      buf[pos + 3] = b1;
      buf[pos + 4] = c1;
      buf[pos + 5] = v1;
      buf[pos + 6] = b2;
      buf[pos + 7] = c2;
      buf[pos + 8] = v2;
      buf.writeInt16BE(w, pos + 9)
      pos += 11;
    });

    const buf1 = buf.slice(0, pos);

    fs.writeFileSync(filePathW, buf1);
  }
}

export default new XRefs();


