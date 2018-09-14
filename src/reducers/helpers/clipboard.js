import * as _ from 'lodash';
const electron = window.require('electron');
const { clipboard } = electron;

import { getListFromDescriptor, getDescriptorFromList } from '../../libs/modules/descriptor';


class ClipboardHelper {
  copy(state, verses, text, html) {
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

  cut(state, listId, verses, text, html) {
    return this.remove(this.copy(state, verses, text, html), listId, verses);
  }

  remove(state, listId, versesToRemove) {
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

  paste(state, listId) {
    // first we try to use the clipboard:
    const html = clipboard.readHTML('selection');
    const text = clipboard.readText('selection');
    let verses = null;

    if (text || html) {
      const rere = text && /^<BBOOXX:([^>]+)>$/.exec(text);
      if (rere) {
        verses = getListFromDescriptor(rere[1]);
      }
      // TODO get descriptor from html when text fails???
    }

    if (!verses) { // fallback when clipboard fails
      verses = [
        ..._.chain(state.lists)
          .find(l => l.id === listId)
          .get('verses')
          .value(),
        ...state.buffer.map(v => v.getNewInstance()),
      ];
    }

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
        },
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