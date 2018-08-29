import * as _ from 'lodash';

const descrRE = /^(\(([^)]+)\))?(([^.]+)\.)?(\d+)?(:(\d+)(-(\d+))?)?$/;
export const parseDescriptor = descr => {
  if (!descr) return [];
  const parts = descr.replace(/,/g, ';:').split(';');
  let moduleDescr = '';
  let bookDescr = '';
  let chapterDescr = '';
  return _.compact(parts.map(p => {
    const info = descrRE.exec(p);
    if (!info) return null;
    if (info[2]) moduleDescr = info[2];
    if (info[4]) bookDescr = info[4];
    if (info[5]) chapterDescr = info[5];
    const v1 = info[7];
    const v2 = info[9];
    const verses = _.isUndefined(v1) ? null : (_.isUndefined(v2) ? [+v1] : [+v1, +v2]);
    if (!moduleDescr || !bookDescr || !chapterDescr) return null;
    return {
      module: moduleDescr,
      book: bookDescr,
      chapter: chapterDescr,
      verses,
    };
  }));
}

export const getDescriptorFromList = (verses) => {
  return compactDescriptor(verses.map(v => v.getDescriptor()).join(';'));
}

export const getListFromDescriptor = (li, modulesDict) => {
  switch(li.type) {
    case 'search': {
      return [];
    }

    case 'tab': {
      const list = parseDescriptor(li.descriptor);
      let verses = [];
      list.forEach(o => {
        const module = modulesDict[o.module];
        if (!module) return;
        const book = module.getBookByShortName(o.book);
        if (!book) return;
        const chapter = book.getChapterByNum(o.chapter);
        if (!chapter) return;
        if (!o.verses) verses = [...verses, ...chapter.getVerses()];
        else if (o.verses.length === 2) verses = [...verses, ...chapter.getVerses(o.verses[0], o.verses[1])];
        else verses = [...verses, ...chapter.getVerses(o.verses[0])];
      });
      return verses;
    }

    default: {
      return [];
    }
  }
}

export function compactDescriptor(descriptor) {
  const list = parseDescriptor(descriptor);
  let res = [];

  let module = null;
  let book = null;
  let chapter = null;

  list.forEach(o => {
    const r = res[res.length - 1];
    if (res.length > 0
      && module === o.module 
      && book === o.book 
      && chapter === o.chapter 
      && ((r.verses[1] || r.verses[0]) + 1 === o.verses[0])) {
      r.verses = [r.verses[0], (o.verses[1] || o.verses[0])]
    } else {
      res.push({
        ...o,
        module: (r && module === o.module) ? '' : o.module,
        book: (r && module === o.module && book === o.book) ? '' : o.book,
        chapter: (r && module === o.module && book === o.book && chapter === o.chapter) ? '' : o.chapter,
      });
    }

    module = o.module;
    book = o.book;
    chapter = o.chapter;
  });

  const ret = res.map(o => {
    let module = o.module ? `(${o.module})` : '';
    let book = o.book ? `${o.book}` : '';
    let chapter = o.chapter ? `.${o.chapter}` : '';
    let verses = (o.verses && o.verses.join('-')) || '';
    if (verses) verses = `:${verses}`;
    return `${module}${book}${chapter}${verses}`;
  }).join(';').replace(/;:/g, ',');

  return ret;
}

export const BIBLE_BOOKS = {
  'Genesis':        {OT: true, NT: false, Ap: false, section: ''},
  'Exodus':         {OT: true, NT: false, Ap: false, section: ''},
  'Leviticus':      {OT: true, NT: false, Ap: false, section: ''},
  'Numbers':        {OT: true, NT: false, Ap: false, section: ''},
  'Deuteronomy':    {OT: true, NT: false, Ap: false, section: ''},
  'Joshua':         {OT: true, NT: false, Ap: false, section: ''},
  'Judges':         {OT: true, NT: false, Ap: false, section: ''},
  'Ruth':           {OT: true, NT: false, Ap: false, section: ''},
  '1Samuel':        {OT: true, NT: false, Ap: false, section: ''},
  '2Samuel':        {OT: true, NT: false, Ap: false, section: ''},
  '1Kings':         {OT: true, NT: false, Ap: false, section: ''},
  '2Kings':         {OT: true, NT: false, Ap: false, section: ''},
  '1Chron':         {OT: true, NT: false, Ap: false, section: ''},
  '2Chron':         {OT: true, NT: false, Ap: false, section: ''},
  'Ezra':           {OT: true, NT: false, Ap: false, section: ''},
  'Nehemiah':       {OT: true, NT: false, Ap: false, section: ''},
  'Esther':         {OT: true, NT: false, Ap: false, section: ''},
  'Job':            {OT: true, NT: false, Ap: false, section: ''},
  'Psalms':         {OT: true, NT: false, Ap: false, section: ''},
  'Proverbs':       {OT: true, NT: false, Ap: false, section: ''},
  'Ecclesia':       {OT: true, NT: false, Ap: false, section: ''},
  'Songs':          {OT: true, NT: false, Ap: false, section: ''},
  'Isaiah':         {OT: true, NT: false, Ap: false, section: ''},
  'Jeremiah':       {OT: true, NT: false, Ap: false, section: ''},
  'Lamentations':   {OT: true, NT: false, Ap: false, section: ''},
  'Ezekiel':        {OT: true, NT: false, Ap: false, section: ''},
  'Daniel':         {OT: true, NT: false, Ap: false, section: ''},
  'Hosea':          {OT: true, NT: false, Ap: false, section: ''},
  'Joel':           {OT: true, NT: false, Ap: false, section: ''},
  'Amos':           {OT: true, NT: false, Ap: false, section: ''},
  'Obadiah':        {OT: true, NT: false, Ap: false, section: ''},
  'Jonah':          {OT: true, NT: false, Ap: false, section: ''},
  'Micah':          {OT: true, NT: false, Ap: false, section: ''},
  'Nahum':          {OT: true, NT: false, Ap: false, section: ''},
  'Habakkuk':       {OT: true, NT: false, Ap: false, section: ''},
  'Zephaniah':      {OT: true, NT: false, Ap: false, section: ''},
  'Haggai':         {OT: true, NT: false, Ap: false, section: ''},
  'Zechariah':      {OT: true, NT: false, Ap: false, section: ''},
  'Malachi':        {OT: true, NT: false, Ap: false, section: ''},
  'Matthew':        {OT: false, NT: true, Ap: false, section: ''},
  'Mark':           {OT: false, NT: true, Ap: false, section: ''},
  'Luke':           {OT: false, NT: true, Ap: false, section: ''},
  'John':           {OT: false, NT: true, Ap: false, section: ''},
  'Acts':           {OT: false, NT: true, Ap: false, section: ''},
  'James':          {OT: false, NT: true, Ap: false, section: ''},
  '1Peter':         {OT: false, NT: true, Ap: false, section: ''},
  '2Peter':         {OT: false, NT: true, Ap: false, section: ''},
  '1John':          {OT: false, NT: true, Ap: false, section: ''},
  '2John':          {OT: false, NT: true, Ap: false, section: ''},
  '3John':          {OT: false, NT: true, Ap: false, section: ''},
  'Jude':           {OT: false, NT: true, Ap: false, section: ''},
  'Romans':         {OT: false, NT: true, Ap: false, section: ''},
  '1Corinthians':   {OT: false, NT: true, Ap: false, section: ''},
  '2Corinthians':   {OT: false, NT: true, Ap: false, section: ''},
  'Galatians':      {OT: false, NT: true, Ap: false, section: ''},
  'Ephesians':      {OT: false, NT: true, Ap: false, section: ''},
  'Philippians':    {OT: false, NT: true, Ap: false, section: ''},
  'Colossians':     {OT: false, NT: true, Ap: false, section: ''},
  '1Thessalonians': {OT: false, NT: true, Ap: false, section: ''},
  '2Thessalonians': {OT: false, NT: true, Ap: false, section: ''},
  '1Timothy':       {OT: false, NT: true, Ap: false, section: ''},
  '2Timothy':       {OT: false, NT: true, Ap: false, section: ''},
  'Titus':          {OT: false, NT: true, Ap: false, section: ''},
  'Philemon':       {OT: false, NT: true, Ap: false, section: ''},
  'Hebrews':        {OT: false, NT: true, Ap: false, section: ''},
  'Revelation':     {OT: false, NT: true, Ap: false, section: ''},
  '1Mak':           {OT: false, NT: false, Ap: true, section: ''},
  '2Mak':           {OT: false, NT: false, Ap: true, section: ''},
  '3Mak':           {OT: false, NT: false, Ap: true, section: ''},
  'Bar':            {OT: false, NT: false, Ap: true, section: ''},
  '2Ez':            {OT: false, NT: false, Ap: true, section: ''},
  '3Ez':            {OT: false, NT: false, Ap: true, section: ''},
  'Judith':         {OT: false, NT: false, Ap: true, section: ''},
}