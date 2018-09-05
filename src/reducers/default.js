export default {
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
      fontSize: 20,
      moduleListWidth: 300,
      searchWidth: 300,
    },
    lists: [
      // {
      //   id: '',
      //   type: '',
      //   params: {},
      //   descriptor: '',
      // }
    ],
    strongs: [],
    dictionaries: [],
    selectedTab: null,
    fontSize: 20,
    fontSizeFullscreen: 44,
  },
  configLoaded: false,
  modules: [],
  books: [],
  selectedModule: null,
  selectedBook: null,
  selectedChapter: null,
  selectedVerse: null,
  lists: [
    // {
    //   id: '',
    //   chapter: null,
    //   verses: [],
    // }
  ],
  strongs: [],
  dictionaries: [],
  searchModule: null,
  searchText: '',
  searchPath: '',
  searchStop: false,
  searchInProgress: false,
  searchResult: [],
  buffer: [],
  strongNumber: null,
};
