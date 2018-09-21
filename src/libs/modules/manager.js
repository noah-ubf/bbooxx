import * as _ from 'lodash';

//TODO

export const standardBooks = [ 
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
  '1Esdras',
  '2Esdras',
  '1Maccabees',
  '2Maccabees',
  'Tobit',
  'Judith',
  'Wisdom',
  'Sirach',
  'Susanna',
  'Baruch',
  'Epistle',
  'Azariah',
  'Manasseh',
  'Bel',
];

export const bookNameVariants = {
  'Genesis': [],
  'Exodus': [],
  'Leviticus': [],
  'Numbers': [],
  'Deuteronomy': [],
  'Joshua': [],
  'Judges': [],
  'Ruth': [],
  '1Samuel': [],
  '2Samuel': [],
  '1Kings': [],
  '2Kings': [],
  '1Chron': [],
  '2Chron': [],
  'Ezra': [],
  'Nehemiah': [],
  'Esther': [],
  'Job': [],
  'Psalms': [],
  'Proverbs': [],
  'Ecclesia': [],
  'Songs': [],
  'Isaiah': [],
  'Jeremiah': [],
  'Lamentations': [],
  'Ezekiel': [],
  'Daniel': [],
  'Hosea': [],
  'Joel': [],
  'Amos': [],
  'Obadiah': [],
  'Jonah': [],
  'Micah': [],
  'Nahum': [],
  'Habakkuk': [],
  'Zephaniah': [],
  'Haggai': [],
  'Zechariah': [],
  'Malachi': [],
  'Matthew': [],
  'Mark': [],
  'Luke': [],
  'John': [],
  'Acts': [],
  'Romans': [],
  '1Corinthians': [],
  '2Corinthians': [],
  'Galatians': [],
  'Ephesians': ['Ephesian'],
  'Philippians': [],
  'Colossians': [],
  '1Thessalonians': [],
  '2Thessalonians': [],
  '1Timothy': [],
  '2Timothy': [],
  'Titus': [],
  'Philemon': [],
  'Hebrews': [],
  'James': [],
  '1Peter': [],
  '2Peter': [],
  '1John': [],
  '2John': [],
  '3John': [],
  'Jude': [],
  'Revelation': [],
  '1Esdras': [],
  '2Esdras': [],
  '1Maccabees': [],
  '2Maccabees': [],
  'Tobit': [],
  'Judith': [],
  'Wisdom': [],
  'Sirach': [],
  'Susanna': [],
  'Baruch': [],
  'Epistle': [],
  'Azariah': [],
  'Manasseh': [],
  'Bel': [],
};

export function getStandardName(book) {
  const index = standardBooks.indexOf(book.getName());
  if (index !== -1) return standardBooks[index];
  let name = _.find(standardBooks, w => (book.getShortNames().indexOf(w) !== -1));
  if (name) return name;
  _.forOwn(bookNameVariants, (v, k) => {
    book.getShortNames().forEach(n => {
      if (v.indexOf(n) !== -1) name = k;
    });
  })
  return name;
}
