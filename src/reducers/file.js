import * as _ from 'lodash';


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
    tabs: [
      // {
      //   title: '',
      //   listId: '',
      // }
    ],
  },
  modules: [],
  books: [],
  selectedModule: null,
  selectedBook: null,
  selectedChapter: null,
  lists: [
    // {
    //   id: '',
    //   type: '',
    //   verses: [],
    // }
  ],
  tabs: [
    // {
    //   title: '',
    //   listId: '',
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
      const selectedModule = config.selectedModule
        ? (_.find(modules, m => (m.getShortName() === config.selectedModule)))
        : null;
      const books = selectedModule ? selectedModule.getBooks() : [];
      const selectedBook = selectedModule ? selectedModule.getBookByShortName(config.selectedBook) : null;
      const selectedChapter = selectedBook ? selectedBook.getChapterByNum(config.selectedChapter) : null;

      return {
        ...state,
        config: action.config,
        modules: action.modules,
        books,
        selectedModule,
        selectedBook,
        selectedChapter,
        toolbarHidden: config.toolbarHidden,
        searchbarHidden: config.searchbarHidden,
      };
    }
/*
  constructor(props) {
    super(props);

    if (this.props.lists.length === 0) {
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
      return {
        ...state,
        config: {
          ...state.config,
          selectedChapter: action.chapter.getNum(),
        },
        selectedChapter: action.chapter
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
      return {
        ...state,
        config: {
          ...state.config,
          searchHistory: [
            action.searchText,
            ..._.chain(state.config.searchHistory).without(action.searchText).value()
            ],
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

    case 'PASTE_VERSES': {
      return {
        ...state, // TODO
      };
    }

    default:
      return state;
  }
};

export default fileReducer;
