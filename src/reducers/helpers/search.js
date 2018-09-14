class SearchHelper {
  start(state, searchText) {
    const module = state.selectedModule ? state.selectedModule.getShortName() : '';
    return {
      ...state,
      config: {
        ...state.config,
        lists: state.config.lists.map(l => ((l.id === 'search') ? {
          ...l, descriptor: `search(${module}):${searchText}`
        } : l)),
        searchHistory: [
          searchText,
          ...state.config.searchHistory.filter(s => (s !== searchText)).slice(0,19),
        ],
      },
      lists: state.lists.map(l => ((l.id === 'search') ? {
        ...l, verses: []
      } : l)),
      searchModule: state.selectedModule,
      searchText: searchText,
      searchResult: [],
      searchStop: false,
      searchInProgress: true,
    };
  }

  portion(state, path, verses) {
    return {
      ...state,
      searchResult: [...state.searchResult, ...verses],
      searchPath: path || '',
    };
  }

  done(state) {
    return {
      ...state,
      searchInProgress: false,
      lists: state.lists.map(l => ((l.id === 'search') ? { ...l, verses: [...state.searchResult] } : l)),
    };
  }

  break(state) {
    return {
      ...state,
      searchStop: true, // actually fails to work
    };
  }
};

export default new SearchHelper();