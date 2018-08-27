import * as _ from 'lodash';
import { getListFromDescriptor, getDescriptorFromList } from '../libs/modules/descriptor';


const defaultState = {
  config: {
    modules: {},
    selectedModule: null,
    selectedBook: null,
    selectedChapter: null,
    toolbarHidden: false,
    searchbarHidden: false,
    searchHistory: [],
    window: {
      x: null,
      y: null,
      width: null,
      height: null,
      maximized: false,
      minimized: false,
      fullscreen: false,
    },
    lists: [
      // {
      //   id: '',
      //   type: '',
      //   params: {},
      //   descriptor: '',
      // }
    ],
    selectedTab: null,
  },
  modules: [],
  books: [],
  selectedModule: null,
  selectedBook: null,
  selectedChapter: null,
  lists: [
    // {
    //   id: '',
    //   verses: [],
    // }
  ],
  searchModule: null,
  searchText: '',
  searchResult: [],
  searchStop: false,
  searchInProgress: false,
  buffer: [],
};


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
      const configs = _.chain(modules).map(m => ([m.getShortName(), m.getFileName()])).fromPairs().value();
      return {
        ...state,
        config: {
          ...state.config,
          modules: {
            ...state.config.modules,
            ...configs,
          },
        },
        modules: [ ...state.modules, ...action.modules ]
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
        ...state,
        config: {...action.config, lists, tabs, selectedTab},
        modules: action.modules,
        modulesDict,
        books,
        selectedModule,
        selectedBook,
        selectedChapter,
        toolbarHidden: config.toolbarHidden,
        searchbarHidden: config.searchbarHidden,
        lists: lists.map(li => ({...li, verses: getListFromDescriptor(li, modulesDict)}))
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
      const books = action.module.getBooks();
      if (state.selectedModule === action.module) {
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
          selectedModule: action.module.getShortName(),
        },
        selectedModule: action.module,
        selectedBook: books.length === 1 ? books[0] : null,
        selectedChapter: chapters.length === 1 ? chapters[0] : null,
        books
      };
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
      return {
        ...state,
        config: {
          ...state.config,
          selectedBook: action.book.getShortName(),
        },
        selectedBook: action.book
      };
    }

    case 'SELECT_CHAPTER': {
      const verses = action.chapter.getVerses();
      const descriptor = action.chapter.getDescriptor();
      let targetList = _.find(state.config.lists, l => (l.id === state.config.selectedTab && !_.get(l, 'params.customized')))
        || _.find(state.config.lists, l => (l.type === 'tab' && !_.get(l, 'params.customized') && _.get(l, 'descriptor', '') === ''));
      const isNewList = !targetList;
      targetList = targetList  || {
          id: _.uniqueId(),
          type: 'tab',
          descriptor: '',
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
          selectedChapter: action.chapter.getNum(),
          selectedTab: targetList.id,
        },
        selectedChapter: action.chapter,
        lists
      };
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
      // const lists = state.config.lists.map(l => {
      //   if (l.type !== 'search') return l;
      //   return ({
      //     ...l,
      //     descriptor: 
      //   });
      // });
      return {
        ...state,
        config: {
          ...state.config,
          searchHistory: [
            action.searchText,
            ..._.chain(state.config.searchHistory).without(action.searchText).value()
            ],
          // lists, // TODO (see above): update descriptor
        },
        searchModule: action.selectedModule,
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
      };
    }

    case 'SEARCH_DONE': {
      return {
        ...state,
        searchInProgress: false,
      };
    }

    case 'SEARCH_BREAK': {
      return {
        ...state,
        searchStop: false,
      };
    }

    case 'COPY_VERSES': {
      return {
        ...state,
        buffer: action.verses,
      };
    }

    case 'REMOVE_VERSES': {
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
      const newId = _.uniqueId();
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
      return {
        ...state,
        config: {
          ...state.config,
          lists: [
            ..._.filter(state.config.lists, l => l.id !==action.listId),
          ],
          selectedTab: action.listId === state.config.selectedTab
            ? _.chain(state.config.lists).find(l => (l.type === 'tab' && l.id !== action.listId)).get('id').value()
            : state.config.selectedTab
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

    default:
      return state;
  }
};

export default fileReducer;
