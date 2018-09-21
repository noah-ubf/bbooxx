import * as _ from 'lodash';


const psalmsVerseCount = {
  1: 6,
  2: 12,
  3: 8,
  4: 8,
  5: 12,
  6: 10,
  7: 17,
  8: 9,
  9: 20,
  10: 18,
  11: 7,
  12: 8,
  13: 6,
  14: 7,
  15: 5,
  16: 11,
  17: 15,
  18: 50,
  19: 14,
  20: 9,
  21: 13,
  22: 31,
  23: 6,
  24: 10,
  25: 22,
  26: 12,
  27: 14,
  28: 9,
  29: 11,
  30: 12,
  31: 24,
  32: 11,
  33: 22,
  34: 22,
  35: 28,
  36: 12,
  37: 40,
  38: 22,
  39: 13,
  40: 17,
  41: 13,
  42: 11,
  43: 5,
  44: 26,
  45: 17,
  46: 11,
  47: 9,
  48: 14,
  49: 20,
  50: 23,
  51: 19,
  52: 9,
  53: 6,
  54: 7,
  55: 23,
  56: 13,
  57: 11,
  58: 11,
  59: 17,
  60: 12,
  61: 8,
  62: 12,
  63: 11,
  64: 10,
  65: 13,
  66: 20,
  67: 7,
  68: 35,
  69: 36,
  70: 5,
  71: 24,
  72: 20,
  73: 28,
  74: 23,
  75: 10,
  76: 12,
  77: 20,
  78: 72,
  79: 13,
  80: 19,
  81: 16,
  82: 8,
  83: 18,
  84: 12,
  85: 13,
  86: 17,
  87: 7,
  88: 18,
  89: 52,
  90: 17,
  91: 16,
  92: 15,
  93: 5,
  94: 23,
  95: 11,
  96: 13,
  97: 12,
  98: 9,
  99: 9,
  100: 5,
  101: 8,
  102: 28,
  103: 22,
  104: 35,
  105: 45,
  106: 48,
  107: 43,
  108: 13,
  109: 31,
  110: 7,
  111: 10,
  112: 10,
  113: 9,
  114: 8,
  115: 18,
  116: 19,
  117: 2,
  118: 29,
  119: 176,
  120: 7,
  121: 8,
  122: 9,
  123: 4,
  124: 8,
  125: 5,
  126: 6,
  127: 5,
  128: 6,
  129: 8,
  130: 8,
  131: 3,
  132: 18,
  133: 3,
  134: 3,
  135: 21,
  136: 26,
  137: 9,
  138: 8,
  139: 24,
  140: 13,
  141: 10,
  142: 7,
  143: 12,
  144: 15,
  145: 21,
  146: 10,
  147: 20,
  148: 14,
  149: 9,
  150: 6,
};

export function numToEn(module, [b, ch, v]) {
  const book = module.getBookByShortName(b);
  const vcount = ch => {
    const chapter = book.getChapterByNum(ch);
    if (!chapter) return null;
    return chapter.getVerses().length;
  }

  const vShift = (ch1, cnt, cntRst) => {
    if (vcount(ch1) !== cnt || (ch !== ch1 && ch !== ch + 1)) return false;
    const virtNum = ch === ch1 ? v : v + cnt;
    if (virtNum > cntRst) return [b, ch1 + 1, virtNum - cntRst];
    return [b, ch1, v];
  }

  switch (book.getStandardName()) {
    case 'Genesis': {
      const res = vShift(31, 55, 54);
      if (res) return res;
      break;
    }
    case 'Exodus': {
      const res = vShift(7, 25, 29);
      if (res) return res;
      const res2 = vShift(21, 36, 37);
      if (res2) return res2;
      break;
    }
    case 'Leviticus': {
      const res = vShift(5, 19, 26);
      if (res) return res;
      break;
    }
    case 'Numbers': {
      const res = vShift(12, 15, 16);
      if (res) return res;
      const res2 = vShift(16, 50, 35);
      if (res2) return res2;
      const res3 = vShift(29, 39, 40);
      if (res3) return res3;
      break;
    }
    case 'Deuteronomy': {
      const res = vShift(12, 32, 31);
      if (res) return res;
      const res2 = vShift(22, 30, 29);
      if (res2) return res2;
      const res3 = vShift(28, 68, 69);
      if (res3) return res3;
      break;
    }
    case 'Joshua': {
      const res = vShift(5, 16, 15);
      if (res) return res;
      break;
    }
    case '1Samuel': {
      const res = vShift(23, 28, 29);
      if (res) return res;
      break;
    }
    case '2Samuel': {
      const res = vShift(18, 33, 32);
      if (res) return res;
      break;
    }
    case '1Kings': {
      const res = vShift(4, 34, 20);
      if (res) return res;
      break;
    }
    case '2Kings': {
      const res = vShift(11, 21, 20);
      if (res) return res;
      break;
    }
    case '1Chron': {
      const res = vShift(5, 26, 41);
      if (res) return res;
      break;
    }
    case '2Chron': {
      const res = vShift(1, 17, 18);
      if (res) return res;
      const res2 = vShift(13, 22, 23);
      if (res2) return res2;
      break;
    }
    case 'Nehemiah': {
      const res = vShift(3, 32, 38);
      if (res) return res;
      const res2 = vShift(9, 38, 37);
      if (res2) return res2;
      break;
    }
    // case 'Esther': {
    //   break;
    // }
    // case 'Job': {
    //   break;
    // }
    case 'Psalms': {
      const isGreek = (vcount(9) > 20);
      const cntEn9 = 20;
      const cntEn114 = 8;
      let chEn = ch;
      let vEn = v;

      if (isGreek) {
        if (ch <= 8 || ch >= 148) {
        } else if (ch === 9) {
          if (v < cntEn9) { chEn = 9; vEn = v; }
          else { chEn = 10; vEn = v - cntEn9; }
        } else if (ch >= 10 && ch <= 112) {
          chEn = ch + 1;
        } else if (ch === 113) {
          if (v < cntEn114) { chEn = 114; vEn = v; }
          else { chEn = 115; vEn = v - cntEn114; }
        } else if (ch === 114) {
          chEn = 116;
        } else if (ch === 115) {
          chEn = 116; vEn = v + vcount(114);
        } else if (ch >= 116 && ch <=145) {
          chEn = ch + 1;
        } else if (ch === 146) {
          chEn = 147;
        } else if (ch === 147) {
          chEn = 147; vEn = v + vcount(146);
        }
      }
      return [b, chEn, vEn];
    }
    //   1–8       1–8
    //   9–10      9
    //   11–113    10–112
    //   114–115   113
    //   116       114–115
    //   117–146   116–145
    //   147       146–147
    //   148–150   148–150

    // case 'Proverbs': {
    //   break;
    // }
    case 'Ecclesia': {
      const res = vShift(4, 17, 16);
      if (res) return res;
      break;
    }
    case 'Songs': {
      const res = vShift(6, 12, 13);
      if (res) return res;
      break;
    }
    case 'Isaiah': {
      const res = vShift(8, 22, 23);
      if (res) return res;
      break;
    }
    case 'Jeremiah': {
      const res = vShift(8, 22, 23);
      if (res) return res;
      break;
    }
    case 'Ezekiel': {
      const res = vShift(20, 49, 44);
      if (res) return res;
      break;
    }
    // case 'Daniel': {
    //   break;
    // }
    case 'Hosea': {
      const res = vShift(1, 11, 9);
      if (res) return res;
      const res2 = vShift(11, 12, 11);
      if (res2) return res2;
      const res3 = vShift(13, 15, 16);
      if (res3) return res3;
      break;
    }
    case 'Jonah': {
      const res = vShift(1, 16, 17);
      if (res) return res;
      break;
    }
    // case 'Joel': {
    //   break;
    // }
    case 'Micah': {
      const res = vShift(4, 13, 14);
      if (res) return res;
      break;
    }
    case 'Nahum': {
      const res = vShift(1, 15, 14);
      if (res) return res;
      break;
    }
    case 'Zechariah': {
      const res = vShift(1, 21, 17);
      if (res) return res;
      break;
    }
    // case 'Malachi': {
    //   break;
    // }
    // case 'Acts': {
    //   break;
    // }
    // case 'Romans': {
    //   break;
    // }
    // case '2Corinthians': {
    //   break;
    // }
    // case '3John': {
    //   break;
    // }
    // case 'Revelation': {
    //   break;
    // }
    default: {
    }
  }
  return [b, ch, v];
}

export function numFromEn(module, [b, ch, v]) {
  const book = module.getBookByShortName(b);
  if (!book) {
    return [];
  }

  const vcount = ch => {
    const chapter = book.getChapterByNum(ch);
    if (!chapter) return null;
    return chapter.getVerses().length;
  }

  const vShift = (ch1, cnt, cntRst) => {
    if (vcount(ch1) !== cnt || (ch !== ch1 && ch !== ch + 1)) return false;
    if (ch !== ch1 && ch !== ch + 1) return false;
    const virtNum = ch === ch1 ? v : v + cntRst;
    if (virtNum > cnt) return [b, ch1 + 1, virtNum - cnt];
    return [b, ch1, v];
  }

  switch (book.getStandardName()) {
    case 'Genesis': {
      const res = vShift(31, 55, 54);
      if (res) return res;
      break;
    }
    case 'Exodus': {
      const res = vShift(7, 25, 29);
      if (res) return res;
      const res2 = vShift(21, 36, 37);
      if (res2) return res2;
      break;
    }
    case 'Leviticus': {
      const res = vShift(5, 19, 26);
      if (res) return res;
      break;
    }
    case 'Numbers': {
      const res = vShift(12, 15, 16);
      if (res) return res;
      const res2 = vShift(16, 50, 35);
      if (res2) return res2;
      const res3 = vShift(29, 39, 40);
      if (res3) return res3;
      break;
    }
    case 'Deuteronomy': {
      const res = vShift(12, 32, 31);
      if (res) return res;
      const res2 = vShift(22, 30, 29);
      if (res2) return res2;
      const res3 = vShift(28, 68, 69);
      if (res3) return res3;
      break;
    }
    case 'Joshua': {
      const res = vShift(5, 16, 15);
      if (res) return res;
      break;
    }
    case '1Samuel': {
      const res = vShift(23, 28, 29);
      if (res) return res;
      break;
    }
    case '2Samuel': {
      const res = vShift(18, 33, 32);
      if (res) return res;
      break;
    }
    case '1Kings': {
      const res = vShift(4, 34, 20);
      if (res) return res;
      break;
    }
    case '2Kings': {
      const res = vShift(11, 21, 20);
      if (res) return res;
      break;
    }
    case '1Chron': {
      const res = vShift(5, 26, 41);
      if (res) return res;
      break;
    }
    case '2Chron': {
      const res = vShift(1, 17, 18);
      if (res) return res;
      const res2 = vShift(13, 22, 23);
      if (res2) return res2;
      break;
    }
    case 'Nehemiah': {
      const res = vShift(3, 32, 38);
      if (res) return res;
      const res2 = vShift(9, 38, 37);
      if (res2) return res2;
      break;
    }
    // case 'Esther': {
    //   break;
    // }
    // case 'Job': {
    //   break;
    // }
    case 'Psalms': {
      const isGreek = (vcount(9) > 20);
      const cntEn9 = 20;
      const cntEn116 = 19;
      let chEn = ch;
      let vEn = v;

      if (isGreek) {
        if (ch <= 8 || ch >= 148) {
        } else if (ch === 9) {
          if (v < cntEn9) { chEn = 9; vEn = v; }
          else { chEn = 10; vEn = v - cntEn9; }
        } else if (ch >= 11 && ch <= 113) {
          chEn = ch - 1;
        } else if (ch === 114) {
          chEn = 113;
        } else if (ch === 115) {
          chEn = 113; vEn = v + vcount(114);
        } else if (ch === 116) {
          if (v < cntEn116) { chEn = 114; }
          else { chEn = 115; vEn = v - cntEn116; }
        } else if (ch >= 117 && ch <=146) {
          chEn = ch - 1;
        } else if (ch === 147) {
          if (v < vcount(146)) { chEn = 146; }
          else { chEn = 147; vEn = v - vcount(146); }
        }
      }
      return [b, chEn, vEn];
    }
    //   1–8       1–8
    //   9–10      9
    //   11–113    10–112
    //   114–115   113
    //   116       114–115
    //   117–146   116–145
    //   147       146–147
    //   148–150   148–150

    // case 'Proverbs': {
    //   break;
    // }
    case 'Ecclesia': {
      const res = vShift(4, 17, 16);
      if (res) return res;
      break;
    }
    case 'Songs': {
      const res = vShift(6, 12, 13);
      if (res) return res;
      break;
    }
    case 'Isaiah': {
      const res = vShift(8, 22, 23);
      if (res) return res;
      break;
    }
    case 'Jeremiah': {
      const res = vShift(8, 22, 23);
      if (res) return res;
      break;
    }
    case 'Ezekiel': {
      const res = vShift(20, 49, 44);
      if (res) return res;
      break;
    }
    // case 'Daniel': {
    //   break;
    // }
    case 'Hosea': {
      const res = vShift(1, 11, 9);
      if (res) return res;
      const res2 = vShift(11, 12, 11);
      if (res2) return res2;
      const res3 = vShift(13, 15, 16);
      if (res3) return res3;
      break;
    }
    case 'Jonah': {
      const res = vShift(1, 16, 17);
      if (res) return res;
      break;
    }
    // case 'Joel': {
    //   break;
    // }
    case 'Micah': {
      const res = vShift(4, 13, 14);
      if (res) return res;
      break;
    }
    case 'Nahum': {
      const res = vShift(1, 15, 14);
      if (res) return res;
      break;
    }
    case 'Zechariah': {
      const res = vShift(1, 21, 17);
      if (res) return res;
      break;
    }
    // case 'Malachi': {
    //   break;
    // }
    // case 'Acts': {
    //   break;
    // }
    // case 'Romans': {
    //   break;
    // }
    // case '2Corinthians': {
    //   break;
    // }
    // case '3John': {
    //   break;
    // }
    // case 'Revelation': {
    //   break;
    // }
    default: {
    }
  }
  return [b, ch, v];
}
