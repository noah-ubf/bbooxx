import * as _ from 'lodash';

import { getDescriptorFromList } from '../../libs/modules/descriptor';
import ModulesHelper from './modules';


class TabHelper {
  add(state, id, verses = [], verse = null) {
    const tabOrder = _.chain(state.tabOrder).without(id).unshift(id).value();
    console.log('==>', tabOrder)
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
          verses: verses.map(v => ({v})),
        },
      ],
      selectedVerse: verse,
      tabOrder,
    };
  }

  toTemp(state, verses = []) {
    return {
      ...state,
      config: {
        ...state.config,
        lists: state.config.lists.map(l => {
          if (l.id !== 'temp') return l;
          return {
            id: 'temp',
            type: 'temp',
            params: {},
            descriptor: getDescriptorFromList(verses),
            customized: true,
          };
        }),
        rightBarHidden: false,
        selectedTabRight: 'temp',
      },
      rightBarHidden: false,
      lists: state.lists.map(l => {
        if (l.id !== 'temp') return l;
        return {
          id: 'temp',
          verses: verses.map(v => ({v})),
        };
      }),
    };
  }

  remove(state, listId) {
    const tabOrder = _.chain(state.tabOrder).without(listId).value();
    console.log('==>', tabOrder)
    if (_.filter(state.config.lists, l => l.type === 'tab').length <= 1) return state;
    const selectedTab = tabOrder[0] || ((listId === state.config.selectedTab)
              ? _.chain(state.config.lists).find(l => (l.type === 'tab' && l.id !== listId)).get('id').value()
              : state.config.selectedTab);
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
      tabOrder,
    };
  }

  select(state, listId) {
    const tabOrder = _.chain(state.tabOrder).without(listId).unshift(listId).value();
    const selectedTab = listId || _.chain(state.config.lists).find(l => (l.type === 'tab')).get('id').value();
    const li = _.find(state.lists, l => (l.id === selectedTab));
    const newState =  {
      ...state,
      config: {
        ...state.config,
        selectedTab,
      },
      selectedVerse: null,
      tabOrder,
    };
    if (!_.get(li, 'chapter')) return newState;
    return ModulesHelper.selectChapter(newState, li.chapter);
  }
}

export default new TabHelper();