import * as _ from 'lodash';

class ModulesHelper {
  selectModule(state, module, toggle=true) {
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
      selectedVerse: null,
      books
    };
  }

  selectParallelBible(state, moduleShortName) {
    const parallelModule = moduleShortName && state.modulesDict[moduleShortName];
    const newState = {
      ...state,
      config: {
        ...state.config,
        parallelModule: moduleShortName,
      },
      parallelModule,
    };
    return this.syncParallelBible(newState);
  }

  syncParallelBible(state) {
    if (!state.parallelModule) {
      const lists = state.lists.map(l => {
      if (l.id !== 'parallel') return l;

      return {
        ...l,
        verses: [],
      };
    });
      return {
        ...state,
        lists,
      }
    }
    if (state.rightBarHidden || state.config.selectedTabRight !== 'parallel') return state;
    const selectedTab = state.config.selectedTab;
    const selectedList = state.lists.find(l => (l.id === selectedTab));
    if (!selectedList.chapter) return state;

    // const listConfigs = state.config.lists.map(l => {
    //   if (l.id !== 'parallel') return l;
    // });

    const book = state.parallelModule.getBookByNum(selectedList.chapter.getBook().getNum());
    const chapter = book.getChapterByNum(selectedList.chapter.getNum());
    const verses = chapter.getVerses().map(v => ({v}));

    const lists = state.lists.map(l => {
      if (l.id !== 'parallel') return l;

      return {
        ...l,
        verses,
      };
    });

    return {
      ...state,
      // config: {
      //   ...state.config,
      //   lists: listConfigs,
      // },
      lists,
    }
  }

  selectBook(state, book) {
    if (book.getChapters().length === 1) {
      return this.selectChapter(state, book.getChapters()[0]);
    }

    return {
      ...state,
      config: {
        ...state.config,
        selectedModule: book.getModule().getShortName(),
        selectedBook: book.getShortName(),
      },
      selectedModule: book.getModule(),
      selectedBook: book,
      selectedVerse: null,
    };
  }

  selectChapter(state, chapter, verse) {
    const verses = chapter.getVerses().map(v => ({v}));
    const descriptor = chapter.getDescriptor();
    let targetList = _.find(state.config.lists, l => (l.id === state.config.selectedTab && !_.get(l, 'params.customized')))
      || _.find(state.config.lists, l => (l.type === 'tab' && !_.get(l, 'params.customized') && _.get(l, 'descriptor', '') === ''));
    const isNewList = !targetList;
    targetList = targetList  || {
        id: this.uniqueId(state),
        type: 'tab',
        descriptor: chapter.getDescriptor(),
      };
    const listConfigs = isNewList
      ? [ ...state.config.lists, targetList ]
      : state.config.lists.map(l => ((l.id !==targetList.id) ? l : { ...l, descriptor }));
    const lists = isNewList
      ? [ ...state.lists, { id: targetList.id, chapter, verses } ]
      : state.lists.map(l => ((l.id !==targetList.id) ? l : { ...l, chapter, verses }));

    const newState = {
      ...state,
      config: {
        ...state.config,
        lists: listConfigs,
        selectedModule: chapter.getModule().getShortName(),
        selectedBook: chapter.getBook().getShortName(),
        selectedChapter: chapter.getNum(),
        selectedTab: targetList.id,
      },
      selectedModule: chapter.getModule(),
      selectedBook: chapter.getBook(),
      selectedChapter: chapter,
      selectedVerse: verse,
      books: chapter.getModule().getBooks(),
      lists
    };

    return this.syncParallelBible(newState);
  }

  uniqueId(state) {
    const ids = _.chain(state.lists)
      .filter(l => !_.isNaN(+l.id))
      .map(l => +l.id)
      .value();
    const maxId = Math.max(...ids);
    return (maxId + 1).toString();
  }

  remove(state, module) {
    if (state.selectedModule === module) {
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
      modules: _.omit(state.config.modules, module.getShortName())
    };
    return {
      ...state,
      modules: _.filter(state.modules, m => (m !== module)),
      config,
    };
  }
}

export default new ModulesHelper();