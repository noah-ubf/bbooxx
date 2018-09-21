import * as _ from 'lodash';

import { getDescriptorFromList } from '../../libs/modules/descriptor';
import ModulesHelper from './modules';


class TabHelper {
  add(state, id, verses = [], verse = null) {
    return {
      ...state,
      config: {
        ...state.config,
        lists: [
          ...state.config.lists,
          {
            id,
            type: 'tab',
            params: {},
            descriptor: getDescriptorFromList(verses),
          }
        ],
        selectedTab: id,
      },
      lists: [
        ...state.lists,
        {
          id,
          verses,
        },
      ],
      selectedVerse: verse,
    };
  }

  remove(state, listId) {
    if (_.filter(state.config.lists, l => l.type === 'tab').length <= 1) return state;
    const selectedTab = (listId === state.config.selectedTab)
          ? _.chain(state.config.lists).find(l => (l.type === 'tab' && l.id !== listId)).get('id').value()
          : state.config.selectedTab;
    return {
      ...state,
      config: {
        ...state.config,
        lists: [
          ..._.filter(state.config.lists, l => l.id !== listId),
        ],
        selectedTab,
      },
      lists: [
        ..._.filter(state.lists, l => l.id !== listId),
      ],
      selectedVerse: null,
    };
  }

  select(state, listId) {
    const selectedTab = listId || _.chain(state.config.lists).find(l => (l.type === 'tab')).get('id').value();
    const li = _.find(state.lists, l => (l.id === selectedTab));
    const newState =  {
      ...state,
      config: {
        ...state.config,
        selectedTab,
      },
      selectedVerse: null,
    };
    if (!_.get(li, 'chapter')) return newState;
    return ModulesHelper.selectChapter(newState, li.chapter);
  }
}

export default new TabHelper();