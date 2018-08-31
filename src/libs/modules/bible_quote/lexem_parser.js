import * as _ from 'lodash';

// import levenshtein from '../../levenshtein';
import { convertToUtf8 } from './font_convert';

const SKIP_ELEMENTS = [
  'SCRIPT'
];

const isSkipped = (el) => {
  return (SKIP_ELEMENTS.indexOf(el) !== -1);
}

const BLOCK_LEVEL_ELEMENTS = [
  'ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'CANVAS', 'DD', 'DIV', 'DL', 'DT', 'FIELDSET', 'FIGCAPTION',
  'FIGURE', 'FOOTER', 'FORM', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'HR', 'LI', 'MAIN', 'NAV',
  'NOSCRIPT', 'OL', 'OUTPUT', 'P', 'PRE', 'SECTION', 'TABLE', 'TFOOT', 'UL', 'VIDEO'
];

const isBlockLevel = (el) => {
  return (BLOCK_LEVEL_ELEMENTS.indexOf(el) !== -1);
}

export default function parseLexems(text, options) {
  // console.log('parseLexems: ', text, options)
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(text, "text/html");
  let nodes = [..._.get(htmlDoc, 'childNodes[0].childNodes[1].childNodes', [])];
  // console.log('NODES:', nodes)
  let plainTree = [];

  const processStringContent = (str, mode) => {
    // console.log('processStringContent: ', str, mode)
    const text = convertToUtf8(str, mode.font);
    const rtl = mode.font && mode.font.match(/^Heb/i);
    if (rtl) plainTree.push({t: 'dir', dir: 'rtl' });
    _.chain(text).split(/\s/)
      .map((s, i) => {
        let rere = /^([^ !.,;:'"?]*)([ !.,;:'"?]+)$/.exec(s);// Авд.1:1 - XXXX! doesn't work
        // console.log(s, rere)
        if (rere) {
          return [
            {text: rere[1], space: (i > 0),},
            {text: rere[2]},
          ];
        }
        return {text: s, space: (i > 0)}; //TODO
      })
      .flatten()
      .compact()
      .forEach(p => {
        if (options.hasStrongs) {
          if (p.text.match(/^\d+$/)) {
            plainTree.push({ ...p, t: 'strong', mode });
          } else {
            const rere = /^(.*)((H|G)(\d+))$/i.exec(p.text);
            if (rere) {
              plainTree.push({ ...p, t: 'text', mode, text: rere[1] });
              plainTree.push({ t: 'strong', mode, text: rere[2] });
            } else {
              plainTree.push({ ...p, t: 'text', mode });
            }
          }
        } else {
          plainTree.push({ ...p, t: 'text', mode }); //TODO
        }
      })
      .value();
    if (rtl) plainTree.push({t: '/dir', dir: 'rtl' });
  }

  const processNodeContent = (node, mode) => {
    // console.log('processNodeContent: ', node, mode)
    if (node.childNodes.length > 0) return convNodes(node.childNodes, mode);
    else processStringContent(node.textContent, mode);
  }

  // const pushSimpleNode(node) {
  //   if(options.hasVerseNumber && !contentStarted) {
  //     const res = /^$/.exec(l.text || '');
  //     console.log('NUM RE EXEC: ', l.text, res)
  //     if (res) {
  //       verseNum += res[1];
  //       if (res[3]) {
  //         contentStarted = true;
  //         processStringContent(res[3], mode)
  //       }
  //     } else {
  //       contentStarted = true;
  //       processStringContent(n.textContent, mode)
  //     }
  //   } else {
  //     contentStarted = true;
  //     processStringContent(n.textContent, mode)
  //   }
  // }

  let verseNum = '';
  let contentStarted = false;
  const splitTextRE = /^((\s|\d)*)\b(.*)$/;
  function convNodes(nodes, mode={}) {
    _.forEach(nodes, n => {
      const ntype = n.nodeName;

      if (isSkipped(ntype)) {
        // skip node
      } else if (ntype === '#comment') {
        return null;
      } else if (ntype === '#text') {
        if(options.hasVerseNumber && !contentStarted) {
          const res = splitTextRE.exec(n.textContent || '');
          if (res) {
            verseNum = res[1];
            if (res[3]) {
              contentStarted = true;
              processStringContent(res[3], mode)
            }
          } else {
            contentStarted = true;
            processStringContent(n.textContent, mode)
          }
        } else {
          contentStarted = true;
          processStringContent(n.textContent, mode)
        }
      } else if (options.hasVerseNumber && !contentStarted && (!n.outerText || n.outerText.match(/^\s*[\d.> -]*\s*$/))) {
        // console.log('=====>', n, n.outerText, n.outerText && n.outerText.match(/^\s*\d*\s*$/))
        if (n.outerText) verseNum += n.outerText;
        return null;
      } else if (isBlockLevel(ntype)) {
        if (n.childNodes.length === 0) {
          plainTree.push({ t: 'block/', mode, ntype, text: convertToUtf8(n.textContent, mode.font) });
        } else {
          plainTree.push({ t: 'block', mode, ntype });
          processNodeContent(n, mode);
          plainTree.push({ t: '/block', mode });
        }
      } else if (ntype === 'BR') {
        plainTree.push({ t: 'linebreak', mode });
      } else if (ntype === 'IMG') {
        contentStarted = true;
        plainTree.push({ t: 'img', mode, src: n.src });
      } else if(ntype === 'B' || ntype === 'STRONG') {
        contentStarted = true;
        processNodeContent(n, {...mode, bold: true});
      } else if(ntype === 'I' || ntype === 'EM') {
        contentStarted = true;
        processNodeContent(n, {...mode, italic: true});
      } else if(ntype === 'A') {
        contentStarted = true;
        let href = _.chain(n.attributes).find({name: 'href'}).get('value').value();
        let name = _.chain(n.attributes).find({name: 'name'}).get('value').value();
        // console.log('LINK: ', n, href, name, n.textContent)
        if (href) {
          plainTree.push({ t: 'link', text: convertToUtf8(n.textContent, mode.font), mode, href });
        } else if (name) {
          plainTree.push({ t: 'anchor', mode, name });
          plainTree.push({ t: 'text', text: convertToUtf8(n.textContent, mode.font), mode });
        }
      } else if(ntype === 'FONT') {
        contentStarted = true;
        processNodeContent(n, {...mode, font: n.face, size: (n.size || mode.size), color: (n.color || mode.color)});
      } else {
        contentStarted = true;
        processNodeContent(n, mode);
      }
    });
  };

  convNodes(nodes);


  if (verseNum) {
    plainTree.unshift({t: 'versenum', verseNum});
  }

  // console.log('PLAINTREE:', verseNum, JSON.stringify(plainTree).split('},').join('},\n'));
  return plainTree;
}