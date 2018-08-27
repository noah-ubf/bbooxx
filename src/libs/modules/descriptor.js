import * as _ from 'lodash';

const descrRE = /^(\(([^)]+)\))?(([^.]+)\.)?(\d+)?(:(\d+)(-(\d+))?)?$/;
export const parseDescriptor = descr => {
  if (!descr) return [];
  const parts = descr.split(';');
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
    const verses = _.isUndefined(v1) ? null : (_.isUndefined(v2) ? [v1] : [v1, v2]);
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
  return verses.map(v => v.getDescriptor()).join(';');
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
