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
  strongs: [],
  dictionaries: [],
  searchModule: null,
  searchText: '',
  searchStop: false,
  searchInProgress: false,
  buffer: [],
  strongNumber: null,
};
