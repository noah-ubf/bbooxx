import * as _ from 'lodash';
import { getListFromDescriptor, getDescriptorFromList } from '../libs/modules/descriptor';


import defaultState from './default';
import BQStrongs from '../libs/modules/bible_quote/strongs';


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
      const modules = _.filter(action.modules, m => (!state.config.modules[m.getShortName()]));
      const strongs = _.filter(action.strongs, m => (!state.config.strongs[m.getName()]));
      const dictionaries = _.filter(action.dictionaries, m => (!state.config.dictionaries[m.getPath()]));
      const mconfigs = _.chain(modules).map(m => ([m.getShortName(), m.getFileName()])).fromPairs().value();
      const sconfigs = _.chain(strongs).map(m => ([m.getName(), m.getPath()])).fromPairs().value();
      const dconfigs = _.chain(dictionaries).map(m => ([m.getName(), m.getPath()])).fromPairs().value();

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

      const selectedTab = _.find(lists, t => (t.id === config.selectedTab))
        ? config.selectedTab
        : _.find(lists, t => (t.type === 'tab')).id;

      return {
        ...defaultState,

        ...state,
        config: {...defaultState.config, ...action.config, lists, tabs, selectedTab},
        modules: action.modules,
        strongs,
        modulesDict,
        books,
        selectedModule,
        selectedBook,
        selectedChapter,
        toolbarHidden: config.toolbarHidden,
        searchbarHidden: config.searchbarHidden,
        lists: lists.map(li => ({id: li.id, verses: getListFromDescriptor(li, modulesDict)})),
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
      return selectModule(state, action.module);
    }

    case 'REMOVE_MODULE': {
      if (state.selectedModule === action.module) {
        const config = {
          ...state.config,
          selectedModule: null,
          selectedBook: null,
          selectedChapter: null,
        };
        return {
          ...state,
          config,
          selectedModule: null,
          selectedBook: null,
          selectedChapter: null,
          books: [],
        };
      }
      const config = {
        ...state.config,
        modules: _.omit(state.config.modules, action.module.getShortName())
      };
      return {
        ...state,
        modules: _.filter(state.modules, m => (m !== action.module)),
        config,
      };
    }

    case 'UPDATE_WINDOW_CONFIG': {
      const windowConfigs = {
        maximized: action.config.maximized,
        minimized: action.config.minimized,
        fullscreen: action.config.fullscreen,
      };
      if (!action.config.maximized && !action.config.minimized && !action.config.fullscreen) {
        windowConfigs.x = action.config.x;
        windowConfigs.y = action.config.y;
        windowConfigs.width = action.config.width;
        windowConfigs.height = action.config.height;
      }

      return {
        ...state,
        config: {
          ...state.config,
          window: {
            ...state.config.window,
            ...windowConfigs,
          }
        },
      };
    }

    case 'SELECT_BOOK': {
      let stateUpd = selectModule(state, action.book.getModule(), false);
      return selectBook(stateUpd, action.book);
    }

    case 'SELECT_CHAPTER': {
      let stateUpd = selectModule(state, action.chapter.getModule(), false);
      stateUpd = selectBook(stateUpd, action.chapter.getBook());
      return selectChapter(stateUpd, action.chapter);
    }

    case 'TOGGLE_TOOLBAR': {
      return {
        ...state,
        config: {
          ...state.config,
          toolbarHidden: !state.toolbarHidden
        },
        toolbarHidden: !state.toolbarHidden
      };
    }

    case 'TOGGLE_SEARCHBAR': {
      return {
        ...state,
        config: {
          ...state.config,
          searchbarHidden: !state.searchbarHidden
        },
        searchbarHidden: !state.searchbarHidden
      };
    }

    case 'SEARCH_START': {
      const module = state.selectedModule ? state.selectedModule.getShortName() : '';
      return {
        ...state,
        config: {
          ...state.config,
          lists: state.config.lists.map(l => ((l.id === 'search') ? {
            ...l, descriptor: `search(${module}):${action.searchText}`
          } : l)),
          searchHistory: [
            action.searchText,
            ...state.config.searchHistory.filter(s => (s !== action.searchText)).slice(0,19),
          ],
        },
        lists: state.lists.map(l => ((l.id === 'search') ? {
          ...l, verses: []
        } : l)),
        searchModule: state.selectedModule,
        searchText: action.searchText,
        searchResult: [],
        searchStop: false,
        searchInProgress: true,
      };
    }

    case 'SEARCH_PORTION': {
      return {
        ...state,
        searchResult: [...state.searchResult, ...action.verses],
        searchPath: action.path || '',
      };
    }

    case 'SEARCH_DONE': {
      return {
        ...state,
        searchInProgress: false,
        lists: state.lists.map(l => ((l.id === 'search') ? { ...l, verses: [...state.searchResult] } : l)),
      };
    }

    case 'SEARCH_BREAK': {
      return {
        ...state,
        searchStop: true, // actually fails to work
      };
    }

    case 'COPY_VERSES': {
      return {
        ...state,
        buffer: action.verses,
      };
    }

    case 'REMOVE_VERSES': {
      if (!action.verses || action.verses.length ===0) return state;
      const verses = _.chain(state.lists)
        .find(l => l.id === action.listId)
        .get('verses')
        .filter(v => action.verses.indexOf(v) === -1)
        .value();
      const lists = state.lists.map(l => {
        if (l.id !== action.listId) return l;
        return {
          ...l,
          verses,
        };
      });
      const listsConfigs = state.config.lists.map(l => {
        if (l.id !== action.listId) return l;
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

    case 'ADD_TAB_LIST': {
      const newId = uniqueId(state);
      return {
        ...state,
        config: {
          ...state.config,
          lists: [
            ...state.config.lists,
            {
              id: newId,
              type: 'tab',
              params: {},
              descriptor: '',
            }
          ],
          selectedTab: newId,
        },
        lists: [
          ...state.lists,
          {
            id: newId,
            verses: action.verses || [],
          },
        ],
      };
    }

    case 'REMOVE_TAB_LIST': {
      if (_.filter(state.config.lists, l => l.type === 'tab').length <= 1) return state;
      const selectedTab = (action.listId === state.config.selectedTab)
            ? _.chain(state.config.lists).find(l => (l.type === 'tab' && l.id !== action.listId)).get('id').value()
            : state.config.selectedTab;
      return {
        ...state,
        config: {
          ...state.config,
          lists: [
            ..._.filter(state.config.lists, l => l.id !==action.listId),
          ],
          selectedTab,
        },
        lists: [
          ..._.filter(state.lists, l => l.id !==action.listId),
        ],
      };
    }

    case 'PASTE_VERSES': {
      const verses = [
        ..._.chain(state.lists)
          .find(l => l.id === action.listId)
          .get('verses')
          .value(),
        ...state.buffer.map(v => v.getNewInstance()),
      ];

      const lists = state.lists.map(l => {
        if (l.id !== action.listId) return l;
        return {
          ...l,
          verses,
        };
      });

      const listsConfigs = state.config.lists.map(l => {
        if (l.id !== action.listId) return l;
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

    case 'SELECT_TAB_LIST': {
      return {
        ...state,
        config: {
          ...state.config,
          selectedTab: action.listId || _.chain(state.config.lists).find(l => (l.type === 'tab')).get('id').value()
        },
      };
    }

    case 'TOGGLE_FULLSCREEN': {
      return {
        ...state,
        fullScreen: !state.fullScreen,
      };
    }

    case 'ZOOM_IN': {
      let size = (state.fullScreen ? state.config.fontSizeFullscreen : state.config.fontSize) || 20;
      if (size < 80) size += 2;
      let sizeConfig = (state.fullScreen ? {fontSizeFullscreen: size} : {fontSize: size});
      return {
        ...state,
        config: {
          ...state.config,
          ...sizeConfig,
        }
      };
    }

    case 'ZOOM_OUT': {
      let size = (state.fullScreen ? state.config.fontSizeFullscreen : state.config.fontSize) || 20;
      if (size > 6) size -= 2;
      let sizeConfig = (state.fullScreen ? {fontSizeFullscreen: size} : {fontSize: size});
      return {
        ...state,
        config: {
          ...state.config,
          ...sizeConfig,
        }
      };
    }

    case 'TOGGLE_UI_SIZE': {
      let fontSize = _.get(state, 'config.window.fontSize', 16) > 16 ? 16 : 24;
      return {
        ...state,
        config: {
          ...state.config,
          window: {
            ...state.config.window,
            fontSize,
          },
        }
      };
    }

    case 'DISPLAY_STRONG_NUMBER': {
      if (state.strongNumber === action.num) return state;
      return {
        ...state,
        strongNumber: action.num,
        strongText: getStrongText(state.strongs, action.num),
      };
    }

    default:
      return state;
  }
};

export default fileReducer;


function selectModule(state, module, toggle=true) {
  const books = module.getBooks();
  if (state.selectedModule === module && toggle) {
    if (state.books.length) {
      return { ...state, books: [] };
    }
    return { ...state, books };
  }

  const chapters = books.length === 1 ? books[0].getChapters() : [];

  return {
    ...state,
    config: {
      ...state.config,
      selectedModule: module.getShortName(),
    },
    selectedModule: module,
    selectedBook: books.length === 1 ? books[0] : null,
    selectedChapter: chapters.length === 1 ? chapters[0] : null,
    books
  };
}

function selectBook(state, book) {
  if (book.getChapters().length === 1) {
    return selectChapter({
      ...state,
      config: {
        ...state.config,
        selectedBook: book.getShortName(),
        selectedChapter: book.getShortName(),
      },
      selectedBook: book
    }, book.getChapters()[0]);
  }

  return {
    ...state,
    config: {
      ...state.config,
      selectedBook: book.getShortName(),
    },
    selectedBook: book
  };
}

function selectChapter(state, chapter) {
  const verses = chapter.getVerses();
  const descriptor = chapter.getDescriptor();
  let targetList = _.find(state.config.lists, l => (l.id === state.config.selectedTab && !_.get(l, 'params.customized')))
    || _.find(state.config.lists, l => (l.type === 'tab' && !_.get(l, 'params.customized') && _.get(l, 'descriptor', '') === ''));
  const isNewList = !targetList;
  targetList = targetList  || {
      id: uniqueId(state),
      type: 'tab',
      descriptor: chapter.getDescriptor(),
    };
  const listConfigs = isNewList
    ? [ ...state.config.lists, targetList ]
    : state.config.lists.map(l => ((l.id !==targetList.id) ? l : { ...l, descriptor }));
  const lists = isNewList
    ? [ ...state.lists, { id: targetList.id, verses } ]
    : state.lists.map(l => ((l.id !==targetList.id) ? l : { ...l, verses }));

  return {
    ...state,
    config: {
      ...state.config,
      lists: listConfigs,
      selectedChapter: chapter.getNum(),
      selectedTab: targetList.id,
    },
    selectedChapter: chapter,
    lists
  };
}

function uniqueId(state) {
  const ids = _.chain(state.lists)
    .filter(l => !_.isNaN(+l.id))
    .map(l => +l.id)
    .value();
  const maxId = Math.max(...ids);
  return (maxId + 1).toString();
}

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