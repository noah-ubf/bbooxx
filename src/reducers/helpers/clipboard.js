import * as _ from 'lodash';
const electron = window.require('electron');
const { clipboard } = electron;

import { getDescriptorFromList } from '../../libs/modules/descriptor';


class ClipboardHelper {
  copyVerses(state, verses, text, html) {
    const descriptor = getDescriptorFromList(verses);
    clipboard.write({
      text: `<BBOOXX:${descriptor}>\n${text || ''}`,
      html: `<head>
          <title class="BBOOXX-CLIPBOARD">${descriptor}</title>
        </head>
        <body>
          <header>${descriptor}</header>
          <article>${html || ''}</article>
        </body>`,
    })
    return {
      ...state,
      buffer: verses,
    };
  }

  removeVerses(state, listId, versesToRemove) {
    if (!versesToRemove || versesToRemove.length ===0) return state;
    const verses = _.chain(state.lists)
      .find(l => l.id === listId)
      .get('verses')
      .filter(v => versesToRemove.indexOf(v) === -1)
      .value();
    const lists = state.lists.map(l => {
      if (l.id !== listId) return l;
      return {
        ...l,
        verses,
        chapter: null,
      };
    });
    const listsConfigs = state.config.lists.map(l => {
      if (l.id !== listId) return l;
      return {
        ...l,
        descriptor: getDescriptorFromList(verses),
        params: {
          ...l.params,
          customized: true
        }
      };
    });
    return {
      ...state,
      config: {
        ...state.config,
        lists: listsConfigs,
      },
      lists,
    };
  }  
}

export default new ClipboardHelper();