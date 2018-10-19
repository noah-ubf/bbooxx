import * as _ from 'lodash';


import { getListFromDescriptor, getDescriptorFromList, getChapterFromDescriptor }
  from '../libs/modules/descriptor';
import defaultState from './default';
import BQStrongs from '../libs/modules/bible_quote/strongs';
import ClipboardHelper from './helpers/clipboard';
import SearchHelper from './helpers/search';
import TabHelper from './helpers/tab';
import ModulesHelper from './helpers/modules';
import UIHelper from './helpers/ui';


const fileReducer = (state = defaultState, action) => {
  console.log('ACTION: ', action);
  switch (action.type) {
    case 'ADD_MODULE': {
      const shortName = action.module.getShortName();
      const fileName = action.module.getFileName();
      if (state.config.modules[shortName]) return state;
      return {
        ...state,
        config: {
          ...state.config,
          modules: {
            ...state.config.modules,
            [shortName]: fileName,
          },
        },
        modules: [ ...state.modules, action.module ]
      };
    }

    case 'ADD_MODULES': {
      const modules = _.filter(action.modules, m => (m && !state.config.modules[m.getShortName()]));
      const strongs = _.filter(action.strongs, m => (m && !state.config.strongs[m.getName()]));
      const dictionaries = _.filter(action.dictionaries, m => (m && !state.config.dictionaries[m.getPath()]));
      const mconfigs = modules ? _.chain(modules).map(m => ([m.getShortName(), m.getFileName()])).fromPairs().value() : [];
      const sconfigs = _.chain(strongs).map(m => ([m.getName(), m.getPath()])).fromPairs().value();
      const dconfigs = _.chain(dictionaries).map(m => ([m.getName(), m.getPath()])).fromPairs().value();

      _.forEach(action.modules, m => {
        if (!m || !m.isBible()) return null;
        let mmm = {
          name: m.getName(),
          books: m && _.map(m.getBooks(), b => (b && {
            name: b.getStandardName(),
            chNum: b.getChapters().length,
            chapters: b && _.map(b.getChapters(), c => (c && c.getVerses().length))
          }))
        }
        console.log('MMM:', JSON.stringify(mmm));
      });

      return {
        ...state,
        config: {
          ...state.config,
          modules: { ...state.config.modules, ...mconfigs },
          strongs: { ...state.config.strongs, ...sconfigs },
          dictionaries: { ...state.config.dictionaries, ...dconfigs },
        },
        modules: [ ...state.modules, ...action.modules ],
        strongs: [ ...state.strongs, ...action.strongs ],
        dictionaries: [ ...state.dictionaries, ...action.dictionaries ],
      };
    }

    case 'READ_CONFIG': {
      const config = action.config;
      const modules = _.filter(action.modules, m => (!state.config.modules[m.getShortName()]));
      const modulesDict = _.chain(modules).map(m => ([m.getShortName(), m])).fromPairs().value();
      const selectedModule = config.selectedModule
        ? (_.find(modules, m => (m.getShortName() === config.selectedModule)))
        : null;
      const books = selectedModule ? selectedModule.getBooks() : [];
      const selectedBook = selectedModule ? selectedModule.getBookByShortName(config.selectedBook) : null;
      const selectedChapter = selectedBook ? selectedBook.getChapterByNum(config.selectedChapter) : null;
      const strongs = _.chain(config.strongs).values().map(path => new BQStrongs(path)).value();

      let lists = config.lists ? [...config.lists] : [];
      let tabs = config.tabs ? [...config.tabs] : [];

      if (!_.find(lists, l => l.type === 'tab')) {
        lists = [
          ...lists,
          {
            id: 'initial',
            type: 'tab',
            params: {},
            descriptor: selectedChapter && selectedChapter.getDescriptor(),
          }
        ];
      }

      if (!_.find(lists, l => l.type === 'search')) {
        lists = [
          ...lists,
          {
            id: 'search',
            type: 'search',
            params: {},
            descriptor: '',
          }
        ];
      }

      if (!_.find(lists, l => l.type === 'temp')) {
        lists = [
          ...lists,
          {
            id: 'temp',
            type: 'temp',
            params: {},
            descriptor: '',
          }
        ];
      }

      const selectedTab = _.find(lists, t => (t.id === config.selectedTab))
        ? config.selectedTab
        : _.find(lists, t => (t.type === 'tab')).id;
      const tabOrder = _.chain(lists).filter(t => (t.type === 'tab')).map(t => t.id).without(selectedTab).unshift(selectedTab).value();

      return {
        ...defaultState,

        ...state,
        config: {...defaultState.config, ...action.config, lists, tabs, selectedTab},
        configLoaded: true,
        modules: action.modules,
        strongs,
        modulesDict,
        books,
        selectedModule,
        selectedBook,
        selectedChapter,
        leftBarHidden: config.leftBarHidden,
        rightBarHidden: config.rightBarHidden,
        lists: lists.map(li => ({
          id: li.id,
          verses: getListFromDescriptor(li, modulesDict),
          chapter: _.get(li, 'params.customized')
            ? null : getChapterFromDescriptor(li, modulesDict),
        })),
        tabOrder,
      };
    }
    /*
        this.props.createListsAction([
          {
            id: 'search',
            type: 'verse_list',
            params: {
              custom: true,
            }
          },
          {
            id: 'tab0',
            type: 'verse_list',

          },
        ]);
      }
    */
    case 'SELECT_MODULE': {
      return ModulesHelper.selectModule(state, action.module);
    }

    case 'REMOVE_MODULE': {
      return ModulesHelper.remove(state, action.module);
    }

    case 'UPDATE_WINDOW_CONFIG': {
      return UIHelper.updateWindow(state, action.config);
    }

    case 'SELECT_BOOK': {
      return ModulesHelper.selectBook(state, action.book);
    }

    case 'SELECT_CHAPTER': {
      return ModulesHelper.selectChapter(state, action.chapter, action.verse);
    }

    case 'TOGGLE_TOOLBAR': {
      return UIHelper.toggleModuleList(state);
    }

    case 'TOGGLE_SEARCHBAR': {
      return UIHelper.toggleSearchBar(state);
    }

    case 'SHOW_MODULES_TAB': {
      return UIHelper.showLeftToolbarTab(state, 'modules');
    }
    case 'SHOW_SEARCH_TAB': {
      return UIHelper.showLeftToolbarTab(state, 'search');
    }

    case 'SECTION_SIZE_CHANGE': {
      return UIHelper.sectionResize(state, action.section, action.size)
    }

    case 'SEARCH_START': {
      return SearchHelper.start(state, action.searchText);
    }

    case 'SEARCH_PORTION': {
      return SearchHelper.portion(state, action.path, action.verses);
    }

    case 'SEARCH_DONE': {
      return SearchHelper.done(state);
    }

    case 'SEARCH_BREAK': {
      return SearchHelper.break(state);
    }

    case 'COPY_VERSES': {
      return ClipboardHelper.copy(state, action.verses, action.text, action.html);
    }

    case 'CUT_VERSES': {
      return ClipboardHelper.cut(state, action.listId, action.verses, action.text, action.html);
    }

    case 'REMOVE_VERSES': {
      return ClipboardHelper.remove(state, action.listId, action.verses);
    }

    case 'ADD_TAB_LIST': {
      return TabHelper.add(state, ModulesHelper.uniqueId(state), action.verses, action.verse);
    }

    case 'TO_TEMP_LIST': {
      return TabHelper.toTemp(state, action.verses);
    }

    case 'REMOVE_TAB_LIST': {
      return TabHelper.remove(state, action.listId);
    }

    case 'PASTE_VERSES': {
      return ClipboardHelper.paste(state, action.listId);
    }

    case 'SELECT_TAB_LIST': {
      return TabHelper.select(state, action.listId);
    }

    case 'TOGGLE_FULLSCREEN': {
      return UIHelper.toggleFullscreen(state);
    }

    case 'ZOOM_IN': {
      return UIHelper.zoomIn(state);
    }

    case 'ZOOM_OUT': {
      return UIHelper.zoomOut(state);
    }

    case 'TOGGLE_UI_SIZE': {
      return UIHelper.toggleUiSize(state);
    }

    case 'DISPLAY_STRONG_NUMBER': {
      if (state.strongNumber === action.num) return state;
      return {
        ...state,
        strongNumber: action.num,
        strongText: getStrongText(state.strongs, action.num),
      };
    }

    case 'REORDER_LIST': {
      if (action.from === action.to) return state;
      let descriptor = '';
      const lists = state.lists.map(l => {
        if (l.id !== action.listId) return l;
        const verses = [...l.verses];
        verses.splice(action.to, 0, verses.splice(action.from, 1)[0]);
        descriptor = getDescriptorFromList(verses);
        return {
          ...l,
          verses,
          chapter: null,
        };
      });

      const listsConfigs = state.config.lists.map(l => {
        if (l.id !== action.listId) return l;
        return {
          ...l,
          descriptor,
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

    default:
      return state;
  }
};

export default fileReducer;


function getStrongText(strongs, num) {
  if (_.isNull(num)) return null;
  for(let i = 0; i < strongs.length; i++) {
    let text = strongs[i].get(num);
    if (text) {
      return text;
    }
  }
  return null;
}
